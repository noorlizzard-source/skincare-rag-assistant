import React from 'react';
import { Tag, AlertTriangle, Sparkles, BookOpen, ShieldCheck } from 'lucide-react';

export default function ProductCard({ product }) {
  if (!product) return null;

  return (
    <div className="glass-card-dark p-5 rounded-3xl border border-emerald-500/30 hover:border-emerald-400 transition-all flex flex-col justify-between group hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]">
      <div>
        {/* Product Image Container */}
        {product.image_url && (
          <div className="relative w-full h-44 rounded-2xl overflow-hidden mb-4 border border-emerald-500/20 group-hover:border-emerald-400/50 transition-all">
            <img
              src={product.image_url}
              alt={product.product}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
            
            {/* Top Match Badge */}
            <div className="absolute top-2.5 right-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-slate-950" />
              98% Skin Match
            </div>

            {/* Category Tag */}
            <div className="absolute bottom-2.5 left-2.5 bg-slate-900/80 backdrop-blur-md text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold px-2.5 py-0.5 rounded-lg flex items-center gap-1">
              <Tag className="w-3 h-3 text-emerald-400" />
              {product.category}
            </div>
          </div>
        )}

        {/* Brand & Title */}
        <div className="mb-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400 block mb-0.5">
            {product.brand}
          </span>
          <h4 className="font-bold text-white text-base group-hover:text-emerald-300 transition-colors leading-snug">
            {product.product}
          </h4>
        </div>

        {/* Why Suitable Box */}
        <p className="text-xs text-emerald-100 bg-emerald-950/70 p-3 rounded-2xl border border-emerald-500/30 mb-3 leading-relaxed">
          <strong className="text-emerald-300 font-semibold flex items-center gap-1.5 mb-1 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Evidence-Grounded Match:
          </strong>
          {product.why_suitable}
        </p>

        {/* Ingredients List */}
        {product.ingredients && product.ingredients.length > 0 && (
          <div className="mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Key Actives:</span>
            <div className="flex flex-wrap gap-1.5">
              {product.ingredients.map((ing, idx) => (
                <span key={idx} className="text-[11px] bg-slate-900/80 text-slate-300 px-2.5 py-1 rounded-xl border border-slate-700 font-medium">
                  {ing}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Cautions Alert */}
        {product.cautions && product.cautions.length > 0 && (
          <div className="text-[11px] text-amber-200 bg-amber-950/40 p-2.5 rounded-xl border border-amber-500/30 flex items-start gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{product.cautions.join(' ')}</span>
          </div>
        )}
      </div>

      {/* Source Citation */}
      {product.source && (
        <div className="pt-3 border-t border-emerald-500/20 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span className="flex items-center gap-1.5 text-slate-400">
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            Source: {product.source}
          </span>
        </div>
      )}
    </div>
  );
}
