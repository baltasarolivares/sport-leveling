import Link from "next/link";
import { register } from "@/lib/auth/actions";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; verify?: string }>;
}) {
  const { error, verify } = await searchParams;

  // Pantalla de confirmación de email
  if (verify === "1") {
    return (
      <div className="text-center">
        <div className="text-4xl mb-4">📬</div>
        <h2 className="text-lg font-bold text-zinc-100 mb-2">
          Revisa tu email
        </h2>
        <p className="text-sm text-zinc-400 mb-6">
          Enviamos un enlace de confirmación. Ábrelo para activar tu cuenta y
          comenzar tu ascenso.
        </p>
        <Link
          href="/login"
          className="text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors"
        >
          ← Volver al inicio de sesión
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-zinc-200 mb-1">Crear cuenta</h2>
      <p className="text-sm text-zinc-500 mb-6">
        Regístrate y comienza tu ascenso como cazador.
      </p>

      {error && (
        <div className="mb-4 px-3 py-2.5 rounded-lg bg-red-950/60 border border-red-800/50 text-red-300 text-sm">
          {decodeURIComponent(error)}
        </div>
      )}

      <form action={register} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5"
          >
            Nombre de Cazador
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className="w-full px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800
              text-zinc-100 placeholder-zinc-600 text-sm
              focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
              transition"
            placeholder="Sung Jin-Woo"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800
              text-zinc-100 placeholder-zinc-600 text-sm
              focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
              transition"
            placeholder="cazador@ejemplo.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5"
          >
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className="w-full px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800
              text-zinc-100 placeholder-zinc-600 text-sm
              focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
              transition"
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-violet-600 hover:bg-violet-500
            text-white font-bold text-sm tracking-wide uppercase
            transition-colors shadow-lg shadow-violet-500/20 mt-2"
        >
          Despertar como Cazador
        </button>
      </form>

      <p className="text-center text-sm text-zinc-600 mt-6">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}
