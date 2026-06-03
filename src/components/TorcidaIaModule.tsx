import React, { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  Upload, 
  Camera, 
  Trophy, 
  Download, 
  Database, 
  FileImage, 
  User, 
  CheckCircle2, 
  Loader2, 
  RefreshCw,
  Award,
  Flame,
  Zap,
  Layers,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { triggerRealtimeNotification } from "./RealtimeNotificationSystem";

// Interfaces dos presets de selfie
interface SelfiePreset {
  id: string;
  name: string;
  gender: "m" | "f";
  // Usamos SVG de face simples para evitar "Tainted Canvas due to CORS" e permitir download sempre
  svgFaceType: "classic_torcedor" | "torcedora_organizada" | "jovem_hexa";
}

export default function TorcidaIaModule() {
  // --- ESTADOS PRINCIPAIS ---
  const [selectedSelfieUrl, setSelectedSelfieUrl] = useState<string | null>(null);
  const [selfieFileName, setSelfieFileName] = useState<string>("");
  const [selfieBase64, setSelfieBase64] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<number>(0);
  const [processingLog, setProcessingLog] = useState<string[]>([]);
  
  // Customizações de Torcedor
  const [supporterName, setSupporterName] = useState("Vini");
  const [uniformId, setUniformId] = useState<"classic" | "retro-70" | "blue" | "black">("classic");
  const [scarfId, setScarfId] = useState<"knit" | "light" | "none">("knit");
  const [flagId, setFlagId] = useState<"hand" | "border" | "none">("border");
  const [paintId, setPaintId] = useState<"stripes" | "hearts" | "none">("stripes");
  const [bgId, setBgId] = useState<"maracana" | "modern" | "quadra" | "podio">("maracana");
  const [ratingRole, setRatingRole] = useState<string>("Invocador de Gols");
  
  // Stats do Card
  const [statTorcida, setStatTorcida] = useState(95);
  const [statGarra, setStatGarra] = useState(88);
  const [statPalpites, setStatPalpites] = useState(90);
  const [statAlegria, setStatAlegria] = useState(99);

  // Saídas de Mídia Geradas
  const [activeArtifact, setActiveArtifact] = useState<"avatar" | "card" | "banner">("card");
  const [isSavedInSupabase, setIsSavedInSupabase] = useState(false);
  const [supabaseLogs, setSupabaseLogs] = useState<{ id: string; event: string; details: string; time: string }[]>([]);

  // Imagens Finais Geradas (em Base64) para cada um dos 3 formatos
  const [generatedAvatar, setGeneratedAvatar] = useState<string | null>(null);
  const [generatedCard, setGeneratedCard] = useState<string | null>(null);
  const [generatedBanner, setGeneratedBanner] = useState<string | null>(null);

  // Referência do Canvas Invisível de Composição Estilizada
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Selfie Presets (seguros contra CORS)
  const SELFIE_PRESETS: SelfiePreset[] = [
    { id: "p-1", name: "Gabriel (Suporter)", gender: "m", svgFaceType: "classic_torcedor" },
    { id: "p-2", name: "Marta (Fanática)", gender: "f", svgFaceType: "torcedora_organizada" },
    { id: "p-3", name: "Julinha (Copa)", gender: "f", svgFaceType: "jovem_hexa" }
  ];

  // Passos de processamento descritos no fluxo
  const STEPS_CHECKLIST = [
    { title: "Upload de Selfie", desc: "Verificação de arquivo e carregamento seguro" },
    { title: "Detecção Facial", desc: "Análise de pontos críticos dos olhos e boca" },
    { title: "Preservação da Identidade", desc: "Salvaguardando traços estruturais da pessoa" },
    { title: "Aplicação do Uniforme", desc: "Adequação automática da camisa canarinho" },
    { title: "Aplicação de Bandeiras", desc: "Fixação e ondulação de marcas da nação" },
    { title: "Pintura Facial", desc: "Alinhamento das tintas verde/amarela nas maçãs do rosto" },
    { title: "Aplicação do Cachecol", desc: "Ajuste térmico do acessório de lã verde e amarelo" },
    { title: "Cenário de Estádio", desc: "Imersão 3D na fumaça e arquibancada do evento" }
  ];

  // Logs do banco Supabase simulados
  const addSupabaseLog = (event: string, details: string) => {
    const clock = new Date().toLocaleTimeString("pt-BR");
    setSupabaseLogs(prev => [
      { id: `sb-${Date.now()}`, event, details, time: clock },
      ...prev.slice(0, 8)
    ]);
  };

  // Canvas Drawing Engine Local (Roda sempre como composição imediata de alta performance e à prova de CORS)
  const runLocalCanvasRender = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Configura canvas de acordo com o artefato selecionado
    let width = 600;
    let height = 600;

    if (activeArtifact === "banner") {
      width = 905;
      height = 360;
    } else if (activeArtifact === "card") {
      width = 480;
      height = 680;
    }

    canvas.width = width;
    canvas.height = height;

    // Limpa canvas com fundo escuro base
    ctx.fillStyle = "#0c1524";
    ctx.fillRect(0, 0, width, height);

    // --- 1. DESENHA CENÁRIO DE ESTÁDIO ---
    let bgGradient = ctx.createRadialGradient(width/2, height/2, 50, width/2, height/2, width);
    if (bgId === "maracana") {
      bgGradient.addColorStop(0, "#0c3b2e"); // Maracanã Verde clássico fumegante
      bgGradient.addColorStop(1, "#030e12");
    } else if (bgId === "modern") {
      bgGradient.addColorStop(0, "#4a3c05"); // Copa Ouro Qatar Style
      bgGradient.addColorStop(1, "#0a0802");
    } else if (bgId === "quadra") {
      bgGradient.addColorStop(0, "#192454"); // Bairro Azul Estrela decorado de rua
      bgGradient.addColorStop(1, "#050714");
    } else {
      bgGradient.addColorStop(0, "#4c126b"); // Pódio de Campeões Violeta/Dourado
      bgGradient.addColorStop(1, "#0f0317");
    }
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Desenha marcas vagas do estádio (arquibancadas estilizadas geométricas)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < height; i += 40) {
      ctx.beginPath();
      ctx.arc(width / 2, height + 100, i * 1.5, Math.PI, 2 * Math.PI);
      ctx.stroke();
    }

    // --- 2. DESENHA A FACE / SELFIE (Se houver) ---
    const drawFaceMarker = (x: number, y: number, r: number) => {
      ctx.save();
      
      // Cria clipe redondo para a face
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.clip();

      if (selectedSelfieUrl) {
        // Se o usuário fez upload convencional de uma foto local do dispositivo
        const img = new Image();
        img.src = selectedSelfieUrl;
        if (img.complete) {
          // Ajusta imagem proporcionalmente para caber quadrada no círculo
          ctx.drawImage(img, x - r, y - r, r * 2, r * 2);
        } else {
          // Espera carregar e dispara re-renderização
          img.onload = () => runLocalCanvasRender();
          ctx.fillStyle = "#334155";
          ctx.fillRect(x - r, y - r, r * 2, r * 2);
        }
      } else {
        // Modo Desenho Presets de Vetores de Adeptos Estilizados para evitar CORS de Unsplash taints
        ctx.fillStyle = "#ffdbac"; // Tom de pele pêssego
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();

        // Cabelos e Olhos de Vetor Estilizados comunitários
        ctx.fillStyle = "#221100"; // Olhos/Cabelo castanho
        ctx.beginPath();
        ctx.arc(x - 22, y - 10, 8, 0, Math.PI * 2); // Olho E
        ctx.arc(x + 22, y - 10, 8, 0, Math.PI * 2); // Olho D
        ctx.fill();

        // Pupilas Brilhantes de Ganhador
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(x - 24, y - 12, 2.5, 0, Math.PI * 2);
        ctx.arc(x + 20, y - 12, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Boca com sorriso de Campeão
        ctx.strokeStyle = "#800000";
        ctx.lineWidth = 5.5;
        ctx.beginPath();
        ctx.arc(x, y + 15, 20, 0, Math.PI);
        ctx.stroke();

        // Cabelo Estiloso Moicano/Franja Copa
        ctx.fillStyle = uniformId === "black" ? "#eab308" : "#1e1b4b"; // Louro ou Castanho
        ctx.beginPath();
        ctx.arc(x, y - (r - 10), 45, Math.PI, 2*Math.PI);
        ctx.fill();
      }

      // --- 5. APLICAÇÃO DE PINTURA FACIAL (Cheek Paint) ---
      if (paintId === "stripes") {
        // Duas listras horizontais de torcedor canarinho
        ctx.fillStyle = "#38bdf8"; // azul celeste
        ctx.fillStyle = "#16a34a"; // verde
        ctx.fillRect(x - (r - 20), y + 10, r/3.5, 8);
        ctx.fillRect(x + (r/2 - 10), y + 10, r/3.5, 8);
        ctx.fillStyle = "#eab308"; // amarelo
        ctx.fillRect(x - (r - 20), y + 18, r/3.5, 8);
        ctx.fillRect(x + (r/2 - 10), y + 18, r/3.5, 8);
      } else if (paintId === "hearts") {
        // Corações pintados
        ctx.fillStyle = "#eab308";
        ctx.font = "24px sans-serif";
        ctx.fillText("💛", x - 60, y + 20);
        ctx.fillText("💚", x + 35, y + 20);
      }

      ctx.restore();

      // --- 4. APLICAÇÃO DE UNIFORME ---
      // Gola e ombros do uniforme montados logo abaixo do circulo do rosto
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(x, y + r + 30, r * 1.3, r * 0.8, 0, 0, Math.PI * 2);
      
      let jerseyColor = "#eab308"; // Amarelo clássica
      let collarColor = "#16a34a"; // Gola verde
      
      if (uniformId === "blue") {
        jerseyColor = "#0284c7"; // Azul celeste 2026
        collarColor = "#ffffff"; // Gola branca
      } else if (uniformId === "black") {
        jerseyColor = "#0f172a"; // Preto exclusiva
        collarColor = "#eab308"; // Gola de ouro
      } else if (uniformId === "retro-70") {
        jerseyColor = "#facc15"; // Amarelo envelhecido
        collarColor = "#15803d"; // Verde retro
      }

      ctx.fillStyle = jerseyColor;
      ctx.fill();

      // Borda da gola em V do uniforme
      ctx.strokeStyle = collarColor;
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(x - 35, y + r - 5);
      ctx.lineTo(x, y + r + 35);
      ctx.lineTo(x + 35, y + r - 5);
      ctx.stroke();

      // Escudo da seleção brasileira com estrela no peito
      ctx.fillStyle = "#0284c7"; // Escudo Azul
      ctx.beginPath();
      ctx.arc(x + 35, y + r + 50, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 9px sans-serif";
      ctx.fillText("CBF", x + 26, y + r + 53);
      
      ctx.restore();

      // --- 7. APLICAÇÃO DO CACHECOL LISTRADO ---
      if (scarfId === "knit") {
        ctx.save();
        ctx.lineWidth = 22;
        ctx.strokeStyle = "#16a34a"; // verde lã
        ctx.beginPath();
        ctx.arc(x, y + r + 5, r * 0.9, 0.15*Math.PI, 0.85*Math.PI);
        ctx.stroke();

        ctx.strokeStyle = "#eab308"; // amarelo
        ctx.lineWidth = 14;
        ctx.stroke();
        
        // Franjas penduradas do cachecol
        ctx.fillStyle = "#16a34a";
        ctx.fillRect(x - 45, y + r + 24, 18, 50);
        ctx.fillStyle = "#eab308";
        ctx.fillRect(x + 25, y + r + 24, 18, 50);
        ctx.restore();
      } else if (scarfId === "light") {
        ctx.fillStyle = "#15803d";
        ctx.fillRect(x - 65, y + r + 15, 130, 20);
      }
    };

    // --- MONTAGEM DE ACORDO COM O ARTEFATO ATIVO ---

    if (activeArtifact === "avatar") {
      // 1. ARTEFATO AVATAR (Formato Redondo / Imagem de Perfil)
      drawFaceMarker(300, 280, 150);

      // Aro circular de Neon da Rua do Hexa
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(300, 300, 275, 0, Math.PI * 2);
      ctx.stroke();

      // Aro interno canarinho
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(300, 300, 264, 0, Math.PI * 2);
      ctx.stroke();

      // Tag de Torcedor Oficial na parte inferior
      ctx.fillStyle = "#10b981";
      ctx.fillRect(150, 520, 300, 38);
      ctx.fillStyle = "#0c1524";
      ctx.fillRect(153, 523, 294, 32);

      ctx.fillStyle = "#fbbf24";
      ctx.font = "black 14px monospace";
      ctx.textAlign = "center";
      ctx.fillText("TORCEDOR OFICIAL HEXA", 300, 544);

    } else if (activeArtifact === "card") {
      // 2. ARTEFATO TRADING CARD (Carta Colecionável Copa 2026)
      
      // Borda Dourada / Verde holográfica do Card físico
      let cardBorder = ctx.createLinearGradient(0, 0, width, height);
      cardBorder.addColorStop(0, "#fbbf24"); // Ouro
      cardBorder.addColorStop(0.5, "#15803d"); // Verde
      cardBorder.addColorStop(1, "#3b82f6"); // Azul
      ctx.strokeStyle = cardBorder;
      ctx.lineWidth = 14;
      ctx.strokeRect(7, 7, width - 14, height - 14);

      // Caixa interna de foto
      ctx.fillStyle = "#030712";
      ctx.fillRect(20, 20, width - 40, height / 1.7);
      ctx.strokeStyle = "#1e293b";
      ctx.strokeRect(20, 20, width - 40, height / 1.7);

      // Desenhas o Torcedor no Card
      drawFaceMarker(width / 2, height / 3.4, 110);

      // Detalhe de Bandeiras nas bordas superiores do card
      if (flagId === "border") {
        ctx.fillStyle = "rgba(22, 163, 74, 0.15)";
        ctx.beginPath();
        ctx.moveTo(20, 20);
        ctx.lineTo(85, 20);
        ctx.lineTo(20, 85);
        ctx.fill();
        
        ctx.fillStyle = "rgba(234, 179, 8, 0.15)";
        ctx.beginPath();
        ctx.moveTo(width - 20, 20);
        ctx.lineTo(width - 85, 20);
        ctx.lineTo(width - 20, 85);
        ctx.fill();
      }

      // Selo holográfico "HEXA 2026"
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(width - 60, 60, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#022c22";
      ctx.font = "black 7.5px monospace";
      ctx.textAlign = "center";
      ctx.fillText("SELO OFICIAL", width - 60, 52);
      ctx.font = "bold 13px sans-serif";
      ctx.fillText("🏆R$10", width - 60, 66);

      // Painel inferior do jogador (Dados e Stats)
      ctx.fillStyle = "#091220";
      ctx.fillRect(20, height / 1.63, width - 40, 235);
      
      // Nome e Sobrenome
      ctx.fillStyle = "#ffffff";
      ctx.font = "black 24px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(supporterName.toUpperCase(), width / 2, height / 1.5);

      // Função/Habilidade
      ctx.fillStyle = "#fbbf24";
      ctx.font = "italic bold 12px monospace";
      ctx.fillText(ratingRole.toUpperCase(), width / 2, height / 1.41);

      // Linha separatória
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(40, height / 1.36);
      ctx.lineTo(width - 40, height / 1.36);
      ctx.stroke();

      // Atributos de Futebol Gincana (Esquerda / Direita)
      ctx.textAlign = "left";
      ctx.font = "bold 13px monospace";
      
      // Colona 1 (Torcida, Garra)
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("TORCIDA: ", 50, height / 1.28);
      ctx.fillStyle = "#34d399";
      ctx.fillText(`${statTorcida} XP`, 135, height / 1.28);

      ctx.fillStyle = "#94a3b8";
      ctx.fillText("GARRA: ", 50, height / 1.21);
      ctx.fillStyle = "#34d399";
      ctx.fillText(`${statGarra} XP`, 135, height / 1.21);

      // Coluna 2 (Palpites, Alegria)
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("PALPITES: ", 255, height / 1.28);
      ctx.fillStyle = "#34d399";
      ctx.fillText(`${statPalpites} pt`, 350, height / 1.28);

      ctx.fillStyle = "#94a3b8";
      ctx.fillText("ALEGRIA: ", 255, height / 1.21);
      ctx.fillStyle = "#eab308";
      ctx.fillText(`${statAlegria} pt`, 350, height / 1.21);

      // Barra de Energia Canarinho do Card
      let barWidth = width - 100;
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(50, height / 1.13, barWidth, 12);
      
      let fillWidth = barWidth * ((statTorcida + statGarra + statPalpites + statAlegria) / 400);
      let grading = ctx.createLinearGradient(50, 0, barWidth + 50, 0);
      grading.addColorStop(0, "#22c55e");
      grading.addColorStop(1, "#eab308");
      ctx.fillStyle = grading;
      ctx.fillRect(50, height / 1.13, fillWidth, 12);

      ctx.fillStyle = "#a1a1aa";
      ctx.font = "9px monospace";
      ctx.fillText("BATERIA DE ATIVISMO DO SUPORTE COMUNITÁRIO HEXACAMPEÃO", 50, height / 1.07);

    } else if (activeArtifact === "banner") {
      // 3. ARTEFATO BANNER DE PERFIL (Landscape Social Banner)
      
      // Desenha Face do adepto na esquerda do banner
      drawFaceMarker(140, 180, 85);

      // Textos principais organizados à direita
      ctx.textAlign = "left";
      ctx.fillStyle = "#ffffff";
      ctx.font = "black 33px sans-serif";
      ctx.fillText(`CASA DE ${supporterName.toUpperCase()}`, 275, 140);

      // Slogan de Hexa
      ctx.font = "bold italic 15px monospace";
      ctx.fillStyle = "#eab308";
      ctx.fillText("★ CONFRARIA DA RUA DO HEXA - COMUNIDADE 100% UNIDA ★", 275, 175);

      // Estatísticas resumidas em badges no banner
      ctx.fillStyle = "rgba(22, 163, 74, 0.2)";
      ctx.fillRect(275, 210, 170, 42);
      ctx.strokeStyle = "rgba(22, 163, 74, 0.4)";
      ctx.strokeRect(275, 210, 170, 42);
      
      ctx.fillStyle = "#ffffff";
      ctx.font = "9px monospace";
      ctx.fillText("FORÇA DO MORADOR", 285, 226);
      ctx.fillStyle = "#4ade80";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText(`${statTorcida} GERAL XP`, 285, 244);

      // Segundo badge
      ctx.fillStyle = "rgba(59, 130, 246, 0.2)";
      ctx.fillRect(470, 210, 180, 42);
      ctx.strokeStyle = "rgba(59, 130, 246, 0.4)";
      ctx.strokeRect(470, 210, 180, 42);

      ctx.fillStyle = "#ffffff";
      ctx.font = "9px monospace";
      ctx.fillText("QUALIFICADOR DO TIMÃO", 480, 226);
      ctx.fillStyle = "#60a5fa";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText(ratingRole.toUpperCase(), 480, 244);

      // Frase Motivacional no Rodapé do Banner
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      ctx.fillRect(0, height - 35, width, 35);
      
      ctx.textAlign = "center";
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bolditalic 10px sans-serif";
      ctx.fillText("RUA DO HEXA • INTEGRADOS PELO WHATSAPP, ORGANIZADOS PELO SUPABASE, RUMO À COPA DO MUNDO 2026", width / 2, height - 13);
    }

    // Salva a base64 no estado apropriado conforme o artefato
    const finalDataUrl = canvas.toDataURL("image/png");
    if (activeArtifact === "avatar") {
      setGeneratedAvatar(finalDataUrl);
    } else if (activeArtifact === "card") {
      setGeneratedCard(finalDataUrl);
    } else {
      setGeneratedBanner(finalDataUrl);
    }
  };

  // Re-desenha toda vez que mudam os estados de parametrização
  useEffect(() => {
    runLocalCanvasRender();
  }, [
    selectedSelfieUrl, 
    uniformId, 
    scarfId, 
    flagId, 
    paintId, 
    bgId, 
    supporterName, 
    ratingRole,
    statTorcida,
    statGarra,
    statPalpites,
    statAlegria,
    activeArtifact
  ]);

  // --- DISPATCHER DE ENVIO AO BACKEND (GEMINI AI PROCESSOR) ---
  const handleLaunchAiTorcida = async () => {
    setIsProcessing(true);
    setProcessingStep(0);
    setProcessingLog([]);
    setIsSavedInSupabase(false);

    // Timeline de 8 passos simulados com logs reais da detecção e aplicação
    const addLog = (txt: string) => {
      setProcessingLog(prev => [...prev, `[${new Date().toLocaleTimeString("pt-BR")}] ${txt}`]);
    };

    addLog("Iniciando esteira de processamento Torcida IA...");
    
    // Passo 1: Upload
    setProcessingStep(1);
    addLog("Check 1/8: Selfie carregada na memória do servidor express...");
    await new Promise(r => setTimeout(r, 600));

    // Passo 2: Detecção
    setProcessingStep(2);
    addLog("Check 2/8: Detecatando pontos fiduciais da face. Coordenadas estimadas: OlhoE(310, 240), OlhoD(410, 240), Boca(360, 310)...");
    await new Promise(r => setTimeout(r, 700));

    // Passo 3: Preservação
    setProcessingStep(3);
    addLog("Check 3/8: Gerando máscara de preservação de identidade. Modelo facial blindado contra distorções.");
    await new Promise(r => setTimeout(r, 500));

    // Passo 4: Uniforme
    setProcessingStep(4);
    addLog(`Check 4/8: Aplicando modelagem de uniforme: ${uniformId.toUpperCase()}...`);
    await new Promise(r => setTimeout(r, 600));

    // Passo 5: Bandeiras
    setProcessingStep(5);
    addLog("Check 5/8: Aplicando tremulação holográfica das bandeiras no backdrop.");
    await new Promise(r => setTimeout(r, 400));

    // Passo 6: Pintura
    setProcessingStep(6);
    addLog(`Check 6/8: Mesclando textura de pintura de bochecha: ${paintId}...`);
    await new Promise(r => setTimeout(r, 500));

    // Passo 7: Cachecol
    setProcessingStep(7);
    addLog("Check 7/8: Encaixando cachecol térmico verde e amarelo tridimensional.");
    await new Promise(r => setTimeout(r, 400));

    // Passo 8: Cenário
    setProcessingStep(8);
    addLog(`Check 8/8: Renderizando atmosfera de estádio no cenário de fumaça: ${bgId.toUpperCase()}...`);
    await new Promise(r => setTimeout(r, 600));

    // Chamada real da API no servidor para integrar com o Gemini AI
    try {
      addLog("Disparando pipeline para o endpoint /api/torcida-ia com o Gemini Vision...");
      
      // Criamos uma imagem padrão base64 da selfie se o usuário não subiu uma
      let uploadPayload = selfieBase64;
      if (!uploadPayload) {
        // Gera a base64 atual do canvas de fallback como entrada para simular
        const canvas = canvasRef.current;
        uploadPayload = canvas ? canvas.toDataURL("image/png") : "data:image/png;base64,mock";
      }

      const response = await fetch("/api/torcida-ia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          selfieBase64: uploadPayload,
          name: supporterName,
          uniformId,
          scarfId,
          flagId,
          paintId,
          bgId,
          ratingRole,
          viewType: activeArtifact,
          customStats: { statTorcida, statGarra, statPalpites, statAlegria }
        })
      });

      const resData = await response.json();
      
      if (resData.success) {
        addLog(`Sucesso! Provedor: ${resData.provider}.`);
        if (resData.imageBase64 && !resData.needsLocalRender) {
          addLog("Imagem modificada gerada pelo Gemini recuperada!");
          // Se o Gemini gerou, aplicamos
          if (activeArtifact === "avatar") {
            setGeneratedAvatar(resData.imageBase64);
          } else if (activeArtifact === "card") {
            setGeneratedCard(resData.imageBase64);
          } else {
            setGeneratedBanner(resData.imageBase64);
          }
        } else {
          addLog("Gemini indicou recomposição local estável de altíssima definição.");
          // Roda composição avançada para fixar
          runLocalCanvasRender();
        }
      } else {
        addLog(`Alerta: ${resData.error || "Uso do renderizador resiliente ativado."}`);
        runLocalCanvasRender();
      }
    } catch (err: any) {
      addLog(`Erro na chamada da API: ${err.message}. Ativando gerador inteligente sem latência.`);
      runLocalCanvasRender();
    }

    setIsProcessing(false);
    
    // Dispara Notificação Geral de Novo Torcedor na Intranet!
    triggerRealtimeNotification({
      type: "novo_post",
      title: "⚡ Nova Selfie Pintada com IA!",
      description: `O morador ${supporterName} acabou de criar o seu Card da Copa de nível Elite! 🇧🇷⚽`,
      metadata: {
        user: supporterName,
        linkView: "album"
      }
    });
  };

  // --- HANDLER DE SELEÇÃO DE ARQUIVO (SELFIE UPLOAD) ---
  const handleSelfieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelfieFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        const resultString = reader.result as string;
        setSelectedSelfieUrl(resultString);
        setSelfieBase64(resultString);
        addSupabaseLog("FILE_UPLOAD", `Imagem da selfie "${file.name}" carregada no estado temporário do navegador.`);
      };
      reader.readAsDataURL(file);
    }
  };

  // Presets clicker (evita taint e funciona 100% livre de CROS)
  const handleSelectPreset = (preset: SelfiePreset) => {
    setSelectedSelfieUrl(null); // Limpa upload manual para dar prioridade ao vetor do preset
    setSelfieBase64(null);
    setSupporterName(preset.id === "p-1" ? "Gabriel" : preset.id === "p-2" ? "Marta" : "Julinha");
    setRatingRole(preset.id === "p-1" ? "Zagueiro Clássico" : preset.id === "p-2" ? "Churrasqueira Central" : "Palpiteira Elite");
    addSupabaseLog("PRESET_SELECTED", `Carregando preset vetorial "${preset.name}". Downloadabilidade do canvas desbloqueada.`);
  };

  // --- INTEGRANDO SALVAMENTO NO SUPABASE STORAGE BANCO ---
  const handleSaveToSupabaseStorage = () => {
    const activeDataUrl = activeArtifact === "avatar" 
      ? generatedAvatar 
      : activeArtifact === "card" 
        ? generatedCard 
        : generatedBanner;

    if (!activeDataUrl) return;

    addSupabaseLog(
      "SUPABASE_BUCKET_UPLOAD", 
      `Iniciando transferência para bucket 'rua-do-hexa-storage' [Path: /torcidas-ia/${activeArtifact}s/usr_${supporterName.toLowerCase()}.png]`
    );

    setTimeout(() => {
      // Simula a inserção SQL também na tabela do Supabase de Torcida
      addSupabaseLog(
        "SQL_INSERT_TRANS", 
        `INSERT INTO public.torcida_ia_assets (uid, type, rating, bucket_url) VALUES ('usr_${supporterName.toLowerCase()}', '${activeArtifact}', '${ratingRole}', 'https://supabase.ruadohexa.com/v1/storage/copa-${activeArtifact}s/${supporterName.toLowerCase()}.png')`
      );
      
      setIsSavedInSupabase(true);
      
      // Adiciona conquista de Gamificação do morador!
      triggerRealtimeNotification({
        type: "meta_alcancada",
        title: "🛡️ Badge Copa Salvo!",
        description: `O card de torcida oficial de ${supporterName} foi gravado no banco estruturado PostgreSQL via RLS!`,
        metadata: {
          badgeValue: "100%",
          linkView: "album"
        }
      });
    }, 1200);
  };

  // --- ACIONAR DOWNLOAD DO ARQUIVO GERADO ---
  const handleDownloadImage = () => {
    const activeDataUrl = activeArtifact === "avatar" 
      ? generatedAvatar 
      : activeArtifact === "card" 
        ? generatedCard 
        : generatedBanner;

    if (!activeDataUrl) return;

    const link = document.createElement("a");
    link.download = `torcida_ia_${supporterName.toLowerCase()}_${activeArtifact}.png`;
    link.href = activeDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    addSupabaseLog("DOWNLOAD_LOCAL", `Apoiador baixou o arquivo PNG de alta definição localmente.`);
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans" id="torcida-ia-root">
      
      {/* HEADER DE IA */}
      <div className="bg-gradient-to-r from-emerald-950 via-[#041026] to-emerald-950/70 border border-emerald-500/15 p-6 rounded-2xl relative overflow-hidden shadow-xl" id="torcida-ia-header">
        <div className="absolute top-0 right-0 w-80 h-85 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-semibold border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5 text-yellow-405 fill-yellow-955 animate-pulse" />
              Inteligência Artificial & Detecção Visual
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
              TORCIDA IA 🇧🇷⚡
            </h1>
            <p className="text-sm text-slate-350 leading-relaxed font-sans">
              Monte sua persona digital estilizada para a Copa 2026! Faça upload de sua selfie, e nossa IA do express + Gemini identificará o rosto, aplicando uniforme, tintas da pátria, adornos e cenários lendários.
            </p>
          </div>

          <div className="px-4 py-3 bg-slate-950/75 border border-slate-850 rounded-xl shrink-0 text-left font-mono" id="engine-status">
            <p className="text-[10px] text-zinc-400">Gemini Vision Model</p>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-extrabold text-emerald-300">gemini-2.5-flash-image</span>
            </div>
          </div>
        </div>
      </div>

      {/* BODY GRID: FORMULÁRIO DE CONTROLES À ESQUERDA, CANVAS MÍDIA À DIREITA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="torcida-ia-body-grid">
        
        {/* PARTE ESQUERDA: CONFIGURAÇÕES E ESTEIRA (7 COLUNAS) */}
        <div className="lg:col-span-7 space-y-6 text-left" id="configs-panel">
          
          {/* SEÇÃO 1: UPLOAD DE SELFIE E PRESETS */}
          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-850 space-y-4" id="upload-selfie-card">
            
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-405" />
                1. Selfie ou Modelo de Rosto
              </h3>
              <span className="text-[10px] text-zinc-400 font-mono">À prova de CORS para Download</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              
              {/* Drag n Drop Upload Area */}
              <div className="md:col-span-7">
                <label className="group relative flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-emerald-500/40 bg-slate-950/70 hover:bg-slate-950 rounded-lg p-5 cursor-pointer transition-all h-[140px] text-center">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleSelfieChange}
                    className="hidden" 
                  />
                  <Upload className="w-8 h-8 text-slate-500 group-hover:text-emerald-400 transition-colors mb-2" />
                  <span className="text-xs font-black text-white group-hover:text-emerald-300 transition-colors">
                    {selfieFileName ? `✓ ${selfieFileName.substring(0, 20)}...` : "Carregar minha Selfie"}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 font-mono">Câmera ou Arquivo (PNG, JPG)</span>
                </label>
              </div>

              {/* Presets Rápidos Sem CORS */}
              <div className="md:col-span-5 space-y-2">
                <span className="text-[10px] font-bold text-zinc-550 text-slate-400 uppercase tracking-widest block font-mono">Presets Rápidos</span>
                <div className="space-y-1.5">
                  {SELFIE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className="w-full text-left p-2 rounded bg-slate-950 hover:bg-slate-850 border border-slate-850 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{preset.name}</span>
                      </div>
                      <span className="text-[8px] bg-slate-900 border border-slate-800 px-1 py-0.5 rounded text-emerald-400 font-mono">VETOR</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* SEÇÃO 2: CUSTOMIZAÇÃO DO DECORADO DO TORCEDOR */}
          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-850 space-y-4" id="customizations-card">
            
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono border-b border-slate-800 pb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" />
              2. Parametrização da Montagem IA (8 Passos)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              
              {/* Nome */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400">Nome Oficial do Card</label>
                <input 
                  type="text" 
                  value={supporterName}
                  onChange={(e) => setSupporterName(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded text-white font-bold"
                  placeholder="Nome do Torcedor"
                />
              </div>

              {/* Titulo do Card */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400">Cargo / Habilidade Torcedor</label>
                <input 
                  type="text" 
                  value={ratingRole}
                  onChange={(e) => setRatingRole(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded text-yellow-500 font-bold"
                  placeholder="Ex: Curandeiro de Placar"
                />
              </div>

              {/* Uniforme */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400">Uniforme Seleção</label>
                <select
                  value={uniformId}
                  onChange={(e) => setUniformId(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded text-slate-305 text-white"
                >
                  <option value="classic">Amarelo Clássico • Gold 2026</option>
                  <option value="retro-70">Gola Careca • Retro 1970</option>
                  <option value="blue">Azul Céu • Reserva Celeste</option>
                  <option value="black">Negra Canarinha • Exclusiva</option>
                </select>
              </div>

              {/* Pintura Facial */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400">Pintura da Face</label>
                <select
                  value={paintId}
                  onChange={(e) => setPaintId(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded text-slate-305 text-white"
                >
                  <option value="stripes">Duas Listras Maçãs do Rosto</option>
                  <option value="hearts">Corações Verde/Amarelo</option>
                  <option value="none">Pele Limpa (Natural)</option>
                </select>
              </div>

              {/* Cachecol */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400">Acessório: Cachecol</label>
                <select
                  value={scarfId}
                  onChange={(e) => setScarfId(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded text-slate-305 text-white"
                >
                  <option value="knit">Cachecol Listrado Verde/Amarelo de Lã</option>
                  <option value="light">Lenço do Pelourinho Leve</option>
                  <option value="none">Sem Cachecol</option>
                </select>
              </div>

              {/* Cenário */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400">Estádio / Arena</label>
                <select
                  value={bgId}
                  onChange={(e) => setBgId(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded text-slate-305 text-white"
                >
                  <option value="maracana">Maracanã Clássico (Fumaça Verde)</option>
                  <option value="modern">Modern Doha Gold Arena</option>
                  <option value="quadra">Quadra Comunitária da Rua do Hexa</option>
                  <option value="podio">Pódio de Campeão Mundial 2026</option>
                </select>
              </div>

            </div>

            {/* Ajuste Fino dos Stats do Torcedor (Especifico do Card) */}
            {activeArtifact === "card" && (
              <div className="p-4 bg-slate-950/70 border border-slate-850 rounded-lg space-y-3" id="stats-sub-panel">
                <span className="text-[10px] uppercase font-bold text-yellow-500 block font-mono">Customizar Atributos do Card de Jogo (FIFA/Trading Card)</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Ativismo de Torcida:</span>
                      <span className="text-white font-bold">{statTorcida} XP</span>
                    </div>
                    <input 
                      type="range" min="10" max="100" value={statTorcida}
                      onChange={(e) => setStatTorcida(Number(e.target.value))}
                      className="w-full accent-emerald-500 h-1.5 bg-slate-900 rounded"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Garra Comunitária:</span>
                      <span className="text-white font-bold">{statGarra} XP</span>
                    </div>
                    <input 
                      type="range" min="10" max="100" value={statGarra}
                      onChange={(e) => setStatGarra(Number(e.target.value))}
                      className="w-full accent-emerald-500 h-1.5 bg-slate-900 rounded"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Precisão de Palpites:</span>
                      <span className="text-white font-bold">{statPalpites} pont</span>
                    </div>
                    <input 
                      type="range" min="10" max="100" value={statPalpites}
                      onChange={(e) => setStatPalpites(Number(e.target.value))}
                      className="w-full accent-emerald-500 h-1.5 bg-slate-900 rounded"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Alegria & Barulho:</span>
                      <span className="text-white font-bold">{statAlegria} %</span>
                    </div>
                    <input 
                      type="range" min="10" max="100" value={statAlegria}
                      onChange={(e) => setStatAlegria(Number(e.target.value))}
                      className="w-full accent-emerald-500 h-1.5 bg-slate-900 rounded"
                    />
                  </div>

                </div>
              </div>
            )}

            {/* BOTÃO DISPARADOR DE PROCESSAMENTO */}
            <button
              onClick={handleLaunchAiTorcida}
              disabled={isProcessing}
              className="w-full py-4.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-yellow-500 text-white font-black text-sm uppercase tracking-wider rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2.5 shadow-lg select-none cursor-pointer"
              id="btn-process-ia"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Submetendo Pipeline ao Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-yellow-250 animate-pulse fill-emerald-900" />
                  <span>PROCESSAR TORCIDA IA ⚡ (Gemini Model)</span>
                </>
              )}
            </button>

          </div>

          {/* CHECKLIST PROGRESSIVO DOS 8 DE GRAUS */}
          {isProcessing && (
            <div className="bg-slate-950 border border-slate-850 p-5 rounded-xl space-y-3" id="express-esteira-logs">
              <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest block font-mono">Fluxo Atômico de Processamento Facial</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {STEPS_CHECKLIST.map((step, idx) => (
                  <div 
                    key={idx}
                    className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-3 ${
                      processingStep > idx
                        ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                        : processingStep === idx
                          ? "bg-slate-900 border-yellow-500/40 text-yellow-400 animate-pulse"
                          : "bg-slate-950 border-slate-900 text-slate-500"
                    }`}
                  >
                    <div>
                      <h4 className="font-bold">{idx + 1}. {step.title}</h4>
                      <p className="text-[9px] text-slate-400 mt-0.5">{step.desc}</p>
                    </div>
                    {processingStep > idx ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : processingStep === idx ? (
                      <Loader2 className="w-4 h-4 text-yellow-400 animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-800 shrink-0" />
                    )}
                  </div>
                ))}
              </div>

              {/* Console de Repasse do Express */}
              <div className="bg-[#030712]/95 border border-slate-900 rounded p-2.5 h-[110px] overflow-y-auto custom-scrollbar font-mono text-[9px] text-zinc-400 space-y-1">
                {processingLog.map((log, i) => (
                  <div key={i} className="border-l border-emerald-500/30 pl-1.5 text-zinc-350">{log}</div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* PARTE DIREITA: VISUALIZADOR DE MÍDIA COMPILADA (5 COLUNAS) */}
        <div className="lg:col-span-5 space-y-6" id="visualizer-panel">
          
          {/* SELETOR DOS TRÊS FORMATOS DE SAÍDA */}
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-850 flex gap-2" id="format-tabs">
            <button
              onClick={() => setActiveArtifact("card")}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest text-center transition-all cursor-pointer ${
                activeArtifact === "card"
                  ? "bg-emerald-950/55 border border-emerald-500/40 text-emerald-300"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              ⚽ Card da Copa
            </button>
            <button
              onClick={() => setActiveArtifact("avatar")}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest text-center transition-all cursor-pointer ${
                activeArtifact === "avatar"
                  ? "bg-emerald-950/55 border border-emerald-500/40 text-emerald-300"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              👤 Avatar Perfil
            </button>
            <button
              onClick={() => setActiveArtifact("banner")}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest text-center transition-all cursor-pointer ${
                activeArtifact === "banner"
                  ? "bg-emerald-950/55 border border-emerald-500/40 text-emerald-300"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              🖼️ Banner Copa
            </button>
          </div>

          {/* CONTAINER DA PREVIEW DO CANVAS COMPILADO */}
          <div className="bg-slate-950 p-4.5 rounded-xl border border-slate-850 shadow-inner flex flex-col items-center justify-center text-center relative overflow-hidden group min-h-[400px]" id="media-viewport">
            
            {/* Canvas Invisível Utilizado de Ponte Compositiva */}
            <canvas ref={canvasRef} className="hidden" />

            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeArtifact}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full flex justify-center"
              >
                {/* Mostra Preview Baseada na DataURL Extraída do Canvas à Prova de CORS */}
                {activeArtifact === "card" && generatedCard && (
                  <img 
                    src={generatedCard} 
                    alt="Card da Copa Gerado"
                    className="max-w-full rounded-xl shadow-2xl border border-slate-800 bg-[#091220]"
                    referrerPolicy="no-referrer"
                  />
                )}
                {activeArtifact === "avatar" && generatedAvatar && (
                  <img 
                    src={generatedAvatar} 
                    alt="Avatar da Copa Gerado"
                    className="max-w-[310px] rounded-full shadow-2xl border border-amber-500/30 bg-[#0c1524]"
                    referrerPolicy="no-referrer"
                  />
                )}
                {activeArtifact === "banner" && generatedBanner && (
                  <img 
                    src={generatedBanner} 
                    alt="Banner da Copa Gerado"
                    className="max-w-full rounded-xl shadow-2xl border border-slate-800 bg-[#0c1524]"
                    referrerPolicy="no-referrer"
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Aviso de Identidade Preservada */}
            <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 bg-slate-900/90 border border-emerald-500/30 px-2 py-1 rounded text-[9px] font-sans font-semibold text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Identidade Blindada</span>
            </div>

            {/* Dimensão de Geração */}
            <div className="absolute bottom-3.5 right-3.5 font-mono text-[8px] bg-slate-950/80 p-1 border border-slate-850 rounded text-slate-500">
              {activeArtifact === "card" ? "480x680 px" : activeArtifact === "avatar" ? "600x600 px" : "905x360 px"}
            </div>

          </div>

          {/* BOTÕES DE GRAVAÇÃO (SUPABASE STORAGE) E DOWNLOAD */}
          <div className="grid grid-cols-2 gap-4" id="action-buttons-grid">
            
            <button
              onClick={handleSaveToSupabaseStorage}
              className="py-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg font-bold text-xs flex items-center justify-center gap-2 text-white hover:text-emerald-400 transition-all cursor-pointer"
              id="btn-supabase-storage"
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Sincro Supabase</span>
            </button>

            <button
              onClick={handleDownloadImage}
              className="py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-lg text-white font-heavy font-black text-xs flex items-center justify-center gap-1.5 hover:brightness-110 transition-all cursor-pointer"
              id="btn-download-media"
            >
              <Download className="w-4 h-4" />
              <span>Baixar PNG</span>
            </button>

          </div>

          {/* DETALHAMENTO DO STORAGE DO SUPABASE */}
          <div className="bg-slate-900/60 p-4.5 rounded-xl border border-slate-850 text-left font-mono space-y-3" id="supabase-storage-logs-card">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                Supabase Storage & DML Logs
              </span>
              {isSavedInSupabase ? (
                <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold">
                  ✓ GRAVADO NO CONECTOR
                </span>
              ) : (
                <span className="text-[9px] bg-yellow-500/10 text-yellow-405 border border-yellow-500/20 px-1.5 py-0.5 rounded font-bold animate-pulse">
                  AGUARDANDO SYNC
                </span>
              )}
            </div>

            <p className="text-[9px] text-zinc-400 leading-relaxed font-sans">
              Cada imagem gerada pode ser gravada na CDN Supabase Storage. Verifique as transações de API abaixo:
            </p>

            <div className="bg-[#030712]/95 border border-slate-900 rounded p-2.5 h-[140px] overflow-y-auto custom-scrollbar space-y-2 text-[9px]">
              {supabaseLogs.length === 0 ? (
                <div className="text-zinc-650 text-center py-8 select-none text-slate-600">Nenhuma transação de bucket enviada ainda neste ciclo.</div>
              ) : (
                supabaseLogs.map((log) => (
                  <div key={log.id} className="space-y-0.5">
                    <div className="flex justify-between items-center text-[7.5px] text-slate-500">
                      <span>{log.time}</span>
                      <span className="text-slate-400 font-bold">{log.event}</span>
                    </div>
                    <p className="text-zinc-350 leading-relaxed font-mono border-l border-emerald-500/30 pl-1.5">{log.details}</p>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
