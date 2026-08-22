import React, { useState, useEffect } from 'react';
import { BookOpen, Tag, Sparkles, AlertTriangle, ShieldCheck, Search } from 'lucide-react';
import { fetchProducts, fetchIngredients } from '../services/api';
import ProductCard from './ProductCard';

export default function IngredientBrowser() {
  const [products, setProducts] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [activeTab, setActiveTab] = useState('ingredients');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts().then(setProducts).catch(console.error);
    fetchIngredients().then(setIngredients).catch(console.error);
  }, []);

  const filteredIngredients = ingredients.filter(i =>
    i.ingredient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = products.filter(p =>
    p.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 text-slate-100 font-sans">
      
      {/* Header & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card-dark p-6 rounded-3xl border border-emerald-500/30 shadow-2xl">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl gradient-emerald-gold flex items-center justify-center text-white shadow-xl border border-emerald-400/40">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Ingested Active Library & Catalog</h2>
            <p className="text-xs text-slate-400 font-medium">Explore evidence levels, potential uses, cautions, and formulations</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-2xl border border-emerald-500/30">
          <button
            onClick={() => setActiveTab('ingredients')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ingredients' ? 'bg-gradient-to-r from-emerald-600 to-emerald-800 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            Ingredients ({ingredients.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'products' ? 'bg-gradient-to-r from-emerald-600 to-emerald-800 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            Products ({products.length})
          </button>
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={`Search ${activeTab}...`}
          className="w-full pl-11 pr-4 py-3 bg-slate-950/80 text-xs text-white rounded-2xl border border-emerald-500/30 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
        />
        <Search className="w-4 h-4 text-emerald-400 absolute left-4 top-3.5" />
      </div>

      {/* Ingredients List View */}
      {activeTab === 'ingredients' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredIngredients.map((item, idx) => (
            <div key={idx} className="glass-card-dark p-6 rounded-3xl border border-emerald-500/30 space-y-4 hover:border-emerald-400 transition-all">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  {item.ingredient}
                </h3>
                <span className="text-[11px] font-bold bg-emerald-950 text-emerald-300 px-3 py-1 rounded-xl border border-emerald-500/30 uppercase tracking-wider">
                  {item.category}
                </span>
              </div>

              {/* Potential Uses */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Clinical Efficacy:</span>
                <ul className="space-y-1.5 text-xs text-slate-200">
                  {item.potential_uses?.map((u, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{u}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Compatible Skin Types */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Compatible Skin Types:</span>
                <div className="flex flex-wrap gap-1.5">
                  {item.skin_types?.map((st, i) => (
                    <span key={i} className="text-[10px] font-bold bg-slate-900 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 uppercase tracking-wider">
                      {st}
                    </span>
                  ))}
                </div>
              </div>

              {/* Cautions */}
              {item.cautions && item.cautions.length > 0 && (
                <div className="text-xs text-amber-200 bg-amber-950/40 p-3 rounded-2xl border border-amber-500/30 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold block mb-0.5 text-amber-300">Cautions & Usage Guidelines:</strong>
                    <span>{item.cautions.join(' ')}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Products Catalog Grid */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredProducts.map((prod, idx) => (
            <ProductCard key={prod.id || idx} product={prod} />
          ))}
        </div>
      )}
    </div>
  );
}
