import React, { useState, useEffect, useId } from "react";
import { 
  Bell, 
  X, 
  Trash2, 
  Volume2, 
  VolumeX, 
  Flame, 
  Calendar, 
  DollarSign, 
  MessageSquare, 
  Award, 
  Sparkles, 
  Play, 
  Database, 
  Radio, 
  Zap, 
  Wifi, 
  ArrowRight,
  ExternalLink,
  MessageCircle,
  Clock,
  Heart
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Tipos de notificações suportados
export type NotificationType = 
  | "novo_post" 
  | "novo_comenario" 
  | "novo_evento" 
  | "novo_jogo" 
  | "resultado_bolao" 
  | "meta_alcancada";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  metadata?: {
    user?: string;
    avatar?: string;
    targetId?: string;
    badgeValue?: string;
    linkView?: "album" | "social" | "eventos" | "arrecadacao";
  };
}

export type RealtimeLog = {
  id: string;
  timestamp: string;
  event: string;
  table: string;
  payload: string;
  status: "success" | "warning" | "info";
};

// Dados padrão preexistentes
const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "not-1",
    type: "meta_alcancada",
    title: "🎯 Meta da Vaquinha Alcançada!",
    description: "A arrecadação 'Tintas e Pinceis para a Rua Principal' atingiu 100%! R$ 1.500,00 arrecadados por 18 moradores.",
    timestamp: "Há 5 min",
    isRead: false,
    metadata: {
      badgeValue: "100%",
      linkView: "arrecadacao"
    }
  },
  {
    id: "not-2",
    type: "resultado_bolao",
    title: "🏆 Resultado do Bolão Calculado",
    description: "Bolão atualizado do jogo Amistoso Brasil 3x0 Espanha. Cláudio e Juliana gabaritaram o placar e subiram na tabela geral!",
    timestamp: "Há 15 min",
    isRead: false,
    metadata: {
      user: "Juliana Ferreira",
      linkView: "album"
    }
  },
  {
    id: "not-3",
    type: "novo_evento",
    title: "📅 Novo Evento Pré-Copa",
    description: "José Souza agendou: 'Grande Mutirão de Pintura do Meio-Fio' para Sábado às 08:30 na quadra 4.",
    timestamp: "Há 1 hora",
    isRead: true,
    metadata: {
      user: "José Souza",
      linkView: "eventos"
    }
  },
  {
    id: "not-4",
    type: "novo_comenario",
    title: "💬 Comentário no seu Story",
    description: "Orlando (Padaria) comentou no seu story: 'Vou doar 50 pães para o mutirão de pintura!'",
    timestamp: "Há 3 horas",
    isRead: true,
    metadata: {
      user: "Orlando (Padaria)",
      avatar: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?q=80&w=150",
      linkView: "social"
    }
  },
  {
    id: "not-5",
    type: "novo_post",
    title: "📸 Nova Publicação no Mural",
    description: "Larissa Moro postou: 'Olhem as bandeirinhas que fiz com retalho de TNT! Deu um trabalhão.'",
    timestamp: "Há 5 horas",
    isRead: true,
    metadata: {
      user: "Larissa Moro",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150",
      linkView: "social"
    }
  }
];

