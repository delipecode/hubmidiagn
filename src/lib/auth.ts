"use server";

import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "gn_session";
const SESSION_SECRET = process.env.AUTH_SECRET || "grupo-nobre-midia-secret-key-2026";

// Credenciais padrão (podem ser customizadas via .env)
const VALID_ACCOUNTS = [
  {
    email: process.env.ADMIN_EMAIL || "marketing@gruponobre.edu.br",
    password: process.env.ADMIN_PASSWORD || "nobre2026",
    name: "Marketing Executivo",
    cargo: "Diretoria de Mídia & Inteligência",
  },
  {
    email: "diretoria@gruponobre.edu.br",
    password: process.env.DIRETORIA_PASSWORD || "diretoria2026",
    name: "Diretoria Grupo Nobre",
    cargo: "Acesso Geral Holding",
  },
];

export async function createSessionToken(email: string): Promise<string> {
  const payload = JSON.stringify({
    email,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 dias de sessão
  });
  return Buffer.from(payload).toString("base64url");
}

export async function verifySessionToken(token: string): Promise<{ email: string } | null> {
  try {
    const raw = Buffer.from(token, "base64url").toString("utf-8");
    const data = JSON.parse(raw);
    if (data.exp && data.exp > Date.now() && data.email) {
      return { email: data.email };
    }
    return null;
  } catch {
    return null;
  }
}

export async function loginAction(formData: FormData) {
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { success: false, error: "Preencha o e-mail institucional e a senha." };
  }

  const account = VALID_ACCOUNTS.find(
    (acc) => acc.email.toLowerCase() === email && acc.password === password
  );

  if (!account) {
    return { success: false, error: "Credenciais inválidas. Verifique seu e-mail e senha." };
  }

  const token = await createSessionToken(account.email);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    path: "/",
  });

  return { success: true };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const verified = await verifySessionToken(token);
  if (!verified) return null;

  const account = VALID_ACCOUNTS.find(
    (acc) => acc.email.toLowerCase() === verified.email.toLowerCase()
  );

  return {
    email: verified.email,
    name: account?.name || "Usuário Autorizado",
    cargo: account?.cargo || "Holding Grupo Nobre",
  };
}
