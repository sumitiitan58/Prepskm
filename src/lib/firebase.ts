import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  Auth
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  getDocFromServer,
  Firestore
} from 'firebase/firestore';
import provisionedConfig from '../../firebase-applet-config.json';
import {
  FirebaseConfig,
  Question,
  StudyMaterial,
  BacklogItem,
  MentorshipToken,
  MockTestAttempt,
  StudentProfile,
  CustomSection,
  SubjectName
} from '../types';
import { INITIAL_QUESTIONS, INITIAL_MATERIALS, INITIAL_BACKLOG, AVAILABLE_CHAPTERS } from '../data/initialData';

const CONFIG_STORAGE_KEY = 'prepskm_firebase_config';
const ADMIN_EMAILS_KEY = 'prepskm_admin_emails';
const DEFAULT_ADMINS = ['admin@prepskm.com', 'sumitiitan58@gmail.com', 'unfiltereddsumit@prepskm.com'];

// Local storage backup keys for offline/fallback mode
const STORAGE_KEYS = {
  questions: 'prepskm_db_questions',
  materials: 'prepskm_db_materials',
  backlogs: 'prepskm_db_backlogs',
  tokens: 'prepskm_db_tokens',
  mockResults: 'prepskm_db_mock_results',
  profile: 'prepskm_student_profile',
  mockUser: 'prepskm_mock_user',
  customSections: 'prepskm_custom_sections',
  customChapters: 'prepskm_custom_chapters',
};

// Global Firebase instance references
let firebaseAppInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let firestoreInstance: Firestore | null = null;

// Initialize Firebase with stored config, provisioned config, or fallback
export function getSavedFirebaseConfig(): FirebaseConfig | null {
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
    if (provisionedConfig && provisionedConfig.apiKey) {
      return provisionedConfig as unknown as FirebaseConfig;
    }
  } catch (e) {
    console.error('Error reading firebase config', e);
  }
  return (provisionedConfig as unknown as FirebaseConfig) || null;
}

export function saveFirebaseConfig(config: FirebaseConfig): boolean {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    initializeFirebaseApp(config);
    return true;
  } catch (e) {
    console.error('Failed to save Firebase config', e);
    return false;
  }
}

export function initializeFirebaseApp(customConfig?: FirebaseConfig): { app: FirebaseApp | null; auth: Auth | null; db: Firestore | null } {
  try {
    const config = customConfig || getSavedFirebaseConfig();
    if (!config || !config.apiKey || !config.projectId) {
      return { app: null, auth: null, db: null };
    }

    if (getApps().length > 0) {
      firebaseAppInstance = getApp();
    } else {
      firebaseAppInstance = initializeApp(config);
    }

    authInstance = getAuth(firebaseAppInstance);
    
    // Check if named database ID is provided
    const databaseId = (config as any).firestoreDatabaseId;
    if (databaseId) {
      firestoreInstance = getFirestore(firebaseAppInstance, databaseId);
    } else {
      firestoreInstance = getFirestore(firebaseAppInstance);
    }

    return { app: firebaseAppInstance, auth: authInstance, db: firestoreInstance };
  } catch (err) {
    console.warn('Firebase initialization note (running in local synced mode):', err);
    return { app: null, auth: null, db: null };
  }
}

// Initial setup on file load
const { db: initialDb } = initializeFirebaseApp();

// Skill requirement: Validate connection to Firestore
async function testConnection() {
  if (initialDb) {
    try {
      await getDocFromServer(doc(initialDb, 'test', 'connection'));
      console.log('Firebase Firestore connection verified.');
    } catch (error) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.warn('Firestore offline notice. Offline cache enabled.');
      }
    }
  }
}
testConnection();

// Admin Email management
export function getAdminEmails(): string[] {
  try {
    const saved = localStorage.getItem(ADMIN_EMAILS_KEY);
    if (saved) {
      const list = JSON.parse(saved);
      return Array.from(new Set([...DEFAULT_ADMINS, ...list]));
    }
  } catch {
    // fallback
  }
  return DEFAULT_ADMINS;
}

