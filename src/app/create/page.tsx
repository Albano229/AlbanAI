"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Upload, Mic, Play, Check, Loader2, FileText, Download, Sparkles, RefreshCw } from "lucide-react";
import Link from "next/link";

const voices = [
  { id: "alban", name: "Alban", gender: "Homme", style: "Chaude, autoritaire" },
  { id: "denise", name: "Denise", gender: "Femme", style: "Douce, maternelle" },
  { id: "eloise", name: "Eloise", gender: "Femme", style: "Jeune, dynamique" },
  { id: "henri", name: "Henri", gender: "Homme", style: "Chaud, rassurant" },
  { id: "gerard", name: "Gerard", gender: "Homme", style: "Sérieux, posé" },
];

interface Scene {
  text: string;
  imageUrl: string;
}

export default function CreatePage() {
  const [script, setScript] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("alban");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [generating, setGenerating] = useState(false);
  const [step, setStep] = useState("");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ videoUrl?: string } | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const addLog = (msg: string) => setLog(p => [...p, msg]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files);
    setUploadedFiles(prev => [...prev, ...newFiles]);
    newFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      setUploadedImages(prev => [...prev, url]);
    });
  };

  const removeImage = (idx: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== idx));
    setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const splitScript = (text: string): string[] => {
    // Couper par paragraphes ou phrases
    const parts = text.split(/\n\n+/).filter(p => p.trim().length > 10);
    if (parts.length === 0) return [text];
    // Si trop de scènes, fusionner
    if (parts.length > 20) {
      const merged: string[] = [];
      const chunkSize = Math.ceil(parts.length / 15);
      for (let i = 0; i < parts.length; i += chunkSize) {
        merged.push(parts.slice(i, i + chunkSize).join("\n\n"));
      }
      return merged;
    }
    return parts;
  };

  const generateVideo = async () => {
    if (!script.trim()) return;
    setGenerating(true);
    setProgress(0);
    setLog([]);
    setResult(null);
    setAudioUrl(null);

    try {
      // Étape 1: Analyse
      setStep("📖 Analyse du script...");
      addLog("Analyse du script...");
      setProgress(5);
      await new Promise(r => setTimeout(r, 300));
      const scenes = splitScript(script);
      addLog(`→ ${scenes.length} scènes détectées`);

      // Étape 2: Génération des images
      const sceneImages: string[] = [];
      let imgIdx = 0;

      for (let i = 0; i < scenes.length; i++) {
        const progressBase = 10 + Math.floor((i / scenes.length) * 35);
        setProgress(progressBase);

        if (imgIdx < uploadedFiles.length) {
          sceneImages.push(uploadedImages[imgIdx]);
          addLog(`📷 Image ${i + 1}: uploadée`);
          imgIdx++;
          continue;
        }

        setStep(`🎨 Génération image ${i + 1}/${scenes.length}...`);
        addLog(`🎨 Génération image ${i + 1}...`);
        
        const res = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: scenes[i].substring(0, 500) }),
        });
        const data = await res.json();
        if (data.url) {
          sceneImages.push(data.url);
          addLog(`✅ Image ${i + 1} générée`);
        } else {
          addLog(`⚠️ Image ${i + 1}: ${data.error || "échec"}`);
        }
      }

      setProgress(50);

      // Étape 3: Génération de la voix
      setStep("🎤 Génération de la voix off...");
      addLog(`🎤 Génération voix: ${voices.find(v => v.id === selectedVoice)?.name}...`);

      const voiceRes = await fetch("/api/generate-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: script, voice: selectedVoice }),
      });

      if (!voiceRes.ok) {
        const err = await voiceRes.json();
        throw new Error(err.error || "Échec TTS");
      }

      const voiceBlob = await voiceRes.blob();
      const audioUrlTemp = URL.createObjectURL(voiceBlob);
      setAudioUrl(audioUrlTemp);
      addLog(`✅ Voix générée (${(voiceBlob.size / 1024).toFixed(1)} KB)`);

      setProgress(60);

      // Étape 4: Assemblage vidéo
      setStep("🎬 Assemblage de la vidéo...");
      addLog("🎬 Montage vidéo...");

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      canvas.width = 854;
      canvas.height = 480;

      // Charger l'audio pour connaître la durée
      const audioCtx = new AudioContext();
      const audioBuffer = await audioCtx.decodeAudioData(await voiceBlob.arrayBuffer());
      const audioDuration = audioBuffer.duration;
      addLog(`→ Durée audio: ${audioDuration.toFixed(1)}s`);

      // Charger les images
      const loadedImages = await Promise.allSettled(
        sceneImages.map(url => {
          return new Promise<HTMLImageElement>((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = () => {
              const fallback = new Image();
              fallback.onload = () => resolve(fallback);
              fallback.src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='854' height='480'><rect fill='%231a1a3e' width='854' height='480'/></svg>";
              fallback;
            };
            img.src = url;
          });
        })
      );

      const validImages = loadedImages
        .filter(r => r.status === "fulfilled")
        .map(r => (r as PromiseFulfilledResult<HTMLImageElement>).value);

      if (validImages.length === 0) {
        throw new Error("Aucune image disponible");
      }

      // Durée par scène
      const sceneDuration = audioDuration / validImages.length;
      const fps = 30;
      const totalFrames = Math.ceil(audioDuration * fps);
      addLog(`→ ${totalFrames} frames à générer`);

      // Configuration MediaRecorder avec audio
      const videoStream = canvas.captureStream(fps);
      
      // Créer le stream audio à partir du buffer
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      const dest = audioCtx.createMediaStreamDestination();
      source.connect(dest);
      source.start();

      // Combiner les streams
      const tracks = [...videoStream.getVideoTracks(), ...dest.stream.getAudioTracks()];
      const combinedStream = new MediaStream(tracks);

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      const recorder = new MediaRecorder(combinedStream, { mimeType });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      const videoDone = new Promise<void>((resolve) => {
        recorder.onstop = () => resolve();
      });

      recorder.start();

      // Rendu frame par frame
      const renderFrames = () => {
        let frame = 0;
        let lastPct = 0;

        const draw = () => {
          if (frame >= totalFrames) {
            recorder.stop();
            source.stop();
            audioCtx.close();
            return;
          }

          const t = frame / totalFrames;
          const sceneIdx = Math.min(Math.floor(t * validImages.length), validImages.length - 1);
          const img = validImages[sceneIdx];

          // Fond
          ctx.fillStyle = "#0f0f23";
          ctx.fillRect(0, 0, 854, 480);

          // Image avec zoom
          if (img) {
            const scale = Math.max(854 / img.width, 480 / img.height) * 1.05;
            const w = img.width * scale;
            const h = img.height * scale;
            const x = (854 - w) / 2 + Math.sin(frame * 0.015) * 3;
            const y = (480 - h) / 2;
            ctx.drawImage(img, x, y, w, h);
          }

          // Voile + sous-titres
          const grad = ctx.createLinearGradient(0, 350, 0, 480);
          grad.addColorStop(0, "rgba(0,0,0,0)");
          grad.addColorStop(1, "rgba(0,0,0,0.85)");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 350, 854, 130);

          const text = scenes[sceneIdx] || "";
          const lines = text.match(/.{1,50}/g) || [];
          const showLines = lines.slice(0, 2);

          ctx.textAlign = "center";
          showLines.forEach((line, li) => {
            ctx.fillStyle = "rgba(0,0,0,0.5)";
            ctx.fillRect(40, 410 + li * 28, 774, 24);
            ctx.fillStyle = "white";
            ctx.font = "18px Arial, sans-serif";
            ctx.textBaseline = "middle";
            ctx.fillText(line.trim(), 427, 422 + li * 28);
          });

          // Progression
          frame++;
          const pct = Math.floor((frame / totalFrames) * 100);
          if (pct !== lastPct) {
            setProgress(60 + Math.floor(pct * 0.35));
            lastPct = pct;
          }

          requestAnimationFrame(draw);
        };

        draw();
      };

      renderFrames();
      await videoDone;

      const finalBlob = new Blob(chunks, { type: "video/webm" });
      const videoUrl = URL.createObjectURL(finalBlob);
      addLog(`✅ Vidéo prête! (${(finalBlob.size / 1024 / 1024).toFixed(1)} MB)`);

      setProgress(100);
      setStep("✅ Terminé !");
      setResult({ videoUrl });

    } catch (err) {
      const msg = String(err);
      addLog(`❌ Erreur: ${msg}`);
      setStep("❌ " + msg);
    }

    setGenerating(false);
  };

  return (
    <div className="min-h-screen bg-dark">
      <header className="border-b border-purple-900/20 bg-dark/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft size={20} className="text-gray-400" />
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white font-bold text-xs">A</div>
            <span className="font-bold">Alban<span className="text-purple-400">AI</span></span>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {result ? (
          <div className="max-w-2xl mx-auto text-center py-10">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-6">
              <Check size={36} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Vidéo créée ! 🎉</h2>
            <p className="text-gray-400 mb-8">Avec voix off et images</p>
            
            <div className="card rounded-2xl p-3 mb-8">
              <video ref={videoRef} src={result.videoUrl} controls className="w-full rounded-xl" />
            </div>

            <div className="flex gap-3 justify-center flex-wrap">
              <a href={result.videoUrl} download="albana_video.webm" className="btn-primary flex items-center gap-2">
                <Download size={18} /> Télécharger
              </a>
              <button onClick={() => { setResult(null); setScript(""); setUploadedImages([]); setUploadedFiles([]); setAudioUrl(null); }} className="btn-secondary">
                Créer une autre
              </button>
            </div>

            {log.length > 0 && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-gray-500 cursor-pointer">Journal de génération</summary>
                <div className="text-xs text-gray-500 mt-2 space-y-1 bg-dark-light rounded-xl p-4 max-h-40 overflow-y-auto">
                  {log.map((l, i) => <p key={i}>{l}</p>)}
                </div>
              </details>
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
                <p className="text-gray-500 text-sm mb-4">Collez votre texte ici</p>
                <textarea 
                  value={script} onChange={e => setScript(e.target.value)}
                  placeholder="Il était une fois, dans un petit village du Bénin..."
                  rows={10}
                  className="min-h-[200px] resize-y"
                />
              </div>

              {/* IMAGES */}
              <div className="card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Upload size={18} className="text-purple-400" />
                    <h2 className="font-bold text-lg">Images</h2>
                  </div>
                  <span className="text-xs text-gray-500">Optionnel</span>
                </div>
                <p className="text-gray-500 text-sm mb-4">L'IA génère les images automatiquement si vous n'en mettez pas</p>
                
                {uploadedImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {uploadedImages.map((url, i) => (
                      <div key={i} className="relative group">
                        <img src={url} alt="" className="w-20 h-16 object-cover rounded-lg border border-purple-900/30" />
                        <button onClick={() => removeImage(i)} 
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full text-white text-xs opacity-0 group-hover:opacity-100 transition">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <label className="flex flex-col items-center justify-center border-2 border-dashed border-purple-900/30 rounded-xl p-6 cursor-pointer hover:border-purple-500/50 transition">
                  <Upload size={28} className="text-purple-400 mb-2" />
                  <span className="text-gray-400 text-sm">Uploader vos images</span>
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>

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

              {/* LOGS */}
              {generating && (
                <div className="card rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Loader2 size={20} className="text-purple-400 animate-spin" />
                    <span className="text-sm text-gray-300">{step}</span>
                  </div>
                  <div className="w-full bg-dark rounded-full h-3 overflow-hidden mb-3">
                    <div className="h-full gradient-bg rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 mb-3 text-center">{progress}%</p>
                  {log.length > 0 && (
                    <div className="text-xs text-gray-500 space-y-1 max-h-32 overflow-y-auto">
                      {log.slice(-5).map((l, i) => <p key={i}>{l}</p>)}
                    </div>
                  )}
                </div>
              )}

              {/* GENERATE */}
              {!generating && (
                <button 
                  onClick={generateVideo}
                  disabled={!script.trim()}
                  className="btn-primary w-full text-center py-4 text-lg disabled:opacity-40 flex items-center justify-center gap-2 hover:scale-[1.02] transition"
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
