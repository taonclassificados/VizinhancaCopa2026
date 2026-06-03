import React, { useState, useMemo } from "react";
import { 
  Award, 
  Trophy, 
  Users, 
  Home, 
  User, 
  Star, 
  Sparkles, 
  Target, 
  Zap, 
  Flame, 
  Heart, 
  DollarSign, 
  MessageSquare, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle,
  Plus,
  RefreshCw,
  Bell,
  Lock,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { triggerRealtimeNotification } from "./RealtimeNotificationSystem";

// Interfaces dos rankings e conquistas
interface RankingIndividual {
  id: string;
  name: string;
  family: string;
  house: string;
  points: number;
  unlockedBadges: string[];
  pixCount: number;
  postsCount: number;
  bolaoPoints: number;
  eventsCount: number;
}

interface RankingFamilia {
  id: string;
  name: string;
  houses: string[];
  totalPoints: number;
  memberCount: number;
  badgeCount: number;
}

interface RankingCasa {
  id: string;
  houseNumber: string;
  family: string;
  totalPoints: number;
  pixPoints: number;
  socialPoints: number;
  eventPoints: number;
}

interface Conquista {
  id: string;
  title: string;
  description: string;
  pointsReward: number;
  iconName: "pix" | "post" | "family" | "bolao" | "fanatic";
  reqDescription: string;
}

export default function GamificacaoModule() {
  // --- DADOS PREDEFINIDOS ---
  
  // 1. Conquistas Estipuladas
  const CONQUISTAS: Conquista[] = [
    {
      id: "ac-pix",
      title: "🪙 Primeiro Pix",
      description: "Transferiu qualquer valor de vaquinha para a decoração da rua usando Pix.",
      pointsReward: 150,
      iconName: "pix",
      reqDescription: "Mínimo 1 transferência comprovada"
    },
    {
      id: "ac-post",
      title: "📸 Primeiro Post",
      description: "Postou uma foto ou vídeo registrando preparativos ou decoração no Álbum.",
      pointsReward: 100,
      iconName: "post",
      reqDescription: "Mínimo 1 postagem realizada"
    },
    {
      id: "ac-family",
      title: "👨‍👩‍👧‍👦 Família Destaque",
      description: "Concedido quando todos os moradores da mesma casa participam de pelo menos um evento.",
      pointsReward: 300,
      iconName: "family",
      reqDescription: "Participação unânime familiar"
    },
    {
      id: "ac-bolao",
      title: "👑 Rei do Bolão",
      description: "Gabaritou o placar de algum jogo da Copa 2026 no mural oficial.",
      pointsReward: 250,
      iconName: "bolao",
      reqDescription: "Acerto exato de placar"
    },
    {
      id: "ac-fanatic",
      title: "💚 Torcedor Fanático",
      description: "Engajamento completo: realizou Pix, assinou presença em 3 eventos e fez 3 postagens.",
      pointsReward: 500,
      iconName: "fanatic",
      reqDescription: "Completar trilha de engajamento"
    }
  ];

  // 2. Rankings Individuais Iniciais
  const [individuais, setIndividuais] = useState<RankingIndividual[]>([
    {
      id: "ind-1",
      name: "Carlos",
      family: "Moro",
      house: "Casa 12",
      points: 850,
      unlockedBadges: ["ac-pix", "ac-post"],
      pixCount: 3,
      postsCount: 2,
      bolaoPoints: 40,
      eventsCount: 1
    },
    {
      id: "ind-2",
      name: "Cláudio",
      family: "Silva",
      house: "Casa 14",
      points: 1100,
      unlockedBadges: ["ac-pix", "ac-post", "ac-bolao"],
      pixCount: 5,
      postsCount: 3,
      bolaoPoints: 95,
      eventsCount: 2
    },
    {
      id: "ind-3",
      name: "Juliana",
      family: "Ferreira",
      house: "Casa 82",
      points: 920,
      unlockedBadges: ["ac-pix", "ac-bolao"],
      pixCount: 2,
      postsCount: 0,
      bolaoPoints: 120,
      eventsCount: 1
    },
    {
      id: "ind-4",
      name: "José",
      family: "Souza",
      house: "Casa 45",
      points: 1250,
      unlockedBadges: ["ac-pix", "ac-post", "ac-family"],
      pixCount: 4,
      postsCount: 6,
      bolaoPoints: 30,
      eventsCount: 4
    },
    {
      id: "ind-5",
      name: "Larissa",
      family: "Moro",
      house: "Casa 12",
      points: 620,
      unlockedBadges: ["ac-post", "ac-family"],
      pixCount: 0,
      postsCount: 3,
      bolaoPoints: 10,
      eventsCount: 3
    },
    {
      id: "ind-6",
      name: "Orlando",
      family: "Souza",
      house: "Casa 45",
      points: 710,
      unlockedBadges: ["ac-pix", "ac-post"],
      pixCount: 8,
      postsCount: 1,
      bolaoPoints: 20,
      eventsCount: 1
    }
  ]);

  // --- MODELO DE CÁLCULO AUTOMÁTICO DE PONTOS ---
  // Cada Pix vale 100 ptos
  // Cada Post vale 75 ptos
  // Cada Palpite no Bolão vale 10 ptos + bônus de acerto
  // Cada presença em Evento comunitário vale 50 ptos
  // Adicionalmente, as conquistas (conquistas unlocked) garantem bônus específicos declarados em CONQUISTAS.
  
  // Estados para simular novas ações que re-calculam AUTOMATICAMENTE os totais e re-ordenam os Rankings
  const [simTargetUserId, setSimTargetUserId] = useState("ind-1");
  const [simActionType, setSimActionType] = useState<"pix" | "post" | "bolao_hit" | "event_join">("pix");
  const [customPixVal, setCustomPixVal] = useState(50);
  const [activeTab, setActiveTab] = useState<"casas" | "familias" | "individuais" | "conquistas">("casas");

  // Console do Realtime de Gamificação
  const [simulationLogs, setSimulationLogs] = useState<{id: string; text: string; time: string}[]>([
    { id: "g-1", text: "Motor de Cálculo Atômico recalculou score e atualizou RLS no Postgres", time: "00:01" },
    { id: "g-2", text: "Escutando alterações de pontos no canal 'public.ranking_scores'", time: "00:01" }
  ]);

  const addSimLog = (text: string) => {
    const clock = new Date().toLocaleTimeString("pt-BR");
    setSimulationLogs(prev => [{ id: `log-${Date.now()}`, text, time: clock }, ...prev.slice(0, 10)]);
  };

  // --- CÁLCULO DENSADO AUTOMÁTICO ---
  // Recalcular rankings de Casas e Famílias a partir dos dados consolidados de indivíduos
  
  // 1. Ranking de Casas
  const rankingCasasList = useMemo<RankingCasa[]>(() => {
    const casasMap = new Map<string, { family: string; pixPt: number; socialPt: number; evtPt: number; scoreBadges: number }>();

    individuais.forEach(ind => {
      const current = casasMap.get(ind.house) || { family: ind.family, pixPt: 0, socialPt: 0, evtPt: 0, scoreBadges: 0 };
      
      // Pontuações
      current.pixPt += ind.pixCount * 100;
      current.socialPt += ind.postsCount * 75 + ind.bolaoPoints;
      current.evtPt += ind.eventsCount * 50;

      // Badges bônus
      ind.unlockedBadges.forEach(badgeId => {
        const reward = CONQUISTAS.find(c => c.id === badgeId)?.pointsReward || 0;
        current.scoreBadges += reward;
      });

      casasMap.set(ind.house, current);
    });

    const list: RankingCasa[] = [];
    casasMap.forEach((val, key) => {
      list.push({
        id: `casa-${key}`,
        houseNumber: key,
        family: val.family,
        pixPoints: val.pixPt,
        socialPoints: val.socialPt,
        eventPoints: val.evtPt,
        totalPoints: val.pixPt + val.socialPt + val.evtPt + val.scoreBadges
      });
    });

    return list.sort((a, b) => b.totalPoints - a.totalPoints);
  }, [individuais]);

  // 2. Ranking de Famílias
  const rankingFamiliasList = useMemo<RankingFamilia[]>(() => {
    const famsMap = new Map<string, { houses: Set<string>; members: number; scoreSum: number; badgesSet: Set<string> }>();

    individuais.forEach(ind => {
      const current = famsMap.get(ind.family) || { houses: new Set<string>(), members: 0, scoreSum: 0, badgesSet: new Set<string>() };
      current.members += 1;
      current.houses.add(ind.house);
      
      // Totais calculados do indivíduo
      let indScoreBase = (ind.pixCount * 100) + (ind.postsCount * 75) + ind.bolaoPoints + (ind.eventsCount * 50);
      ind.unlockedBadges.forEach(bId => {
        const rew = CONQUISTAS.find(c => c.id === bId)?.pointsReward || 0;
        indScoreBase += rew;
        current.badgesSet.add(bId);
      });

      current.scoreSum += indScoreBase;
      famsMap.set(ind.family, current);
    });

    const list: RankingFamilia[] = [];
    famsMap.forEach((val, key) => {
      list.push({
        id: `fam-${key}`,
        name: key,
        houses: Array.from(val.houses),
        totalPoints: val.scoreSum,
        memberCount: val.members,
        badgeCount: val.badgesSet.size
      });
    });

    return list.sort((a, b) => b.totalPoints - a.totalPoints);
  }, [individuais]);

  // 3. Ranking Individual Ordenado
  const rankingIndividuaisList = useMemo<RankingIndividual[]>(() => {
    return individuais.map(ind => {
      let calcPoints = (ind.pixCount * 100) + (ind.postsCount * 75) + ind.bolaoPoints + (ind.eventsCount * 50);
      ind.unlockedBadges.forEach(bId => {
        const reward = CONQUISTAS.find(c => c.id === bId)?.pointsReward || 0;
        calcPoints += reward;
      });

      return {
        ...ind,
        points: calcPoints
      };
    }).sort((a, b) => b.points - a.points);
  }, [individuais]);

  // --- DISPATCHER DE SIMULAÇÃO DE ENGANJAMENTO ---
  const handleExecuteSimAction = (e: React.FormEvent) => {
    e.preventDefault();
    const userToUpdate = individuais.find(i => i.id === simTargetUserId);
    if (!userToUpdate) return;

    let logMessage = "";
    let systemNotificationTitle = "";
    let systemNotificationDesc = "";

    setIndividuais(prev => prev.map(ind => {
      if (ind.id === simTargetUserId) {
        let updated = { ...ind };

        if (simActionType === "pix") {
          updated.pixCount += 1;
          logMessage = `Carlos simulou: ${ind.name} realizou um envio via Pix de R$ ${customPixVal},00 para decoração da Copa.`;

          // Confere se desbloqueou "Primeiro Pix"
          if (!updated.unlockedBadges.includes("ac-pix")) {
            updated.unlockedBadges.push("ac-pix");
            systemNotificationTitle = `🏆 Conquista Alavancada: Primeiro Pix!`;
            systemNotificationDesc = `O morador ${ind.name} (${ind.house}) fez sua primeira doação via Pix e liberou +150 pontos!`;
          }
        } else if (simActionType === "post") {
          updated.postsCount += 1;
          logMessage = `Carlos simulou: ${ind.name} realizou uma nova postagem do mutirão no mural.`;
          
          // Confere se desbloqueou "Primeiro Post"
          if (!updated.unlockedBadges.includes("ac-post")) {
            updated.unlockedBadges.push("ac-post");
            systemNotificationTitle = `🏆 Conquista Alavancada: Primeiro Post!`;
            systemNotificationDesc = `O morador ${ind.name} (${ind.house}) compartilhou fotos inovadoras da decoração da rua.`;
          }

          // Confere se conquistou "Torcedor Fanático" (Pix, 3 posts, 3 eventos)
          if (updated.pixCount >= 1 && updated.postsCount >= 3 && updated.eventsCount >= 3 && !updated.unlockedBadges.includes("ac-fanatic")) {
            updated.unlockedBadges.push("ac-fanatic");
            systemNotificationTitle = `🏆 Conquista Máxima: Torcedor Fanático!`;
            systemNotificationDesc = `Incrível! ${ind.name} atingiu a maior trilha de pontuação da Rua do Hexa!`;
          }
        } else if (simActionType === "bolao_hit") {
          updated.bolaoPoints += 50; // Acerto de gabarito garante 50 pontos
          logMessage = `Carlos simulou: ${ind.name} gabaritou o placar da partida da seleção no bolão!`;

          if (!updated.unlockedBadges.includes("ac-bolao")) {
            updated.unlockedBadges.push("ac-bolao");
            systemNotificationTitle = `🏆 Conquista Alavancada: Rei do Bolão!`;
            systemNotificationDesc = `O profeta ${ind.name} gabaritou o placar exato do último jogo do Brasil!`;
          }
        } else if (simActionType === "event_join") {
          updated.eventsCount += 1;
          logMessage = `Carlos simulou: ${ind.name} assinou a lista de presença e participou ativamente no Mutirão.`;

          // Confere se conquistou "Torcedor Fanático" (Pix, 3 posts, 3 eventos)
          if (updated.pixCount >= 1 && updated.postsCount >= 3 && updated.eventsCount >= 3 && !updated.unlockedBadges.includes("ac-fanatic")) {
            updated.unlockedBadges.push("ac-fanatic");
            systemNotificationTitle = `🏆 Conquista Máxima: Torcedor Fanático!`;
            systemNotificationDesc = `Parabéns para ${ind.name}! Completou todas as ações possíveis de engajamento comunitário.`;
          }
        }

        return updated;
      }
      return ind;
    }));

    // Registra no Logger
    addSimLog(logMessage);
    addSimLog(`Tabela postgres 'ranking_scores' recalculada. Emissão via Websocket Realtime para a API.`);

    // Se houve nova conquista desbloqueada, dispara no WebSocket Realtime Global!
    if (systemNotificationTitle) {
      triggerRealtimeNotification({
        type: "resultado_bolao",
        title: systemNotificationTitle,
        description: systemNotificationDesc,
        metadata: {
          user: userToUpdate.name,
          linkView: "album"
        }
      });
      addSimLog(`🔑 [EMISSOR] Desbloqueio de insígnia disparou evento 'CONQUISTA_UNLOCKED' para toda a rede!`);
    } else {
      // Dispara alteração padrão de pontos
      triggerRealtimeNotification({
        type: "resultado_bolao",
        title: `⚡ Pontos de ${userToUpdate.name} Atualizados`,
        description: `${userToUpdate.name} ganhou mais pontos na gincana oficial da Copa 2026.`,
        metadata: {
          user: userToUpdate.name,
          linkView: "album"
        }
      });
    }
  };

  // Resetar simulação para dar graça e recarregar dados originais
  const handleResetGamification = () => {
    setIndividuais([
      {
        id: "ind-1",
        name: "Carlos",
        family: "Moro",
        house: "Casa 12",
        points: 850,
        unlockedBadges: ["ac-pix", "ac-post"],
        pixCount: 3,
        postsCount: 2,
        bolaoPoints: 40,
        eventsCount: 1
      },
      {
        id: "ind-2",
        name: "Cláudio",
        family: "Silva",
        house: "Casa 14",
        points: 1100,
        unlockedBadges: ["ac-pix", "ac-post", "ac-bolao"],
        pixCount: 5,
        postsCount: 3,
        bolaoPoints: 95,
        eventsCount: 2
      },
      {
        id: "ind-3",
        name: "Juliana",
        family: "Ferreira",
        house: "Casa 82",
        points: 920,
        unlockedBadges: ["ac-pix", "ac-bolao"],
        pixCount: 2,
        postsCount: 0,
        bolaoPoints: 120,
        eventsCount: 1
      },
      {
        id: "ind-4",
        name: "José",
        family: "Souza",
        house: "Casa 45",
        points: 1250,
        unlockedBadges: ["ac-pix", "ac-post", "ac-family"],
        pixCount: 4,
        postsCount: 6,
        bolaoPoints: 30,
        eventsCount: 4
      },
      {
        id: "ind-5",
        name: "Larissa",
        family: "Moro",
        house: "Casa 12",
        points: 620,
        unlockedBadges: ["ac-post", "ac-family"],
        pixCount: 0,
        postsCount: 3,
        bolaoPoints: 10,
        eventsCount: 3
      },
      {
        id: "ind-6",
        name: "Orlando",
        family: "Souza",
        house: "Casa 45",
        points: 710,
        unlockedBadges: ["ac-pix", "ac-post"],
        pixCount: 8,
        postsCount: 1,
        bolaoPoints: 20,
        eventsCount: 1
      }
    ]);
    addSimLog("Sincronização forçada: Todos os scores originais foram recarregados com sucesso.");
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans" id="gamificacao-root">
      
      {/* HEADER DE GAMIFICAÇÃO */}
      <div className="bg-gradient-to-r from-slate-900/60 via-[#13071f] to-slate-900/60 border border-purple-500/15 p-6 rounded-2xl relative overflow-hidden shadow-xl" id="gamificacao-header">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-yellow-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 text-purple-300 text-xs font-semibold border border-purple-500/20">
              <Trophy className="w-3.5 h-3.5 text-yellow-500" />
              Gincana Comunitária • Sistema de Gamificação
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
              RANKING & CONQUISTAS 🏆🏅
            </h1>
            <p className="text-sm text-slate-350 leading-relaxed font-sans">
              Engaje-se na decoração da nossa Rua do Hexa! Faça Pix, participe de mutirões, publique no mural comunitario e suba no placar geral. Qual casa/família vai levar o troféu?
            </p>
          </div>

          <div className="px-4 py-3 bg-slate-950/90 border border-slate-850 rounded-xl flex items-center justify-between gap-4 shadow-inner shrink-0" id="gamificacao-pill">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <Trophy className="w-8 h-8 text-yellow-405 fill-yellow-950 animate-bounce" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-mono">Prêmio Campeão</p>
                <span className="text-xs font-extrabold text-white">Churrasco comunitário</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PAINEL SUPERIOR: SIMULADOR DE ENGANJAMENTO COM CÁLCULO DENSADO AUTOMÁTICO */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-850 p-5 shadow-sm" id="score-simulator-section">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5 font-mono">
            <Zap className="w-4 h-4 text-yellow-400" />
            Simulador de Ações & Cálculo Automático
          </h3>
          <button 
            onClick={handleResetGamification}
            className="text-[10px] px-2 py-1 rounded bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white transition-all flex items-center gap-1 font-mono font-bold cursor-pointer"
            title="Recomeçar scores padrão"
          >
            <RefreshCw className="w-3 h-3" />
            Restaurar Padrões
          </button>
        </div>

        <form onSubmit={handleExecuteSimAction} className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end font-mono">
          
          {/* Seletor do Morador */}
          <div className="col-span-1 md:col-span-4 space-y-1.5 text-xs">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">1. Selecione o Morador</label>
            <select
              value={simTargetUserId}
              onChange={(e) => setSimTargetUserId(e.target.value)}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 focus:outline-none focus:border-purple-500 rounded text-slate-200"
              id="sim-user-select"
            >
              {individuais.map(i => (
                <option key={i.id} value={i.id}>{i.name} ({i.house} - Família {i.family})</option>
              ))}
            </select>
          </div>

          {/* Seletor da Ação */}
          <div className="col-span-1 md:col-span-4 space-y-1.5 text-xs">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">2. Ação Realizada no Banco de Dados</label>
            <select
              value={simActionType}
              onChange={(e) => setSimActionType(e.target.value as any)}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 focus:outline-none focus:border-purple-500 rounded text-slate-300"
              id="sim-action-select"
            >
              <option value="pix">Realizar Pix (+100 ptos)</option>
              <option value="post">Publicar mídia no Álbum (+75 ptos)</option>
              <option value="bolao_hit">Gabaritar Bolão Copa (+50 ptos)</option>
              <option value="event_join">Presença em Gincana / Evento (+50 ptos)</option>
            </select>
          </div>

          {/* Valor de Pix (só mostra se for Pix) */}
          <div className="col-span-1 md:col-span-2 space-y-1.5 text-xs">
            {simActionType === "pix" ? (
              <>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Valor Pix (R$)</label>
                <input 
                  type="number"
                  min={5}
                  value={customPixVal}
                  onChange={(e) => setCustomPixVal(Number(e.target.value))}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded focus:outline-none focus:border-purple-500 text-slate-200 text-center"
                />
              </>
            ) : (
              <div className="p-3 text-[10px] bg-slate-950 border border-dashed border-slate-850 rounded text-slate-500 text-center select-none">
                Score fixo por ação
              </div>
            )}
          </div>

          {/* Botão de Disparo */}
          <div className="col-span-1 md:col-span-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold text-xs rounded hover:brightness-110 transition-all flex items-center justify-center gap-1 shadow"
              id="btn-simulate-points"
            >
              <Plus className="w-4 h-4" />
              <span>Calcular Scores</span>
            </button>
          </div>

        </form>
      </div>

      {/* CORPO DE ABAS DO PLACAR GERAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="gamificacao-body-grid">
        
        {/* COLUNA ESQUERDA: LISTAGEM DAS ABAS DO RANKING (8 COLUNAS) */}
        <div className="lg:col-span-8 space-y-6" id="rankings-and-stats">
          
          {/* Seletor de Abas de Placar */}
          <div className="bg-slate-905/70 rounded-xl border border-slate-850 p-2.5 flex overflow-x-auto gap-2 custom-scrollbar" id="rankings-tabs">
            
            <button
              onClick={() => setActiveTab("casas")}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "casas"
                  ? "bg-purple-950/50 border border-purple-500/40 text-purple-300"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Home className="w-4 h-4" />
              Ranking das Casas
            </button>

            <button
              onClick={() => setActiveTab("familias")}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "familias"
                  ? "bg-purple-950/50 border border-purple-500/40 text-purple-300"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Users className="w-4 h-4" />
              Ranking das Famílias
            </button>

            <button
              onClick={() => setActiveTab("individuais")}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "individuais"
                  ? "bg-purple-950/50 border border-purple-500/40 text-purple-300"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <User className="w-4 h-4" />
              Ranking Individual
            </button>

            <button
              onClick={() => setActiveTab("conquistas")}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "conquistas"
                  ? "bg-purple-950/50 border border-purple-500/40 text-purple-300"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Award className="w-4 h-4" />
              Conquistas ({CONQUISTAS.length})
            </button>

          </div>

          {/* LISTANDO RANKING SELECIONADO */}
          <div className="bg-slate-905/70 rounded-xl border border-slate-850 p-5 shadow-md">
            
            <AnimatePresence mode="wait">
              
              {/* RANKING DAS CASAS */}
              {activeTab === "casas" && (
                <motion.div
                  key="tab-casas"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800/60">
                    <div>
                      <h4 className="text-xs font-bold font-mono uppercase text-slate-300">Tabela de Classificação das Residências</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Pontuação agregada por residência participante</p>
                    </div>
                    <span className="text-[10px] bg-purple-500/10 text-purple-400 p-1 rounded font-mono font-bold">CÁLCULO AUTOMÁTICO</span>
                  </div>

                  <div className="space-y-2.5">
                    {rankingCasasList.map((casa, index) => (
                      <div 
                        key={casa.id} 
                        className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                          index === 0 
                            ? "bg-gradient-to-r from-yellow-500/10 via-slate-950 to-slate-950 border-yellow-500/30 shadow-md"
                            : index === 1
                              ? "bg-gradient-to-r from-slate-400/10 via-slate-950 to-slate-950 border-slate-400/30"
                              : index === 2
                                ? "bg-gradient-to-r from-amber-700/10 via-slate-950 to-slate-950 border-amber-700/30"
                                : "bg-slate-950 border-slate-900"
                        }`}
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {/* Troféus e Posição */}
                          <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-bold font-mono text-sm shrink-0">
                            {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}º`}
                          </div>

                          <div className="truncate">
                            <h5 className="font-extrabold text-white text-sm font-sans flex items-center gap-1.5">
                              {casa.houseNumber}
                              <span className="text-[10px] font-mono font-medium text-slate-500">Família {casa.family}</span>
                            </h5>
                            
                            {/* Distribuição de Pontos */}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[9px] text-slate-500 mt-1">
                              <span className="flex items-center gap-1 text-emerald-450"><DollarSign className="w-3 h-3 text-emerald-400" /> Pix: {casa.pixPoints}</span>
                              <span className="flex items-center gap-1 text-purple-405"><MessageSquare className="w-3 h-3 text-purple-400" /> Mural/Social: {casa.socialPoints}</span>
                              <span className="flex items-center gap-1 text-yellow-455"><Calendar className="w-3 h-3 text-yellow-405" /> Eventos: {casa.eventPoints}</span>
                            </div>
                          </div>
                        </div>

                        {/* Total de Pontos */}
                        <div className="text-right shrink-0">
                          <span className="text-xs text-slate-400 font-mono block">Pontos totais</span>
                          <span className="text-sm font-black text-purple-300 font-mono">{casa.totalPoints} XP</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* RANKING DAS FAMÍLIAS */}
              {activeTab === "familias" && (
                <motion.div
                  key="tab-familias"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800/60 font-mono">
                    <div>
                      <h4 className="text-xs font-bold uppercase text-slate-300">Tabela Consolidada das Famílias</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-sans">Agrupamento dinâmico baseado nos sobrenomes de filiação de cadastro</p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {rankingFamiliasList.map((fam, index) => (
                      <div 
                        key={fam.id}
                        className="bg-slate-950/70 p-4 rounded-xl border border-slate-900 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {/* Posição */}
                          <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center font-bold font-mono text-sm shrink-0 border border-purple-500/10">
                            {index === 0 ? "🏆" : `${index + 1}º`}
                          </div>

                          <div>
                            <h5 className="font-extrabold text-white text-sm font-sans flex items-center gap-1.5">
                              Família {fam.name}
                            </h5>
                            <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono mt-1">
                              <span>🏡 {fam.houses.join(", ")}</span>
                              <span>•</span>
                              <span>👥 {fam.memberCount} integrantes ativos</span>
                              <span>•</span>
                              <span className="flex items-center gap-0.5 text-yellow-450"><Star className="w-3 h-3 text-yellow-405 fill-yellow-950" /> {fam.badgeCount} medalhas</span>
                            </div>
                          </div>
                        </div>

                        {/* Total de Pontos */}
                        <div className="text-right shrink-0">
                          <span className="text-xs text-slate-555 text-slate-500 font-mono block">Pontos somados</span>
                          <span className="text-sm font-black text-white font-mono">{fam.totalPoints} XP</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* RANKING INDIVIDUAL */}
              {activeTab === "individuais" && (
                <motion.div
                  key="tab-individuais"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800/60 font-mono">
                    <div>
                      <h4 className="text-xs font-bold uppercase text-slate-300">Tabela de Pontuação Individual</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-sans">Engajamento um a um nas ações de apoio ao Heptacampeonato</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-xs font-mono text-left select-none">
                      <thead>
                        <tr className="border-b border-slate-850 text-slate-500 uppercase tracking-wider text-[9px] font-bold">
                          <th className="py-2.5 px-3">Rank</th>
                          <th className="py-2.5 px-3">Morador</th>
                          <th className="py-2.5 px-3">Casa</th>
                          <th className="py-2.5 px-3 text-center">Pix doados</th>
                          <th className="py-2.5 px-3 text-center">Posts álbum</th>
                          <th className="py-2.5 px-3 text-center">Presenças</th>
                          <th className="py-2.5 px-3 text-right">XP Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900">
                        {rankingIndividuaisList.map((ind, index) => (
                          <tr key={ind.id} className="hover:bg-slate-900/40 transition-colors">
                            <td className="py-3 px-3">
                              <span className={`px-1.5 py-0.5 rounded font-black text-[10px] ${
                                index === 0 
                                  ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/25" 
                                  : index === 1 
                                    ? "bg-slate-400/10 text-slate-300 border border-slate-400/25" 
                                    : "text-slate-450 text-slate-400"
                              }`}>
                                {index + 1}º
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-100 font-sans">{ind.name}</span>
                                <span className="text-[9px] text-slate-500">({ind.family})</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-slate-400">{ind.house}</td>
                            <td className="py-3 px-3 text-center text-slate-350">{ind.pixCount}x</td>
                            <td className="py-3 px-3 text-center text-slate-350">{ind.postsCount}x</td>
                            <td className="py-3 px-3 text-center text-slate-350">{ind.eventsCount}x</td>
                            <td className="py-3 px-3 text-right text-purple-300 font-bold">{ind.points} XP</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* LISTAGEM DAS CONQUISTAS */}
              {activeTab === "conquistas" && (
                <motion.div
                  key="tab-conquistas"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800/60 font-mono">
                    <div>
                      <h4 className="text-xs font-bold uppercase text-slate-300">Medalhas & Conquistas de Carreira</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-sans">Incentivos do banco de dados ao atingir marcos cruciais</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {CONQUISTAS.map((conq) => (
                      <div 
                        key={conq.id}
                        className="p-4 rounded-xl bg-slate-950 border border-slate-900 hover:border-purple-500/20 transition-all flex gap-3 relative overflow-hidden"
                      >
                        <div className="p-2.5 h-fit rounded-lg bg-purple-500/10 border border-purple-500/25 shrink-0">
                          <Award className="w-5 h-5 text-purple-400" />
                        </div>

                        <div className="space-y-1">
                          <h5 className="text-white font-extrabold text-xs flex items-center gap-1.5 font-sans leading-none">
                            {conq.title}
                          </h5>
                          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                            {conq.description}
                          </p>
                          <div className="flex items-center gap-1.5 pt-1 font-mono text-[9px] text-slate-500">
                            <span className="text-purple-305 font-bold">🎁 Amparo: +{conq.pointsReward} XP</span>
                            <span>•</span>
                            <span>🎯 {conq.reqDescription}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>

        {/* COLUNA DIREITA: CONSOLE DE PROCESSOS REALTIME DE SCORE (4 COLUNAS) */}
        <div className="lg:col-span-4 space-y-6" id="gamificacao-sidebar">
          
          {/* PAINEL EXPLICAÇÃO DO CÁLCULO DENSADO AUTOMÁTICO */}
          <div className="bg-slate-900/60 rounded-xl border border-slate-850 p-4.5 space-y-3.5" id="rules-engine-card">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5 font-mono text-[10px]">
              <Target className="w-3.5 h-3.5 text-purple-400" /> Regras de Pontuação
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              O motor de gamificação atribui XP diretamente no Postgres a partir das interações de cada morador. O cálculo atualiza instantaneamente as visualizações de todos os vizinhos conectados.
            </p>

            <div className="space-y-2 bg-slate-950/70 p-3 rounded-lg border border-slate-850 font-mono text-[10px]">
              <div className="flex justify-between items-center text-slate-350">
                <span>🪙 Doação Pix Confirmada</span>
                <span className="text-emerald-400 font-bold">+100 XP</span>
              </div>
              <div className="flex justify-between items-center text-slate-350">
                <span>📸 Registro de Mídia no Álbum</span>
                <span className="text-purple-400 font-bold">+75 XP</span>
              </div>
              <div className="flex justify-between items-center text-slate-350">
                <span>📅 Presença em Gincana/Evento</span>
                <span className="text-yellow-405 font-bold">+50 XP</span>
              </div>
              <div className="flex justify-between items-center text-slate-350">
                <span>👑 Gabarito Exato de Bolão</span>
                <span className="text-amber-400 font-bold">+50 XP</span>
              </div>
            </div>
          </div>

          {/* SIMULATED WEBSOCKET CONSOLE LOGS */}
          <div className="bg-slate-900/60 rounded-xl border border-slate-850 p-4.5 space-y-3" id="ws-simulation-card">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono text-[10px] flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-purple-500 animate-spin" />
                DML Score Output Log
              </span>
              <span className="text-[9px] bg-purple-500/10 text-purple-450 border border-purple-400/20 px-1.5 py-0.5 rounded font-mono font-bold">
                LISTENING
              </span>
            </div>

            <p className="text-[9px] text-slate-500 font-mono leading-relaxed">
              Registros das transações simuladas e dos repasses via WebSocket do Supabase PostgreSQL schema:
            </p>

            <div className="bg-[#030712]/95 border border-slate-900 rounded-lg p-2.5 h-[230px] overflow-y-auto custom-scrollbar space-y-2 font-mono text-[9px] select-none text-slate-400 leading-relaxed">
              {simulationLogs.map((log) => (
                <div key={log.id} className="space-y-0.5">
                  <div className="flex items-center justify-between text-slate-600 text-[8px]">
                    <span>{log.time}</span>
                    <span className="text-purple-400">SCORE_REPLICA</span>
                  </div>
                  <div className="text-neutral-350 border-l border-purple-500/30 pl-1.5">
                    {log.text}
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
