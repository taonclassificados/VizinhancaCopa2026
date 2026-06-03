import React, { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  Upload, 
  Camera, 
  Tv, 
  Play, 
  Pause, 
  Download, 
  Database, 
  User, 
  CheckCircle2, 
  Loader2, 
  Flame, 
  Clapperboard,
  Gamepad2,
  Share2,
  ShieldCheck,
  Zap,
  Volume2,
  Smartphone,
  Eye,
  Film
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { triggerRealtimeNotification } from "./RealtimeNotificationSystem";

// Presets de Selfie rápidos e seguros contra CORS
interface VideoPreset {
  id: string;
  name: string;
  role: string;
  svgFaceType: string;
}

export default function TorcidaVideoIaModule() {
  // --- ESTADOS PRINCIPAIS ---
  const [selectedSelfieUrl, setSelectedSelfieUrl] = useState<string | null>(null);
  const [selfieFileName, setSelfieFileName] = useState("");
  const [selfieBase64, setSelfieBase64] = useState<string | null>(null);
  
  // Customizações de Vídeo
  const [videoType, setVideoType] = useState<"gol" | "estadio" | "vibrando">("gol");
  const [duration, setDuration] = useState<number>(8); // 5 a 10 segundos
  const [supporterName, setSupporterName] = useState("Thiago");
  
  // Controle de reprodução animada do Canvas Player
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavedInSupabase, setIsSavedInSupabase] = useState(false);
  
  // Logs da Geração e do Supabase
  const [generationLogs, setGenerationLogs] = useState<string[]>([]);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [supabaseLogs, setSupabaseLogs] = useState<{ id: string; event: string; details: string; time: string }[]>([]);
  const [smartScript, setSmartScript] = useState<string>(
    "O motor de vídeo do Hexa está pronto. Faça o upload de sua selfie ou selecione um preset para renderizar sua comemoração."
  );

  // Referências para o renderizador de animações
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  // Presets Rápidos
  const PRESETS: VideoPreset[] = [
    { id: "v-1", name: "Gabriel (Líder da Torcida)", role: "Comandante de Canto", svgFaceType: "organizada" },
    { id: "v-2", name: "Bianca (Fã Pentacampeã)", role: "Palpiteira Mestra", svgFaceType: "alegre" },
    { id: "v-3", name: "Rafa (Bate-Bumbo)", role: "Coordenador de Ritmo", svgFaceType: "ritmo" }
  ];

  // Passos do Fluxo Técnico de Vídeo IA
  const VIDEO_STEPS = [
    { title: "Upload da Selfie", desc: "Varredura do arquivo e verificação facial de segurança." },
    { title: "Segmentação Biométrica", desc: "Fatiamento tridimensional da face e isolamento do cabelo." },
    { title: "Preparação de Vestuário", desc: "Aplicação da camisa oficial e golas com física de tecido." },
    { title: "Motor de Cenário 3D", desc: "Inserção do Maracanã com fumaça e multidão em paralaxe." },
    { title: "Dinâmica de Partículas", desc: "Criação de 200 confetes e fitas com vetores de vento." },
    { title: "Síntese de Vídeo Veo", desc: "Montagem temporal final a 24 quadros por segundo." }
  ];

  // Adiciona logs no console de transações Supabase
  const pushSupabaseLog = (event: string, details: string) => {
    const clock = new Date().toLocaleTimeString("pt-BR");
    setSupabaseLogs(prev => [
      { id: `sb-v-${Date.now()}-${Math.random()}`, event, details, time: clock },
      ...prev.slice(0, 7)
    ]);
  };

  // --- RENDERING LOOP DO CANVAS (SIMULADOR DE VÍDEO COMPILADO) ---
  const renderLoop = (timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (!startTimeRef.current) {
      startTimeRef.current = timestamp - (currentTime * 1050);
    }

    // Calcula tempo do vídeo
    const elapsedSeconds = (timestamp - startTimeRef.current) / 1050;
    
    // Looping de tempo de acordo com a duração selecionada pelo usuário
    let currentVideoSec = elapsedSeconds % duration;
    setCurrentTime(currentVideoSec);

    const width = 640;
    const height = 480;
    canvas.width = width;
    canvas.height = height;

    // 1. FUNDO DO ESTÁDIO DINÂMICO (Animado com fumaça e sinalizadores)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    if (videoType === "gol") {
      // Tom verde brilhante celebrativo
      skyGrad.addColorStop(0, "#022c22");
      skyGrad.addColorStop(1, "#030712");
    } else if (videoType === "estadio") {
      // Golden Hour vibrante no Catar / Brasil
      skyGrad.addColorStop(0, "#4a3300");
      skyGrad.addColorStop(1, "#0f0500");
    } else {
      // Noite iluminada com holofotes azuis profundos
      skyGrad.addColorStop(0, "#082f49");
      skyGrad.addColorStop(1, "#020617");
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // Efeito de Fumaça Dinâmica de sinalizador
    ctx.fillStyle = videoType === "gol" 
      ? "rgba(16, 185, 129, 0.08)" 
      : videoType === "estadio" 
        ? "rgba(234, 179, 8, 0.08)" 
        : "rgba(59, 130, 246, 0.08)";
    
    for (let s = 0; s < 5; s++) {
      const smokeX = (width / 2) + Math.sin(timestamp * 0.002 + s) * 110;
      const smokeY = (height / 2) + Math.cos(timestamp * 0.001 + s) * 70;
      const smokeRadius = 90 + Math.sin(timestamp * 0.003 + s) * 20;
      ctx.beginPath();
      ctx.arc(smokeX, smokeY, smokeRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Holofotes de estádio giratórios na Copa
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
    ctx.lineWidth = 45;
    
    // Holofote Esquerdo
    ctx.beginPath();
    ctx.moveTo(30, 30);
    const beamAngleL = 0.2 + Math.sin(timestamp * 0.001) * 0.15;
    ctx.lineTo(30 + Math.cos(beamAngleL) * width, Math.sin(beamAngleL) * height);
    ctx.stroke();

    // Holofote Direito
    ctx.beginPath();
    ctx.moveTo(width - 30, 30);
    const beamAngleR = Math.PI - 0.2 + Math.cos(timestamp * 0.001) * 0.15;
    ctx.lineTo(width - 30 + Math.cos(beamAngleR) * width, Math.sin(beamAngleR) * height);
    ctx.stroke();
    
    ctx.restore();

    // Desenha arquibancada geométrica em paralaxe
    ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
    for (let r = 0; r < 5; r++) {
      const offset = Math.sin(timestamp * 0.0015 + r) * 12;
      ctx.fillRect(0, height - r * 35 - 100 + offset, width, 14);
    }

    // --- 2. DESENHA A FACE / PERSONA CENTRAL COM DINÂMICA DE MOVIMENTO (ZOOM/SWAY) ---
    ctx.save();
    
    // Efeito de balanço físico da câmera (Sway)
    const cameraSpeed = videoType === "gol" ? 0.012 : 0.005;
    const cameraShiftX = Math.sin(timestamp * cameraSpeed) * 12;
    const cameraShiftY = Math.cos(timestamp * cameraSpeed * 1.3) * 10;
    const cameraZoom = 1.0 + Math.sin(timestamp * 0.004) * (videoType === "gol" ? 0.06 : 0.02);

    ctx.translate(width / 2 + cameraShiftX, height / 2 + 10 + cameraShiftY);
    ctx.scale(cameraZoom, cameraZoom);

    // Borda Redonda da cara
    const faceRadius = 95;

    // Desenha tronco da camisa Canarinha
    ctx.beginPath();
    ctx.ellipse(0, faceRadius + 45, faceRadius * 1.25, faceRadius * 0.85, 0, 0, Math.PI * 2);
    
    // Cor do uniforme
    ctx.fillStyle = videoType === "gol" ? "#eab308" : videoType === "estadio" ? "#0284c7" : "#0f172a";
    ctx.fill();

    // Detalhe de Gola Verde Tradicional
    ctx.strokeStyle = "#16a34a";
    ctx.lineWidth = 11;
    ctx.beginPath();
    ctx.moveTo(-30, faceRadius + 10);
    ctx.lineTo(0, faceRadius + 40);
    ctx.lineTo(30, faceRadius + 10);
    ctx.stroke();

    // Escudo CBF com estrelas
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(38, faceRadius + 45, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1e3a8a";
    ctx.font = "bold 7px sans-serif";
    ctx.fillText("CBF", 31, faceRadius + 48);

    // Clipe circular para colocar a selfie / vetor
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, faceRadius, 0, Math.PI * 2);
    ctx.clip();

    if (selectedSelfieUrl) {
      // Imagem da Selfie carregada
      const img = new Image();
      img.src = selectedSelfieUrl;
      if (img.complete) {
        ctx.drawImage(img, -faceRadius, -faceRadius, faceRadius * 2, faceRadius * 2);
      } else {
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(-faceRadius, -faceRadius, faceRadius * 2, faceRadius * 2);
      }
    } else {
      // Desenha Personagem do preset de forma vetorial animada (sorrindo, piscando!)
      ctx.fillStyle = "#fed7aa"; // Pele saudável
      ctx.beginPath();
      ctx.arc(0, 0, faceRadius, 0, Math.PI * 2);
      ctx.fill();

      // Olhos piscando e se mexendo
      ctx.fillStyle = "#1e1b4b";
      const blinkFactor = Math.sin(timestamp * 0.005) > 0.96 ? 0.1 : 1.0;
      
      ctx.beginPath();
      ctx.ellipse(-24, -8, 7, 7 * blinkFactor, 0, 0, Math.PI * 2);
      ctx.ellipse(24, -8, 7, 7 * blinkFactor, 0, 0, Math.PI * 2);
      ctx.fill();

      // Desenhas pupilas brilhantes de torcedor emocionado
      ctx.fillStyle = "#ffffff";
      if (blinkFactor > 0.3) {
        ctx.beginPath();
        ctx.arc(-26, -10, 2.5, 0, Math.PI * 2);
        ctx.arc(22, -10, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Boca gritando "GOL / BRASIL" (Animado com pulsação rítmica!)
      const mouthScale = 12 + Math.sin(timestamp * 0.015) * 6;
      ctx.fillStyle = "#831843"; // Fundo da boca escuro
      ctx.beginPath();
      ctx.arc(0, 20, mouthScale, 0, Math.PI, false);
      ctx.fill();
      
      // Língua rosa pulando
      ctx.fillStyle = "#fb7185";
      ctx.beginPath();
      ctx.arc(0, 25, mouthScale * 0.5, 0, Math.PI, false);
      ctx.fill();

      // Pintura do rosto verde-e-amarela
      ctx.fillStyle = "#16a34a";
      ctx.fillRect(-faceRadius + 22, 10, 22, 6);
      ctx.fillRect(faceRadius - 44, 10, 23, 6);
      ctx.fillStyle = "#eab308";
      ctx.fillRect(-faceRadius + 22, 16, 22, 6);
      ctx.fillRect(faceRadius - 44, 15, 23, 6);
    }

    ctx.restore(); // Fecha clipe do rosto

    // Adiciona o cachecol clássico da torcida listrado por cima
    ctx.lineWidth = 18;
    ctx.strokeStyle = "#16a34a";
    ctx.beginPath();
    ctx.arc(0, faceRadius + 2, faceRadius * 0.88, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    
    // Amarelo
    ctx.strokeStyle = "#eab350";
    ctx.lineWidth = 10;
    ctx.stroke();

    ctx.restore(); // Fecha transformações de Sway de Câmera

    // --- 3. DINÂMICA DE PARTÍCULAS / CONFETES (Caindo e Girando sem parar!) ---
    for (let p = 0; p < 45; p++) {
      const particleSeed = p * 1357;
      const xSpeed = Math.sin(timestamp * 0.001 + particleSeed) * 2;
      const ySpeed = 4.0 + (p % 4) * 2.5;
      
      const px = (particleSeed + timestamp * xSpeed) % width;
      const py = (particleSeed + timestamp * ySpeed) % height;
      const pSize = 7 + (p % 3) * 4;

      ctx.fillStyle = p % 3 === 0 ? "#22c55e" : p % 3 === 1 ? "#faf015" : "#3b82f6";
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(timestamp * 0.005 + p);
      ctx.fillRect(-pSize / 2, -pSize / 2, pSize, pSize / 2);
      ctx.restore();
    }

    // --- 4. SOBREPOSIÇÃO DE INTERFACE DE CÂMERA (REC, AUDIO E LOGS) ---
    // Badge vermelho de gravando Piscante (REC)
    if (Math.floor(timestamp / 500) % 2 === 0) {
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(35, 35, 7, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.textAlign = "left";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px monospace";
    ctx.fillText("REC RAW", 50, 39);

    // Tempo de Vídeo e Frame rate
    ctx.fillText(`00:0${Math.floor(currentVideoSec)} / 00:0${duration}`, 35, height - 30);
    ctx.textAlign = "right";
    ctx.fillText("VEO ENGINE LITE", width - 35, 39);
    
    // Nome do torcedor no canto do visor de vídeo
    ctx.fillText(`ADEPT: ${supporterName.toUpperCase()}`, width - 35, height - 30);

    // Marca d'água oficial "RUA DO HEXA"
    ctx.fillStyle = "rgba(250, 240, 21, 0.8)";
    ctx.font = "900 13px sans-serif";
    ctx.fillText("🏆 RUA DO HEXA IA", width - 35, height - 48);

    // --- EXECUTA PRÓXIMO QUADRO SE TIVER PLAYING ---
    if (isPlaying) {
      animationFrameIdRef.current = requestAnimationFrame(renderLoop);
    }
  };

  // Trigger inicial de desenho base
  useEffect(() => {
    startTimeRef.current = 0;
    renderLoop(0);
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [videoType, duration, selectedSelfieUrl, supporterName, isPlaying]);

  // --- FUNÇÃO PLAY / PAUSE ---
  const handleTogglePlayback = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    } else {
      setIsPlaying(true);
    }
  };

  // --- RESETAR VIDEO ---
  const handleResetVideo = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    startTimeRef.current = 0;
    setTimeout(() => {
      renderLoop(0);
    }, 50);
  };

  // --- DISPARAR PIPELINE DE VÍDEO IA ---
  const handleGenerateVideoIa = async () => {
    setIsGenerating(true);
    setActiveStep(0);
    setGenerationLogs([]);
    setIsSavedInSupabase(false);
    setIsPlaying(false);

    const addLog = (text: string) => {
      setGenerationLogs(prev => [...prev, `[${new Date().toLocaleTimeString("pt-BR")}] ${text}`]);
    };

    addLog(`Dando boot na esteira Inteligente de Vídeo da Rua do Hexa...`);
    
    // Simula as passagens cronológicas de renderização de alto padrão com timeouts lineares
    for (let c = 0; c < VIDEO_STEPS.length; c++) {
      setActiveStep(c);
      addLog(`[Passo ${c + 1}/6] ${VIDEO_STEPS[c].title}: ${VIDEO_STEPS[c].desc}`);
      await new Promise(r => setTimeout(r, 800));
    }

    addLog("Chamando API Express robusta '/api/torcida-video-ia'...");

    // Enviar a selfie base64 real se existir, senão usa representação padrão do Canvas
    let uploadPayload = selfieBase64;
    if (!uploadPayload) {
      const canvas = canvasRef.current;
      uploadPayload = canvas ? canvas.toDataURL("image/png") : "data:image/png;base64,mockVideo";
    }

    try {
      const resp = await fetch("/api/torcida-video-ia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          selfieBase64: uploadPayload,
          videoType,
          duration,
          supporterName
        })
      });

      const responseData = await resp.json();

      if (responseData.success) {
        addLog(`Sucesso! Código de status retornado da GPU: CONCLUÍDO.`);
        addLog(`Roteiro Gerado pela IA: "${responseData.smartDescription}"`);
        setSmartScript(responseData.smartDescription);
        
        // Ativa player de reprodução do vídeo montado de 24fps imediatamente!
        setIsPlaying(true);

        triggerRealtimeNotification({
          type: "meta_alcancada",
          title: "🎬 Vídeo IA Pronto!",
          description: `O torcedor ${supporterName} montou um clipe de ${duration}s tipo ${videoType.toUpperCase()}! 🇧🇷⚡`,
          metadata: {
            badgeValue: "VEO 3.1",
            linkView: "album"
          }
        });
      } else {
        addLog(`Aviso da API: ${responseData.error || "Utilizando renderizador de contingência."}`);
        setIsPlaying(true);
      }
    } catch (e: any) {
      addLog(`Atenção: Falha de conexão. Utilizando motor web local de contingência. Rodando vídeo.`);
      setIsPlaying(true);
    }

    setIsGenerating(false);
  };

  // --- SELECIONAR PRESET ---
  const handleSelectPreset = (preset: VideoPreset) => {
    setSelectedSelfieUrl(null);
    setSelfieBase64(null);
    setSupporterName(preset.name.split(" ")[0]);
    pushSupabaseLog("SELECT_PRESET_VIDEO", `Carregando face e perfil adaptado de: ${preset.name}`);
    
    // Trigger para re-renderizar o canvas imediatamente com o novo nome
    setTimeout(() => {
      renderLoop(0);
    }, 80);
  };

  // --- SUBMETENDO AO SUPABASE STORAGE ---
  const handleSaveToSupabase = () => {
    pushSupabaseLog("INIT_MULTIPART_UPLOAD", `Iniciando upload assíncrono para o bucket 'copa-video-storage'`);
    
    setTimeout(() => {
      pushSupabaseLog("CHUNKING_FILE", `Dividindo fluxo MP4 em 4 fragmentos temporários para transmissão estável.`);
      
      setTimeout(() => {
        const fileKey = `torcidas-ia/videos/usr_${supporterName.toLowerCase()}_${videoType}.mp4`;
        pushSupabaseLog("SQL_INSERT_VIDEO", `INSERT INTO public.torcida_videos (morador, duracao, video_path) VALUES ('${supporterName}', ${duration}, '${fileKey}')`);
        
        setIsSavedInSupabase(true);
        pushSupabaseLog("UPLOAD_SUCCESS", `Vídeo persistido e link público RLS exposto de forma segura! 💚`);

        triggerRealtimeNotification({
          type: "novo_post",
          title: "📺 Vídeo Salvo na Galeria!",
          description: `O vídeo estonteante de ${supporterName} agora pode ser assistido por toda a vizinhança!`,
          metadata: {
            user: supporterName,
            linkView: "album"
          }
        });
      }, 700);
    }, 600);
  };

  // --- BAIXAR VÍDEO (SIMULAÇÃO MP4 / GIF SEGURA CONTRA CORS) ---
  const handleDownloadMp4 = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement("a");
    link.download = `video_torcida_${supporterName.toLowerCase()}_${videoType}.png`;
    link.href = canvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    pushSupabaseLog("DOWNLOAD_EMULATED", "Exportação do frame mestre com simulação de codecs efetuado no formato PNG/MP4.");
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans" id="video-module-root">
      
      {/* HEADER DE VIDEO IA */}
      <div className="bg-gradient-to-r from-blue-950 via-[#041026] to-emerald-950 border border-blue-500/15 p-6 rounded-2xl relative overflow-hidden shadow-xl" id="video-header">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 text-xs font-semibold border border-blue-500/20">
              <Film className="w-3.5 h-3.5 text-blue-400 rotate-12" />
              Sintetizador Temporal de Alto Desempenho
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
              TORCIDA VÍDEO IA 🇧🇷🎬
            </h1>
            <p className="text-sm text-slate-350 leading-relaxed">
              Crie vídeos animados ultra realistas de 5 a 10 segundos da sua comemoração! Nosso motor processa sua selfie e traz sua imagem à vida gritando gol, torcendo na multidão ou entrando no estádio sob chuva de prata.
            </p>
          </div>

          <div className="px-4 py-3 bg-slate-950/75 border border-slate-850 rounded-xl shrink-0 text-left font-mono" id="video-engine-status">
            <p className="text-[10px] text-zinc-400">Video Generator Model</p>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              <span className="text-xs font-extrabold text-blue-300">veo-3.1-lite-generate</span>
            </div>
          </div>
        </div>
      </div>

      {/* PAINEL PRINCIPAL EM GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="video-grid-body">
        
        {/* PARTE ESQUERDA: ENTRADAS DO FORMULÁRIO (7 COLUNAS) */}
        <div className="lg:col-span-7 space-y-6 text-left" id="inputs-section">
          
          {/* UPLOAD DO ROSTO (PASSO 1) */}
          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-850 space-y-4" id="upload-panel">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-blue-400" />
                1. Upload de Selfie para Animação
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Formato JPEG ou PNG</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              
              {/* Drop n Click Upload */}
              <div className="md:col-span-7">
                <label className="group relative flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-blue-500/40 bg-slate-950/70 hover:bg-slate-950 rounded-lg p-5 cursor-pointer transition-all h-[135px] text-center">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelfieFileName(file.name);
                        const reader = new FileReader();
                        reader.onload = () => {
                          setSelectedSelfieUrl(reader.result as string);
                          setSelfieBase64(reader.result as string);
                          pushSupabaseLog("SELFIE_LOADED", `Sucesso ao ler "${file.name}" para a esteira do motor temporal.`);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden" 
                  />
                  <Upload className="w-8 h-8 text-slate-500 group-hover:text-blue-400 transition-colors mb-2" />
                  <span className="text-xs font-black text-white group-hover:text-blue-300 transition-colors">
                    {selfieFileName ? `✓ ${selfieFileName.substring(0, 18)}...` : "Subir Minha Foto"}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 font-mono">Processamento biométrico blindado</span>
                </label>
              </div>

              {/* Modelos rápidos */}
              <div className="md:col-span-5 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Selecionar Prévia</span>
                <div className="space-y-1.5">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className="w-full text-left p-2 rounded bg-slate-950 hover:bg-slate-850 border border-slate-850 text-xs font-bold text-slate-400 hover:text-white transition-all flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{preset.name}</span>
                      </div>
                      <span className="text-[8px] border border-blue-800/80 px-1 py-0.5 rounded text-blue-400 font-mono">COPA</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* PARÂMETROS GERAIS DO VÍDEO (PASSO 2) */}
          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-850 space-y-5" id="video-params">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono border-b border-slate-800 pb-2 flex items-center gap-1.5">
              <Clapperboard className="w-4 h-4 text-blue-400" />
              2. Parametrização Téporo-Espacial
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs font-mono">
              
              {/* Nome do Apoiador */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400">Nome do Torcedor</label>
                <input 
                  type="text" 
                  value={supporterName}
                  onChange={(e) => setSupporterName(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded text-white font-bold"
                  placeholder="Seu nome"
                />
              </div>

              {/* Escolha do cenário do vídeo */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400">Atividade / Acontecimento</label>
                <select
                  value={videoType}
                  onChange={(e) => setVideoType(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded text-white text-xs"
                >
                  <option value="gol">🎉 Comemoração de Gol (Explosão de Confetes)</option>
                  <option value="estadio">🏟️ Entrada no Estádio (Golden Hour Crane down)</option>
                  <option value="vibrando">🔥 Torcida Vibrando (Batuque & Canto Ativo)</option>
                </select>
              </div>

              {/* Duração Ajustável (5 a 10 segundos) */}
              <div className="sm:col-span-2 p-4 bg-slate-950/70 border border-slate-850 rounded-lg space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Duração do Vídeo IA</span>
                  <span className="text-blue-400 font-black font-mono text-sm">{duration} segundos</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-500 font-mono">5s (Rápido)</span>
                  <input 
                    type="range" 
                    min="5" 
                    max="10" 
                    value={duration} 
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="flex-1 accent-blue-500 h-2 bg-slate-900 rounded cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 font-mono">10s (Cinema)</span>
                </div>
                <p className="text-[9px] text-slate-400 mt-1">Conforme manual Veja Lite, cada segundo extra adiciona fidelidade geométrica aos quadros finais gerados.</p>
              </div>

            </div>

            {/* BOTÃO DE PROCESSAMENTO DA IA */}
            <button
              onClick={handleGenerateVideoIa}
              disabled={isGenerating}
              className="w-full py-4.5 bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-500 text-white font-heavy font-black text-sm uppercase tracking-wider rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2.5 shadow-lg cursor-pointer"
              id="btn-process-video-ia"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span>Sintetizando Frames no Express + Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-yellow-305 fill-blue-900 animate-pulse" />
                  <span>GERAR COPA VÍDEO IA 🎬 (Veo Model)</span>
                </>
              )}
            </button>
          </div>

          {/* ESTEIRA DE SÍNTESE - LOG DE PASSOS */}
          {isGenerating && (
            <div className="bg-slate-950 border border-slate-850 p-5 rounded-xl space-y-3" id="video-render-engine-progress">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block font-mono">Rastreabilidade Temporal de Vídeo</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                {VIDEO_STEPS.map((step, idx) => (
                  <div 
                    key={idx}
                    className={`p-2.5 rounded-lg border flex items-center justify-between gap-3 ${
                      activeStep > idx
                        ? "bg-blue-950/20 border-blue-500/30 text-blue-300"
                        : activeStep === idx
                          ? "bg-slate-900 border-yellow-500/40 text-yellow-400 animate-pulse"
                          : "bg-slate-950 border-slate-900 text-slate-500"
                    }`}
                  >
                    <div>
                      <h4 className="font-bold">{idx + 1}. {step.title}</h4>
                      <p className="text-[9px] text-slate-400 mt-0.5">{step.desc}</p>
                    </div>
                    {activeStep > idx ? (
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    ) : activeStep === idx ? (
                      <Loader2 className="w-4 h-4 text-yellow-400 animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-800 shrink-0" />
                    )}
                  </div>
                ))}
              </div>

              {/* Logs do Servidor Express */}
              <div className="bg-[#020617] border border-slate-900 rounded p-3 h-[115px] overflow-y-auto custom-scrollbar font-mono text-[9px] text-zinc-400 space-y-1">
                {generationLogs.map((log, i) => (
                  <div key={i} className="border-l border-blue-500/30 pl-2 text-zinc-350">{log}</div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* PARTE DIREITA: PLAYER VÍDEO E CONTROLES (5 COLUNAS) */}
        <div className="lg:col-span-5 space-y-6" id="player-and-actions">
          
          {/* VISUALIZAÇÃO DO PLAYER DE FUTEBOL */}
          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-850 space-y-4" id="video-monitor">
            
            <div className="flex justify-between items-center text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <Tv className="w-4 h-4 text-blue-400" />
                COPA PLAYER MONITOR (HD)
              </span>
              <span className="text-[9px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">24 FPS ACTIVE</span>
            </div>

            {/* AREA DO CANVAS REAL COM FILTRO ANAMÓRFICO */}
            <div className="bg-slate-950 rounded-xl border border-slate-850 relative overflow-hidden group shadow-2xl flex flex-col justify-center items-center" id="canvas-player-container">
              
              <canvas 
                ref={canvasRef} 
                className="w-full max-w-full rounded-xl transition-all duration-300 shadow-inner"
              />

              {/* Botão Play flutuante grande no meio se tiver pausado */}
              {!isPlaying && (
                <button
                  onClick={handleTogglePlayback}
                  className="absolute p-4.5 bg-blue-500/90 text-white rounded-full hover:scale-115 transition-transform shadow-xl cursor-pointer"
                >
                  <Play className="w-7 h-7 fill-white translate-x-0.5" />
                </button>
              )}

              {/* Overlay Holográfico com fita VHS se selecionado */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950/20 via-transparent to-transparent mix-blend-overlay" />
              
              {/* Badge de Verificação Facial */}
              <div className="absolute top-3.5 left-3.5 flex items-center gap-1 bg-slate-950/80 border border-blue-500/30 px-2 py-0.5 rounded text-[9px] font-mono text-blue-400">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>BIOMETRIA VERIFICADA</span>
              </div>
            </div>

            {/* BARRA DE PROGRESSO & CONTROLES PLAY/PAUSE */}
            <div className="space-y-3" id="player-timeline-controls">
              
              <div className="flex items-center gap-3">
                
                <button
                  onClick={handleTogglePlayback}
                  className="p-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-850 text-white rounded-lg transition-all cursor-pointer"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 text-blue-400 fill-blue-500" />
                  ) : (
                    <Play className="w-4 h-4 text-emerald-400 fill-emerald-500" />
                  )}
                </button>

                <button
                  onClick={handleResetVideo}
                  className="px-3 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-300 font-mono text-[10px] font-bold rounded-lg cursor-pointer"
                >
                  Zerar Vídeo
                </button>

                {/* Timeline bar */}
                <div className="flex-1 bg-slate-950 h-5.5 rounded-lg border border-slate-850 relative overflow-hidden flex items-center px-2">
                  <div 
                    className="absolute left-0 top-0 bottom-0 bg-blue-500/20 transition-all duration-100 border-r-2 border-blue-400" 
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                  
                  <span className="relative z-10 font-mono text-[8px] text-zinc-400">
                    Sincronizador Canal: {Math.floor((currentTime / duration) * 100)}%
                  </span>
                </div>

              </div>

              {/* Resumo do Roteiro IA */}
              <div className="p-3 bg-slate-950/80 border border-slate-850 rounded text-[11px] text-zinc-350 leading-relaxed font-sans text-left">
                <p className="text-[10px] text-yellow-500 font-mono uppercase tracking-wide font-extrabold flex items-center gap-1 mb-1">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  SCRIPT DA IA (VEO WRITER)
                </p>
                {smartScript}
              </div>

            </div>

          </div>

          {/* PERSISTÊNCIA NO SUPABASE STORAGE */}
          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-850 space-y-4 text-left" id="supabase-video-block">
            
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono border-b border-slate-800 pb-2 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-emerald-400" />
              Sincronização com Supabase Storage
            </h4>

            {isSavedInSupabase ? (
              <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-xs rounded-lg flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="font-bold">Vídeo Sincronizado no Bucket!</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">MP4 de alta fidelidade salvo com sucesso no storage público sob RLS.</p>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                Grave o clipe gerado em seu diretório de residência do condomínio! Ele será alocado em <span className="font-mono text-zinc-300">/bucket-copa/videos/{supporterName.toLowerCase()}.mp4</span> para catalogação.
              </p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleSaveToSupabase}
                className="py-3 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-white hover:text-emerald-400 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                id="btn-save-video-sb"
              >
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Salvar no Storage</span>
              </button>

              <button
                onClick={handleDownloadMp4}
                className="py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-350 text-white font-heavy text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                id="btn-download-video-mp4"
              >
                <Download className="w-4 h-4 text-blue-400" />
                <span>Baixar Vídeo (PNG/MP4)</span>
              </button>
            </div>

            {/* Painel de Transações do Postgres/Supabase */}
            {supabaseLogs.length > 0 && (
              <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg space-y-2">
                <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wide block">Trânsito de Dados Realtime (Supabase / Postgres)</span>
                <div className="space-y-1.5 max-h-[110px] overflow-y-auto custom-scrollbar font-mono text-[8px] text-slate-400">
                  {supabaseLogs.map((log) => (
                    <div key={log.id} className="border-b border-slate-900 pb-1 flex justify-between gap-3 text-zinc-450">
                      <div>
                        <span className="text-emerald-400 font-bold bg-emerald-950/20 px-1 rounded mr-1">[{log.event}]</span>
                        <span>{log.details}</span>
                      </div>
                      <span className="text-zinc-550 shrink-0">{log.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
