import React, { useState, useEffect } from 'react';
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
  Plus,
  Upload,
  FolderPlus,
  Film,
  CheckCircle,
} from 'lucide-react';
import { StudyMaterial, MaterialCategory, SubjectName, CustomSection } from '../types';
import {
  getCustomSections,
  saveCustomSection,
  saveMaterialToFirestore,
} from '../lib/firebase';

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
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<'All' | SubjectName>('All');
  const [searchFilter, setSearchFilter] = useState('');
  const [customSections, setCustomSections] = useState<CustomSection[]>(getCustomSections());

  // Active viewing item modal (for video player or PDF reader)
  const [viewingMaterial, setViewingMaterial] = useState<StudyMaterial | null>(
    selectedMaterialFromSearch || null
  );

  // Modal for creating a new custom section
  const [showNewSectionModal, setShowNewSectionModal] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');

  // Modal for direct PDF / MP4 File Upload
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadSubject, setUploadSubject] = useState<SubjectName>('Physics');
  const [uploadClassLevel, setUploadClassLevel] = useState('Class 12 / JEE');
  const [uploadSection, setUploadSection] = useState('notes');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadedFileDataUrl, setUploadedFileDataUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileType, setUploadedFileType] = useState<'pdf' | 'mp4' | 'other'>('pdf');
  const [companionPdfTitle, setCompanionPdfTitle] = useState('');
  const [companionPdfUrl, setCompanionPdfUrl] = useState('');
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  useEffect(() => {
    const handleSectionsUpdate = () => {
      setCustomSections(getCustomSections());
    };
    window.addEventListener('prepskm_sections_updated', handleSectionsUpdate);
    return () => {
      window.removeEventListener('prepskm_sections_updated', handleSectionsUpdate);
    };
  }, []);

  // Compute all unique section tabs combining default categories, custom sections, and any category found in materials
  const standardCategories: { id: string; label: string; icon: any }[] = [
    { id: 'all', label: 'All Resources', icon: Sparkles },
    { id: 'notes', label: 'Handwritten Notes', icon: FileText },
    { id: 'formula_sheet', label: 'Formula Sheets', icon: BookOpen },
    { id: 'pyq', label: 'Previous Year PYQs', icon: Award },
    { id: 'video', label: 'Video Lectures', icon: Video },
  ];

  // Merge custom sections + dynamically detected custom categories from materials
  const extraCategories = new Map<string, string>();
  customSections.forEach((cs) => {
    extraCategories.set(cs.id, cs.name);
  });
  materials.forEach((m) => {
    if (!['all', 'notes', 'formula_sheet', 'pyq', 'video'].includes(m.category)) {
      if (!extraCategories.has(m.category)) {
        extraCategories.set(m.category, m.category);
      }
    }
  });

  const allCategoryTabs = [
    ...standardCategories,
    ...Array.from(extraCategories.entries()).map(([id, name]) => ({
      id,
      label: name,
      icon: name.toLowerCase().includes('video') ? Video : FileText,
    })),
  ];

  const handleCreateSectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSectionName.trim();
    if (!trimmed) return;
    const sec = saveCustomSection(trimmed);
    setCustomSections(getCustomSections());
    setActiveCategory(sec.id);
    setNewSectionName('');
    setShowNewSectionModal(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const isVideo = file.type.includes('video') || file.name.endsWith('.mp4');
    const isPdf = file.type.includes('pdf') || file.name.endsWith('.pdf');
    setUploadedFileType(isVideo ? 'mp4' : isPdf ? 'pdf' : 'other');

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUploadedFileDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePublishUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) return;

    const isVideo = uploadedFileType === 'mp4' || uploadSection === 'video';
    const finalPdfUrl = uploadedFileType === 'pdf' ? (uploadedFileDataUrl || '') : (companionPdfUrl || '');

    const newMat: StudyMaterial = {
      id: 'mat-' + Date.now(),
      title: uploadTitle.trim(),
      category: uploadSection,
      subject: uploadSubject,
      classLevel: uploadClassLevel,
      pdfUrl: finalPdfUrl,
      pdfTitle: companionPdfTitle.trim() || undefined,
      videoUrl: isVideo ? (uploadedFileDataUrl || '') : undefined,
      fileData: uploadedFileDataUrl || undefined,
      fileName: uploadedFileName || undefined,
      fileType: uploadedFileType,
      description: uploadDescription.trim() || 'Uploaded study file ready for download & study.',
      downloadsCount: 1,
      createdAt: new Date().toISOString(),
    };

    await saveMaterialToFirestore(newMat);
    setUploadNotice(`File published to section "${uploadSection}" successfully!`);
    setTimeout(() => {
      setUploadNotice(null);
      setShowUploadModal(false);
      // Reset form
      setUploadTitle('');
      setUploadDescription('');
      setUploadedFileDataUrl(null);
      setUploadedFileName(null);
      setCompanionPdfTitle('');
      setCompanionPdfUrl('');
    }, 1200);
  };

  const filteredMaterials = materials.filter((m) => {
    const matchesCat =
      activeCategory === 'all' ||
      m.category === activeCategory ||
      (extraCategories.has(activeCategory) && m.category.toLowerCase() === extraCategories.get(activeCategory)?.toLowerCase());

    const matchesSub = selectedSubject === 'All' || m.subject === selectedSubject;
    const matchesSearch =
      !searchFilter ||
      m.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      m.description.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCat && matchesSub && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Category Tabs with Dynamic Custom Sections & "+ New Section" Button */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {allCategoryTabs.map((cat) => {
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

        {/* Add New Custom Section Button */}
        <button
          onClick={() => setShowNewSectionModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-slate-900 hover:bg-slate-850 text-indigo-400 border border-dashed border-indigo-500/40 transition shrink-0"
        >
          <FolderPlus className="w-4 h-4" />
          <span>+ New Section</span>
        </button>
      </div>

      {/* Filter Bar with Quick Upload Button */}
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

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Search inside materials */}
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search in materials..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Quick PDF / MP4 File Upload Trigger */}
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload PDF / MP4</span>
          </button>
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMaterials.map((mat) => {
          const isVideo = mat.category === 'video' || mat.fileType === 'mp4' || Boolean(mat.videoUrl);
          const hasFile = Boolean(mat.fileData || mat.pdfUrl);

          return (
            <div
              key={mat.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition flex flex-col justify-between group shadow-sm hover:shadow-indigo-500/5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                      {mat.subject}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 capitalize">
                      {mat.category}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">{mat.classLevel}</span>
                </div>

                <h4 className="text-base font-bold text-white group-hover:text-indigo-300 transition line-clamp-2">
                  {mat.title}
                </h4>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {mat.description}
                </p>

                {mat.fileName && (
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
                    <Paperclip className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{mat.fileName}</span>
                  </div>
                )}

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
                      <Play className="w-3.5 h-3.5 fill-current" /> Play Lecture
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
                        href={mat.fileData || mat.pdfUrl || '#'}
                        target="_blank"
                        rel="noreferrer"
                        download={mat.fileName || `${mat.title.replace(/\s+/g, '_')}.pdf`}
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

      {/* MODAL 1: Create New Custom Section */}
      {showNewSectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">Create Custom Section</h3>
              </div>
              <button onClick={() => setShowNewSectionModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Add a brand new section tab to Prepskm (e.g. "Mindmaps", "Daily Practice DPPs", "Short Notes", "Crash Marathon"). Every file you upload into this section will be displayed here!
            </p>
            <form onSubmit={handleCreateSectionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Section Name</label>
                <input
                  type="text"
                  required
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  placeholder="e.g. Mindmaps & Short Formulae"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition"
              >
                Create & Open Section
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Direct PDF / MP4 File Upload */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">Upload PDF / MP4 Resource</h3>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadNotice && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{uploadNotice}</span>
              </div>
            )}

            <form onSubmit={handlePublishUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Select Section</label>
                <select
                  value={uploadSection}
                  onChange={(e) => setUploadSection(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                >
                  <option value="notes">Handwritten Notes</option>
                  <option value="formula_sheet">Formula Sheets</option>
                  <option value="pyq">PYQs Compendium</option>
                  <option value="video">Video Lectures</option>
                  {customSections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      Custom: {sec.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Subject</label>
                <select
                  value={uploadSubject}
                  onChange={(e) => setUploadSubject(e.target.value as SubjectName)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                >
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Biology">Biology</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Organic Chemistry Complete Mechanism Sheet"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                />
              </div>

              {/* Direct File Picker (PDF / MP4) */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-dashed border-slate-700 text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Upload File (PDF or MP4 Video)</p>
                  <p className="text-[11px] text-slate-400">Select file directly from your computer or phone</p>
                </div>
                <input
                  type="file"
                  accept=".pdf,video/mp4"
                  onChange={handleFileSelect}
                  className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                />
                {uploadedFileName && (
                  <p className="text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Selected: {uploadedFileName} ({uploadedFileType.toUpperCase()})
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Key concepts, tricks, or formula points covered..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition"
              >
                Publish Resource to Section
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Material Viewer Modal (PDF preview / Video player) */}
      {viewingMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                  {viewingMaterial.category === 'video' || viewingMaterial.fileType === 'mp4' || viewingMaterial.videoUrl ? (
                    <Video className="w-5 h-5" />
                  ) : (
                    <FileText className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base sm:text-lg line-clamp-1">
                    {viewingMaterial.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {viewingMaterial.subject} • {viewingMaterial.classLevel} • {viewingMaterial.category}
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
              {(viewingMaterial.category === 'video' || viewingMaterial.fileType === 'mp4' || viewingMaterial.videoUrl) ? (
                <div className="space-y-4">
                  <div className="rounded-2xl overflow-hidden border border-slate-800 aspect-video bg-black flex items-center justify-center">
                    <video
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                      src={viewingMaterial.videoUrl || viewingMaterial.fileData}
                    >
                      Your browser does not support video playback.
                    </video>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                    <h5 className="font-bold text-white text-sm mb-1">Lecture Breakdown</h5>
                    <p className="text-xs text-slate-300 leading-relaxed">{viewingMaterial.description}</p>
                  </div>
                  {(viewingMaterial.pdfUrl || viewingMaterial.fileData) && (
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                      <div className="flex items-center gap-2.5">
                        <Paperclip className="w-4 h-4 text-indigo-400" />
                        <div>
                          <p className="text-sm font-bold text-white">
                            {viewingMaterial.pdfTitle || 'Companion Notes File'}
                          </p>
                          <p className="text-xs text-slate-400">Companion document for this lecture</p>
                        </div>
                      </div>
                      <a
                        href={viewingMaterial.pdfUrl || viewingMaterial.fileData || '#'}
                        download
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
                        href={viewingMaterial.fileData || viewingMaterial.pdfUrl || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition"
                      >
                        <ExternalLink className="w-4 h-4" /> Open Fullscreen PDF
                      </a>
                      <a
                        href={viewingMaterial.fileData || viewingMaterial.pdfUrl || '#'}
                        download={viewingMaterial.fileName || `${viewingMaterial.title.replace(/\s+/g, '_')}.pdf`}
                        className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 border border-slate-700 transition"
                      >
                        <Download className="w-4 h-4" /> Download PDF File
                      </a>
                    </div>
                  </div>

                  {/* Embedded PDF iframe preview */}
                  {(viewingMaterial.fileData || viewingMaterial.pdfUrl) && (
                    <div className="rounded-2xl overflow-hidden border border-slate-800 h-[450px] bg-slate-950">
                      <iframe
                        src={`${viewingMaterial.fileData || viewingMaterial.pdfUrl}#toolbar=0`}
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
