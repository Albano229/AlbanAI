"use client";

import { useState } from "react";
import { Sparkles, Upload, Mic, Video, ChevronRight, Menu, X, Globe, Shield, Users, Zap } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  const features = [
    { icon: Mic, title: "Voix Off Réalistes", desc: "Choisissez parmi plusieurs voix françaises naturelles, dont la voix exclusive Alban" },
    { icon: Upload, title: "Vos Images", desc: "Téléchargez vos propres photos ou laissez l'IA les générer pour vous" },
    { icon: Video, title: "Montage Automatique", desc: "L'IA assemble votre vidéo avec transitions, musique et sous-titres" },
    { icon: Globe, title: "Accessible Partout", desc: "PC, tablette ou mobile — responsive et prêt à l'emploi" },
    { icon: Zap, title: "Rapide & Simple", desc: "Collez votre script, choisissez vos options, obtenez votre vidéo en minutes" },
    { icon: Shield, title: "100% Gratuit (pour commencer)", desc: "Pas de carte bancaire, pas d'abonnement. Testez sans limite" },
  ];

  const steps = [
    { num: 1, title: "Collez votre script", desc: "Histoire, tutoriel, présentation — tout type de contenu" },
    { num: 2, title: "Choisissez votre voix", desc: "Alban, Denise, Henri, Eloise… et d'autres à venir" },
    { num: 3, title: "Ajoutez vos images", desc: "Upload ou génération automatique par l'IA" },
    { num: 4, title: "Générez", desc: "L'IA assemble tout et vous livre votre vidéo MP4" },
  ];

  const voices = [
    { name: "Alban", gender: "👨", desc: "Chaude, autoritaire", color: "from-purple-500 to-amber-500" },
    { name: "Denise", gender: "👩", desc: "Douce, maternelle", color: "from-pink-500 to-rose-500" },
    { name: "Eloise", gender: "👩", desc: "Jeune, dynamique", color: "from-cyan-500 to-blue-500" },
    { name: "Henri", gender: "👨", desc: "Chaud, rassurant", color: "from-amber-500 to-orange-500" },
    { name: "Gerard", gender: "👨", desc: "Sérieux, posé", color: "from-blue-500 to-indigo-500" },
  ];

  return (
    <div className="min-h-screen">
      {/* NAVIGATION */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark/80 backdrop-blur-xl border-b border-purple-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg gradient-bg flex items-center justify-center text-white font-bold text-sm">A</div>
              <span className="font-bold text-xl">Alban<span className="text-purple-400">AI</span></span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6">
              <Link href="/create" className="text-gray-300 hover:text-white transition">Créer</Link>
              <Link href="/#features" className="text-gray-300 hover:text-white transition">Fonctionnalités</Link>
              <Link href="/#voices" className="text-gray-300 hover:text-white transition">Voix</Link>
              <Link href="/admin" className="text-gray-400 hover:text-white transition text-sm">Admin</Link>
              <Link href="/create" className="btn-primary text-sm !py-2 !px-5">
                Commencer
              </Link>
            </div>

            <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-purple-900/20 bg-dark/95 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-3">
              <Link href="/create" className="block text-gray-300 hover:text-white py-2" onClick={() => setMenuOpen(false)}>Créer</Link>
              <Link href="/#features" className="block text-gray-300 hover:text-white py-2" onClick={() => setMenuOpen(false)}>Fonctionnalités</Link>
              <Link href="/#voices" className="block text-gray-300 hover:text-white py-2" onClick={() => setMenuOpen(false)}>Voix</Link>
              <Link href="/admin" className="block text-gray-400 py-2 text-sm" onClick={() => setMenuOpen(false)}>Admin</Link>
              <Link href="/create" className="btn-primary text-center block" onClick={() => setMenuOpen(false)}>Commencer</Link>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
        <div className="absolute top-40 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute top-60 -right-40 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm mb-8">
            <Sparkles size={16} />
            <span>Générateur de vidéos par IA</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-tight mb-6">
            Créez des vidéos <br />
            <span className="gradient-text">professionnelles</span>
            <br />en un clic
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Collez votre texte, choisissez une voix, ajoutez vos images — 
            AlbanAI transforme tout ça en une vidéo MP4 prête à publier. 
            Pas de montage, pas de compétences techniques.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/create" className="btn-primary text-lg !px-8 !py-4 flex items-center justify-center gap-2">
              Créer ma première vidéo <ChevronRight size={20} />
            </Link>
            <Link href="/#features" className="btn-secondary text-lg !px-8 !py-4">
              Voir les fonctionnalités
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {[
              { value: "Gratuit", label: "Pour commencer" },
              { value: "+5 voix", label: "Français" },
              { value: "MP4 HD", label: "Téléchargement" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-xl font-bold text-white">{s.value}</div>
                <div className="text-sm text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-4" id="how">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Comment ça <span className="gradient-text">marche</span>
          </h2>
          <p className="text-gray-400 text-center mb-16 max-w-xl mx-auto">4 étapes simples pour créer votre vidéo</p>
          
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="card rounded-2xl p-6 text-center">
                <div className="step-number mx-auto mb-4">{step.num}</div>
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VOICES */}
      <section className="py-20 px-4" id="voices">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Nos <span className="gradient-text">voix</span>
          </h2>
          <p className="text-gray-400 text-center mb-16 max-w-xl mx-auto">Des voix françaises naturelles et réalistes</p>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {voices.map((v, i) => (
              <div key={i} className="card rounded-2xl p-5 text-center hover:-translate-y-1">
                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${v.color} flex items-center justify-center text-2xl mx-auto mb-3`}>
                  {v.gender}
                </div>
                <h3 className="font-bold text-lg">{v.name}</h3>
                <p className="text-gray-400 text-xs mt-1">{v.desc}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/create" className="btn-primary">
              Essayer les voix
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-4" id="features">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Tout ce dont vous avez <span className="gradient-text">besoin</span>
          </h2>
          <p className="text-gray-400 text-center mb-16 max-w-xl mx-auto">Une seule plateforme pour créer toutes vos vidéos</p>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="card rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                  <f.icon className="text-purple-400" size={24} />
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="card rounded-3xl p-10 md:p-16 glow">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Prêt à créer votre première vidéo ?
            </h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              Gratuit, sans inscription compliquée. Collez votre texte et laissez l'IA faire le reste.
            </p>
            <Link href="/create" className="btn-primary text-lg !px-10 !py-4 inline-flex items-center gap-2">
              Commencer maintenant <ChevronRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-purple-900/20 py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white font-bold text-xs">A</div>
            <span className="font-bold">Alban<span className="text-purple-400">AI</span></span>
          </div>
          <p className="text-gray-500 text-sm">© 2026 AlbanAI. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
