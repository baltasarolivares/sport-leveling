/**
 * prisma/seed.ts
 *
 * Pobla la tienda con 50 items únicos de temática Solo Leveling.
 * Distribución de escasez:
 *   E-Rank: 20 items (100–500G)   — accesibles para nuevos cazadores
 *   D-Rank: 12 items (800–3000G)  — recompensa de primeras semanas
 *   C-Rank:  8 items (4000–9000G) — para cazadores comprometidos
 *   B-Rank:  5 items (12000–20000G)
 *   A-Rank:  3 items (25000–40000G)
 *   S-Rank:  2 items (55000–75000G) — legendarios, extremadamente raros
 */

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import * as dotenv from "fs";

// Cargar .env manualmente para el seed (tsx no usa Next.js loader)
const envFile = new URL("../.env", import.meta.url).pathname;
try {
  const lines = dotenv.readFileSync(envFile, "utf-8").split("\n");
  for (const line of lines) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, "");
  }
} catch { /* si no existe .env no pasa nada */ }

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const ITEMS = [
  // ──────────────────────────────────────────────
  // E-RANK — 20 items
  // ──────────────────────────────────────────────
  {
    name: "Daga Herrumbrosa",
    description: "Una daga vieja encontrada en una mazmorra E. Aún corta.",
    lore: "El primer arma de un cazador siempre huele a polvo y miedo.",
    rank: "E", itemType: "WEAPON", price: 150,
    xpMultiplierStr: 0.03, strengthBonus: 1,
  },
  {
    name: "Escudo Astillado",
    description: "Protección básica. La mitad ya no existe.",
    lore: "Sobrevivió cuatro incursiones. Tú también puedes.",
    rank: "E", itemType: "ARMOR", price: 180,
    xpMultiplierAll: 0.02, strengthBonus: 1,
  },
  {
    name: "Amuleto de Piedra",
    description: "Una piedra con runas grabadas a mano. Emite un calor leve.",
    lore: "Los iniciados del Gremio Azul lo usan como símbolo de pertenencia.",
    rank: "E", itemType: "ACCESSORY", price: 150,
    xpMultiplierInt: 0.03, intelligenceBonus: 1,
  },
  {
    name: "Botas de Aprendiz",
    description: "Ligeras, desgastadas, perfectas para correr cuando todo falla.",
    lore: "Se dice que el primer Cazador S las usó en su primer dungeon.",
    rank: "E", itemType: "ARMOR", price: 150,
    xpMultiplierAgi: 0.03, agilityBonus: 1,
  },
  {
    name: "Cuerda de Entrenamiento",
    description: "Más útil de lo que parece. Entrena los tendones.",
    lore: "Tres metros de cuerda cambiaron el mundo de un cazador desconocido.",
    rank: "E", itemType: "ACCESSORY", price: 180,
    xpMultiplierStr: 0.02, strengthBonus: 2,
  },
  {
    name: "Linterna del Explorador",
    description: "Ilumina las sombras. También ilumina tus reflejos.",
    lore: "En la oscuridad absoluta de una mazmorra, la velocidad lo es todo.",
    rank: "E", itemType: "ACCESSORY", price: 180,
    xpMultiplierAgi: 0.02, agilityBonus: 2,
  },
  {
    name: "Manual del Iniciado",
    description: "Páginas amarillas con teorías sobre dungeons. Sorprendentemente útil.",
    lore: "Escrito por un Cazador C que nunca pasó de rango D.",
    rank: "E", itemType: "ACCESSORY", price: 180,
    xpMultiplierInt: 0.02, intelligenceBonus: 2,
  },
  {
    name: "Puñal de Pino",
    description: "Tallado a mano. No durará mucho, pero tú sí.",
    lore: "La madera de los bosques del norte tiene propiedades mágicas menores.",
    rank: "E", itemType: "WEAPON", price: 120,
    xpMultiplierAgi: 0.02, agilityBonus: 1, strengthBonus: 1,
  },
  {
    name: "Vara de Junco",
    description: "Un bastón ritual. Aumenta la concentración.",
    lore: "Los monjes del Monte Yuru la usan para meditar durante días.",
    rank: "E", itemType: "WEAPON", price: 120,
    xpMultiplierInt: 0.02, intelligenceBonus: 1,
  },
  {
    name: "Arco de Rama",
    description: "Difícil de tensar. Eso es justamente el punto.",
    lore: "La resistencia del arco entrena la mente tanto como el cuerpo.",
    rank: "E", itemType: "WEAPON", price: 150,
    xpMultiplierAgi: 0.03, agilityBonus: 1,
  },
  {
    name: "Túnica de Lino",
    description: "Fina y ligera. Permite moverse sin restricciones.",
    lore: "Favorita de los magos de rango bajo por su bajo peso.",
    rank: "E", itemType: "ARMOR", price: 130,
    xpMultiplierInt: 0.02, intelligenceBonus: 1,
  },
  {
    name: "Chaleco de Cuero",
    description: "Protección mínima para el torso. Mejor que nada.",
    lore: "Hecho con piel de lobo de mazmorra E. El lobo no opinó.",
    rank: "E", itemType: "ARMOR", price: 130,
    xpMultiplierStr: 0.02, strengthBonus: 1,
  },
  {
    name: "Sandalias Ligeras",
    description: "Apenas existen. Eso las hace perfectas.",
    lore: "Un maestro de agilidad dijo: el mejor calzado es el que no sientes.",
    rank: "E", itemType: "ARMOR", price: 130,
    xpMultiplierAgi: 0.02, agilityBonus: 1,
  },
  {
    name: "Piedra de Afilar",
    description: "Mantén tu filo. Mantén tu ventaja.",
    lore: "Un filo bien mantenido vale más que una espada nueva.",
    rank: "E", itemType: "ACCESSORY", price: 100,
    xpMultiplierStr: 0.02, strengthBonus: 1,
  },
  {
    name: "Brújula del Cazador",
    description: "Siempre apunta hacia el objetivo más cercano.",
    lore: "Fabricada por un artesano que murió en una mazmorra D. Irónico.",
    rank: "E", itemType: "ACCESSORY", price: 100,
    xpMultiplierAgi: 0.02, agilityBonus: 1,
  },
  {
    name: "Pergamino de Iniciación",
    description: "Contiene el primer hechizo que todo mago aprende.",
    lore: "Quemar papel no es magia. Quemar la voluntad de tu enemigo, sí.",
    rank: "E", itemType: "ACCESSORY", price: 100,
    xpMultiplierInt: 0.02, intelligenceBonus: 1,
  },
  {
    name: "Maza de Entrenamiento",
    description: "Pesada. Eso es todo. Eso es suficiente.",
    lore: "Cien golpes al día durante un año. Así empezó el Cazador del Martillo.",
    rank: "E", itemType: "WEAPON", price: 200,
    xpMultiplierStr: 0.02, strengthBonus: 2,
  },
  {
    name: "Garrote",
    description: "Sin elegancia. Con resultado.",
    lore: "Los monstruos de mazmorra E tienen miedo del sonido que hace.",
    rank: "E", itemType: "WEAPON", price: 160,
    xpMultiplierStr: 0.03, strengthBonus: 1, agilityBonus: 1,
  },
  {
    name: "Sortija Común",
    description: "Un anillo sin magia específica. Lo tiene todo un poco.",
    lore: "Nadie sabe quién la fabricó. Aparece en mazmorras de todos los rangos.",
    rank: "E", itemType: "ACCESSORY", price: 250,
    xpMultiplierAll: 0.01, strengthBonus: 1, agilityBonus: 1, intelligenceBonus: 1,
  },
  {
    name: "Capa de Viajero",
    description: "Cómoda en el calor, cómoda en el frío. Ideal para largas incursiones.",
    lore: "Un cazador sin capa es un cazador a medio preparar.",
    rank: "E", itemType: "ARMOR", price: 220,
    xpMultiplierAll: 0.02, agilityBonus: 1,
  },

  // ──────────────────────────────────────────────
  // D-RANK — 12 items
  // ──────────────────────────────────────────────
  {
    name: "Espada Corta del Cazador",
    description: "El arma estándar de todo cazador D. Equilibrada y confiable.",
    lore: "Miles de mazmorras cayeron ante espadas exactamente iguales a esta.",
    rank: "D", itemType: "WEAPON", price: 2500,
    xpMultiplierStr: 0.06, strengthBonus: 4,
  },
  {
    name: "Arco de Tejo Reforzado",
    description: "Flexible, preciso, mortal a distancia.",
    lore: "Los arqueros del Gremio del Bosque lo usan como prueba de iniciación.",
    rank: "D", itemType: "WEAPON", price: 2400,
    xpMultiplierAgi: 0.06, agilityBonus: 4,
  },
  {
    name: "Tomo de Hechicería",
    description: "Lleno de anotaciones de un mago fallecido. Sorprendentemente útil.",
    lore: "El mago Jung-Ho dejó más sabiduría en sus libros que en sus alumnos.",
    rank: "D", itemType: "ACCESSORY", price: 2300,
    xpMultiplierInt: 0.06, intelligenceBonus: 4,
  },
  {
    name: "Armadura de Cuero Endurecido",
    description: "Tratada con ácido de mazmorra para mayor resistencia.",
    lore: "El proceso de endurecimiento tarda tres semanas. Cada día vale la pena.",
    rank: "D", itemType: "ARMOR", price: 2200,
    xpMultiplierAll: 0.05, strengthBonus: 3,
  },
  {
    name: "Anillo de Cobre Inscrito",
    description: "Inscripciones que amplifican la fuerza muscular.",
    lore: "El cobre conduce la energía mágica mejor que cualquier metal común.",
    rank: "D", itemType: "ACCESSORY", price: 1800,
    xpMultiplierStr: 0.04, strengthBonus: 3, agilityBonus: 2,
  },
  {
    name: "Botas de Montaña",
    description: "Diseñadas para terreno irregular. Perfectas para cualquier mazmorra.",
    lore: "El Cazador Park las usó en 200 mazmorras sin reparación. Récord gremial.",
    rank: "D", itemType: "ARMOR", price: 1700,
    xpMultiplierAgi: 0.05, agilityBonus: 4,
  },
  {
    name: "Casco del Guerrero",
    description: "Protege la cabeza. También la despeja.",
    lore: "El metal de las mazmorras D tiene propiedades que la ciencia no explica.",
    rank: "D", itemType: "ARMOR", price: 1600,
    xpMultiplierStr: 0.05, strengthBonus: 3,
  },
  {
    name: "Guantes de Entrenamiento Mágico",
    description: "Aumentan la precisión de cada golpe.",
    lore: "La magia en los nudillos es la diferencia entre un golpe y un golpe definitivo.",
    rank: "D", itemType: "ACCESSORY", price: 1400,
    xpMultiplierAgi: 0.04, agilityBonus: 3, strengthBonus: 2,
  },
  {
    name: "Amuleto de Cuarzo",
    description: "El cuarzo absorbe energía mental del entorno.",
    lore: "Los magos del Instituto lo usan para estudiar en mazmorras activas.",
    rank: "D", itemType: "ACCESSORY", price: 1300,
    xpMultiplierInt: 0.05, intelligenceBonus: 3,
  },
  {
    name: "Daga Serrada",
    description: "Corta más en la retirada que en el avance.",
    lore: "Los asesinos de rango D la prefieren sobre cualquier otra arma.",
    rank: "D", itemType: "WEAPON", price: 1200,
    xpMultiplierAgi: 0.04, agilityBonus: 3,
  },
  {
    name: "Martillo de Aprendiz",
    description: "Pesa el doble de lo que parece. Entrena sin darte cuenta.",
    lore: "La técnica del martillo es la base de toda magia de fuerza.",
    rank: "D", itemType: "WEAPON", price: 1100,
    xpMultiplierStr: 0.04, strengthBonus: 3,
  },
  {
    name: "Báculo de Roble Antiguo",
    description: "La madera tiene cien años. La magia, más.",
    lore: "Tallado durante la Gran Apertura de las Grietas. Sobrevivió todo.",
    rank: "D", itemType: "WEAPON", price: 1000,
    xpMultiplierInt: 0.04, intelligenceBonus: 3,
  },

  // ──────────────────────────────────────────────
  // C-RANK — 8 items
  // ──────────────────────────────────────────────
  {
    name: "Espada de Hierro del Cazador",
    description: "Forjada con mineral de mazmorra C. Excepcionalmente duradera.",
    lore: "Solo los herreros del Gremio de Forja pueden trabajar este metal.",
    rank: "C", itemType: "WEAPON", price: 8000,
    xpMultiplierStr: 0.10, strengthBonus: 6,
  },
  {
    name: "Escudo del Barranco",
    description: "Extraído de una criatura del Barranco Oscuro. Pesa poco, aguanta mucho.",
    lore: "La criatura que lo portaba tardó dos horas en morir. El escudo ni se rayó.",
    rank: "C", itemType: "ARMOR", price: 7500,
    xpMultiplierAll: 0.08, strengthBonus: 5,
  },
  {
    name: "Daga de Sombra",
    description: "Se mueve más rápido que los ojos. Casi.",
    lore: "Forjada en la oscuridad por un artesano que nunca vio la luz solar.",
    rank: "C", itemType: "WEAPON", price: 7000,
    xpMultiplierAgi: 0.10, agilityBonus: 6,
  },
  {
    name: "Manto del Archibrujo",
    description: "Tejido con hilos de maná puro. Amplifica cada pensamiento.",
    lore: "El Archibrujo Kim lo usó para descifrar el lenguaje de las mazmorras.",
    rank: "C", itemType: "ARMOR", price: 6500,
    xpMultiplierInt: 0.10, intelligenceBonus: 6,
  },
  {
    name: "Sello del Vórtice",
    description: "Un sello que canaliza energía cinética hacia los músculos.",
    lore: "Encontrado en el centro del Vórtice de Hierro. Nadie sabe quién lo dejó.",
    rank: "C", itemType: "ACCESSORY", price: 6000,
    xpMultiplierStr: 0.08, strengthBonus: 5, agilityBonus: 3,
  },
  {
    name: "Guanteletes de Roca Viva",
    description: "La roca se adapta a la mano. La mano se adapta a destruir.",
    lore: "Las grietas en los nudillos no son daño. Son poder acumulado.",
    rank: "C", itemType: "ARMOR", price: 5500,
    xpMultiplierStr: 0.08, strengthBonus: 7,
  },
  {
    name: "Cristal de Maná Puro",
    description: "Condensa el maná ambiental de las mazmorras C.",
    lore: "Cada cristal tarda un siglo en formarse. Cada cazador lo agota en un año.",
    rank: "C", itemType: "ACCESSORY", price: 5000,
    xpMultiplierInt: 0.08, intelligenceBonus: 7,
  },
  {
    name: "Cinturón del Explorador Élite",
    description: "Contiene herramientas ocultas. También entrena el núcleo.",
    lore: "El Explorador Lee sobrevivió 40 mazmorras solo con esto y su mente.",
    rank: "C", itemType: "ACCESSORY", price: 4500,
    xpMultiplierAgi: 0.08, agilityBonus: 5, intelligenceBonus: 3,
  },

  // ──────────────────────────────────────────────
  // B-RANK — 5 items
  // ──────────────────────────────────────────────
  {
    name: "Lanza de Casaka",
    description: "Extraída del colmillo del jefe de mazmorra Casaka. Única en el mundo.",
    lore: "Casaka tardó treinta años en crecer. La lanza tardó tres días en forjarse.",
    rank: "B", itemType: "WEAPON", price: 18000,
    xpMultiplierStr: 0.15, strengthBonus: 10,
  },
  {
    name: "Armadura del Dragón Menor",
    description: "Escamas de un dragón joven. Más ligeras que el acero. Más duras también.",
    lore: "El dragón tenía apenas doscientos años. Para su especie, era un niño.",
    rank: "B", itemType: "ARMOR", price: 16000,
    xpMultiplierAll: 0.10, strengthBonus: 8,
  },
  {
    name: "Anillo del Jinete de Bestias",
    description: "Resuena con la energía de criaturas salvajes. Acelera cada movimiento.",
    lore: "El Jinete de Bestias nunca necesitó un arma. Este anillo era suficiente.",
    rank: "B", itemType: "ACCESSORY", price: 15000,
    xpMultiplierAgi: 0.15, agilityBonus: 10,
  },
  {
    name: "Amuleto de la Gárgola",
    description: "Tallado en piedra viva de mazmorra B. Amplifica la percepción.",
    lore: "Las gárgolas observan sin moverse. Así aprenden todo.",
    rank: "B", itemType: "ACCESSORY", price: 14000,
    xpMultiplierInt: 0.15, intelligenceBonus: 10,
  },
  {
    name: "Botas del Viento Cortante",
    description: "Cada paso genera una ráfaga imperceptible. Cada ráfaga, una ventaja.",
    lore: "El Cazador del Viento desapareció. Sus botas permanecieron.",
    rank: "B", itemType: "ARMOR", price: 13000,
    xpMultiplierAgi: 0.12, agilityBonus: 8, strengthBonus: 4,
  },

  // ──────────────────────────────────────────────
  // A-RANK — 3 items
  // ──────────────────────────────────────────────
  {
    name: "Espada del Ejército de Sombras",
    description: "Forjada con la esencia de los soldados sombra de Sung Jin-Woo.",
    lore: "Quien la porta no está solo. Nunca lo estuvo.",
    rank: "A", itemType: "WEAPON", price: 35000,
    xpMultiplierStr: 0.20, strengthBonus: 15,
  },
  {
    name: "Capa del Asesino Silencioso",
    description: "No se ve. No se oye. Solo se siente cuando ya es tarde.",
    lore: "El Asesino del Gremio Negro nunca fue visto. Tampoco su capa.",
    rank: "A", itemType: "ARMOR", price: 30000,
    xpMultiplierAgi: 0.20, agilityBonus: 15,
  },
  {
    name: "Grimorio del Archibrujo Mayor",
    description: "Contiene el conocimiento de diez generaciones de magos S.",
    lore: "Cada página cambia de contenido dependiendo de quien la lee.",
    rank: "A", itemType: "ACCESSORY", price: 28000,
    xpMultiplierInt: 0.20, intelligenceBonus: 15,
  },

  // ──────────────────────────────────────────────
  // S-RANK — 2 items (legendarios)
  // ──────────────────────────────────────────────
  {
    name: "Ira de Kamish",
    description: "La garra derecha del dragón Kamish. El arma más poderosa jamás recuperada de una mazmorra.",
    lore: "Kamish mató a treinta Cazadores S antes de caer. Su garra recuerda cada nombre.",
    rank: "S", itemType: "WEAPON", price: 65000,
    xpMultiplierAll: 0.25, strengthBonus: 20, agilityBonus: 5,
  },
  {
    name: "Corona del Monarca Supremo",
    description: "La corona de Antares, Monarca de los Demonios. Otorga dominio sobre todas las disciplinas.",
    lore: "Solo quien ha alcanzado la cima puede cargar su peso. Los demás la sienten como montaña.",
    rank: "S", itemType: "ACCESSORY", price: 75000,
    xpMultiplierAll: 0.15, strengthBonus: 20, agilityBonus: 20, intelligenceBonus: 20,
  },
] as const;

async function main() {
  console.log("🌱 Sembrando items de la tienda...");

  let created = 0;
  let skipped = 0;

  for (const item of ITEMS) {
    try {
      await prisma.item.upsert({
        where: { name: item.name },
        update: {},   // no sobreescribir si ya existe con dueño
        create: {
          name:              item.name,
          description:       item.description,
          lore:              item.lore ?? null,
          rank:              item.rank as any,
          itemType:          item.itemType as any,
          price:             item.price,
          xpMultiplierStr:   (item as any).xpMultiplierStr  ?? 0,
          xpMultiplierAgi:   (item as any).xpMultiplierAgi  ?? 0,
          xpMultiplierInt:   (item as any).xpMultiplierInt  ?? 0,
          xpMultiplierAll:   (item as any).xpMultiplierAll  ?? 0,
          strengthBonus:     (item as any).strengthBonus    ?? 0,
          agilityBonus:      (item as any).agilityBonus     ?? 0,
          intelligenceBonus: (item as any).intelligenceBonus ?? 0,
        },
      });
      created++;
    } catch {
      skipped++;
    }
  }

  console.log(`✅ ${created} items creados, ${skipped} ya existían.`);
  console.log(`📦 Total en tienda: ${ITEMS.length} items únicos (E→S)`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
