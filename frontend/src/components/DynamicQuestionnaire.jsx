import React, { useState } from 'react';
import { HelpCircle, ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react';

const OPTION_ICONS = {
  oily: "💧",
  dry: "🌵",
  combination: "☯️",
  normal: "✨",
  sensitive: "🌿",
  unsure: "❓",
  "acne/breakouts": "🔴",
  dryness: "🌵",
  oiliness: "💧",
  irritation: "⚡",
  redness: "🌹",
  "uneven skin tone": "🎨",
  "dark spots": "🎯",
  "clogged pores": "🔍",
  "rough texture": "🌊",
  sensitivity: "🌿"
};

export default function DynamicQuestionnaire({ question, onAnswer }) {
  const [customInput, setCustomInput] = useState('');

  if (!question) return null;

  const handleSelect = (option) => {
    onAnswer(question.question_id, option);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (customInput.trim()) {
      onAnswer(question.question_id, customInput.trim());
      setCustomInput('');
    }
  };

  return (
    <div className="glass-card-gold p-6 rounded-3xl border border-amber-500/40 my-6 shadow-2xl animate-fade-in relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl"></div>

      <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs tracking-wider uppercase mb-2">
        <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
        <span>Adaptive Skin Profile Assessment</span>
      </div>
      
      <h3 className="text-lg font-bold text-white mb-5 tracking-tight">{question.text}</h3>

      {/* Options Grid */}
      <div className="flex flex-wrap gap-2.5 mb-5">
        {question.options.map((opt, idx) => {
          const icon = OPTION_ICONS[opt.toLowerCase()] || "✨";
          return (
            <button
              key={idx}
              onClick={() => handleSelect(opt)}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-slate-900/90 text-slate-200 hover:bg-gradient-to-r hover:from-emerald-600 hover:to-emerald-800 hover:text-white border border-emerald-500/30 hover:border-emerald-400 transition-all shadow-md flex items-center gap-2 group hover:scale-105 active:scale-95"
            >
              <span className="text-sm">{icon}</span>
              <span className="capitalize">{opt}</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-amber-400" />
            </button>
          );
        })}
      </div>

      {/* Custom Write-in option */}
      {question.allow_custom && (
        <form onSubmit={handleCustomSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Or type specific details..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-emerald-500/30 bg-slate-950/80 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
          />
          <button
            type="submit"
            disabled={!customInput.trim()}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-xl text-xs font-bold disabled:opacity-40 hover:opacity-90 transition-all shadow-md"
          >
            Submit
          </button>
        </form>
      )}
    </div>
  );
}
