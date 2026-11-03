import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Flame,
  Settings,
  ShieldAlert,
  Bot,
  User,
  RotateCcw,
  Key,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  isScolded?: boolean;
  timestamp: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'assistant',
    text: "Radhe Radhe! Main hoon Prep AI — official academic mentor of Prepskm by @unfiltereddsumit. Physics, Chemistry, Biology ya Maths ka koi bhi conceptual doubt pucho. Par dhyan rahe: faltu timepass ya procrastination kiya toh seedha reality check aur daat milegi!",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];

export const PrepAIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [customApiKey, setCustomApiKey] = useState(localStorage.getItem('prepskm_gemini_key') || '');
  const [hasUnread, setHasUnread] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages]);

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('prepskm_gemini_key', customApiKey.trim());
    setShowSettings(false);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/prep-ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-5).map((m) => ({ sender: m.sender, text: m.text })),
          customApiKey: customApiKey.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Network error calling Prep AI endpoint');
      }

      const data = await response.json();
      const assistantText = data.reply || "Bhai, padhai par dhyan do aur doubts solve karo!";

      // Check if scolding keywords are triggered in reply
      const isScolded =
        assistantText.includes('padhai par dhyan do') ||
        assistantText.includes('competition dekha hai') ||
        assistantText.includes('time waste');

      const botMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        sender: 'assistant',
        text: assistantText,
        isScolded,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      if (!isOpen) setHasUnread(true);
    } catch (err: any) {
      console.error(err);
      // Realistic fallback scolding or answer if offline
      let fallback = "Bhai, network issue hai, lekin reality check sun lo: NEET/JEE ke din count down ho rahe hain! Backlog tracker kholo aur agle 2 ghante phone side rakh kar padhai karo!";
      if (text.toLowerCase().includes('mann nahi') || text.toLowerCase().includes('kal se')) {
        fallback = "Arey padhai par dhyan do! NEET/JEE ka competition dekha hai? Lakhon bacche din-raat padh rahe hain aur tum yahan faltu baaton me time waste kar rahe ho? Phone side rakho aur agle 2 ghante padho!";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: 'bot-' + Date.now(),
          sender: 'assistant',
          text: fallback,
          isScolded: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Widget Toggle Bubble */}
      <div className="fixed bottom-5 right-5 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-2xl shadow-indigo-500/40 border border-indigo-400/30 transition transform hover:scale-105 active:scale-95"
          >
            <div className="relative">
              <Bot className="w-5 h-5 text-indigo-200" />
              {hasUnread && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
              )}
            </div>
            <span>Prep AI Mentor</span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white/20 text-[10px] font-black uppercase">
              Sumit AI
            </span>
          </button>
        )}
      </div>

      {/* Slide-Up Chat Window */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 w-[94vw] sm:w-[420px] h-[580px] max-h-[85vh] rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-2xl flex flex-col overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-white text-sm">Prep AI Mentor</h4>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                    Live
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Strict Mentor by @unfiltereddsumit</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
                title="API Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* API Settings Modal overlay */}
          {showSettings && (
            <div className="p-4 bg-slate-950 border-b border-indigo-500/30 space-y-3 text-xs animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-indigo-400" /> Google AI Studio Gemini API Key
                </span>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-slate-400 text-[11px]">
                Prepskm is already connected to server-side Gemini. You can optionally enter your own personal key from Google AI Studio.
              </p>
              <form onSubmit={handleSaveApiKey} className="flex gap-2">
                <input
                  type="password"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs"
                >
                  Save
                </button>
              </form>
            </div>
          )}

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {messages.map((msg) => {
              const isBot = msg.sender === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isBot ? '' : 'flex-row-reverse'}`}
                >
                  {isBot ? (
                    <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-[82%] space-y-1`}>
                    <div
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isBot
                          ? msg.isScolded
                            ? 'bg-rose-950/40 border border-rose-500/40 text-rose-200 shadow-md'
                            : 'bg-slate-800/80 border border-slate-700/60 text-slate-100'
                          : 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/20'
                      }`}
                    >
                      {msg.isScolded && (
                        <div className="flex items-center gap-1.5 text-rose-400 font-bold text-[10px] uppercase tracking-wider mb-1.5">
                          <Flame className="w-3.5 h-3.5" /> Strict Reality Check
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    <span className="text-[10px] text-slate-500 px-1 block">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-indigo-400 p-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Prep AI is evaluating your query...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-1.5 bg-slate-950/60 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px] whitespace-nowrap">
            <button
              onClick={() => handleSendMessage('Bhai padhai me mann nahi lag raha, kya karu?')}
              className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 shrink-0"
            >
              "Mann nahi lag raha..."
            </button>
            <button
              onClick={() => handleSendMessage('Explain King\'s property of definite integrals with proof')}
              className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 shrink-0"
            >
              King's Property
            </button>
            <button
              onClick={() => handleSendMessage('How to solve projectile maximum height derivation?')}
              className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 shrink-0"
            >
              Projectile Formula
            </button>
          </div>

          {/* Chat Input */}
          <div className="p-3 bg-slate-950 border-t border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask Physics, Chem, Bio, Maths doubts..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || loading}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition disabled:opacity-40 shadow-md shadow-indigo-600/30"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
