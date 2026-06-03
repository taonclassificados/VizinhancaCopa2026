import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  motion, 
  AnimatePresence 
} from "motion/react";
import { 
  Home, 
  Camera, 
  Award, 
  TrendingUp, 
  Flame, 
  Clock, 
  Heart, 
  MessageCircle, 
  Send, 
  User, 
  Check, 
  Lock, 
  Unlock, 
  DollarSign, 
  Plus, 
  Gift, 
  Music, 
  Sparkles, 
  Volume2, 
  Share2, 
  ChevronRight, 
  Tv, 
  Compass, 
  Database,
  ThumbsUp,
  Image as ImageIcon,
  Zap,
  Ticket,
  HelpCircle,
  Grid,
  Settings,
  Trash2,
  LogOut,
  Bell,
  ShieldAlert
} from "lucide-react";
import { triggerRealtimeNotification } from "./RealtimeNotificationSystem";
import ArrecadacaoModule from "./ArrecadacaoModule";
import { supabase } from "../lib/supabaseClient";

// --- ENUMS & INTERFACES ---
interface FeedPost {
  id: string;
  autor: string;
  avatares: string;
  rua: string;
  imagem: string;
  legenda: string;
  curtidas: number;
  comentarios: { usuario: string; texto: string }[];
  tempo: string;
  curtidoPeloUsuario?: boolean;
}

interface JogoBolao {
  id: string;
  timeA: string;
  timeB: string;
  bandeiraA: string;
  bandeiraB: string;
  golsA: string | number;
  golsB: string | number;
  multiplicador: number;
}

interface MemoriaCapsula {
  id: string;
  autor: string;
  mensagem: string;
  anoDestino: 2030 | 2034 | 2038;
  criadoEm: string;
  objetoAcoplado: string;
  code: string;
  bloqueado: boolean;
}

interface FutCard {
  id: string;
  nome: string;
  posicao: string;
  ovr: number;
  churrasco: number;
  decoracao: number;
  gritaria: number;
  copas: number;
  imagem: string;
  corGrade: string;
  descricao: string;
}

