export interface FileBoilerplate {
  path: string;
  name: string;
  description: string;
  language: 'typescript' | 'json' | 'css' | 'markdown';
  code: string;
}

export interface FolderNode {
  name: string;
  type: 'folder' | 'file';
  path: string;
  children?: FolderNode[];
  fileKey?: string; // Links coordinates to boilerplate code
}

export const NEXT_PROJECT_STRUCTURE: FolderNode[] = [
  {
    name: 'src',
    type: 'folder',
    path: '/src',
    children: [
      {
        name: 'app',
        type: 'folder',
        path: '/src/app',
        children: [
          {
            name: '(auth)',
            type: 'folder',
            path: '/src/app/(auth)',
            children: [
              { name: 'login', type: 'folder', path: '/src/app/(auth)/login', children: [{ name: 'page.tsx', type: 'file', path: '/src/app/(auth)/login/page.tsx', fileKey: 'login_page' }] },
              { name: 'layout.tsx', type: 'file', path: '/src/app/(auth)/layout.tsx', fileKey: 'auth_layout' }
            ]
          },
          {
            name: '(dashboard)',
            type: 'folder',
            path: '/src/app/(dashboard)',
            children: [
              { name: 'dashboard', type: 'folder', path: '/src/app/(dashboard)/dashboard', children: [{ name: 'page.tsx', type: 'file', path: '/src/app/(dashboard)/dashboard/page.tsx', fileKey: 'db_page' }] },
              { name: 'bolao', type: 'folder', path: '/src/app/(dashboard)/bolao', children: [{ name: 'page.tsx', type: 'file', path: '/src/app/(dashboard)/bolao/page.tsx', fileKey: 'bolao_page' }] },
              { name: 'financeiro', type: 'folder', path: '/src/app/(dashboard)/financeiro', children: [{ name: 'page.tsx', type: 'file', path: '/src/app/(dashboard)/financeiro/page.tsx', fileKey: 'financeiro_page' }] },
              { name: 'galeria', type: 'folder', path: '/src/app/(dashboard)/galeria', children: [{ name: 'page.tsx', type: 'file', path: '/src/app/(dashboard)/galeria/page.tsx', fileKey: 'galeria_page' }] },
              { name: 'social', type: 'folder', path: '/src/app/(dashboard)/social', children: [{ name: 'page.tsx', type: 'file', path: '/src/app/(dashboard)/social/page.tsx', fileKey: 'social_page' }] },
              { name: 'layout.tsx', type: 'file', path: '/src/app/(dashboard)/layout.tsx', fileKey: 'dashboard_layout' }
            ]
          },
          { name: 'globals.css', type: 'file', path: '/src/app/globals.css', fileKey: 'globals_css' },
          { name: 'layout.tsx', type: 'file', path: '/src/app/layout.tsx', fileKey: 'root_layout' },
          { name: 'page.tsx', type: 'file', path: '/src/app/page.tsx', fileKey: 'root_page' },
          { name: 'providers.tsx', type: 'file', path: '/src/app/providers.tsx', fileKey: 'providers_tsx' }
        ]
      },
      {
        name: 'components',
        type: 'folder',
        path: '/src/components',
        children: [
          {
            name: 'ui',
            type: 'folder',
            path: '/src/components/ui',
            children: [
              { name: 'button.tsx', type: 'file', path: '/src/components/ui/button.tsx', fileKey: 'ui_button' },
              { name: 'card.tsx', type: 'file', path: '/src/components/ui/card.tsx', fileKey: 'ui_card' },
              { name: 'dialog.tsx', type: 'file', path: '/src/components/ui/dialog.tsx', fileKey: 'ui_dialog' }
            ]
          },
          { name: 'theme-toggle.tsx', type: 'file', path: '/src/components/theme-toggle.tsx', fileKey: 'theme_toggle' }
        ]
      },
      {
        name: 'hooks',
        type: 'folder',
        path: '/src/hooks',
        children: [
          { name: 'use-theme.ts', type: 'file', path: '/src/hooks/use-theme.ts', fileKey: 'use_theme' }
        ]
      },
      {
        name: 'lib',
        type: 'folder',
        path: '/src/lib',
        children: [
          {
            name: 'supabase',
            type: 'folder',
            path: '/src/lib/supabase',
            children: [
              { name: 'client.ts', type: 'file', path: '/src/lib/supabase/client.ts', fileKey: 'supabase_client' },
              { name: 'server.ts', type: 'file', path: '/src/lib/supabase/server.ts', fileKey: 'supabase_server' },
              { name: 'middleware.ts', type: 'file', path: '/src/lib/supabase/middleware.ts', fileKey: 'supabase_middleware' }
            ]
          },
          { name: 'utils.ts', type: 'file', path: '/src/lib/utils.ts', fileKey: 'lib_utils' }
        ]
      },
      {
        name: 'store',
        type: 'folder',
        path: '/src/store',
        children: [
          { name: 'useAuthStore.ts', type: 'file', path: '/src/store/useAuthStore.ts', fileKey: 'auth_store' },
          { name: 'useThemeStore.ts', type: 'file', path: '/src/store/useThemeStore.ts', fileKey: 'theme_store' }
        ]
      }
    ]
  },
  { name: '.env.local', type: 'file', path: '/.env.local', fileKey: 'env_example' },
  { name: 'middleware.ts', type: 'file', path: '/middleware.ts', fileKey: 'root_middleware' },
  { name: 'next.config.ts', type: 'file', path: '/next.config.ts', fileKey: 'next_config' },
  { name: 'package.json', type: 'file', path: '/package.json', fileKey: 'next_package_json' }
];

