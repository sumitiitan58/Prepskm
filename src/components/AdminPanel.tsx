import React, { useState } from 'react';
import {
  ShieldAlert,
  Plus,
  Trash2,
  Crop,
  Upload,
  CheckCircle,
  AlertCircle,
  Search,
  Check,
  X,
  FileText,
  Video,
  Key,
  Database,
  Lock,
  Layers,
  Sparkles,
  GraduationCap,
} from 'lucide-react';
import {
  Question,
  StudyMaterial,
  MentorshipToken,
  SubjectName,
  ExamTarget,
  QuestionType,
  DifficultyLevel,
  FirebaseConfig,
  Mentor,
} from '../types';
import {
  saveQuestionToFirestore,
  deleteQuestionFromFirestore,
  saveMaterialToFirestore,
  getMentorshipTokens,
  verifyTokenCode,
  saveFirebaseConfig,
  getSavedFirebaseConfig,
  getAdminEmails,
  addAdminEmail,
  saveCustomChapter,
  getAllChaptersForSubject,
  getCustomSections,
  saveCustomSection,
  isOwner,
  OWNER_EMAIL,
  isSuperAdmin,
  isUserMentor,
  getUserRole,
  getMentors,
  saveMentor,
  deleteMentor,
} from '../lib/firebase';
import { ImageCropperModal } from './ImageCropperModal';
import { AVAILABLE_CHAPTERS } from '../data/initialData';