// Helper para emitir uma nova notificação em tempo real de qualquer lugar
export const triggerRealtimeNotification = (detail: Omit<NotificationItem, "id" | "timestamp" | "isRead">) => {
  const evt = new CustomEvent("new-realtime-notification", {
    detail: {
      ...detail,
      id: `not-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: "Agora mesmo",
      isRead: false
    }
  });
  window.dispatchEvent(evt);
};

// Síntese de som via Web Audio API para simulação perfeita do canal WebSocket
const playSoundPulse = (type: NotificationType) => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (type) {
      case "meta_alcancada":
        // Sucesso alegre: Triunfo / Dois beeps subindo rápidos
        osc.type = "triangle";
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.45);
        break;

      case "resultado_bolao":
        // Melodia de troféu
        osc.type = "sine";
        osc.frequency.setValueAtTime(659.25, now); // E5
        osc.frequency.setValueAtTime(523.25, now + 0.08); // C5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.35);
        break;

      case "novo_evento":
        // Beep duplo de agenda
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, now); // A4
        osc.frequency.setValueAtTime(440, now + 0.12); // A4
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.setValueAtTime(0.001, now + 0.08);
        gain.gain.setValueAtTime(0.05, now + 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.28);
        break;

      case "novo_jogo":
        // Apito esportivo curto
        osc.type = "square";
        osc.frequency.setValueAtTime(987.77, now); // B5
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.linearRampToValueAtTime(0.02, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.2);
        break;

      default:
        // Mensagem padrão / bolha de chat
        osc.type = "sine";
        osc.frequency.setValueAtTime(493.88, now); // B4
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.28);
        break;
    }
  } catch (err) {
    console.warn("Audio Context blocked, waiting for user click.", err);
  }
};

interface SystemProps {
  onNavigate: (view: "album" | "social" | "eventos" | "arrecadacao") => void;
  openNotifications: boolean;
  setOpenNotifications: (open: boolean) => void;
}

export default function RealtimeNotificationSystem({ onNavigate, openNotifications, setOpenNotifications }: SystemProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem("hexa-notifications");
    return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATIONS;
  });

  const [toasts, setToasts] = useState<NotificationItem[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [realtimeLogs, setRealtimeLogs] = useState<RealtimeLog[]>([]);

  // Salvar no localStorage
  useEffect(() => {
    localStorage.setItem("hexa-notifications", JSON.stringify(notifications));
  }, [notifications]);

  // Inicializar alguns logs ficticios de replicação do postgres
  useEffect(() => {
    const initLogs: RealtimeLog[] = [
      {
        id: "l-1",
        timestamp: new Date(Date.now() - 300000).toLocaleTimeString("pt-BR"),
        event: "INSERT",
        table: "public.arrecadacoes_transacoes",
        payload: '{"id":"t-401","arrecadacao_id":"arr-1","valor":150.00,"usuario":"Vicentino"}',
        status: "success"
      },
      {
        id: "l-2",
        timestamp: new Date(Date.now() - 150000).toLocaleTimeString("pt-BR"),
        event: "UPDATE",
        table: "public.historico_bolao",
        payload: '{"match_id":"m-10","calculated":true,"highest_points":10}',
        status: "info"
      }
    ];
    setRealtimeLogs(initLogs);
  }, []);

  // Escutar eventos customizados de notificação
  useEffect(() => {
    const handleNewNotification = (e: Event) => {
      const customEvent = e as CustomEvent<NotificationItem>;
      const newNotif = customEvent.detail;

      // Adiciona na coleção
      setNotifications(prev => [newNotif, ...prev]);

      // Adiciona nos Toasts ativos na tela
      setToasts(prev => [...prev, newNotif]);

      // Tocar som de notificação
      if (soundEnabled) {
        playSoundPulse(newNotif.type);
      }

      // Adiciona no terminal de logs em tempo real
      const wsTime = new Date().toLocaleTimeString("pt-BR");
      let dmlEvent = "INSERT";
      let dblTable = "public.notificacoes";
      
      if (newNotif.type === "novo_post") {
        dmlEvent = "INSERT";
        dblTable = "public.posts";
      } else if (newNotif.type === "novo_comenario") {
        dmlEvent = "INSERT";
        dblTable = "public.comentarios";
      } else if (newNotif.type === "novo_evento") {
        dmlEvent = "INSERT";
        dblTable = "public.eventos";
      } else if (newNotif.type === "novo_jogo") {
        dmlEvent = "INSERT";
        dblTable = "public.jogos_copa";
      } else if (newNotif.type === "resultado_bolao") {
        dmlEvent = "UPDATE";
        dblTable = "public.bolao_palpites";
      } else if (newNotif.type === "meta_alcancada") {
        dmlEvent = "UPDATE";
        dblTable = "public.arrecadacoes";
      }

      const logPayload = JSON.stringify({
        id: newNotif.id,
        type: newNotif.type,
        title: newNotif.title,
        triggered_by: newNotif.metadata?.user || "System Realtime Signal",
        at: new Date().toISOString()
      });

      const newLog: RealtimeLog = {
        id: `log-${Date.now()}`,
        timestamp: wsTime,
        event: dmlEvent,
        table: dblTable,
        payload: logPayload,
        status: newNotif.type === "meta_alcancada" || newNotif.type === "resultado_bolao" ? "success" : "info"
      };

      setRealtimeLogs(prev => [newLog, ...prev.slice(0, 19)]);

      // Auto-remover Toast depois de 5 segundos
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newNotif.id));
      }, 5000);
    };

    window.addEventListener("new-realtime-notification", handleNewNotification);
    return () => {
      window.removeEventListener("new-realtime-notification", handleNewNotification);
    };
  }, [soundEnabled]);

  // Contadores
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Marcar todas lidas
  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  // Limpar histórico
  const clearAll = () => {
    setNotifications([]);
  };

  // Clique em uma notificação individual
  const handleNotifClick = (item: NotificationItem) => {
    // Marcar como lida
    setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, isRead: true } : n));
    
    // Direcionar se tiver linkView
    if (item.metadata?.linkView) {
      onNavigate(item.metadata.linkView);
      setOpenNotifications(false);
    }
  };

  // Remover Toast prematuramente
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Estilos de ícone por tipo de notificação
  const getNotificationIconDetails = (type: NotificationType) => {
    switch (type) {
      case "novo_post":
        return {
          icon: Sparkles,
          color: "text-blue-400 bg-blue-500/15 border-blue-500/30",
          label: "Novo Post"
        };
      case "novo_comenario":
        return {
          icon: MessageSquare,
          color: "text-pink-400 bg-pink-500/15 border-pink-500/30",
          label: "Novo Comentário"
        };
      case "novo_evento":
        return {
          icon: Calendar,
          color: "text-amber-400 bg-amber-500/15 border-amber-500/30",
          label: "Novo Evento"
        };
      case "novo_jogo":
        return {
          icon: Flame,
          color: "text-yellow-400 bg-yellow-500/15 border-yellow-500/30",
          label: "Copa & Jogo"
        };
      case "resultado_bolao":
        return {
          icon: Award,
          color: "text-purple-400 bg-purple-500/15 border-purple-500/30",
          label: "Resultado Bolão"
        };
      case "meta_alcancada":
        return {
          icon: DollarSign,
          color: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
          label: "Meta Sucesso"
        };
    }
  };

  // Simuladores de eventos em tempo real para a comunidade
  const triggerSimulator = (type: NotificationType) => {
    const mockUsers = [
      "Cláudio Silva (Casa 14)",
      "Marina Santos (Casa 9)",
      "Juliana Ferreira (Casa 82)",
      "Mendonça (Síndico)",
      "Larissa Moro (Casa 12)",
      "Orlando (Padaria)",
      "Marcio Alencar (Casa 3)"
    ];
    
    const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];

    let detail: Omit<NotificationItem, "id" | "timestamp" | "isRead">;

    switch (type) {
      case "novo_post":
        const postCaptions = [
          "Coloquei as luzes pisca-pisca na minha varanda, ficou maravilhoso! 💡🇧🇷",
          "Acabamos de pintar a entrada do quarteirão de verde e amarelo!",
          "Bolão oficial tá liberado! Deixei o link na bio.",
          "Cuidado ao passar de moto, tinta do asfalto ainda está secando na altura da padaria! ⚠️"
        ];
        detail = {
          type,
          title: "📸 Nova Publicação no Mural da Geral",
          description: `${randomUser} publicou: "${postCaptions[Math.floor(Math.random() * postCaptions.length)]}"`,
          metadata: {
            user: randomUser,
            linkView: "social"
          }
        };
        break;

      case "novo_comenario":
        const comments = [
          "Sensacional! Vocês têm muita criatividade!",
          "Bora organizar outro mutirão no próximo domingo!",
          "Essa copa vai ser inesquecível no nosso bairro!",
          "Caraca, ficou sensacional o resultado!"
        ];
        detail = {
          type,
          title: "💬 Novo Comentário Comunitário",
          description: `${randomUser} comentou: "${comments[Math.floor(Math.random() * comments.length)]}"`,
          metadata: {
            user: randomUser,
            linkView: "social"
          }
        };
        break;

      case "novo_evento":
        const eventsNames = [
          "Almoço de Confraternização com Pagode",
          "Mutirão: Pintura de Bandeironhas Gigante",
          "Reunião Geral: Rateio dos Rojões Ecológicos",
          "Treino de Gritos de Torcida da Rua do Hexa"
        ];
        const randomEvName = eventsNames[Math.floor(Math.random() * eventsNames.length)];
        detail = {
          type,
          title: "📅 Novo Evento Agendado",
          description: `${randomUser} criou um novo evento: "${randomEvName}". Acesse os detalhes e confirme sua presença!`,
          metadata: {
            user: randomUser,
            linkView: "eventos"
          }
        };
        break;

      case "novo_jogo":
        const matchOpponent = ["Croácia 🇭🇷", "Suíça 🇨🇭", "Camarões 🇨🇲", "Coreia do Sul 🇰🇷", "França 🇫🇷"][Math.floor(Math.random() * 5)];
        detail = {
          type,
          title: "⚽ Novo Jogo Cadastrado no Calendário",
          description: `O jogo Brasil x ${matchOpponent} foi cadastrado! Dê o seu palpite no álbum antes do pontapé inicial.`,
          metadata: {
            badgeValue: "COPA 2026",
            linkView: "album"
          }
        };
        break;

      case "resultado_bolao":
        const score1 = Math.floor(Math.random() * 4);
        const score2 = Math.floor(Math.random() * 2);
        detail = {
          type,
          title: "🏆 Resultado do Bolão Processado",
          description: `Placar final Brasil ${score1}x${score2} Adversário! As pontuações foram computadas. Veja sua posição no ranking!`,
          metadata: {
            linkView: "album"
          }
        };
        break;

      case "meta_alcancada":
        const projectVault = [
          "Bandeirinhas de Plástico para Todo Quarteirão",
          "Fogos de Artifício Silenciosos",
          "Telão de LED e Cabos HDMI",
          "Aluguel dos Pula-pulas para as crianças"
        ];
        const randomVault = projectVault[Math.floor(Math.random() * projectVault.length)];
        const amount = [800, 1200, 2500, 3200][Math.floor(Math.random() * 4)];
        detail = {
          type,
          title: "🎯 Meta de Decoração Batida!",
          description: `A vaquinha comunitária "${randomVault}" bateu 100%! Foram arrecadados R$ ${amount},00. Muito obrigado aos contribuintes!`,
          metadata: {
            badgeValue: "100%",
            linkView: "arrecadacao"
          }
        };
        break;
    }

    triggerRealtimeNotification(detail);
  };

  return (
    <>
      {/* 1. CONTAINER DE TOASTS REALTIME FLUTUANTES (Sempre no canto superior direito) */}
      <div 
        className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none"
        id="realtime-toast-manager"
      >
        <AnimatePresence>
          {toasts.map((toast) => {
            const currentDetails = getNotificationIconDetails(toast.type);
            const Icon = currentDetails.icon;

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 200, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.9, y: -20 }}
                transition={{ type: "spring", damping: 15 }}
                className="pointer-events-auto bg-slate-900/95 backdrop-blur-md rounded-xl p-4 border border-emerald-500/40 shadow-2xl shadow-emerald-950/40 flex gap-3 relative overflow-hidden"
              >
                {/* Linha decorativa verde/amarela lateral */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brasil-green via-emerald-500 to-brasil-yellow" />

                <div className={`p-2 h-fit rounded-lg border flex-shrink-0 ${currentDetails.color}`}>
                  <Icon className="w-5 h-5 animate-pulse" />
                </div>

                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono">
                      🔴 REALTIME
                    </span>
                    <span className="text-slate-500 text-[10px]">•</span>
                    <span className="text-slate-400 text-[10px]">Agora</span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-100 font-sans tracking-tight mt-0.5 max-w-full truncate">
                    {toast.title}
                  </h3>
                  <p className="text-[11px] text-slate-350 leading-relaxed mt-1">
                    {toast.description}
                  </p>

                  <div className="mt-2.5 flex items-center gap-2">
                    {toast.metadata?.linkView && (
                      <button
                        onClick={() => handleNotifClick(toast)}
                        className="text-[10px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold transition-all border border-slate-700/50 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Visualizar Canal</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={() => removeToast(toast.id)}
                      className="text-[10px] px-2 py-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
                    >
                      Dispensar
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => removeToast(toast.id)}
                  className="absolute top-3 right-3 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* 2. DRAWER COMPLETO DA CENTRAL DE NOTIFICAÇÕES (Mural Realtime) */}
      <AnimatePresence>
        {openNotifications && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpenNotifications(false)}
              className="fixed inset-0 bg-slate-950/80 z-40 backdrop-blur-xs"
              id="notifications-backdrop"
            />

            {/* Gaveta */}
            <motion.div
              initial={{ x: "100%", opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.5 }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed top-0 bottom-0 right-0 w-full max-w-lg bg-[#070d19]/98 border-l border-slate-800/80 shadow-2xl z-40 flex flex-col font-sans"
              id="notifications-sidebar-drawer"
            >
              {/* Cabeçalho da Gaveta */}
              <div className="p-5 border-b border-slate-800 bg-[#091122]/90 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                      <Bell className="w-5 h-5 text-emerald-400" />
                    </div>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-650 bg-red-500 px-1.5 py-0.5 text-[9px] font-black rounded-full text-white border border-[#070d19] animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-slate-100 uppercase tracking-wide">
                      Mural Live & Realtime
                    </h2>
                    <p className="text-[10px] text-slate-450 font-mono flex items-center gap-1 mt-0.5">
                      <Wifi className="w-3 h-3 text-emerald-400 animate-pulse" />
                      COPA_CONN_REPLICATION: ATIVA O.K.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Chave de som */}
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                      soundEnabled 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20" 
                        : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300"
                    }`}
                    title={soundEnabled ? "Mutar sons" : "Ativar sons"}
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => setOpenNotifications(false)}
                    className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* Sub-Header de Ações Rápidas */}
              <div className="px-4 py-2 bg-slate-900/30 border-b border-slate-850 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">
                  {notifications.length} Mensagens registradas
                </span>
                
                <div className="flex gap-3">
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllRead}
                      className="text-emerald-400 hover:text-emerald-300 font-bold transition-all text-[11px] cursor-pointer"
                    >
                      Marcar lidas
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button 
                      onClick={clearAll}
                      className="text-slate-400 hover:text-red-400 font-bold transition-all text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      Limpar
                    </button>
                  )}
                </div>
              </div>

              {/* ÁREA PRINCIPAL: GAVETA DIVIDIDA EM NOTIFICAÇÕES E SIMULADOR REALTIME */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                
                {/* BLOC 1: SIMULADOR REALTIME (Ponte entre UI de gincana e canal do Supabase) */}
                <div className="bg-gradient-to-br from-[#0c182d] to-[#040f21] rounded-xl border border-emerald-500/25 p-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-1 bg-emerald-500/10 border-l border-b border-emerald-500/20 text-[9px] font-mono text-emerald-400 font-black">
                    SIMULADOR DE EVENTOS
                  </div>

                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-yellow-400 animate-bounce" />
                    Console de Replicação Realtime
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Gere eventos simulados em tempo real de moradores para testar a reatividade de RLS, triggers e repasse via WebSocket instantaneamente!
                  </p>

                  {/* Grade de Emissores */}
                  <div className="grid grid-cols-2 xs:grid-cols-3 gap-2 mt-4">
                    <button
                      onClick={() => triggerSimulator("novo_post")}
                      className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-blue-500/40 text-left transition-all hover:bg-slate-850/80 cursor-pointer"
                    >
                      <div className="text-[10px] text-blue-400 font-bold flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" />
                        <span>Novo Post</span>
                      </div>
                      <div className="text-[9px] text-slate-500 mt-1 truncate">Mural da Geral</div>
                    </button>

                    <button
                      onClick={() => triggerSimulator("novo_comenario")}
                      className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-pink-500/40 text-left transition-all hover:bg-slate-850/80 cursor-pointer"
                    >
                      <div className="text-[10px] text-pink-400 font-bold flex items-center gap-1.5">
                        <MessageSquare className="w-3 h-3" />
                        <span>Comentário</span>
                      </div>
                      <div className="text-[9px] text-slate-500 mt-1 truncate">Resposta a post</div>
                    </button>

                    <button
                      onClick={() => triggerSimulator("novo_evento")}
                      className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 text-left transition-all hover:bg-slate-850/80 cursor-pointer"
                    >
                      <div className="text-[10px] text-amber-400 font-bold flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        <span>Novo Evento</span>
                      </div>
                      <div className="text-[9px] text-slate-500 mt-1 truncate">Gincana/Mutirão</div>
                    </button>

                    <button
                      onClick={() => triggerSimulator("novo_jogo")}
                      className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-yellow-500/40 text-left transition-all hover:bg-slate-850/80 cursor-pointer"
                    >
                      <div className="text-[10px] text-yellow-400 font-bold flex items-center gap-1.5">
                        <Flame className="w-3 h-3" />
                        <span>Novo Jogo</span>
                      </div>
                      <div className="text-[9px] text-slate-500 mt-1 truncate">Tabela da Copa</div>
                    </button>

                    <button
                      onClick={() => triggerSimulator("resultado_bolao")}
                      className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-purple-500/40 text-left transition-all hover:bg-slate-850/80 cursor-pointer"
                    >
                      <div className="text-[10px] text-purple-400 font-bold flex items-center gap-1.5">
                        <Award className="w-3 h-3" />
                        <span>Bolão</span>
                      </div>
                      <div className="text-[9px] text-slate-500 mt-1 truncate">Resultado calculado</div>
                    </button>

                    <button
                      onClick={() => triggerSimulator("meta_alcancada")}
                      className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 text-left transition-all hover:bg-slate-850/80 cursor-pointer"
                    >
                      <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1.5">
                        <DollarSign className="w-3 h-3" />
                        <span>Meta Batida</span>
                      </div>
                      <div className="text-[9px] text-slate-500 mt-1 truncate">Fundo de Financiamento</div>
                    </button>
                  </div>
                </div>

                {/* HISTÓRICO DE MENSAGENS NO MURAL */}
                <div className="space-y-2.5">
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                    Mensagens em Tempo Real ({notifications.length})
                  </h4>

                  {notifications.length === 0 ? (
                    <div className="text-center py-10 bg-slate-900/10 border border-slate-850 rounded-xl">
                      <Bell className="w-8 h-8 text-slate-600 mx-auto opacity-30 stroke-1" />
                      <p className="text-xs text-slate-500 mt-2">Nenhuma notificação gerada até o momento.</p>
                      <p className="text-[10px] text-emerald-555 text-emerald-500/70 mt-1 font-mono">Clique nos botões do simulador acima para disparar!</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {notifications.map((item) => {
                        const styleDetails = getNotificationIconDetails(item.type);
                        const Icon = styleDetails.icon;

                        return (
                          <div
                            key={item.id}
                            onClick={() => handleNotifClick(item)}
                            className={`p-3.5 rounded-xl border transition-all text-left flex gap-3 cursor-pointer group ${
                              item.isRead 
                                ? "bg-slate-900/30 border-slate-850/70 hover:bg-slate-900/60" 
                                : "bg-gradient-to-r from-emerald-950/20 to-slate-900 border-l-3 border-l-emerald-500 border-slate-800 shadow-md"
                            }`}
                          >
                            <div className={`p-1.5 h-fit rounded-lg border ${styleDetails.color}`}>
                              <Icon className="w-4 h-4" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                                  {styleDetails.label}
                                </span>
                                <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                                  <Clock className="w-3 h-3 text-slate-500" />
                                  {item.timestamp}
                                </span>
                              </div>
                              <h4 className="text-xs font-extrabold text-slate-200 mt-1 leading-snug group-hover:text-emerald-300 transition-colors">
                                {item.title}
                              </h4>
                              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                                {item.description}
                              </p>

                              {item.metadata?.linkView && (
                                <div className="mt-2 text-[10px] text-emerald-400 font-bold flex items-center gap-1 group-hover:underline">
                                  <span>Visualizar canal</span>
                                  <ExternalLink className="w-3 h-3" />
                                </div>
                              )}
                            </div>

                            {!item.isRead && (
                              <div className="w-2 h-2 rounded-full bg-emerald-450 bg-emerald-500 mt-1.5 shrink-0 animate-ping" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* LOGS DO WEBSOCKET REPLICATION CHANNEL */}
                <div className="bg-slate-950/80 rounded-xl border border-slate-850 p-4 font-mono">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 pb-2 border-b border-slate-850">
                    <span className="flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-blue-400" />
                      Postgres CDC (Replication Log)
                    </span>
                    <span className="px-1.5 py-0.5 bg-emerald-500/15 rounded text-emerald-450 text-[9px] animate-pulse">
                      CONNECTED
                    </span>
                  </div>

                  <p className="text-[10px] text-neutral-500 italic mt-2">
                    Visualizações das mensagens capturadas em tempo real pelo canal do Supabase...
                  </p>

                  <div className="space-y-3 mt-3 max-h-56 overflow-y-auto pr-1 text-[10px]">
                    {realtimeLogs.map((log) => (
                      <div key={log.id} className="p-2 bg-slate-950 border border-slate-900 rounded-lg space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-normal">{log.timestamp}</span>
                          <span className={`px-1 rounded text-[9px] font-bold ${
                            log.event === "INSERT" 
                              ? "bg-blue-500/15 text-blue-400" 
                              : "bg-amber-500/15 text-amber-400"
                          }`}>
                            {log.event}
                          </span>
                        </div>
                        <div className="text-emerald-400 font-semibold tracking-wide truncate">
                          {log.table}
                        </div>
                        <div className="text-neutral-400 break-all select-all hover:text-neutral-200">
                          {log.payload}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Rodapé da Gaveta */}
              <div className="p-4 border-t border-slate-850 bg-[#060c17] text-center text-[10px] text-slate-500 font-mono">
                RUA_DO_HEXA_SUPABASE_SYSTEM_V4.2 • CDC_REPLICA: TRUE
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
