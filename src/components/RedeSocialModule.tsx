import React, { useState, useMemo } from "react";
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Share2, 
  Plus, 
  Image as ImageIcon, 
  MoreHorizontal, 
  Bookmark, 
  Smile, 
  Radio, 
  Bell, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Tv, 
  Instagram, 
  Lock, 
  User, 
  CheckCircle,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { triggerRealtimeNotification } from "./RealtimeNotificationSystem";

// Interfaces dos dados de rede social
interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: string;
}

interface Post {
  id: string;
  author: string;
  avatar: string;
  house: string;
  imageUrl: string;
  caption: string;
  likes: number;
  hasLiked: boolean;
  comments: Comment[];
  shares: number;
  timestamp: string;
}

interface Story {
  id: string;
  author: string;
  avatar: string;
  storyImageUrl: string;
  hasViewed: boolean;
  caption: string;
}

export default function RedeSocialModule() {
  // Controle de identidade do usuário logado na rede social privada
  const currentUser = {
    name: "Carlos (Casa 12)",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150"
  };

  // 1. Stories da Vizinhança
  const [stories, setStories] = useState<Story[]>([
    {
      id: "s1",
      author: "Mendonça (Síndico)",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150",
      storyImageUrl: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=600",
      hasViewed: false,
      caption: "Bandeirinhas aéreas quase prontas! 🇧🇷✨"
    },
    {
      id: "s2",
      author: "Larissa Moro",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150",
      storyImageUrl: "https://images.unsplash.com/photo-1543326137-83b044c59b74?q=80&w=600",
      hasViewed: false,
      caption: "Preparativos na cozinha para o bolo verde e amarelo! 🍰💚💛"
    },
    {
      id: "s3",
      author: "Orlando (Padaria)",
      avatar: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?q=80&w=150",
      storyImageUrl: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?q=80&w=600",
      hasViewed: false,
      caption: "Pão doce especial da Copa saindo quente! 🇧🇷🥖"
    },
    {
      id: "s4",
      author: "Cláudio Silva",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150",
      storyImageUrl: "https://images.unsplash.com/photo-1551201602-3f9456f0fcd8?q=80&w=600",
      hasViewed: true,
      caption: "O asfalto sob os refletores já dá gosto de ver!"
    }
  ]);

  // 2. Feed de Publicações Comunitárias
  const [posts, setPosts] = useState<Post[]>([
    {
      id: "p1",
      author: "José Souza (Organizador)",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=150",
      house: "Casa 45",
      imageUrl: "https://images.unsplash.com/photo-1562088287-bde35a1ea917?q=80&w=800",
      caption: "Iniciamos a marcação da pintura do campo na nossa calçada central! Sábado de manhã quem puder encostar para ajudar no rolo de tinta verde vai ser o bicho! 🇧🇷🤙🍺",
      likes: 18,
      hasLiked: false,
      comments: [
        { id: "c_1", author: "Cláudio Silva", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150", text: "Estarei lá pontualmente às 08h com duas trinchas!", timestamp: "Há 1 hora" },
        { id: "c_2", author: "Larissa Moro", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150", text: "Vou levar um garrafão de café preto fresquinho para animar a equipe!", timestamp: "Há 40 minutos" }
      ],
      shares: 3,
      timestamp: "Há 2 horas"
    },
    {
      id: "p2",
      author: "Juliana Ferreira",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150",
      house: "Casa 82",
      imageUrl: "https://images.unsplash.com/photo-1624880351094-1a3b90ffd051?q=80&w=800",
      caption: "Chegaram as cornetas oficiais do nosso comitê da Rua do Hexa! Guardando no estoque do vizinho Mendonça para distribuir no dia da estreia. Haja coração!",
      likes: 24,
      hasLiked: true,
      comments: [
        { id: "c_3", author: "Mendonça (Síndico)", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150", text: "Confirmado, já empilhei em caixas na garagem. Ficou excelente o material!", timestamp: "Há 30 minutos" }
      ],
      shares: 5,
      timestamp: "Há 4 horas"
    },
    {
      id: "p3",
      author: "Orlando (Padaria)",
      avatar: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?q=80&w=150",
      house: "Padaria Avenida",
      imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800",
      caption: "Como patrocinador da nossa rua, o pão francês com mortadela e vinagrete vai ser cortesia a cada gol do Brasil na transmissão oficial! Quem vem torcer junto?",
      likes: 42,
      hasLiked: false,
      comments: [
        { id: "c_4", author: "Carla Rezende", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150", text: "Vixe, o senhor vai falir, porque vai ser goleada histórica da seleção! 💚💛", timestamp: "Há 12 minutos" }
      ],
      shares: 11,
      timestamp: "Há 6 horas"
    }
  ]);

  // 3. Console do Supabase Realtime CDC (Change Data Capture)
  const [realtimeLogs, setRealtimeLogs] = useState<{ id: string; event: string; details: string; time: string }[]>([
    { id: "rl1", event: "SUBSCRIBE", details: "Canal 'realtime:social_feed' escutando ALL_TRIGGERS no Postgres", time: "00:01" },
    { id: "rl2", event: "RLS_ACTIVE", details: "Políticas do Supabase validando chaves de segurança para 'Carlos (Casa 12)'", time: "00:01" }
  ]);

  // Estados dos formulários de novas atualizações
  const [newPostCaption, setNewPostCaption] = useState("");
  const [newPostImageSource, setNewPostImageSource] = useState<string>("soccer1"); // Opções de Imagens Predefinidas
  const [newCommentTexts, setNewCommentTexts] = useState<Record<string, string>>({});

  // Story Ativo em visualização modal
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);

  // Imagens predefinidas realistas de futebol/Copa2026 para o sim de upload do morador
  const PRESET_MOCK_IMAGES: Record<string, string> = {
    soccer1: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600",
    soccer2: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=600",
    soccer3: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=600",
  };

  // Helper para cadastrar eventos de logs de websocket em tempo de execução
  const triggerRealtimeLog = (eventName: string, detailsMessage: string) => {
    const timeFormatted = new Date().toLocaleTimeString("pt-BR");
    setRealtimeLogs(prev => [
      { id: `rl_${Date.now()}`, event: eventName, details: detailsMessage, time: timeFormatted },
      ...prev.slice(0, 19)
    ]);
  };

  // 1. Curtir Publicação (Simulação de update Postgres retransmitido via WebSocket)
  const handleLikePost = (postId: string) => {
    const p = posts.find(post => post.id === postId);
    if (!p) return;

    const becomesLiked = !p.hasLiked;
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          hasLiked: becomesLiked,
          likes: becomesLiked ? post.likes + 1 : post.likes - 1
        };
      }
      return post;
    }));

    // Logs Supabase CDC Realtime
    const opType = becomesLiked ? "INSERT" : "DELETE";
    triggerRealtimeLog(
      becomesLiked ? "UPDATE_LIKE" : "REMOVE_LIKE",
      `Tabela 'post_likes' [OP: ${opType}] - Morador Carlos afetou ID do post '${postId}'`
    );
  };

  // 2. Comentar Publicação (Simulação de insert Postgres retransmitido via WebSocket)
  const handleAddComment = (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    const commentText = newCommentTexts[postId];
    if (!commentText || !commentText.trim()) return;

    const p = posts.find(post => post.id === postId);
    if (!p) return;

    const newComment: Comment = {
      id: `c_${Date.now()}`,
      author: currentUser.name,
      avatar: currentUser.avatar,
      text: commentText.trim(),
      timestamp: "Agora mesmo"
    };

    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, newComment]
        };
      }
      return post;
    }));

    // Limpa input
    setNewCommentTexts(prev => ({
      ...prev,
      [postId]: ""
    }));

    // Logs Supabase CDC Realtime
    triggerRealtimeLog(
      "INSERT_COMMENT",
      `Tabela 'post_comments' [OP: INSERT] - Novo texto de comentário adicionado ao post '${postId.substring(0, 6)}...'`
    );

    // Sistema de Notificações Integrado
    triggerRealtimeNotification({
      type: "novo_comenario",
      title: `💬 Novo Comentário no Post de ${p.author}`,
      description: `${currentUser.name} comentou: "${commentText.trim()}"`,
      metadata: {
        user: currentUser.name,
        avatar: currentUser.avatar,
        linkView: "social"
      }
    });
  };

  // 3. Compartilhar Postagem (Simulação de broadcast realtime)
  const handleSharePost = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          shares: post.shares + 1
        };
      }
      return post;
    }));

    triggerRealtimeLog(
      "BROADCAST_SHARE",
      `Tabela 'social_shares' [OP: BROADCAST] - Link do post '${postId}' compartilhado no grupo privado`
    );

    alert("Simulação de compartilhamento: O link privado da intranet comunitária foi copiado para a sua área de transferência!");
  };

  // 4. Criar Nova Publicação (Simulação de Insert no Supabase com imagens e autorias)
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostCaption || !newPostCaption.trim()) return;

    const simulatedImgUrl = PRESET_MOCK_IMAGES[newPostImageSource];

    const newPost: Post = {
      id: `p_${Date.now()}`,
      author: currentUser.name,
      avatar: currentUser.avatar,
      house: "Casa 12",
      imageUrl: simulatedImgUrl,
      caption: newPostCaption,
      likes: 1,
      hasLiked: true, // Já cria curtido por autoria
      comments: [],
      shares: 0,
      timestamp: "Agora mesmo"
    };

    setPosts(prev => [newPost, ...prev]);
    setNewPostCaption("");
    
    // Logs Supabase CDC Realtime
    triggerRealtimeLog(
      "INSERT_POST",
      `Tabela 'posts' [OP: INSERT] - Nova publicação de Carlos cadastrada. Sincronizada nos feeds da vizinhança na Intranet.`
    );

    // Sistema de Notificações Integrado
    triggerRealtimeNotification({
      type: "novo_post",
      title: "📸 Nova Publicação no Mural da Geral",
      description: `${currentUser.name} publicou: "${newPostCaption.trim()}"`,
      metadata: {
        user: currentUser.name,
        avatar: currentUser.avatar,
        linkView: "social"
      }
    });
  };

  // Visualizador avançado de History / Stories
  const nextStory = () => {
    if (activeStoryIndex === null) return;
    if (activeStoryIndex < stories.length - 1) {
      // Marca como lido o que visualizou
      setStories(prev => prev.map((s, idx) => idx === activeStoryIndex ? { ...s, hasViewed: true } : s));
      setActiveStoryIndex(activeStoryIndex + 1);
    } else {
      setStories(prev => prev.map((s, idx) => idx === activeStoryIndex ? { ...s, hasViewed: true } : s));
      setActiveStoryIndex(null);
    }
  };

  const prevStory = () => {
    if (activeStoryIndex === null) return;
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
    } else {
      setActiveStoryIndex(null);
    }
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans" id="social-root">
      
      {/* HEADER DE COMUNIDADE SOCIAL PRIVADA */}
      <div className="bg-gradient-to-r from-slate-900/60 via-emerald-950/20 to-slate-900/60 border border-emerald-500/15 p-6 rounded-2xl relative overflow-hidden shadow-xl" id="social-header">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-yellow-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-semibold border border-emerald-500/20">
              <Instagram className="w-3.5 h-3.5 text-pink-400" />
              Rede Social Privada da Geral • Inspirado no Instagram
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
              MURAL DE VIZINHOS 🇧🇷📸
            </h1>
            <p className="text-sm text-slate-350 leading-relaxed font-sans">
              O feed de fofocas saudável, fotos de pinturas, novidades e stories da vizinhança da Rua do Hexa. Totalmente seguro e monitorado em tempo real.
            </p>
          </div>

          <div className="px-4 py-3 bg-slate-950/90 border border-slate-850 rounded-xl flex items-center gap-3 shadow-inner shrink-0" id="user-pill">
            <div className="relative">
              <img 
                src={currentUser.avatar} 
                className="w-10 h-10 rounded-full border-2 border-emerald-500 object-cover"
                alt="Carlos"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950" />
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight font-mono">{currentUser.name}</p>
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-400" /> Intranet da Rua
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* BUBBLES STORIES (Inspirado no topo do Instagram) */}
      <div className="bg-slate-905/70 rounded-xl border border-slate-850 p-4 shadow-md overflow-x-auto flex items-center gap-4 custom-scrollbar" id="stories-section">
        
        {/* Adicionar Story do próprio Carlos */}
        <div 
          onClick={() => alert("Simulação de Upload de Story: O organizador do Supabase enviaria uma nova imagem para o bucket public/stories e atualizaria o websocket.")}
          className="flex flex-col items-center gap-2 cursor-pointer group shrink-0"
          id="own-story-bubble"
        >
          <div className="relative">
            <img 
              src={currentUser.avatar} 
              className="w-16 h-16 rounded-full border-2 border-dashed border-slate-700 p-0.5 object-cover group-hover:border-emerald-500 transition-all"
              alt="Seu avatar"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-550 rounded-full border-2 border-slate-900 flex items-center justify-center">
              <Plus className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Seu Story</span>
        </div>

        {/* Listando as Stories da Vizinhança */}
        {stories.map((story, index) => (
          <div 
            key={story.id}
            onClick={() => {
              setActiveStoryIndex(index);
              triggerRealtimeLog("SELECT_STORY", `Morador Carlos visualizou o story de '${story.author}'`);
            }}
            className="flex flex-col items-center gap-2 cursor-pointer group shrink-0"
            id={`story-${story.id}`}
          >
            <div className="relative">
              {/* Círculo do Gradiente de História Não Vista */}
              <div className={`p-[2px] rounded-full transition-all duration-300 ${
                story.hasViewed 
                  ? "bg-slate-800" 
                  : "bg-gradient-to-tr from-emerald-500 via-yellow-450 to-emerald-600 animate-pulse快速"
              }`}>
                <img 
                  src={story.avatar} 
                  className="w-15 h-15 rounded-full border-2 border-slate-950 object-cover"
                  alt={story.author}
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <span className="text-[10px] text-slate-350 truncate max-w-[76px] font-mono">{story.author.split(" ")[0]}</span>
          </div>
        ))}
      </div>

      {/* GRADE CENTRAL INTERATIVA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="social-grid">

        {/* COLUNA ESQUERDA: FEED DE POSTAGENS (8 colunas) */}
        <div className="lg:col-span-8 space-y-6" id="feed-container">

          {/* CRIAÇÃO DE NOVA POSTAGEM */}
          <div className="bg-slate-900/60 rounded-xl border border-slate-850 p-5 shadow-sm space-y-4" id="create-post-card">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5 font-mono">
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              Compartilhar Foto ou Atualização
            </h3>

            <form onSubmit={handleCreatePost} className="space-y-4 font-mono">
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Legenda/Caption */}
                <div className="md:col-span-8">
                  <textarea
                    rows={2}
                    required
                    value={newPostCaption}
                    onChange={(e) => setNewPostCaption(e.target.value)}
                    className="w-full text-xs p-3 bg-slate-950 border border-slate-800 focus:outline-none focus:border-emerald-500 rounded-lg text-slate-200 resize-none font-sans"
                    placeholder="O que está acontecendo na rua agora? Alguma fofoca, pintura..."
                  />
                </div>

                {/* Seletor de Imagens Preset de Copa */}
                <div className="md:col-span-4 space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block">Fotografia da Ação</label>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {Object.keys(PRESET_MOCK_IMAGES).map((key) => (
                      <div 
                        key={key}
                        onClick={() => setNewPostImageSource(key)}
                        className={`cursor-pointer rounded border relative overflow-hidden transition-all ${
                          newPostImageSource === key 
                            ? "border-emerald-500 scale-105 shadow-md shadow-emerald-950/40" 
                            : "border-slate-800 brightness-50 hover:brightness-100"
                        }`}
                      >
                        <img 
                          src={PRESET_MOCK_IMAGES[key]} 
                          className="h-10 w-full object-cover" 
                          alt="Preset item"
                          referrerPolicy="no-referrer"
                        />
                        {newPostImageSource === key && (
                          <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white font-bold" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <span className="text-[9px] text-slate-500 block text-right font-mono">Mock do Storage bucket</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-850 pt-3">
                <span className="text-[10px] text-slate-500 leading-normal block">
                  🔒 Somente moradores aceitos visualizam suas postagens.
                </span>

                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold text-xs rounded-lg hover:brightness-110 transition-all flex items-center gap-1.5 shadow-md shadow-emerald-950/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Publicar no Feed</span>
                </button>
              </div>

            </form>
          </div>

          {/* LISTAGEM DOS POSTS */}
          <div className="space-y-6" id="publications-feed">
            {posts.map((post) => (
              <article 
                key={post.id}
                className="bg-slate-905/70 rounded-xl border border-slate-850 overflow-hidden shadow-md"
                id={`post-card-${post.id}`}
              >
                
                {/* Header do Post */}
                <div className="header p-4 flex items-center justify-between border-b border-slate-850/40">
                  <div className="flex items-center gap-3">
                    <img 
                      src={post.avatar} 
                      className="w-9 h-9 rounded-full object-cover border border-slate-700 p-[1px]"
                      alt={post.author}
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1 font-mono tracking-tight">
                        {post.author}
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-405 fill-emerald-950" />
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {post.house} • {post.timestamp}
                      </p>
                    </div>
                  </div>

                  <button className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Imagem do Post */}
                <div className="relative overflow-hidden aspect-video bg-slate-950 flex items-center justify-center">
                  <img 
                    src={post.imageUrl} 
                    className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500"
                    alt="Post media content"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Tag Decorativa em Intranet */}
                  <div className="absolute bottom-3 left-3 bg-slate-950/80 px-2 py-0.5 rounded text-[9px] text-slate-300 font-mono flex items-center gap-1 backdrop-blur-sm">
                    <Lock className="w-3 h-3 text-emerald-400" /> Rede Protegida RLS
                  </div>
                </div>

                {/* Corpo do Post & Interações (Like, Comment, Share) */}
                <div className="p-4 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      
                      {/* Like Button */}
                      <button 
                        onClick={() => handleLikePost(post.id)}
                        className="flex items-center gap-1.5 text-slate-350 hover:text-red-400 transition-colors group cursor-pointer"
                        title="Curtir Publicação"
                        id={`btn-like-${post.id}`}
                      >
                        <Heart className={`w-[21px] h-[21px] transition-all hover:scale-110 duration-200 ${
                          post.hasLiked 
                            ? "fill-red-500 text-red-500 scale-105" 
                            : "group-hover:text-red-400"
                        }`} />
                        <span className="text-xs font-bold font-mono">{post.likes}</span>
                      </button>

                      {/* Comment Tracker Icon */}
                      <div className="flex items-center gap-1.5 text-slate-350 font-mono">
                        <MessageCircle className="w-[21px] h-[21px] hover:text-emerald-400 hover:scale-110 duration-250 cursor-pointer" />
                        <span className="text-xs font-bold">{post.comments.length}</span>
                      </div>

                      {/* Share Button */}
                      <button 
                        onClick={() => handleSharePost(post.id)}
                        className="flex items-center gap-1.5 text-slate-350 hover:text-sky-400 transition-colors hover:scale-110 duration-200 cursor-pointer"
                        title="Compartilhar Link"
                        id={`btn-share-${post.id}`}
                      >
                        <Share2 className="w-[19px] h-[19px]" />
                        <span className="text-xs font-bold font-mono">{post.shares}</span>
                      </button>

                    </div>

                    <button className="text-slate-450 hover:text-yellow-400 font-mono" title="Salvar Foto">
                      <Bookmark className="w-[19px] h-[19px]" />
                    </button>
                  </div>

                  {/* Caption */}
                  <div className="text-xs leading-relaxed">
                    <span className="font-bold text-slate-100 font-mono mr-1.5">{post.author}</span>
                    <span className="text-slate-300 font-sans">{post.caption}</span>
                  </div>

                  {/* Comentários Listados */}
                  {post.comments.length > 0 && (
                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-900 space-y-2.5 max-h-[160px] overflow-y-auto custom-scrollbar">
                      {post.comments.map((comm) => (
                        <div key={comm.id} className="text-[11px] leading-relaxed flex items-start gap-2 font-mono">
                          <img 
                            src={comm.avatar} 
                            className="w-5 h-5 rounded-full object-cover mt-0.5 shrink-0" 
                            alt={comm.author}
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="text-slate-200 font-bold mr-1">{comm.author}</span>
                            <span className="text-slate-400">{comm.text}</span>
                            <span className="text-[8px] text-slate-600 block mt-0.5">{comm.timestamp}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Campo de Digitar Comentário */}
                  <form 
                    onSubmit={(e) => handleAddComment(e, post.id)}
                    className="flex gap-2 items-center border-t border-slate-850/40 pt-3"
                    id={`comment-form-${post.id}`}
                  >
                    <input 
                      type="text"
                      required
                      value={newCommentTexts[post.id] || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewCommentTexts(prev => ({ ...prev, [post.id]: val }));
                      }}
                      placeholder="Adicione um comentário..."
                      className="flex-1 bg-transparent border-none text-xs text-slate-200 focus:outline-none focus:ring-0 placeholder-slate-500 font-sans"
                    />
                    
                    <button 
                      type="submit"
                      className="text-emerald-400 hover:text-emerald-350 text-xs font-bold uppercase tracking-wide px-2 py-1 font-mono cursor-pointer"
                    >
                      Publicar
                    </button>
                  </form>

                </div>

              </article>
            ))}
          </div>

        </div>

        {/* COLUNA DIREITA: CONSOLE DE LOGS REALTIME DO WEBSOCKET & DICAS (4 colunas) */}
        <div className="lg:col-span-4 space-y-6" id="social-sidebar">
          
          {/* WEBSOCKET LOGGING SYSTEM */}
          <div className="bg-slate-900/60 rounded-xl border border-slate-850 p-4.5 space-y-4" id="cdc-console-card">
            
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <div className="flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-pink-500 animate-pulse" />
                <h4 className="text-xs font-black uppercase text-white font-mono tracking-wider">
                  Postgres Realtime Logger
                </h4>
              </div>
              <span className="text-[9px] bg-pink-500/10 text-pink-400 border border-pink-400/20 px-1.5 py-0.5 rounded font-mono font-bold">
                CDC ACTIVE
              </span>
            </div>

            <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
              O Supabase Realtime escuta as alterações (INSERT, UPDATE, DELETE) na base do Postgres e envia em frações de milissegundos para todos os vizinhos conectados.
            </p>

            <div className="bg-[#030712]/95 border border-slate-900 rounded-lg p-2.5 h-[280px] overflow-y-auto custom-scrollbar space-y-1.5 font-mono text-[9px] select-none leading-relaxed">
              {realtimeLogs.map((log) => (
                <div key={log.id} className="text-slate-400">
                  <span className="text-slate-650">[{log.time}]</span>{" "}
                  <span className="text-pink-400 font-bold">{log.event}</span>{" "}
                  <span className="text-neutral-350 text-[10px]">{log.details}</span>
                </div>
              ))}
            </div>

            <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800 text-[10px] text-slate-400 font-mono leading-normal">
              🌐 <strong>Dica:</strong> Publique uma imagem nova ou curta um post no feed para ver os gatilhos dispararem instantaneamente na janela de depuração do Supabase.
            </div>
          </div>

          {/* DICAS DE SEGURANÇA E RLS */}
          <div className="bg-slate-900/45 rounded-xl border border-slate-850 p-4 space-y-3" id="rls-helper">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5 font-mono text-[10px]">
              <Lock className="w-3.5 h-3.5 text-emerald-400" /> Row-Level Security (RLS)
            </h4>
            <p className="text-slate-400 leading-relaxed text-[11px] font-sans">
              Cada foto inserida no bucket do Supabase Storage exige que a chave <code>owner_id</code> corresponda ao morador logado. Moradores externos são impedidos por nível de banco de dados.
            </p>
          </div>

        </div>

      </div>

      {/* STORY MULTIMÉDIA MODAL COMPONENT */}
      <AnimatePresence>
        {activeStoryIndex !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/95 z-50 flex items-center justify-center p-4 backdrop-blur-md"
            id="story-modal"
          >
            <div className="absolute top-4 right-4 z-50">
              <button 
                onClick={() => setActiveStoryIndex(null)}
                className="p-1.5 rounded-full bg-slate-900 text-slate-450 hover:text-white border border-slate-800 transition-colors"
                id="close-story-modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-w-md w-full relative flex flex-col items-center justify-center space-y-4">
              
              {/* Barra de progresso do Story */}
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden flex gap-0.5">
                {stories.map((s, idx) => (
                  <div key={idx} className="flex-1 h-full bg-slate-900 relative">
                    <div 
                      className={`absolute inset-0 h-full bg-emerald-450 transition-all ${
                        idx < activeStoryIndex ? "w-full" : idx === activeStoryIndex ? "w-full animate-pulse" : "w-0"
                      }`}
                      style={{ animationDuration: "5000ms" }}
                    />
                  </div>
                ))}
              </div>

              {/* Header do Autor */}
              <div className="w-full flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src={stories[activeStoryIndex].avatar} 
                    className="w-10 h-10 rounded-full border border-emerald-500 object-cover" 
                    alt="Story author"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white font-mono">{stories[activeStoryIndex].author}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">Stories Rua do Hexa</span>
                  </div>
                </div>
              </div>

              {/* Imagem do Story */}
              <div className="w-full aspect-[4/5] rounded-xl overflow-hidden border border-slate-850 bg-slate-950 flex items-center justify-center relative">
                <img 
                  src={stories[activeStoryIndex].storyImageUrl} 
                  className="w-full h-full object-cover" 
                  alt="Story content media"
                  referrerPolicy="no-referrer"
                />

                {/* Caption / Legenda do Story */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-5 text-center">
                  <p className="text-xs font-semibold text-slate-100 font-sans leading-relaxed">
                    "{stories[activeStoryIndex].caption}"
                  </p>
                </div>
              </div>

              {/* Controles de Navegação de Story */}
              <div className="w-full flex justify-between gap-6 pt-2">
                <button 
                  onClick={prevStory}
                  className="p-2.5 rounded-full bg-slate-900 text-slate-400 hover:text-white border border-slate-800 flex items-center justify-center group"
                >
                  <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                </button>

                <button 
                  onClick={nextStory}
                  className="p-2.5 rounded-full bg-slate-900 text-slate-405 hover:text-white border border-slate-800 flex items-center justify-center group"
                >
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
