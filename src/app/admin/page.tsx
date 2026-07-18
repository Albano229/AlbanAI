"use client";

import { useState } from "react";
import { Users, Video, BarChart3, Settings, ArrowLeft, TrendingUp, Calendar, Shield, Ban, Eye, Trash2, Search } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const [tab, setTab] = useState("dashboard");
  const [loginKey, setLoginKey] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState(false);

  const handleLogin = () => {
    if (loginKey === "albana2026") {
      setLoggedIn(true);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const stats = [
    { label: "Vidéos créées", value: "0", icon: Video, change: "+0 aujourd'hui", color: "text-blue-400" },
    { label: "Utilisateurs", value: "1", icon: Users, change: "Toi + invités", color: "text-green-400" },
    { label: "Temps total", value: "0 min", icon: BarChart3, change: "Vidéos générées", color: "text-purple-400" },
    { label: "Stockage", value: "0 MB", icon: Settings, change: "Images + vidéos", color: "text-amber-400" },
  ];

  const users = [
    { name: "Alban (toi)", email: "admin@albana.com", status: "admin", videos: 0, date: "Aujourd'hui" },
  ];

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center px-4">
        <div className="card rounded-2xl p-8 max-w-sm w-full">
          <Link href="/" className="text-gray-400 hover:text-white inline-flex items-center gap-1 mb-6 text-sm">
            <ArrowLeft size={16} /> Retour
          </Link>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
            <Shield size={24} className="text-purple-400" />
          </div>
          <h1 className="text-xl font-bold mb-2">Accès Admin</h1>
          <p className="text-gray-500 text-sm mb-6">Entrez la clé secrète pour accéder au panneau d'administration</p>
          <input 
            type="password" 
            value={loginKey} 
            onChange={e => { setLoginKey(e.target.value); setLoginError(false); }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Clé d'accès"
            className="mb-3"
          />
          {loginError && <p className="text-red-400 text-sm mb-3">Clé incorrecte</p>}
          <button onClick={handleLogin} className="btn-primary w-full">Se connecter</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      {/* HEADER */}
      <header className="border-b border-purple-900/20 bg-dark/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-400 hover:text-white">
              <ArrowLeft size={20} />
            </Link>
            <Shield size={18} className="text-purple-400" />
            <span className="font-bold">Admin <span className="text-purple-400">AlbanAI</span></span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            Connecté
          </div>
        </div>
      </header>

      {/* TABS */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="flex gap-1 bg-dark-light rounded-xl p-1 mb-8 overflow-x-auto">
          {[
            { id: "dashboard", label: "Dashboard", icon: BarChart3 },
            { id: "users", label: "Utilisateurs", icon: Users },
            { id: "videos", label: "Vidéos", icon: Video },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                tab === t.id ? 'bg-purple-500/15 text-purple-300' : 'text-gray-400 hover:text-white'
              }`}>
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </div>

        {/* DASHBOARD */}
        {tab === "dashboard" && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((s, i) => (
                <div key={i} className="card rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-400">{s.label}</span>
                    <s.icon size={18} className={s.color} />
                  </div>
                  <div className="text-2xl font-bold">{s.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{s.change}</div>
                </div>
              ))}
            </div>
            
            <div className="card rounded-2xl p-8 text-center">
              <TrendingUp size={40} className="text-purple-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold mb-2">Bienvenue dans l'admin</h3>
              <p className="text-gray-400 text-sm max-w-md mx-auto">
                Lance-toi ! Crée ta première vidéo et les statistiques apparaîtront ici.
              </p>
              <Link href="/create" className="btn-primary inline-block mt-6 text-sm">
                Créer ma première vidéo
              </Link>
            </div>
          </div>
        )}

        {/* USERS */}
        {tab === "users" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Utilisateurs</h2>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input placeholder="Rechercher..." className="!pl-9 !py-2 !text-sm max-w-[200px]" />
              </div>
            </div>
            <div className="card rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-dark-light">
                  <tr>
                    <th className="text-left p-4 text-gray-400 font-medium">Utilisateur</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Rôle</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Vidéos</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Inscrit</th>
                    <th className="text-right p-4 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={i} className="border-t border-purple-900/10 hover:bg-purple-900/5">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 text-sm font-bold">
                            {u.name[0]}
                          </div>
                          <div>
                            <div className="font-medium">{u.name}</div>
                            <div className="text-xs text-gray-500">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          u.status === 'admin' ? 'bg-amber-500/10 text-amber-300' : 'bg-blue-500/10 text-blue-300'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400">{u.videos}</td>
                      <td className="p-4 text-gray-500 text-xs">{u.date}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-2 hover:bg-purple-500/10 rounded-lg text-gray-500 hover:text-white transition" title="Voir">
                            <Eye size={15} />
                          </button>
                          <button className="p-2 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-400 transition" title="Bannir">
                            <Ban size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIDEOS */}
        {tab === "videos" && (
          <div className="card rounded-2xl p-10 text-center">
            <Video size={40} className="text-purple-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold mb-2">Aucune vidéo pour l'instant</h3>
            <p className="text-gray-400 text-sm">Les vidéos créées apparaîtront ici avec leurs statistiques.</p>
            <Link href="/create" className="btn-primary inline-block mt-6 text-sm">
              Créer une vidéo
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
