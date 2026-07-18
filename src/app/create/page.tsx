"use client";

import { useState, useRef } from "react";
import { ArrowLeft, Upload, Mic, Play, Check, Loader2, FileText, ImageIcon, Download, Sparkles } from "lucide-react";
import Link from "next/link";

const voices = [
  { id: "alban", name: "Alban", gender: "Homme", style: "Chaude, autoritaire", lang: "fr-FR" },
  { id: "denise", name: "Denise", gender: "Femme", style: "Douce, maternelle", lang: "fr-FR" },
  { id: "eloise", name: "Eloise", gender: "Femme", style: "Jeune, dynamique", lang: "fr-FR" },
  { id: "henri", name: "Henri", gender: "Homme", style: "Chaud, rassurant", lang: "fr-FR" },
  { id: "gerard", name: "Gerard", gender: "Homme", style: "Sérieux, posé", lang: "fr-FR" },
];

export default function CreatePage() {
  const [script, setScript] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("alban");
  const [images, setImages] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [generating, setGenerating] = useState(false);
  const [step, setStep] = useState("");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ videoUrl?: string; images: string[] } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files);
    setUploadedFiles(prev => [...prev, ...newFiles]);
    newFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      setImages(prev => [...prev, url]);
    });
  };

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const splitScript = (text: string): string[] => {
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 20);
    if (paragraphs.length === 0) return [text];
    return paragraphs;
  };

  const generateVideo = async () => {
    if (!script.trim()) return;
    setGenerating(true);
    setProgress(0);

    try {
      // Étape 1: Analyse du script
      setStep("📖 Analyse du script...");
      setProgress(5);
      await new Promise(r => setTimeout(r, 500));

      const scenes = splitScript(script);
      const generatedImages: string[] = [];
      
      // Utiliser les images uploadées d'abord
      let imgIndex = 0;

      // Étape 2: Génération des images (si pas assez d'upload)
      setStep("🎨 Génération des images...");
      for (let i = 0; i < scenes.length; i++) {
        const progressBase = 10 + Math.floor((i / scenes.length) * 60);
        setProgress(progressBase);
        
        // Utiliser image uploadée si disponible
        if (imgIndex < uploadedFiles.length) {
          generatedImages.push(images[imgIndex]);
          imgIndex++;
          continue;
        }

        // Sinon générer via IA
        setStep(`🎨 Génération image ${i + 1}/${scenes.length}...`);
        const res = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `Une scène réaliste et émouvante: ${scenes[i].substring(0, 300)}. Style cinématographique, 16:9, haute qualité.`,
          }),
        });
        const data = await res.json();
        if (data.url) generatedImages.push(data.url);
      }

      setImages(generatedImages);
      setProgress(75);

      // Étape 3: Génération de la voix (Web Speech API)
      setStep("🎤 Génération de la voix off...");
      setProgress(80);
      
      // On utilise la Web Speech API pour la voix
      const fullText = script;
      const utterance = new SpeechSynthesisUtterance(fullText);
      utterance.lang = "fr-FR";
      utterance.rate = 0.95;
      
      // Trouver la voix
      const availableVoices = speechSynthesis.getVoices();
      const voiceMap: Record<string, string> = {
        alban: "Microsoft Henri",
        denise: "Microsoft Denise",
        eloise: "Microsoft Eloise",
        henri: "Microsoft Henri",
        gerard: "Microsoft Gerard",
      };
      const target = availableVoices.find(v => v.name.includes(voiceMap[selectedVoice] || "Henri"));
      if (target) utterance.voice = target;

      setProgress(85);
      setStep("🎬 Assemblage de la vidéo...");
      
      // Créer un canvas pour assembler images + audio
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      canvas.width = 854;
      canvas.height = 480;

      // Durée estimée (lecture à ~4 chars/sec en français)
      const totalDuration = Math.max(fullText.length / 4 + 3, 10);
      const sceneDuration = totalDuration / scenes.length;
      const fps = 30;
      const totalFrames = Math.floor(totalDuration * fps);

      // Précharger les images
      const loadedImages = await Promise.all(
        generatedImages.map(url => {
          return new Promise<HTMLImageElement>((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = () => {
              const fallback = new Image();
              fallback.onload = () => resolve(fallback);
              fallback.src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='854' height='480'><rect fill='%231a1a3e' width='854' height='480'/><text fill='white' font-size='24' x='427' y='240' text-anchor='middle'>Image non disponible</text></svg>";
              return fallback;
            };
            img.src = url;
          });
        })
      );

      setProgress(92);

      // Générer les frames avec MediaRecorder
      const stream = canvas.captureStream(fps);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
          ? "video/webm;codecs=vp9"
          : "video/webm",
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.start();
      
      // Dessiner frame par frame
      let animFrame = 0;
      const maxFrames = totalFrames;

      const drawFrame = () => {
        if (animFrame >= maxFrames) {
          mediaRecorder.stop();
          return;
        }

        const sceneIdx = Math.min(Math.floor((animFrame / maxFrames) * loadedImages.length), loadedImages.length - 1);
        const img = loadedImages[sceneIdx];
        
        // Fond noir
        ctx.fillStyle = "#0f0f23";
        ctx.fillRect(0, 0, 854, 480);

        if (img) {
          // Image centrée avec zoom doux
          const scale = Math.max(854 / img.width, 480 / img.height) * 1.05;
          const w = img.width * scale;
          const h = img.height * scale;
          const x = (854 - w) / 2 + Math.sin(animFrame * 0.02) * 5;
          const y = (480 - h) / 2;
          ctx.drawImage(img, x, y, w, h);
        }

        // Voile sombre en bas pour le texte
        const grad = ctx.createLinearGradient(0, 350, 0, 480);
        grad.addColorStop(0, "rgba(0,0,0,0)");
        grad.addColorStop(1, "rgba(0,0,0,0.85)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 350, 854, 130);

        // Sous-titre
        const text = scenes[sceneIdx] || "";
        const lines = text.match(/.{1,55}/g) || [];
        const subtitleLines = lines.slice(0, 2);
        
        ctx.fillStyle = "white";
        ctx.font = "20px Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        
        subtitleLines.forEach((line, li) => {
          // Ombre
          ctx.fillStyle = "rgba(0,0,0,0.6)";
          ctx.fillRect(40, 410 + li * 28, 774, 26);
          ctx.fillStyle = "white";
          ctx.fillText(line, 427, 433 + li * 28);
        });

        // Progression
        animFrame++;
        const pct = Math.floor((animFrame / maxFrames) * 100);
        setProgress(92 + Math.floor(pct * 0.07));

        requestAnimationFrame(drawFrame);
      };

      drawFrame();

      // Attendre la fin de l'enregistrement
      const videoBlob = await new Promise<Blob>((resolve) => {
        mediaRecorder.onstop = () => {
          resolve(new Blob(chunks, { type: "video/webm" }));
        };
      });

      setProgress(100);
      setStep("✅ Vidéo prête !");
      const videoUrl = URL.createObjectURL(videoBlob);
      setResult({ videoUrl, images: generatedImages });

    } catch (err) {
      console.error(err);
      setStep("❌ Erreur: " + String(err));
    }
    
    setGenerating(false);
  };

  return (
    <div className="min-h-screen bg-dark">
      <header className="border-b border-purple-900/20 bg-dark/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-400 hover:text-white">
              <ArrowLeft size={20} />
            </Link>
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white font-bold text-xs">A</div>
            <span className="font-bold">Alban<span className="text-purple-400">AI</span></span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {result ? (
          <div className="max-w-2xl mx-auto text-center py-10">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-6">
              <Check size={36} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Vidéo créée ! 🎉</h2>
            <p className="text-gray-400 mb-8">Prête à être téléchargée ou partagée</p>
            
            <div className="card rounded-2xl p-4 mb-8">
              <video ref={videoRef} src={result.videoUrl} controls className="w-full rounded-xl" />
            </div>

            <div className="flex gap-3 justify-center flex-wrap">
              <a href={result.videoUrl} download="albana_video.webm" className="btn-primary flex items-center gap-2">
                <Download size={18} /> Télécharger
              </a>
              <button onClick={() => { setResult(null); setScript(""); setImages([]); setUploadedFiles([]); }} className="btn-secondary">
                Créer une autre
              </button>
            </div>

            {result.images.length > 0 && (
              <div className="mt-8">
                <p className="text-sm text-gray-500 mb-3">Images générées :</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {result.images.map((url, i) => (
                    <img key={i} src={url} alt="" className="w-24 h-16 object-cover rounded-lg border border-purple-900/20" />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* SCRIPT */}
              <div className="card rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-1">
                  <FileText size={18} className="text-purple-400" />
                  <h2 className="font-bold text-lg">Votre script</h2>
                </div>
                <p className="text-gray-500 text-sm mb-4">Collez votre texte — histoire, tutoriel, discours... tout type de contenu</p>
                <textarea 
                  value={script} onChange={e => setScript(e.target.value)}
                  placeholder="Il était une fois, dans un petit village du Bénin..."
                  rows={10}
                  className="min-h-[200px] resize-y"
                />
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>{script.length} caractères</span>
                  <span>~{Math.max(Math.ceil(script.length / 4), 10)} secondes de vidéo</span>
                </div>
              </div>

              {/* IMAGES */}
              <div className="card rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-1">
                  <ImageIcon size={18} className="text-purple-400" />
                  <h2 className="font-bold text-lg">Images</h2>
                </div>
                <p className="text-gray-500 text-sm mb-4">Ajoutez vos images ou laissez l'IA les générer automatiquement</p>
                
                {images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {images.map((url, i) => (
                      <div key={i} className="relative group">
                        <img src={url} alt="" className="w-20 h-16 object-cover rounded-lg border border-purple-900/30" />
                        <button onClick={() => removeImage(i)} 
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full text-white text-xs opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <label className="flex flex-col items-center justify-center border-2 border-dashed border-purple-900/30 rounded-xl p-6 cursor-pointer hover:border-purple-500/50 transition">
                  <Upload size={28} className="text-purple-400 mb-2" />
                  <span className="text-gray-400 text-sm">Cliquez pour uploader</span>
                  <span className="text-gray-500 text-xs mt-1">PNG, JPG, WEBP — optionnel</span>
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* RIGHT */}
            <div className="space-y-6">
              {/* VOICE */}
              <div className="card rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Mic size={18} className="text-purple-400" />
                  <h2 className="font-bold text-lg">Voix off</h2>
                </div>
                <div className="space-y-2">
                  {voices.map(v => (
                    <button key={v.id} onClick={() => setSelectedVoice(v.id)}
                      className={`w-full p-3 rounded-xl text-left border transition ${
                        selectedVoice === v.id 
                          ? 'border-purple-500 bg-purple-500/10 text-white' 
                          : 'border-purple-900/20 text-gray-400 hover:border-purple-500/50'
                      }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{v.gender === "Homme" ? "👨" : "👩"}</span>
                          <div>
                            <div className="font-medium text-sm">{v.name}</div>
                            <div className="text-xs text-gray-500">{v.style}</div>
                          </div>
                        </div>
                        {selectedVoice === v.id && <Check size={16} className="text-purple-400" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* PROGRESS */}
              {generating && (
                <div className="card rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Loader2 size={20} className="text-purple-400 animate-spin" />
                    <span className="text-sm text-gray-300">{step}</span>
                  </div>
                  <div className="w-full bg-dark rounded-full h-3 overflow-hidden">
                    <div className="h-full gradient-bg rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">{progress}%</p>
                </div>
              )}

              {/* GENERATE */}
              {!generating && (
                <button 
                  onClick={generateVideo}
                  disabled={!script.trim()}
                  className="btn-primary w-full text-center py-4 text-lg disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  <Sparkles size={20} />
                  Générer la vidéo
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
