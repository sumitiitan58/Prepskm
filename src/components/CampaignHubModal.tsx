import React, { useState } from 'react';
import { X, Copy, Check, Youtube, Instagram, Send, Sparkles, Megaphone } from 'lucide-react';

interface CampaignHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CampaignHubModal: React.FC<CampaignHubModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'youtube' | 'reel' | 'telegram'>('youtube');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const youtubeScript = `TITLE: Maine banaya India ka sabse disciplined JEE & NEET study platform! (Prepskm Launch)

[HOOK - 0:00 to 0:30]
"Bhai agar tum JEE ya NEET ke aspirant ho aur backlog ki wajah se darr lag raha hai, toh yeh video tumhari prep badalne wala hai. Aaj main introduce kar raha hoon Prepskm — purely distraction-free study platform founded by me @unfiltereddsumit!"

[CORE FEATURES - 0:30 to 2:30]
1. "Isme tumhe milta hai real NTA-pattern CBT Mock Test Engine — Physics, Chemistry, Maths, Bio with exactly 20% numerical ratio and standard countdown timer."
2. "Handwritten Notes, PYQs, Formula Sheets in clean PDF."
3. "Strategy Video Lectures with downloadable companion PDF notes."
4. "Hamara apna 'Prep AI' — doubts solve karega aur agar timepass karoge toh real mentor ki tarah daat lagayega!"
5. "1:1 Personal Mentorship at flat ₹5 per minute with instant verified token pass!"

[CALL TO ACTION - 2:30 to 3:00]
"Link description mein hai, Telegram channel @prepskm join karo aur direct queries ke liye chat karo @unfiltreddsumit par! Ab padhai shuru karo, no more excuses!"`;

  const reelScript = `AUDIO / VOICEOVER:
"JEE aur NEET aspirants, suno! 🚨
Backlog kab tak taaloge?
Launching Prepskm by @unfiltereddsumit!
🔹 Real NTA CBT Mock Tests (Exact timer & 20% numerical ratio)
🔹 Chapter-wise Notes & Formula Sheets in PDF
🔹 1:1 Personal Mentorship at flat ₹5/minute via UPI
🔹 Aur 'Prep AI' jo padhai ke beech time waste karne par seedha daat lagayega!
Link bio mein hai. Telegram channel join karo: @prepskm!"`;

  const telegramPost = `🚀 ANNOUNCING THE OFFICIAL LAUNCH OF PREPSKM! 🚀

Aspirants, tumhari JEE/NEET aur Boards prep ko track pe laane ke liye Prepskm is finally live! 🔥

🌟 What you get on Prepskm:
1️⃣ NTA-Style CBT Mock Tests: Practice with real timer, question palette, and 20% numericals!
2️⃣ Free Resources Vault: Class-wise Notes, Formula Sheets, and Chapter PYQs in PDF.
3️⃣ Backlog Destroyer: Interactive daily targets and streak tracker.
4️⃣ 1:1 Personal Mentorship: Direct call with mentors at flat ₹5/minute! Instant digital token verification.
5️⃣ Prep AI: Our in-house Gemini-powered AI tutor that solves conceptual doubts and scolds you if you procrastinate!

🔗 Website Link: [Visit Prepskm]
📢 Telegram Channel: @prepskm
💬 Personal Chat & Mentorship: @unfiltreddsumit
📺 YouTube & Instagram: @unfiltereddsumit

Padhai shuru karo, ab koi bahaana nahi chalega! 💥`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Creator Launch & Promotional Scripts</h3>
              <p className="text-xs text-slate-400">Official scripts for @unfiltereddsumit & @prepskm</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="p-3 bg-slate-950 flex items-center gap-2 border-b border-slate-800 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('youtube')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition shrink-0 ${
              activeTab === 'youtube' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Youtube className="w-4 h-4" /> YouTube Launch Video
          </button>
          <button
            onClick={() => setActiveTab('reel')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition shrink-0 ${
              activeTab === 'reel' ? 'bg-gradient-to-r from-pink-500 to-amber-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Instagram className="w-4 h-4" /> 30s Reel / Shorts
          </button>
          <button
            onClick={() => setActiveTab('telegram')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition shrink-0 ${
              activeTab === 'telegram' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Send className="w-4 h-4" /> Telegram Launch Post
          </button>
        </div>

        {/* Content Box */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              {activeTab === 'youtube'
                ? 'Full YouTube Script with Hooks'
                : activeTab === 'reel'
                ? '30-Second Fast-Paced Reel Voiceover'
                : 'Official Telegram Broadcast Announcement'}
            </span>

            <button
              onClick={() => {
                const text = activeTab === 'youtube' ? youtubeScript : activeTab === 'reel' ? reelScript : telegramPost;
                handleCopy(text, activeTab);
              }}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition"
            >
              {copiedKey === activeTab ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedKey === activeTab ? 'Copied Script!' : 'Copy Script'}
            </button>
          </div>

          <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono whitespace-pre-wrap leading-relaxed select-all">
            {activeTab === 'youtube' && youtubeScript}
            {activeTab === 'reel' && reelScript}
            {activeTab === 'telegram' && telegramPost}
          </pre>
        </div>
      </div>
    </div>
  );
};
