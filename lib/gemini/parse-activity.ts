import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ActivityCategory } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────

export interface ParsedActivity {
  title: string;
  category: ActivityCategory;
  durationMinutes: number;
  intensity: number;   // 1–10
  notes: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// CLIENTE (lazy — se instancia una vez)
// ─────────────────────────────────────────────────────────────────────────────

let _genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!_genAI) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY no está configurada en el .env");
    _genAI = new GoogleGenerativeAI(key);
  }
  return _genAI;
}

// Modelos en orden de preferencia — si el primero falla por carga, intenta el siguiente
const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash-latest",
];

// ─────────────────────────────────────────────────────────────────────────────
// RETRY CON BACKOFF EXPONENCIAL
// ─────────────────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

/**
 * Detecta si el error es de sobrecarga temporal (503/429) para decidir si reintentar.
 */
function isTransient(err: unknown): boolean {
  const msg = String(err).toLowerCase();
  return (
    msg.includes("503") ||
    msg.includes("429") ||
    msg.includes("unavailable") ||
    msg.includes("overloaded") ||
    msg.includes("high demand") ||
    msg.includes("resource_exhausted")
  );
}

/**
 * Intenta ejecutar `fn` hasta `maxAttempts` veces.
 * Espera delay * 2^intento ms entre reintentos (backoff exponencial, máx 8 s).
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 1500
): Promise<T> {
  let lastErr: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (!isTransient(err) || attempt === maxAttempts - 1) break;
      const delay = Math.min(baseDelayMs * 2 ** attempt, 8000);
      console.warn(`[Gemini] Intento ${attempt + 1} fallido (${String(err).slice(0, 80)}). Reintentando en ${delay}ms…`);
      await sleep(delay);
    }
  }

  throw lastErr;
}

// ─────────────────────────────────────────────────────────────────────────────
// PROMPT
// ─────────────────────────────────────────────────────────────────────────────

function buildPrompt(rawText: string): string {
  return `Eres el analizador de actividades de un sistema de progresión de cazadores.
Tu tarea es extraer datos estructurados del texto libre que escribe el usuario.

TEXTO DEL USUARIO:
"${rawText}"

Responde ÚNICAMENTE con un objeto JSON válido. Sin markdown, sin explicaciones, sin comillas extra alrededor del JSON.

Estructura exacta:
{
  "title": "título conciso en español (máx 60 caracteres)",
  "category": "STRENGTH | AGILITY | INTELLIGENCE | MIXED",
  "durationMinutes": número entero,
  "intensity": número entero del 1 al 10,
  "notes": "observación adicional breve, o null"
}

Reglas de categorización:
- STRENGTH: pesas, calistenia, gimnasio, boxeo, crossfit, musculación
- AGILITY: correr, cardio, ciclismo, natación, fútbol, básquet, tenis, saltar
- INTELLIGENCE: estudiar, leer, programar, trabajar, aprender, investigar, escribir
- MIXED: cuando la actividad combina dos o más de las anteriores

Reglas de duración:
- Si se menciona explícitamente (ej: "2 horas", "45 minutos") úsala
- Si no se menciona, estima según el contexto (gym → 60, correr → 30-45, estudiar → 90)

Reglas de intensidad:
- 1-3: suave, recreativo, caminata, lectura relajada
- 4-6: moderado, ritmo constante, concentración normal
- 7-8: intenso, pesas pesadas, estudio profundo, sprint intervals
- 9-10: máximo esfuerzo, PR, maratón, examen final`;
}

// ─────────────────────────────────────────────────────────────────────────────
// PARSEO DE RESPUESTA
// ─────────────────────────────────────────────────────────────────────────────

function parseResponse(text: string): ParsedActivity {
  const clean = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  let parsed: ParsedActivity;
  try {
    parsed = JSON.parse(clean) as ParsedActivity;
  } catch {
    throw new Error(`Gemini devolvió JSON inválido: ${clean.slice(0, 200)}`);
  }

  const validCategories: ActivityCategory[] = [
    "STRENGTH", "AGILITY", "INTELLIGENCE", "MIXED",
  ];
  return {
    title:           String(parsed.title   ?? "Actividad registrada").slice(0, 60),
    category:        validCategories.includes(parsed.category) ? parsed.category : "MIXED",
    durationMinutes: Math.max(1, Math.round(Number(parsed.durationMinutes) || 60)),
    intensity:       Math.max(1, Math.min(10, Math.round(Number(parsed.intensity) || 5))),
    notes:           parsed.notes ? String(parsed.notes).slice(0, 200) : null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// FUNCIÓN PRINCIPAL — prueba modelos en cascada si hay error de sobrecarga
// ─────────────────────────────────────────────────────────────────────────────

export async function parseActivityText(
  rawText: string
): Promise<ParsedActivity> {
  const genAI  = getGenAI();
  const prompt = buildPrompt(rawText);
  let lastErr: unknown;

  for (const modelName of MODELS) {
    try {
      const result = await withRetry(async () => {
        const model = genAI.getGenerativeModel({ model: modelName });
        return model.generateContent(prompt);
      });

      return parseResponse(result.response.text());
    } catch (err) {
      lastErr = err;
      // Solo cambia de modelo si es error transitorio de sobrecarga
      if (isTransient(err)) {
        console.warn(`[Gemini] Modelo ${modelName} no disponible — intentando siguiente modelo`);
        continue;
      }
      // Error no recuperable (clave inválida, prompt bloqueado, etc.) → lanza inmediatamente
      throw err;
    }
  }

  // Todos los modelos fallaron
  const msg = isTransient(lastErr)
    ? "Los servidores de IA están saturados en este momento. Intenta de nuevo en unos segundos."
    : String(lastErr);
  throw new Error(msg);
}