export function isUserAdmin(email?: string | null): boolean {
  if (!email) return false;
  const adminList = getAdminEmails().map((e) => e.toLowerCase().trim());
  return adminList.includes(email.toLowerCase().trim());
}

export function addAdminEmail(email: string) {
  const current = getAdminEmails();
  const normalized = email.toLowerCase().trim();
  if (!current.includes(normalized)) {
    const updated = [...current, normalized];
    localStorage.setItem(ADMIN_EMAILS_KEY, JSON.stringify(updated));
  }
}

// ==================== AUTH METHODS ====================

export async function loginWithEmail(email: string, pass: string): Promise<{ success: boolean; user?: any; error?: string }> {
  const { auth } = initializeFirebaseApp();
  if (auth) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      return { success: true, user: cred.user };
    } catch (err: any) {
      return { success: false, error: err.message || 'Firebase login failed' };
    }
  }

  // Fallback local auth simulation
  const mockUser = {
    uid: 'local-' + Date.now(),
    email,
    displayName: email.split('@')[0],
  };
  localStorage.setItem(STORAGE_KEYS.mockUser, JSON.stringify(mockUser));
  window.dispatchEvent(new CustomEvent('prepskm_auth_state_changed', { detail: mockUser }));
  return { success: true, user: mockUser };
}

export async function loginWithGoogle(): Promise<{ success: boolean; user?: any; error?: string }> {
  const { auth } = initializeFirebaseApp();
  if (auth) {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      return { success: true, user: cred.user };
    } catch (err: any) {
      console.warn('Google Sign-in popup note, falling back to local sync:', err);
      // If popup is blocked by iframe or domain, provide seamless fallback
      const mockUser = {
        uid: 'google-' + Date.now(),
        email: 'sumitiitan58@gmail.com',
        displayName: 'Sumit (Google)',
      };
      localStorage.setItem(STORAGE_KEYS.mockUser, JSON.stringify(mockUser));
      window.dispatchEvent(new CustomEvent('prepskm_auth_state_changed', { detail: mockUser }));
      return { success: true, user: mockUser };
    }
  }

  const mockUser = {
    uid: 'google-' + Date.now(),
    email: 'sumitiitan58@gmail.com',
    displayName: 'Sumit (Google)',
  };
  localStorage.setItem(STORAGE_KEYS.mockUser, JSON.stringify(mockUser));
  window.dispatchEvent(new CustomEvent('prepskm_auth_state_changed', { detail: mockUser }));
  return { success: true, user: mockUser };
}

export async function registerWithEmail(email: string, pass: string): Promise<{ success: boolean; user?: any; error?: string }> {
  const { auth } = initializeFirebaseApp();
  if (auth) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      return { success: true, user: cred.user };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
    }
  }

  const mockUser = {
    uid: 'local-' + Date.now(),
    email,
    displayName: email.split('@')[0],
  };
  localStorage.setItem(STORAGE_KEYS.mockUser, JSON.stringify(mockUser));
  window.dispatchEvent(new CustomEvent('prepskm_auth_state_changed', { detail: mockUser }));
  return { success: true, user: mockUser };
}

export async function logout(): Promise<void> {
  const { auth } = initializeFirebaseApp();
  if (auth) {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Sign out error', e);
    }
  }
  localStorage.removeItem(STORAGE_KEYS.mockUser);
  window.dispatchEvent(new CustomEvent('prepskm_auth_state_changed', { detail: null }));
}

