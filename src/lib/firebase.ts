import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';
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
  onSnapshot,
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
  SubjectName,
  Mentor,
  MentorVideo,
  SiteCustomization,
  UserRole
} from '../types';
import {
  INITIAL_QUESTIONS,
  INITIAL_MATERIALS,
  INITIAL_BACKLOG,
  AVAILABLE_CHAPTERS,
  INITIAL_MENTORS,
  INITIAL_MENTOR_VIDEOS,
  DEFAULT_SITE_CUSTOMIZATION
} from '../data/initialData';

const CONFIG_STORAGE_KEY = 'prepskm_firebase_config';
const ADMIN_EMAILS_KEY = 'prepskm_admin_emails';

export const PRIMARY_SUPER_ADMIN = 'saurav586kumar@gmail.com';
export const CO_SUPER_ADMIN = 'skylaneexperiment@gmail.com';

const DEFAULT_ADMINS = [
  'saurav586kumar@gmail.com',
  'skylaneexperiment@gmail.com',
  'admin@prepskm.com',
  'sumitiitan58@gmail.com',
  'unfiltereddsumit@prepskm.com'
];

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
  mentors: 'prepskm_db_mentors',
  mentorVideos: 'prepskm_db_mentor_videos',
  siteCustomization: 'prepskm_db_site_customization',
};

// Global Firebase instance references
let firebaseAppInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let firestoreInstance: Firestore | null = null;
let analyticsInstance: Analytics | null = null;

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

export function initializeFirebaseApp(customConfig?: FirebaseConfig): {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
  analytics: Analytics | null;
} {
  try {
    const config = customConfig || getSavedFirebaseConfig();
    if (!config || !config.apiKey || !config.projectId) {
      return { app: null, auth: null, db: null, analytics: null };
    }

    if (getApps().length > 0) {
      firebaseAppInstance = getApp();
    } else {
      firebaseAppInstance = initializeApp(config);
    }

    authInstance = getAuth(firebaseAppInstance);
    
    // Check if named database ID is provided and non-empty
    const databaseId = (config as any).firestoreDatabaseId;
    if (databaseId && databaseId.trim() !== '' && databaseId !== '(default)') {
      firestoreInstance = getFirestore(firebaseAppInstance, databaseId.trim());
    } else {
      firestoreInstance = getFirestore(firebaseAppInstance);
    }

    // Initialize Firebase Analytics if running in browser and supported
    if (typeof window !== 'undefined' && config.measurementId) {
      isSupported().then((supported) => {
        if (supported && firebaseAppInstance) {
          analyticsInstance = getAnalytics(firebaseAppInstance);
          console.log('Firebase Analytics initialized with measurementId:', config.measurementId);
        }
      }).catch((e) => {
        console.debug('Firebase Analytics initialization skipped:', e);
      });
    }

    return { app: firebaseAppInstance, auth: authInstance, db: firestoreInstance, analytics: analyticsInstance };
  } catch (err) {
    console.warn('Firebase initialization note (running in local synced mode):', err);
    return { app: null, auth: null, db: null, analytics: null };
  }
}

