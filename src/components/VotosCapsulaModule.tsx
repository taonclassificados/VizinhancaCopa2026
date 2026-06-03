import React, { useState, useEffect, useMemo } from "react";
import { 
  Sparkles, 
  Flame, 
  Award, 
  Vote, 
  Clock, 
  Lock, 
  Unlock, 
  Compass, 
  Home, 
  Camera, 
  Heart, 
  Volume2, 
  CheckCircle, 
  Plus, 
  Send, 
  User, 
  Share2, 
  Database,
  Info,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  MapPin,
  UtensilsCrossed,
  Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { triggerRealtimeNotification } from "./RealtimeNotificationSystem";

// Interfaces do Concurso
interface CanditatoConcurso {
  id: string;
  concurso: "casa" | "fantasia" | "foto" | "churrasco";
  autor: string;
  rua: string;
  titulo: string;
  descricao: string;
  imagem: string;
  votos: number;
}

// Interfaces da Caixa de Memória (Cápsula do Tempo)
interface MemoriaCapsula {
  id: string;
  autor: string;
  mensagem: string;
  anoDestino: 2030 | 2034 | 2038;
  criadoEm: string;
  imagemKey: string;
  bloqueado: boolean;
}

export default function VotosCapsulaModule() {
  // --- ESTADOS GERAIS ---
  const [currentUser, setCurrentUser] = useState("Rafael - Casa 14");
  const [currentRua, setCurrentRua] = useState("Rua Alagoas");
  const [selectedConcurso, setSelectedConcurso] = useState<"casa" | "fantasia" | "foto" | "churrasco">("casa");
  
  // Torcidômetro
  const [torcidometroBase, setTorcidometroBase] = useState<Record<string, number>>({
    "Rua Alagoas": 1240,
    "Rua da Pátria": 1150,
    "Avenida Brasil": 890,
    "Travessa Canarinho": 750,
  });
  const [userClicks, setUserClicks] = useState(0);
  const [localDecibel, setLocalDecibel] = useState(78);
  const [activeStreetCheer, setActiveStreetCheer] = useState<string>("Rua Alagoas");

  // Presets/Instâncias iniciais de candidatos de cada modalidade de melhor decoração/churrasco etc.
  const [candidatos, setCandidatos] = useState<CanditatoConcurso[]>([
    // Melhor Casa Decorada
    {
      id: "c-casa1",
      concurso: "casa",
      autor: "Dona Maria - Casa 87",
      rua: "Rua Alagoas",
      titulo: "Palácio Verde Amarelo",
      descricao: "Toda a fachada pintada à mão com as cores da bandeira, além de um bandeirão gigante que cobre todo o telhado!",
      imagem: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=500&q=80",
      votos: 342
    },
    {
      id: "c-casa2",
      concurso: "casa",
      autor: "Seu João - Casa 5",
      rua: "Rua da Pátria",
      titulo: "A Vanguarda do Hexa",
      descricao: "Lustres verde-e-amarelos montados com garrafas pet recicladas, cascata de LED colorida e calçadas texturizadas de grama artificial.",
      imagem: "https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&w=500&q=80",
      votos: 289
    },
    
    // Melhor Fantasia
    {
      id: "c-fant1",
      concurso: "fantasia",
      autor: "Cleber Silveira",
      rua: "Avenida Brasil",
      titulo: "O Fofão Canarinho 2.0",
      descricao: "Cruzamento épico do clássico fofão dos anos 80 moldado com pelo amarelo denso, chuteiras douradas e bico de tucano.",
      imagem: "https://images.unsplash.com/photo-1533488765986-dfa2a9939acd?auto=format&fit=crop&w=500&q=80",
      votos: 198
    },
    {
      id: "c-fant2",
      concurso: "fantasia",
      autor: "Clarinha e Família",
      rua: "Rua Alagoas",
      titulo: "Cosplay de Taça da FIFA",
      descricao: "A família inteira vestida de dourado brilhante se empilhando para formar a silhueta exata do troféu da Copa de 2026.",
      imagem: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=500&q=80",
      votos: 247
    },

    // Melhor Foto
    {
      id: "c-foto1",
      concurso: "foto",
      autor: "Julio Cunha - Fotógrafo Amador",
      rua: "Travessa Canarinho",
      titulo: "O Gritador do Gol da Vitória",
      descricao: "Captura de micro-expressão do momento em que o gol do empate saiu, flagrando 12 moradores chorando ao mesmo tempo.",
      imagem: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=500&q=80",
      votos: 154
    },
    {
      id: "c-foto2",
      concurso: "foto",
      autor: "Roberta Andrade",
      rua: "Rua da Pátria",
      titulo: "As Ruas Coloridas de Cima",
      descricao: "Foto tirada de drone mostrando as fitas cobrindo todo o céu da comunidade como uma segunda pele flutuante fascinante.",
      imagem: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=500&q=80",
      votos: 211
    },

    // Melhor Churrasco
    {
      id: "c-chur1",
      concurso: "churrasco",
      autor: "Churrascaria do Gordo",
      rua: "Rua Alagoas",
      titulo: "Costela no bafo de 24 horas",
      descricao: "Assada lentamente desde a noite de véspera com lenha de macieira. O osso sai deslizando com um toque suave dos dedos.",
      imagem: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80",
      votos: 412
    },
    {
      id: "c-chur2",
      concurso: "churrasco",
      autor: "Aninha Espetinhos",
      rua: "Avenida Brasil",
      titulo: "Varal de Linguiças Artesanais e Pão de Alho",
      descricao: "Defumação rápida com infusão de ervas finas verdes e queijo coalho gratinado com melado de cana.",
      imagem: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=500&q=80",
      votos: 371
    }
  ]);

  // Form de Inscrição em Concursos
  const [submittingContest, setSubmittingContest] = useState(false);
  const [formNome, setFormNome] = useState("");
  const [formTitulo, setFormTitulo] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formImgUrl, setFormImgUrl] = useState("");

  // Cápsula do Tempo
  const [capsulas, setCapsulas] = useState<MemoriaCapsula[]>([
    {
      id: "cap-1",
      autor: "Família Barbosa",
      mensagem: "Esperamos que em 2030 o Brasil já seja Hexacampeão legítimo com grandes memórias da rua Alagoas! Pintamos tudo com muito carinho.",
      anoDestino: 2030,
      criadoEm: "02/06/2026",
      imagemKey: "🎨 Pintura de Rua Geral",
      bloqueado: true
    },
    {
      id: "cap-2",
      autor: "Sérgio Mendes",
      mensagem: "Deixando gravado meu desejo de que a nossa comunidade continue unida assistindo os jogos nesta mesma calçada.",
      anoDestino: 2034,
      criadoEm: "01/06/2026",
      imagemKey: "🍻 Confraternização de Abertura",
      bloqueado: true
    },
    {
      id: "cap-3",
      autor: "Dona Neusa (82 anos)",
      mensagem: "Memórias de uma copa alegre! Deixo a receita do bolo verde e amarelo para as próximas gerações que abrirem esta cápsula.",
      anoDestino: 2030,
      criadoEm: "03/06/2026",
      imagemKey: "🍰 Receita Secreta do Bolo",
      bloqueado: true
    },
    {
      id: "cap-historic-1",
      autor: "Seu Geraldo (Em 2018)",
      mensagem: "Vinte anos atrás, em 2018, já tínhamos o sonho de cobrir a rua Alagoas de ponta a ponta. Está desbloqueada agora em 2026!",
      anoDestino: 2030, // Representado como desbloqueável para testes
      criadoEm: "18/06/2018",
      imagemKey: "📷 Foto Antiga Desbotada",
      bloqueado: false
    }
  ]);

  // Form de Memória da Cápsula
  const [capAutor, setCapAutor] = useState("");
  const [capMsg, setCapMsg] = useState("");
  const [capAno, setCapAno] = useState<2030 | 2034 | 2038>(2030);
  const [capImgId, setCapImgId] = useState("Festa Geral");
  const [successCapCode, setSuccessCapCode] = useState<string | null>(null);

  // Histórico de Logs do Banco Supabase Simulador
  const [dbLogs, setDbLogs] = useState<{ id: string; time: string; op: string; query: string }[]>([]);

  const registerDbLog = (operation: string, sqlStatement: string) => {
    const now = new Date().toLocaleTimeString("pt-BR");
    setDbLogs(prev => [
      { id: `db-${Date.now()}-${Math.random()}`, time: now, op: operation, query: sqlStatement },
      ...prev.slice(0, 8)
    ]);
  };

  useEffect(() => {
    registerDbLog("CONNECT", "SELECT * FROM public.votacoes WHERE active = true;");
    registerDbLog("CONNECT_STORAGE", "BUCKET 'capsula_memorias' - Policies checked & verified RLS.");
  }, []);

  // --- FUNÇÕES DE VOTAÇÃO ---
  const handleVote = (candidatoId: string, candName: string, category: string) => {
    setCandidatos(prev => prev.map(c => {
      if (c.id === candidatoId) {
        // Incrementa voto
        const novosVotos = c.votos + 1;
        registerDbLog(
          "UPDATE", 
          `UPDATE public.votacao_candidatos SET votos = ${novosVotos} WHERE id = '${candidatoId}' AND status = 'active';`
        );
        return { ...c, votos: novosVotos };
      }
      return c;
    }));

    // Disparar som audível simulado / feedback tátil
    setLocalDecibel(prev => Math.min(120, prev + 2));

    // Notificação Realtime
    triggerRealtimeNotification({
      type: "novo_post",
      title: "🗳️ Voto Confirmado!",
      description: `Um voto foi computado para "${candName}" no concurso: Melhor ${category.toUpperCase()}!`,
      metadata: {
        user: currentUser,
        linkView: "album"
      }
    });
  };

  // --- SUBMETER CANDIDATO DO CONCURSO ---
  const handleSubmitCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNome || !formTitulo || !formDesc) {
      alert("Por favor, preencha o seu nome, título do trabalho e descrição para validar!");
      return;
    }

    const newCandidate: CanditatoConcurso = {
      id: `c-${selectedConcurso}-${Date.now()}`,
      concurso: selectedConcurso,
      autor: `${formNome} - ${currentRua}`,
      rua: currentRua,
      titulo: formTitulo,
      descricao: formDesc,
      imagem: formImgUrl || "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=500&q=80",
      votos: 1 // Voto inicial do próprio criador
    };

    setCandidatos(prev => [...prev, newCandidate]);
    registerDbLog(
      "INSERT",
      `INSERT INTO public.votacao_candidatos (id, categoria, autor, titulo, descricao, data_cadastro) VALUES ('${newCandidate.id}', '${selectedConcurso}', '${newCandidate.autor}', '${newCandidate.titulo}', '${newCandidate.descricao}', NOW());`
    );

    // Limpar campos
    setFormNome("");
    setFormTitulo("");
    setFormDesc("");
    setFormImgUrl("");
    setSubmittingContest(false);

    triggerRealtimeNotification({
      type: "novo_post",
      title: "🏆 Nova Inscrição Coletada!",
      description: `${newCandidate.autor} publicou "${newCandidate.titulo}" no Concurso de Melhor ${selectedConcurso.toUpperCase()}! 🇧🇷`,
      metadata: {
        user: formNome,
        linkView: "album"
      }
    });
  };

  // --- VIBRAR NO TORCIDÔMETRO (TAP RAPIDO) ---
  const handleCheerTap = () => {
    setUserClicks(prev => prev + 1);
    setLocalDecibel(prev => {
      const nextDb = prev + 1.5 > 120 ? 120 : prev + 1.5;
      return nextDb;
    });

    // Adiciona pontos à rua ativa do usuário
    setTorcidometroBase(prev => {
      const currentPoints = prev[activeStreetCheer as keyof typeof prev] || 0;
      const updated = {
        ...prev,
        [activeStreetCheer]: currentPoints + 5
      };

      // Postgres emulado
      if (userClicks % 5 === 0) {
        registerDbLog(
          "UPSERT_VIBRANCY",
          `INSERT INTO public.torcidometro (rua, valor, atualizado_em) VALUES ('${activeStreetCheer}', ${updated[activeStreetCheer as keyof typeof updated]}, NOW()) ON CONFLICT (rua) DO UPDATE SET valor = EXCLUDED.valor;`
        );
      }
      return updated;
    });

    // Sopro rítmico automático para baixar o decibel devagar
    const timer = setTimeout(() => {
      setLocalDecibel(prev => Math.max(78, prev - 0.4));
    }, 1200);
  };

  // --- GUARDAR MEMÓRIA NA CÁPSULA DO TEMPO ---
  const handleSealTimeCapsule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!capAutor || !capMsg) {
      alert("Por favor, informe seu nome e a mensagem que quer selar!");
      return;
    }

    const uniqueId = `cap-${Date.now()}`;
    const novaMemoria: MemoriaCapsula = {
      id: uniqueId,
      autor: capAutor,
      mensagem: capMsg,
      anoDestino: capAno,
      criadoEm: new Date().toLocaleDateString("pt-BR"),
      imagemKey: capImgId,
      bloqueado: true
    };

    setCapsulas(prev => [novaMemoria, ...prev]);
    
    // Log do Supabase SQL e Storage
    registerDbLog(
      "INSERT_CAPSULE",
      `INSERT INTO public.time_capsule (id, autor, mensagem, ano_destino, criptografado) VALUES ('${uniqueId}', '${capAutor}', '${capMsg.substring(0, 30)}...', ${capAno}, true);`
    );
    registerDbLog(
      "STORAGE_UPLOAD",
      `Saved object '/capsula_memorias/${uniqueId}.json' with RLS secure hash: SHA256_VERDE_AMARELO`
    );

    // Feedback visual do código
    setSuccessCapCode(`CAPSULA-${capAno}-${Math.floor(1000 + Math.random() * 9000)}`);
    setCapAutor("");
    setCapMsg("");

    triggerRealtimeNotification({
      type: "meta_alcancada",
      title: "🔒 Memória Selada na Cápsula!",
      description: `${novaMemoria.autor} guardou uma mensagem que viajará no tempo até a Copa de ${capAno}!`,
      metadata: {
        user: capAutor,
        linkView: "album"
      }
    });

    setTimeout(() => {
      setSuccessCapCode(null);
    }, 6000);
  };

  // Filtra candidatos pela aba selecionada de votações
  const candidatosFiltrados = candidatos.filter(c => c.concurso === selectedConcurso);

  // Total geral de vibrações acumuladas
  const totalCheerPoints = useMemo(() => {
    let sum = 0;
    Object.keys(torcidometroBase).forEach(key => {
      sum += torcidometroBase[key] || 0;
    });
    return sum;
  }, [torcidometroBase]);

  // Ordena ruas pelo total de pontos de torcida para o Ranking
  const sortedStreets = useMemo(() => {
    return Object.keys(torcidometroBase).map(key => ({
      rua: key,
      pontos: torcidometroBase[key] || 0
    })).sort((a, b) => b.pontos - a.pontos);
  }, [torcidometroBase]);

  return (
    <div className="space-y-6 text-slate-100 font-sans text-left" id="votos-capsula-root">
      
      {/* CABEÇALHO HERO - VISUAL PREMIUM */}
      <div className="bg-gradient-to-r from-emerald-950 via-[#021f15] to-slate-950 border border-emerald-500/20 p-6 rounded-2xl relative overflow-hidden shadow-xl" id="comunidade-header">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-yellow-500/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
              <Vote className="w-3.5 h-3.5 text-yellow-405 fill-emerald-800" />
              Soberania do Voto Comunitário & Registro Temporal
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
              VOTAÇÕES & MEMÓRIAS COLETIVAS 🇧🇷🏆
            </h1>
            <p className="text-sm text-slate-350 leading-relaxed">
              Expresse o orgulho do seu quarteirão! Participe do Torcidômetro, decida quem leva o troféu de melhor fachada, churrasco ou fantasia na Rua do Hexa e feche sua carta na Cápsula do Tempo para as Copas futuras.
            </p>
          </div>

          <div className="px-5 py-3 bg-slate-950/75 border border-slate-850 rounded-xl shrink-0 font-mono text-left" id="user-context-card">
            <p className="text-[10px] text-zinc-400">Identificação Ativa</p>
            <div className="flex items-center gap-2 mt-0.5">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <input 
                type="text" 
                value={currentUser} 
                onChange={(e) => setCurrentUser(e.target.value)}
                className="bg-transparent border-b border-dashed border-emerald-800 focus:border-emerald-400 text-xs text-white font-bold outline-none font-sans w-32"
              />
            </div>
            <select
              value={currentRua}
              onChange={(e) => setCurrentRua(e.target.value)}
              className="bg-transparent text-[10px] text-emerald-300 font-bold mt-1.5 outline-none font-sans block w-full cursor-pointer"
            >
              <option value="Rua Alagoas" className="bg-slate-950">Rua Alagoas</option>
              <option value="Rua da Pátria" className="bg-slate-950">Rua da Pátria</option>
              <option value="Avenida Brasil" className="bg-slate-950">Avenida Brasil</option>
              <option value="Travessa Canarinho" className="bg-slate-950">Travessa Canarinho</option>
            </select>
          </div>
        </div>
      </div>

      {/* SEÇÃO 1: TORCIDÔMETRO (VIBRÔMETRO COLETIVO) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="torcidometro-section">
        
        {/* INTERATIVIDADE: BOTÃO DE TORCIDA (5 COLUNAS) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-850 p-6 rounded-xl flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <h2 className="text-sm font-black uppercase tracking-widest text-emerald-400 font-mono flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-emerald-400 animate-bounce" />
              1. Torcidômetro de Rua
            </h2>
            <p className="text-xs text-slate-400">
              Escolha sua rua e clique/toque freneticamente para subir no ranking de faturamento acústico!
            </p>
          </div>

          {/* Selecionador rápido de qual rua apoiar com clique */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono" id="cheer-street-selector">
            {Object.keys(torcidometroBase).map((rua) => (
              <button
                key={rua}
                onClick={() => {
                  setActiveStreetCheer(rua);
                  registerDbLog("SELECT_CHEER_STREET", `Alterado alvo de vibração instantâneo para: ${rua}`);
                }}
                className={`py-2 px-1 rounded border text-[10px] font-bold text-center transition-all cursor-pointer ${
                  activeStreetCheer === rua
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-300 shadow-inner"
                    : "bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-700"
                }`}
              >
                {rua}
              </button>
            ))}
          </div>

          {/* BOTÃO CENTRAL DE PRESSÃO ACÚSTICA */}
          <div className="relative flex flex-col items-center justify-center py-6" id="main-clicker">
            
            <button
              onClick={handleCheerTap}
              className="relative w-44 h-44 rounded-full bg-gradient-to-tr from-emerald-600 to-yellow-500 hover:brightness-110 active:scale-95 transition-all shadow-2xl flex flex-col items-center justify-center p-4 border-4 border-slate-950 cursor-pointer group"
            >
              {/* Círculo animado pulsante por fora */}
              <div 
                className="absolute inset-0 rounded-full bg-emerald-400/20 blur pointer-events-none group-hover:scale-110 transition-all duration-300"
                style={{ transform: `scale(${1.0 + (localDecibel / 150)})` }}
              />

              <Flame className="w-14 h-14 text-slate-950 stroke-[2.5]" />
              <span className="text-slate-950 font-black text-sm uppercase tracking-wider mt-1.5 font-sans">
                VIBRAR AGORA!
              </span>
              <span className="text-[10px] bg-slate-950/80 px-2 py-0.5 rounded text-yellow-300 font-mono font-bold mt-1">
                +5 PONTOS
              </span>
            </button>

            {/* Medidor de Db flutuante */}
            <div className="absolute bottom-1 right-4 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-center font-mono">
              <span className="text-[9px] text-zinc-400 block uppercase">Pico Som</span>
              <span className="text-xs font-black text-emerald-400">
                {localDecibel.toFixed(1)} dB
              </span>
            </div>
          </div>

          <div className="text-center bg-slate-950 p-2.5 rounded border border-slate-900 text-xs font-mono">
            <span>Você já gerou </span>
            <span className="text-yellow-405 font-bold">{userClicks * 5} pontos</span>
            <span> para a </span>
            <span className="text-emerald-300 font-bold">{activeStreetCheer}</span>.
          </div>

        </div>

        {/* GRÁFICO/RANKING DE RUAS (7 COLUNAS) */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-850 p-6 rounded-xl flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono">
                Ranking de Som Coletivo da Comunidade
              </h3>
              <p className="text-xs text-slate-400">
                Soma total de palmas, gritos detectados e batidas de bumbo em tempo real.
              </p>
            </div>
            
            <div className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/25 rounded text-[10px] text-emerald-400 font-mono font-bold">
              Total: {totalCheerPoints} Pts
            </div>
          </div>

          {/* LISTA GERAL DE RUAS */}
          <div className="space-y-4.5 py-2">
            {sortedStreets.map(({ rua, pontos }, index) => {
                const percentage = totalCheerPoints > 0 ? (pontos / totalCheerPoints) * 100 : 0;
                const isLeading = index === 0;

                return (
                  <div key={rua} className="space-y-1.5" id={`street-bar-${index}`}>
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                          isLeading ? "bg-yellow-500 text-slate-950" : "bg-slate-800 text-slate-400"
                        }`}>
                          {index + 1}
                        </span>
                        <span className="font-bold text-slate-205">{rua}</span>
                        {rua === activeStreetCheer && (
                          <span className="text-[8px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded uppercase font-mono font-bold animate-pulse">Sua Apoio</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-slate-350 font-bold">{pontos} pts</span>
                        <span className="text-[10px] text-slate-500">({percentage.toFixed(1)}%)</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-950 h-3.5 rounded-full border border-slate-850 overflow-hidden relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ type: "spring", stiffness: 60 }}
                        className={`h-full rounded-full ${
                          isLeading 
                            ? "bg-gradient-to-r from-emerald-500 to-yellow-500" 
                            : "bg-emerald-600/60"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Efeitos Atólicos / Fatos */}
          <div className="p-3 bg-slate-950/70 border border-slate-850 rounded text-[11px] text-slate-400 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5 leading-relaxed">
              <span className="font-bold text-slate-200">Reconhecimento Acústico: </span>
              Conforme dados enviados por decibelímetros instalados nos postes centrais de iluminação, a meta comunitária de barulho do hexacampeão foi atingida em 92%!
            </div>
          </div>

        </div>

      </div>

      {/* SEÇÃO 2: CONCURSOS E VOTAÇÃO DA COMUNIDADE */}
      <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-6 space-y-6" id="contest-concurs-board">
        
        {/* Cabecário Concurso */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <h2 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-405 fill-amber-900" />
              Concursos Oficiais da Rua do Hexa
            </h2>
            <p className="text-xs text-slate-400">
              Vote nos melhores da vizinhança ou candidate o seu trabalho para ganhar fardos de bebidas e churrasco de premiação!
            </p>
          </div>

          {/* Botão de Candidatura */}
          <button
            onClick={() => setSubmittingContest(!submittingContest)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-550 text-white font-bold text-xs rounded-lg uppercase tracking-wider transition-all cursor-pointer"
            id="register-contest-button"
          >
            <Plus className="w-4 h-4 text-white" />
            Inscrever Meu Projeto
          </button>
        </div>

        {/* TABS DE CONCURSOS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center" id="concourse-tabs">
          {[
            { id: "casa", name: "Melhor Casa Decorada 🏡", bg: "from-blue-600" },
            { id: "fantasia", name: "Melhor Fantasia 🎭", bg: "from-purple-600" },
            { id: "foto", name: "Melhor Foto 📸", bg: "from-sky-600" },
            { id: "churrasco", name: "Melhor Churrasco 🍖", bg: "from-amber-600" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedConcurso(tab.id as any);
                registerDbLog("SELECT_CONTEST", `SELECT * FROM public.candidatos WHERE query_type = '${tab.id}';`);
              }}
              className={`py-3 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                selectedConcurso === tab.id
                  ? "bg-slate-950 border-emerald-550 text-white shadow-inner"
                  : "bg-slate-950/40 border-slate-850 text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>{tab.name}</span>
              <span className="text-[9px] text-emerald-400 font-mono font-bold">
                {candidatos.filter(c => c.concurso === tab.id).length} inscritos
              </span>
            </button>
          ))}
        </div>

        {/* ANIMAÇÃO DO FORMULÁRIO DE INSCRIÇÃO SE ATIVO */}
        <AnimatePresence>
          {submittingContest && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4"
              id="form-contest-register"
            >
              <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                <h4 className="text-xs font-bold text-yellow-405 uppercase tracking-widest font-mono">
                  Formulário de Inscrição Oficial da Copa 2026
                </h4>
                <button 
                  onClick={() => setSubmittingContest(false)} 
                  className="text-xs text-slate-500 hover:text-slate-300"
                >
                  Cancelar
                </button>
              </div>

              <form onSubmit={handleSubmitCandidate} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Nome Oficial Representante</label>
                  <input 
                    type="text" 
                    value={formNome}
                    onChange={(e) => setFormNome(e.target.value)}
                    required
                    placeholder="Ex: Seu Geraldo e Vizinhos"
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Título Obra / Apresentação</label>
                  <input 
                    type="text" 
                    value={formTitulo}
                    onChange={(e) => setFormTitulo(e.target.value)}
                    required
                    placeholder="Ex: Fachada Monumental Verde Amarela"
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded text-white"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Detalhes da Criação / Por que merece ganhar?</label>
                  <textarea 
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    required
                    rows={2}
                    placeholder="Descreva materiais, tempo gasto na montagem ou tempero secreto para conquistar votos!"
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded text-white"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Foto Ilustrativa (Foto Real URL ou Presets Injetados)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={formImgUrl}
                      onChange={(e) => setFormImgUrl(e.target.value)}
                      placeholder="Cole uma URL de mídia ou deixe em branco para imagem padrão representativa"
                      className="flex-1 p-2.5 bg-slate-900 border border-slate-800 rounded text-sky-400 font-mono text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const randomUnsplashList = [
                          "https://images.unsplash.com/photo-1510563800743-aed236490d08?auto=format&fit=crop&w=500&q=80",
                          "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=500&q=80",
                          "https://images.unsplash.com/photo-1484242857719-4b9144542727?auto=format&fit=crop&w=500&q=80",
                          "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=500&q=80"
                        ];
                        const chosen = randomUnsplashList[Math.floor(Math.random() * randomUnsplashList.length)];
                        setFormImgUrl(chosen);
                      }}
                      className="px-3 bg-slate-900 text-slate-3 text-slate-300 border border-slate-800 hover:text-white rounded flex items-center gap-1 cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Sugerir Foto</span>
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2 pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-yellow-500 text-slate-950 font-black uppercase text-xs tracking-wider rounded-lg shadow cursor-pointer"
                  >
                    Confirmar Cadastro e Iniciar Campanha! 💚⚡
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* GRADE DE CANDIDATOS DO CONCURSO ATUAL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="candidates-render-grid">
          {candidatosFiltrados.length === 0 ? (
            <div className="col-span-2 text-center py-10 bg-slate-950 rounded-xl border border-dashed border-slate-850">
              <Compass className="w-10 h-10 text-slate-600 mx-auto mb-2 animate-spin" />
              <p className="text-sm font-bold text-slate-400">Nenhum candidato inscrito nessa modalidade.</p>
              <p className="text-xs text-slate-500 mt-1">Seja o primeiro a se inscrever clicando no botão acima!</p>
            </div>
          ) : (
            candidatosFiltrados.map((cand) => {
              // Calcula se está na lideranca temporária da aba ativa
              const maxVotesInTab = Math.max(...candidatosFiltrados.map(c => c.votos));
              const isLeading = cand.votos === maxVotesInTab && maxVotesInTab > 0;

              return (
                <div 
                  key={cand.id} 
                  className="bg-slate-950 rounded-xl border border-slate-850 hover:border-slate-750 transition-all overflow-hidden flex flex-col justify-between"
                  id={`candidato-card-${cand.id}`}
                >
                  {/* Foto ilustrativa do candidato */}
                  <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                    <img 
                      src={cand.imagem} 
                      alt={cand.titulo} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Badge da Rua do candidato */}
                    <div className="absolute top-3 left-3 bg-slate-950/80 border border-slate-800 px-2 py-0.8 rounded text-[9px] font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      <span>{cand.rua}</span>
                    </div>

                    {isLeading && (
                      <div className="absolute top-3 right-3 bg-yellow-500 text-slate-950 font-black text-[9px] uppercase font-mono px-2 py-0.8 rounded-full shadow flex items-center gap-1 animate-pulse">
                        <Award className="w-3 h-3 text-slate-950 fill-amber-750" />
                        <span>LÍDER</span>
                      </div>
                    )}
                  </div>

                  {/* Detalhes de Conteúdo */}
                  <div className="p-4 space-y-2 text-left flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs text-zinc-400 font-mono font-bold">Inscrito: {cand.autor}</h4>
                      </div>
                      <h3 className="text-md font-bold text-white tracking-tight">{cand.titulo}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed text-zinc-350">{cand.descricao}</p>
                    </div>

                    {/* Rodapé do Cartão com Votador */}
                    <div className="flex items-center justify-between border-t border-slate-900 pt-3 mt-2 font-mono">
                      <div className="text-xs">
                        <span className="text-slate-500 text-[10px] block font-mono">Votos Acumulados</span>
                        <span className="text-emerald-400 font-extrabold text-sm flex items-center gap-1">
                          <Heart className="w-4 h-4 text-emerald-405 fill-emerald-800" />
                          {cand.votos} votos
                        </span>
                      </div>

                      {/* Botão de Votação */}
                      <button
                        onClick={() => handleVote(cand.id, cand.titulo, selectedConcurso)}
                        className="flex items-center gap-1 px-3 py-2.5 bg-slate-900 hover:bg-emerald-650 hover:text-white border border-slate-800 rounded-lg text-xs font-bold font-sans tracking-wide transition-all text-emerald-404 cursor-pointer"
                        id={`btn-vote-${cand.id}`}
                      >
                        <Vote className="w-3.5 h-3.5 text-zinc-300" />
                        <span>Votar</span>
                      </button>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* SEÇÃO 3: CÁPSULA DO TEMPO (SALVAR MEMÓRIAS PARA FUTURAS COPAS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="capsula-tempo-secao">
        
        {/* PARTE ESQUERDA: PREPARAR CARTA (5 COLUNAS) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#090e18] to-slate-950 border border-slate-850 p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-1.5">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#60a5fa] font-mono flex items-center gap-1.5">
              <Lock className="w-5 h-5 text-sky-400 animate-pulse" />
              Cápsula do Tempo 🔒
            </h3>
            <p className="text-xs text-slate-400">
              Escreva uma carta ou confissão emocional sobre a Copa de 2026 e sele em nossa plataforma. A criptografia RLS será mantida indevassável e só abrirá nas próximas edições!
            </p>
          </div>

          <form onSubmit={handleSealTimeCapsule} className="space-y-3.5 text-xs font-mono">
            {/* Autor */}
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 uppercase font-black">Quem está gravando na história?</label>
              <input 
                type="text" 
                value={capAutor}
                onChange={(e) => setCapAutor(e.target.value)}
                required
                className="w-full p-2 bg-slate-950 border border-slate-850 rounded text-white"
                placeholder="Ex: Família Souza (Casa 44)"
              />
            </div>

            {/* Mensagem Oculta */}
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 uppercase font-black">Declaração / Profecia para o Futuro</label>
              <textarea 
                value={capMsg}
                onChange={(e) => setCapMsg(e.target.value)}
                required
                rows={3}
                className="w-full p-2 bg-slate-950 border border-slate-850 rounded text-white text-[11px]"
                placeholder="Deixe sua aposta, mensagem de carinho, fotografia falada ou receita comunal..."
              />
            </div>

            {/* Escolha do Ano Alvo */}
            <div className="grid grid-cols-3 gap-2">
              {[2030, 2034, 2038].map((ano) => (
                <button
                  key={ano}
                  type="button"
                  onClick={() => setCapAno(ano as any)}
                  className={`py-2 px-1 rounded border text-xs font-bold transition-all cursor-pointer ${
                    capAno === ano
                      ? "bg-sky-500/10 border-sky-500 text-sky-300"
                      : "bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-350"
                  }`}
                >
                  Copa de {ano}
                </button>
              ))}
            </div>

            {/* Tag/Tag-Imagem representativa */}
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 uppercase font-black">Item Físico Escaneado Acoplado</label>
              <select
                value={capImgId}
                onChange={(e) => setCapImgId(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-850 rounded text-slate-300 text-[11px]"
              >
                <option value="🎨 Desenho da Rua Asfalto">🎨 Desenho da Rua Asfalto</option>
                <option value="🍺 Caneca Oficial do Mutirão">🍺 Caneca Oficial do Mutirão</option>
                <option value="🍰 Receita de Bolo da Vó">🍰 Receita de Bolo da Vó</option>
                <option value="⚽ Bola Autografada da Estreia">⚽ Bola Autografada da Estreia</option>
                <option value="🏆 Foto do Hexa Sonhado">🏆 Foto do Hexa Sonhado</option>
              </select>
            </div>

            {/* Código de sucesso com animação */}
            {successCapCode && (
              <div className="p-3 bg-emerald-950/20 border border-emerald-500/25 text-emerald-300 rounded text-[11px] space-y-1">
                <span className="font-bold flex items-center gap-1 uppercase">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Sincronizado via Supabase RLS!
                </span>
                <p>Armazenamento imutável garantido com hash público de segurança: <span className="font-bold font-mono text-zinc-200">{successCapCode}</span></p>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 hover:brightness-110 text-white font-heavy font-black uppercase text-xs tracking-wider rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              id="seal-capsule-button"
            >
              <Lock className="w-3.5 h-3.5 text-white" />
              <span>Selar Cápsula de Memória 🔒</span>
            </button>
          </form>

        </div>

        {/* PARTE DIREITA: VISUALIZAR CÁPSULAS JÁ SELADAS (7 COLUNAS) */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-850 p-6 rounded-xl flex flex-col justify-between space-y-4 text-left">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-slate-305 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-sky-400" />
              Cofre Virtual das Próximas Gerações
            </h3>
            <p className="text-xs text-slate-400">
              Registros criptografados por morador no Postgres com triggers temporais de liberação automática.
            </p>
          </div>

          {/* LISTA DE CÁPSULAS */}
          <div className="space-y-3 max-h-[290px] overflow-y-auto custom-scrollbar pr-1">
            {capsulas.map((cap) => (
              <div 
                key={cap.id} 
                className={`p-3.5 rounded-lg border flex flex-col justify-between gap-2 transition-all ${
                  cap.bloqueado 
                    ? "bg-slate-950/90 border-slate-850" 
                    : "bg-emerald-950/15 border-emerald-500/25 border-dashed"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-500 font-mono">Autor: {cap.autor}</span>
                    <h4 className="text-xs font-black text-slate-300">{cap.imagemKey}</h4>
                  </div>
                  
                  {cap.bloqueado ? (
                    <span className="text-[9px] bg-slate-900 border border-slate-800 font-mono font-bold text-sky-400 px-2 py-0.5 rounded flex items-center gap-1 uppercase">
                      <Lock className="w-2.5 h-2.5" />
                      Abre em: {cap.anoDestino}
                    </span>
                  ) : (
                    <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 font-mono font-bold text-emerald-300 px-2 py-0.5 rounded flex items-center gap-1 uppercase animate-pulse">
                      <Unlock className="w-2.5 h-2.5" />
                      DESBLOQUEADO (2026)
                    </span>
                  )}
                </div>

                {/* Texto descriptografado ou borrado se trancado */}
                <div className="p-3 bg-[#030712] rounded border border-slate-900 text-xs text-zinc-350 min-h-[50px] flex items-center">
                  {cap.bloqueado ? (
                    <div className="space-y-1.5 w-full">
                      <div className="font-mono text-[9px] text-zinc-500 select-none blur-[3px]">
                        Isso é um texto estritamente protegido por lei da comunidade e chaves RLS criptografadas.
                      </div>
                      <div className="text-[8px] font-mono text-zinc-500 flex items-center justify-between">
                        <span>🔒 CRIPTOGRAFIA RLS ATIVA PARA MORADORES DE {cap.anoDestino}</span>
                        <span>SHA-256</span>
                      </div>
                    </div>
                  ) : (
                    <p className="italic text-zinc-300 leading-relaxed font-sans">{cap.mensagem}</p>
                  )}
                </div>

                <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-1">
                  <span>Selado em: {cap.criadoEm}</span>
                  <span>ID: {cap.id.substring(0, 10)}</span>
                </div>

              </div>
            ))}
          </div>

          {/* Botão simulador de pulo no tempo */}
          <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-850 flex items-center justify-between gap-4">
            <span className="text-[10px] text-slate-400 font-mono">
              ⚠️ Emulador de viagem no tempo local (Apenas para inspeção de RLS)
            </span>
            <button
              onClick={() => {
                setCapsulas(prev => prev.map(c => ({ ...c, bloqueado: false })));
                registerDbLog(
                  "BYPASS_RLS_ADMIN", 
                  "SET LOCAL rls.security_bypass = true; SELECT * FROM time_capsule_decrypted;"
                );
                triggerRealtimeNotification({
                  type: "meta_alcancada",
                  title: "⚠️ Bypass RLS Master Ativado!",
                  description: "Todas as cápsulas de tempo do condomínio foram descriptografadas temporariamente contra auditoria!",
                  metadata: {
                    user: "Master Admin",
                    linkView: "album"
                  }
                });
              }}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white hover:text-yellow-405 font-mono text-[10px] font-bold rounded cursor-pointer shrink-0"
              id="bypass-timecapsule-security"
            >
              Auditar Cofre 🔓
            </button>
          </div>

        </div>

      </div>

      {/* RASTROS E CONSOLE DO POSTGRES/SUPABASE DA COMMUNITY SEÇÃO */}
      <div className="bg-slate-950 p-5 rounded-xl border border-slate-850 space-y-3" id="supabase-console-community">
        <div className="flex justify-between items-center border-b border-slate-900 pb-2">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2 font-mono">
            <Database className="w-4 h-4 text-emerald-404" />
            CONSOLE DE AUDITORIA DE TRANSAÇÃO DO POSTGRESQL (SUPABASE LOG)
          </span>
          <span className="text-[10px] text-zinc-500 font-mono">ESTÁVEL & RLS ATIVO</span>
        </div>

        <div className="bg-[#020617] p-3 rounded h-[130px] overflow-y-auto custom-scrollbar font-mono text-[9px] text-zinc-400 space-y-2">
          {dbLogs.map((log) => (
            <div key={log.id} className="border-l-2 border-emerald-500 pl-2 py-0.5 space-y-0.5" id={`db-log-item-${log.id}`}>
              <div className="flex justify-between items-center text-zinc-500 text-[8px]">
                <span>[TIMESTAMP: {log.time}] - TRANS: {log.op}</span>
                <span className="text-emerald-500/80 font-bold">SQL SECURE EXECUTED</span>
              </div>
              <p className="text-zinc-300 font-bold select-all overflow-x-auto whitespace-pre-wrap">{log.query}</p>
            </div>
          ))}
        </div>
        <p className="text-[9px] text-slate-500 font-mono text-center">Qualquer voto, curtida ou cápsula gerada emite conexões seguras sob Row Level Security garantindo proteção e imutabilidade dos dados.</p>
      </div>

    </div>
  );
}