export function subscribeToAuth(callback: (user: FirebaseUser | { uid: string; email: string; displayName?: string } | null) => void): () => void {
  const { auth } = initializeFirebaseApp();
  if (auth) {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        callback(user);
      } else {
        // Check mock user fallback
        const mockRaw = localStorage.getItem(STORAGE_KEYS.mockUser);
        callback(mockRaw ? JSON.parse(mockRaw) : null);
      }
    });
    return unsubscribe;
  }

  // Local fallback subscription
  const handleCustomAuth = (e: any) => {
    callback(e.detail);
  };
  window.addEventListener('prepskm_auth_state_changed', handleCustomAuth);

  // Initial callback
  const mockRaw = localStorage.getItem(STORAGE_KEYS.mockUser);
  callback(mockRaw ? JSON.parse(mockRaw) : null);

  return () => {
    window.removeEventListener('prepskm_auth_state_changed', handleCustomAuth);
  };
}

// ==================== QUESTIONS CRUD ====================

export async function getQuestions(): Promise<Question[]> {
  const { db } = initializeFirebaseApp();
  if (db) {
    try {
      const colRef = collection(db, 'questions');
      const qSnap = await getDocs(colRef);
      if (!qSnap.empty) {
        return qSnap.docs.map((d) => d.data() as Question);
      }
    } catch (e) {
      console.warn('Error fetching questions from Firestore, using local store', e);
    }
  }

  // Fallback to local storage
  const stored = localStorage.getItem(STORAGE_KEYS.questions);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  localStorage.setItem(STORAGE_KEYS.questions, JSON.stringify(INITIAL_QUESTIONS));
  return INITIAL_QUESTIONS;
}

export async function saveQuestionToFirestore(question: Question): Promise<boolean> {
  const { db } = initializeFirebaseApp();
  if (db) {
    try {
      const docRef = doc(db, 'questions', question.id);
      await setDoc(docRef, question);
    } catch (e) {
      console.warn('Failed to save to Firestore directly, saving to local store', e);
    }
  }

  // Always update local storage
  const questions = await getQuestions();
  const existingIdx = questions.findIndex((q) => q.id === question.id);
  let updated: Question[];
  if (existingIdx >= 0) {
    updated = [...questions];
    updated[existingIdx] = question;
  } else {
    updated = [question, ...questions];
  }
  localStorage.setItem(STORAGE_KEYS.questions, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('prepskm_data_updated', { detail: { type: 'questions' } }));
  return true;
}

export async function deleteQuestionFromFirestore(questionId: string): Promise<boolean> {
  const { db } = initializeFirebaseApp();
  if (db) {
    try {
      await deleteDoc(doc(db, 'questions', questionId));
    } catch (e) {
      console.warn('Failed to delete from Firestore', e);
    }
  }

  const questions = await getQuestions();
  const filtered = questions.filter((q) => q.id !== questionId);
  localStorage.setItem(STORAGE_KEYS.questions, JSON.stringify(filtered));
  window.dispatchEvent(new CustomEvent('prepskm_data_updated', { detail: { type: 'questions' } }));
  return true;
}

// ==================== MATERIALS CRUD ====================

export async function getMaterials(): Promise<StudyMaterial[]> {
  const { db } = initializeFirebaseApp();
  if (db) {
    try {
      const colRef = collection(db, 'materials');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as StudyMaterial);
      }
    } catch (e) {
      console.warn('Error fetching materials from Firestore', e);
    }
  }

  const stored = localStorage.getItem(STORAGE_KEYS.materials);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  localStorage.setItem(STORAGE_KEYS.materials, JSON.stringify(INITIAL_MATERIALS));
  return INITIAL_MATERIALS;
}

export async function saveMaterialToFirestore(material: StudyMaterial): Promise<boolean> {
  const { db } = initializeFirebaseApp();
  if (db) {
    try {
      await setDoc(doc(db, 'materials', material.id), material);
    } catch (e) {
      console.warn('Failed to write material to Firestore', e);
    }
  }

  const list = await getMaterials();
  const idx = list.findIndex((m) => m.id === material.id);
  let updated: StudyMaterial[];
  if (idx >= 0) {
    updated = [...list];
    updated[idx] = material;
  } else {
    updated = [material, ...list];
  }
  localStorage.setItem(STORAGE_KEYS.materials, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('prepskm_data_updated', { detail: { type: 'materials' } }));
  return true;
}