export function getFirebaseAnalytics(): Analytics | null {
  return analyticsInstance;
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

// Admin & Owner Email management
export const OWNER_EMAIL = 'saurav586kumar@gmail.com';

export function getAdminEmails(): string[] {
  try {
    const saved = localStorage.getItem(ADMIN_EMAILS_KEY);
    if (saved) {
      const list = JSON.parse(saved);
      return Array.from(new Set([PRIMARY_SUPER_ADMIN, CO_SUPER_ADMIN, ...DEFAULT_ADMINS, ...list]));
    }
  } catch {
    // fallback
  }
  return Array.from(new Set([PRIMARY_SUPER_ADMIN, CO_SUPER_ADMIN, ...DEFAULT_ADMINS]));
}

export function isOwner(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  return (
    normalized === PRIMARY_SUPER_ADMIN.toLowerCase() ||
    normalized === CO_SUPER_ADMIN.toLowerCase()
  );
}

export function isSuperAdmin(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  const adminList = getAdminEmails().map((e) => e.toLowerCase().trim());
  return adminList.includes(normalized) || isOwner(email);
}

export function isUserMentor(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  const mentors = getStoredMentors();
  return mentors.some((m) => m.email.toLowerCase().trim() === normalized);
}

export function isUserAdmin(email?: string | null): boolean {
  if (!email) return false;
  return isSuperAdmin(email) || isUserMentor(email);
}

export function getUserRole(email?: string | null): UserRole {
  if (isSuperAdmin(email)) return 'super_admin';
  if (isUserMentor(email)) return 'mentor';
  return 'student';
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

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const { auth } = initializeFirebaseApp();
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Info: ', JSON.stringify(errInfo));
}

export async function loginWithGoogle(): Promise<{ success: boolean; user?: any; error?: string }> {
  const { auth, db } = initializeFirebaseApp();
  if (auth) {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      const user = cred.user;

      if (user) {
        // Sync student profile with Google account name if available
        const currentProfile = getStudentProfile();
        if (user.displayName && currentProfile.name === 'Aspirant') {
          currentProfile.name = user.displayName;
          localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(currentProfile));
          window.dispatchEvent(new CustomEvent('prepskm_profile_updated', { detail: currentProfile }));
        }

        if (db) {
          try {
            await setDoc(doc(db, 'users', user.uid), {
              uid: user.uid,
              email: user.email || '',
              name: user.displayName || currentProfile.name,
              targetExam: currentProfile.targetExam,
              classLevel: currentProfile.classLevel,
              updatedAt: new Date().toISOString()
            }, { merge: true });
          } catch (e) {
            handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}`);
          }
        }
      }

      return { success: true, user };
    } catch (err: any) {
      console.warn('Google Sign-in popup notice, falling back to local sync:', err);
      const currentProfile = getStudentProfile();
      const mockUser = {
        uid: 'student-' + Date.now(),
        email: `${currentProfile.name.toLowerCase().replace(/\s+/g, '')}@aspirant.prepskm.com`,
        displayName: currentProfile.name || 'Student Aspirant',
      };
      localStorage.setItem(STORAGE_KEYS.mockUser, JSON.stringify(mockUser));
      window.dispatchEvent(new CustomEvent('prepskm_auth_state_changed', { detail: mockUser }));
      return { success: true, user: mockUser };
    }
  }

  const currentProfile = getStudentProfile();
  const mockUser = {
    uid: 'student-' + Date.now(),
    email: `${currentProfile.name.toLowerCase().replace(/\s+/g, '')}@aspirant.prepskm.com`,
    displayName: currentProfile.name || 'Student Aspirant',
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
  const { auth, db } = initializeFirebaseApp();
  const enhancedResult = {
    ...result,
    userId: auth?.currentUser?.uid || 'guest-aspirant',
    submittedAt: result.submittedAt || new Date().toISOString()
  };

  if (db) {
    try {
      await setDoc(doc(db, 'mock_results', result.id), enhancedResult);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `mock_results/${result.id}`);
    }
  }

  const raw = localStorage.getItem(STORAGE_KEYS.mockResults);
  const list: MockTestAttempt[] = raw ? JSON.parse(raw) : [];
  list.unshift(enhancedResult);
  localStorage.setItem(STORAGE_KEYS.mockResults, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent('prepskm_data_updated', { detail: { type: 'mock_results' } }));
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
      handleFirestoreError(e, OperationType.GET, 'mock_results');
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

export async function saveStudentProfile(profile: StudentProfile): Promise<void> {
  localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
  window.dispatchEvent(new CustomEvent('prepskm_profile_updated', { detail: profile }));

  const { auth, db } = initializeFirebaseApp();
  if (db && auth?.currentUser) {
    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email || '',
        name: profile.name,
        targetExam: profile.targetExam,
        classLevel: profile.classLevel,
        streakCount: profile.streakCount,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${auth.currentUser.uid}`);
    }
  }
}

// ==================== REAL-TIME FIRESTORE SUBSCRIPTIONS ====================

export function subscribeToBacklogsRealtime(callback: (items: BacklogItem[]) => void): () => void {
  const { db } = initializeFirebaseApp();
  if (db) {
    try {
      const unsub = onSnapshot(collection(db, 'backlogs'), (snapshot) => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map((d) => d.data() as BacklogItem);
          localStorage.setItem(STORAGE_KEYS.backlogs, JSON.stringify(items));
          callback(items);
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'backlogs');
      });
      return unsub;
    } catch (e) {
      console.warn('Realtime backlogs listener fallback', e);
    }
  }
  return () => {};
}

