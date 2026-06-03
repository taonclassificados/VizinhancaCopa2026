import React, { useState, useMemo } from "react";
import { 
  DollarSign, 
  Upload, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Copy, 
  Check, 
  TrendingUp, 
  Users, 
  Clock, 
  Plus, 
  FileSpreadsheet, 
  Eye, 
  HelpCircle, 
  Database,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  RefreshCw,
  FolderOpen,
  Filter,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { triggerRealtimeNotification } from "./RealtimeNotificationSystem";

// Interface dos tipos de dados
interface Campanha {
  id: string;
  nome: string;
  descricao: string;
  meta: number;
  arrecadado: number;
  categoria: "infra" | "festa" | "marketing";
}

interface Transacao {
  id: string;
  tipo: "entrada" | "saida";
  descricao: string;
  valor: number;
  data: string;
  usuario: string;
  status: "confirmado" | "pendente" | "rejeitado";
  comprovanteUrl?: string; // Simula o arquivo guardado no storage
  notaFiscalUrl?: string; // Simula a nota fiscal guardada no storage
  comprovanteNome?: string;
  notaFiscalNome?: string;
  campanhaId: string;
}

// Chaves Pix pré-definidas
const DEFAULT_PIX_KEYS = {
  cnpj: "12.345.678/0001-90",
  email: "hexa2026-ruas@copabairro.com.br",
  celular: "(11) 98765-4321"
};

export default function ArrecadacaoModule() {
  // Controle de perspectiva ("Morador" vs "Administrador")
  const [userRole, setUserRole] = useState<"morador" | "admin">("morador");
  
  // Lista de Campanhas Ativas (Meta Financeira)
  const [campanhas, setCampanhas] = useState<Campanha[]>([
    { id: "c1", nome: "Pintura do Asfalto e Postes", descricao: "Compra de galões de tinta verde e amarela de alta resistência para as ruas principais do bairro.", meta: 4500, arrecadado: 3850, categoria: "infra" },
    { id: "c2", nome: "Bandeiras e Enfeites Aéreos", descricao: "Barbantes de nylon, fitas de plástico verde/amarela e confecções de balões decorativos.", meta: 1800, arrecadado: 1210, categoria: "infra" },
    { id: "c3", nome: "Telão de LED Comunitário", descricao: "Aluguel de estrutura de som e painel LED de 4x3 metros para as datas de jogos oficiais do Brasil.", meta: 6000, arrecadado: 1800, categoria: "festa" },
    { id: "c4", nome: "Churrasco da Vitória (Estreia)", descricao: "Logística comunitária para fornecimento de carnes, refrigerantes e água no primeiro jogo.", meta: 2500, arrecadado: 2500, categoria: "festa" }
  ]);

  // Transações iniciais (Simula base do Supabase)
  const [transacoes, setTransacoes] = useState<Transacao[]>([
    { id: "t1", tipo: "entrada", descricao: "Doação Família Silva - Casa 42", valor: 150, data: "2026-06-01", usuario: "Cláudio Silva", status: "confirmado", comprovanteNome: "comprovante_silva_casa42.png", comprovanteUrl: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=600", campanhaId: "c1" },
    { id: "t2", tipo: "entrada", descricao: "Contribuição Condomínio Vista Verde", valor: 1000, data: "2026-06-01", usuario: "Marina Santos (Adm)", status: "confirmado", comprovanteNome: "comprovante_ted_vista_verde.pdf", comprovanteUrl: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=600", campanhaId: "c1" },
    { id: "t3", tipo: "saida", descricao: "Nota Fiscal #892 - Tintas Coral S/A", valor: 1250, data: "2026-05-28", usuario: "José Souza - Organizador", status: "confirmado", notaFiscalNome: "nf_coral_892_tintas.pdf", notaFiscalUrl: "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?q=80&w=600", campanhaId: "c1" },
    { id: "t4", tipo: "entrada", descricao: "Pix Moradora Casa 104", valor: 80, data: "2026-06-02", usuario: "Larissa Melo", status: "confirmado", comprovanteNome: "pix_larissa104.jpeg", comprovanteUrl: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=600", campanhaId: "c2" },
    { id: "t5", tipo: "entrada", descricao: "Apoio Comércio - Padaria do Hexa", valor: 500, data: "2026-06-02", usuario: "Orlando Dono Padaria", status: "pendente", comprovanteNome: "comprovante_padariahexa.png", comprovanteUrl: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=600", campanhaId: "c3" },
    { id: "t6", tipo: "saida", descricao: "Nota Fiscal #331 - Cabo Elétrico PP Flexível", valor: 280, data: "2026-06-01", usuario: "José Souza - Organizador", status: "confirmado", notaFiscalNome: "nf_ref_cabos.pdf", notaFiscalUrl: "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?q=80&w=600", campanhaId: "c2" }
  ]);

  // Estados dos formulários de Upload para Comprovantes (Morador)
  const [selectedCampanhaId, setSelectedCampanhaId] = useState<string>("c1");
  const [moradorNome, setMoradorNome] = useState<string>("");
  const [moradorValor, setMoradorValor] = useState<string>("");
  const [moradorComprovante, setMoradorComprovante] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [messageUpload, setMessageUpload] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Estados dos formulários de Despesas/Notas Fiscais (Admin)
  const [adminCampanhaId, setAdminCampanhaId] = useState<string>("c1");
  const [adminDespesaDesc, setAdminDespesaDesc] = useState<string>("");
  const [adminDespesaValor, setAdminDespesaValor] = useState<string>("");
  const [adminDespesaData, setAdminDespesaData] = useState<string>(new Date().toISOString().split('T')[0]);
  const [adminNotaFiscalFile, setAdminNotaFiscalFile] = useState<File | null>(null);
  const [adminIsUploading, setAdminIsUploading] = useState<boolean>(false);
  const [adminUploadProgress, setAdminUploadProgress] = useState<number>(0);
  const [adminMessage, setAdminMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filtro na prestação de contas
  const [filtroTipo, setFiltroTipo] = useState<"todos" | "entrada" | "saida">("todos");
  const [filtroCampanha, setFiltroCampanha] = useState<string>("todas");

  // Pix Pix-Key Ativa para Arrecadação
  const [currentPixKeyType, setCurrentPixKeyType] = useState<"cnpj" | "email" | "celular">("cnpj");
  const [copiedPixSuccess, setCopiedPixSuccess] = useState<boolean>(false);
  const [showQrCode, setShowQrCode] = useState<boolean>(true);

  // Visualizador de arquivos (Simulação do Supabase storage preview modal)
  const [previewFile, setPreviewFile] = useState<{ title: string; url: string; type: "comprovante" | "nota" } | null>(null);

  // Cópia Código código Pix Copia e Cola dinâmico adaptativo
  const currentPixKeyValue = DEFAULT_PIX_KEYS[currentPixKeyType];
  const simulatedPixString = `00020101021226370014br.gov.bcb.pix0118${currentPixKeyValue.replace(/[^a-zA-Z0-9@.-]/g, "")}5204000053039865407${moradorValor ? parseFloat(moradorValor).toFixed(2) : "10.00"}5802BR5915MoradoresDaRua6009SaoPaulo62070503***6304FC71`;

  // Cálculos matemáticos totais gerais
  const financeStats = useMemo(() => {
    const confirmadas = transacoes.filter(t => t.status === "confirmado");
    
    const entradas = confirmadas
      .filter(t => t.tipo === "entrada")
      .reduce((acc, curr) => acc + curr.valor, 0);
      
    const saidas = confirmadas
      .filter(t => t.tipo === "saida")
      .reduce((acc, curr) => acc + curr.valor, 0);

    const saldoDisponivel = entradas - saidas;
    const totalPrometidoPendente = transacoes
      .filter(t => t.status === "pendente" && t.tipo === "entrada")
      .reduce((acc, curr) => acc + curr.valor, 0);

    const metaTotalRua = campanhas.reduce((acc, curr) => acc + curr.meta, 0);
    const arrecadadoTotalRua = campanhas.reduce((acc, curr) => acc + curr.arrecadado, 0);
    const percentagemTotalRua = Math.min(Math.round((arrecadadoTotalRua / metaTotalRua) * 105), 100);

    return {
      entradas,
      saidas,
      saldoDisponivel,
      totalPrometidoPendente,
      metaTotalRua,
      arrecadadoTotalRua,
      percentagemTotalRua
    };
  }, [transacoes, campanhas]);

  // Transações fitradas para render
  const filteredTransacoes = useMemo(() => {
    return transacoes.filter(t => {
      const matchesTipo = filtroTipo === "todos" ? true : t.tipo === filtroTipo;
      const matchesCampanha = filtroCampanha === "todas" ? true : t.campanhaId === filtroCampanha;
      return matchesTipo && matchesCampanha;
    });
  }, [transacoes, filtroTipo, filtroCampanha]);

  // Handler de Simulação de Upload de Comprovante de Pix (Morador para o Supabase Bucket)
  const handleMoradorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!moradorNome || !moradorValor || !moradorComprovante) {
      setMessageUpload({ type: "error", text: "Alerta: Preencha o nome, o valor enviado por Pix e anexe o comprovante de transferência." });
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setMessageUpload(null);

    // Simula as chamadas de API do Supabase Storage
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const novaTransacao: Transacao = {
              id: `t_${Date.now()}`,
              tipo: "entrada",
              descricao: `Pix Morador - Casa do ${moradorNome}`,
              valor: parseFloat(moradorValor),
              data: new Date().toISOString().split('T')[0],
              usuario: moradorNome,
              status: "pendente",
              comprovanteNome: moradorComprovante.name,
              comprovanteUrl: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=600", // Placeholder no storage
              campanhaId: selectedCampanhaId
            };

            setTransacoes(prevTrans => [novaTransacao, ...prevTrans]);
            setIsUploading(false);
            setUploadProgress(0);
            setMessageUpload({ 
              type: "success", 
              text: `Sucesso! O comprovante "${moradorComprovante.name}" foi salvo com segurança no Supabase Storage (Bucket: receipts/). O comitê de moradores recebeu sua envio e validará nas próximas horas.` 
            });

            // Limpa form
            setMoradorNome("");
            setMoradorValor("");
            setMoradorComprovante(null);
          }, 600);
          return 100;
        }
        return prev + 30;
      });
    }, 200);
  };

  // Handler para criador de despesas / Notas Fiscais (Admin para o Supabase Bucket)
  const handleAdminDespesaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminDespesaDesc || !adminDespesaValor || !adminNotaFiscalFile) {
      setAdminMessage({ type: "error", text: "Alerta: Preencha a descrição, o valor da despesa e anexe o arquivo da nota fiscal de compra." });
      return;
    }

    setAdminIsUploading(true);
    setAdminUploadProgress(15);
    setAdminMessage(null);

    // Simula o fluxo do Supabase Storage para Bucket "invoices/"
    const interval = setInterval(() => {
      setAdminUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const despesaVal = parseFloat(adminDespesaValor);
            const novaTransacao: Transacao = {
              id: `t_${Date.now()}`,
              tipo: "saida",
              descricao: adminDespesaDesc,
              valor: despesaVal,
              data: adminDespesaData,
              usuario: "Comitê Organizador",
              status: "confirmado",
              notaFiscalNome: adminNotaFiscalFile.name,
              notaFiscalUrl: "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?q=80&w=600", // Imagem simulando arquivo
              campanhaId: adminCampanhaId
            };

            // Deduz os saldos arrecadados da campanha respectiva
            setCampanhas(prevCamps => prevCamps.map(c => {
              if (c.id === adminCampanhaId) {
                // Diminui o arrecadado se quisermos debitar, ou apenas registrar
                return { ...c, arrecadado: Math.max(c.arrecadado - despesaVal, 0) };
              }
              return c;
            }));

            setTransacoes(prevTrans => [novaTransacao, ...prevTrans]);
            setAdminIsUploading(false);
            setAdminUploadProgress(0);
            setAdminMessage({ 
              type: "success", 
              text: `Sucesso! Nota fiscal "${adminNotaFiscalFile.name}" salva com sucesso no Supabase Bucket: invoices/. Lançamento inserido no livro de prestação de contas.` 
            });

            // Limpa form
            setAdminDespesaDesc("");
            setAdminDespesaValor("");
            setAdminNotaFiscalFile(null);
          }, 600);
          return 100;
        }
        return prev + 25;
      });
    }, 180);
  };

  // Controle de aprovação/rejeição de comprovantes pendentes do Pix
  const handleAprovarContribuicao = (transId: string, aprovar: boolean) => {
    const t = transacoes.find(trans => trans.id === transId);
    if (!t) return;

    setTransacoes(prev => prev.map(trans => {
      if (trans.id === transId) {
        return { ...trans, status: aprovar ? "confirmado" : "rejeitado" };
      }
      return trans;
    }));

    if (aprovar) {
      // Soma o valor na campanha correspondente
      setCampanhas(prevCamps => prevCamps.map(c => {
        if (c.id === t.campanhaId) {
          const novoArrecadado = c.arrecadado + t.valor;
          
          // Se cruzou a linha da meta, notifica toda a comunidade em tempo real!
          if (novoArrecadado >= c.meta && c.arrecadado < c.meta) {
            triggerRealtimeNotification({
              type: "meta_alcancada",
              title: "🎯 Meta de Decoração Alcançada!",
              description: `A vaquinha comunitária "${c.titulo}" bateu 100%! R$ ${novoArrecadado.toLocaleString("pt-BR")},00 arrecadados. Parabéns, galera! 🥳🇧🇷`,
              metadata: {
                badgeValue: "100%",
                linkView: "arrecadacao"
              }
            });
          }
          
          return { ...c, arrecadado: novoArrecadado };
        }
        return c;
      }));
    }
  };

  const handleCopyPixString = () => {
    navigator.clipboard.writeText(simulatedPixString);
    setCopiedPixSuccess(true);
    setTimeout(() => {
      setCopiedPixSuccess(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER DE ARRECADAÇÃO COPA 2026 */}
      <div className="bg-gradient-to-br from-[#0b331d] via-[#0c1f19] to-[#0d2a45] border-2 border-emerald-500/40 p-6 rounded-2xl relative overflow-hidden shadow-2xl">
        {/* World Cup 2026 dynamic neon ambient colors */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-emerald-400 to-sky-500 pointer-events-none" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/15 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-yellow-400/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-60 h-60 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/10 text-yellow-300 text-xs font-black border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-yellow-300" />
              Módulo de Finanças Comunitárias • Copa do Mundo 2026
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white md:text-4xl drop-shadow-sm">
              ARRECADAÇÃO DA RUA ⚽💰
            </h1>
            <p className="text-sm text-slate-200 font-medium leading-relaxed">
              Arrecadação robusta acoplada com o <strong className="text-emerald-300">Supabase Postgres</strong> para persistência transacional e o <strong className="text-yellow-300">Supabase Storage</strong> para arquivos físicos de comprovantes bancários e Notas Fiscais das compras de enfeites.
            </p>
          </div>

          <div className="bg-slate-950/80 p-2 border border-slate-800 rounded-xl flex items-center gap-1 self-stretch md:self-auto shadow-inner">
            <button
              onClick={() => setUserRole("morador")}
              className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                userRole === "morador"
                  ? "bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/80"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Painel do Morador
            </button>
            <button
              onClick={() => setUserRole("admin")}
              className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                userRole === "admin"
                  ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              Painel Admin (Comitê)
            </button>
          </div>
        </div>

        {/* METACARDS FINANCEIROS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/60 relative z-10">
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-850">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Meta Total Estimada
            </span>
            <div className="text-lg md:text-xl font-black mt-1.5 text-white">
              R$ {financeStats.metaTotalRua.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Soma de todas as campanhas</p>
          </div>

          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-850">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" /> Confirmado Arrecadado
            </span>
            <div className="text-lg md:text-xl font-black mt-1.5 text-emerald-400">
              R$ {financeStats.arrecadadoTotalRua.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            {/* PROGRESS BAR */}
            <div className="w-full bg-slate-900 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-yellow-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${financeStats.percentagemTotalRua}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[9px] text-slate-500 mt-1">
              <span>{financeStats.percentagemTotalRua}% do geral</span>
              <span>Restam R$ {(financeStats.metaTotalRua - financeStats.arrecadadoTotalRua).toLocaleString("pt-BR")}</span>
            </div>
          </div>

          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-850">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5 text-red-400" /> Saldo em Caixa (Líquido)
            </span>
            <div className="text-lg md:text-xl font-black mt-1.5 text-slate-105">
              R$ {financeStats.saldoDisponivel.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              R$ {financeStats.entradas.toLocaleString("pt-BR")} arrecadado - R$ {financeStats.saidas.toLocaleString("pt-BR")} gasto
            </div>
          </div>

          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-850">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-yellow-400 animate-spin" style={{ animationDuration: "3s" }} /> Pix Sob Análise (Storage)
            </span>
            <div className="text-lg md:text-xl font-black mt-1.5 text-yellow-400">
              R$ {financeStats.totalPrometidoPendente.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              {transacoes.filter(t => t.status === "pendente").length} comprovantes esperando aprovação
            </p>
          </div>
        </div>
      </div>

      {/* GRADE DE RECURSOS DEPENDENDO DO PAPEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
        
        {/* LADO ESQUERDO: METAS FINANCEIRAS INTEGRADO (8 cols em desktop) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* PAINEL DO MORADOR: AREA PRINCIPAL DE DOACAO PIX */}
          {userRole === "morador" && (
            <div className="bg-slate-900/60 rounded-xl border border-slate-850 p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-400 bg-emerald-500/10 p-1 rounded" />
                    Como Contribuir com a sua Rua?
                  </h2>
                  <p className="text-xs text-slate-400">Facilidade via Pix Integrado. A sua ajuda se reverte em prêmios comunitários.</p>
                </div>
                <span className="text-[10px] bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded text-yellow-400 font-mono font-bold">
                  PIX Instantâneo
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* 1. SELETOR DE CHAVE PIX E QR CODE (col-6) */}
                <div className="md:col-span-6 bg-slate-950/60 p-4 border border-slate-850 rounded-lg flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block mb-1">
                      1. Escolha a Chave Pix da Rua
                    </span>
                    
                    <div className="flex gap-2.5">
                      {(["cnpj", "email", "celular"] as const).map(type => (
                        <button
                          key={type}
                          onClick={() => {
                            setCurrentPixKeyType(type);
                            setMessageUpload(null);
                          }}
                          className={`flex-1 py-1 px-2 border rounded text-xs font-mono font-medium transition-all ${
                            currentPixKeyType === type
                              ? "bg-emerald-500/10 border-emerald-500 text-emerald-300 font-bold"
                              : "bg-slate-900 border-slate-800 text-slate-450 hover:bg-slate-850"
                          }`}
                        >
                          {type.toUpperCase()}
                        </button>
                      ))}
                    </div>

                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex items-center justify-between gap-2.5">
                      <code className="text-xs font-mono font-bold text-emerald-300 break-all">{currentPixKeyValue}</code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(currentPixKeyValue);
                          setCopiedPixSuccess(true);
                          setTimeout(() => setCopiedPixSuccess(false), 2000);
                        }}
                        className="p-1 px-2 rounded bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-all text-[11px] font-mono flex items-center gap-1 shrink-0"
                      >
                        {copiedPixSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedPixSuccess ? 'Salvo' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>

                  {/* QR CODE GENERATOR EM TELA */}
                  {showQrCode && (
                    <div className="p-4 bg-white rounded-lg flex flex-col items-center justify-center space-y-2 border border-slate-800/20 max-w-[200px] mx-auto">
                      {/* Simulação gráfica pura de QR Code com CSS Grid */}
                      <div className="w-32 h-32 bg-slate-950 p-2.5 rounded relative grid grid-cols-5 gap-1 shadow-inner">
                        <div className="bg-emerald-500 rounded-sm"></div>
                        <div className="bg-white rounded-sm"></div>
                        <div className="bg-emerald-500 rounded-sm"></div>
                        <div className="bg-white rounded-sm"></div>
                        <div className="bg-emerald-500 rounded-sm"></div>

                        <div className="bg-white rounded-sm"></div>
                        <div className="bg-yellow-400 rounded-sm"></div>
                        <div className="bg-white rounded-sm"></div>
                        <div className="bg-yellow-400 rounded-sm"></div>
                        <div className="bg-white rounded-sm"></div>

                        <div className="bg-emerald-500 rounded-sm"></div>
                        <div className="bg-white rounded-sm"></div>
                        <div className="bg-slate-950 rounded-sm flex items-center justify-center p-0.5">
                          <span className="text-[7px] text-yellow-400 font-bold font-mono">2026</span>
                        </div>
                        <div className="bg-white rounded-sm"></div>
                        <div className="bg-yellow-400 rounded-sm"></div>

                        <div className="bg-white rounded-sm"></div>
                        <div className="bg-yellow-400 rounded-sm"></div>
                        <div className="bg-white rounded-sm"></div>
                        <div className="bg-white rounded-sm"></div>
                        <div className="bg-emerald-500 rounded-sm"></div>

                        <div className="bg-emerald-500 rounded-sm"></div>
                        <div className="bg-white rounded-sm"></div>
                        <div className="bg-emerald-500 rounded-sm"></div>
                        <div className="bg-white rounded-sm"></div>
                        <div className="bg-emerald-500 rounded-sm"></div>
                      </div>
                      <span className="text-[10px] text-slate-800 font-mono font-bold">QR Code Copa 2026</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <button
                      onClick={handleCopyPixString}
                      className="w-full py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-xs font-mono hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <Copy className="w-3.5 h-3.5 text-yellow-400" />
                      Copiar Código Pix Copia e Cola
                    </button>
                    <button
                      onClick={() => setShowQrCode(!showQrCode)}
                      className="w-full py-1 text-slate-500 hover:text-slate-400 text-[10px] text-center font-mono"
                    >
                      {showQrCode ? "Ocultar Código QR de leitura" : "Exibir Código QR de leitura"}
                    </button>
                  </div>
                </div>

                {/* 2. FORM DE ENVIO E UPLOAD EM SUPABASE STORAGE (col-6) */}
                <form onSubmit={handleMoradorSubmit} className="md:col-span-6 space-y-4 font-mono">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    2. Informe seu Depósito Realizado
                  </span>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Seu Nome / Casa / Quadra</label>
                    <input
                      type="text"
                      required
                      value={moradorNome}
                      onChange={(e) => setMoradorNome(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-emerald-500 text-slate-200"
                      placeholder="Ex: Carlos (Casa 12)"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Campanha Alvo</label>
                      <select
                        value={selectedCampanhaId}
                        onChange={(e) => setSelectedCampanhaId(e.target.value)}
                        className="w-full mt-1.5 px-2.5 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 focus:outline-none text-slate-350"
                      >
                        {campanhas.map(c => (
                          <option key={c.id} value={c.id} className="bg-slate-950 text-xs">
                            {c.nome.substring(0, 20)}...
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Valor Transferido</label>
                      <input
                        type="number"
                        required
                        min="1"
                        step="0.01"
                        value={moradorValor}
                        onChange={(e) => setMoradorValor(e.target.value)}
                        className="w-full mt-1.5 px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-emerald-500 text-slate-100"
                        placeholder="R$ 50,00"
                      />
                    </div>
                  </div>

                  {/* SUPABASE STORAGE UPLOADER */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 mb-1.5">
                      <Upload className="w-3.5 h-3.5 text-emerald-400" />
                      Anexar Comprovante (Supabase Storage)
                    </label>
                    
                    <div className="relative border border-dashed border-slate-800 hover:border-slate-700/80 rounded-lg p-3 bg-slate-950/80 transition-all text-center">
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        required
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setMoradorComprovante(e.target.files[0]);
                            setMessageUpload(null);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="space-y-1">
                        <FileText className="w-6 h-6 mx-auto text-slate-500" />
                        <div className="text-[11px] text-slate-300">
                          {moradorComprovante ? (
                            <span className="text-emerald-400 font-bold">{moradorComprovante.name}</span>
                          ) : (
                            <span>Selecione ou Arraste o arquivo</span>
                          )}
                        </div>
                        <p className="text-[9px] text-slate-550">JPG, PNG ou PDF até 5MB</p>
                      </div>
                    </div>
                  </div>

                  {/* BOTÃO SUBMIT COM PROGRESSO */}
                  <div className="space-y-1.5">
                    <button
                      type="submit"
                      disabled={isUploading}
                      className="w-full py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold text-xs hover:brightness-110 shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isUploading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Simulando Upload do Storage ({uploadProgress}%)</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>Enviar Comprovante de Transferência</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* MENSAGEM DO SIMULADOR DO STORAGE */}
              {messageUpload && (
                <div className={`p-3 rounded-lg text-xs leading-relaxed flex items-start gap-2.5 border ${
                  messageUpload.type === "success"
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                    : "bg-red-500/10 border-red-500/25 text-red-300"
                }`}>
                  {messageUpload.type === "success" ? (
                    <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                  )}
                  <p className="font-mono">{messageUpload.text}</p>
                </div>
              )}
            </div>
          )}

          {/* PAINEL ADMINISTRATIVO: GESTAO DE DESPESAS/NOTAS FISCAIS */}
          {userRole === "admin" && (
            <div className="bg-slate-900/60 rounded-xl border border-slate-850 p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <Database className="w-5 h-5 text-emerald-400 bg-emerald-500/10 p-1 rounded" />
                    Lançamento de Despesas Regulamentadas
                  </h2>
                  <p className="text-xs text-slate-400">Prestação de contas transparente exigindo notas fiscais anexadas no Supabase.</p>
                </div>
                <div className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded text-emerald-400 font-mono font-bold">
                  Bucket: invoices/
                </div>
              </div>

              {/* FORMULÁRIO DE GASTO DE DESPESA */}
              <form onSubmit={handleAdminDespesaSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-5 font-mono">
                
                <div className="md:col-span-4 space-y-3.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Finalidade do Compra (Campanha)</label>
                    <select
                      value={adminCampanhaId}
                      onChange={(e) => setAdminCampanhaId(e.target.value)}
                      className="w-full mt-1.5 px-2.5 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 focus:outline-none text-slate-350"
                    >
                      {campanhas.map(c => (
                        <option key={c.id} value={c.id} className="bg-slate-955 text-xs">
                          {c.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Valor Retirado de Caixa</label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="0.01"
                      value={adminDespesaValor}
                      onChange={(e) => setAdminDespesaValor(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-emerald-500 text-slate-100"
                      placeholder="Ex: R$ 1250,00"
                    />
                  </div>
                </div>

                <div className="md:col-span-4 space-y-3.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Item comprado / Empresa / NF #Num</label>
                    <input
                      type="text"
                      required
                      value={adminDespesaDesc}
                      onChange={(e) => setAdminDespesaDesc(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-emerald-500 text-slate-205"
                      placeholder="Ex: NF Coral - Tintas no Asfalto"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Data do Recibo/Nota</label>
                    <input
                      type="date"
                      required
                      value={adminDespesaData}
                      onChange={(e) => setAdminDespesaData(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 focus:outline-none text-slate-300"
                    />
                  </div>
                </div>

                <div className="md:col-span-4 flex flex-col justify-between space-y-3.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-yellow-500" />
                      Upload Nota Fiscal Física
                    </label>
                    
                    <div className="relative mt-1.5 border border-dashed border-slate-800 hover:border-slate-750 p-3 bg-slate-950 rounded-lg transition-all text-center">
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        required
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setAdminNotaFiscalFile(e.target.files[0]);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="space-y-1">
                        <Upload className="w-5 h-5 mx-auto text-slate-500" />
                        <span className="text-[10px] block text-slate-350">
                          {adminNotaFiscalFile ? (
                            <span className="text-yellow-405 font-bold">{adminNotaFiscalFile.name}</span>
                          ) : (
                            "Nota Fiscal PDF/Imagem"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={adminIsUploading}
                    className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {adminIsUploading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Fazendo Storage Upload ({adminUploadProgress}%)</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Cadastrar Despesa Oficial</span>
                      </>
                    )}
                  </button>
                </div>

              </form>

              {/* MENSAGEM DO SIMULADOR ADMIN */}
              {adminMessage && (
                <div className={`p-3 rounded-lg text-xs leading-relaxed flex items-start gap-2.5 border ${
                  adminMessage.type === "success"
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                    : "bg-red-500/10 border-red-500/25 text-red-300"
                }`}>
                  {adminMessage.type === "success" ? (
                    <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <p className="font-mono">{adminMessage.text}</p>
                </div>
              )}
            </div>
          )}

          {/* ATIVIDADES RECENTES E TRANSPARÊNCIA DE CONTAS */}
          <div className="bg-slate-900/60 rounded-xl border border-slate-850 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-md font-black uppercase text-white tracking-tight flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                  Transparência de Caixa / Prestação de Contas
                </h3>
                <p className="text-xs text-slate-400">Total rastreabilidade. Visualize ou valide comprovantes nos buckets do Supabase Storage.</p>
              </div>

              {/* FILTROS INTEGRADOS */}
              <div className="flex flex-wrap gap-2">
                
                {/* FILTRO TIPO */}
                <div className="flex bg-slate-950 p-1.5 border border-slate-800 rounded-lg gap-1">
                  {(["todos", "entrada", "saida"] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setFiltroTipo(type)}
                      className={`px-2 py-1 text-[10px] font-bold rounded capitalize transition-all ${
                        filtroTipo === type
                          ? "bg-slate-800 text-emerald-300"
                          : "text-slate-500 hover:text-slate-350"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {/* FILTRO CAMPANHA */}
                <select
                  value={filtroCampanha}
                  onChange={(e) => setFiltroCampanha(e.target.value)}
                  className="px-2 py-1.5 text-[10px] font-bold bg-slate-950 border border-slate-800 rounded-lg text-slate-400"
                >
                  <option value="todas">Campanha: Todas</option>
                  {campanhas.map(c => (
                    <option key={c.id} value={c.id}>{c.nome.substring(0, 16)}...</option>
                  ))}
                </select>

              </div>
            </div>

            {/* TABELA DE TRANSACÕES REALISTAS */}
            <div className="overflow-x-auto min-h-[250px] custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800/80 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-2.5">Data</th>
                    <th className="py-2.5">Descrição / Morador</th>
                    <th className="py-2.5 text-center">Tipo</th>
                    <th className="py-2.5 text-right">Valor</th>
                    <th className="py-2.5 text-center">Anexo Storage</th>
                    <th className="py-2.5 text-right">Ações / Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-slate-300">
                  {filteredTransacoes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-500">
                        Nenhum lançamento financeiro encontrado com os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredTransacoes.map(trans => {
                      const cName = campanhas.find(camp => camp.id === trans.campanhaId)?.nome || "Geral";
                      const isEntrada = trans.tipo === "entrada";
                      
                      return (
                        <tr key={trans.id} className="hover:bg-slate-850/20 transition-all font-mono">
                          <td className="py-3 text-slate-505">{trans.data}</td>
                          <td className="py-3">
                            <div className="font-bold text-slate-200">{trans.descricao}</div>
                            <div className="text-[9px] text-slate-500 font-mono mt-0.5 flex items-center gap-1.5">
                              <span>Setor: {cName}</span>
                              <span>•</span>
                              <span>Resp: {trans.usuario}</span>
                            </div>
                          </td>
                          <td className="py-3 text-center">
                            {isEntrada ? (
                              <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded text-[9px] font-bold">
                                Entrada
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 bg-red-400/10 text-red-400 border border-red-500/15 rounded text-[9px] font-bold">
                                Saída
                              </span>
                            )}
                          </td>
                          <td className={`py-3 text-right font-bold font-mono ${isEntrada ? "text-emerald-400" : "text-red-400"}`}>
                            {isEntrada ? "+" : "-"} R$ {trans.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 text-center">
                            {trans.comprovanteNome && (
                              <button
                                onClick={() => setPreviewFile({
                                  title: trans.descricao,
                                  url: trans.comprovanteUrl || "",
                                  type: "comprovante"
                                })}
                                className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-emerald-300 underline font-mono cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>{trans.comprovanteNome.substring(0, 10)}...</span>
                              </button>
                            )}
                            {trans.notaFiscalNome && (
                              <button
                                onClick={() => setPreviewFile({
                                  title: trans.descricao,
                                  url: trans.notaFiscalUrl || "",
                                  type: "nota"
                                })}
                                className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-yellow-300 underline font-mono cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-yellow-500" />
                                <span>{trans.notaFiscalNome.substring(0, 10)}...</span>
                              </button>
                            )}
                          </td>
                          <td className="py-3 text-right">
                            {/* SEÇÃO INATIVA FLUXO DE APROVAÇÕES PENDENTES PIX PARA ORGANIZADOR COMITE */}
                            {userRole === "admin" && trans.status === "pendente" ? (
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => handleAprovarContribuicao(trans.id, true)}
                                  className="p-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 hover:text-emerald-300 text-[10px] font-bold"
                                  title="Aprovar Pix no Supabase"
                                >
                                  Aprovar
                                </button>
                                <button
                                  onClick={() => handleAprovarContribuicao(trans.id, false)}
                                  className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 text-[10px] font-bold"
                                  title="Rejeitar Pix"
                                >
                                  Rejeitar
                                </button>
                              </div>
                            ) : (
                              <div className="flex justify-end items-center gap-1 font-sans font-bold text-[10px]">
                                {trans.status === "confirmado" ? (
                                  <span className="text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/10">
                                    <Check className="w-3 h-3" /> Auditado
                                  </span>
                                ) : trans.status === "rejeitado" ? (
                                  <span className="text-red-400 flex items-center gap-1 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/10">
                                    <XCircle className="w-3 h-3" /> Rejeitado
                                  </span>
                                ) : (
                                  <span className="text-yellow-450 flex items-center gap-1 bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/10">
                                    <Clock className="w-3 h-3 animate-pulse" /> Sob Análise
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>

        {/* LADO DIREITO: BARRA LATERAL (4 cols em desktop) Metas Financeiras Ativas & JS Snippet */}
        <div className="lg:col-span-4 space-y-6">

          {/* LISTA DAS METAS ATIVAS */}
          <div className="bg-slate-900/60 rounded-xl border border-slate-850 p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-350 uppercase tracking-widest font-mono flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Metas de Atividade Ativas
            </h3>
            
            <div className="space-y-3.5">
              {campanhas.map(camp => {
                const perc = Math.min(Math.round((camp.arrecadado / camp.meta) * 100), 120);
                return (
                  <div key={camp.id} className="p-3 bg-slate-950 border border-slate-850 rounded-lg space-y-2">
                    <div className="flex items-start justify-between gap-1.5">
                      <div>
                        <h4 className="font-bold text-xs text-slate-200">{camp.nome}</h4>
                        <p className="text-[10px] text-slate-450 mt-0.5 leading-relaxed">{camp.descricao}</p>
                      </div>
                      <span className={`text-[9px] font-mono px-1.5 rounded border shrink-0 font-bold ${
                        camp.categoria === "infra" 
                        ? "bg-sky-500/10 text-sky-400 border-sky-500/15" 
                        : "bg-purple-500/10 text-purple-400 border-purple-500/15"
                      }`}>
                        {camp.categoria}
                      </span>
                    </div>

                    {/* BARRA DE PROGRESSO UNITARIA */}
                    <div className="space-y-1">
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            perc >= 100 
                            ? "bg-emerald-500" 
                            : perc >= 50 
                              ? "bg-yellow-450" 
                              : "bg-amber-500"
                          }`}
                          style={{ width: `${Math.min(perc, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <div className="text-slate-400 font-bold">
                          R$ {camp.arrecadado.toLocaleString("pt-BR")} <span className="text-slate-550 font-normal">/ R$ {camp.meta.toLocaleString("pt-BR")}</span>
                        </div>
                        <span className={`font-black ${perc >= 100 ? "text-emerald-400" : "text-amber-400"}`}>{perc}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>



        </div>

      </div>

      {/* MODAL DE VISUALIZADOR DE ARQUIVO SIMULADO (Supabase Storage preview container) */}
      <AnimatePresence>
        {previewFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto"
            onClick={() => setPreviewFile(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-805 rounded-xl max-w-lg w-full overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800 font-mono text-xs text-slate-300">
                <span className="truncate pr-4 uppercase">
                  {previewFile.type === "comprovante" ? "📁 Comprovante" : "🧾 Nota Fiscal"} : {previewFile.title}
                </span>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="p-1 px-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-450 hover:text-white transition-all text-[11px] font-bold"
                >
                  X
                </button>
              </div>

              {/* SIMULAR ARQUIVO REAL QUE FOI RESGATADO POR URL PÚBLICA SUPABASE */}
              <div className="p-5 flex flex-col items-center justify-center space-y-4">
                <img
                  referrerPolicy="no-referrer"
                  src={previewFile.url}
                  alt={previewFile.title}
                  className="rounded-lg max-h-72 w-full object-cover border border-slate-800 shadow-inner"
                />
                
                <div className="space-y-2 text-center text-xs font-mono">
                  <p className="text-slate-400">
                    O arquivo acima foi obtido dinamicamente via link temporário gerado no Supabase Storage:
                  </p>
                  <code className="block p-2 bg-slate-950 rounded text-[9px] text-emerald-305 text-left break-all select-all font-mono leading-relaxed">
                    supabase.storage.from("rua-do-hexa-bucket").getPublicUrl("{previewFile.type === "comprovante" ? "receipts/" : "invoices/"}arquivo_comunitario.png")
                  </code>
                </div>
              </div>

              <div className="px-4 py-3 bg-slate-950/50 border-t border-slate-800 text-center">
                <button
                  onClick={() => setPreviewFile(null)}
                  className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all font-bold text-xs"
                >
                  Fechar Visualização
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
