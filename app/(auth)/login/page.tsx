import Link from "next/link";
import { login } from "@/lib/auth/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div>
      <h2 className="text-lg font-bold text-zinc-200 mb-1">Iniciar sesión</h2>
      <p className="text-sm text-zinc-500 mb-6">
        Entra a tu cuenta de cazador.
      </p>

      {error && (
        <div className="mb-4 px-3 py-2.5 rounded-lg bg-red-950/60 border border-red-800/50 text-red-300 text-sm">
          {decodeURIComponent(error)}
        </div>
      )}

      <form action={login} className="space-y-4">
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
            autoComplete="current-password"
            className="w-full px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800
              text-zinc-100 placeholder-zinc-600 text-sm
              focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
              transition"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-violet-600 hover:bg-violet-500
            text-white font-bold text-sm tracking-wide uppercase
            transition-colors shadow-lg shadow-violet-500/20 mt-2"
        >
          Entrar al Sistema
        </button>
      </form>

      <p className="text-center text-sm text-zinc-600 mt-6">
        ¿Sin cuenta?{" "}
        <Link href="/register" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
          Crear cuenta
        </Link>
      </p>
    </div>
  );
}