export function subscribeToMaterialsRealtime(callback: (items: StudyMaterial[]) => void): () => void {
  const { db } = initializeFirebaseApp();
  if (db) {
    try {
      const unsub = onSnapshot(collection(db, 'materials'), (snapshot) => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map((d) => d.data() as StudyMaterial);
          localStorage.setItem(STORAGE_KEYS.materials, JSON.stringify(items));
          callback(items);
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'materials');
      });
      return unsub;
    } catch (e) {
      console.warn('Realtime materials listener fallback', e);
    }
  }
  return () => {};
}

export function subscribeToQuestionsRealtime(callback: (items: Question[]) => void): () => void {
  const { db } = initializeFirebaseApp();
  if (db) {
    try {
      const unsub = onSnapshot(collection(db, 'questions'), (snapshot) => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map((d) => d.data() as Question);
          localStorage.setItem(STORAGE_KEYS.questions, JSON.stringify(items));
          callback(items);
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'questions');
      });
      return unsub;
    } catch (e) {
      console.warn('Realtime questions listener fallback', e);
    }
  }
  return () => {};
}

export function subscribeToMockResultsRealtime(callback: (items: MockTestAttempt[]) => void): () => void {
  const { db } = initializeFirebaseApp();
  if (db) {
    try {
      const unsub = onSnapshot(collection(db, 'mock_results'), (snapshot) => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map((d) => d.data() as MockTestAttempt);
          localStorage.setItem(STORAGE_KEYS.mockResults, JSON.stringify(items));
          callback(items);
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'mock_results');
      });
      return unsub;
    } catch (e) {
      console.warn('Realtime mock results listener fallback', e);
    }
  }
  return () => {};
}

// ==================== MENTORS CRUD & REALTIME ====================

export function getStoredMentors(): Mentor[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.mentors);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error reading stored mentors', e);
  }
  return INITIAL_MENTORS;
}

export async function getMentors(): Promise<Mentor[]> {
  const { db } = initializeFirebaseApp();
  if (db) {
    try {
      const snap = await getDocs(collection(db, 'mentors'));
      if (!snap.empty) {
        const items = snap.docs.map((d) => d.data() as Mentor);
        localStorage.setItem(STORAGE_KEYS.mentors, JSON.stringify(items));
        return items;
      }
    } catch (e) {
      console.warn('Error fetching mentors from Firestore, using local store', e);
    }
  }
  const local = getStoredMentors();
  localStorage.setItem(STORAGE_KEYS.mentors, JSON.stringify(local));
  return local;
}

export async function saveMentor(mentor: Mentor): Promise<boolean> {
  const { db } = initializeFirebaseApp();
  if (db) {
    try {
      await setDoc(doc(db, 'mentors', mentor.id), mentor, { merge: true });
    } catch (e) {
      console.warn('Firestore mentor save note:', e);
    }
  }

  const current = getStoredMentors();
  const idx = current.findIndex((m) => m.id === mentor.id || m.email.toLowerCase() === mentor.email.toLowerCase());
  let updated: Mentor[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = mentor;
  } else {
    updated = [mentor, ...current];
  }
  localStorage.setItem(STORAGE_KEYS.mentors, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('prepskm_mentors_updated', { detail: updated }));
  return true;
}

export async function deleteMentor(mentorId: string): Promise<boolean> {
  const { db } = initializeFirebaseApp();
  if (db) {
    try {
      await deleteDoc(doc(db, 'mentors', mentorId));
    } catch (e) {
      console.warn('Firestore mentor delete note:', e);
    }
  }

  const current = getStoredMentors();
  const updated = current.filter((m) => m.id !== mentorId);
  localStorage.setItem(STORAGE_KEYS.mentors, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('prepskm_mentors_updated', { detail: updated }));
  return true;
}

export function subscribeToMentorsRealtime(callback: (mentors: Mentor[]) => void): () => void {
  const { db } = initializeFirebaseApp();
  if (db) {
    try {
      const unsub = onSnapshot(collection(db, 'mentors'), (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map((d) => d.data() as Mentor);
          localStorage.setItem(STORAGE_KEYS.mentors, JSON.stringify(items));
          callback(items);
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'mentors');
      });
      return unsub;
    } catch (e) {
      console.warn('Realtime mentors listener fallback', e);
    }
  }
  return () => {};
}

