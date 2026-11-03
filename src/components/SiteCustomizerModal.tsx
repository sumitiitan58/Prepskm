import React, { useState, useEffect } from 'react';
import {
  PenTool,
  Palette,
  Type,
  Check,
  RotateCcw,
  Sparkles,
  X,
  Sliders,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { SiteCustomization } from '../types';
import { getSiteCustomization, saveSiteCustomization } from '../lib/firebase';
import { DEFAULT_SITE_CUSTOMIZATION } from '../data/initialData';

interface SiteCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomizationUpdated: (updated: SiteCustomization) => void;
}

const PRESET_PRIMARY_COLORS = [
  { name: 'Indigo Dream (Default)', color: '#4f46e5', accent: '#6366f1' },
  { name: 'Emerald Focus', color: '#059669', accent: '#10b981' },
  { name: 'Royal Violet', color: '#7c3aed', accent: '#8b5cf6' },
  { name: 'Crimson Flame', color: '#dc2626', accent: '#ef4444' },
  { name: 'Cyber Blue', color: '#0284c7', accent: '#38bdf8' },
  { name: 'Sunset Amber', color: '#d97706', accent: '#f59e0b' },
  { name: 'Midnight Slate', color: '#334155', accent: '#64748b' },
];

export const SiteCustomizerModal: React.FC<SiteCustomizerModalProps> = ({
  isOpen,
  onClose,
  onCustomizationUpdated,
}) => {
  const [formData, setFormData] = useState<SiteCustomization>(getSiteCustomization());
  const [activeTab, setActiveTab] = useState<'colors' | 'texts'>('colors');
  const [saving, setSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  useEffect(() => {
    setFormData(getSiteCustomization());
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePresetSelect = (primary: string, accent: string) => {
    const updated = { ...formData, primaryColor: primary, accentColor: accent };
    setFormData(updated);
    // Instant live preview
    document.documentElement.style.setProperty('--brand-primary', primary);
    document.documentElement.style.setProperty('--brand-accent', accent);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await saveSiteCustomization(formData);
    onCustomizationUpdated(formData);
    setSaving(false);
    setSaveNotice('Website customization saved and updated live!');
    setTimeout(() => {
      setSaveNotice(null);
      onClose();
    }, 1200);
  };

  const handleReset = () => {
    setFormData(DEFAULT_SITE_CUSTOMIZATION);
    saveSiteCustomization(DEFAULT_SITE_CUSTOMIZATION);
    onCustomizationUpdated(DEFAULT_SITE_CUSTOMIZATION);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
                  Whole Website Customizer
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[10px] border border-amber-500/20 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live color palette and copy customization across Prepskm
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 pt-3 gap-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('colors')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'colors'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Theme Colors</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('texts')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'texts'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>Website Text & Headlines</span>
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1">
          {saveNotice && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{saveNotice}</span>
            </div>
          )}

          {activeTab === 'colors' && (
            <div className="space-y-6">
              {/* Presets Grid */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                  Quick Brand Palettes
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {PRESET_PRIMARY_COLORS.map((preset) => {
                    const isSelected = formData.primaryColor === preset.color;
                    return (
                      <button
                        type="button"
                        key={preset.name}
                        onClick={() => handlePresetSelect(preset.color, preset.accent)}
                        className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div
                          className="w-6 h-6 rounded-full shrink-0 shadow-sm border border-white/20"
                          style={{ backgroundColor: preset.color }}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {preset.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">{preset.color}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Hex Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Custom Primary Brand Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.primaryColor || '#4f46e5'}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({ ...formData, primaryColor: val });
                        document.documentElement.style.setProperty('--brand-primary', val);
                      }}
                      className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300 dark:border-slate-700 p-0.5 bg-transparent"
                    />
                    <input
                      type="text"
                      value={formData.primaryColor || '#4f46e5'}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({ ...formData, primaryColor: val });
                        document.documentElement.style.setProperty('--brand-primary', val);
                      }}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Custom Accent Glow Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.accentColor || '#6366f1'}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({ ...formData, accentColor: val });
                        document.documentElement.style.setProperty('--brand-accent', val);
                      }}
                      className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300 dark:border-slate-700 p-0.5 bg-transparent"
                    />
                    <input
                      type="text"
                      value={formData.accentColor || '#6366f1'}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({ ...formData, accentColor: val });
                        document.documentElement.style.setProperty('--brand-accent', val);
                      }}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'texts' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={formData.brandName}
                  onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                  placeholder="Prepskm"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Top Micro-Banner Text
                </label>
                <input
                  type="text"
                  value={formData.bannerText}
                  onChange={(e) => setFormData({ ...formData, bannerText: e.target.value })}
                  placeholder="Founded by @unfiltereddsumit • Distraction-Free JEE & NEET Ecosystem"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Hero Headline
                </label>
                <input
                  type="text"
                  value={formData.heroHeadline}
                  onChange={(e) => setFormData({ ...formData, heroHeadline: e.target.value })}
                  placeholder="Crush Your JEE & NEET Dreams with Zero Distractions"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Hero Subtitle
                </label>
                <textarea
                  rows={2}
                  value={formData.heroSubheadline}
                  onChange={(e) => setFormData({ ...formData, heroSubheadline: e.target.value })}
                  placeholder="NTA-Style CBT Mock Tests, Backlog Destroyer, Notes Vault & 1:1 Mentorship Passes"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Platform Tagline
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="Pure Hard Work. Zero Commercial Noise."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                />
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-2 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Default</span>
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition disabled:opacity-60 active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'Applying...' : 'Save & Apply Live'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
