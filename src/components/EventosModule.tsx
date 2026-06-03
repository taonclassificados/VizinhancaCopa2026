import React, { useState, useMemo, useEffect } from "react";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Bell, 
  Plus, 
  Check, 
  Sparkles, 
  Clock, 
  Map, 
  Flame, 
  Megaphone, 
  UserPlus, 
  UserMinus, 
  Database,
  ArrowRight,
  Info,
  Radio,
  Wifi,
  Trash2,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { triggerRealtimeNotification } from "./RealtimeNotificationSystem";

// Interfaces para os tipos de dados de Eventos e Notificações
interface Evento {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  hora: string;
  local: string;
  categoria: "mutirao" | "churrasco" | "assistir_jogos" | "reuniao";
  criador: string;
  participantes: string[]; // Lista de nomes de moradores cadastrados
  limiteParticipantes?: number;
}

interface NotificationItem {
  id: string;
  originalEventId?: string;
  mensagem: string;
  timestamp: string;
  tipo: "criacao" | "presenca" | "urgente";
  lido: boolean;
}

export default function EventosModule() {
  // Usuário ativo simulador no sistema (Morador ou Organizador)
  const [currentUser, setCurrentUser] = useState<string>("Carlos (Casa 12)");
  const [userRole, setUserRole] = useState<"morador" | "organizador">("morador");

  // Filtros de Eventos
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<"todos" | "mutirao" | "churrasco" | "assistir_jogos">("todos");

  // Lista Inicial de Eventos Comunitários
  const [eventos, setEventos] = useState<Evento[]>([
    {
      id: "e1",
      titulo: "Grande Mutirão de Pintura do Asfalto",
      descricao: "Vem pintar a faixa central e desenhar bandeirinhas verdes e amarelas no chão! Traga pincel e rolo se tiver. Forneceremos tintas, lanche e música boa.",
      data: "2026-06-06",
      hora: "08:00",
      local: "Entrada principal da Rua Alagoas, quadra 3",
      categoria: "mutirao",
      criador: "José Souza (Organizador)",
      participantes: ["Cláudio Silva", "Marina Santos", "Carlos (Casa 12)", "Carla Rezende", "Marcio Alencar"],
      limiteParticipantes: 30
    },
    {
      id: "e2",
      titulo: "Churrasco de Confraternização Pré-Copa",
      descricao: "Churrasco comunitário para afinar os tambores e torcida. Traga sua bebida e 1kg de carne para o cooler geral. Vamos organizar o bolão físico também.",
      data: "2026-06-07",
      hora: "13:00",
      local: "Área Gourmet do Bloco C",
      categoria: "churrasco",
      criador: "Mendonça (Sindico)",
      participantes: ["Larissa Melo", "Orlando Dono Padaria", "José Souza (Organizador)", "Juliana Ferreira"],
      limiteParticipantes: 50
    },
    {
      id: "e3",
      titulo: "Transmissão Oficial: Brasil x Croácia (Estreia)",
      descricao: "Inauguração do nosso telão de LED de 4x3 metros! Estaremos reunidos a partir das 13h com som profissional, área fechada para crianças, pipoca livre e fogos ecológicos.",
      data: "2026-06-12",
      hora: "14:30",
      local: "Estacionamento Central (Rua sem saída)",
      categoria: "assistir_jogos",
      criador: "Comitê do Hexa",
      participantes: ["Carlos (Casa 12)", "Cláudio Silva", "Marina Santos", "Juliana Ferreira", "Larissa Melo", "Marcio Alencar", "Carla Rezende"],
      limiteParticipantes: 120
    }
  ]);

  // Lista Central de Notificações Prontas (Realtime Activity Stream)
  const [notificacoes, setNotificacoes] = useState<NotificationItem[]>([
    {
      id: "n1",
      mensagem: "Mendonça criou o evento 'Churrasco de Confraternização Pré-Copa'",
      timestamp: "Há 10 minutos",
      tipo: "criacao",
      lido: false
    },
    {
      id: "n2",
      mensagem: "Larissa Melo confirmou presença no 'Churrasco de Confraternização Pré-Copa'",
      timestamp: "Há 8 minutos",
      tipo: "presenca",
      lido: false
    },
    {
      id: "n3",
      mensagem: "Carla Rezende acabou de confirmar presença no 'Grande Mutirão de Pintura do Asfalto'",
      timestamp: "Há 2 minutos",
      tipo: "presenca",
      lido: false
    }
  ]);

  // Logs do Supabase Realtime Channel
  const [realtimeLogs, setRealtimeLogs] = useState<{ id: string; msg: string; time: string }[]>([
    { id: "log1", msg: "Supabase Client conectado ao canal 'realtime:eventos'", time: "System OK" },
    { id: "log2", msg: "Subscrito na tabela 'event_attendees' com RLS ativo", time: "Listening" }
  ]);

  // Form de Criar Evento
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novaDescricao, setNovaDescricao] = useState("");
  const [novaData, setNovaData] = useState("");
  const [novaHora, setNovaHora] = useState("");
  const [novoLocal, setNovoLocal] = useState("");
  const [novaCategoria, setNovaCategoria] = useState<"mutirao" | "churrasco" | "assistir_jogos" | "reuniao">("mutirao");
  const [novoLimite, setNovoLimite] = useState<string>("");
  const [formSuccMsg, setFormSuccMsg] = useState<string | null>(null);

  // Status de Conexão Realtime
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(true);

  // Registrar logs simulando a escuta de websocket do Supabase
  const addRealtimeLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString("pt-BR");
    setRealtimeLogs(prev => [
      { id: `log_${Date.now()}`, msg: message, time: timestamp },
      ...prev.slice(0, 15) // Mantém apenas os últimos 15 logs
    ]);
  };

  // Cadastra Novo Evento (Envia para o Postgres do Supabase e espalha via Realtime)
  const handleCriarEvento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTitulo || !novaDescricao || !novaData || !novaHora || !novoLocal) {
      alert("Preencha todos os campos do evento comunitário!");
      return;
    }

    const novoEvento: Evento = {
      id: `e_${Date.now()}`,
      titulo: novoTitulo,
      descricao: novaDescricao,
      data: novaData,
      hora: novaHora,
      local: novoLocal,
      categoria: novaCategoria,
      criador: currentUser,
      participantes: [currentUser], // Criador é participante automático
      limiteParticipantes: novoLimite ? parseInt(novoLimite) : undefined
    };

    // 1. Atualiza estado local (Simula a persistência no Postgres)
    setEventos(prev => [novoEvento, ...prev]);

    // 2. Simula o evento Realtime disparado pelo Supabase trigger (INSERT)
    addRealtimeLog(`INSERT tabela 'eventos' [ID: ${novoEvento.id.substring(0, 6)}...] - ${novoEvento.titulo}`);

    // Adiciona Notificação global do WebSocket Realtime
    const novaNotif: NotificationItem = {
      id: `n_${Date.now()}`,
      originalEventId: novoEvento.id,
      mensagem: `${currentUser} organizou o evento: "${novoEvento.titulo}"`,
      timestamp: "Agora mesmo",
      tipo: "criacao",
      lido: false
    };
    setNotificacoes(prev => [novaNotif, ...prev]);

    // Dispara a Notificação Realtime Global
    triggerRealtimeNotification({
      type: "novo_evento",
      title: "📅 Novo Evento Pré-Copa",
      description: `${currentUser} agendou: "${novoEvento.titulo}" para ${novoEvento.data} às ${novoEvento.hora}`,
      metadata: {
        user: currentUser,
        linkView: "eventos"
      }
    });

    // Limpa formulário
    setNovoTitulo("");
    setNovaDescricao("");
    setNovaData("");
    setNovaHora("");
    setNovoLocal("");
    setNovoLimite("");
    setFormSuccMsg("Sucesso! Evento sincronizado em tempo real via Supabase Realtime para todos os moradores conectados!");
    
    setTimeout(() => {
      setFormSuccMsg(null);
    }, 4000);
  };

  // Simulação de confirmação instantânea de presença com broadcast realtime
  const handleTogglePresenca = (eventoId: string) => {
    const evento = eventos.find(ev => ev.id === eventoId);
    if (!evento) return;

    const jaConfirmado = evento.participantes.includes(currentUser);
    
    setEventos(prev => prev.map(ev => {
      if (ev.id === eventoId) {
        if (jaConfirmado) {
          return {
            ...ev,
            participantes: ev.participantes.filter(nome => nome !== currentUser)
          };
        } else {
          return {
            ...ev,
            participantes: [...ev.participantes, currentUser]
          };
        }
      }
      return ev;
    }));

    if (jaConfirmado) {
      // Log Realtime de UPDATE/DELETE participante
      addRealtimeLog(`DELETE na tabela 'event_attendees' [Morador: Carlos] desconfirmou presença`);
      
      const novaNotif: NotificationItem = {
        id: `n_${Date.now()}`,
        originalEventId: eventoId,
        mensagem: `${currentUser} cancelou sua confirmação na atividade "${evento.titulo}"`,
        timestamp: "Agora mesmo",
        tipo: "presenca",
        lido: false
      };
      setNotificacoes(prev => [novaNotif, ...prev]);
    } else {
      // Log Realtime de INSERT participante
      addRealtimeLog(`INSERT na tabela 'event_attendees' [Morador: Carlos] confirmou presença`);
      
      const novaNotif: NotificationItem = {
        id: `n_${Date.now()}`,
        originalEventId: eventoId,
        mensagem: `${currentUser} confirmou que vai no "${evento.titulo}"! 🎉`,
        timestamp: "Agora mesmo",
        tipo: "presenca",
        lido: false
      };
      setNotificacoes(prev => [novaNotif, ...prev]);
    }
  };

  const handleMarcarNotificacoesLidas = () => {
    setNotificacoes(prev => prev.map(n => ({ ...n, lido: true })));
  };

  const handleLimparNotificacoes = () => {
    setNotificacoes([]);
  };

  // Filtra eventos baseado na categoria ativa
  const filteredEventos = useMemo(() => {
    if (activeCategoryFilter === "todos") return eventos;
    return eventos.filter(ev => ev.categoria === activeCategoryFilter);
  }, [eventos, activeCategoryFilter]);

  // Contagem de Não Lidas
  const unreadNotifCount = useMemo(() => {
    return notificacoes.filter(n => !n.lido).length;
  }, [notificacoes]);

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      
      {/* HEADER PRINCIPAL */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-emerald-950/40 border border-emerald-500/20 p-6 rounded-2xl relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-semibold border border-emerald-500/25">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              Sincronização Ativa via Supabase Realtime
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
              Eventos & Gincanas da Copa 🏆📅
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Marque mutirões de pinturas de sarjetas, junte a vizinhança para o churrasco comunitário e organize transmissões nos dias de jogo do Brasil em tempo real.
            </p>
          </div>

          {/* SIMULADOR DE WEBSOCKET STATUS */}
          <div className="bg-slate-950/80 p-4 border border-slate-850 rounded-xl flex flex-col justify-center space-y-2 shrink-0 w-full lg:w-auto shadow-inner">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isRealtimeConnected ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                <span className="text-xs font-mono font-bold text-slate-300">Supabase Channel: Eventos</span>
              </div>
              <button 
                onClick={() => {
                  setIsRealtimeConnected(!isRealtimeConnected);
                  addRealtimeLog(isRealtimeConnected ? "Websocket fechado pelo usuário" : "Canal restabelecido via Supabase Channel Component Client");
                }}
                className={`p-1 px-2.5 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                  isRealtimeConnected 
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20" 
                    : "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                }`}
              >
                {isRealtimeConnected ? "Desconectar" : "Reconectar"}
              </button>
            </div>
            <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between">
              <span>Status: {isRealtimeConnected ? "ONLINE" : "OFFLINE"}</span>
              <span>Delay: ~2ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* GRADE CENTRAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* COL-8: LISTAGEM DE EVENTOS PRINCIPAIS */}
        <div className="lg:col-span-8 space-y-6">

          {/* FILTRO BAR */}
          <div className="bg-slate-900/60 rounded-xl border border-slate-850 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-400" />
              Linha do Tempo de Atividades
            </span>

            <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {[
                { id: "todos", label: "Todos", emoji: "📋" },
                { id: "mutirao", label: "Mutirões", emoji: "🎨" },
                { id: "churrasco", label: "Churrascos", emoji: "🔥" },
                { id: "assistir_jogos", label: "Jogos", emoji: "📺" }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryFilter(cat.id as any)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${
                    activeCategoryFilter === cat.id
                      ? "bg-slate-800 text-emerald-300 border border-slate-700/80"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span className="text-[11px]">{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* CARDS DE EVENTOS */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredEventos.map((evento) => {
                const jaConfirmado = evento.participantes.includes(currentUser);
                const isVagoesEsgotadas = evento.limiteParticipantes && evento.participantes.length >= evento.limiteParticipantes;

                return (
                  <motion.div
                    key={evento.id}
                    layoutId={evento.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`bg-slate-905/70 rounded-xl border p-5 relative overflow-hidden transition-all duration-350 shadow-md ${
                      jaConfirmado ? "border-emerald-500/30 bg-emerald-950/5" : "border-slate-850 hover:bg-slate-850/10"
                    }`}
                  >
                    {/* Badge da categoria decorosa */}
                    <div className="absolute top-4 right-4 flex items-center gap-1.5">
                      <span className="text-[9px] uppercase font-mono font-black tracking-wider px-2 py-0.5 rounded bg-slate-950 border border-slate-850 text-slate-400">
                        {evento.categoria === "mutirao" ? "🎨 Mutirão" :
                         evento.categoria === "churrasco" ? "🔥 Social" :
                         evento.categoria === "assistir_jogos" ? "📺 Transmissão" : "📋 Reunião"}
                      </span>
                    </div>

                    <div className="space-y-3 max-w-[90%] md:max-w-none">
                      <h3 className="text-lg font-black text-white hover:text-emerald-350 transition-colors uppercase">
                        {evento.titulo}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {evento.descricao}
                      </p>

                      {/* Info do local e hora */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-t border-b border-slate-800/40 text-xs font-mono text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Data: {new Date(evento.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                          <span>Horário: {evento.hora}h</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0 truncate" />
                          <span className="truncate">{evento.local}</span>
                        </div>
                      </div>

                      {/* Lista de presença e botão */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
                        
                        {/* Participantes em Avatares */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-bold text-slate-350 uppercase tracking-wide">
                              Confirmados ({evento.participantes.length}
                              {evento.limiteParticipantes ? ` / limite ${evento.limiteParticipantes}` : ""})
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                            {evento.participantes.map((p, index) => (
                              <span 
                                key={index} 
                                className={`px-2 py-0.5 rounded border ${
                                  p === currentUser 
                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold" 
                                    : "bg-slate-950/70 border-slate-850 text-slate-400"
                                }`}
                              >
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Botão para Confirmar */}
                        <button
                          onClick={() => {
                            if (!isRealtimeConnected) {
                              alert("Mecanismo offline. Reconecte o canal realtime para interagir.");
                              return;
                            }
                            handleTogglePresenca(evento.id);
                          }}
                          disabled={!jaConfirmado && isVagoesEsgotadas}
                          className={`py-2 md:py-2.5 px-4 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 font-mono ${
                            jaConfirmado
                              ? "bg-emerald-550/10 text-emerald-350 border border-emerald-500/25 hover:bg-emerald-500/15"
                              : isVagoesEsgotadas
                                ? "bg-slate-900 text-slate-600 border border-transparent cursor-not-allowed"
                                : "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:brightness-110 shadow-lg shadow-emerald-950/15"
                          }`}
                        >
                          {jaConfirmado ? (
                            <>
                              <UserMinus className="w-3.5 h-3.5" />
                              <span>Cancelar Presença</span>
                            </>
                          ) : isVagoesEsgotadas ? (
                            <span>Esgotado</span>
                          ) : (
                            <>
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>Confirmar Presença</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* SIMULADO DE REALTIME CONSOLE DE LOGS */}
          <div className="bg-slate-950 rounded-xl border border-slate-850 overflow-hidden shadow-inner font-mono">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-850">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  Postgres Realtime WebSocket Console
                </span>
              </div>
              <span className="text-[9px] text-slate-500 font-bold border border-slate-800 px-1 py-0.5 rounded">
                SUPABASE CDC
              </span>
            </div>

            <div className="p-3 bg-[#040912]/95 h-[160px] overflow-y-auto font-mono text-[10px] space-y-1 custom-scrollbar leading-relaxed">
              {realtimeLogs.map(log => (
                <div key={log.id} className="flex items-start gap-2.0 text-neutral-400 select-none">
                  <span className="text-slate-600 shrink-0">[{log.time}]</span>
                  <span className="text-emerald-450 shrink-0 font-bold">&gt;&gt;</span>
                  <span className="text-slate-300 break-all">{log.msg}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* COL-4: CRIAÇÃO DE EVENTO DA COPA E ATIVIDADE RECENTE DE NOTIFICAÇÕES */}
        <div className="lg:col-span-4 space-y-6">

          {/* BARRA DE NOTIFICAÇÕES REALTIME (ACTIVITY STREAM) */}
          <div className="bg-slate-900/60 rounded-xl border border-slate-850 p-4.5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <div className="flex items-center gap-1.5">
                <div className="relative">
                  <Bell className="w-4 h-4 text-emerald-450" />
                  {unreadNotifCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-450 rounded-full animate-ping" />
                  )}
                </div>
                <h4 className="text-xs font-black uppercase text-white font-mono tracking-wider flex items-center gap-1">
                  Atividade Recente
                  {unreadNotifCount > 0 && (
                    <span className="text-[9px] bg-yellow-405/10 text-yellow-400 border border-yellow-400/20 px-1 py-0.5 rounded">
                      {unreadNotifCount}
                    </span>
                  )}
                </h4>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleMarcarNotificacoesLidas}
                  className="text-[10px] text-slate-500 hover:text-emerald-400 cursor-pointer transition-colors"
                >
                  Marcar lidas
                </button>
                <span className="text-slate-800 text-[10px]">|</span>
                <button
                  onClick={handleLimparNotificacoes}
                  className="text-[10px] text-slate-500 hover:text-red-400 cursor-pointer transition-colors"
                >
                  Limpar
                </button>
              </div>
            </div>

            <div className="space-y-2.5 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
              <AnimatePresence mode="popLayout">
                {notificacoes.length === 0 ? (
                  <div className="text-center py-6 text-slate-600 text-xs font-mono">
                    Nenhuma atividade disparada no momento.
                  </div>
                ) : (
                  notificacoes.map((notif) => {
                    const isRead = notif.lido;
                    
                    return (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={`p-2.5 rounded-lg border text-[11px] leading-relaxed relative ${
                          isRead 
                            ? "bg-slate-950/30 border-slate-900 text-slate-450" 
                            : "bg-slate-950/80 border-slate-850 text-slate-200 shadow-sm"
                        }`}
                      >
                        {!isRead && (
                          <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                        )}
                        <p className="font-mono">{notif.mensagem}</p>
                        <span className="text-[9px] text-slate-650 block mt-1 font-mono">{notif.timestamp}</span>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
            
            <p className="text-[9px] text-slate-500 font-mono text-center leading-normal block">
              💡 As notificações chegam automaticamente na tela de todos os vizinhos usando Supabase Realtime Change Triggers no Postgres.
            </p>
          </div>

          {/* PAINEL DE NOVA ATIVIDADE (FORMULÁRIO DE GESTÃO ORGANIZADOR) */}
          <div className="bg-slate-900/60 rounded-xl border border-slate-850 p-5 space-y-4">
            <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1 text-emerald-440">
                <Plus className="w-4 h-4" /> Organizar Nova Atividade
              </h4>
              <span className="text-[9px] bg-slate-950 text-slate-500 border border-slate-850 px-1.5 py-0.5 rounded font-mono font-bold">
                POSTGRES
              </span>
            </div>

            <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
              Use o formulário abaixo para registrar gincanas, mutirões ou festas comunitárias.
            </p>

            <form onSubmit={handleCriarEvento} className="space-y-3 font-mono text-[11px]">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Título da Atividade</label>
                <input
                  type="text"
                  required
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 bg-slate-950 border border-slate-800 hover:border-slate-750 focus:outline-none focus:border-emerald-500 rounded-lg text-slate-200"
                  placeholder="Ex: Mutirão Pintura Meio-fio"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Descrição da Ação</label>
                <textarea
                  required
                  rows={2}
                  value={novaDescricao}
                  onChange={(e) => setNovaDescricao(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 bg-slate-950 border border-slate-800 hover:border-slate-755 focus:outline-none focus:border-emerald-500 rounded-lg text-slate-200 resize-none"
                  placeholder="Ex: Detalhes do que deve trazer..."
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Data Proposta</label>
                  <input
                    type="date"
                    required
                    value={novaData}
                    onChange={(e) => setNovaData(e.target.value)}
                    className="w-full mt-1.5 px-2.5 py-2 bg-slate-950 border border-slate-800 focus:outline-none text-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Horário</label>
                  <input
                    type="time"
                    required
                    value={novaHora}
                    onChange={(e) => setNovaHora(e.target.value)}
                    className="w-full mt-1.5 px-2.5 py-2 bg-slate-950 border border-slate-800 focus:outline-none text-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Local / Ponto de Encontro</label>
                <input
                  type="text"
                  required
                  value={novoLocal}
                  onChange={(e) => setNovoLocal(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 bg-slate-950 border border-slate-800 focus:outline-none focus:border-emerald-500 rounded-lg text-slate-200"
                  placeholder="Ex: Em frente à quadra 3"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Categoria</label>
                  <select
                    value={novaCategoria}
                    onChange={(e) => setNovaCategoria(e.target.value as any)}
                    className="w-full mt-1.5 px-2.5 py-2 bg-slate-950 border border-slate-800 text-slate-350 focus:outline-none rounded-lg"
                  >
                    <option value="mutirao">🎨 Mutirão</option>
                    <option value="churrasco">🔥 Social/Festa</option>
                    <option value="assistir_jogos">📺 Telão Jogo</option>
                    <option value="reuniao">📋 Reunião</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Vagas Máx. (Opcional)</label>
                  <input
                    type="number"
                    value={novoLimite}
                    onChange={(e) => setNovoLimite(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 bg-slate-950 border border-slate-800 focus:outline-none rounded-lg"
                    placeholder="Ex: 50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!isRealtimeConnected}
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-bold hover:brightness-105 transition-all text-white flex items-center justify-center gap-1.5 shadow-md disabled:opacity-40"
              >
                <Plus className="w-4 h-4 font-bold" />
                <span>Registrar no Supabase</span>
              </button>

              {formSuccMsg && (
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] rounded leading-normal font-mono animate-fade-in flex items-start gap-1">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{formSuccMsg}</span>
                </div>
              )}
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
