import React, { useState, useRef, useMemo } from "react";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Plus, 
  Image as ImageIcon, 
  Video, 
  Play, 
  X, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Database, 
  Lock, 
  User, 
  Upload, 
  Filter, 
  Trash2, 
  Download,
  Flame,
  Radio,
  FileVideo,
  FileImage,
  Award
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { triggerRealtimeNotification } from "./RealtimeNotificationSystem";

// Interfaces para os dados do Álbum
interface AlbumComment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: string;
}

interface AlbumItem {
  id: string;
  type: "photo" | "video";
  url: string;
  category: "preparativos" | "decoracao" | "jogos" | "comemoracoes";
  title: string;
  creator: string;
  avatar: string;
  likes: number;
  hasLiked: boolean;
  comments: AlbumComment[];
  timestamp: string;
}

export default function CopaAlbumModule() {
  // Usuário atual logado
  const currentUser = {
    name: "Carlos (Casa 12)",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150"
  };

  // Estado das postagens do álbum (Presets realistas de foto e vídeo)
  const [albumItems, setAlbumItems] = useState<AlbumItem[]>([
    {
      id: "alb-1",
      type: "photo",
      url: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800",
      category: "preparativos",
      title: "Iniciando a demarcação das faixas com o rolo de cal",
      creator: "José Souza (Organizador)",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=150",
      likes: 31,
      hasLiked: false,
      timestamp: "Há 2 horas",
      comments: [
        { id: "ac-1", author: "Cláudio Silva", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150", text: "Excelente enquadramento! O asfalto tá brilhando de limpo.", timestamp: "Há 1 hora" }
      ]
    },
    {
      id: "alb-2",
      type: "video",
      url: "https://assets.mixkit.co/videos/preview/mixkit-football-player-running-with-the-ball-on-the-field-34538-large.mp4",
      category: "jogos",
      title: "Treino tático da garotada no asfalto pintado",
      creator: "Mendonça (Síndico)",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150",
      likes: 47,
      hasLiked: true,
      timestamp: "Há 5 horas",
      comments: [
        { id: "ac-2", author: "Larissa Moro", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150", text: "Meninos jogam muito! Com essa empolgação o Hexa vem fácil.", timestamp: "Há 4 horas" }
      ]
    },
    {
      id: "alb-3",
      type: "photo",
      url: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=800",
      category: "decoracao",
      title: "Bandeirinhas amarradas no poste da travessa 2",
      creator: "Larissa Moro",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150",
      likes: 54,
      hasLiked: false,
      timestamp: "Há 1 dia",
      comments: [
        { id: "ac-3", author: "Orlando (Padaria)", avatar: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?q=80&w=150", text: "Ficou muito colorido! Toda manhã quando abro a padaria dá gosto de ver.", timestamp: "Há 18 horas" }
      ]
    },
    {
      id: "alb-4",
      type: "video",
      url: "https://assets.mixkit.co/videos/preview/mixkit-soccer-ball-hitting-the-net-of-the-goal-34524-large.mp4",
      category: "comemoracoes",
      title: "Simulação de grito de GOL! Testando buzinas",
      creator: "Cláudio Silva",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150",
      likes: 68,
      hasLiked: true,
      timestamp: "Há 2 dias",
      comments: [
        { id: "ac-4", author: "Juliana Ferreira", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150", text: "Minha corneta amarela quase estourou o vidro da sala kkkkk!", timestamp: "Há 1 dia" }
      ]
    },
    {
      id: "alb-5",
      type: "photo",
      url: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=800",
      category: "decoracao",
      title: "Lâmpadas de LED instaladas sob os arcos verdes e amarelos",
      creator: "Juliana Ferreira",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150",
      likes: 39,
      hasLiked: false,
      timestamp: "Há 3 dias",
      comments: []
    },
    {
      id: "alb-6",
      type: "video",
      url: "https://assets.mixkit.co/videos/preview/mixkit-young-man-playing-soccer-in-the-street-34520-large.mp4",
      category: "preparativos",
      title: "O asfalto sob os refletores já dá gosto de ver!",
      creator: "Orlando (Padaria)",
      avatar: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?q=80&w=150",
      likes: 42,
      hasLiked: false,
      timestamp: "Há 4 dias",
      comments: []
    }
  ]);

  // Console do Supabase Realtime (CDC) específico do álbum
  const [realtimeLogs, setRealtimeLogs] = useState<{ id: string; event: string; details: string; time: string }[]>([
    { id: "al-1", event: "SUBSCRIBE", details: "Canal 'realtime:copa_album' escutando ALL_EVENTS no Postgres", time: "00:01" },
    { id: "al-2", event: "RLS_ACTIVE", details: "Políticas do Supabase validando chaves de segurança para 'Carlos (Casa 12)'", time: "00:01" }
  ]);

  // Estado para filtros das Categorias
  const [activeCategory, setActiveCategory] = useState<"todos" | "preparativos" | "decoracao" | "jogos" | "comemoracoes">("todos");
  const [searchQuery, setSearchQuery] = useState("");

  // Estado de upload de mídia
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadCategory, setUploadCategory] = useState<"preparativos" | "decoracao" | "jogos" | "comemoracoes">("preparativos");
  const [uploadTitle, setUploadTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Visualizador detalhado (Modal Cinema)
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");

  // Helper para cadastrar os logs na barra de depuração websocket
  const triggerRealtimeLog = (eventName: string, detailsMessage: string) => {
    const timeFormatted = new Date().toLocaleTimeString("pt-BR");
    setRealtimeLogs(prev => [
      { id: `al_log_${Date.now()}`, event: eventName, details: detailsMessage, time: timeFormatted },
      ...prev.slice(0, 15)
    ]);
  };

  // Tratando drag e drop de fotos e vídeos
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    const fileType = file.type;
    if (!fileType.startsWith("image/") && !fileType.startsWith("video/")) {
      alert("Formato não suportado! Envie apenas fotos (PNG, JPG, etc.) ou vídeos (MP4, WEBM, etc.)");
      return;
    }
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    triggerRealtimeLog("FILE_STAGED", `Arquivo '${file.name}' (${(file.size / 1024 / 1024).toFixed(2)} MB) selecionado para upload.`);
  };

  const clearStagedFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Realizar upload e incluir no álbum (Sincronização simulada de dados pelo banco PostgreSQL)
  const handleAddMediaToAlbum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUrl || !selectedFile || !uploadTitle.trim()) {
      alert("Por favor, preencha o título e selecione uma foto ou vídeo!");
      return;
    }

    const type: "photo" | "video" = selectedFile.type.startsWith("video/") ? "video" : "photo";

    const newItem: AlbumItem = {
      id: `alb-${Date.now()}`,
      type: type,
      url: previewUrl,
      category: uploadCategory,
      title: uploadTitle.trim(),
      creator: currentUser.name,
      avatar: currentUser.avatar,
      likes: 1,
      hasLiked: true, // Já inicia como curtido por autoria
      timestamp: "Agora mesmo",
      comments: []
    };

    setAlbumItems(prev => [newItem, ...prev]);
    
    // Logs de persistência Supabase Storage & CDC
    triggerRealtimeLog(
      "STORAGE_UPLOAD",
      `Balde 'copa-media-bucket' recebeu arquivo '${selectedFile.name}' com sucesso.`
    );
    triggerRealtimeLog(
      "DB_INSERT",
      `Tabela 'copa_album' [OP: INSERT] - Nova mídia do tipo '${type}' adicionada em '${uploadCategory}'`
    );

    // Sistema de Notificações Integrado
    triggerRealtimeNotification({
      type: newItem.category === "jogos" ? "novo_jogo" : "novo_post",
      title: newItem.category === "jogos" ? "⚽ Novo Registro de Jogo no Álbum!" : "📸 Novo Adesivo Colado no Álbum!",
      description: `${newItem.creator} adicionou "${newItem.title}" na categoria "${newItem.category === "jogos" ? "Jogos ⚽" : newItem.category === "decoracao" ? "Decoração 🎨" : newItem.category === "preparativos" ? "Preparativos 🛠️" : "Comemorações 🎉"}"`,
      metadata: {
        user: newItem.creator,
        avatar: newItem.avatar,
        linkView: "album"
      }
    });

    // Reseta form
    setUploadTitle("");
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Curtir mídia no Álbum
  const handleLikeItem = (itemId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setAlbumItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const becomesLiked = !item.hasLiked;
        const op = becomesLiked ? "INSERT" : "DELETE";
        triggerRealtimeLog(
          becomesLiked ? "LIKE_INSERT" : "LIKE_REMOVE",
          `Tabela 'album_likes' [OP: ${op}] - Carlos afetou item ID '${itemId}'`
        );
        return {
          ...item,
          hasLiked: becomesLiked,
          likes: becomesLiked ? item.likes + 1 : item.likes - 1
        };
      }
      return item;
    }));
  };

  // Adicionar comentário à mídia
  const handleAddComment = (e: React.FormEvent, itemId: string) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: AlbumComment = {
      id: `ac-${Date.now()}`,
      author: currentUser.name,
      avatar: currentUser.avatar,
      text: commentText.trim(),
      timestamp: "Agora mesmo"
    };

    setAlbumItems(prev => prev.map(item => {
      if (item.id === itemId) {
        triggerRealtimeLog(
          "COMMENT_INSERT",
          `Tabela 'album_comments' [OP: INSERT] - Novo comentário anexado ao item ID '${itemId}'`
        );
        return {
          ...item,
          comments: [...item.comments, newComment]
        };
      }
      return item;
    }));

    setCommentText("");
  };

  // Excluir mídia (Permitido somente mídias enviadas pelo próprio usuário Carlos)
  const handleDeleteItem = (itemId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm("Tem certeza que deseja apagar essa postagem do álbum comunitário?")) {
      return;
    }

    setAlbumItems(prev => prev.filter(item => item.id !== itemId));
    
    // Se estivesse no visualizador do modal, fecha-o
    setSelectedItemIndex(null);

    triggerRealtimeLog(
      "DB_DELETE",
      `Tabela 'copa_album' [OP: DELETE] - Registro do item '${itemId}' e seus comentários relacionados foram deletados.`
    );
  };

  // Filtrando itens com base na busca textual e canal de categoria selecionada
  const filteredAlbumItems = useMemo(() => {
    return albumItems.filter(item => {
      const matchesCategory = activeCategory === "todos" || item.category === activeCategory;
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.creator.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [albumItems, activeCategory, searchQuery]);

  // Navegação do Modal Cinema
  const activeItem = selectedItemIndex !== null ? filteredAlbumItems[selectedItemIndex] : null;

  const nextItem = () => {
    if (selectedItemIndex !== null && selectedItemIndex < filteredAlbumItems.length - 1) {
      setSelectedItemIndex(selectedItemIndex + 1);
    }
  };

  const prevItem = () => {
    if (selectedItemIndex !== null && selectedItemIndex > 0) {
      setSelectedItemIndex(selectedItemIndex - 1);
    }
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans" id="album-copa-root">
      
      {/* HEADER PRINCIPAL DO ÁLBUM */}
      <div className="bg-gradient-to-r from-slate-900/60 via-[#102d1d] to-slate-900/60 border border-emerald-500/15 p-6 rounded-2xl relative overflow-hidden shadow-xl" id="album-copa-header">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-yellow-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-semibold border border-emerald-500/20">
              <Award className="w-3.5 h-3.5 text-yellow-400" />
              Galeria Comunitária • Copa 2026
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
              ÁLBUM DA COPA 🏆🇧🇷
            </h1>
            <p className="text-sm text-slate-350 leading-relaxed font-sans">
              Envie fotos, adicione vídeos de gols e decoração, curta os melhores momentos e comente nas lembranças da nossa rua. Nosso arquivo histórico oficial.
            </p>
          </div>

          <div className="px-4 py-3 bg-slate-950/90 border border-slate-850 rounded-xl flex items-center gap-3 shadow-inner shrink-0" id="album-user-pill">
            <div className="relative">
              <img 
                src={currentUser.avatar} 
                className="w-10 h-10 rounded-full border-2 border-emerald-555 object-cover"
                alt="Carlos"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950" />
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight font-mono">{currentUser.name}</p>
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-400" /> Rede Segura Supabase
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SEÇÃO PRINCIPAL COM SUBIR ARQUIVOS E CORPO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="album-copa-grid">
        
        {/* COLUNA ESQUERDA: BARRA DE UPLOAD & LOGGER REALTIME (4 COLUNAS) */}
        <div className="lg:col-span-4 space-y-6" id="album-left-sidebar">
          
          {/* PAINEL DE DRAG & DROP UPLOAD */}
          <div className="bg-slate-900/60 rounded-xl border border-slate-850 p-5 shadow-sm space-y-4" id="upload-media-card">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5 font-mono">
              <Upload className="w-4 h-4 text-emerald-400" />
              Enviar Nova Mídia
            </h3>

            <form onSubmit={handleAddMediaToAlbum} className="space-y-4">
              
              {/* Dropzone Container */}
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-all ${
                  dragActive 
                    ? "border-emerald-500 bg-emerald-500/10" 
                    : previewUrl 
                      ? "border-slate-800 bg-slate-950/50" 
                      : "border-slate-800 hover:border-emerald-500 bg-slate-950"
                }`}
                id="dropzone-area"
              >
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept="image/*,video/*"
                  className="hidden"
                  id="album-file-input"
                />

                {previewUrl ? (
                  <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                    {selectedFile?.type.startsWith("video/") ? (
                      <div className="relative aspect-video max-h-32 mx-auto rounded overflow-hidden bg-black">
                        <video src={previewUrl} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Play className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    ) : (
                      <img 
                        src={previewUrl} 
                        className="max-h-32 mx-auto rounded object-cover shadow-md" 
                        alt="Draft preview"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className="flex items-center justify-center gap-2 text-xs">
                      <span className="text-emerald-400 font-mono truncate max-w-xs">{selectedFile?.name}</span>
                      <button 
                        type="button"
                        onClick={clearStagedFile}
                        className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-slate-900 transition-colors"
                        title="Limpar seleção"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    <div className="w-10 h-10 rounded-full bg-slate-900/60 flex items-center justify-center mx-auto border border-slate-800">
                      <Upload className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="text-xs">
                      <span className="text-emerald-400 font-bold">Clique para selecionar</span> ou arraste uma foto ou vídeo para cá
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono">
                      PNG, JPG, MP4 ou WEBM (max 15MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Informações detalhadas do Upload */}
              {previewUrl && (
                <div className="space-y-3 font-mono animate-fade-in" id="upload-details-panel">
                  
                  {/* Categoria */}
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Categoria do Álbum</label>
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value as any)}
                      className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded focus:outline-none focus:border-emerald-500 text-slate-300"
                    >
                      <option value="preparativos">Preparativos 🛠️</option>
                      <option value="decoracao">Decoração 🎨</option>
                      <option value="jogos">Jogos ⚽</option>
                      <option value="comemoracoes">Comemorações 🎉</option>
                    </select>
                  </div>

                  {/* Título Descritivo */}
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Título ou Legenda</label>
                    <input 
                      type="text"
                      required
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      placeholder="Ex: Pintura do escudo central finalizada!"
                      className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded focus:outline-none focus:border-emerald-500 text-slate-200"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold text-xs rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/20"
                  >
                    <Check className="w-4 h-4" />
                    <span>Adicionar ao Álbum</span>
                  </button>
                </div>
              )}

            </form>
          </div>

          {/* LOGGER DE EVENTOS REALTIME (CDC) */}
          <div className="bg-slate-900/60 rounded-xl border border-slate-850 p-4.5 space-y-4" id="album-cdc-console">
            
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <div className="flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
                <h4 className="text-xs font-black uppercase text-white font-mono tracking-wider">
                  Postgres Realtime Álbum
                </h4>
              </div>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-400/20 px-1.5 py-0.5 rounded font-mono font-bold">
                CDC ACTIVE
              </span>
            </div>

            <p className="text-[10px] text-slate-450 font-mono leading-relaxed">
              O feed do álbum também escuta a tabela <code>copa_album</code> no schema público do Supabase para refletir as imagens compartilhadas em tempo real.
            </p>

            <div className="bg-[#030712]/95 border border-slate-900 rounded-lg p-2.5 h-[230px] overflow-y-auto custom-scrollbar space-y-1.5 font-mono text-[9px] select-none leading-relaxed">
              {realtimeLogs.map((log) => (
                <div key={log.id} className="text-slate-400">
                  <span className="text-slate-600">[{log.time}]</span>{" "}
                  <span className="text-emerald-400 font-bold">{log.event}</span>{" "}
                  <span className="text-neutral-300 text-[10px]">{log.details}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* COLUNA DIREITA: GALERIA DE MÍDIAS, FILTROS E PESQUISA (8 COLUNAS) */}
        <div className="lg:col-span-8 space-y-6" id="album-main-content">
          
          {/* BARRA DE FILTROS E BUSCA */}
          <div className="bg-slate-900/60 rounded-xl border border-slate-850 p-4 flex flex-col md:flex-row items-center justify-between gap-4" id="filters-and-search">
            
            {/* Abas das Categorias */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 custom-scrollbar shrink-0" id="category-filter-tabs">
              
              <button
                onClick={() => setActiveCategory("todos")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeCategory === "todos"
                    ? "bg-slate-800 text-white border border-emerald-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                }`}
              >
                Todos
              </button>

              <button
                onClick={() => setActiveCategory("preparativos")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  activeCategory === "preparativos"
                    ? "bg-emerald-950/50 text-emerald-300 border border-emerald-500/40"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                }`}
              >
                <span>🛠️</span>
                <span>Preparativos</span>
              </button>

              <button
                onClick={() => setActiveCategory("decoracao")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  activeCategory === "decoracao"
                    ? "bg-emerald-950/50 text-emerald-300 border border-emerald-500/40"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                }`}
              >
                <span>🎨</span>
                <span>Decoração</span>
              </button>

              <button
                onClick={() => setActiveCategory("jogos")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  activeCategory === "jogos"
                    ? "bg-emerald-950/50 text-emerald-300 border border-emerald-500/40"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                }`}
              >
                <span>⚽</span>
                <span>Jogos</span>
              </button>

              <button
                onClick={() => setActiveCategory("comemoracoes")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  activeCategory === "comemoracoes"
                    ? "bg-emerald-950/50 text-emerald-300 border border-emerald-500/40"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                }`}
              >
                <span>🎉</span>
                <span>Comemorações</span>
              </button>

            </div>

            {/* Input de Busca */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <input 
                type="text"
                value={searchQuery}
                aria-label="Buscar imagens e vídeos"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar no álbum..."
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
              />
            </div>

          </div>

          {/* GRID GALERIA BENTO ESTILO INSTAGRAM / PINTEREST */}
          {filteredAlbumItems.length === 0 ? (
            <div className="bg-slate-905/70 rounded-xl border border-slate-850 p-12 text-center space-y-4" id="album-empty-state">
              <div className="w-12 h-12 rounded-full bg-slate-950 flex items-center justify-center mx-auto border border-slate-800">
                <ImageIcon className="w-6 h-6 text-slate-500" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-200">Nenhuma postagem encontrada</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Tente alterar os termos de busca ou filtros de categorias, ou seja o primeiro a mandar um registo de Copa!
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" id="album-bento-grid">
              
              <AnimatePresence mode="popLayout">
                {filteredAlbumItems.map((item, index) => (
                  <motion.div
                    layout
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="group relative bg-slate-905/85 rounded-xl overflow-hidden border border-slate-850/70 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-950/10 cursor-pointer aspect-square flex flex-col justify-between"
                    onClick={() => {
                      setSelectedItemIndex(index);
                      triggerRealtimeLog("LIGHTBOX_OPEN", `Abriu painel detalhado do item '${item.title}'`);
                    }}
                    id={`album-item-${item.id}`}
                  >
                    
                    {/* Renderização de Imagem / Vídeo Preview */}
                    <div className="absolute inset-0 z-0 bg-slate-950">
                      {item.type === "video" ? (
                        <div className="w-full h-full relative">
                          <video src={item.url} className="w-full h-full object-cover muted" playsInline loop />
                          <div className="absolute top-2 right-2 p-1.5 rounded-md bg-slate-950/70 text-white backdrop-blur-md">
                            <Video className="w-4 h-4" />
                          </div>
                        </div>
                      ) : (
                        <img 
                          src={item.url} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-400" 
                          alt={item.title}
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>

                    {/* OVERLAY DE HOVER (Curtidas e Comentários estilo Instagram) */}
                    <div className="absolute inset-0 bg-slate-950/80 p-4 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex flex-col justify-between backdrop-blur-[2px]">
                      
                      {/* Header do Overlay */}
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded font-mono uppercase tracking-wider font-bold">
                          {item.category}
                        </span>

                        {/* Permitir Excluir se enviado pelo Carlos */}
                        {item.creator === currentUser.name && (
                          <button 
                            onClick={(e) => handleDeleteItem(item.id, e)}
                            className="bg-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/30 p-1 rounded-md transition-all font-mono"
                            title="Apagar foto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Corpo do Overlay (Resumo de likes/comments) */}
                      <div className="space-y-2">
                        <p className="text-[11px] font-bold text-white line-clamp-2 leading-snug">
                          {item.title}
                        </p>

                        <div className="flex items-center gap-4 text-xs font-mono pt-1 text-slate-300">
                          
                          {/* Like overlay interaction */}
                          <div 
                            onClick={(e) => handleLikeItem(item.id, e)}
                            className="flex items-center gap-1.5 hover:text-red-400 transition-colors"
                          >
                            <Heart className={`w-4 h-4 ${item.hasLiked ? "fill-red-500 text-red-500" : "text-slate-300"}`} />
                            <span>{item.likes}</span>
                          </div>

                          {/* Comments overlay item */}
                          <div className="flex items-center gap-1.5">
                            <MessageCircle className="w-4 h-4 text-slate-300" />
                            <span>{item.comments.length}</span>
                          </div>

                        </div>
                      </div>

                      {/* Autor */}
                      <div className="flex items-center gap-2 border-t border-slate-800/40 pt-2">
                        <img 
                          src={item.avatar} 
                          className="w-5 h-5 rounded-full object-cover" 
                          alt="Creator avatar"
                          referrerPolicy="no-referrer"
                        />
                        <span className="text-[10px] text-slate-400 font-mono truncate">{item.creator}</span>
                      </div>

                    </div>

                  </motion.div>
                ))}
              </AnimatePresence>

            </div>
          )}

        </div>

      </div>

      {/* MODAL LIGHTBOX / VISUALIZADOR CINEMA (Inspirado no visualizador do Instagram/Mural) */}
      <AnimatePresence>
        {selectedItemIndex !== null && activeItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/95 z-50 flex items-center justify-center p-4 backdrop-blur-md"
            id="lightbox-modal"
          >
            {/* Fechar Lightbox ao clicar no background */}
            <div className="absolute inset-0 z-0" onClick={() => setSelectedItemIndex(null)} />

            {/* Container do Lightbox */}
            <div className="relative z-10 max-w-5xl w-full bg-slate-905 border border-slate-850 rounded-2xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12 max-h-[85vh]">
              
              {/* COLUNA ESQUERDA: MÍDIA (Foto / Vídeo Player) (COLS: 7) */}
              <div className="md:col-span-7 bg-black flex items-center justify-center relative min-h-[300px] md:min-h-[500px]">
                
                {activeItem.type === "video" ? (
                  <video 
                    src={activeItem.url} 
                    className="w-full max-h-[75vh] object-contain"
                    controls
                    autoPlay
                    loop
                  />
                ) : (
                  <img 
                    src={activeItem.url} 
                    className="w-full max-h-[75vh] object-contain" 
                    alt={activeItem.title}
                    referrerPolicy="no-referrer"
                  />
                )}

                {/* Botões do Próximo / Anterior no Lightbox */}
                {selectedItemIndex > 0 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); prevItem(); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-800 transition-all group"
                  >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                  </button>
                )}

                {selectedItemIndex < filteredAlbumItems.length - 1 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); nextItem(); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-800 transition-all group"
                  >
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}

                {/* Categoria Tag no topo */}
                <div className="absolute top-4 left-4 bg-emerald-900/85 backdrop-blur-sm border border-emerald-500/20 text-emerald-300 font-mono text-[10px] px-2.5 py-1 rounded font-bold uppercase">
                  {activeItem.category}
                </div>

              </div>

              {/* COLUNA DIREITA: INFORMAÇÕES, LIKES, COMENTÁRIOS DA MÍDIA (COLS: 5) */}
              <div className="md:col-span-5 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-850 bg-slate-900/50 max-h-[75vh]">
                
                {/* Header: Autor e Fechar */}
                <div className="p-4 flex items-center justify-between border-b border-slate-850/50">
                  <div className="flex items-center gap-3">
                    <img 
                      src={activeItem.avatar} 
                      className="w-10 h-10 rounded-full object-cover border border-slate-800"
                      alt={activeItem.creator}
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white font-mono">{activeItem.creator}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">Compartilhado • {activeItem.timestamp}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => setSelectedItemIndex(null)}
                    className="p-1 rounded bg-slate-950 border border-slate-850 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Legenda/Título */}
                <div className="p-4 border-b border-slate-850/50 text-xs shadow-inner">
                  <p className="text-slate-200 leading-relaxed font-sans font-medium">
                    "{activeItem.title}"
                  </p>
                </div>

                {/* Comentários Listados */}
                <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4 max-h-[30vh] md:max-h-[35vh]">
                  {activeItem.comments.length === 0 ? (
                    <div className="py-6 text-center text-slate-550 font-mono text-[11px] h-full flex flex-col items-center justify-center space-y-1">
                      <span>Nenhum comentário na mídia.</span>
                      <span className="text-[10px] text-slate-650">Seja o primeiro a enviar sua opinião!</span>
                    </div>
                  ) : (
                    activeItem.comments.map((comm) => (
                      <div key={comm.id} className="text-xs leading-normal flex items-start gap-3 bg-slate-950/20 p-2 rounded-lg border border-slate-850/20 font-mono">
                        <img 
                          src={comm.avatar} 
                          className="w-6 h-6 rounded-full object-cover mt-0.5 shrink-0" 
                          alt={comm.author}
                          referrerPolicy="no-referrer"
                        />
                        <div className="space-y-0.5 leading-snug">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-250 font-bold">{comm.author}</span>
                            <span className="text-[8px] text-slate-600 font-mono">{comm.timestamp}</span>
                          </div>
                          <p className="text-slate-400 font-sans text-[11px] leading-relaxed">{comm.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Painel de Interações Práticas (Curtir, Comentar) */}
                <div className="p-4 border-t border-slate-850/80 bg-slate-950/40 space-y-3 shrink-0">
                  
                  {/* Caixa de Curtir / Compartilhar */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      
                      {/* Like button in modal */}
                      <button 
                        onClick={() => handleLikeItem(activeItem.id)}
                        className="flex items-center gap-1.5 text-slate-300 hover:text-red-400 transition-colors group cursor-pointer"
                      >
                        <Heart className={`w-5 h-5 transition-all duration-205 ${activeItem.hasLiked ? "fill-red-500 text-red-500 scale-105" : "group-hover:scale-110"}`} />
                        <span className="text-xs font-bold font-mono">{activeItem.likes} curtidas</span>
                      </button>

                      {/* Compartilhar Simulado */}
                      <button 
                        onClick={() => {
                          alert("Link de compartilhamento copiado! Envie para o grupo exclusivo da fofoca no WhatsApp do prédio.");
                          triggerRealtimeLog("MEDIA_SHARE", `Compartilhamento acionado para o item de mídia '${activeItem.id}'`);
                        }}
                        className="flex items-center gap-1.5 text-slate-450 hover:text-sky-400 transition-colors text-xs font-mono font-bold cursor-pointer"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Compartilhar</span>
                      </button>

                    </div>

                    {/* Excluir da barra de baixo se válido */}
                    {activeItem.creator === currentUser.name && (
                      <button 
                        onClick={(e) => handleDeleteItem(activeItem.id, e)}
                        className="flex items-center gap-1.5 text-red-450 hover:text-red-400 transition-colors font-mono font-bold text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Apagar</span>
                      </button>
                    )}
                  </div>

                  {/* Form de Comentário */}
                  <form onSubmit={(e) => handleAddComment(e, activeItem.id)} className="flex gap-2">
                    <input 
                      type="text"
                      required
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Adicione um comentário..."
                      className="flex-1 text-xs p-2.5 bg-slate-950 border border-slate-850 rounded focus:outline-none focus:border-emerald-500 text-slate-200 font-sans"
                    />
                    <button 
                      type="submit"
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded font-mono uppercase tracking-wide cursor-pointer"
                    >
                      Enviar
                    </button>
                  </form>

                </div>

              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
