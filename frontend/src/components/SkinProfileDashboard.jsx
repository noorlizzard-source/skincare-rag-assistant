import React from 'react';
import { User, ShieldAlert, Sparkles, AlertOctagon, RotateCcw, Activity, CheckCircle2, Heart } from 'lucide-react';
import ProductCard from './ProductCard';

export default function SkinProfileDashboard({ profile, onReset }) {
  if (!profile) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 text-slate-100 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card-dark p-6 rounded-3xl border border-emerald-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
        
        <div className="flex items-center space-x-4 z-10">
          <div className="w-16 h-16 rounded-2xl gradient-emerald-gold flex items-center justify-center text-white shadow-xl border border-emerald-400/40">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Clinical Skin Session Profile</h2>
            <p className="text-xs text-slate-400 font-medium">Live active session profile driving RAG vector search & product filtering</p>
          </div>
        </div>

        <button
          onClick={onReset}
          className="z-10 flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-rose-700 to-rose-900 text-white rounded-2xl text-xs font-bold hover:opacity-90 transition-all border border-rose-500/40 shadow-lg"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Session Memory</span>
        </button>
      </div>

      {/* Grid of Profile Attributes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Skin Type & Concern Card */}
        <div className="glass-card-dark p-6 rounded-3xl border border-emerald-500/30 space-y-5">
          <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2 border-b border-emerald-500/20 pb-3 uppercase tracking-wider">
            <Activity className="w-4 h-4 text-emerald-400" />
            Core Diagnostics
          </h3>

          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Skin Type:</span>
            <span className="text-xs font-bold text-emerald-300 bg-emerald-950 px-3.5 py-1.5 rounded-xl border border-emerald-500/30 uppercase tracking-wider inline-block">
              {profile.skin_type || 'Unsure / Not set'}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Primary Concern:</span>
            <span className="text-xs font-bold text-amber-300 bg-amber-950 px-3.5 py-1.5 rounded-xl border border-amber-500/30 uppercase tracking-wider inline-block">
              {profile.main_concern || 'None reported'}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Sensitivity Index:</span>
            <span className={`text-xs font-bold px-3 py-1 rounded-lg uppercase ${
              profile.sensitivity === 'sensitive' ? 'bg-amber-950 text-amber-300 border border-amber-500/40' : 'bg-slate-900 text-slate-300 border border-slate-700'
            }`}>
              {profile.sensitivity || 'Normal'}
            </span>
          </div>
        </div>

        {/* Current Routine & History */}
        <div className="glass-card-dark p-6 rounded-3xl border border-emerald-500/30 space-y-5">
          <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2 border-b border-emerald-500/20 pb-3 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Active Routine Audit
          </h3>

          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Reported Routine Summary:</span>
            <p className="text-xs text-slate-200 bg-slate-950 p-3.5 rounded-2xl border border-slate-800 leading-relaxed font-mono">
              {profile.current_routine?.summary || 'No fixed routine reported yet.'}
            </p>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Recent Actives Introduced:</span>
            <span className="text-xs font-semibold text-emerald-300 bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-500/30 inline-block">
              {profile.recent_product_introduced ? 'Yes (Within last 14 days)' : 'No recent new active products'}
            </span>
          </div>
        </div>

        {/* Products to Avoid */}
        <div className="glass-card-dark p-6 rounded-3xl border border-rose-500/30 space-y-5">
          <h3 className="text-sm font-bold text-rose-300 flex items-center gap-2 border-b border-rose-500/20 pb-3 uppercase tracking-wider">
            <AlertOctagon className="w-4 h-4 text-rose-400" />
            Active Contraindications
          </h3>

          {profile.products_to_avoid && profile.products_to_avoid.length > 0 ? (
            <ul className="space-y-2.5 text-xs text-slate-200">
              {profile.products_to_avoid.map((item, idx) => (
                <li key={idx} className="bg-rose-950/50 p-3 rounded-xl border border-rose-500/30 text-rose-100 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400 italic">No specific ingredient warnings active for this session.</p>
          )}
        </div>
      </div>

      {/* Recommended Products Grid */}
      {profile.recommended_products && profile.recommended_products.length > 0 && (
        <div className="glass-card-dark p-6 rounded-3xl border border-emerald-500/30 space-y-5">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Matched Products Stored in Session Memory
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {profile.recommended_products.map((prod, idx) => (
              <ProductCard key={prod.id || idx} product={prod} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
