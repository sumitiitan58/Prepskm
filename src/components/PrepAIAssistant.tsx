import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Flame,
  Settings,
  Bot,
  User,
  Globe,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ExternalLink,
  Cpu,
  Key,
  Radio,
  Zap,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  isScolded?: boolean;
  isGrounded?: boolean;
  sources?: Array<{ title: string; url: string }>;
  modelUsed?: string;
  timestamp: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'assistant',
    text: "Radhe Radhe! Main hoon Prep AI — official academic mentor of Prepskm by @unfiltereddsumit. Physics, Chemistry, Biology ya Maths ka koi bhi conceptual doubt pucho, ya bolo 'Hey Prep' / 'Hello Prep' aur hands-free doubt solve karo! Par dhyan rahe: faltu timepass ya procrastination kiya toh seedha reality check aur daat milegi!",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];

function playWakeChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    // Audio context may require initial user click
  }
}

export const PrepAIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [customApiKey, setCustomApiKey] = useState(localStorage.getItem('prepskm_gemini_key') || '');
  const [hasUnread, setHasUnread] = useState(false);

  // Model Selection, Search Grounding, Voice Mode & Wake Word
  const [selectedModel, setSelectedModel] = useState<'gemini-3.8-flash' | 'gemini-4-argon' | 'gemini-3.1-flash-lite'>('gemini-3.8-flash');
  const [useSearchGrounding, setUseSearchGrounding] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceAutoRead, setVoiceAutoRead] = useState(true);
  const [isWakeWordEnabled, setIsWakeWordEnabled] = useState(true);
  const [wakeStatusNotice, setWakeStatusNotice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const wakeWordRecognitionRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages]);

  // Clean speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (wakeWordRecognitionRef.current) {
        wakeWordRecognitionRef.current.abort();
      }
    };
  }, []);

  // Background Wake Word Detection ("Hey Prep" / "Hello Prep" / "He Prep")
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition || !isWakeWordEnabled) {
      if (wakeWordRecognitionRef.current) {
        try {
          wakeWordRecognitionRef.current.abort();
        } catch {}
      }
      return;
    }

    let isDestroyed = false;

    function startWakeWordListener() {
      if (isDestroyed || isListening) return;

      try {
        const recognizer = new SpeechRecognition();
        wakeWordRecognitionRef.current = recognizer;
        recognizer.continuous = false;
        recognizer.interimResults = false;
        recognizer.lang = 'en-IN'; // Will detect English and Indian accents

        recognizer.onresult = (event: any) => {
          const text = (event.results[0][0].transcript || '').toLowerCase().trim();
          console.log('[Wake Word Listener heard]:', text);

          // Check wake word triggers
          const isWakeTrigger =
            text.includes('hey prep') ||
            text.includes('hello prep') ||
            text.includes('he prep') ||
            text.includes('hi prep') ||
            text.includes('prep ai') ||
            text.includes('suno prep') ||
            text.includes('prep bhaiya');

          if (isWakeTrigger) {
            playWakeChime();
            setIsOpen(true);
            setWakeStatusNotice('Wake Word Detected! "Hello Prep" active 🎙️');
            setTimeout(() => setWakeStatusNotice(null), 3500);

            // Extract any query spoken right after wake word
            const cleanQuery = text
              .replace(/hey prep/g, '')
              .replace(/hello prep/g, '')
              .replace(/he prep/g, '')
              .replace(/hi prep/g, '')
              .replace(/prep ai/g, '')
              .replace(/suno prep/g, '')
              .trim();

            if (cleanQuery.length > 5) {
              handleSendMessage(cleanQuery);
            } else {
              // Open listening mic to take their doubt
              setTimeout(() => {
                startDirectSpeechInput();
              }, 400);
            }
          }
        };

        recognizer.onerror = () => {
          // Restart listener after brief delay
          if (!isDestroyed && isWakeWordEnabled && !isListening) {
            setTimeout(startWakeWordListener, 1200);
          }
        };

        recognizer.onend = () => {
          // Loop listener if still enabled and not active in direct mic
          if (!isDestroyed && isWakeWordEnabled && !isListening) {
            setTimeout(startWakeWordListener, 800);
          }
        };

        recognizer.start();
      } catch (err) {
        // Can fail if permissions not yet granted or already running
      }
    }

    startWakeWordListener();

    return () => {
      isDestroyed = true;
      if (wakeWordRecognitionRef.current) {
        try {
          wakeWordRecognitionRef.current.abort();
        } catch {}
      }
    };
  }, [isWakeWordEnabled, isListening]);

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('prepskm_gemini_key', customApiKey.trim());
    setShowSettings(false);
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const clean = text
      .replace(/[*#_`]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .slice(0, 350);

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) => v.lang.includes('hi') || v.lang.includes('IN') || v.name.includes('India')
    );
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const startDirectSpeechInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Please type your query.');
      return;
    }

    // Stop wake word recognizer to prevent microphone conflicts
    if (wakeWordRecognitionRef.current) {
      try {
        wakeWordRecognitionRef.current.abort();
      } catch {}
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'hi-IN'; // Supports Hinglish/Hindi & Indian English

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputMessage(transcript);
          setTimeout(() => {
            handleSendMessage(transcript);
          }, 350);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.warn('Speech recognition start note:', err);
      setIsListening(false);
    }
  };

  const toggleSpeechRecognition = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      startDirectSpeechInput();
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    stopSpeaking();

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
          model: selectedModel,
          useSearchGrounding,
          history: messages.slice(-5).map((m) => ({ sender: m.sender, text: m.text })),
          customApiKey: customApiKey.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Network error calling Prep AI endpoint');
      }

      const data = await response.json();
      const assistantText = data.reply || "Bhai, padhai par dhyan do aur doubts solve karo!";

      const isScolded =
        data.isScolded ||
        assistantText.includes('padhai par dhyan do') ||
        assistantText.includes('competition dekha hai') ||
        assistantText.includes('time waste');

      const botMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        sender: 'assistant',
        text: assistantText,
        isScolded,
        isGrounded: data.isGrounded,
        sources: data.sources,
        modelUsed: data.modelUsed || selectedModel,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      if (!isOpen) setHasUnread(true);

      // Auto-read in voice mode
      if (voiceAutoRead) {
        speakText(assistantText);
      }
    } catch (err: any) {
      console.error(err);
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
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
        {!isOpen && (
          <>
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
              <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/20 text-[10px] font-black uppercase">
                <Sparkles className="w-2.5 h-2.5" /> "Hello Prep"
              </span>
            </button>
          </>
        )}
      </div>

      {/* Slide-Up Chat Window */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 w-[94vw] sm:w-[460px] h-[630px] max-h-[88vh] rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-2xl flex flex-col overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="p-3.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-white text-sm">Prep AI Mentor</h4>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Strict Mentor by @unfiltereddsumit</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Wake Word Indicator & Toggle */}
              <button
                onClick={() => setIsWakeWordEnabled(!isWakeWordEnabled)}
                className={`p-2 rounded-xl transition text-xs flex items-center gap-1 ${
                  isWakeWordEnabled
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                title={isWakeWordEnabled ? 'Wake Word "Hello Prep" is ACTIVE' : 'Enable "Hello Prep" Wake Word'}
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span className="text-[10px] font-bold hidden sm:inline">"Hello Prep"</span>
              </button>

              {/* Voice Read Aloud Toggle */}
              <button
                onClick={() => {
                  if (isSpeaking) {
                    stopSpeaking();
                  } else {
                    setVoiceAutoRead(!voiceAutoRead);
                  }
                }}
                className={`p-2 rounded-xl transition ${
                  voiceAutoRead || isSpeaking
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title={voiceAutoRead ? 'Voice read-aloud active' : 'Enable voice read-aloud'}
              >
                {isSpeaking ? (
                  <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                ) : voiceAutoRead ? (
                  <Volume2 className="w-4 h-4 text-indigo-400" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
                title="Model & API Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  stopSpeaking();
                  setIsOpen(false);
                }}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Wake Word Notice Banner */}
          {wakeStatusNotice && (
            <div className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-between animate-fade-in shadow-md">
              <span className="flex items-center gap-1.5">
                <Radio className="w-4 h-4 animate-spin" /> {wakeStatusNotice}
              </span>
              <button onClick={() => setWakeStatusNotice(null)} className="text-white/80 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Model Selector & Search Grounding Bar */}
          <div className="px-3.5 py-2 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as any)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-200 font-semibold focus:outline-none"
              >
                <option value="gemini-3.8-flash">Gemini 3.8 Flash (Fast & Search)</option>
                <option value="gemini-4-argon">Gemini 4 Argon (Deep STEM Reasoning)</option>
                <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Rapid)</option>
              </select>
            </div>

            {/* Google Search Grounding Switch */}
            <button
              onClick={() => setUseSearchGrounding(!useSearchGrounding)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition border ${
                useSearchGrounding
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-sm'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title="Ground answers with Google Search for latest NTA notifications and syllabus"
            >
              <Globe className={`w-3 h-3 ${useSearchGrounding ? 'text-blue-400' : 'text-slate-500'}`} />
              <span>Search Grounding</span>
            </button>
          </div>

          {/* API Settings Modal overlay */}
          {showSettings && (
            <div className="p-4 bg-slate-950 border-b border-indigo-500/30 space-y-3 text-xs animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-indigo-400" /> Gemini API & Wake Word Settings
                </span>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-slate-400 text-[11px]">
                Prepskm is connected to server-side Gemini models with Google Search Grounding. Say <strong>"Hey Prep"</strong> or <strong>"Hello Prep"</strong> anytime to talk hands-free!
              </p>
              <form onSubmit={handleSaveApiKey} className="flex gap-2">
                <input
                  type="password"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  placeholder="Custom Gemini API Key: AIzaSy..."
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

                  <div className={`max-w-[84%] space-y-1`}>
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
                      
                      {msg.isGrounded && (
                        <div className="flex items-center gap-1 text-blue-400 font-semibold text-[10px] uppercase tracking-wider mb-1">
                          <Globe className="w-3 h-3" /> Grounded with Google Search
                        </div>
                      )}

                      <p className="whitespace-pre-wrap">{msg.text}</p>

                      {/* Web Grounding Sources */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-700/60 space-y-1">
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            Verified Sources:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.sources.slice(0, 3).map((src, i) => (
                              <a
                                key={i}
                                href={src.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-950 text-indigo-300 border border-slate-700 text-[10px] truncate max-w-[180px] transition"
                              >
                                <span>{src.title}</span>
                                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] text-slate-500">
                        {msg.timestamp} {msg.modelUsed ? `• ${msg.modelUsed}` : ''}
                      </span>
                      {isBot && (
                        <button
                          onClick={() => speakText(msg.text)}
                          className="text-slate-400 hover:text-indigo-400 transition"
                          title="Listen to this response"
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-indigo-400 p-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>
                  {useSearchGrounding
                    ? 'Searching Google & consulting syllabus...'
                    : 'Prep AI is formulating rigorous derivation...'}
                </span>
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
              onClick={() => handleSendMessage('What are the latest JEE Main 2026 registration dates announced by NTA?')}
              className="px-2.5 py-1 rounded-full bg-blue-900/40 hover:bg-blue-800/40 text-blue-300 border border-blue-500/30 shrink-0 flex items-center gap-1"
            >
              <Globe className="w-3 h-3" /> JEE 2026 Dates
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

          {/* Chat Input & Voice Mic */}
          <div className="p-3 bg-slate-950 border-t border-slate-800">
            {isListening && (
              <div className="mb-2 px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between animate-pulse">
                <span className="flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-rose-400 animate-spin" /> Listening... Speak doubt in Hindi or English
                </span>
                <button
                  onClick={toggleSpeechRecognition}
                  className="font-bold underline text-[11px]"
                >
                  Done
                </button>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`p-2.5 rounded-xl transition ${
                  isListening
                    ? 'bg-rose-600 text-white animate-bounce shadow-lg shadow-rose-600/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
                title={isListening ? 'Stop Listening' : 'Voice doubt input (Speech to text)'}
              >
                {isListening ? <Mic className="w-4 h-4" /> : <Mic className="w-4 h-4 text-indigo-400" />}
              </button>

              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask doubt, say 'Hello Prep', or use mic..."
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
