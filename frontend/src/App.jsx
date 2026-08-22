import React, { useState } from 'react';
import Navbar from './components/Navbar';
import ChatInterface from './components/ChatInterface';
import SkinProfileDashboard from './components/SkinProfileDashboard';
import IngredientBrowser from './components/IngredientBrowser';
import KbAdminDashboard from './components/KbAdminDashboard';
import RagEvalSuite from './components/RagEvalSuite';
import { resetUserProfile } from './services/api';
import { Sparkles, Droplets, Leaf } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [themeMode, setThemeMode] = useState('emerald'); // emerald, rose, midnight
  
  const [profile, setProfile] = useState({
    age_range: 'unsure',
    skin_type: 'unsure',
    main_concern: null,
    secondary_concerns: [],
    sensitivity: 'normal',
    current_routine: {},
    recent_product_introduced: false,
    reported_triggers: [],
    previous_answers: {},
    recommended_products: [],
    products_to_avoid: [],
    conversation_history: []
  });

  const handleResetSession = async () => {
    try {
      const freshProfile = await resetUserProfile();
      setProfile(freshProfile);
    } catch (e) {
      console.error("Reset profile error:", e);
      setProfile({
        age_range: 'unsure',
        skin_type: 'unsure',
        main_concern: null,
        secondary_concerns: [],
        sensitivity: 'normal',
        current_routine: {},
        recent_product_introduced: false,
        reported_triggers: [],
        previous_answers: {},
        recommended_products: [],
        products_to_avoid: [],
        conversation_history: []
      });
    }
  };

  const getThemeBackgroundClass = () => {
    if (themeMode === 'rose') return 'bg-skincare-rose';
    if (themeMode === 'midnight') return 'bg-skincare-midnight';
    return 'bg-skincare-spa'; // default emerald
  };

  return (
    <div className={`min-h-screen ${getThemeBackgroundClass()} relative flex flex-col font-sans transition-all duration-700 overflow-x-hidden`}>
      
      {/* 🌿 Floating Botanical & Moisture Cell Orbs in Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Floating Eucalyptus Leaf Orb */}
        <div className="absolute top-1/4 left-10 w-24 h-24 text-emerald-400/20 animate-float-slow opacity-60">
          <Leaf className="w-full h-full transform -rotate-45" />
        </div>

        {/* Floating Water Droplet Orb */}
        <div className="absolute top-2/3 right-16 w-20 h-20 text-teal-300/25 animate-float-reverse opacity-70">
          <Droplets className="w-full h-full" />
        </div>

        {/* Glowing Gold Sparkle Orb */}
        <div className="absolute top-1/2 left-1/3 w-16 h-16 text-amber-400/20 animate-pulse opacity-50">
          <Sparkles className="w-full h-full" />
        </div>

        {/* Soft Ambient Light Gradient Orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 left-1/4 w-[30rem] h-[30rem] bg-teal-600/15 rounded-full blur-3xl"></div>
      </div>

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        onReset={handleResetSession}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 z-10 relative">
        {activeTab === 'chat' && (
          <ChatInterface
            profile={profile}
            setProfile={setProfile}
            onReset={handleResetSession}
          />
        )}

        {activeTab === 'profile' && (
          <SkinProfileDashboard
            profile={profile}
            onReset={handleResetSession}
          />
        )}

        {activeTab === 'catalog' && (
          <IngredientBrowser />
        )}

        {activeTab === 'admin' && (
          <KbAdminDashboard />
        )}

        {activeTab === 'eval' && (
          <RagEvalSuite />
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-emerald-500/20 bg-slate-950/80 backdrop-blur-md text-center text-xs text-slate-400 z-10 relative">
        AuraSkin RAG AI Assistant • Evidence-Grounded Dermatological Engine • Medical Boundaries Enforced
      </footer>
    </div>
  );
}
