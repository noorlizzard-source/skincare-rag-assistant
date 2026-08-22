import React, { useState } from 'react';
import { Sun, Moon, AlertOctagon, CheckCircle2, ShieldAlert, Sparkles, BookOpen, Layers, ArrowRight } from 'lucide-react';
import ProductCard from './ProductCard';
import SourceDrawer from './SourceDrawer';

export default function StructuredResponse({ data }) {
  const [isSourceOpen, setIsSourceOpen] = useState(false);

  if (!data) return null;

  return (
    <div className="space-y-6 my-6 text-slate-100 font-sans">
      
      {/* 1. Reported Concern Summary */}
      <div className="glass-card-dark p-6 rounded-3xl border-l-4 border-l-amber-500 bg-slate-900/90 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
        
        <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Clinical Assessment Summary</span>
        </div>
        <h3 className="text-base font-bold text-white mb-3">{data.concern_summary}</h3>
        
        <div className="bg-emerald-950/60 p-4 rounded-2xl border border-emerald-500/30">
          <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            What It May Be Consistent With (Non-Diagnostic):
          </span>
          <p className="text-sm text-emerald-100 leading-relaxed font-sans">{data.consistent_with}</p>
        </div>
      </div>

      {/* 2. Personalized AM & PM Routine Timelines */}
      {(data.routine_am?.length > 0 || data.routine_pm?.length > 0) && (
        <div className="glass-card-dark p-6 rounded-3xl border border-emerald-500/30">
          <h4 className="font-bold text-lg text-white mb-6 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            Evidence-Grounded Routine Protocol
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Morning Routine Timeline */}
            {data.routine_am?.length > 0 && (
              <div className="bg-gradient-to-b from-amber-950/40 to-slate-950/80 p-5 rounded-2xl border border-amber-500/30 relative">
                <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs tracking-widest uppercase mb-4 pb-2 border-b border-amber-500/20">
                  <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
                  <span>Morning Protocol (AM)</span>
                </div>
                <div className="space-y-3.5 relative">
                  {data.routine_am.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 relative">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 text-xs font-bold flex items-center justify-center shrink-0 shadow-md mt-0.5">
                        {idx + 1}
                      </div>
                      <span className="text-xs text-amber-100 leading-relaxed font-medium">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Evening Routine Timeline */}
            {data.routine_pm?.length > 0 && (
              <div className="bg-gradient-to-b from-indigo-950/40 to-slate-950/80 p-5 rounded-2xl border border-indigo-500/30 relative">
                <div className="flex items-center space-x-2 text-indigo-300 font-bold text-xs tracking-widest uppercase mb-4 pb-2 border-b border-indigo-500/20">
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span>Evening Protocol (PM)</span>
                </div>
                <div className="space-y-3.5 relative">
                  {data.routine_pm.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 relative">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-md mt-0.5">
                        {idx + 1}
                      </div>
                      <span className="text-xs text-indigo-100 leading-relaxed font-medium">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Ingredients to Look For & What to Avoid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ingredients to Look For */}
        {data.ingredients_to_look_for?.length > 0 && (
          <div className="glass-card-dark p-6 rounded-3xl border border-emerald-500/30">
            <h5 className="font-bold text-sm text-emerald-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Target Ingredients to Incorporate
            </h5>
            <div className="space-y-3">
              {data.ingredients_to_look_for.map((ing, idx) => (
                <div key={idx} className="bg-emerald-950/50 p-3.5 rounded-2xl border border-emerald-500/30">
                  <span className="font-bold text-emerald-300 text-xs block mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    {ing.name}
                  </span>
                  <span className="text-xs text-slate-300 leading-relaxed">{ing.reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* What to Avoid */}
        {data.what_to_avoid?.length > 0 && (
          <div className="glass-card-dark p-6 rounded-3xl border border-rose-500/30">
            <h5 className="font-bold text-sm text-rose-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              Precautions & Ingredients to Avoid
            </h5>
            <ul className="space-y-2.5 text-xs text-slate-200">
              {data.what_to_avoid.map((item, idx) => (
                <li key={idx} className="bg-rose-950/40 p-3 rounded-xl border border-rose-500/30 text-rose-100 flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold text-sm">•</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 4. Suitable Products from Knowledge Base */}
      {data.recommended_products?.length > 0 && (
        <div className="glass-card-dark p-6 rounded-3xl border border-emerald-500/30">
          <h4 className="font-bold text-base text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Matched Products from Knowledge Base
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {data.recommended_products.map((prod, idx) => (
              <ProductCard key={prod.id || idx} product={prod} />
            ))}
          </div>
        </div>
      )}

      {/* 5. Safe Introduction & Medical Red Flags */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.how_to_start && (
          <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-700 text-xs">
            <strong className="text-amber-400 font-bold block mb-1.5 uppercase tracking-wider text-[11px]">
              Patch Testing & Introduction Protocol:
            </strong>
            <p className="text-slate-300 leading-relaxed">{data.how_to_start}</p>
          </div>
        )}

        {data.when_to_see_dermatologist && (
          <div className="bg-rose-950/50 p-5 rounded-2xl border border-rose-500/40 text-xs">
            <strong className="text-rose-300 font-bold flex items-center gap-1.5 mb-1.5 uppercase tracking-wider text-[11px]">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Medical Dermatologist Referral Indicators:
            </strong>
            <p className="text-rose-100 leading-relaxed">{data.when_to_see_dermatologist}</p>
          </div>
        )}
      </div>

      {/* 6. RAG Source Drawer Trigger */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-emerald-500/20">
        <p className="text-[11px] text-slate-400 italic">
          {data.disclaimer}
        </p>

        {data.sources?.length > 0 && (
          <button
            onClick={() => setIsSourceOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/50 hover:scale-105 shrink-0 border border-emerald-400/30"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Inspect {data.sources.length} RAG Source Chunks</span>
          </button>
        )}
      </div>

      {/* Source Drawer Modal */}
      <SourceDrawer
        sources={data.sources}
        isOpen={isSourceOpen}
        onClose={() => setIsSourceOpen(false)}
      />
    </div>
  );
}
