import React from 'react';
import { Sparkles, User, Database, CheckCircle2, BookOpen, RotateCcw, Activity, Palette } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, profile, onReset, themeMode, setThemeMode }) {
  return (
    <header className="sticky top-0 z-50 glass-panel-dark border-b border-emerald-500/20 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand Logo with Glowing Orb */}
        <div className="flex items-center space-x-3.5 cursor-pointer group" onClick={() => setActiveTab('chat')}>
          <div className="relative">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-amber-500 opacity-70 blur-md group-hover:opacity-100 transition duration-500"></div>
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-900 via-sage-900 to-emerald-950 flex items-center justify-center text-emerald-400 border border-emerald-500/40 shadow-inner">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-white flex items-center gap-2">
              AuraSkin <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold tracking-wider uppercase">RAG AI 2.0</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Evidence-Grounded Dermatological Engine
            </p>
          </div>
        </div>

        {/* Floating Navigation Pill */}
        <nav className="hidden md:flex items-center space-x-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-emerald-500/20 shadow-2xl backdrop-blur-xl">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-800 text-white shadow-lg shadow-emerald-900/50 border border-emerald-400/30'
                : 'text-slate-400 hover:text-white hover:bg-emerald-950/40'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI Consultation</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-800 text-white shadow-lg shadow-emerald-900/50 border border-emerald-400/30'
                : 'text-slate-400 hover:text-white hover:bg-emerald-950/40'
            }`}
          >
            <User className="w-4 h-4 text-emerald-400" />
            <span>Skin Profile</span>
            {profile?.skin_type && profile.skin_type !== 'unsure' && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'catalog'
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-800 text-white shadow-lg shadow-emerald-900/50 border border-emerald-400/30'
                : 'text-slate-400 hover:text-white hover:bg-emerald-950/40'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Catalog & Actives</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'admin'
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-800 text-white shadow-lg shadow-emerald-900/50 border border-emerald-400/30'
                : 'text-slate-400 hover:text-white hover:bg-emerald-950/40'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-400" />
            <span>RAG Admin</span>
          </button>

          <button
            onClick={() => setActiveTab('eval')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'eval'
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-800 text-white shadow-lg shadow-emerald-900/50 border border-emerald-400/30'
                : 'text-slate-400 hover:text-white hover:bg-emerald-950/40'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <span>Evaluation</span>
          </button>
        </nav>

        {/* Right Status, Theme Switcher & Reset */}
        <div className="flex items-center space-x-3">
          {/* Spa Background Theme Switcher */}
          <div className="flex items-center space-x-1 bg-slate-950/80 p-1 rounded-xl border border-emerald-500/20">
            <button
              onClick={() => setThemeMode('emerald')}
              title="Emerald Spa Theme"
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                themeMode === 'emerald' ? 'bg-emerald-800 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              🌿
            </button>
            <button
              onClick={() => setThemeMode('rose')}
              title="Rose Quartz Spa Theme"
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                themeMode === 'rose' ? 'bg-rose-800 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              🌸
            </button>
            <button
              onClick={() => setThemeMode('midnight')}
              title="Velvet Midnight Spa Theme"
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                themeMode === 'midnight' ? 'bg-indigo-900 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              🌙
            </button>
          </div>

          <button
            onClick={onReset}
            title="Reset Session Profile & Chat"
            className="flex items-center space-x-1.5 text-xs text-rose-300 hover:text-white px-3.5 py-2 rounded-xl border border-rose-500/30 hover:bg-rose-950/40 transition-all font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Profile</span>
          </button>
        </div>
      </div>
    </header>
  );
}