// ==================== MENTOR VIDEOS CRUD & REALTIME ====================

export function getStoredMentorVideos(): MentorVideo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.mentorVideos);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error reading stored mentor videos', e);
  }
  return INITIAL_MENTOR_VIDEOS;
}

export async function getMentorVideos(): Promise<MentorVideo[]> {
  const { db } = initializeFirebaseApp();
  if (db) {
    try {
      const snap = await getDocs(collection(db, 'mentor_videos'));
      if (!snap.empty) {
        const items = snap.docs.map((d) => d.data() as MentorVideo);
        localStorage.setItem(STORAGE_KEYS.mentorVideos, JSON.stringify(items));
        return items;
      }
    } catch (e) {
      console.warn('Error fetching mentor videos from Firestore, using local store', e);
    }
  }
  const local = getStoredMentorVideos();
  localStorage.setItem(STORAGE_KEYS.mentorVideos, JSON.stringify(local));
  return local;
}

export async function saveMentorVideo(video: MentorVideo): Promise<boolean> {
  const { db } = initializeFirebaseApp();
  if (db) {
    try {
      await setDoc(doc(db, 'mentor_videos', video.id), video, { merge: true });
    } catch (e) {
      console.warn('Firestore mentor video save note:', e);
    }
  }

  const current = getStoredMentorVideos();
  const idx = current.findIndex((v) => v.id === video.id);
  let updated: MentorVideo[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = video;
  } else {
    updated = [video, ...current];
  }
  localStorage.setItem(STORAGE_KEYS.mentorVideos, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('prepskm_mentor_videos_updated', { detail: updated }));
  return true;
}

export async function deleteMentorVideo(videoId: string): Promise<boolean> {
  const { db } = initializeFirebaseApp();
  if (db) {
    try {
      await deleteDoc(doc(db, 'mentor_videos', videoId));
    } catch (e) {
      console.warn('Firestore mentor video delete note:', e);
    }
  }

  const current = getStoredMentorVideos();
  const updated = current.filter((v) => v.id !== videoId);
  localStorage.setItem(STORAGE_KEYS.mentorVideos, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('prepskm_mentor_videos_updated', { detail: updated }));
  return true;
}

export function subscribeToMentorVideosRealtime(callback: (videos: MentorVideo[]) => void): () => void {
  const { db } = initializeFirebaseApp();
  if (db) {
    try {
      const unsub = onSnapshot(collection(db, 'mentor_videos'), (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map((d) => d.data() as MentorVideo);
          localStorage.setItem(STORAGE_KEYS.mentorVideos, JSON.stringify(items));
          callback(items);
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'mentor_videos');
      });
      return unsub;
    } catch (e) {
      console.warn('Realtime mentor videos listener fallback', e);
    }
  }
  return () => {};
}

// ==================== SITE CUSTOMIZATION (WHOLE WEBSITE) ====================

export function getSiteCustomization(): SiteCustomization {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.siteCustomization);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SITE_CUSTOMIZATION, ...parsed };
    }
  } catch (e) {
    console.error('Error reading site customization', e);
  }
  return DEFAULT_SITE_CUSTOMIZATION;
}

export async function saveSiteCustomization(customization: SiteCustomization): Promise<boolean> {
  const { db } = initializeFirebaseApp();
  if (db) {
    try {
      await setDoc(doc(db, 'site_settings', 'customization'), customization, { merge: true });
    } catch (e) {
      console.warn('Firestore site customization save note:', e);
    }
  }

  localStorage.setItem(STORAGE_KEYS.siteCustomization, JSON.stringify(customization));
  applySiteCustomization(customization);
  window.dispatchEvent(new CustomEvent('prepskm_customization_updated', { detail: customization }));
  return true;
}

export function applySiteCustomization(customization: SiteCustomization): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (customization.primaryColor) {
    root.style.setProperty('--brand-primary', customization.primaryColor);
  }
  if (customization.accentColor) {
    root.style.setProperty('--brand-accent', customization.accentColor);
  }
}

