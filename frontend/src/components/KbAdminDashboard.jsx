import React, { useState, useEffect } from 'react';
import { Upload, Database, Search, Trash2, Layers, CheckCircle2, FileText, RefreshCw, Cpu, Code, Lock, Key, LogOut, ShieldCheck, AlertCircle } from 'lucide-react';
import { fetchKbStats, uploadDocument, searchKb, deleteDocument, adminLogin, verifyAdminToken, removeStoredAdminToken } from '../services/api';

export default function KbAdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [stats, setStats] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    checkAdminSession();
  }, []);

  const checkAdminSession = async () => {
    setCheckingAuth(true);
    try {
      const res = await verifyAdminToken();
      if (res.valid) {
        setIsAuthenticated(true);
        loadStats();
      } else {
        setIsAuthenticated(false);
      }
    } catch (e) {
      setIsAuthenticated(false);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError(null);
    setLoggingIn(true);

    try {
      const res = await adminLogin(usernameInput, passwordInput);
      if (res.token) {
        setIsAuthenticated(true);
        loadStats();
      }
    } catch (err) {
      console.error("Login error:", err);
      setLoginError(err.response?.data?.detail || "Invalid admin username or password.");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    removeStoredAdminToken();
    setIsAuthenticated(false);
    setUsernameInput('');
    setPasswordInput('');
  };

  const loadStats = async () => {
    try {
      const data = await fetchKbStats();
      setStats(data);
    } catch (e) {
      console.error("Failed to load KB stats:", e);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    try {
      const res = await uploadDocument(file);
      setMessage({ type: 'success', text: `Successfully ingested "${res.filename}" (${res.created_chunks} vector chunks indexed).` });
      await loadStats();
    } catch (err) {
      console.error("Upload error:", err);
      setMessage({ type: 'error', text: err.response?.data?.detail || "Document upload failed." });
    } finally {
      setUploading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const res = await searchKb(searchQuery.trim());
      setSearchResults(res);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setSearching(false);
    }
  };

  const handleDelete = async (docTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${docTitle}" from the vector store?`)) return;

    try {
      await deleteDocument(docTitle);
      setMessage({ type: 'success', text: `Deleted document "${docTitle}".` });
      await loadStats();
      setSearchResults([]);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-300 text-xs">
        <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin mr-2" />
        <span>Verifying Admin Authorization Status...</span>
      </div>
    );
  }

  // 🔒 Admin Login Screen Modal if not logged in
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-slate-100 font-sans">
        <div className="glass-card-gold p-8 rounded-3xl border border-amber-500/40 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl"></div>

          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl gradient-emerald-gold flex items-center justify-center text-amber-400 mx-auto shadow-xl border border-amber-400/30">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">RAG Admin Access Portal</h2>
            <p className="text-xs text-slate-300 font-medium">Restricted Area: Knowledge Base & Vector Index Management</p>
          </div>

          {loginError && (
            <div className="bg-rose-950/80 text-rose-200 p-3.5 rounded-2xl border border-rose-500/40 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                Admin Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Enter admin username"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 text-xs text-white rounded-2xl border border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
                <Key className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 text-xs text-white rounded-2xl border border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
                <Lock className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-700 text-slate-950 font-black rounded-2xl hover:opacity-90 transition-all text-xs tracking-wider uppercase shadow-xl flex items-center justify-center gap-2 border border-amber-400/40"
            >
              {loggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-slate-950" />
                  <span>Authenticate Admin Session</span>
                </>
              )}
            </button>
          </form>

          {/* Credentials Hint Box */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-emerald-500/20 text-[11px] text-slate-400 space-y-1">
            <span className="font-bold text-amber-400 block uppercase tracking-wider text-[10px]">Demo Admin Credentials:</span>
            <div className="font-mono text-slate-300">
              Username: <strong className="text-emerald-300">admin</strong>
            </div>
            <div className="font-mono text-slate-300">
              Password: <strong className="text-emerald-300">skincare-admin-2026</strong>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Authenticated RAG Admin Dashboard
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 text-slate-100 font-sans">
      
      {/* Header & Control Center Stats */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card-dark p-6 rounded-3xl border border-emerald-500/30 shadow-2xl">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl gradient-emerald-gold flex items-center justify-center text-white shadow-xl border border-emerald-400/40">
              <Cpu className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                RAG Control Center
                <span className="text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full uppercase">Authenticated</span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">Ingest documents, manage vector store, inspect chunks & test vector retrieval</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2.5 bg-rose-950/80 text-rose-300 hover:text-white rounded-2xl text-xs font-bold border border-rose-500/40 transition-all shadow-lg hover:bg-rose-900"
          >
            <LogOut className="w-4 h-4" />
            <span>Lock Admin Session</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
          <div className="glass-card-dark p-5 rounded-3xl border border-emerald-500/30">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Indexed Documents</span>
            <span className="text-3xl font-extrabold text-white">{stats?.total_documents || 0}</span>
          </div>

          <div className="glass-card-dark p-5 rounded-3xl border border-emerald-500/30">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Vector Chunks</span>
            <span className="text-3xl font-extrabold text-emerald-400">{stats?.total_chunks || 0}</span>
          </div>

          <div className="glass-card-dark p-5 rounded-3xl border border-emerald-500/30">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Vector Dimensions</span>
            <span className="text-3xl font-extrabold text-amber-400">{stats?.vector_dimension || 384}</span>
          </div>

          <div className="glass-card-dark p-5 rounded-3xl border border-emerald-500/30">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Status</span>
            <span className="text-xs font-bold text-emerald-300 bg-emerald-950 px-3 py-1 rounded-xl border border-emerald-500/30 inline-block mt-1">
              Vector Index Online
            </span>
          </div>
        </div>
      </div>

      {/* Document Ingestion Drag & Drop */}
      <div className="glass-card-dark p-6 rounded-3xl border border-emerald-500/30 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Upload className="w-5 h-5 text-emerald-400" />
          Ingest Knowledge Document (PDF, TXT, Markdown, CSV, JSON)
        </h3>

        <label className="border-2 border-dashed border-emerald-500/40 hover:border-emerald-400 bg-slate-950/60 hover:bg-slate-900/80 p-8 rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all">
          <FileText className="w-12 h-12 text-emerald-400 mb-3 opacity-90 animate-pulse" />
          <span className="text-sm font-bold text-white">Click or drag document to ingest & chunk</span>
          <span className="text-xs text-slate-400 mt-1">Parses text, preserves metadata, generates n-gram vector embeddings automatically</span>
          <input
            type="file"
            accept=".pdf,.txt,.md,.markdown,.csv,.json"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>

        {uploading && (
          <div className="flex items-center space-x-3 text-xs text-emerald-300 bg-emerald-950/80 p-4 rounded-2xl border border-emerald-500/30">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
            <span>Chunking document, extracting metadata, and calculating vector embeddings...</span>
          </div>
        )}

        {message && (
          <div className={`p-4 rounded-2xl text-xs flex items-center gap-2 ${
            message.type === 'success' ? 'bg-emerald-950 text-emerald-200 border border-emerald-500/40' : 'bg-rose-950 text-rose-200 border border-rose-500/40'
          }`}>
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message.text}</span>
          </div>
        )}
      </div>

      {/* Indexed Document List */}
      <div className="glass-card-dark p-6 rounded-3xl border border-emerald-500/30 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-400" />
          Active Ingested Knowledge Documents
        </h3>

        {!stats?.document_titles || stats.document_titles.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No documents indexed yet.</p>
        ) : (
          <div className="divide-y divide-emerald-500/10">
            {stats.document_titles.map((doc, idx) => (
              <div key={idx} className="py-3.5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-semibold text-white">{doc}</span>
                </div>
                <button
                  onClick={() => handleDelete(doc)}
                  className="text-xs text-rose-400 hover:text-white px-3 py-1.5 rounded-xl hover:bg-rose-950/80 transition-all flex items-center gap-1.5 border border-rose-500/30"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Document</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Vector Retrieval Playground & Chunk Inspector */}
      <div className="glass-card-dark p-6 rounded-3xl border border-emerald-500/30 space-y-5">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Search className="w-5 h-5 text-amber-400" />
          Vector Retrieval Playground & Chunk Inspector
        </h3>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Test query (e.g. Salicylic acid clogged pores acne)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-3 bg-slate-950 border border-emerald-500/40 rounded-2xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="submit"
            disabled={searching || !searchQuery.trim()}
            className="px-6 py-3 gradient-emerald-gold text-white text-xs font-bold rounded-2xl hover:opacity-90 disabled:opacity-40 shadow-lg border border-emerald-400/30"
          >
            {searching ? 'Searching...' : 'Run Vector Search'}
          </button>
        </form>

        {/* Results List */}
        <div className="space-y-4 mt-4">
          {searchResults.map((res, idx) => (
            <div key={idx} className="bg-slate-950 p-5 rounded-2xl border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-300 flex items-center gap-2">
                  <Code className="w-4 h-4 text-amber-400" />
                  Chunk #{idx+1} ({res.metadata?.source || 'Doc'})
                </span>
                <span className="bg-emerald-950 text-emerald-300 font-mono px-3 py-1 rounded-full font-bold border border-emerald-500/40">
                  Similarity Score: {(res.score * 100).toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono bg-slate-900 p-4 rounded-xl border border-slate-800 leading-relaxed whitespace-pre-wrap">
                {res.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
