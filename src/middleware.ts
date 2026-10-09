import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get("gn_session")?.value;

  let isValidSession = false;

  if (sessionToken) {
    try {
      const raw = Buffer.from(sessionToken, "base64url").toString("utf-8");
      const data = JSON.parse(raw);
      if (data.exp && data.exp > Date.now() && data.email) {
        isValidSession = true;
      }
    } catch {
      isValidSession = false;
    }
  }

  // Se o usuário está tentando acessar a tela de login mas já está autenticado, manda para a home
  if (pathname === "/login") {
    if (isValidSession) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Se não está autenticado e tenta acessar qualquer página interna, redireciona para login
  if (!isValidSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Aplica proteção em todas as rotas da aplicação exceto:
     * - api (rotas de API públicas caso existam)
     * - _next/static (arquivos estáticos do Next.js)
     * - _next/image (otimizador de imagem)
     * - favicon.ico, imagens e arquivos públicos (.png, .jpg, .svg, .webp)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
