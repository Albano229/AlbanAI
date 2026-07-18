"use client";

import { useState } from "react";
import { ArrowLeft, Upload, Mic, Play, Image as ImageIcon, Check, Loader2, Music2 } from "lucide-react";
import Link from "next/link";

const voices = [
  { id: "alban", name: "Alban", gender: "Homme", style: "Chaude, autoritaire" },
  { id: "denise", name: "Denise", gender: "Femme", style: "Douce, maternelle" },
  { id: "eloise", name: "Eloise", gender: "Femme", style: "Jeune, dynamique" },
  { id: "henri", name: "Henri", gender: "Homme", style: "Chaud, rassurant" },
  { id: "gerard", name: "Gerard", gender: "Homme", style: "Sérieux, posé" },
];

const videoTypes = [
  { id: "histoire", label: "Histoire touchante", emoji: "💖" },
  { id: "tutoriel", label: "Tutoriel / Explication", emoji: "📚" },
  { id: "motivation", label: "Motivation / Discours", emoji: "🔥" },
  { id: "presentation", label: "Présentation produit", emoji: "🎯" },
  { id: "reseau", label: "Réseaux sociaux", emoji: "📱" },
  { id: "autre", label: "Autre", emoji: "✨" },
];

export default function CreatePage() {
  const [script, setScript] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("alban");
  const [videoType, setVideoType] = useState("histoire");
  const [images, setImages] = useState<File[]>([]);
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState<string[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files);
    setImages(prev => [...prev, ...newFiles]);
    newFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      setImagePreview(prev => [...prev, url]);
    });
  };

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setImagePreview(prev => prev.filter((_, i) => i !== idx));
  };

  const handleGenerate = async () => {
    if (!script.trim()) return;
    setGenerating(true);
    setProgress(0);
    
    // Simulated progress
    const steps = [
      { p: 10, msg: "Analyse du script..." },
      { p: 25, msg: "Génération de la voix off..." },
      { p: 50, msg: "Préparation des visuels..." },
      { p: 75, msg: "Montage vidéo en cours..." },
      { p: 90, msg: "Finalisation..." },
      { p: 100, msg: "Terminé !" },
    ];
    
    for (const step of steps) {
      await new Promise(r => setTimeout(r, 800));
      setProgress(step.p);
    }
    
    setDone(true);
    setGenerating(false);
  };

  return (
    <div className="min-h-screen bg-dark">
      {/* HEADER */}
      <header className="border-b border-purple-900/20 bg-dark/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-400 hover:text-white">
              <ArrowLeft size={20} />
            </Link>
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white font-bold text-xs">A</div>
            <span className="font-bold">Alban<span className="text-purple-400">AI</span></span>
          </div>
          {!generating && !done && (
            <button onClick={handleGenerate} disabled={!script.trim()} className="btn-primary text-sm !py-2 !px-5 disabled:opacity-40">
              Générer la vidéo
            </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {done ? (
          /* SUCCESS STATE */
          <div className="max-w-lg mx-auto text-center py-20">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-6">
              <Check size={36} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-3">Vidéo créée !</h2>
            <p className="text-gray-400 mb-8">Votre vidéo est prête à être téléchargée</p>
            <div className="card rounded-2xl p-6 mb-8 text-left">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400">AlbanAI_histoire_01.mp4</span>
                <span className="text-xs text-gray-500">~4.2 MB</span>
              </div>
              <div className="bg-dark rounded-xl h-48 flex items-center justify-center border border-purple-900/20">
                <Play size={48} className="text-purple-400" />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="btn-primary">📥 Télécharger la vidéo</button>
              <button onClick={() => { setDone(false); setScript(""); setProgress(0); }} className="btn-secondary">
                Créer une autre
              </button>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* LEFT - FORM */}
            <div className="lg:col-span-2 space-y-6">
              {/* TYPE DE VIDÉO */}
              <div className="card rounded-2xl p-6">
                <h2 className="font-bold text-lg mb-4">Type de vidéo</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {videoTypes.map(vt => (
                    <button key={vt.id} onClick={() => setVideoType(vt.id)}
                      className={`p-3 rounded-xl text-left text-sm border transition ${
                        videoType === vt.id 
                          ? 'border-purple-500 bg-purple-500/10 text-white' 
                          : 'border-purple-900/20 text-gray-400 hover:border-purple-500/50'
                      }`}>
                      <span className="text-lg">{vt.emoji}</span>
                      <div className="mt-1 font-medium">{vt.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* SCRIPT */}
              <div className="card rounded-2xl p-6">
                <h2 className="font-bold text-lg mb-1">Votre script</h2>
                <p className="text-gray-500 text-sm mb-4">Copiez votre histoire, tutoriel ou discours ici</p>
                <textarea 
                  value={script} onChange={e => setScript(e.target.value)}
                  placeholder="Il était une fois... ou collez votre texte ici..."
                  rows={10}
                  className="min-h-[200px] resize-y"
                />
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>{script.length} caractères</span>
                  <span>~{Math.ceil(script.length / 200)}+ secondes de vidéo</span>
                </div>
              </div>

              {/* IMAGES UPLOAD */}
              <div className="card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-bold text-lg">Vos images</h2>
                    <p className="text-gray-500 text-sm">Optionnel — l'IA générera des visuels si vous n'en mettez pas</p>
                  </div>
                </div>
                
                {imagePreview.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {imagePreview.map((url, i) => (
                      <div key={i} className="relative group">
                        <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg" />
                        <button onClick={() => removeImage(i)} 
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs opacity-0 group-hover:opacity-100 transition">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <label className="flex flex-col items-center justify-center border-2 border-dashed border-purple-900/30 rounded-xl p-8 cursor-pointer hover:border-purple-500/50 transition">
                  <Upload size={32} className="text-purple-400 mb-3" />
                  <span className="text-gray-400 text-sm">Cliquez pour ajouter des images</span>
                  <span className="text-gray-500 text-xs mt-1">PNG, JPG, WEBP</span>
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* RIGHT - VOICE + PROGRESS */}
            <div className="space-y-6">
              {/* VOICE SELECTION */}
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

              {/* OPTIONS */}
              <div className="card rounded-2xl p-6">
                <h2 className="font-bold text-sm mb-3 text-gray-300">Options</h2>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 accent-purple-500" />
                    <span className="text-sm text-gray-400">Ajouter une musique de fond</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 accent-purple-500" />
                    <span className="text-sm text-gray-400">Sous-titres automatiques</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 accent-purple-500" />
                    <span className="text-sm text-gray-400">Générer les images par IA</span>
                  </label>
                </div>
              </div>

              {/* GENERATE BUTTON */}
              {generating ? (
                <div className="card rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Loader2 size={20} className="text-purple-400 animate-spin" />
                    <span className="text-sm text-gray-300">Génération en cours...</span>
                  </div>
                  <div className="w-full bg-dark rounded-full h-3 overflow-hidden">
                    <div className="h-full gradient-bg rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 mt-3 text-center">{progress}%</p>
                </div>
              ) : (
                <button 
                  onClick={handleGenerate}
                  disabled={!script.trim()}
                  className="btn-primary w-full text-center py-4 text-lg disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  <Play size={20} />
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