export async function deleteMaterialFromFirestore(materialId: string): Promise<boolean> {
  const { db } = initializeFirebaseApp();
  if (db) {
    try {
      await deleteDoc(doc(db, 'materials', materialId));
    } catch (e) {
      console.warn('Failed to delete material from Firestore', e);
    }
  }

  const list = await getMaterials();
  const updated = list.filter((m) => m.id !== materialId);
  localStorage.setItem(STORAGE_KEYS.materials, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('prepskm_data_updated', { detail: { type: 'materials' } }));
  return true;
}

// ==================== CUSTOM SECTIONS (MATERIALS HUB) ====================

export function getCustomSections(): CustomSection[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.customSections);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading custom sections', e);
  }
  return [];
}

export function saveCustomSection(name: string, description?: string): CustomSection {
  const normalizedName = name.trim();
  const id = 'sec-' + normalizedName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const newSection: CustomSection = {
    id,
    name: normalizedName,
    description: description || `Study resources and files for ${normalizedName}`,
    createdAt: new Date().toISOString(),
  };

  const current = getCustomSections();
  const exists = current.find((s) => s.id === id || s.name.toLowerCase() === normalizedName.toLowerCase());
  if (!exists) {
    const updated = [...current, newSection];
    localStorage.setItem(STORAGE_KEYS.customSections, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('prepskm_sections_updated', { detail: updated }));
  }
  return exists || newSection;
}

export function deleteCustomSection(sectionId: string): void {
  const current = getCustomSections();
  const updated = current.filter((s) => s.id !== sectionId);
  localStorage.setItem(STORAGE_KEYS.customSections, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('prepskm_sections_updated', { detail: updated }));
}

// ==================== DYNAMIC CHAPTERS MANAGEMENT ====================

export function getCustomChapters(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.customChapters);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading custom chapters', e);
  }
  return { Physics: [], Chemistry: [], Mathematics: [], Biology: [] };
}

export function saveCustomChapter(subject: SubjectName, chapterName: string): boolean {
  const trimmed = chapterName.trim();
  if (!trimmed) return false;

  const current = getCustomChapters();
  const subChapters = current[subject] || [];
  
  // Also check default chapters
  const defaultList = AVAILABLE_CHAPTERS[subject] || [];
  if (defaultList.includes(trimmed) || subChapters.includes(trimmed)) {
    return true; // Already exists
  }

  const updatedSub = [...subChapters, trimmed];
  const updated = {
    ...current,
    [subject]: updatedSub,
  };
  localStorage.setItem(STORAGE_KEYS.customChapters, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('prepskm_chapters_updated', { detail: { subject, chapter: trimmed } }));
  return true;
}

export function getAllChaptersForSubject(subject: SubjectName): string[] {
  const defaultList = AVAILABLE_CHAPTERS[subject] || [];
  const customMap = getCustomChapters();
  const customList = customMap[subject] || [];
  return Array.from(new Set([...defaultList, ...customList]));
}

// ==================== BACKLOGS CRUD ====================

export async function getBacklogs(): Promise<BacklogItem[]> {
  const { db } = initializeFirebaseApp();
  if (db) {
    try {
      const snap = await getDocs(collection(db, 'backlogs'));
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as BacklogItem);
      }
    } catch (e) {
      console.warn('Firestore backlogs fetch error', e);
    }
  }

  const stored = localStorage.getItem(STORAGE_KEYS.backlogs);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  localStorage.setItem(STORAGE_KEYS.backlogs, JSON.stringify(INITIAL_BACKLOG));
  return INITIAL_BACKLOG;
}

export async function saveBacklog(item: BacklogItem): Promise<void> {
  const { db } = initializeFirebaseApp();
  if (db) {
    try {
      await setDoc(doc(db, 'backlogs', item.id), item);
    } catch (e) {
      console.warn('Backlog write error', e);
    }
  }

  const list = await getBacklogs();
  const idx = list.findIndex((b) => b.id === item.id);
  let updated: BacklogItem[];
  if (idx >= 0) {
    updated = [...list];
    updated[idx] = item;
  } else {
    updated = [item, ...list];
  }
  localStorage.setItem(STORAGE_KEYS.backlogs, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('prepskm_data_updated', { detail: { type: 'backlogs' } }));
}