interface AdminPanelProps {
  questions: Question[];
  materials: StudyMaterial[];
  currentAdminEmail: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  questions,
  materials,
  currentAdminEmail,
}) => {
  const [activeTab, setActiveTab] = useState<'questions' | 'materials' | 'mentors' | 'tokens' | 'firebase'>('questions');
  const isSuper = isSuperAdmin(currentAdminEmail);
  const isMentorOnly = isUserMentor(currentAdminEmail) && !isSuper;

  // ==================== MENTORS MANAGEMENT STATE (SUPER ADMIN ONLY) ====================
  const [allMentors, setAllMentors] = useState<Mentor[]>([]);
  const [newMentorName, setNewMentorName] = useState('');
  const [newMentorEmail, setNewMentorEmail] = useState('');
  const [newMentorImage, setNewMentorImage] = useState('');
  const [newMentorSubject, setNewMentorSubject] = useState<SubjectName>('Physics');
  const [newMentorTagline, setNewMentorTagline] = useState('');
  const [newMentorBio, setNewMentorBio] = useState('');
  const [mentorNotice, setMentorNotice] = useState<string | null>(null);
  const [isSavingMentor, setIsSavingMentor] = useState(false);

  React.useEffect(() => {
    getMentors().then((m) => setAllMentors(m));
    const handleUpdate = () => {
      getMentors().then((m) => setAllMentors(m));
    };
    window.addEventListener('prepskm_mentors_updated', handleUpdate);
    return () => window.removeEventListener('prepskm_mentors_updated', handleUpdate);
  }, []);

  const handleAddMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMentorName.trim() || !newMentorEmail.trim()) {
      setMentorNotice('Please enter Mentor Name and Email ID.');
      return;
    }

    setIsSavingMentor(true);
    const mentor: Mentor = {
      id: 'mentor-' + Date.now(),
      name: newMentorName.trim(),
      email: newMentorEmail.trim().toLowerCase(),
      imageUrl: newMentorImage.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      subject: newMentorSubject,
      tagline: newMentorTagline.trim() || `${newMentorSubject} Faculty Mentor`,
      bio: newMentorBio.trim() || 'Prepskm verified faculty mentor dedicated to conceptual mastery and problem-solving tricks.',
      addedAt: new Date().toISOString(),
    };

    await saveMentor(mentor);
    setIsSavingMentor(false);
    setNewMentorName('');
    setNewMentorEmail('');
    setNewMentorImage('');
    setNewMentorTagline('');
    setNewMentorBio('');
    setMentorNotice(`Mentor "${mentor.name}" added successfully! When they log in with "${mentor.email}", they will get authorized mentor console.`);
    setTimeout(() => setMentorNotice(null), 5000);
  };

  const handleDeleteMentor = async (id: string) => {
    if (confirm('Are you sure you want to remove this mentor?')) {
      await deleteMentor(id);
      setMentorNotice('Mentor removed.');
      setTimeout(() => setMentorNotice(null), 3000);
    }
  };

  // ==================== TAB 1: QUESTION BUILDER STATE ====================
  const [qExamTarget, setQExamTarget] = useState<ExamTarget>('JEE Main');
  const [qClassLevel, setQClassLevel] = useState('Class 12');
  const [qSubject, setQSubject] = useState<SubjectName>('Physics');
  const [availableChapters, setAvailableChapters] = useState<string[]>(getAllChaptersForSubject('Physics'));
  const [qChapter, setQChapter] = useState('');
  const [newCustomChapter, setNewCustomChapter] = useState('');
  const [qType, setQType] = useState<QuestionType>('single_choice');
  const [qDifficulty, setQDifficulty] = useState<DifficultyLevel>('medium');
  const [qText, setQText] = useState('');
  const [qImageBase64, setQImageBase64] = useState<string | undefined>(undefined);

  // Sync available chapters whenever subject changes or chapters are updated
  React.useEffect(() => {
    setAvailableChapters(getAllChaptersForSubject(qSubject));
  }, [qSubject]);

  React.useEffect(() => {
    const handleChaptersUpdated = () => {
      setAvailableChapters(getAllChaptersForSubject(qSubject));
    };
    window.addEventListener('prepskm_chapters_updated', handleChaptersUpdated);
    return () => {
      window.removeEventListener('prepskm_chapters_updated', handleChaptersUpdated);
    };
  }, [qSubject]);

  // Options state
  const [qOptions, setQOptions] = useState<
    Array<{ id: string; text: string; imageBase64?: string; isCorrect: boolean }>
  >([
    { id: 'opt-1', text: '', isCorrect: true },
    { id: 'opt-2', text: '', isCorrect: false },
    { id: 'opt-3', text: '', isCorrect: false },
    { id: 'opt-4', text: '', isCorrect: false },
  ]);

  // NAT states
  const [qNumericalAnswer, setQNumericalAnswer] = useState<string>('');
  const [qNumericalTolerance, setQNumericalTolerance] = useState<string>('0.05');

  // Explanation states
  const [qExplanationText, setQExplanationText] = useState('');
  const [qExplanationImageBase64, setQExplanationImageBase64] = useState<string | undefined>(undefined);

  // Cropper Modal State
  const [cropperState, setCropperState] = useState<{
    isOpen: boolean;
    imageSrc: string;
    targetField: 'question' | 'explanation' | { optionIndex: number };
  } | null>(null);

  const [savingQuestion, setSavingQuestion] = useState(false);
  const [questionNotice, setQuestionNotice] = useState<string | null>(null);

  // ==================== TAB 2: MATERIAL UPLOADER STATE ====================
  const [matTitle, setMatTitle] = useState('');
  const [matCategory, setMatCategory] = useState<string>('notes');
  const [matCustomSectionName, setMatCustomSectionName] = useState('');
  const [matSubject, setMatSubject] = useState<SubjectName>('Physics');
  const [matClassLevel, setMatClassLevel] = useState('Class 12 / JEE');
  const [matPdfUrl, setMatPdfUrl] = useState('');
  const [matPdfTitle, setMatPdfTitle] = useState('');
  const [matVideoUrl, setMatVideoUrl] = useState('');
  const [matDescription, setMatDescription] = useState('');
  const [matUploadedFile, setMatUploadedFile] = useState<string | null>(null);
  const [matUploadedFileName, setMatUploadedFileName] = useState<string | null>(null);
  const [matUploadedFileType, setMatUploadedFileType] = useState<'pdf' | 'mp4' | 'other'>('pdf');
  const [customSectionsList, setCustomSectionsList] = useState(getCustomSections());
  const [savingMaterial, setSavingMaterial] = useState(false);
  const [materialNotice, setMaterialNotice] = useState<string | null>(null);

  React.useEffect(() => {
    const handleSecUpdate = () => {
      setCustomSectionsList(getCustomSections());
    };
    window.addEventListener('prepskm_sections_updated', handleSecUpdate);
    return () => {
      window.removeEventListener('prepskm_sections_updated', handleSecUpdate);
    };
  }, []);

  // ==================== TAB 3: TOKEN VERIFIER STATE ====================
  const [tokenInput, setTokenInput] = useState('');
  const [tokenResult, setTokenResult] = useState<{
    checked: boolean;
    valid: boolean;
    token?: MentorshipToken;
  }>({ checked: false, valid: false });
  const [allTokens, setAllTokens] = useState<MentorshipToken[]>([]);

  // Load tokens when tab opens
  React.useEffect(() => {
    if (activeTab === 'tokens') {
      getMentorshipTokens().then((t) => setAllTokens(t));
    }
  }, [activeTab]);

  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    const res = await verifyTokenCode(tokenInput);
    setTokenResult({ checked: true, valid: res.valid, token: res.token });
  };

  // ==================== TAB 4: FIREBASE SETTINGS STATE ====================
  const [fbApiKey, setFbApiKey] = useState('');
  const [fbAuthDomain, setFbAuthDomain] = useState('');
  const [fbProjectId, setFbProjectId] = useState('');
  const [fbStorageBucket, setFbStorageBucket] = useState('');
  const [fbMessagingSenderId, setFbMessagingSenderId] = useState('');
  const [fbAppId, setFbAppId] = useState('');
  const [fbMeasurementId, setFbMeasurementId] = useState('');
  const [firebaseNotice, setFirebaseNotice] = useState<string | null>(null);
  const [newAdminEmailInput, setNewAdminEmailInput] = useState('');

  React.useEffect(() => {
    const existing = getSavedFirebaseConfig();
    if (existing) {
      setFbApiKey(existing.apiKey || '');
      setFbAuthDomain(existing.authDomain || '');
      setFbProjectId(existing.projectId || '');
      setFbStorageBucket(existing.storageBucket || '');
      setFbMessagingSenderId(existing.messagingSenderId || '');
      setFbAppId(existing.appId || '');
      setFbMeasurementId(existing.measurementId || '');
    }
  }, []);

  const handleSaveFirebaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const config: FirebaseConfig = {
      apiKey: fbApiKey.trim(),
      authDomain: fbAuthDomain.trim(),
      projectId: fbProjectId.trim(),
      storageBucket: fbStorageBucket.trim(),
      messagingSenderId: fbMessagingSenderId.trim(),
      appId: fbAppId.trim(),
      measurementId: fbMeasurementId.trim(),
    };
    const ok = saveFirebaseConfig(config);
    if (ok) {
      setFirebaseNotice('Firebase credentials saved and re-initialized successfully!');
      setTimeout(() => setFirebaseNotice(null), 4000);
    }
  };

  // ==================== CROPPER TRIGGER HELPERS ====================
  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    targetField: 'question' | 'explanation' | { optionIndex: number }
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCropperState({
          isOpen: true,
          imageSrc: reader.result,
          targetField,
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // reset input
  };

  const handleCropComplete = (croppedBase64: string) => {
    if (!cropperState) return;

    if (cropperState.targetField === 'question') {
      setQImageBase64(croppedBase64);
    } else if (cropperState.targetField === 'explanation') {
      setQExplanationImageBase64(croppedBase64);
    } else if (typeof cropperState.targetField === 'object' && 'optionIndex' in cropperState.targetField) {
      const idx = cropperState.targetField.optionIndex;
      setQOptions((prev) => {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], imageBase64: croppedBase64 };
        return copy;
      });
    }

    setCropperState(null);
  };

  // Option handlers
  const handleOptionTextChange = (idx: number, text: string) => {
    setQOptions((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], text };
      return copy;
    });
  };

  const handleOptionCorrectToggle = (idx: number) => {
    if (qType === 'multi_choice') {
      setQOptions((prev) => {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], isCorrect: !copy[idx].isCorrect };
        return copy;
      });
    } else {
      setQOptions((prev) =>
        prev.map((opt, i) => ({ ...opt, isCorrect: i === idx }))
      );
    }
  };

  const addOption = () => {
    setQOptions((prev) => [
      ...prev,
      { id: `opt-${Date.now()}`, text: '', isCorrect: false },
    ]);
  };

  const removeOption = (idx: number) => {
    if (qOptions.length <= 2) return;
    setQOptions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddChapterClick = () => {
    const trimmed = newCustomChapter.trim();
    if (!trimmed) return;
    saveCustomChapter(qSubject, trimmed);
    const updated = getAllChaptersForSubject(qSubject);
    setAvailableChapters(updated);
    setQChapter(trimmed);
    setNewCustomChapter('');
    setQuestionNotice(`Chapter "${trimmed}" saved! It is now permanently selectable for every question.`);
    setTimeout(() => setQuestionNotice(null), 3500);
  };

  // Submit Question to Firestore
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText.trim() && !qImageBase64) {
      setQuestionNotice('Please enter question text or upload a cropped question diagram.');
      return;
    }

    setSavingQuestion(true);
    setQuestionNotice(null);

    let finalChapter = qChapter;
    if (newCustomChapter.trim()) {
      saveCustomChapter(qSubject, newCustomChapter.trim());
      setAvailableChapters(getAllChaptersForSubject(qSubject));
      finalChapter = newCustomChapter.trim();
    } else if (!finalChapter) {
      finalChapter = availableChapters[0] || 'General';
    }

    const newQ: Question = {
      id: 'q-' + Date.now(),
      targetExam: qExamTarget,
      classLevel: qClassLevel,
      subject: qSubject,
      chapter: finalChapter,
      type: qType,
      difficulty: qDifficulty,
      text: qText.trim(),
      imageBase64: qImageBase64,
      options: qType === 'numerical' ? [] : qOptions,
      numericalAnswer: qType === 'numerical' ? parseFloat(qNumericalAnswer) || 0 : undefined,
      numericalTolerance: qType === 'numerical' ? parseFloat(qNumericalTolerance) || 0.05 : undefined,
      explanationText: qExplanationText.trim() || 'Official step-by-step solution verified by Prepskm.',
      explanationImageBase64: qExplanationImageBase64,
      createdAt: new Date().toISOString(),
    };

    await saveQuestionToFirestore(newQ);
    setSavingQuestion(false);
    setQuestionNotice(`Question for "${finalChapter}" saved to Firestore "questions" collection successfully!`);

    // Reset form fields
    setQText('');
    setQImageBase64(undefined);
    setQNumericalAnswer('');
    setQExplanationText('');
    setQExplanationImageBase64(undefined);
    setNewCustomChapter('');
    setQOptions([
      { id: 'opt-1', text: '', isCorrect: true },
      { id: 'opt-2', text: '', isCorrect: false },
      { id: 'opt-3', text: '', isCorrect: false },
      { id: 'opt-4', text: '', isCorrect: false },
    ]);

    setTimeout(() => setQuestionNotice(null), 4000);
  };

  const handleMaterialFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMatUploadedFileName(file.name);
    const isVideo = file.type.includes('video') || file.name.endsWith('.mp4');
    const isPdf = file.type.includes('pdf') || file.name.endsWith('.pdf');
    setMatUploadedFileType(isVideo ? 'mp4' : isPdf ? 'pdf' : 'other');

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setMatUploadedFile(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit Material to Firestore
  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matTitle.trim()) return;

    setSavingMaterial(true);
    let finalCategory = matCategory;
    if (matCategory === 'custom' && matCustomSectionName.trim()) {
      saveCustomSection(matCustomSectionName.trim());
      finalCategory = matCustomSectionName.trim();
      setCustomSectionsList(getCustomSections());
    }

    const isVideo = matUploadedFileType === 'mp4' || finalCategory === 'video';
    const finalPdfUrl = matUploadedFileType === 'pdf' ? (matUploadedFile || '') : matPdfUrl.trim();
    const finalVideoUrl = isVideo ? (matUploadedFile || matVideoUrl.trim()) : undefined;

    const newMat: StudyMaterial = {
      id: 'mat-' + Date.now(),
      title: matTitle.trim(),
      category: finalCategory,
      subject: matSubject,
      classLevel: matClassLevel,
      pdfUrl: finalPdfUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      pdfTitle: matPdfTitle.trim() || undefined,
      videoUrl: finalVideoUrl,
      fileData: matUploadedFile || undefined,
      fileName: matUploadedFileName || undefined,
      fileType: matUploadedFileType,
      description: matDescription.trim(),
      downloadsCount: Math.floor(100 + Math.random() * 500),
      createdAt: new Date().toISOString(),
    };

    await saveMaterialToFirestore(newMat);
    setSavingMaterial(false);
    setMaterialNotice(`Study material published to section "${finalCategory}" in Firestore!`);

    setMatTitle('');
    setMatPdfUrl('');
    setMatPdfTitle('');
    setMatVideoUrl('');
    setMatDescription('');
    setMatUploadedFile(null);
    setMatUploadedFileName(null);
    setMatCustomSectionName('');
    setTimeout(() => setMaterialNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Admin Panel Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 font-bold text-xs border border-indigo-500/30">
              Admin Control Center
            </span>
            {isOwner(currentAdminEmail) ? (
              <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/40 flex items-center gap-1 shadow-sm shadow-amber-500/20">
                👑 Super Admin ({currentAdminEmail})
              </span>
            ) : isMentorOnly ? (
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/40 flex items-center gap-1">
                🎓 Faculty Mentor ({currentAdminEmail})
              </span>
            ) : null}
            <span className="text-xs text-slate-400">
              {isMentorOnly ? 'Upload & Content Management Privileges' : 'Full Platform & System Control'}
            </span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1">
            {isMentorOnly ? 'Prepskm Faculty Mentor Console' : 'Prepskm Super Admin Panel'}
          </h2>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-3.5 py-2 rounded-xl font-bold transition shrink-0 ${
              activeTab === 'questions' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Question Builder (Cropper)
          </button>
          <button
            onClick={() => setActiveTab('materials')}
            className={`px-3.5 py-2 rounded-xl font-bold transition shrink-0 ${
              activeTab === 'materials' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Materials & Videos
          </button>
          {isSuper && (
            <button
              onClick={() => setActiveTab('mentors')}
              className={`px-3.5 py-2 rounded-xl font-bold transition shrink-0 ${
                activeTab === 'mentors' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Mentors Management
            </button>
          )}
          <button
            onClick={() => setActiveTab('tokens')}
            className={`px-3.5 py-2 rounded-xl font-bold transition shrink-0 ${
              activeTab === 'tokens' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Token Verifier
          </button>
          {isSuper && (
            <button
              onClick={() => setActiveTab('firebase')}
              className={`px-3.5 py-2 rounded-xl font-bold transition shrink-0 ${
                activeTab === 'firebase' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Firebase Config
            </button>
          )}
        </div>
      </div>

      {/* ==================== TAB 1: QUESTION BANK BUILDER ==================== */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">Advanced Question Bank Creator</h3>
                <p className="text-xs text-slate-400">
                  With In-Browser Cropper.js for question diagrams, options, and step-by-step explanations
                </p>
              </div>
            </div>

            {questionNotice && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" /> {questionNotice}
              </div>
            )}

            <form onSubmit={handleSaveQuestion} className="space-y-6">
              {/* Row 1: Target Exam, Class, Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Target Exam</label>
                  <select
                    value={qExamTarget}
                    onChange={(e) => setQExamTarget(e.target.value as ExamTarget)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  >
                    <option value="JEE Main">JEE Main</option>
                    <option value="JEE Advanced">JEE Advanced</option>
                    <option value="NEET">NEET</option>
                    <option value="Class 12">Class 12</option>
                    <option value="Class 11">Class 11</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Subject</label>
                  <select
                    value={qSubject}
                    onChange={(e) => {
                      setQSubject(e.target.value as SubjectName);
                      setQChapter('');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Biology">Biology</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Question Type
                  </label>
                  <select
                    value={qType}
                    onChange={(e) => setQType(e.target.value as QuestionType)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  >
                    <option value="single_choice">Single Choice MCQ (1 correct)</option>
                    <option value="multi_choice">Multiple Choice MCQ (multi-select)</option>
                    <option value="numerical">Numerical Value Type (NAT)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Dynamic Chapter Selection with Permanent Custom Chapters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Select Chapter ({availableChapters.length} Available)
                  </label>
                  <select
                    value={qChapter}
                    onChange={(e) => setQChapter(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-medium"
                  >
                    <option value="">-- Choose Chapter --</option>
                    {availableChapters.map((ch) => (
                      <option key={ch} value={ch}>{ch}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Or Add New Chapter (Shows up for all questions)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCustomChapter}
                      onChange={(e) => setNewCustomChapter(e.target.value)}
                      placeholder="e.g. Semiconductors & Logic Gates"
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddChapterClick}
                      className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Chapter
                    </button>
                  </div>
                </div>
              </div>

              {/* Question Text Area */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Question Content / Text</label>
                <textarea
                  rows={3}
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  placeholder="Enter problem statement, formulas, or question text..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                />
              </div>

              {/* Interactive Cropper Upload for Question Diagram */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Crop className="w-4 h-4 text-indigo-400" /> Question Image & Built-in In-Browser Cropper
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Upload an image file to open Cropper.js and snip the diagram directly in the browser
                    </p>
                  </div>

                  <label className="cursor-pointer px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 transition">
                    <Upload className="w-3.5 h-3.5" /> Upload & Crop
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, 'question')}
                    />
                  </label>
                </div>

                {qImageBase64 && (
                  <div className="relative inline-block border border-slate-700 rounded-xl overflow-hidden mt-2">
                    <img src={qImageBase64} alt="Cropped preview" className="max-h-48 object-contain" />
                    <button
                      type="button"
                      onClick={() => setQImageBase64(undefined)}
                      className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-600 text-white rounded-lg transition"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Numerical Value Input configuration if NAT */}
              {qType === 'numerical' ? (
                <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-amber-400">
                    Numerical Value Type (NAT) Answer Configuration
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Correct Numerical Value
                      </label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={qNumericalAnswer}
                        onChange={(e) => setQNumericalAnswer(e.target.value)}
                        placeholder="e.g. 8 or 5744"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Tolerance Range (±)
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={qNumericalTolerance}
                        onChange={(e) => setQNumericalTolerance(e.target.value)}
                        placeholder="0.05"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* MCQ Options Section */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-300 uppercase">
                      Answer Options (Check the correct option{qType === 'multi_choice' ? 's' : ''})
                    </label>
                    <button
                      type="button"
                      onClick={addOption}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Option
                    </button>
                  </div>

                  <div className="space-y-3">
                    {qOptions.map((opt, oIdx) => (
                      <div
                        key={opt.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3"
                      >
                        <button
                          type="button"
                          onClick={() => handleOptionCorrectToggle(oIdx)}
                          className={`w-7 h-7 rounded-lg border text-xs font-bold flex items-center justify-center shrink-0 transition ${
                            opt.isCorrect
                              ? 'bg-emerald-600 border-emerald-500 text-white'
                              : 'border-slate-700 text-slate-400 hover:border-slate-500'
                          }`}
                          title="Toggle as correct answer"
                        >
                          {opt.isCorrect ? <Check className="w-4 h-4" /> : String.fromCharCode(65 + oIdx)}
                        </button>

                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => handleOptionTextChange(oIdx, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + oIdx)} text...`}
                          className="flex-1 bg-transparent border-b border-slate-800 focus:border-indigo-500 text-white text-xs py-1 px-2 focus:outline-none"
                        />

                        {/* Option Image Cropper */}
                        <label className="cursor-pointer text-[11px] text-slate-400 hover:text-indigo-400 flex items-center gap-1 shrink-0 p-1">
                          <Crop className="w-3.5 h-3.5" /> Crop Opt
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(e, { optionIndex: oIdx })}
                          />
                        </label>

                        {opt.imageBase64 && (
                          <div className="relative shrink-0">
                            <img src={opt.imageBase64} alt="Opt" className="h-8 rounded" />
                            <button
                              type="button"
                              onClick={() => {
                                setQOptions((prev) => {
                                  const c = [...prev];
                                  c[oIdx] = { ...c[oIdx], imageBase64: undefined };
                                  return c;
                                });
                              }}
                              className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full p-0.5"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        )}

                        {qOptions.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(oIdx)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step-by-Step Explanation Section */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase">
                  Explanation (Strictly Hidden During Mock Tests, Shown in Solutions)
                </label>
                <textarea
                  rows={2}
                  value={qExplanationText}
                  onChange={(e) => setQExplanationText(e.target.value)}
                  placeholder="Derivation, formula shortcuts, or detailed reasoning..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                />

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Crop className="w-3.5 h-3.5 text-indigo-400" /> Explanation Diagram / Handwritten Solution Snip
                  </span>
                  <label className="cursor-pointer px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-indigo-300 font-semibold text-xs flex items-center gap-1 transition">
                    <Upload className="w-3 h-3" /> Crop Solution
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, 'explanation')}
                    />
                  </label>
                </div>

                {qExplanationImageBase64 && (
                  <div className="relative inline-block border border-slate-700 rounded-xl overflow-hidden mt-1">
                    <img src={qExplanationImageBase64} alt="Explanation cropped" className="max-h-40 object-contain" />
                    <button
                      type="button"
                      onClick={() => setQExplanationImageBase64(undefined)}
                      className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-600 text-white rounded-lg transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={savingQuestion}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition active:scale-98 disabled:opacity-50"
              >
                {savingQuestion ? 'Pushing to Firestore...' : 'Save Question to Cloud Firestore'}
              </button>
            </form>
          </div>

          {/* Existing Question Bank Management */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Active Question Bank ({questions.length} Questions in Repository)
            </h4>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1 text-xs min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {q.subject}
                      </span>
                      <span className="text-slate-400">• {q.chapter}</span>
                      <span className="capitalize px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {q.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-slate-200 line-clamp-2">{q.text}</p>
                  </div>

                  <button
                    onClick={() => deleteQuestionFromFirestore(q.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition shrink-0"
                    title="Delete Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: MATERIAL & VIDEO UPLOADER ==================== */}
      {activeTab === 'materials' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-white">Study Material & Video Publisher</h3>
              <p className="text-xs text-slate-400">
                Publish Handwritten Notes, Formula Sheets, PYQ Compendiums, and MP4 Video Lectures
              </p>
            </div>
          </div>

          {materialNotice && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" /> {materialNotice}
            </div>
          )}

          <form onSubmit={handleSaveMaterial} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Section / Category</label>
                <select
                  value={matCategory}
                  onChange={(e) => setMatCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-medium"
                >
                  <option value="notes">Handwritten Revision Notes (PDF)</option>
                  <option value="formula_sheet">Formula Sheet (PDF)</option>
                  <option value="pyq">Previous Year Questions (PYQs)</option>
                  <option value="video">Strategy & Video Lectures (MP4)</option>
                  {customSectionsList.map((sec) => (
                    <option key={sec.id} value={sec.id}>Custom: {sec.name}</option>
                  ))}
                  <option value="custom">+ Create New Custom Section...</option>
                </select>
              </div>

              {matCategory === 'custom' && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    New Custom Section Name
                  </label>
                  <input
                    type="text"
                    required
                    value={matCustomSectionName}
                    onChange={(e) => setMatCustomSectionName(e.target.value)}
                    placeholder="e.g. Mindmaps & Fast Charts, Daily DPPs..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-indigo-500/60 text-white text-xs"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Subject</label>
                <select
                  value={matSubject}
                  onChange={(e) => setMatSubject(e.target.value as SubjectName)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                >
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Biology">Biology</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Target Class / Exam</label>
                <input
                  type="text"
                  value={matClassLevel}
                  onChange={(e) => setMatClassLevel(e.target.value)}
                  placeholder="e.g. Class 12 / JEE & NEET"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Material Title</label>
              <input
                type="text"
                required
                value={matTitle}
                onChange={(e) => setMatTitle(e.target.value)}
                placeholder="e.g. Modern Physics Complete 1-Shot Handwritten Notes"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
              />
            </div>

            {/* Direct File Upload (PDF or MP4 Video) */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-dashed border-indigo-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-indigo-400" /> Upload File (PDF or MP4 Video)
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Upload your document or video file directly so students can stream or download it
                  </p>
                </div>
              </div>

              <input
                type="file"
                accept=".pdf,video/*"
                onChange={handleMaterialFileSelect}
                className="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
              />

              {matUploadedFileName && (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>File Selected: {matUploadedFileName} ({matUploadedFileType.toUpperCase()})</span>
                </div>
              )}
            </div>

            {/* Optional Fallback URLs & Companion PDF */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Or External Cloud/Video/PDF Link (Optional)
                </label>
                <input
                  type="url"
                  value={matPdfUrl}
                  onChange={(e) => setMatPdfUrl(e.target.value)}
                  placeholder="https://... (if not uploading directly)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Companion PDF Title (For Video Lectures)
                </label>
                <input
                  type="text"
                  value={matPdfTitle}
                  onChange={(e) => setMatPdfTitle(e.target.value)}
                  placeholder="e.g. Formula Sheet PDF for this lecture"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Description / Summary</label>
              <textarea
                rows={2}
                value={matDescription}
                onChange={(e) => setMatDescription(e.target.value)}
                placeholder="What topics does this material cover? High-yield shortcuts included..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={savingMaterial}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-lg shadow-indigo-600/30"
            >
              {savingMaterial ? 'Uploading & Publishing...' : 'Publish to Study Materials Hub'}
            </button>
          </form>
        </div>
      )}

      {/* ==================== TAB 3: TOKEN VERIFIER & REGISTRY ==================== */}
      {activeTab === 'tokens' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
            <h3 className="text-lg font-bold text-white">Mentorship Token Verifier & Booking Registry</h3>
            <p className="text-xs text-slate-400">
              Validate student pass codes submitted on Telegram chat (@unfiltreddsumit) against Firestore
            </p>

            <form onSubmit={handleVerifyToken} className="flex gap-2 max-w-xl">
              <input
                type="text"
                required
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Enter Token (e.g. PSKM-JEE-84920-VERIFIED)"
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
              />
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-md shadow-indigo-600/20"
              >
                Verify Code
              </button>
            </form>

            {/* Validation Outcome Banner */}
            {tokenResult.checked && (
              <div
                className={`p-5 rounded-2xl border transition animate-fade-in ${
                  tokenResult.valid
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-2 font-bold text-base">
                  {tokenResult.valid ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      <span>AUTHENTIC & VALID PREPSKM TOKEN</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-5 h-5 text-rose-400" />
                      <span>FAKE / INVALID OR UNRECORDED TOKEN</span>
                    </>
                  )}
                </div>

                {tokenResult.valid && tokenResult.token && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-300 mt-3 pt-3 border-t border-emerald-500/30">
                    <div>
                      <span className="text-slate-400 block">Student:</span>
                      <span className="font-bold text-white">{tokenResult.token.studentName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Phone/WhatsApp:</span>
                      <span className="font-bold text-white">{tokenResult.token.phoneOrWhatsApp}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Target Exam:</span>
                      <span className="font-bold text-white">{tokenResult.token.targetExam}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Duration & Amount:</span>
                      <span className="font-bold text-emerald-400">
                        {tokenResult.token.minutesBooked} Mins (₹{tokenResult.token.amountPaid})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Time Slot:</span>
                      <span className="font-bold text-white">{tokenResult.token.timeSlot}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Doubt Topic:</span>
                      <span className="text-white">{tokenResult.token.doubtTopic}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Registry of All Bookings */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider">
              Mentorship Booking Registry ({allTokens.length} Passes Issued)
            </h4>

            {allTokens.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No tokens recorded yet.</p>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {allTokens.map((t) => (
                  <div
                    key={t.tokenCode}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <p className="font-mono font-bold text-indigo-400">{t.tokenCode}</p>
                      <p className="text-slate-300">
                        {t.studentName} ({t.phoneOrWhatsApp}) • {t.targetExam}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-400">₹{t.amountPaid}</span>
                      <span className="text-slate-500 block text-[10px]">{t.minutesBooked} Mins</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB: MENTORS MANAGEMENT (SUPER ADMIN ONLY) ==================== */}
      {activeTab === 'mentors' && isSuper && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-400" /> Mentors & Faculty Access Management
              </h3>
              <p className="text-xs text-slate-400">
                Add verified faculty mentors. When they sign in with their registered Email ID, they receive instant access to upload & edit questions, materials, and videos.
              </p>
            </div>
          </div>

          {mentorNotice && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" /> {mentorNotice}
            </div>
          )}

          {/* Form to Add New Mentor */}
          <form onSubmit={handleAddMentor} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" /> Register New Mentor
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold uppercase mb-1">
                  Mentor Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newMentorName}
                  onChange={(e) => setNewMentorName(e.target.value)}
                  placeholder="e.g. Saurav Kumar"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold uppercase mb-1">
                  Mentor Email ID * (Must match their Google Sign-In)
                </label>
                <input
                  type="email"
                  required
                  value={newMentorEmail}
                  onChange={(e) => setNewMentorEmail(e.target.value)}
                  placeholder="e.g. mentor@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold uppercase mb-1">
                  Primary Subject
                </label>
                <select
                  value={newMentorSubject}
                  onChange={(e) => setNewMentorSubject(e.target.value as SubjectName)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Biology">Biology</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold uppercase mb-1">
                  Tagline / Specialization
                </label>
                <input
                  type="text"
                  value={newMentorTagline}
                  onChange={(e) => setNewMentorTagline(e.target.value)}
                  placeholder="e.g. IITian Physics Mentor | AIR 142"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold uppercase mb-1">
                  Profile Photo URL (Optional)
                </label>
                <input
                  type="url"
                  value={newMentorImage}
                  onChange={(e) => setNewMentorImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold uppercase mb-1 text-xs">
                Mentor Bio / Description (Mentor can also edit this later)
              </label>
              <textarea
                rows={3}
                value={newMentorBio}
                onChange={(e) => setNewMentorBio(e.target.value)}
                placeholder="Describe teaching credentials, problem-solving mastery, and Telegram contact..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isSavingMentor}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-md shadow-indigo-600/30 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{isSavingMentor ? 'Authorizing Mentor...' : 'Authorize & Add Mentor'}</span>
            </button>
          </form>

          {/* List of Existing Mentors */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Currently Authorized Mentors ({allMentors.length})
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allMentors.map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={m.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                      alt={m.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0 mt-0.5"
                    />
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm truncate">{m.name}</span>
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-bold text-[10px]">
                          {m.subject || 'Faculty'}
                        </span>
                      </div>
                      <p className="font-mono text-slate-400 text-[11px] truncate">{m.email}</p>
                      {m.tagline && <p className="text-slate-300 text-[11px] font-semibold">{m.tagline}</p>}
                      <p className="text-slate-400 text-[11px] line-clamp-2">{m.bio}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteMentor(m.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition shrink-0"
                    title="Remove Mentor Access"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 4: FIREBASE SETTINGS ==================== */}
      {activeTab === 'firebase' && isSuper && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-400" /> Firebase Cloud Setup & Access Control
              </h3>
              <p className="text-xs text-slate-400">
                Connect your live Firebase project credentials (apiKey, authDomain, projectId, storageBucket)
              </p>
            </div>
          </div>

          {firebaseNotice && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" /> {firebaseNotice}
            </div>
          )}

          <form onSubmit={handleSaveFirebaseConfig} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">apiKey</label>
                <input
                  type="text"
                  value={fbApiKey}
                  onChange={(e) => setFbApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">projectId</label>
                <input
                  type="text"
                  value={fbProjectId}
                  onChange={(e) => setFbProjectId(e.target.value)}
                  placeholder="prepskm-app"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">authDomain</label>
                <input
                  type="text"
                  value={fbAuthDomain}
                  onChange={(e) => setFbAuthDomain(e.target.value)}
                  placeholder="prepskm.firebaseapp.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">storageBucket</label>
                <input
                  type="text"
                  value={fbStorageBucket}
                  onChange={(e) => setFbStorageBucket(e.target.value)}
                  placeholder="prepskm.appspot.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">appId</label>
                <input
                  type="text"
                  value={fbAppId}
                  onChange={(e) => setFbAppId(e.target.value)}
                  placeholder="1:123456789:web:abcdef..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">messagingSenderId</label>
                <input
                  type="text"
                  value={fbMessagingSenderId}
                  onChange={(e) => setFbMessagingSenderId(e.target.value)}
                  placeholder="123456789"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  measurementId (Firebase Analytics)
                </label>
                <input
                  type="text"
                  value={fbMeasurementId}
                  onChange={(e) => setFbMeasurementId(e.target.value)}
                  placeholder="G-HYL8GGSTZ2"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-md shadow-indigo-600/30"
            >
              Save & Connect Firebase SDK
            </button>
          </form>

          {/* Admin Emails Section */}
          <div className="pt-6 border-t border-slate-800 space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Authorized Admin Accounts
            </h4>
            <div className="flex flex-wrap gap-2">
              {getAdminEmails().map((em) => {
                const isPlatformOwner = isOwner(em);
                return (
                  <span
                    key={em}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono border ${
                      isPlatformOwner
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-bold shadow-sm shadow-amber-500/20'
                        : 'bg-slate-950 border-slate-700 text-indigo-300'
                    }`}
                  >
                    {isPlatformOwner && <span>👑 Owner:</span>}
                    <span>{em}</span>
                  </span>
                );
              })}
            </div>
            <div className="flex gap-2 max-w-md pt-2">
              <input
                type="email"
                value={newAdminEmailInput}
                onChange={(e) => setNewAdminEmailInput(e.target.value)}
                placeholder="Add another admin email..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
              />
              <button
                type="button"
                onClick={() => {
                  if (newAdminEmailInput.trim()) {
                    addAdminEmail(newAdminEmailInput.trim());
                    setNewAdminEmailInput('');
                    setFirebaseNotice('Admin email authorized!');
                    setTimeout(() => setFirebaseNotice(null), 3000);
                  }
                }}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
              >
                Add Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-Browser Cropper.js Modal */}
      {cropperState?.isOpen && (
        <ImageCropperModal
          imageSrc={cropperState.imageSrc}
          title={
            cropperState.targetField === 'question'
              ? 'Crop Question Diagram Area'
              : cropperState.targetField === 'explanation'
              ? 'Crop Step-by-Step Explanation Diagram'
              : 'Crop Option Diagram'
          }
          onCropComplete={handleCropComplete}
          onCancel={() => setCropperState(null)}
        />
      )}
    </div>
  );
};