export const BOILERPLATES: Record<string, FileBoilerplate> = {
  root_layout: {
    path: '/src/app/layout.tsx',
    name: 'layout.tsx',
    description: 'Root layout do Next.js 15 App Router com carregamento de Fontes Variáveis do Inter, injetor do tema global e encapsulador do React Query client-side.',
    language: 'typescript',
    code: `import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProviders } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Rua do Hexa - Copa Comunitária 2026",
  description: "Traga sua rua, condomínio ou bairro para vibrar na torcida do Hexa com bolão, gincanas de decoração e vaquinhas comunitárias.",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={\`\${inter.variable} font-sans antialiased bg-slate-950 text-slate-100 min-h-screen\`}>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}`
  },
  providers_tsx: {
    path: '/src/app/providers.tsx',
    name: 'providers.tsx',
    description: 'Centralizador dos Provedores globais com suporte integrado a React Query v5 (cache e sincronização) e inicializador do estado reativo do Zustand de autenticação.',
    language: 'typescript',
    code: `"use client";

import React, { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export function AppProviders({ children }: { children: React.ReactNode }) {
  // Inicialização estável do React-Query QueryClient por requisição/visita
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minuto de cache válido por padrão
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const setSession = useAuthStore((state) => state.setSession);
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Sincroniza a sessão de autenticação do Supabase com o Zustand Global Store
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, setSession]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}`
  },
  root_page: {
    path: '/src/app/page.tsx',
    name: 'page.tsx',
    description: 'Página inicial comercial do Rua do Hexa com renderização otimizada para SEO e fluxo de onboarding limpo.',
    language: 'typescript',
    code: `import Link from "next/link";
import { Shield, Sparkles, Flame, Users } from "lucide-react";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-radial from-slate-900 to-slate-950 px-4">
      <div className="max-w-3xl text-center space-y-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          Onboarding Copa do Mundo 2026
        </div>
        
        <h1 className="text-5xl md:text-6xl font-black tracking-tight uppercase">
          RUA DO <span className="bg-gradient-to-r from-yellow-400 to-emerald-400 bg-clip-text text-transparent">HEXA</span>
        </h1>
        
        <p className="text-slate-400 text-base max-w-xl mx-auto">
          Faça da sua rua a campeã da Copa do Bairro. Organize mutirões de pintura, vaquinhas de bandeiras, palpite nos bolões e mostre a força da sua comunidade.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link 
            href="/login" 
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:brightness-110 font-bold transition-all text-sm flex items-center justify-center gap-2"
          >
            Começar Agora
          </Link>
          <Link 
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 font-bold transition-all text-sm flex items-center justify-center"
          >
            Acessar Dashboard Demo
          </Link>
        </div>
      </div>
    </main>
  );
}`
  },
  auth_layout: {
    path: '/src/app/(auth)/layout.tsx',
    name: 'layout.tsx',
    description: 'Layout unificado para onboarding e autenticação dos vizinhos, com container centralizado e estilização segura.',
    language: 'typescript',
    code: `export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Círculos decorativos de background */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 md:p-8 backdrop-blur-xl relative z-10 shadow-xl shadow-slate-950/50">
        {children}
      </div>
    </div>
  );
}`
  },
  login_page: {
    path: '/src/app/(auth)/login/page.tsx',
    name: 'page.tsx',
    description: 'Interface de autenticação usando Supabase Auth (E-mail assíncrono ou redes sociais) integrado de forma limpa.',
    language: 'typescript',
    code: `"use client";

import React, { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(\`Erro: \${error.message}\`);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-black uppercase tracking-wide">Bem-vindo Vizinho</h2>
        <p className="text-xs text-slate-400 mt-1">Conecte-se para organizar a sua comunidade!</p>
      </div>

      <form onSubmit={handleSignIn} className="space-y-4">
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase font-mono">E-mail de morador</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1.5 px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-emerald-500"
            placeholder="exemplo@gmail.com"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase font-mono">Senha</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mt-1.5 px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-emerald-500"
            placeholder="••••••••"
          />
        </div>

        {message && (
          <div className="text-xs p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition-all font-bold text-sm text-white disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar no Hexa"}
        </button>
      </form>
    </div>
  );
}`
  },
  dashboard_layout: {
    path: '/src/app/(dashboard)/layout.tsx',
    name: 'layout.tsx',
    description: 'Layout mestre do painel com sidebar colapsável, perfil de usuário logado resgatado do Zustand e painel de ações comunitárias unificadas.',
    language: 'typescript',
    code: `"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Flame, DollarSign, Calendar, MessageSquare, Award, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const session = useAuthStore((state) => state.session);
  const supabase = createClientComponentClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const navItems = [
    { label: "Mural da Rua", path: "/dashboard", icon: Home },
    { label: "Bolão da Copa", path: "/bolao", icon: Flame },
    { label: "Financiamento", path: "/financeiro", icon: DollarSign },
    { label: "Rede Social", path: "/social", icon: MessageSquare },
    { label: "Mural Histórico", path: "/galeria", icon: Award },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-slate-900/50 border-r border-slate-800/80 p-5 flex flex-col justify-between">
        <div className="space-y-6">
          <Link href="/dashboard" className="font-display font-black text-xl text-emerald-400">
            RUA DO HEXA ⚽
          </Link>
          
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={\`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all \${
                    isActive 
                      ? "bg-slate-800 text-emerald-400 border-l-4 border-emerald-500 font-bold" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-850/40"
                  }\`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800/60 mt-4 flex items-center justify-between">
          <div className="truncate pr-2">
            <p className="text-xs font-bold truncate text-slate-300">
              {session?.user?.email || "Vizinho Torcedor"}
            </p>
            <span className="text-[10px] text-slate-500 font-mono">Status: Morador</span>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 p-6 md:p-8 max-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}`
  },
  db_page: {
    path: '/src/app/(dashboard)/dashboard/page.tsx',
    name: 'page.tsx',
    description: 'Página Hub ou feed comunitário centralizado para os moradores verem as estatísticas instantâneas do bairro.',
    language: 'typescript',
    code: `export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black uppercase">PAINEL COMUNITÁRIO</h1>
        <p className="text-sm text-slate-400">Status em tempo real das atividades da Copa 2026 na nossa rua.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl">
          <span className="text-emerald-400 text-xs font-mono font-bold uppercase">Vaquinha Enfeites</span>
          <h2 className="text-2xl font-black mt-2">R$ 5.480,00</h2>
          <p className="text-xs text-slate-500 mt-1">91% da meta de pintura concluída</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl">
          <span className="text-amber-400 text-xs font-mono font-bold uppercase">Casas Ornamentadas</span>
          <h2 className="text-2xl font-black mt-2">42 de 50</h2>
          <p className="text-xs text-slate-500 mt-1">Gincana da Casa mais Bonita</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl">
          <span className="text-sky-400 text-xs font-mono font-bold uppercase">Líder do Bolão Geral</span>
          <h2 className="text-2xl font-black mt-2">Família Silva</h2>
          <p className="text-xs text-slate-500 mt-1">452 pontos acumulados</p>
        </div>
      </div>
    </div>
  );
}`
  },
  supabase_client: {
    path: '/src/lib/supabase/client.ts',
    name: 'client.ts',
    description: 'Inicializador cliente (Client Session) do Supabase Auth & Storage executável em Client Components.',
    language: 'typescript',
    code: `import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Instancia o client para executar autenticações, queries em tempo real e RLS corretas no browser
export const createClient = () => createClientComponentClient();`
  },
  supabase_server: {
    path: '/src/lib/supabase/server.ts',
    name: 'server.ts',
    description: 'Instanciamento do Supabase para Server Components, Server Actions e manipulador de Cookies síncronos no Next.js 15.',
    language: 'typescript',
    code: `import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// Instancia segura do Supabase para Server Components do Next.js sem vazamento de tokens
export const createServerClient = async () => {
  const cookieStore = await cookies();
  return createServerComponentClient({ cookies: () => cookieStore });
};`
  },
  supabase_middleware: {
    path: '/src/lib/supabase/middleware.ts',
    name: 'middleware.ts',
    description: 'Mecanismo de interceptação que atualiza o token de autenticação em cookies dinamicamente para manter sessões seguras.',
    language: 'typescript',
    code: `import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createMiddlewareClient({ req: request, res: response });

  // Dispara refresh automático se o JWT do morador expirar na Vercel
  await supabase.auth.getSession();

  return response;
}`
  },
  auth_store: {
    path: '/src/store/useAuthStore.ts',
    name: 'useAuthStore.ts',
    description: 'Zustand Store para gerenciador global de sessões do usuário e controle de papéis/cadastro em cache ágil.',
    language: 'typescript',
    code: `import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";

interface AuthState {
  session: Session | null;
  isAuthenticated: boolean;
  setSession: (session: Session | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isAuthenticated: false,
  setSession: (session) => set({ 
    session, 
    isAuthenticated: !!session 
  }),
  logout: () => set({ 
    session: null, 
    isAuthenticated: false 
  }),
}));`
  },
  theme_store: {
    path: '/src/store/useThemeStore.ts',
    name: 'useThemeStore.ts',
    description: 'Zustand Store de gerenciamento reativo e atômico de tema global com persistência no LocalStorage nativo.',
    language: 'typescript',
    code: `import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeState {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "dark",
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === "dark" ? "light" : "dark" 
      })),
    }),
    {
      name: "theme-storage",
    }
  )
);`
  },
  root_middleware: {
    path: '/middleware.ts',
    name: 'middleware.ts',
    description: 'Middleware central do Next.js de autogestão de escopo do login, emparelhado com o cookies-refresh do Supabase dadas as requisições.',
    language: 'typescript',
    code: `import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // 1. Atualiza e revalida sessão nos Cookies para o Supabase Auth
  const response = await updateSession(request);
  
  // 2. Regras de redirecionamento de rotas protegidas (Dashboard)
  const hasSession = request.cookies.has("sb-access-token") || request.cookies.has("supabase-auth-token");
  const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard") ||
                            request.nextUrl.pathname.startsWith("/bolao") ||
                            request.nextUrl.pathname.startsWith("/financeiro") ||
                            request.nextUrl.pathname.startsWith("/social") ||
                            request.nextUrl.pathname.startsWith("/galeria");

  if (isDashboardRoute && !hasSession) {
    // Morador sem sessão é interceptado e redirecionado para o Onboarding/Login
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Intercepta todas as requisições exceto assets estáticos:
     * - api (rotas internas)
     * - _next/static (arquivos estáticos de compilação)
     * - _next/image (rotas de compressão de imagens)
     * - favicon.ico (ícone principal do navegador)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};`
  },
  next_package_json: {
    path: '/package.json',
    name: 'package.json',
    description: 'Estruturação do manifesto npm com as dependências oficiais da stack Next.js 15, em total sincronia.',
    language: 'json',
    code: `{
  "name": "rua-do-hexa",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbo -p 3000",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@supabase/auth-helpers-nextjs": "^0.10.0",
    "@supabase/supabase-js": "^2.48.0",
    "@tanstack/react-query": "^5.64.0",
    "lucide-react": "^0.473.0",
    "next": "^15.1.4",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zustand": "^5.0.3"
  },
  "devDependencies": {
    "@types/node": "^22.10.7",
    "@types/react": "^19.0.7",
    "@types/react-dom": "^19.0.3",
    "postcss": "^8.5.1",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.7.3"
  }
}`
  }
};
