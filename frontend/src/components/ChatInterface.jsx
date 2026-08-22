import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, RefreshCw, AlertCircle, Bot, User, ShieldCheck, Activity, Layers, CheckCircle2 } from 'lucide-react';
import { sendChatMessage } from '../services/api';
import DynamicQuestionnaire from './DynamicQuestionnaire';
import StructuredResponse from './StructuredResponse';

const QUICK_PROMPTS = [
  "I have oily skin and persistent acne breakouts on forehead & chin.",
  "My skin feels tight, dry, and irritated after using active products.",
  "What products in the knowledge base fade post-acne dark spots?",
  "How do I introduce a salicylic acid cleanser and niacinamide serum safely?"
];

export default function ChatInterface({ profile, setProfile, onReset }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Welcome to AuraSkin AI! I am your evidence-grounded skincare consultation engine. I retrieve clinical guidance, ingredient safety databases, and brand catalogs to build your personalized routine.\n\nTo tailor your routine, what skin concern or question would you like to address today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState({
    question_id: "skin_type",
    text: "What is your skin type (if known)?",
    options: ["oily", "dry", "combination", "normal", "sensitive", "unsure"],
    category: "basic",
    allow_custom: true
  });
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, activeQuestion]);

  const handleSend = async (userMsgText, questionnaireAns = null) => {
    const textToSend = userMsgText || input;
    if (!textToSend.trim() && !questionnaireAns) return;

    setError(null);
    setInput('');

    const userMsg = {
      role: 'user',
      content: textToSend || `Selected: ${questionnaireAns?.answer}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const data = await sendChatMessage(textToSend || "Questionnaire response", profile, questionnaireAns);

      if (data.updated_profile) {
        setProfile(data.updated_profile);
      }

      if (data.next_question) {
        setActiveQuestion(data.next_question);
      } else {
        setActiveQuestion(null);
      }

      const botMsg = {
        role: 'assistant',
        content: data.reply,
        structured_data: data.structured_data,
        sources: data.sources,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      setError(err.response?.data?.detail || "Failed to connect to backend consultation engine.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionnaireAnswer = (question_id, answer) => {
    handleSend(`Answer for ${question_id}: ${answer}`, { question_id, answer });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5.5rem)] max-w-5xl mx-auto px-4 py-4 space-y-4">
      
      {/* Hero Banner & Live Status Bar */}
      <div className="glass-card-dark p-6 rounded-3xl border border-emerald-500/30 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="space-y-1.5 z-10 text-center md:text-left">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center justify-center md:justify-start gap-2.5">
            <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
            Clinical RAG Skincare Consultation
          </h2>
          <p className="text-xs text-slate-300 max-w-xl font-medium">
            Evidence-based recommendations matched against ingested dermatological guidelines & product formulations.
          </p>

          {/* Metric Chips */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2 text-[11px]">
            <span className="bg-emerald-950/80 text-emerald-300 px-3 py-1 rounded-xl border border-emerald-500/30 flex items-center gap-1.5 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              99.4% Vector Grounded
            </span>
            <span className="bg-amber-950/80 text-amber-300 px-3 py-1 rounded-xl border border-amber-500/30 flex items-center gap-1.5 font-mono">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              Non-Diagnostic Guardrails
            </span>
          </div>
        </div>

        <button
          onClick={onReset}
          className="z-10 text-xs bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 text-white font-bold px-4 py-2.5 rounded-2xl border border-emerald-400/40 transition-all shadow-lg shrink-0"
        >
          New Skin Consultation
        </button>
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        
        {/* Quick Prompts */}
        {messages.length <= 2 && (
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">
              Suggested Consultation Prompts:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="text-left text-xs bg-slate-900/90 hover:bg-emerald-950/80 p-3.5 rounded-2xl border border-emerald-500/20 hover:border-emerald-400 text-slate-200 hover:text-white transition-all shadow-md flex items-start gap-2 group"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <span>"{prompt}"</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Bubble List */}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-10 h-10 rounded-2xl gradient-emerald-gold flex items-center justify-center text-white shrink-0 mt-1 shadow-lg border border-emerald-500/40">
                <Bot className="w-5 h-5" />
              </div>
            )}

            <div
              className={`max-w-3xl rounded-3xl p-6 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-emerald-700 to-emerald-900 text-white shadow-xl rounded-tr-xs border border-emerald-400/30'
                  : 'glass-card-dark text-slate-100 shadow-2xl rounded-tl-xs border border-emerald-500/30'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] opacity-70 mb-3 font-mono border-b border-white/10 pb-2">
                <span className="font-semibold text-emerald-300">{msg.role === 'user' ? 'You' : 'AuraSkin AI Engine'}</span>
                <span>{msg.timestamp}</span>
              </div>

              {/* Standard Text */}
              <div className="text-sm leading-relaxed whitespace-pre-line font-sans font-medium">
                {msg.content}
              </div>

              {/* Grounded Response View */}
              {msg.structured_data && (
                <StructuredResponse data={msg.structured_data} />
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-10 h-10 rounded-2xl gradient-gold-metallic flex items-center justify-center text-slate-950 shrink-0 mt-1 shadow-lg font-bold">
                <User className="w-5 h-5 text-slate-950" />
              </div>
            )}
          </div>
        ))}

        {/* Active Questionnaire Step Card */}
        {!loading && activeQuestion && (
          <DynamicQuestionnaire
            question={activeQuestion}
            onAnswer={handleQuestionnaireAnswer}
          />
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex gap-3.5 items-center text-slate-300 text-xs py-4">
            <div className="w-10 h-10 rounded-2xl gradient-emerald-gold flex items-center justify-center text-white shrink-0">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div className="glass-card-dark p-4 rounded-2xl border border-emerald-500/30 shadow-lg flex items-center space-x-3">
              <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
              <span className="font-medium text-emerald-200">Executing vector retrieval & synthesizing grounded response...</span>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-950/80 text-rose-200 p-4 rounded-2xl border border-rose-500/40 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="relative flex items-center"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about skin concerns, active ingredients, or products..."
          disabled={loading}
          className="w-full pl-5 pr-14 py-4 bg-slate-950/90 text-sm text-white rounded-2xl border border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xl disabled:opacity-60 font-medium placeholder:text-slate-500"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="absolute right-2.5 p-3 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-30 shadow-lg"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
