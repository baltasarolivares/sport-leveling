import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Rutas que requieren sesión activa
const PROTECTED = ["/dashboard", "/log", "/profile", "/rankings", "/dungeons", "/onboarding", "/shop"];

// Rutas de auth — redirigir al dashboard si ya hay sesión
const AUTH_ROUTES = ["/login", "/register"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Propagar cookies actualizadas tanto al request como al response
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANTE: llamar getUser() aquí refresca el token si está por vencer.
  // No poner lógica de negocio entre createServerClient y esta llamada.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Redirigir a /login si intenta acceder a ruta protegida sin sesión
  const isProtected = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  if (!user && isProtected) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // Redirigir al dashboard si ya tiene sesión y toca /login o /register
  if (user && AUTH_ROUTES.includes(pathname)) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  // Redirigir la raíz según el estado de sesión
  if (pathname === "/") {
    const target = request.nextUrl.clone();
    target.pathname = user ? "/dashboard" : "/login";
    return NextResponse.redirect(target);
  }

  return response;
}
