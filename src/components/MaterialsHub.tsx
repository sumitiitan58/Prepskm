import React, { useState } from 'react';
import {
  FileText,
  BookOpen,
  Award,
  Video,
  Download,
  Eye,
  ExternalLink,
  Play,
  X,
  Search,
  Sparkles,
  Paperclip,
} from 'lucide-react';
import { StudyMaterial, MaterialCategory, SubjectName } from '../types';

interface MaterialsHubProps {
  materials: StudyMaterial[];
  selectedMaterialFromSearch?: StudyMaterial | null;
  onClearSelectedMaterial?: () => void;
}

export const MaterialsHub: React.FC<MaterialsHubProps> = ({
  materials,
  selectedMaterialFromSearch,
  onClearSelectedMaterial,
}) => {
  const [activeCategory, setActiveCategory] = useState<MaterialCategory | 'all'>('all');
  const [selectedSubject, setSelectedSubject] = useState<'All' | SubjectName>('All');
  const [searchFilter, setSearchFilter] = useState('');

  // Active viewing item modal (for video player or PDF reader)
  const [viewingMaterial, setViewingMaterial] = useState<StudyMaterial | null>(
    selectedMaterialFromSearch || null
  );

  const categories: { id: MaterialCategory | 'all'; label: string; icon: any }[] = [
    { id: 'all', label: 'All Resources', icon: Sparkles },
    { id: 'notes', label: 'Handwritten Notes', icon: FileText },
    { id: 'formula_sheet', label: 'Formula Sheets', icon: BookOpen },
    { id: 'pyq', label: 'Previous Year PYQs', icon: Award },
    { id: 'video', label: 'Strategy & Video Lectures', icon: Video },
  ];

  const filteredMaterials = materials.filter((m) => {
    const matchesCat = activeCategory === 'all' || m.category === activeCategory;
    const matchesSub = selectedSubject === 'All' || m.subject === selectedSubject;
    const matchesSearch =
      !searchFilter ||
      m.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      m.description.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCat && matchesSub && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Subject Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {(['All', 'Physics', 'Chemistry', 'Mathematics', 'Biology'] as const).map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                selectedSubject === sub
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Search inside materials */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter title or keywords..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMaterials.map((mat) => {
          const isVideo = mat.category === 'video';
          return (
            <div
              key={mat.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition flex flex-col justify-between group shadow-sm hover:shadow-indigo-500/5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                    {mat.subject}
                  </span>
                  <span className="text-[11px] text-slate-400">{mat.classLevel}</span>
                </div>

                <h4 className="text-base font-bold text-white group-hover:text-indigo-300 transition line-clamp-2">
                  {mat.title}
                </h4>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {mat.description}
                </p>

                {mat.pdfTitle && isVideo && (
                  <div className="flex items-center gap-1.5 text-xs text-cyan-400 bg-cyan-500/10 p-2 rounded-xl border border-cyan-500/20">
                    <Paperclip className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Companion PDF: {mat.pdfTitle}</span>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {mat.downloadsCount.toLocaleString()} Aspirants Used
                </span>

                <div className="flex items-center gap-2">
                  {isVideo ? (
                    <button
                      onClick={() => setViewingMaterial(mat)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> Watch Lecture
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setViewingMaterial(mat)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                        title="Quick View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <a
                        href={mat.pdfUrl || '#'}
                        target="_blank"
                        rel="noreferrer"
                        download
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition active:scale-95"
                      >
                        <Download className="w-3.5 h-3.5" /> PDF
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Material Viewer Modal (PDF preview / Video player) */}
      {viewingMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                  {viewingMaterial.category === 'video' ? <Video className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base sm:text-lg line-clamp-1">
                    {viewingMaterial.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {viewingMaterial.subject} • {viewingMaterial.classLevel}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setViewingMaterial(null);
                  if (onClearSelectedMaterial) onClearSelectedMaterial();
                }}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Display */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
              {viewingMaterial.category === 'video' && viewingMaterial.videoUrl ? (
                <div className="space-y-4">
                  <div className="rounded-2xl overflow-hidden border border-slate-800 aspect-video bg-black flex items-center justify-center">
                    <video
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                      src={viewingMaterial.videoUrl}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                    <h5 className="font-bold text-white text-sm mb-1">Lecture Breakdown</h5>
                    <p className="text-xs text-slate-300 leading-relaxed">{viewingMaterial.description}</p>
                  </div>
                  {viewingMaterial.pdfUrl && (
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                      <div className="flex items-center gap-2.5">
                        <Paperclip className="w-4 h-4 text-indigo-400" />
                        <div>
                          <p className="text-sm font-bold text-white">
                            {viewingMaterial.pdfTitle || 'Companion Lecture Notes'}
                          </p>
                          <p className="text-xs text-slate-400">PDF notes curated for this video session</p>
                        </div>
                      </div>
                      <a
                        href={viewingMaterial.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <Download className="w-3.5 h-3.5" /> Download Notes
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                /* PDF Document Reader View */
                <div className="space-y-4">
                  <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">{viewingMaterial.title}</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-lg mx-auto">
                        {viewingMaterial.description}
                      </p>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                      <a
                        href={viewingMaterial.pdfUrl || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition"
                      >
                        <ExternalLink className="w-4 h-4" /> Open Fullscreen PDF
                      </a>
                      <a
                        href={viewingMaterial.pdfUrl || '#'}
                        download
                        className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 border border-slate-700 transition"
                      >
                        <Download className="w-4 h-4" /> Download PDF File
                      </a>
                    </div>
                  </div>

                  {/* Embedded PDF iframe preview */}
                  {viewingMaterial.pdfUrl && (
                    <div className="rounded-2xl overflow-hidden border border-slate-800 h-[450px] bg-slate-950">
                      <iframe
                        src={`${viewingMaterial.pdfUrl}#toolbar=0`}
                        title={viewingMaterial.title}
                        className="w-full h-full border-none"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
