import React from 'react';
import { X, BookOpen, Layers, CheckCircle } from 'lucide-react';

export default function SourceDrawer({ sources, isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-slide-left">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-rose-100 flex items-center justify-between gradient-sage text-white">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5" />
            <div>
              <h3 className="font-semibold text-base">Retrieved Evidence Sources</h3>
              <p className="text-xs text-sage-100">Grounded Knowledge Chunks Used for Generation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sources List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-rose-50/30">
          {!sources || sources.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              No specific retrieved source documents recorded.
            </div>
          ) : (
            sources.map((src, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-rose-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-xs text-sage-900 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-sage-500" />
                    {src.title}
                  </span>
                  <span className="text-[11px] font-medium bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {(src.score * 100).toFixed(0)}% Match
                  </span>
                </div>
                
                <p className="text-xs text-slate-600 font-mono bg-slate-50 p-3 rounded-lg border border-slate-200/60 whitespace-pre-wrap leading-relaxed">
                  "{src.snippet}"
                </p>

                <div className="mt-2 text-[10px] text-slate-400 font-sans">
                  Source: {src.source}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-rose-100 bg-white text-center text-xs text-slate-500">
          Strict RAG Grounding Applied • Unverified external claims filtered out.
        </div>
      </div>
    </div>
  );
}