export default function CopaGenZApp() {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<"inicio" | "feed" | "bolao" | "perfil" | "arrecadacao">("inicio");
  const [currentUser, setCurrentUser] = useState("Vini-Da-Rua2");
  const [currentRua, setCurrentRua] = useState("Rua Alagoas");
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [newCommentText, setNewCommentText] = useState<Record<string, string>>({});
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);
  const [profileSubTab, setProfileSubTab] = useState<"posts" | "conquistas">("posts");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [userAvatar, setUserAvatar] = useState("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80");
  const [selectedGridPost, setSelectedGridPost] = useState<FeedPost | null>(null);
  const [showConfetti, setShowConfetti] = useState(true);
  const [mascoteMessage, setMascoteMessage] = useState("Põe freio que o Hexa vem, galera! Bora pintar as guias de verde hoje!");
  
  // Confetti Particles State
  interface ConfettiParticle {
    id: number;
    x: number;
    y: number;
    color: string;
    size: number;
    rotate: number;
    delay: number;
  }
  const [confettis, setConfettis] = useState<ConfettiParticle[]>([]);

  // Countdown timer para o próximo jogo
  const [timeLeft, setTimeLeft] = useState({ dias: 2, horas: 14, minutos: 35, segundos: 45 });

  // DB SQL logs para simular Supabase nas ações
  const [dbLogs, setDbLogs] = useState<{ id: string; sql: string; stamp: string }[]>([]);

  const addDbLog = (sql: string) => {
    const time = new Date().toLocaleTimeString("pt-BR");
    setDbLogs(prev => [
      { id: `sql-${Date.now()}-${Math.random()}`, sql, stamp: time },
      ...prev.slice(0, 15)
    ]);
  };

  // --- SUPABASE REAL INTEGRATION STATES & FUNCTIONS ---
  const [supabaseConnected, setSupabaseConnected] = useState<boolean | null>(null);
  const [supabaseLoading, setSupabaseLoading] = useState(false);
  const [supabaseErrorMsg, setSupabaseErrorMsg] = useState<string | null>(null);
  const [showSqlScript, setShowSqlScript] = useState(false);

  // --- ADMIN PANEL STATES & OPERATIONS ---
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<"geral" | "posts" | "votos" | "logs">("geral");
  
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");

  const [adminNotificationTitle, setAdminNotificationTitle] = useState("");
  const [adminNotificationDesc, setAdminNotificationDesc] = useState("");
  const [adminNotificationType, setAdminNotificationType] = useState<"novo_post" | "meta_alcancada">("meta_alcancada");

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUsername === "Cladston" && adminPassword === "@Senha123!") {
      setIsAdminLoggedIn(true);
      setShowAdminLoginModal(false);
      setShowAdminPanel(true);
      setAdminError("");
      addDbLog("ADMIN LOGIN: Usuário 'Cladston' autenticado com sucesso no painel master.");
      triggerRealtimeNotification({
        type: "meta_alcancada",
        title: "🔑 Admin Conectado!",
        description: "Bem-vindo de volta ao centro de operações, Cladston!",
        metadata: { user: "Cladston" }
      });
    } else {
      setAdminError("Credenciais inválidas! Tente novamente.");
      addDbLog("ADMIN LOGIN FAILED: Tentativa inválida de login administrativo.");
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setShowAdminPanel(false);
    setAdminUsername("");
    setAdminPassword("");
    addDbLog("ADMIN LOGOUT: Conexão administrativa encerrada.");
  };

  const deletePost = async (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    addDbLog(`DELETE FROM public.posts WHERE id = '${postId}';`);
    try {
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) {
        addDbLog(`SUPABASE DELETE WARNING: ${error.message} (Post removido localmente)`);
      } else {
        addDbLog(`SUPABASE INFO: Post ${postId} removido fisicamente do banco de dados.`);
      }
    } catch (err: any) {
      addDbLog(`SUPABASE DELETE ERROR: ${err.message}`);
    }
  };

  const broadcastAdminAlert = () => {
    if (!adminNotificationTitle.trim()) return;
    triggerRealtimeNotification({
      type: adminNotificationType,
      title: `⚡ [ALERT MASTER] ${adminNotificationTitle}`,
      description: adminNotificationDesc || "Aviso oficial da equipe de coordenação administrativa da gincana.",
      metadata: { user: "Admin", linkView: "social" }
    });
    addDbLog(`BROADCAST NOTIFICATION: "${adminNotificationTitle}" enviada a todos os moradores.`);
    setAdminNotificationTitle("");
    setAdminNotificationDesc("");
  };

  const testSupabaseConnection = async () => {
    try {
      const { data, error } = await supabase.from("posts").select("id").limit(1);
      if (error) {
        if (error.code === "PGRST116" || error.message.includes("relation \"posts\" does not exist")) {
          setSupabaseConnected(true);
          setSupabaseErrorMsg("Aviso: Conectado ao Supabase, mas a tabela 'posts' ainda não existe.");
        } else {
          setSupabaseConnected(false);
          setSupabaseErrorMsg(error.message);
        }
      } else {
        setSupabaseConnected(true);
        setSupabaseErrorMsg(null);
      }
    } catch (err: any) {
      setSupabaseConnected(false);
      setSupabaseErrorMsg(err.message || "Falha na conexão.");
    }
  };

  const syncFromSupabase = async () => {
    setSupabaseLoading(true);
    addDbLog("SELECT * FROM public.posts ORDER BY created_at DESC;");
    try {
      const { data, error } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
      if (error) {
        setSupabaseErrorMsg(`Erro ao ler posts: ${error.message}`);
        addDbLog(`SUPABASE ERROR: ${error.message}`);
        setSupabaseLoading(false);
        return;
      }
      if (data && data.length > 0) {
        const dbPosts: FeedPost[] = data.map(item => {
          let commentsList: any[] = [];
          if (item.comentarios) {
            try {
              commentsList = typeof item.comentarios === "string" ? JSON.parse(item.comentarios) : item.comentarios;
            } catch (e) {
              commentsList = [];
            }
          }
          return {
            id: item.id || `post-${Date.now()}`,
            autor: item.autor || "Morador Anônimo",
            avatares: item.avatares || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
            rua: item.rua || "Geral",
            imagem: item.imagem || "",
            legenda: item.legenda || "",
            curtidas: item.curtidas || 0,
            comentarios: commentsList,
            tempo: item.tempo || "Agora"
          };
        });
        setPosts(dbPosts);
        addDbLog(`SUPABASE INFO: ${dbPosts.length} posts carregados diretamente do Supabase.`);
        setSupabaseConnected(true);
        setSupabaseErrorMsg(null);
      } else {
        addDbLog("SUPABASE INFO: Nenhum post encontrado. Usando posts locais iniciais.");
      }
    } catch (err: any) {
      addDbLog(`SUPABASE FAIL: ${err.message}`);
    } finally {
      setSupabaseLoading(false);
    }
  };

  // Gerar partículas de confete
  useEffect(() => {
    const colors = ["#00c853", "#ffd600", "#002776", "#2979ff", "#ff4081"];
    const container: ConfettiParticle[] = [];
    for (let i = 0; i < 40; i++) {
      container.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * -60 - 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 6,
        rotate: Math.random() * 360,
        delay: Math.random() * 5
      });
    }
    setConfettis(container);

    // SQL Log Inicial
    addDbLog("SELECT * FROM public.campeonato_status WHERE active = true;");
    addDbLog("SELECT * FROM public.torcida_ranking ORDER BY pontos DESC LIMIT 10;");
    
    // Inicia conexão e busca dados do Supabase real
    testSupabaseConnection();
    syncFromSupabase();
  }, []);

  // Timer Countdown loop
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.segundos > 0) {
          return { ...prev, segundos: prev.segundos - 1 };
        } else if (prev.minutos > 0) {
          return { ...prev, minutos: prev.minutos - 1, segundos: 59 };
        } else if (prev.horas > 0) {
          return { ...prev, horas: prev.horas - 1, minutos: 59, segundos: 59 };
        } else if (prev.dias > 0) {
          return { ...prev, dias: prev.dias - 1, horas: 23, minutos: 59, segundos: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- MOCK DATA ---

  // FIFA Ultimate Team Player Cards of Neighborhood Legends
  const [futCards, setFutCards] = useState<FutCard[]>([
    {
      id: "fut-1",
      nome: "Dona Neusa",
      posicao: "COZINHEIRA",
      ovr: 96,
      churrasco: 99,
      decoracao: 88,
      gritaria: 91,
      copas: 11,
      imagem: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
      corGrade: "bg-gradient-to-b from-amber-400 via-yellow-300 to-amber-600 border-amber-300 text-slate-900",
      descricao: "A maior fatiadora de costela no bafo da história do bairro. Seu pão de alho tem rating lendário."
    },
    {
      id: "fut-2",
      nome: "Renatinho",
      posicao: "PINTOR GUIA",
      ovr: 94,
      churrasco: 78,
      decoracao: 98,
      gritaria: 89,
      copas: 4,
      imagem: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
      corGrade: "bg-gradient-to-b from-emerald-500 via-teal-300 to-emerald-700 border-emerald-400 text-slate-950",
      descricao: "Pinta estrelas verde-amarelas no asfalto com precisão milimétrica em tempo recorde de 40 segundos."
    },
    {
      id: "fut-3",
      nome: "Gerson 'Vozão'",
      posicao: "ORGANIZADOR",
      ovr: 92,
      churrasco: 85,
      decoracao: 80,
      gritaria: 99,
      copas: 7,
      imagem: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
      corGrade: "bg-gradient-to-b from-blue-500 via-sky-300 to-blue-700 border-sky-400 text-white",
      descricao: "Equipado com 4 megafones e uma garganta de aço. Fator motivacional incomparável em campo."
    },
    {
      id: "fut-4",
      nome: "Clarinha Hexa",
      posicao: "MASCOTE",
      ovr: 95,
      churrasco: 70,
      decoracao: 95,
      gritaria: 96,
      copas: 2,
      imagem: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      corGrade: "bg-gradient-to-b from-violet-500 via-pink-300 to-fuchsia-700 border-pink-400 text-white",
      descricao: "Com apenas 9 anos de idade, lidera as danças e tem a fantasia de mascote mais fofa e brilhante."
    }
  ]);

  // Feed de Notícias do Instagram / TikTok
  const [posts, setPosts] = useState<FeedPost[]>([
    {
      id: "post-1",
      autor: "Dona Neusa - Casa 42",
      avatares: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80",
      rua: "Rua Alagoas",
      imagem: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=85",
      legenda: "🍖 Churrasquinho oficial do mutirão de pintura de calçada já tá na grelha! Com muito queijo de coalho fresquinho e trilha sonora de muito pagode! Bora morador!! 🎉🇧🇷 #RuaDoHexa #AbreuLiga",
      curtidas: 142,
      comentarios: [
        { usuario: "GersonVozão", texto: "Arrasou, manda duas aqui pro poste 4 que tamo pintando as fitas!" },
        { usuario: "ClaraTeens", texto: "Minha família já tá descendo com o refrigerante!" }
      ],
      tempo: "12 min atrás"
    },
    {
      id: "post-2",
      autor: "Renatinho Pintor",
      avatares: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
      rua: "Rua da Pátria",
      imagem: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=85",
      legenda: "🎨 Visual aéreo das nossas bandeirinhas cobrindo o céu azul! Foram mais de 4.000 metros de fitas plásticas amarradas. Orgulho do trabalho em equipe do quarteirão! 🏆💚💛 #Bandeirinhas #Qatar2026",
      curtidas: 289,
      comentarios: [
        { usuario: "DonaNeusa", texto: "Lindo demais meu filho, que orgulho da nossa comunidade!" },
        { usuario: "ViniDoAsfalto", texto: "Incrível! Nossa rua ganhou do bairro vizinho 10 a 0 fácil." }
      ],
      tempo: "45 min atrás"
    },
    {
      id: "post-3",
      autor: "Família Barbosa",
      avatares: "https://images.unsplash.com/photo-1510563800743-aed236490d08?auto=format&fit=crop&w=100&q=80",
      rua: "Travessa Canarinho",
      imagem: "https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&w=600&q=85",
      legenda: "🏠 Nossa casa decorada com grafete em 3D de mascote Canarinho Pistola e luzes LED neon de verde e amarelo acesas! Venham tirar fotos para o feed de vocês hoje à noite! 📸 #Canarinho #Hexa2026",
      curtidas: 198,
      comentarios: [
        { usuario: "RenatoP1", texto: "Ficou top, esse grafiti ficou perfeito" }
      ],
      tempo: "2 horas atrás"
    }
  ]);

  // Bolão de Palpites
  const [jogos, setJogos] = useState<JogoBolao[]>([
    { id: "j-1", timeA: "Brasil", timeB: "Croácia", bandeiraA: "🇧🇷", bandeiraB: "🇭🇷", golsA: "", golsB: "", multiplicador: 1.5 },
    { id: "j-2", timeA: "Argentina", timeB: "França", bandeiraA: "🇦🇷", bandeiraB: "🇫🇷", golsA: "", golsB: "", multiplicador: 1.2 },
    { id: "j-3", timeA: "Alemanha", timeB: "Espanha", bandeiraA: "🇩🇪", bandeiraB: "🇪🇸", golsA: "", golsB: "", multiplicador: 1.4 },
  ]);

  // Concursos ativos (Votação da comunidade)
  const [activeContest, setActiveContest] = useState<"casa" | "fantasia" | "foto" | "churrasco">("casa");
  const [concursoCandidatos, setConcursoCandidatos] = useState([
    {
      id: "cand-1",
      categoria: "casa",
      autor: "Dona Maria - Casa 87",
      titulo: "Palácio Verde Amarelo",
      imagem: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=500&q=80",
      votos: 342,
      rua: "Rua Alagoas"
    },
    {
      id: "cand-2",
      categoria: "casa",
      autor: "Seu João - Casa 5",
      titulo: "A Vanguarda do Hexa",
      imagem: "https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&w=500&q=80",
      votos: 289,
      rua: "Rua da Pátria"
    },
    {
      id: "cand-3",
      categoria: "fantasia",
      autor: "Cleber Silveira",
      titulo: "O Canarinho Gigante do Metrô",
      imagem: "https://images.unsplash.com/photo-1533488765986-dfa2a9939acd?auto=format&fit=crop&w=500&q=80",
      votos: 198,
      rua: "Avenida Brasil"
    },
    {
      id: "cand-4",
      categoria: "fantasia",
      autor: "Clarinha e Família",
      titulo: "Trio Elétrico de Papelão do Hexa",
      imagem: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=500&q=80",
      votos: 247,
      rua: "Rua Alagoas"
    },
    {
      id: "cand-5",
      categoria: "foto",
      autor: "Lucas Lente",
      titulo: "O Grito de Gol com o Cachorro",
      imagem: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=500&q=80",
      votos: 154,
      rua: "Travessa Canarinho"
    },
    {
      id: "cand-6",
      categoria: "churrasco",
      autor: "Gordinho do Bafo",
      titulo: "Costela com espeto de espada dourada",
      imagem: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80",
      votos: 412,
      rua: "Rua Alagoas"
    }
  ]);

  // Torcidômetro (Drum tap points)
  const [ruaPontos, setRuaPontos] = useState<Record<string, number>>({
    "Rua Alagoas": 1240,
    "Rua da Pátria": 1150,
    "Avenida Brasil": 890,
    "Travessa Canarinho": 750
  });

  // Cápsula do Tempo memorias
  const [capsulas, setCapsulas] = useState<MemoriaCapsula[]>([
    {
      id: "cap-1",
      autor: "Família Souza (Casa 12)",
      mensagem: "Querida geração de 2030, esperamos que vcs já estejam curtindo o octacampeonato! Deixamos a nossa calçada pintada com amor em 2026. A união prevaleceu!",
      anoDestino: 2030,
      criadoEm: "02/06/2026",
      objetoAcoplado: "🏆 Medalhinha comemorativa de lata de refrigerante",
      code: "CAPSULA-2030-9831",
      bloqueado: true
    },
    {
      id: "cap-2",
      autor: "Seu Geraldo",
      mensagem: "Deixo aqui gravado que fiz o melhor vinagrete da história do bairro nessa final. Guardem essa receita: 3 cebolas roxas, tomates selecionados e salsinha picada a vácuo!",
      anoDestino: 2034,
      criadoEm: "30/05/2026",
      objetoAcoplado: "📝 Receita Secreta de Tempero de Churrasco de 2026",
      code: "CAPSULA-2034-4512",
      bloqueado: true
    }
  ]);

  // Feed/Post Upload Form States
  const [newPostText, setNewPostText] = useState("");
  const [newPostImage, setNewPostImage] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Time Capsule Form State
  const [capText, setCapText] = useState("");
  const [capAuthor, setCapAuthor] = useState("");
  const [capYear, setCapYear] = useState<2030 | 2034 | 2038>(2030);
  const [capIcon, setCapIcon] = useState("📸 Caneca Oficial da Copa");

  // --- ACTIONS ---

  // Curtir um post
  const toggleLikePost = (postId: string) => {
    const wasLiked = likedPosts[postId];
    setLikedPosts(prev => ({ ...prev, [postId]: !wasLiked }));
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          curtidas: p.curtidas + (wasLiked ? -1 : 1)
        };
      }
      return p;
    }));

    addDbLog(`UPDATE posts SET likes_count = likes_count ${wasLiked ? '-' : '+'} 1 WHERE id = '${postId}';`);
    
    // Supabase update for like in background
    (async () => {
      try {
        const targetPost = posts.find(p => p.id === postId);
        if (targetPost) {
          const newLikes = targetPost.curtidas + (wasLiked ? -1 : 1);
          await supabase.from("posts").update({ curtidas: newLikes }).eq("id", postId);
        }
      } catch (err) {}
    })();

    if (!wasLiked) {
      triggerRealtimeNotification({
        type: "novo_post",
        title: "❤️ Amei!",
        description: `${currentUser} curtiu seu post de festa verde e amarela!`,
        metadata: { user: currentUser, linkView: "social" }
      });
    }
  };

  // Comentar num post
  const addComment = (postId: string) => {
    const commentText = newCommentText[postId];
    if (!commentText || !commentText.trim()) return;

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const updatedPost = {
          ...p,
          comentarios: [...p.comentarios, { usuario: currentUser, texto: commentText }]
        };
        // Supabase update for comment in background
        (async () => {
          try {
            await supabase.from("posts").update({ comentarios: JSON.stringify(updatedPost.comentarios) }).eq("id", postId);
          } catch (err) {}
        })();
        return updatedPost;
      }
      return p;
    }));

    // Reset comment field
    setNewCommentText(prev => ({ ...prev, [postId]: "" }));
    addDbLog(`INSERT INTO comments (post_id, user_name, comment_text, created_at) VALUES ('${postId}', '${currentUser}', '${commentText}', NOW());`);

    triggerRealtimeNotification({
      type: "novo_post",
      title: "💬 Novo Comentário!",
      description: `${currentUser} comentou: "${commentText.substring(0, 30)}..."`,
      metadata: { user: currentUser, linkView: "social" }
    });
  };

  // Postar nova foto
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const defaultImages = [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1533488765986-dfa2a9939acd?auto=format&fit=crop&w=600&q=80"
    ];

    const newPost: FeedPost = {
      id: `post-${Date.now()}`,
      autor: `${currentUser} - ${currentRua}`,
      avatares: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
      rua: currentRua,
      imagem: newPostImage || defaultImages[Math.floor(Math.random() * defaultImages.length)],
      legenda: newPostText,
      curtidas: 1,
      comentarios: [],
      tempo: "Agora mesmo"
    };

    setPosts(prev => [newPost, ...prev]);
    setNewPostText("");
    setNewPostImage("");
    setShowUploadModal(false);

    // SQL simulation
    addDbLog(`INSERT INTO posts (id, user_name, content_text, image_url, rua_origem, votes) VALUES ('${newPost.id}', '${currentUser}', '${newPost.legenda}', '${newPost.imagem}', '${currentRua}', 0);`);

    // Supabase push new post in background
    (async () => {
      try {
        await supabase.from("posts").insert([{
          id: newPost.id,
          autor: newPost.autor,
          avatares: newPost.avatares,
          rua: newPost.rua,
          imagem: newPost.imagem,
          legenda: newPost.legenda,
          curtidas: newPost.curtidas,
          comentarios: JSON.stringify(newPost.comentarios),
          tempo: newPost.tempo,
          created_at: new Date().toISOString()
        }]);
        addDbLog(`SUPABASE INFO: Post ${newPost.id} gravado no banco de dados remoto.`);
      } catch (err) {}
    })();

    triggerRealtimeNotification({
      type: "novo_post",
      title: "🔥 BUM! Novo Post no Feed!",
      description: `${newPost.autor} acabou de postar uma novidade explosiva da Copa! Verifique já! 🇧🇷`,
      metadata: { user: currentUser, linkView: "social" }
    });
  };

  // Palpitar no Bolão
  const handleOddsBet = (jogoId: string, type: "A" | "B" | "empate") => {
    setJogos(prev => prev.map(j => {
      if (j.id === jogoId) {
        let nA = Number(j.golsA) || 0;
        let nB = Number(j.golsB) || 0;
        if (type === "A") nA += 1;
        if (type === "B") nB += 1;
        return {
          ...j,
          golsA: nA,
          golsB: nB
        };
      }
      return j;
    }));

    addDbLog(`UPDATE palpites SET gols_a = gols_a + 1 WHERE jogo_id = '${jogoId}' AND user_name = '${currentUser}';`);

    triggerRealtimeNotification({
      type: "novo_post",
      title: "⚽ Palpite no Bolão!",
      description: `Seu palpite foi gravado no banco de dados com Odds dinâmicas! Boa sorte!`,
      metadata: { user: currentUser, linkView: "social" }
    });
  };

  // Votar nos Concursos (Melhor Casa, Fantasia, Foto, Churrasco)
  const voteContest = (candId: string, titleName: string) => {
    setConcursoCandidatos(prev => prev.map(c => {
      if (c.id === candId) {
        return { ...c, votos: c.votos + 1 };
      }
      return c;
    }));

    addDbLog(`UPDATE concurso_candidatos SET total_votos = total_votos + 1 WHERE id = '${candId}';`);

    triggerRealtimeNotification({
      type: "meta_alcancada",
      title: "🏆 Voto Marcado!",
      description: `Seu voto para "${titleName}" foi computado com sucesso!`,
      metadata: { user: currentUser, linkView: "album" }
    });
  };

  // Vibrar no Torcidômetro (clique rápido)
  const clickTorcidometro = (rua: string) => {
    setRuaPontos(prev => {
      const p = prev[rua] || 0;
      const updated = {
        ...prev,
        [rua]: p + 10
      };
      
      // SQL updates periodically
      if (Math.random() > 0.6) {
        addDbLog(`INSERT INTO torcidometro_cliques (rua, valor, data_registro) VALUES ('${rua}', ${updated[rua]}, NOW()) ON CONFLICT (rua) DO UPDATE SET valor = EXCLUDED.valor;`);
      }
      return updated;
    });

    // Vibration sound notification triggers trigger
    if (Math.random() > 0.85) {
      triggerRealtimeNotification({
        type: "meta_alcancada",
        title: "🥁 TAMBOR BLAST!",
        description: `Moradores na ${rua} estão detonando o Torcidômetro com assobios e tambores!`,
        metadata: { user: currentUser, linkView: "eventos" }
      });
    }
  };

  // Selar Cápsula do Tempo
  const sealTimeCapsule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!capText || !capAuthor) return;

    const uniqueCode = `CAPSULA-${capYear}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCapsule: MemoriaCapsula = {
      id: `cap-${Date.now()}`,
      autor: `${capAuthor} (${currentRua})`,
      mensagem: capText,
      anoDestino: capYear,
      criadoEm: new Date().toLocaleDateString("pt-BR"),
      objetoAcoplado: capIcon,
      code: uniqueCode,
      bloqueado: true
    };

    setCapsulas(prev => [newCapsule, ...prev]);
    setCapText("");
    setCapAuthor("");

    addDbLog(`INSERT INTO time_capsules (id, user_auth_ref, msg_encrypted, target_year, item_tag) VALUES ('${newCapsule.id}', '${newCapsule.autor}', 'AES-256-ENCRYPTED', ${capYear}, '${capIcon}');`);

    triggerRealtimeNotification({
      type: "meta_alcancada",
      title: "🔒 Memória viajou no tempo!",
      description: `${newCapsule.autor} selou sua recordação para ser aberta em ${capYear}! Guarde o código de acesso.`,
      metadata: { user: currentUser, linkView: "social" }
    });
  };

  // Mascot canarinho clicks
  const triggerMascotQuote = () => {
    const quotes = [
      "Mano, o hexa tá escrito no asfalto! Se não ajudar a varrer a calçada, vai ficar sem espetinho de filé!",
      "Ó o churrasco cheirando! Quem não pintar a guia da calçada vai pegar fila!",
      "Nossos LEDs verde-amarelos estão incomodando o satélite da NASA! É disso que eu tô falando!",
      "Bora votar na melhor casa da rua de cima já! Os guri colocaram até um boneco de neusa com a taça!",
      "Alô! Já deu seus 100 cliques no torcidômetro de hoje? O tambor tá te esperando, irmão!"
    ];
    setMascoteMessage(quotes[Math.floor(Math.random() * quotes.length)]);
  };

  // Filtragem e rankings auxiliares
  const rankingsFamilia = [
    { rank: "🥇 1º Lugar", nome: "Silva & Souza", pontos: 2840, rua: "Rua Alagoas", OVR: 98, avatar: "https://images.unsplash.com/photo-1510563800743-aed236490d08?auto=format&fit=crop&w=150&q=80" },
    { rank: "🥈 2º Lugar", nome: "Mendes e Cia", pontos: 2610, rua: "Rua da Pátria", OVR: 95, avatar: "https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&w=150&q=80" },
    { rank: "🥉 3º Lugar", nome: "Guerreiros do Mutirão", pontos: 2450, rua: "Avenida Brasil", OVR: 93, avatar: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=150&q=80" }
  ];

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800 font-sans pb-24 relative overflow-hidden" id="copa-gen-z-main">
      
      {/* Dynamic Rain of confetti if enabled */}
      <AnimatePresence>
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden h-[100vh]" id="confetti-snow">
            {confettis.map(p => (
              <motion.div
                key={p.id}
                initial={{ y: -50, x: `${p.x}vw`, rotate: p.rotate, opacity: 0.9 }}
                animate={{ 
                  y: ["0vh", "100vh"], 
                  x: [`${p.x}vw`, `${p.x + (Math.sin(p.id) * 10)}vw`],
                  rotate: p.rotate + 360
                }}
                transition={{ 
                  duration: 6 + Math.random() * 4, 
                  repeat: Infinity,
                  delay: p.delay,
                  ease: "linear"
                }}
                style={{ 
                  position: "absolute",
                  backgroundColor: p.color,
                  width: `${p.size}px`,
                  height: `${p.size * 0.6}px`,
                  borderRadius: "2px",
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* HEADER TOP DE CONFIG E IDENTIDADE DO USUÁRIO */}
      <div className="bg-gradient-to-b from-sky-400 via-emerald-600 to-emerald-700 p-5 shrink-0 shadow-lg relative z-10 text-white rounded-b-3xl overflow-hidden border-b-4 border-yellow-400">
        {/* Sky glow & clouds representation inspired by the sunny World Cup sky */}
        <div className="absolute top-0 inset-x-0 h-4/5 bg-gradient-to-b from-sky-450/90 via-sky-300/40 to-transparent pointer-events-none" />
        
        {/* Sunny glow flare */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-yellow-300/30 rounded-full blur-2xl pointer-events-none animate-pulse" />
        
        {/* Stylized Modern Stadium roof curve (silver-grey abstract arc reflecting the stadium in Monterey/World Cup background) */}
        <div className="absolute -bottom-6 right-0 w-3/4 h-5/6 bg-slate-100/15 rounded-tl-[120px] rounded-br-3xl border-t border-l border-white/20 backdrop-blur-[0.5px] pointer-events-none" />
        <div className="absolute -bottom-10 right-4 w-1/2 h-2/3 bg-slate-200/10 rounded-tl-[80px] border-t border-l border-white/10 pointer-events-none" />

        {/* Floating party flags (Bandeirinhas) reflecting the street World Cup decor vibe */}
        <div className="absolute top-0 left-0 right-0 flex justify-between px-3 overflow-hidden pointer-events-none opacity-90 h-3">
          {[...Array(14)].map((_, i) => (
            <div 
              key={i} 
              className={`w-2.5 h-2.5 transform rotate-45 -translate-y-1.5 shadow-sm ${
                i % 3 === 0 ? "bg-yellow-400" : i % 3 === 1 ? "bg-sky-400" : "bg-emerald-400"
              }`}
            />
          ))}
        </div>

        <div className="max-w-md mx-auto flex items-center justify-between mt-1 relative z-10">
          <div className="flex items-center gap-3">
            {/* Golden Trophy Inspired Frame */}
            <div className="relative shrink-0">
              <div className="absolute -inset-0.5 bg-gradient-to-tr from-yellow-400 via-amber-300 to-yellow-500 rounded-2xl blur opacity-75 animate-pulse" />
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-b from-white to-slate-100 border border-white flex items-center justify-center shadow-md">
                <span className="text-3xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">🏆</span>
              </div>
            </div>

            <div className="text-left">
              <div className="font-black text-[9px] tracking-widest text-yellow-300 uppercase flex items-center gap-1.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                <span className="bg-sky-600 text-white px-1.5 py-0.5 rounded font-mono font-black border border-sky-400 shadow-sm">COPA 2026</span>
                <span className="text-white font-extrabold flex items-center gap-1">
                  RUMO AO HEXA! <span className="animate-pulse">🇧🇷</span>
                </span>
              </div>
              <h1 className="text-xl font-black text-white tracking-tight leading-none mt-1 drop-shadow-[0_2px_3px_rgba(0,0,0,0.6)] flex items-center gap-1.5">
                🏟️ RUA ALAGOAS
              </h1>
              <div className="text-[10px] text-emerald-100 font-extrabold font-mono mt-1 flex items-center gap-1 bg-black/25 px-2 py-0.5 rounded-full w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Ativo: @{currentUser} • QG Escalado
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Soccer Match Ball inspired Button */}
            <div className="relative">
              <button
                onClick={() => setShowConfetti(!showConfetti)}
                className={`px-2.5 py-2 rounded-xl cursor-pointer text-xs flex items-center gap-1.5 transition-all outline-none border ${
                  showConfetti 
                    ? "bg-yellow-400 border-yellow-300 text-slate-900 font-extrabold shadow-lg scale-105" 
                    : "bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
                }`}
              >
                <span className="text-sm">⚽</span>
                <span className="font-extrabold text-[9px] tracking-wider uppercase">CONFETES</span>
              </button>
            </div>

            {/* Admin Settings Button */}
            <div className="relative">
              <button
                onClick={() => {
                  if (isAdminLoggedIn) {
                    setShowAdminPanel(true);
                  } else {
                    setShowAdminLoginModal(true);
                  }
                }}
                className={`px-2.5 py-2 rounded-xl cursor-pointer text-xs flex items-center gap-1.5 transition-all outline-none border ${
                  isAdminLoggedIn
                    ? "bg-indigo-600 border-indigo-400 text-white font-extrabold shadow-lg animate-pulse animate-duration-1000"
                    : "bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
                }`}
                title="Painel Administrativo"
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="font-extrabold text-[9px] tracking-wider uppercase">Configurar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TOP NAV BAR - PAINEL DE BOTÕES RÁPIDOS DE HOME E OUTRAS PÁGINAS */}
      <div className="bg-white border-b border-rose-100 sticky top-0 z-30 py-2.5 px-3 shadow-md">
        <div className="max-w-md mx-auto flex items-center justify-between gap-1 overflow-x-auto scrollbar-none">
          {[
            { id: "inicio", label: "🏡 Home", color: "bg-emerald-500 text-white border-emerald-600" },
            { id: "arrecadacao", label: "💰 Caixinha", color: "bg-amber-500 text-white border-amber-600" },
            { id: "bolao", label: "⚽ Bolão", color: "bg-blue-500 text-white border-blue-600" },
            { id: "feed", label: "📸 Mural", color: "bg-rose-500 text-white border-rose-600" },
            { id: "perfil", label: "👤 Perfil", color: "bg-violet-500 text-white border-violet-600" }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  addDbLog(`SELECT * FROM page_view WHERE path = '${tab.id}';`);
                }}
                className={`px-3.5 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-tight whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive 
                    ? `${tab.color} scale-105 shadow-md` 
                    : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW PRINCIPAL DO CONTEÚDO */}
      <main className="max-w-md mx-auto px-4 pt-4 relative z-10" id="main-scrollable-area">
        
        {/* TAB 1: INÍCIO (FESTIVO, HIGH-ENERGY, MASCOTE, CARDS, CONQUISTAS) */}
        {activeTab === "inicio" && (
          <div className="space-y-5 animate-fade-in" id="inicio-view">
            
            {/* HERO BANNER OCCUPYING ALMOST ENTIRE UPPER VIEW */}
            <div className="bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between" id="hero-banner-cup">
              {/* Brazil background style element */}
              <div className="absolute top-0 right-0 w-44 h-44 bg-yellow-400/20 rounded-full blur-[40px] pointer-events-none" />
              <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-blue-300/30 rounded-full blur-[60px] pointer-events-none" />
              
              {/* Interactive Waving Brazil Flags */}
              <div className="absolute right-4 top-4 flex gap-1 pointer-events-none">
                <span className="text-2xl animate-bounce" style={{ animationDelay: "0s" }}>🇧🇷</span>
                <span className="text-2xl animate-bounce" style={{ animationDelay: "0.2s" }}>🏆</span>
                <span className="text-2xl animate-bounce" style={{ animationDelay: "0.4s" }}>🇧🇷</span>
              </div>

              <div className="space-y-4">
                <span className="text-[10px] bg-yellow-300 text-emerald-950 px-2 py-1 rounded-full font-black tracking-wider uppercase inline-block">
                  🔥 O MAIOR EVENTO DO ANO
                </span>

                <h2 className="text-3xl font-black uppercase tracking-tight leading-none text-white">
                  A RUA MAIS FESTIVA DO BRASIL!
                </h2>

                <p className="text-xs text-emerald-50 opacity-90 leading-relaxed font-sans max-w-[240px]">
                  Pintamos o asfalto, hasteamos as bandeirinhas e estamos gerando vibração rumo ao título!
                </p>

                {/* COUNTDOWN TIMER FOR NEXT GAME OF BRAZIL */}
                <div className="bg-slate-950/40 p-3 rounded-2xl border border-white/20 inline-block text-center font-mono">
                  <div className="text-[9px] text-yellow-300 font-bold uppercase tracking-wider mb-1">
                    ⚡ PRÓXIMO JOGO DO BRASIL:
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="text-center">
                      <span className="text-lg font-black text-white">{timeLeft.dias}</span>
                      <span className="text-[8px] text-emerald-200 block font-sans">dias</span>
                    </div>
                    <span className="text-lg font-black text-yellow-300 animate-pulse">:</span>
                    <div className="text-center">
                      <span className="text-lg font-black text-white">{timeLeft.horas}</span>
                      <span className="text-[8px] text-emerald-200 block font-sans">horas</span>
                    </div>
                    <span className="text-lg font-black text-yellow-300 animate-pulse">:</span>
                    <div className="text-center">
                      <span className="text-lg font-black text-white">{timeLeft.minutos}</span>
                      <span className="text-[8px] text-emerald-200 block font-sans">min</span>
                    </div>
                    <span className="text-lg font-black text-yellow-305 animate-pulse">:</span>
                    <div className="text-center">
                      <span className="text-lg font-black text-yellow-300">{timeLeft.segundos}</span>
                      <span className="text-[8px] text-emerald-200 block font-sans">seg</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Real high quality background street image loaded securely */}
              <div className="mt-4 rounded-xl overflow-hidden border border-white/25 shadow">
                <img 
                  src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=500&q=80" 
                  alt="Rua Verde Amarela Decorada de Copa" 
                  className="w-full h-32 object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* MASCOT CHATTER INTERACTIVE COMPONENT - FUN AND ENGAGING */}
              <div 
                onClick={triggerMascotQuote}
                className="mt-4 bg-slate-950/80 rounded-2xl p-3 border border-yellow-405/30 hover:border-yellow-405 transition-all cursor-pointer flex gap-3 items-center relative"
                id="interactive-mascot-widget"
              >
                <div className="text-3xl animate-bounce font-serif shrink-0">🐥</div>
                <div className="space-y-0.5">
                  <span className="text-[9px] text-yellow-300 uppercase font-black tracking-widest font-mono">Canarinho Pistola 2.0</span>
                  <p className="text-xs text-slate-100 leading-snug">
                    "{mascoteMessage}"
                  </p>
                  <p className="text-[8px] text-white/50 italic font-mono mt-1">💡 Clique no canarinho para outra fofoca!</p>
                </div>
              </div>

            </div>

            {/* BENTO GRID: CARDS GRANDES E COLORIDOS (FIFA UT & DUOLINGO FEEL) */}
            <div className="space-y-2">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider font-sans block">
                🚀 ATIVIDADES DO MULTIRÃO
              </span>
              
              <div className="grid grid-cols-2 gap-3" id="bento-grid-nav">
                
                {/* ⚽ CARD BOLÃO */}
                <div 
                  onClick={() => setActiveTab("bolao")}
                  className="bg-gradient-to-tr from-[#2979ff] to-[#00e5ff] text-white p-4 rounded-2xl flex flex-col justify-between h-32 shadow-md relative overflow-hidden hover:scale-[1.03] active:scale-95 transition-all cursor-pointer"
                >
                  <div className="absolute right-0 bottom-0 text-7xl translate-y-2 translate-x-2 opacity-25">⚽</div>
                  <div className="space-y-1">
                    <span className="text-[10px] bg-slate-950/30 px-1.5 py-0.5 text-white font-heavy uppercase font-mono rounded">FUT VIBE</span>
                    <h3 className="font-black text-lg uppercase tracking-tight">BOLÃO</h3>
                  </div>
                  <div>
                    <span className="text-xs bg-white text-blue-600 font-bold py-1 px-2.5 rounded-full inline-block">Palpitar ⚽</span>
                  </div>
                </div>

                {/* 📸 CARD FOTOS / FEED */}
                <div 
                  onClick={() => setActiveTab("feed")}
                  className="bg-gradient-to-tr from-rose-500 to-pink-400 text-white p-4 rounded-2xl flex flex-col justify-between h-32 shadow-md relative overflow-hidden hover:scale-[1.03] active:scale-95 transition-all cursor-pointer"
                >
                  <div className="absolute right-0 bottom-0 text-7xl translate-y-3 translate-x-1 opacity-25">📸</div>
                  <div className="space-y-1">
                    <span className="text-[10px] bg-slate-950/30 px-1.5 py-0.5 text-white font-heavy uppercase font-mono rounded">INSTA FEED</span>
                    <h3 className="font-black text-lg uppercase tracking-tight">MURAL DA GERAL</h3>
                  </div>
                  <div>
                    <span className="text-xs bg-white text-rose-600 font-bold py-1 px-2.5 rounded-full inline-block">Ver Feed 🖼️</span>
                  </div>
                </div>

                {/* 🏆 CARD BOLÃO (UPDATED FROM CASA & RUAS) */}
                <div 
                  onClick={() => setActiveTab("bolao")}
                  className="bg-gradient-to-tr from-yellow-500 to-amber-400 text-slate-950 p-4 rounded-2xl flex flex-col justify-between h-32 shadow-md relative overflow-hidden hover:scale-[1.03] active:scale-95 transition-all cursor-pointer"
                >
                  <div className="absolute right-0 bottom-0 text-7xl translate-y-2 translate-x-1 opacity-20">🏆</div>
                  <div className="space-y-1">
                    <span className="text-[10px] bg-slate-950/20 px-1.5 py-0.5 text-slate-950 font-heavy uppercase font-mono rounded">CONCURSOS</span>
                    <h3 className="font-black text-lg uppercase tracking-tight">BOLÃO</h3>
                  </div>
                  <div>
                    <span className="text-xs bg-slate-950 text-yellow-300 font-bold py-1 px-2.5 rounded-full inline-block">Palpitar ⚽</span>
                  </div>
                </div>

                {/* 🎉 CAIXINHA / ARRECADAÇÃO (UPDATED FROM EVENTOS) */}
                <div 
                  onClick={() => setActiveTab("arrecadacao")}
                  className="bg-gradient-to-tr from-emerald-500 to-teal-400 text-white p-4 rounded-2xl flex flex-col justify-between h-32 shadow-md relative overflow-hidden hover:scale-[1.03] active:scale-95 transition-all cursor-pointer"
                >
                  <div className="absolute right-0 bottom-0 text-7xl translate-y-2 translate-x-2 opacity-25">💰</div>
                  <div className="space-y-1">
                    <span className="text-[10px] bg-slate-950/30 px-1.5 py-0.5 text-white font-heavy uppercase font-mono rounded">MUTIRÕES</span>
                    <h3 className="font-black text-lg uppercase tracking-tight">CAIXINHA</h3>
                  </div>
                  <div>
                    <span className="text-xs bg-white text-emerald-600 font-bold py-1 px-2.5 rounded-full inline-block">Contribuir 💵</span>
                  </div>
                </div>



              </div>
            </div>

            {/* ⚡ SUPABASE REAL-TIME DATABASE INTEGRATION PANEL (OCULTADO CONFORME SOLICITADO) */}
            {false && (
              <div className="bg-slate-900 border border-indigo-500/30 text-white rounded-3xl p-5 shadow-lg space-y-4 text-left relative overflow-hidden" id="supabase-collaboration-panel">
                <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-indigo-500/20 to-teal-500/20 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-indigo-550/30 rounded-xl">
                      <Database className="w-5 h-5 text-indigo-400 stroke-[2px]" />
                    </span>
                    <div>
                      <h3 className="font-black text-sm uppercase tracking-wider text-slate-100">
                        Integração Supabase
                      </h3>
                      <p className="text-[10px] text-indigo-300 font-medium font-mono">BETA REAL-TIME ATIVO</p>
                    </div>
                  </div>

                  <div>
                    {supabaseConnected ? (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse inline-block">
                        ⚡ CONECTADO
                      </span>
                    ) : supabaseConnected === false ? (
                      <span className="text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30 font-black px-2.5 py-1 rounded-full uppercase tracking-wider inline-block">
                        ❌ SIMULADO (Local)
                      </span>
                    ) : (
                      <span className="text-[10px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-black px-2.5 py-1 rounded-full uppercase tracking-wider inline-block">
                        ⏳ CHECANDO CONEXÃO
                      </span>
                    )}
                  </div>
                </div>

                {/* Informative connection parameters showing the exact user API keys in use */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 font-mono text-[10px]">
                  <div className="flex justify-between items-center text-zinc-400">
                    <span>URL DO PROJETO:</span>
                    <span className="text-indigo-300 text-xs font-bold font-mono">https://sasroebskiajgufstqnm.supabase.co</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-400 border-t border-slate-900 pt-1.5">
                    <span>ANON KEY (REMOVIDA):</span>
                    <span className="text-zinc-500">sb_publishable_7-Kl_...anbF2wfi</span>
                  </div>
                  {supabaseErrorMsg && (
                    <div className="text-[9px] text-yellow-400 pt-1 bg-yellow-500/5 leading-relaxed">
                      ⚠️ {supabaseErrorMsg}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      testSupabaseConnection();
                      syncFromSupabase();
                    }}
                    disabled={supabaseLoading}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-555 text-white active:scale-95 transition-all cursor-pointer font-bold py-2.5 px-3 rounded-xl text-xs flex justify-center items-center gap-1.5 shadow"
                  >
                    <Zap className={`w-3.5 h-3.5 ${supabaseLoading ? "animate-spin" : ""}`} />
                    {supabaseLoading ? "Sincronizando..." : "Sincronizar Mural 🔄"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowSqlScript(!showSqlScript)}
                    className="bg-slate-800 hover:bg-slate-750 text-slate-300 active:scale-95 transition-all cursor-pointer font-bold py-2.5 px-3 rounded-xl text-xs"
                  >
                    {showSqlScript ? "Ocultar Instruções" : "Instruções SQL 📜"}
                  </button>
                </div>

                {/* Collapsible area showing high helpful copyable DDL sql schemas */}
                {showSqlScript && (
                  <div className="bg-slate-950 p-4 rounded-xl border border-indigo-500/20 space-y-3 font-sans animate-fade-in text-xs max-h-72 overflow-y-auto">
                    <p className="text-zinc-300 leading-relaxed">
                      Para habilitar a persistência em nuvem definitiva, vá até o seu painel do Supabase, acesse o <strong>SQL Editor</strong> e execute o comando abaixo para criar a tabela de posts:
                    </p>
                    
                    <div className="relative">
                      <pre className="bg-[#020617] p-3 rounded-lg font-mono text-[9px] text-indigo-200 border border-indigo-950 overflow-x-auto whitespace-pre select-all text-left">
  {`CREATE TABLE public.posts (
    id TEXT PRIMARY KEY,
    autor TEXT,
    avatares TEXT,
    rua TEXT,
    imagem TEXT,
    legenda TEXT,
    curtidas INTEGER DEFAULT 1,
    comentarios TEXT DEFAULT '[]',
    tempo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
  );

  -- Permite acesso geral sem autenticação rígida para o protótipo
  ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Leitura irrestrita" ON public.posts FOR SELECT USING (true);
  CREATE POLICY "Inserção irrestrita" ON public.posts FOR INSERT WITH CHECK (true);
  CREATE POLICY "Atualização irrestrita" ON public.posts FOR UPDATE USING (true);

  -- Habilitar atualizações em tempo real
  ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;`}
                      </pre>
                    </div>

                    <p className="text-[10px] text-zinc-500 leading-normal">
                      💡 Uma vez criada a tabela, toda foto curtida, comentário e nova publicação do mural será persistido na nuvem e lido diretamente por todos os moradores de forma síncrona!
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* DUOLINGO ACHIEVEMENT CENTER (ÁREA DE CONQUISTAS) */}
            <div className="bg-white rounded-3xl p-5 border border-slate-150 shadow-sm space-y-4 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500 fill-yellow-200" />
                  <h3 className="font-black text-sm uppercase tracking-wider text-slate-800">
                    Minhas Conquistas (Estilo Duolingo)
                  </h3>
                </div>
                <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                  NÍVEL 4
                </span>
              </div>

              <div className="space-y-3">
                {/* Conquista 1 */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-xl shrink-0">
                    🎨
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-black text-slate-700">Pintor de Elite</span>
                      <span className="font-bold text-emerald-600">Completo</span>
                    </div>
                    {/* Progress indicator bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1 border border-slate-200">
                      <div className="bg-emerald-500 h-full w-full" />
                    </div>
                  </div>
                </div>

                {/* Conquista 2 */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-105 bg-yellow-100 flex items-center justify-center text-xl shrink-0">
                    🥩
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-black text-slate-700">Patrono do Churrasco</span>
                      <span className="text-slate-500 font-mono">4 / 5 espetos</span>
                    </div>
                    {/* Progress indicator bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1 border border-slate-200">
                      <div className="bg-yellow-405 bg-yellow-500 h-full w-[80%]" />
                    </div>
                  </div>
                </div>

                {/* Conquista 3 */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl shrink-0 opacity-55">
                    🎉
                  </div>
                  <div className="flex-1 opacity-60">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-black text-slate-700">Muralista Ativo (Rede Social)</span>
                      <span className="text-slate-500 font-mono">0 / 3 posts</span>
                    </div>
                    {/* Progress indicator bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1 border border-slate-200">
                      <div className="bg-blue-500 h-full w-0" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* LEADERBOARD VISUAL - FAMÍLIAS DO QUARTEIRÃO */}
            <div className="bg-white rounded-3xl p-6 border border-slate-150 shadow-sm space-y-4 text-left">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="font-black text-sm uppercase tracking-wider text-slate-800">
                    👑 Gincana de Famílias
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Ganhando pontos de mutirão de calçada e curtidas!
                  </p>
                </div>
                
                <span className="text-xs text-yellow-600 font-bold bg-yellow-100 px-2 py-0.5 rounded-full">
                  Prêmio: R$ 300 em Pix de Carne
                </span>
              </div>

              {/* LIST OF TOP FAMILIES WITH REAL-LIFE-STYLE AVATARS AND STATS */}
              <div className="space-y-3 pt-2">
                {rankingsFamilia.map((fam, index) => (
                  <div 
                    key={fam.nome} 
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all border border-slate-100"
                    id={`family-rank-${index}`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar design */}
                      <div className="w-11 h-11 rounded-xl border border-slate-200 overflow-hidden shrink-0 relative">
                        <img 
                          src={fam.avatar} 
                          alt={fam.nome} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute bottom-0 right-0 bg-yellow-405 bg-yellow-400 px-1 py-0.2 text-[8px] font-black rounded text-emerald-950 font-mono">
                          {fam.OVR}
                        </span>
                      </div>

                      <div className="text-left">
                        <div className="text-[11px] text-emerald-700 font-bold uppercase">{fam.rank}</div>
                        <h4 className="font-black text-sm text-slate-800 tracking-tight">{fam.nome}</h4>
                        <span className="text-[9px] text-slate-400 italic block">{fam.rua}</span>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-sm font-black text-[#10b981]">{fam.pontos} Pts</span>
                      <span className="text-[9px] text-slate-500 block">UPDATED</span>
                    </div>

                  </div>
                ))}
              </div>
            </div>

            {/* INGRESSOS & MUTIRÕES EXCLUÍDOS */}

          </div>
        )}

        {/* TAB 2: INSTA-LIKE SOCIAL FEED WITH REAL-TIME ENGAGEMENT */}
        {activeTab === "feed" && (
          <div className="space-y-4 animate-fade-in" id="feed-view bg-white">
            
            {/* COMPARTILHE O SEU MOMENTO BUTTON */}
            <div className="p-4 bg-white border border-slate-200 rounded-3xl flex justify-between items-center text-left">
              <div className="flex gap-3 items-center">
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-lg">
                  📸
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800">O que está rolando na sua rua?</h3>
                  <p className="text-[10px] text-slate-400">Poste decorações, comida ou memes!</p>
                </div>
              </div>

              <button
                onClick={() => setShowUploadModal(true)}
                className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-555 text-white font-heavy font-sans font-bold text-xs rounded-full uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                id="btn-trigger-upload-modal"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Postar</span>
              </button>
            </div>

            {/* MODAL PARA FAZER UPLOAD DE NOVO MOMENTO ENGAJANTE */}
            <AnimatePresence>
              {showUploadModal && (
                <div className="fixed inset-0 bg-slate-900/65 flex items-center justify-center p-4 z-50">
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 border border-emerald-500 text-left"
                    id="upload-modal-container"
                  >
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="text-xs font-black text-emerald-600 uppercase tracking-widest font-mono">Novo Post Coletivo 🇧🇷</span>
                      <button 
                        onClick={() => setShowUploadModal(false)}
                        className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
                      >
                        Fechar X
                      </button>
                    </div>

                    <form onSubmit={handleCreatePost} className="space-y-3 text-xs">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase">Qual a legenda do seu post?</label>
                        <textarea
                          placeholder="Mande sua mensagem fofa de mutirão ou piada saudosa do quarteirão!"
                          rows={3}
                          value={newPostText}
                          onChange={(e) => setNewPostText(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-emerald-500 font-sans text-slate-800"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase">Cole a URL de uma Imagem de Fan (Unsplash, etc.)</label>
                        <input
                          type="text"
                          placeholder="Cole o endereço da imagem que quer emoldurar no feed"
                          value={newPostImage}
                          onChange={(e) => setNewPostImage(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-emerald-500 font-sans font-mono text-[10px]"
                        />

                        {/* Quick preset suggestions */}
                        <div className="flex gap-1.5 mt-1">
                          {[
                            { label: "🍻 Churras", url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80" },
                            { label: "🎨 Tintura", url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=500&q=80" },
                            { label: "⚽ Torcedores", url: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=500&q=80" }
                          ].map(preset => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => setNewPostImage(preset.url)}
                              className="px-2 py-1 bg-slate-100 font-mono text-[9px] hover:bg-slate-200 text-slate-600 rounded cursor-pointer"
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-yellow-500 text-slate-950 font-black uppercase text-xs tracking-wider cursor-pointer mt-3 shadow"
                      >
                        Publicar no Mural Geral da Copa! 💚💛
                      </button>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* LISTA DE POSTS ESTILO INSTAGRAM / TIKTOK */}
            <div className="space-y-4" id="instagram-feed-list">
              {posts.map((post) => {
                const isLiked = likedPosts[post.id];
                return (
                  <div 
                    key={post.id} 
                    className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm text-left font-sans"
                    id={`post-card-${post.id}`}
                  >
                    
                    {/* User profile identifier header */}
                    <div className="p-3.5 flex justify-between items-center border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={post.avatares} 
                          alt={post.autor} 
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h4 className="text-xs font-black text-slate-800 tracking-tight">{post.autor}</h4>
                          <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded uppercase font-bold font-mono">
                            {post.rua}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono">{post.tempo}</span>
                    </div>

                    {/* BIG PHOTO AREA */}
                    <div className="relative bg-slate-950 flex items-center justify-center aspect-square">
                      <img 
                        src={post.imagem} 
                        alt="Conteúdo de Copa de Rua" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Interactive double-tap absolute visual highlight of a heart */}
                      {isLiked && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                          <motion.span 
                            initial={{ scale: 0.1, opacity: 0 }}
                            animate={{ scale: [1, 1.4, 0.9], opacity: [0, 1, 0] }}
                            transition={{ duration: 0.8 }}
                            className="text-white text-7xl drop-shadow-xl select-none"
                          >
                            ❤️
                          </motion.span>
                        </div>
                      )}
                    </div>

                    {/* ACTIONS BAR (LIKE, COMMENT, SHARE) */}
                    <div className="p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          {/* Like Button */}
                          <button
                            onClick={() => toggleLikePost(post.id)}
                            className="flex items-center gap-1.5 text-xs font-bold focus:outline-none cursor-pointer text-slate-650"
                            id={`btn-like-${post.id}`}
                          >
                            <Heart className={`w-6 h-6 stroke-[2.5px] transition-all duration-200 ${
                              isLiked ? "fill-rose-500 stroke-rose-500 scale-125" : "text-slate-600 hover:text-rose-500"
                            }`} />
                            <span className="text-sm font-black font-mono">
                              {post.curtidas}
                            </span>
                          </button>

                          {/* Comment trigger status */}
                          <button
                            onClick={() => {
                              const inputEl = document.getElementById(`comment-input-${post.id}`);
                              if (inputEl) inputEl.focus();
                            }}
                            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-600 cursor-pointer focus:outline-none transition-all duration-150"
                            title="Comentar"
                          >
                            <MessageCircle className="w-5 h-5 text-slate-600 stroke-[2.5px] hover:text-emerald-600 transition-colors" />
                            <span className="text-xs font-mono font-bold text-slate-700">
                              {post.comentarios.length}
                            </span>
                          </button>

                        </div>

                        {/* Fast share trigger button for UI simulation */}
                        <button 
                          onClick={() => {
                            try {
                              navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
                            } catch (err) {}
                            setCopiedPostId(post.id);
                            setTimeout(() => setCopiedPostId(null), 2000);
                            addDbLog(`SELECT generate_share_token('${post.id}');`);
                            triggerRealtimeNotification({
                              type: "novo_post",
                              title: "🔗 Link Copiado!",
                              description: "Queridinho da galera! O link do post foi copiado para sua Área de Transferência!",
                              metadata: { user: currentUser, linkView: "social" }
                            });
                          }}
                          className={`${copiedPostId === post.id ? "text-emerald-600 scale-105 font-black" : "text-slate-500 hover:text-emerald-600"} cursor-pointer text-xs flex items-center gap-1 font-bold transition-all duration-150`}
                        >
                          <Share2 className={`w-4 h-4 ${copiedPostId === post.id ? "text-emerald-500 fill-emerald-100 animate-bounce" : "text-slate-600"}`} />
                          <span>{copiedPostId === post.id ? "Copiado!" : "Compartilhar"}</span>
                        </button>
                      </div>

                      {/* Legenda/Caption */}
                      <p className="text-xs text-slate-700 leading-relaxed font-sans font-medium text-zinc-650">
                        <span className="font-black text-slate-800 tracking-tight mr-1.5">@{post.autor.split(" - ")[0]}</span>
                        {post.legenda}
                      </p>

                      {/* LIST OF COMMENTS */}
                      {post.comentarios.length > 0 && (
                        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-1.5 text-xs">
                          {post.comentarios.map((cmt, idx) => (
                            <div key={idx} className="leading-tight">
                              <span className="font-extrabold text-slate-800 mr-1 text-[11px]">@{cmt.usuario}: </span>
                              <span className="text-slate-600 font-sans text-[11px]">{cmt.texto}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* POST NEW COMMENT FORM */}
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                        <input 
                          type="text" 
                          id={`comment-input-${post.id}`}
                          placeholder="Mande uma força pro morador..." 
                          value={newCommentText[post.id] || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNewCommentText(prev => ({ ...prev, [post.id]: val }));
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') addComment(post.id);
                          }}
                          className="flex-1 text-xs border border-slate-150 rounded-xl px-3 py-2 bg-slate-50 text-slate-800 outline-none focus:border-emerald-500"
                        />
                        <button
                          onClick={() => addComment(post.id)}
                          className="p-2 rounded-xl bg-slate-100 text-emerald-600 hover:bg-emerald-100 cursor-pointer"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* TAB 3: BOLÃO & LEGENDARY NEIGHBORHOOD FUT CARDS */}
        {activeTab === "bolao" && (
          <div className="space-y-4 animate-fade-in" id="bolao-view">
            
            {/* HERO MATCH PREDICTION CARDS (FIFA UT STYLING) */}
            <div className="bg-gradient-to-br from-blue-700 via-indigo-800 to-indigo-950 p-6 rounded-3xl text-white shadow-xl space-y-4 text-left relative overflow-hidden" id="fut-betting-banner">
              <div className="absolute right-0 top-0 w-32 h-32 bg-yellow-300/10 rounded-full blur-2xl" />
              
              <div className="space-y-1">
                <span className="text-[10px] bg-yellow-405 bg-yellow-300 text-slate-950 px-2 py-0.5 rounded font-black font-mono">
                  CARTOLA FC RETRO FEELING
                </span>
                <h3 className="font-black text-2xl uppercase tracking-tight text-white leading-tight">
                  BOLÃO DAS RUAS 2026
                </h3>
                <p className="text-xs text-zinc-300 leading-normal font-sans">
                  Palpite nos resultados dos jogos do Brasil. Cada placar exato gera pontos multiplicados pela sua Odd da Rua!
                </p>
              </div>

              {/* LIST OF GAMES WITH ODDS PLACEMENT */}
              <div className="space-y-3.5 pt-2">
                {jogos.map((jogo) => (
                  <div 
                    key={jogo.id} 
                    className="p-4 bg-slate-950/70 rounded-2xl border border-white/10 space-y-3"
                    id={`game-item-${jogo.id}`}
                  >
                    
                    {/* Game team match representator */}
                    <div className="flex items-center justify-between text-center relative z-10">
                      
                      {/* Team A */}
                      <div className="flex-1 flex flex-col items-center">
                        <span className="text-3xl">{jogo.bandeiraA}</span>
                        <span className="text-xs font-black text-white mt-1 uppercase font-semibold">{jogo.timeA}</span>
                        <span className="text-[9px] text-[#22c55e] font-mono">Odds: 1.2</span>
                      </div>

                      {/* Core vs scores input */}
                      <div className="flex items-center gap-1.5 font-mono">
                        <input 
                          type="number"
                          placeholder="0"
                          value={jogo.golsA}
                          onChange={(e) => {
                            const val = e.target.value;
                            setJogos(prev => prev.map(jg => jg.id === jogo.id ? { ...jg, golsA: val } : jg));
                          }}
                          className="w-9 py-1 bg-slate-900 border border-white/20 text-center font-black text-white rounded focus:border-yellow-300 pointer-events-auto"
                        />
                        <span className="text-xs text-yellow-300 font-bold uppercase">VS</span>
                        <input 
                          type="number"
                          placeholder="0"
                          value={jogo.golsB}
                          onChange={(e) => {
                            const val = e.target.value;
                            setJogos(prev => prev.map(jg => jg.id === jogo.id ? { ...jg, golsB: val } : jg));
                          }}
                          className="w-9 py-1 bg-slate-900 border border-white/20 text-center font-black text-white rounded focus:border-yellow-300 pointer-events-auto"
                        />
                      </div>

                      {/* Team B */}
                      <div className="flex-1 flex flex-col items-center">
                        <span className="text-3xl">{jogo.bandeiraB}</span>
                        <span className="text-xs font-black text-white mt-1 uppercase font-semibold">{jogo.timeB}</span>
                        <span className="text-[9px] text-pink-400 font-mono">Odds: {jogo.multiplicador}</span>
                      </div>

                    </div>

                    {/* Prediction trigger buttons */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-[10px] font-mono">
                      <button 
                        onClick={() => handleOddsBet(jogo.id, "A")}
                        className="py-1.5 bg-emerald-600 hover:bg-emerald-500 font-bold text-white rounded cursor-pointer"
                      >
                        Vitória {jogo.timeA}
                      </button>
                      <button 
                        onClick={() => {
                          setJogos(prev => prev.map(j => j.id === jogo.id ? { ...j, golsA: 1, golsB: 1 } : j));
                          triggerRealtimeNotification({
                            type: "novo_post",
                            title: "⚽ Palpite Gravado!",
                            description: "Seu palpite de Empate foi configurado com sucesso!",
                            metadata: { user: currentUser }
                          });
                        }}
                        className="py-1.5 bg-slate-900 hover:bg-slate-805 font-bold text-white border border-white/10 rounded cursor-pointer"
                      >
                        Apostar Empate
                      </button>
                      <button 
                        onClick={() => handleOddsBet(jogo.id, "B")}
                        className="py-1.5 bg-rose-600 hover:bg-rose-500 font-bold text-white rounded cursor-pointer"
                      >
                        Vitória {jogo.timeB}
                      </button>
                    </div>

                  </div>
                ))}
              </div>

            </div>

            {/* FIFA ULTIMATE TEAM PLAYER CARDS DISPLAY OF NEIGHBORHOOD HEROES */}
            <div className="space-y-4 text-left">
              <div className="space-y-0.5">
                <span className="text-xs font-black uppercase text-slate-400 tracking-wider block">
                  🛡️ LENDAS DO BAIRRO - FIFA ULTIMATE TEAM DECK
                </span>
                <p className="text-[11px] text-slate-400 font-sans">
                  Colecione figurinhas brilhantes dos vizinhos mais prestativos e talentosos do multirão!
                </p>
              </div>

              {/* Grid of FUT cards */}
              <div className="grid grid-cols-2 gap-4" id="fut-cards-grid">
                {futCards.map((card) => (
                  <div 
                    key={card.id}
                    className={`${card.corGrade} rounded-3xl p-3 border-2 shadow-lg relative flex flex-col h-[280px] text-left transform hover:rotate-1 hover:scale-[1.02] transition-all`}
                    id={`fut-card-item-${card.id}`}
                  >
                    
                    {/* Upper Card Header badge info */}
                    <div className="flex justify-between items-start">
                      <div className="text-center font-mono">
                        <span className="text-3xl font-black block tracking-tighter leading-none">{card.ovr}</span>
                        <span className="text-[9px] font-bold tracking-tight uppercase block leading-none">{card.posicao}</span>
                      </div>
                      <span className="text-lg">🇧🇷</span>
                    </div>

                    {/* Player Image frame inside Card */}
                    <div className="w-24 h-24 mx-auto rounded-full border-2 border-dashed border-white/50 overflow-hidden mt-1 relative bg-white/10">
                      <img 
                        src={card.imagem} 
                        alt={card.nome} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Name */}
                    <div className="text-center mt-2">
                      <h4 className="font-extrabold text-sm tracking-tight capitalize">{card.nome}</h4>
                    </div>

                    {/* FIFA-style micro stats grids inside card */}
                    <div className="grid grid-cols-3 gap-0.5 mt-3 border-t border-dashed border-black/15 pt-2 text-center text-[10px] font-mono font-bold">
                      <div>
                        <span className="text-black/50 text-[8px] block">CHUR</span>
                        <span>{card.churrasco}</span>
                      </div>
                      <div>
                        <span className="text-black/50 text-[8px] block">DECO</span>
                        <span>{card.decoracao}</span>
                      </div>
                      <div>
                        <span className="text-black/50 text-[8px] block">GRIT</span>
                        <span>{card.gritaria}</span>
                      </div>
                    </div>

                    {/* Copas played */}
                    <p className="text-[9px] text-center italic mt-2 opacity-90 leading-tight border-t border-black/5 pt-1.5">
                      "Já sediou {card.copas} copas na calçada!"
                    </p>

                  </div>
                ))}
              </div>

              {/* Simulative Pack Opener for high Gen Z addictive fun factor */}
              <div 
                onClick={() => {
                  alert("🎉 Parabéns! Você abriu o Gold Pack Comunitário de 2026 e tirou um 'Seu Zé - Mestre Eletricista OVR 93'!");
                  addDbLog("SELECT open_fut_pack('morador_gold_rare');");
                }}
                className="bg-gradient-to-r from-amber-500 to-yellow-400 p-4 rounded-3xl text-slate-950 font-black text-center cursor-pointer shadow border border-yellow-300 uppercase tracking-wider text-xs flex justify-center items-center gap-2"
                id="fut-pack-opener-btn"
              >
                <Gift className="w-5 h-5 text-slate-950 animate-bounce" />
                <span>Abrir Pacotinho Comunitário FIFA de Coleção 📦</span>
              </div>

            </div>

          </div>
        )}

        {/* TAB 6: ARRECADAÇÃO DE RECURSOS/VAQUINHA DA COPA */}
        {activeTab === "arrecadacao" && (
          <div className="space-y-4 animate-fade-in text-slate-100 p-6 rounded-3xl bg-slate-950 border-2 border-emerald-500/30 shadow-2xl relative overflow-hidden" id="arrecadacao-view">
            {/* Ambient colorful globes/mesh for cup vibe */}
            <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-yellow-400/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="relative z-10">
              <ArrecadacaoModule />
            </div>
          </div>
        )}

        {/* TAB 5: PERFIL DO USUÁRIO & CÁPSULA DO TEMPO COFRE */}
        {activeTab === "perfil" && (
          <div className="space-y-6 animate-fade-in text-slate-800" id="perfil-view">
            
            {/* INSTAGRAM PROFILE HEADER CONTENT */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5" id="instagram-profile-card">
              
              <div className="flex items-center gap-5">
                {/* Profile Picture with Instagram Story Ring */}
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-400 via-emerald-500 to-blue-500 p-[3px] shadow-md flex items-center justify-center animate-pulse-subtle">
                    <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-slate-100">
                      <img 
                        src={userAvatar} 
                        alt="Foto de perfil" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                  <span className="absolute -bottom-1 -right-1 text-lg bg-yellow-400 rounded-full w-6 h-6 flex items-center justify-center shadow border border-white">
                    ⭐
                  </span>
                </div>

                {/* Profile Stats Row (Instagram style) */}
                <div className="flex-1 grid grid-cols-3 gap-1 text-center">
                  <div className="cursor-pointer" onClick={() => setProfileSubTab("posts")}>
                    <p className="text-base font-black text-slate-800 leading-none">{posts.length}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase">Posts</p>
                  </div>
                  <div className="border-x border-slate-100">
                    <p className="text-base font-black text-slate-800 leading-none">942</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase">Seguidores</p>
                  </div>
                  <div>
                    <p className="text-base font-black text-slate-800 leading-none">518</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase">Seguindo</p>
                  </div>
                </div>
              </div>

              {/* Bio & Details Section */}
              <div className="space-y-1.5 text-left">
                <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-1">
                  @{currentUser}
                  <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-sans font-bold border border-emerald-100 flex items-center gap-0.5">
                    ✓ Verificado Verde-Amarelo 🇧🇷
                  </span>
                </h3>
                <p className="text-xs text-slate-500 font-mono flex items-center gap-1">
                  <span className="text-emerald-500">📍 QG:</span> {currentRua}
                </p>
                <p className="text-xs text-slate-700 leading-relaxed font-sans">
                  🎨 Pintor e Decorador de Rua Oficial no Mutirão do Hexa • Erguendo bandeirinhas, pintando asfalto e unindo os vizinhos! Pra cima, Brasil! 🇧🇷✨
                </p>
              </div>

              {/* Edit Profile Button & Collapsible Container */}
              <div className="space-y-3 pt-1">
                <button
                  onClick={() => setShowEditProfile(!showEditProfile)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-205 border border-slate-200 text-slate-800 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-slate-600" />
                  <span>{showEditProfile ? "Fechar Edição" : "Editar Perfil"}</span>
                </button>

                <AnimatePresence>
                  {showEditProfile && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4 text-left"
                    >
                      <h4 className="text-xs font-black text-slate-700 uppercase tracking-wide">Configurações de Identidade</h4>
                      
                      {/* Avatar Picker section */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-black text-slate-400">Escolha seu Avatar da Copa:</label>
                        <div className="flex gap-3 py-1">
                          {[
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
                            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
                            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
                            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
                          ].map((imgUrl, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setUserAvatar(imgUrl);
                                addDbLog(`UPDATE profiles SET avatar_url = '${imgUrl}' WHERE auth_uid = 'morador_active_77';`);
                              }}
                              className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${
                                userAvatar === imgUrl ? "border-emerald-500 scale-110 ring-2 ring-emerald-200" : "border-slate-200 opacity-70 hover:opacity-100"
                              }`}
                            >
                              <img src={imgUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Nickname input */}
                      <div className="space-y-1.5 text-xs">
                        <label className="text-[10px] uppercase font-black text-slate-400">Apelido na Comunidade:</label>
                        <input 
                          type="text" 
                          value={currentUser} 
                          onChange={(e) => setCurrentUser(e.target.value)}
                          className="w-full bg-white border border-slate-250 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-emerald-500"
                          placeholder="Digite seu apelido..."
                        />
                      </div>

                      {/* Rua select link (Locked to Rua Alagoas) */}
                      <div className="space-y-1.5 text-xs">
                        <label className="text-[10px] uppercase font-black text-slate-400">Sua Rua:</label>
                        <input
                          type="text"
                          value="Rua Alagoas"
                          disabled
                          className="w-full bg-slate-100 border border-slate-200 font-extrabold text-slate-500 rounded-xl px-3 py-2 cursor-not-allowed select-none"
                        />
                      </div>

                      <button
                        onClick={() => {
                          setShowEditProfile(false);
                          triggerRealtimeNotification({
                            type: "meta_alcancada",
                            title: "✨ Perfil Atualizado!",
                            description: `Dados salvos no Supabase com sucesso, @${currentUser}!`,
                            metadata: { user: currentUser }
                          });
                          addDbLog(`UPDATE profiles SET nickname = '${currentUser}', rua_origem = '${currentRua}' WHERE auth_uid = 'morador_active_77';`);
                        }}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-heavy font-sans font-black uppercase text-[10px] tracking-wide rounded-xl cursor-pointer"
                      >
                        Salvar Alterações 💾
                      </button>

                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* INSTAGRAM STYLE HIGHLIGHT BUBBLES */}
              <div className="flex justify-between gap-3 overflow-x-auto pt-2 pb-1 scrollbar-none" id="instagram-style-highlights">
                {[
                  { label: "💚 Guia Verde-Amarela", emoji: "🎨", subtitle: "Asfalto" },
                  { label: "🏆 Minhas Conquistas", emoji: "🥇", subtitle: "Selo" },
                  { label: "⚽ Meus Palpites", emoji: "🎲", subtitle: "Bolão" },
                  { label: "🔒 Cápsula Secreta", emoji: "⏳", subtitle: "Destrava" }
                ].map((hl, k) => (
                  <div key={k} className="flex flex-col items-center shrink-0 w-16 text-center">
                    <div className="w-12 h-12 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-lg shadow-sm font-sans hover:bg-slate-100 hover:scale-105 transition-all cursor-pointer">
                      {hl.emoji}
                    </div>
                    <span className="text-[9px] font-bold text-slate-700 truncate w-full mt-1.5 leading-tight">{hl.label}</span>
                  </div>
                ))}
              </div>

            </div>

            {/* INSTAGRAM SUB-TABS NAVIGATION BAR */}
            <div className="flex border-b border-slate-200 bg-white rounded-t-3xl pt-2 pb-0">
              <button
                onClick={() => setProfileSubTab("posts")}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1 border-b-2 transition-all cursor-pointer ${
                  profileSubTab === "posts" ? "border-slate-800 text-slate-850" : "border-transparent text-slate-400 hover:text-slate-650"
                }`}
              >
                <Grid className="w-4 h-4" />
                <span className="text-[10px]">Fotos</span>
              </button>



              <button
                onClick={() => setProfileSubTab("conquistas")}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1 border-b-2 transition-all cursor-pointer ${
                  profileSubTab === "conquistas" ? "border-yellow-500 text-yellow-600" : "border-transparent text-slate-400 hover:text-slate-650"
                }`}
              >
                <Award className="w-4 h-4" />
                <span className="text-[10px]">Gabarito</span>
              </button>
            </div>

            {/* SUB-TAB CONTENTS */}

            {/* TAB CONTENT A: 3-COLUMN IMAGE GRID LIKE INSTAGRAM */}
            {profileSubTab === "posts" && (
              <div className="space-y-4 animate-fade-in" id="profile-instagram-feed-grid">
                <div className="grid grid-cols-3 gap-1 bg-white p-2.5 rounded-b-3xl border border-slate-200 border-t-0 shadow-sm">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => setSelectedGridPost(post)}
                      className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden group cursor-pointer shadow-sm hover:brightness-95 transition-all duration-150"
                    >
                      <img src={post.imagem} className="w-full h-full object-cover transition duration-300 group-hover:scale-110" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 text-white font-mono text-[10px] font-black transition-opacity duration-150">
                        <span className="flex items-center gap-0.5">❤️ {post.curtidas}</span>
                        <span className="flex items-center gap-0.5">💬 {post.comentarios.length}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* MODAL DETALHADO DO POST CLICADO NO GRID (STYLISH INSTAGRAM POPUP) */}
                <AnimatePresence>
                  {selectedGridPost && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4"
                    >
                      <motion.div
                        initial={{ scale: 0.95, y: 15 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 15 }}
                        className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl text-left flex flex-col max-h-[85vh]"
                      >
                        {/* Header bar */}
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img src={selectedGridPost.avatares} className="w-7 h-7 rounded-full object-cover" referrerPolicy="no-referrer" />
                            <div>
                              <h4 className="text-xs font-extrabold text-slate-800">{selectedGridPost.autor}</h4>
                              <p className="text-[10px] text-slate-400 font-mono">{selectedGridPost.rua}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setSelectedGridPost(null)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold p-1 px-3 rounded-full text-xs cursor-pointer"
                          >
                            Fechar ×
                          </button>
                        </div>

                        {/* Image content */}
                        <div className="w-full bg-slate-950 flex items-center justify-center aspect-square overflow-hidden relative">
                          <img src={selectedGridPost.imagem} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>

                        {/* Interaction Bar (Heart, Comments, Share) */}
                        <div className="p-3 border-b border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => {
                                toggleLikePost(selectedGridPost.id);
                                setSelectedGridPost(prev => prev ? {
                                  ...prev,
                                  curtidas: likedPosts[prev.id] ? prev.curtidas - 1 : prev.curtidas + 1
                                } : null);
                              }}
                              className="flex items-center gap-1 text-slate-700 hover:text-rose-500 cursor-pointer border-none bg-transparent"
                            >
                              <Heart className={`w-5 h-5 ${likedPosts[selectedGridPost.id] ? "text-rose-500 fill-rose-500" : "text-slate-600"}`} />
                              <span className="text-xs font-mono font-bold">{selectedGridPost.curtidas}</span>
                            </button>

                            <div className="flex items-center gap-1 text-slate-500">
                              <MessageCircle className="w-5 h-5 text-slate-600" />
                              <span className="text-xs font-mono font-bold">{selectedGridPost.comentarios.length}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              try {
                                navigator.clipboard.writeText(`${window.location.origin}/post/${selectedGridPost.id}`);
                              } catch (err) {}
                              setCopiedPostId(selectedGridPost.id);
                              setTimeout(() => setCopiedPostId(null), 2000);
                              addDbLog(`SELECT generate_share_token('${selectedGridPost.id}');`);
                              triggerRealtimeNotification({
                                type: "novo_post",
                                title: "🔗 Link Copiado!",
                                description: "Link do post da gincana foi copiado para a Área de Transferência!",
                                metadata: { user: currentUser }
                              });
                            }}
                            className="text-xs text-slate-500 hover:text-emerald-600 flex items-center gap-1 font-bold cursor-pointer border-none bg-transparent"
                          >
                            <Share2 className="w-4 h-4 text-slate-600" />
                            <span>{copiedPostId === selectedGridPost.id ? "Copiado!" : "Compartilhar"}</span>
                          </button>
                        </div>

                        {/* Scrolling caption + comments block */}
                        <div className="p-4 flex-1 overflow-y-auto space-y-3.5 text-xs">
                          {/* Caption */}
                          <div>
                            <span className="font-extrabold text-slate-800 mr-1.5">{selectedGridPost.autor}</span>
                            <span className="text-slate-700 leading-snug">{selectedGridPost.legenda}</span>
                            <span className="text-[10px] text-slate-400 block mt-1">{selectedGridPost.tempo}</span>
                          </div>

                          {/* List comments */}
                          {selectedGridPost.comentarios.length > 0 && (
                            <div className="space-y-2 pt-2 border-t border-slate-50">
                              {selectedGridPost.comentarios.map((cmt, idx) => (
                                <div key={idx} className="bg-slate-50 p-2 rounded-xl">
                                  <span className="font-black text-slate-800 mr-1">{cmt.usuario}</span>
                                  <span className="text-slate-600">{cmt.texto}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Modal Comment Form */}
                        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Adicione um comentário..."
                            value={newCommentText[selectedGridPost.id] || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setNewCommentText(prev => ({ ...prev, [selectedGridPost.id]: val }));
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                addComment(selectedGridPost.id);
                                setSelectedGridPost(prev => prev ? {
                                  ...prev,
                                  comentarios: [...prev.comentarios, { usuario: currentUser, texto: newCommentText[prev.id] || "" }]
                                } : null);
                              }
                            }}
                            className="flex-1 bg-white border border-slate-205 rounded-xl px-3 py-2 text-xs outline-none focus:border-emerald-500"
                          />
                          <button
                            onClick={() => {
                              addComment(selectedGridPost.id);
                              setSelectedGridPost(prev => prev ? {
                                  ...prev,
                                  comentarios: [...prev.comentarios, { usuario: currentUser, texto: newCommentText[prev.id] || "" }]
                                } : null);
                            }}
                            className="p-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>

                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            )}



            {/* TAB CONTENT C: DETAILED DUOLINGO ACHIEVEMENTS / CONQUISTAS */}
            {profileSubTab === "conquistas" && (
              <div className="bg-white rounded-3xl p-5 border border-slate-205 shadow-sm space-y-4 text-left animate-fade-in" id="profile-conquistas-tab">
                
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="w-12 h-12 rounded-full bg-yellow-101 bg-yellow-105 flex items-center justify-center text-xl">
                    🏆
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Super Gincana da Copa</h3>
                    <p className="text-[10.5px] text-slate-400 font-mono">Status do Morador Honorário</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Stats Level Progress */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                    <div className="flex justify-between text-xs font-bold font-sans">
                      <span className="text-slate-500">NÍVEL ATUAL</span>
                      <span className="text-emerald-600 font-black">NÍVEL 4 (VETERANO)</span>
                    </div>
                    <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden border border-slate-105">
                      <div className="bg-gradient-to-r from-emerald-500 to-yellow-400 h-full w-[78%]" />
                    </div>
                    <p className="text-[10px] text-slate-400 text-right">Faltam 220 XP para subir de nível</p>
                  </div>

                  {/* Achievements Cards list */}
                  <div className="space-y-3">
                    
                    {/* Achievement 1 */}
                    <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white border border-slate-150 hover:bg-slate-50 transition-all">
                      <span className="text-2xl bg-emerald-100 rounded-full w-10 h-10 flex items-center justify-center shrink-0">🎨</span>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-black text-slate-800 uppercase">Mestre das Guias</h4>
                          <span className="text-[9px] text-emerald-650 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">Completo</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-snug mt-0.5">Pintou mais de 10 metros de guias nas ruas do bairro.</p>
                      </div>
                    </div>

                    {/* Achievement 2 */}
                    <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white border border-slate-150 hover:bg-slate-50 transition-all">
                      <span className="text-2xl bg-yellow-101 rounded-full w-10 h-10 flex items-center justify-center shrink-0">🇧🇷</span>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-black text-slate-800 uppercase">Bandeirinhas Master</h4>
                          <span className="text-[9px] text-emerald-650 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">Completo</span>
                        </div>
                        <p className="text-[10px] text-slate-550 leading-snug mt-0.5">Amarrou fitilhos nos céus com os vizinhos no final de semana.</p>
                      </div>
                    </div>

                    {/* Achievement 3 */}
                    <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white border border-slate-150 opacity-60 m-0">
                      <span className="text-2xl bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center shrink-0">📸</span>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-black text-slate-800 uppercase">Fotógrafo Amador</h4>
                          <span className="text-[9px] text-slate-500 bg-slate-100 font-bold px-2 py-0.5 rounded-full">1 / 3 Posts</span>
                        </div>
                        <p className="text-[10px] text-slate-550 leading-snug mt-0.5">Mande fotos de momentos alegres e decorações no Mural do bairro.</p>
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            )}

          </div>
        )}

      </main>

      {/* BOT NAV FOOTER BAR (MOBILE-FIRST PRINCIPLE DETAILED) */}
      <nav 
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-205 py-2.5 px-3 z-40 rounded-t-3xl shadow-2xl flex justify-around items-center"
        id="bottom-navigation-mobile"
      >
        {/* Nav 1: Inicio */}
        <button
          onClick={() => setActiveTab("inicio")}
          className={`flex flex-col items-center justify-center p-1 cursor-pointer transition-all ${
            activeTab === "inicio" ? "text-emerald-600 scale-110" : "text-slate-400 hover:text-slate-650"
          }`}
          id="btn-nav-inicio"
        >
          <Home className={`w-5 h-5 ${activeTab === "inicio" ? "stroke-[2.5px]" : "stroke-[2px]"}`} />
          <span className="text-[9px] font-black uppercase tracking-tight mt-0.5">Início</span>
        </button>

        {/* Nav 5: Arrecadação */}
        <button
          onClick={() => setActiveTab("arrecadacao")}
          className={`flex flex-col items-center justify-center p-1 cursor-pointer transition-all ${
            activeTab === "arrecadacao" ? "text-amber-550 text-amber-500 scale-110" : "text-slate-400 hover:text-slate-650"
          }`}
          id="btn-nav-arrecadacao"
        >
          <DollarSign className={`w-5 h-5 ${activeTab === "arrecadacao" ? "stroke-[2.5px]" : "stroke-[2px]"}`} />
          <span className="text-[9px] font-black uppercase tracking-tight mt-0.5">Caixinha</span>
        </button>

        {/* Nav 3: Bolão */}
        <button
          onClick={() => setActiveTab("bolao")}
          className={`flex flex-col items-center justify-center p-1 cursor-pointer transition-all ${
            activeTab === "bolao" ? "text-blue-600 scale-110" : "text-slate-400 hover:text-slate-650"
          }`}
          id="btn-nav-bolao"
        >
          <Zap className={`w-5 h-5 ${activeTab === "bolao" ? "stroke-[2.5px]" : "stroke-[2px]"}`} />
          <span className="text-[9px] font-black uppercase tracking-tight mt-0.5">Bolão</span>
        </button>

        {/* GINCANA NAV FOOTER BUTTON REMOVED */}

        {/* Nav 2: Feed/Fotos */}
        <button
          onClick={() => setActiveTab("feed")}
          className={`flex flex-col items-center justify-center p-1 cursor-pointer transition-all ${
            activeTab === "feed" ? "text-rose-500 scale-110" : "text-slate-400 hover:text-slate-650"
          }`}
          id="btn-nav-feed"
        >
          <Camera className={`w-5 h-5 ${activeTab === "feed" ? "stroke-[2.5px]" : "stroke-[2px]"}`} />
          <span className="text-[9px] font-black uppercase tracking-tight mt-0.5">Mural</span>
        </button>

        {/* Nav 5: Perfil / Capsula */}
        <button
          onClick={() => setActiveTab("perfil")}
          className={`flex flex-col items-center justify-center p-1 cursor-pointer transition-all ${
            activeTab === "perfil" ? "text-violet-650 text-violet-600 scale-110" : "text-slate-400 hover:text-slate-650"
          }`}
          id="btn-nav-perfil"
        >
          <User className={`w-5 h-5 ${activeTab === "perfil" ? "stroke-[2.5px]" : "stroke-[2px]"}`} />
          <span className="text-[9px] font-black uppercase tracking-tight mt-0.5">Perfil</span>
        </button>

      </nav>

      {/* =========================================================================
          🔑 MODAL 1: LOGIN ADMINISTRATIVO (Mestre Cladston)
         ========================================================================= */}
      <AnimatePresence>
        {showAdminLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md" id="admin-login-modal">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-slate-900 border-2 border-indigo-500/30 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/20 to-teal-500/20 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col items-center text-center space-y-4 relative z-10">
                <span className="p-3.5 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 shadow-inner">
                  <Lock className="w-6 h-6 text-indigo-400" />
                </span>
                
                <div>
                  <h3 className="font-black text-lg uppercase tracking-tight">Login Master</h3>
                  <p className="text-xs text-indigo-300 font-mono mt-0.5">COORDENAÇÃO ADMINISTRATIVA</p>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed font-sans px-2">
                  Esta área é restrita a supervisores para auditoria das ruas, moderação do mural em tempo real e atualização dos índices.
                </p>

                <form onSubmit={handleAdminLogin} className="w-full space-y-3.5 pt-2">
                  <div className="text-left space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 font-mono block">Nome do Usuário</label>
                    <input 
                      type="text" 
                      required
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      placeholder="Ex: Cladston" 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500 transition-all font-sans"
                    />
                  </div>

                  <div className="text-left space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 font-mono block">Senha de Acesso</label>
                    <input 
                      type="password" 
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••••••" 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-indigo-200 placeholder-zinc-600 outline-none focus:border-indigo-500 transition-all font-mono"
                    />
                  </div>

                  {adminError && (
                    <div className="text-xs text-center font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 py-2 rounded-xl">
                      ⚠️ {adminError}
                    </div>
                  )}

                  <div className="flex gap-2.5 pt-2">
                    <button 
                      type="button"
                      onClick={() => {
                        setShowAdminLoginModal(false);
                        setAdminError("");
                      }}
                      className="flex-1 border border-slate-800 hover:bg-slate-850 active:scale-95 text-slate-350 font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-550 hover:from-indigo-550 hover:to-indigo-500 text-white font-extrabold py-2.5 rounded-xl text-xs shadow-lg active:scale-95 transition-all cursor-pointer"
                    >
                      Entrar 🚀
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          🔥 MODAL 2: PAINEL ADMINISTRATIVO MASTER (Dashboard Cladston)
         ========================================================================= */}
      <AnimatePresence>
        {showAdminPanel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md" id="admin-panel-dashboard">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-slate-900 border-2 border-indigo-500/35 rounded-3xl p-5 text-white shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden"
            >
              {/* Header do Painel Admin */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-2.5">
                  <span className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
                    <ShieldAlert className="w-5 h-5" />
                  </span>
                  <div className="text-left">
                    <h2 className="font-black text-sm uppercase tracking-wider text-slate-100">Controle Master</h2>
                    <p className="text-[10px] text-zinc-400 font-mono mt-0.5">Sessão: Cladston (Ativa) 👑</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAdminLogout}
                    className="p-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-550/30 text-rose-450 text-rose-400 rounded-xl cursor-pointer active:scale-95 transition-all text-xs flex items-center gap-1 font-bold"
                    title="Sair da sessão"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase font-black">Sair</span>
                  </button>
                  
                  <button
                    onClick={() => setShowAdminPanel(false)}
                    className="p-2 hover:bg-slate-800 rounded-xl border border-slate-800 text-slate-400 cursor-pointer text-xs"
                  >
                     ✕
                  </button>
                </div>
              </div>

              {/* Sub-abas de navegação do painel */}
              <div className="flex border-b border-slate-800 bg-slate-950/50 p-1 rounded-xl mt-3 shrink-0 justify-around items-center gap-1">
                {[
                  { id: "geral", label: "📢 Geral" },
                  { id: "posts", label: "📸 Mural" },
                  { id: "votos", label: "🏆 Gincana" },
                  { id: "logs", label: "💾 SQL Logs" }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveAdminSubTab(tab.id as any)}
                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                      activeAdminSubTab === tab.id
                        ? "bg-indigo-650 bg-indigo-600 text-white shadow"
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-slate-850"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Conteúdo da Área Administrativa */}
              <div className="flex-1 py-4 overflow-y-auto space-y-4 min-h-0 text-left">
                
                {/* 1. ABA GERAL */}
                {activeAdminSubTab === "geral" && (
                  <div className="space-y-4 animate-fade-in text-xs leading-normal">
                    {/* Altera Frase do Mascote */}
                    <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base text-yellow-400">🦜</span>
                        <h4 className="font-extrabold uppercase tracking-tight text-indigo-300 text-[11px]">Balão do Mascote</h4>
                      </div>
                      <p className="text-[10px] text-zinc-400">Atualize a mensagem do canarinho na página inicial instântaneamente para todos moradores.</p>
                      
                      <div className="flex gap-2">
                        <textarea
                          rows={2}
                          value={mascoteMessage}
                          onChange={(e) => setMascoteMessage(e.target.value)}
                          placeholder="Digite o comunicado do mascote..."
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-zinc-650 outline-none focus:border-indigo-500 font-sans resize-none"
                        />
                      </div>
                    </div>

                    {/* Countdown Ajustador */}
                    <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-teal-400" />
                        <h4 className="font-extrabold uppercase tracking-tight text-teal-300 text-[11px]">Temporizador do Próximo Jogo</h4>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-400 font-mono">Dias do timer atual: <strong className="text-white text-xs">{timeLeft.dias} dias</strong></span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => setTimeLeft(prev => ({ ...prev, dias: Math.max(0, prev.dias - 1) }))}
                            className="bg-slate-800 hover:bg-slate-750 font-bold px-2.5 py-1 rounded text-white"
                          >
                            -1d
                          </button>
                          <button
                            onClick={() => setTimeLeft(prev => ({ ...prev, dias: prev.dias + 1 }))}
                            className="bg-slate-800 hover:bg-slate-750 font-bold px-2.5 py-1 rounded text-white"
                          >
                            +1d
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Disparar Notificação Alerta */}
                    <div className="bg-slate-950 p-3.5 rounded-2xl border border-indigo-500/20 space-y-3">
                      <div className="flex items-center gap-2">
                        <Bell className="w-3.5 h-3.5 text-indigo-400" />
                        <h4 className="font-extrabold uppercase tracking-tight text-indigo-300 text-[11px]">Disparar Alerta na Gincana</h4>
                      </div>
                      <p className="text-[10px] text-zinc-405 text-zinc-400 leading-normal">
                        Envia uma notificação flutuante importante em tempo real que surge no topo da tela de todos os usuários simulados.
                      </p>

                      <div className="grid grid-cols-2 gap-2.5">
                        <input
                          type="text"
                          value={adminNotificationTitle}
                          onChange={(e) => setAdminNotificationTitle(e.target.value)}
                          placeholder="Mudar guia da rua..."
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs"
                        />
                        <select
                          value={adminNotificationType}
                          onChange={(e: any) => setAdminNotificationType(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs"
                        >
                          <option value="meta_alcancada">🏆 Notícia Boa</option>
                          <option value="novo_post">🔥 Alerta Geral</option>
                        </select>
                      </div>

                      <input
                        type="text"
                        value={adminNotificationDesc}
                        onChange={(e) => setAdminNotificationDesc(e.target.value)}
                        placeholder="Mensagem do aviso administrativo..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2.5 text-xs text-white"
                      />

                      <button
                        onClick={broadcastAdminAlert}
                        disabled={!adminNotificationTitle.trim()}
                        className="w-full bg-indigo-650 hover:bg-indigo-600 bg-indigo-600 text-white py-2 rounded-xl text-xs font-black cursor-pointer uppercase active:scale-[98] disabled:opacity-50 disabled:pointer-events-none transition-all"
                      >
                        Disparar Boletim Oficial 🚨
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. ABA POSTS / FEED moderation */}
                {activeAdminSubTab === "posts" && (
                  <div className="space-y-3.5 animate-fade-in text-xs">
                    <div className="flex items-center justify-between text-[11px] pb-1">
                      <span className="text-zinc-400 font-bold uppercase tracking-wider">Posts no Mural ({posts.length})</span>
                      <span className="text-indigo-400 font-mono font-bold">MODERAÇÃO ATIVA</span>
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                      {posts.length === 0 ? (
                        <div className="text-center py-8 text-zinc-500 bg-slate-950 rounded-2xl border border-slate-850">
                          Nenhum post ativo para moderar.
                        </div>
                      ) : (
                        posts.map(post => (
                          <div key={post.id} className="bg-slate-950 p-3 rounded-2xl border border-slate-850 flex items-center justify-between gap-3" id={`moderation-item-${post.id}`}>
                            <div className="flex items-center gap-2.5 min-w-0">
                              {post.imagem ? (
                                <img src={post.imagem} alt="Thumb" className="w-10 h-10 object-cover rounded-lg shrink-0 border border-slate-800" referrerPolicy="no-referrer" />
                              ) : (
                                <span className="w-10 h-10 bg-slate-850 rounded-lg shrink-0 flex items-center justify-center font-bold text-lg text-indigo-400">📝</span>
                              )}
                              
                              <div className="text-left min-w-0 leading-normal">
                                <h5 className="font-extrabold text-white text-[11px] truncate flex items-center gap-1.5">
                                  {post.autor} <span className="text-[9px] font-medium text-emerald-400 bg-emerald-500/10 px-1 py-0.25 rounded font-mono">{post.rua}</span>
                                </h5>
                                <p className="text-[10px] text-zinc-400 truncate max-w-[200px]">{post.legenda || "Sem legenda."}</p>
                                <span className="text-[9px] text-zinc-500 font-mono block">Likes: {post.curtidas} • Comentários: {post.comentarios.length}</span>
                              </div>
                            </div>

                            <button 
                              onClick={() => deletePost(post.id)}
                              className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl cursor-pointer hover:border border-rose-500/20 active:scale-90 transition-all font-bold text-[10px] uppercase flex items-center gap-1"
                              title="Remover do mural público"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="sr-only">Remover</span>
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* 3. ABA GINCANA / VOTOS */}
                {activeAdminSubTab === "votos" && (
                  <div className="space-y-4 animate-fade-in text-xs">
                    
                    {/* Torcidômetro Cliques */}
                    <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-850 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">🥁</span>
                          <h4 className="font-extrabold uppercase tracking-tight text-yellow-400 text-[11px]">Torcidômetro (Cliques do Tambor)</h4>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono">BETA</span>
                      </div>

                      <div className="space-y-2">
                        {Object.entries(ruaPontos).map(([rua, pontos]) => (
                          <div key={rua} className="flex justify-between items-center text-zinc-300 font-mono text-[11px] bg-slate-900 px-3 py-2 rounded-xl">
                            <span>{rua}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-extrabold">{pontos} pts</span>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => setRuaPontos(prev => ({ ...prev, [rua]: Math.max(0, prev[rua] - 100) }))}
                                  className="bg-slate-850 px-1.5 py-0.5 rounded text-[10px] font-black text-rose-450 text-rose-400"
                                >
                                  -100
                                </button>
                                <button
                                  onClick={() => setRuaPontos(prev => ({ ...prev, [rua]: prev[rua] + 100 }))}
                                  className="bg-slate-850 px-1.5 py-0.5 rounded text-[10px] font-black text-emerald-450 text-emerald-400"
                                >
                                  +100
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Votação de Candidatos Concurso */}
                    <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-850 space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-indigo-400" />
                          <h4 className="font-extrabold uppercase tracking-tight text-indigo-300 text-[11px]">Candidatos da Gincana ({concursoCandidatos.length})</h4>
                        </div>
                      </div>

                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {concursoCandidatos.map(cand => (
                          <div key={cand.id} className="bg-slate-900 p-2.5 rounded-xl border border-slate-850 flex items-center justify-between gap-2.5">
                            <div className="text-left leading-tight min-w-0">
                              <span className="text-[8px] bg-indigo-500/10 text-indigo-400 px-1 rounded uppercase font-bold font-mono block w-fit mb-0.5">{cand.categoria}</span>
                              <h6 className="font-bold text-white text-[10px] truncate">{cand.titulo}</h6>
                              <p className="text-[9px] text-zinc-500 truncate">{cand.autor} • {cand.rua}</p>
                            </div>

                            <div className="flex items-center gap-2 font-mono text-[11px] shrink-0">
                              <span className="font-black text-white">{cand.votos} vt</span>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => setConcursoCandidatos(prev => prev.map(c => c.id === cand.id ? { ...c, votos: Math.max(0, c.votos - 25) } : c))}
                                  className="bg-slate-800 px-1.5 py-1 rounded text-[9px] font-black text-rose-400"
                                >
                                  -25
                                </button>
                                <button
                                  onClick={() => setConcursoCandidatos(prev => prev.map(c => c.id === cand.id ? { ...c, votos: c.votos + 25 } : c))}
                                  className="bg-slate-800 px-1.5 py-1 rounded text-[9px] font-black text-emerald-400"
                                >
                                  +25
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {/* 4. ABA SQL LOGS TERMINAL */}
                {activeAdminSubTab === "logs" && (
                  <div className="space-y-3.5 animate-fade-in text-[11px] leading-normal font-mono flex flex-col h-full">
                    <div className="flex justify-between items-center bg-slate-950 p-2 rounded-lg border border-slate-850 shrink-0">
                      <span className="text-zinc-500">TAMANHO HISTÓRICO: {dbLogs.length} / 15</span>
                      <button 
                        onClick={() => {
                          addDbLog("RESET SCHEMA TRUNCATE: Logs e transações de rede resetadas.");
                        }}
                        className="bg-slate-900 hover:bg-slate-850 text-[9px] font-black text-zinc-300 px-2 py-1 rounded border border-slate-800 cursor-pointer"
                      >
                        Zerar Registro
                      </button>
                    </div>

                    <div className="flex-1 bg-black/90 p-3 rounded-2xl border border-indigo-500/25 min-h-[160px] max-h-80 overflow-y-auto leading-relaxed select-all text-indigo-300 pr-1 space-y-2">
                      {dbLogs.length === 0 ? (
                        <div className="text-center py-10 text-zinc-600">
                          &gt;_ terminal vazio. sem transações nesta sessão.
                        </div>
                      ) : (
                        dbLogs.map((log) => (
                          <div key={log.id} className="border-b border-zinc-900 pb-1.5">
                            <span className="text-[9px] text-[#22c55e] font-extrabold font-mono font-black">[ {log.stamp} ] REDE &gt;</span>
                            <div className="text-[9.5px] leading-relaxed break-all font-mono pl-1 text-[#60a5fa] mt-0.5">{log.sql}</div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    <div className="p-2 bg-slate-950 rounded-xl text-[9px] text-zinc-500 leading-normal border border-slate-850">
                      💡 Todos os selects, updates e inserts mapeados mostram a simulação das querys reais rodando tanto no cliente quanto no middleware persistido Supabase.
                    </div>
                  </div>
                )}

              </div>
              
              {/* Footer do Painel Admin */}
              <div className="border-t border-slate-800 pt-3 flex items-center justify-between shrink-0 text-[10px] text-zinc-500 font-mono">
                <span>CONEXÃO: SUPABASE CLOUD</span>
                <span className="text-indigo-400 font-bold">@Senha123!</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