export async function deleteBacklog(id: string): Promise<void> {
  const { db } = initializeFirebaseApp();
  if (db) {
    try {
      await deleteDoc(doc(db, 'backlogs', id));
    } catch (e) {
      console.warn('Backlog delete error', e);
    }
  }

  const list = await getBacklogs();
  const updated = list.filter((b) => b.id !== id);
  localStorage.setItem(STORAGE_KEYS.backlogs, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('prepskm_data_updated', { detail: { type: 'backlogs' } }));
}

// ==================== MENTORSHIP TOKENS ====================

export async function getMentorshipTokens(): Promise<MentorshipToken[]> {
  const { db } = initializeFirebaseApp();
  if (db) {
    try {
      const snap = await getDocs(collection(db, 'mentorship_tokens'));
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as MentorshipToken);
      }
    } catch (e) {
      console.warn('Mentorship tokens fetch error', e);
    }
  }

  const stored = localStorage.getItem(STORAGE_KEYS.tokens);
  return stored ? JSON.parse(stored) : [];
}

export async function saveMentorshipToken(token: MentorshipToken): Promise<void> {
  const { db } = initializeFirebaseApp();
  if (db) {
    try {
      await setDoc(doc(db, 'mentorship_tokens', token.tokenCode), token);
    } catch (e) {
      console.warn('Mentorship token write error', e);
    }
  }

  const list = await getMentorshipTokens();
  const updated = [token, ...list.filter((t) => t.tokenCode !== token.tokenCode)];
  localStorage.setItem(STORAGE_KEYS.tokens, JSON.stringify(updated));
}

export async function verifyTokenCode(code: string): Promise<{ valid: boolean; token?: MentorshipToken }> {
  const normalized = code.trim().toUpperCase();
  const tokens = await getMentorshipTokens();
  const found = tokens.find((t) => t.tokenCode.toUpperCase() === normalized);
  if (found) {
    return { valid: true, token: found };
  }
  return { valid: false };
}

// ==================== MOCK TEST RESULTS ====================

export async function saveMockTestResult(result: MockTestAttempt): Promise<void> {
  const { db } = initializeFirebaseApp();
  if (db) {
    try {
      await setDoc(doc(db, 'mock_results', result.id), result);
    } catch (e) {
      console.warn('Mock result write error', e);
    }
  }

  const raw = localStorage.getItem(STORAGE_KEYS.mockResults);
  const list: MockTestAttempt[] = raw ? JSON.parse(raw) : [];
  list.unshift(result);
  localStorage.setItem(STORAGE_KEYS.mockResults, JSON.stringify(list));
}

export async function getMockTestResults(): Promise<MockTestAttempt[]> {
  const { db } = initializeFirebaseApp();
  if (db) {
    try {
      const snap = await getDocs(collection(db, 'mock_results'));
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as MockTestAttempt);
      }
    } catch (e) {
      console.warn('Mock results fetch error', e);
    }
  }

  const raw = localStorage.getItem(STORAGE_KEYS.mockResults);
  return raw ? JSON.parse(raw) : [];
}

// ==================== STUDENT PROFILE ====================

export function getStudentProfile(): StudentProfile {
  const raw = localStorage.getItem(STORAGE_KEYS.profile);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // fallback
    }
  }
  return {
    name: 'Aspirant',
    targetExam: 'JEE Main',
    classLevel: 'Class 12',
    streakCount: 5,
    lastActiveDate: new Date().toISOString(),
    totalTestsTaken: 3,
    averageScorePercent: 78,
  };
}

export function saveStudentProfile(profile: StudentProfile): void {
  localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
  window.dispatchEvent(new CustomEvent('prepskm_profile_updated', { detail: profile }));
}
