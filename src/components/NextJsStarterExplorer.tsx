import React, { useState } from 'react';
import { 
  Folder, 
  FolderOpen, 
  ChevronRight, 
  ChevronDown, 
  FileText, 
  Copy, 
  Check, 
  Smartphone, 
  Palette,
  Code2,
  Info,
  Layers,
  Database
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { NEXT_PROJECT_STRUCTURE, BOILERPLATES, FolderNode } from '../data/nextProjectStructure';

export default function NextJsStarterExplorer() {
  const [selectedFileKey, setSelectedFileKey] = useState<string>('root_layout');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    '/src': true,
    '/src/app': true,
    '/src/app/(auth)': true,
    '/src/app/(dashboard)': true,
    '/src/lib': true,
    '/src/lib/supabase': true,
    '/src/store': true,
  });
  const [copiedCodeSuccess, setCopiedCodeSuccess] = useState(false);
  const [activeNextTab, setActiveNextTab] = useState<'explorer' | 'providers' | 'supabase_flow' | 'theme_spec'>('explorer');
  const [simulatedThemeState, setSimulatedThemeState] = useState<'dark' | 'light'>('dark');

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const renderHighlightedCode = (codeText: string, lang: 'typescript' | 'json' | 'css' | 'markdown') => {
    let highlighted = codeText;

    if (lang === 'json') {
      highlighted = highlighted.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*")/g, '<span class="text-amber-300">$1</span>');
      highlighted = highlighted.replace(/\b(true|false|null)\b/g, '<span class="text-purple-400 font-semibold">$1</span>');
      highlighted = highlighted.replace(/\b([0-9]+)\b/g, '<span class="text-sky-400">$1</span>');
    } else if (lang === 'css') {
      highlighted = highlighted.replace(/(@[a-zA-Z0-9_-]+)/g, '<span class="text-indigo-400 font-bold">$1</span>');
      highlighted = highlighted.replace(/(\.[a-zA-Z0-9_-]+)/g, '<span class="text-emerald-400 font-medium">$1</span>');
      highlighted = highlighted.replace(/(--[a-zA-Z0-9_-]+)/g, '<span class="text-purple-400">$1</span>');
    } else {
      // TypeScript/ESM syntax highlights
      const keywords = [
        'import', 'export', 'default', 'const', 'let', 'var', 'from', 'as', 'function', 'return', 'class', 
        'interface', 'type', 'readonly', 'string', 'number', 'boolean', 'any', 'void', 'null', 'undefined',
        'true', 'false', 'if', 'else', 'for', 'while', 'await', 'async', 'try', 'catch', 'throw', 'new', 'then'
      ];
      
      const strings: string[] = [];
      highlighted = highlighted.replace(/(["'`])(.*?)\1/g, (match) => {
        strings.push(match);
        return `___STR_CODE_${strings.length - 1}___`;
      });
      
      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'g');
        highlighted = highlighted.replace(regex, `<span class="text-indigo-400 font-semibold">${keyword}</span>`);
      });

      highlighted = highlighted.replace(/(\/\/.*)/g, '<span class="text-neutral-500 italic">$1</span>');

      strings.forEach((str, i) => {
        highlighted = highlighted.replace(`___STR_CODE_${i}___`, `<span class="text-amber-300">${str}</span>`);
      });
    }

    return (
      <pre 
        className="font-mono text-xs text-slate-300 overflow-x-auto whitespace-pre leading-relaxed font-sans" 
        dangerouslySetInnerHTML={{ __html: highlighted }} 
      />
    );
  };

  const renderDirectoryTree = (nodes: FolderNode[], level: number = 0): React.ReactNode => {
    return (
      <div className="space-y-1">
        {nodes.map((node) => {
          const isFolder = node.type === 'folder';
          const isExpanded = !!expandedFolders[node.path];
          const paddingLeft = `${level * 12}px`;
          const isSelected = !isFolder && selectedFileKey === node.fileKey;

          return (
            <div key={node.path}>
              <div 
                onClick={() => {
                  if (isFolder) {
                    toggleFolder(node.path);
                  } else if (node.fileKey) {
                    setSelectedFileKey(node.fileKey);
                  }
                }}
                style={{ paddingLeft }}
                className={`flex items-center gap-2 py-1.5 px-2 rounded-lg text-xs cursor-pointer select-none transition-all ${
                  isFolder 
                    ? 'text-slate-300 hover:bg-slate-800/40 hover:text-white' 
                    : isSelected 
                      ? 'bg-emerald-500/10 text-emerald-300 font-bold border-l-2 border-emerald-500' 
                      : 'text-slate-400 hover:bg-slate-850/40 hover:text-slate-200'
                }`}
              >
                {isFolder ? (
                  <>
                    <span className="text-slate-500">
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </span>
                    <span className="text-emerald-500/80">
                      {isExpanded ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
                    </span>
                    <span className="font-mono tracking-tight font-medium">{node.name}</span>
                  </>
                ) : (
                  <>
                    <span className="w-3.5" />
                    <span className="text-slate-500">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                    </span>
                    <span className="font-mono tracking-tight">{node.name}</span>
                  </>
                )}
              </div>

              {isFolder && isExpanded && node.children && (
                <div className="mt-0.5">
                  {renderDirectoryTree(node.children, level + 1)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const selectedFile = BOILERPLATES[selectedFileKey] || BOILERPLATES.root_layout;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LADO ESQUERDO: EXPLORADOR DE ARQUIVOS (col-span-4) */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        
        <div className="bg-slate-900/60 rounded-xl border border-slate-800/70 p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800/60 pb-2.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Estrutura de Pastas</span>
            <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-400 font-mono font-bold">
              Next.js 15
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mb-4 block leading-relaxed">
            Clique nos arquivos da árvore para carregar os códigos boilerplates e seus papéis na arquitetura.
          </p>
          
          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-900 overflow-y-auto max-h-[460px] custom-scrollbar">
            {renderDirectoryTree(NEXT_PROJECT_STRUCTURE)}
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/70 rounded-xl p-4 space-y-3 text-xs">
          <h4 className="font-bold text-slate-200 uppercase tracking-widest text-[10px] flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            Suporte a React 19 & Next 15
          </h4>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            O arquétipo foi construído usando o padrão mais recente do ecossistema Next.js 15 com React 19, pronto para rodar em servidores Edge da Vercel com máxima velocidade.
          </p>
          <div className="p-2.5 bg-slate-950/60 rounded-lg border border-emerald-900/30 text-[10px] text-emerald-400/90 font-mono flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            Sincronização reativa de cookie sessões
          </div>
        </div>

      </div>

      {/* LADO DIREITO: VISUALIZADOR DE CÓDIGO E CONCEITO (col-span-8) */}
      <div className="lg:col-span-8 flex flex-col gap-5">
        
        {/* SUB-MENU DIREITO MULTI_VIEW */}
        <div className="bg-slate-900/50 rounded-xl border border-slate-800/80 p-1.5 flex gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveNextTab('explorer')}
            className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all whitespace-nowrap text-center ${
              activeNextTab === 'explorer'
                ? 'bg-slate-800 border border-slate-700 text-emerald-400'
                : 'text-slate-400 hover:text-slate-250 hover:bg-slate-850/40'
            }`}
          >
            📁 Código Boilerplate
          </button>
          <button
            onClick={() => setActiveNextTab('providers')}
            className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all whitespace-nowrap text-center ${
              activeNextTab === 'providers'
                ? 'bg-slate-800 border border-slate-700 text-emerald-400'
                : 'text-slate-400 hover:text-slate-250 hover:bg-slate-850/40'
            }`}
          >
            ⚛️ Provedores Globais
          </button>
          <button
            onClick={() => setActiveNextTab('supabase_flow')}
            className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all whitespace-nowrap text-center ${
              activeNextTab === 'supabase_flow'
                ? 'bg-slate-800 border border-slate-700 text-emerald-400'
                : 'text-slate-400 hover:text-slate-250 hover:bg-slate-850/40'
            }`}
          >
            ⚙️ Supabase & Auth Flow
          </button>
          <button
            onClick={() => setActiveNextTab('theme_spec')}
            className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all whitespace-nowrap text-center ${
              activeNextTab === 'theme_spec'
                ? 'bg-slate-800 border border-slate-700 text-emerald-400'
                : 'text-slate-400 hover:text-slate-250 hover:bg-slate-850/40'
            }`}
          >
            🎨 Sistema de Temas (Zustand)
          </button>
        </div>

        {/* CONTAINER DINÂMICO DE SUB-ABAS */}
        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">
            
            {activeNextTab === 'explorer' && (
              <motion.div
                key="code-explorer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="bg-slate-900/40 rounded-xl border border-slate-850 p-4.5 relative overflow-hidden">
                  <div className="flex flex-wrap items-center gap-2 mb-2 border-b border-slate-800/40 pb-2">
                    <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/10 rounded font-mono text-[9px] text-indigo-400 font-bold uppercase">
                      Caminho do Arquivo
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-300">
                      {selectedFile.path}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {selectedFile.description}
                  </p>
                </div>

                <div className="bg-slate-950 rounded-xl border border-slate-850 overflow-hidden flex flex-col shadow-inner">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/70 border-b border-slate-850">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                      <span className="font-mono text-xs text-slate-400 ml-1.5">
                        {selectedFile.name}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedFile.code);
                        setCopiedCodeSuccess(true);
                        setTimeout(() => setCopiedCodeSuccess(false), 2000);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white transition-all text-xs font-medium"
                    >
                      {copiedCodeSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCodeSuccess ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>

                  <div className="p-4 bg-slate-950 overflow-x-auto h-[440px] custom-scrollbar">
                    {renderHighlightedCode(selectedFile.code, selectedFile.language)}
                  </div>
                </div>
              </motion.div>
            )}

            {activeNextTab === 'providers' && (
              <motion.div
                key="code-providers"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-slate-200">Visão Geral dos Provedores (providers.tsx)</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Sendo o Next.js 15 baseado primariamente em <strong>Server Components</strong> (rodando no servidor para garantir SEO e rapidez instantânea), o arquivo <code>layout.tsx</code> não pode instanciar ganchos client-side como cache do React Query ou controle de tema.
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Por isso, criamos o arquivo <code>@/app/providers.tsx</code> isolado e marcado com <code>"use client"</code> que agrupa as nossas instâncias seguras.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 bg-slate-950 border border-slate-850 rounded-lg space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-xs font-bold text-slate-200 font-mono">React Query v5 (TanStack)</h4>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Controla as conexões assíncronas de moradores (como estatísticas das vaquinhas e lista de palpites). Cacheia de forma automática e renova a cada minuto sem re-renderizar o layout todo.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-950 border border-slate-850 rounded-lg space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Database className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-xs font-bold text-slate-200 font-mono">Zustand Sincronizador</h4>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Injeta o listener do Supabase Client para guardar instantaneamente no store global de sessão as credenciais do morador lidas do header.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Guia de Seguranças no Render</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Exemplo de como renderizar Widgets de forma hydration-safe no Next 15 para evitar erros visuais:
                  </p>
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-900">
                    {renderHighlightedCode(`const [mounted, setMounted] = useState(false);
useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) return <SkeletonWidget />;`, 'typescript')}
                  </div>
                </div>
              </motion.div>
            )}

            {activeNextTab === 'supabase_flow' && (
              <motion.div
                key="code-supabase-flow"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    🛡️ Mecanismo do Supabase com Next.js 15 Cookie-Session
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Em arquiteturas convencionais, o token JWT do morador é salvo no LocalStorage, o que impede que o servidor Next.js saiba se ele está logado ou não ao renderizar a tela.
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    O arquétipo do **Rua do Hexa** resolve isso no padrão oficial do Supabase utilizando o Cookie-Based Session que propaga o token de forma segura entre as camadas:
                  </p>

                  <div className="space-y-3">
                    <div className="p-3.5 bg-slate-950/80 border border-slate-850 rounded-lg flex items-start gap-3">
                      <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] uppercase rounded font-bold font-mono">Client Client</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">Supabase Client Component Client</h4>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Utiliza os hooks no lado do cliente (Vite/Browser) para permitir que moradores executem login assíncrono, façam upload ou ouçam triggers reais de foguetes/gols.</p>
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-950/80 border border-slate-850 rounded-lg flex items-start gap-3">
                      <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] uppercase rounded font-bold font-mono">Server Client</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">Supabase Server Component Client</h4>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Usa a biblioteca <code>cookies()</code> síncrona do Next 15 no Edge para validar na hora se o morador é moderador antes do layout ser desenhado no servidor (Zero de flashes brancos na tela!).</p>
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-950/80 border border-slate-850 rounded-lg flex items-start gap-3">
                      <span className="px-2 py-0.5 bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[10px] uppercase rounded font-bold font-mono">Cookies Sync</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">Supabase Middleware Client Sincronizador</h4>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Sempre que o usuário navegar, se o token principal dele estiver prestes a expirar, o middleware renova silenciosamente a validade no cabeçalho HTTPS.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeNextTab === 'theme_spec' && (
              <motion.div
                key="code-theme"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                    <Palette className="w-5 h-5 text-emerald-400" />
                    Sistema Global de Temas (Zustand Persistent)
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    O gerenciador global de temas combina a simplicidade do Zustand com as classes CSS do Tailwind. O estado se autocontrola e se auto-persiste utilizando o middleware <code>persist</code> integrado para manter o tema do morador em visitas subsequentes.
                  </p>

                  <div className="p-4 bg-slate-950 rounded-lg border border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">Painel do Tema Ativo</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Altere o estado no Zustand para ver a mudança direta na visualização de amostras.</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSimulatedThemeState('dark')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          simulatedThemeState === 'dark'
                            ? 'bg-slate-800 text-white border-slate-650'
                            : 'bg-slate-900 text-slate-500 border-transparent hover:bg-slate-850'
                        }`}
                      >
                        🌙 Slate Dark
                      </button>
                      <button
                        onClick={() => setSimulatedThemeState('light')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          simulatedThemeState === 'light'
                            ? 'bg-slate-200 text-black border-slate-300'
                            : 'bg-slate-900 text-slate-500 border-transparent hover:bg-slate-850'
                        }`}
                      >
                        ☀️ Solar Light
                      </button>
                    </div>
                  </div>

                  {/* PREVIEW CONTAINER */}
                  <div className={`p-4 rounded-xl border transition-all duration-300 ${
                    simulatedThemeState === 'dark'
                      ? 'bg-slate-950 border-slate-805 text-slate-250'
                      : 'bg-white border-slate-200 text-slate-900 shadow-md'
                  }`}>
                    <div className="flex items-center justify-between mb-3 border-b pb-2 border-slate-200/10">
                      <span className="text-[9px] uppercase font-mono font-black tracking-wider text-emerald-500">Mural Comunitário</span>
                      <span className="text-[9px] text-slate-400 font-mono">Amor comunitário</span>
                    </div>
                    <h4 className="font-bold text-xs">Pintura do Calçadão Principal</h4>
                    <p className={`text-[11px] mt-1.5 leading-relaxed ${
                      simulatedThemeState === 'dark' ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      Iniciaremos no sábado, às 08h, a demarcação das faixas verde e amarela. Traga sua lata de tinta e sua família para colorirmos a nossa rua!
                    </p>
                    <div className="flex gap-2 mt-4">
                      <button className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold"> Confirmar presença </button>
                      <button className={`px-3 py-1 rounded text-[10px] font-bold border ${
                        simulatedThemeState === 'dark' 
                          ? 'bg-slate-905 border-slate-800 text-slate-300' 
                          : 'bg-slate-100 border-slate-200 text-slate-700'
                      }`}> Ver Lista </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
