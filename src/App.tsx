import React, { useState, useEffect } from 'react';
import {
  Flame,
  BookOpen,
  GraduationCap,
  Sparkles,
  ShieldAlert,
  Youtube,
  Instagram,
  Send,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Target,
  Award,
  Info,
  PenTool
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { UniversalSearchModal } from './components/UniversalSearchModal';
import { StudentOnboardingModal } from './components/StudentOnboardingModal';
import { AuthModal } from './components/AuthModal';
import { BacklogTracker } from './components/BacklogTracker';
import { MaterialsHub } from './components/MaterialsHub';
import { MockTestPortal } from './components/MockTestPortal';
import { MentorshipBooking } from './components/MentorshipBooking';
import { AdminPanel } from './components/AdminPanel';
import { StudyNotificationModal } from './components/StudyNotificationModal';
import { CampaignHubModal } from './components/CampaignHubModal';
import { TestHistory } from './components/TestHistory';
import { AboutSection } from './components/AboutSection';
import { MentorVideosHub } from './components/MentorVideosHub';
import { SiteCustomizerModal } from './components/SiteCustomizerModal';

import {
  Question,
  StudyMaterial,
  BacklogItem,
  StudentProfile,
  MockTestAttempt,
  Mentor,
  MentorVideo,
  SiteCustomization
} from './types';
import {
  getQuestions,
  getMaterials,
  getBacklogs,
  getStudentProfile,
  subscribeToAuth,
  logout,
  isUserAdmin,
  isSuperAdmin,
  subscribeToBacklogsRealtime,
  subscribeToMaterialsRealtime,
  subscribeToQuestionsRealtime,
  getMentors,
  getMentorVideos,
  getSiteCustomization,
  applySiteCustomization,
  subscribeToMentorsRealtime,
  subscribeToMentorVideosRealtime
} from './lib/firebase';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'tracker' | 'materials' | 'mentor_videos' | 'mock_tests' | 'history' | 'mentorship' | 'about' | 'admin'>('tracker');
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(getStudentProfile());
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [reattemptData, setReattemptData] = useState<MockTestAttempt | null>(null);
  const [isGreetingDismissed, setIsGreetingDismissed] = useState(false);
  const [siteCustomization, setSiteCustomization] = useState<SiteCustomization>(getSiteCustomization());

  // Data states
  const [questions, setQuestions] = useState<Question[]>([]);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [backlogs, setBacklogs] = useState<BacklogItem[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [mentorVideos, setMentorVideos] = useState<MentorVideo[]>([]);

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isCampaignOpen, setIsCampaignOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Cross-component deep link states
  const [preselectedChapter, setPreselectedChapter] = useState<{ subject: string; chapter: string } | null>(null);
  const [selectedMaterialFromSearch, setSelectedMaterialFromSearch] = useState<StudyMaterial | null>(null);

  // Subscribe to Firebase Auth and initial data + Real-time Firestore Listeners
  useEffect(() => {
    applySiteCustomization(siteCustomization);

    const unsubscribeAuth = subscribeToAuth((user) => {
      setCurrentUser(user);
    });

    const refreshData = async () => {
      const [q, m, b, men, vids] = await Promise.all([
        getQuestions(),
        getMaterials(),
        getBacklogs(),
        getMentors(),
        getMentorVideos()
      ]);
      setQuestions(q);
      setMaterials(m);
      setBacklogs(b);
      setMentors(men);
      setMentorVideos(vids);
    };

    refreshData();

    // Attach Realtime Firestore Listeners for instant multi-user cloud sync
    const unsubBacklogs = subscribeToBacklogsRealtime((items) => {
      setBacklogs(items);
    });
    const unsubMaterials = subscribeToMaterialsRealtime((items) => {
      setMaterials(items);
    });
    const unsubQuestions = subscribeToQuestionsRealtime((items) => {
      setQuestions(items);
    });
    const unsubMentors = subscribeToMentorsRealtime((items) => {
      setMentors(items);
    });
    const unsubVideos = subscribeToMentorVideosRealtime((items) => {
      setMentorVideos(items);
    });

    // Customization update listener
    const handleCustomizationUpdate = (e: any) => {
      if (e.detail) {
        setSiteCustomization(e.detail);
        applySiteCustomization(e.detail);
      }
    };
    window.addEventListener('prepskm_customization_updated', handleCustomizationUpdate);

    // Event listener for local data updates
    const handleDataUpdate = () => refreshData();
    window.addEventListener('prepskm_data_updated', handleDataUpdate);

    // Profile listener
    const handleProfileUpdate = (e: any) => {
      if (e.detail) setStudentProfile(e.detail);
    };
    window.addEventListener('prepskm_profile_updated', handleProfileUpdate);

    // Check first visit for onboarding without blocking dashboard
    try {
      const hasSeenOnboarding = localStorage.getItem('prepskm_onboarded');
      // If student hasn't onboarded yet, mark it visited so dashboard is immediately visible
      if (!hasSeenOnboarding) {
        localStorage.setItem('prepskm_onboarded', 'true');
      }
    } catch (e) {
      console.warn('LocalStorage access note:', e);
    }

    return () => {
      unsubscribeAuth();
      unsubBacklogs();
      unsubMaterials();
      unsubQuestions();
      unsubMentors();
      unsubVideos();
      window.removeEventListener('prepskm_customization_updated', handleCustomizationUpdate);
      window.removeEventListener('prepskm_data_updated', handleDataUpdate);
      window.removeEventListener('prepskm_profile_updated', handleProfileUpdate);
    };
  }, []);

  // Global keyboard shortcut for search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    await logout();
    if (currentTab === 'admin') {
      setCurrentTab('tracker');
    }
  };

  const handleOnboardingComplete = (updated: StudentProfile) => {
    setStudentProfile(updated);
    localStorage.setItem('prepskm_onboarded', 'true');
    setIsOnboardingOpen(false);
  };

  // Jump from search into mock test with a specific chapter
  const handleSelectChapterFromSearch = (subject: string, chapter: string) => {
    setPreselectedChapter({ subject, chapter });
    setCurrentTab('mock_tests');
  };

  // Jump from search into materials hub with selected item
  const handleSelectMaterialFromSearch = (material: StudyMaterial) => {
    setSelectedMaterialFromSearch(material);
    setCurrentTab('materials');
  };

  // Guard admin view
  const isAdmin = currentUser && isUserAdmin(currentUser.email);
  const activeView = currentTab === 'admin' && !isAdmin ? 'tracker' : currentTab;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-150">
      {/* Top Navbar */}
      <Navbar
        currentTab={activeView}
        onSelectTab={(tab) => {
          if (tab === 'admin' && !isAdmin) {
            setIsAuthOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        studentProfile={studentProfile}
        currentUser={currentUser}
        siteCustomization={siteCustomization}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onOpenCampaign={() => setIsCampaignOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenCustomizer={() => setIsCustomizerOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6 pb-24 md:pb-8">
        {/* Dynamic Personalized Greeting Banner - Dismissible to save vertical space on mobile screens */}
        {activeView !== 'admin' && activeView !== 'about' && !isGreetingDismissed && (
          <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative">
            <div className="space-y-1 pr-6 md:pr-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Target: {studentProfile.targetExam} ({studentProfile.classLevel})
                </span>
                <span className="text-slate-400 dark:text-slate-600 hidden sm:inline">•</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">Daily Study Engine</span>
              </div>
              <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {siteCustomization.heroHeadline || `Welcome back, ${studentProfile.name}! Ready to conquer ${studentProfile.targetExam}?`}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                {siteCustomization.heroSubheadline || 'Discipline beats talent every time. Clear your pending backlogs and take a balanced mock test.'}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-between sm:justify-start">
              <button
                onClick={() => setCurrentTab('mock_tests')}
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                <GraduationCap className="w-4 h-4" /> Start Mock Test
              </button>
              <button
                onClick={() => setCurrentTab('history')}
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-indigo-600 dark:text-indigo-300 border border-slate-300 dark:border-indigo-500/30 font-bold text-xs transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                <TrendingUp className="w-4 h-4" /> Score Progress
              </button>
              <button
                onClick={() => setIsGreetingDismissed(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Hide greeting banner"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: Backlog Destroyer */}
        {activeView === 'tracker' && (
          <BacklogTracker backlogs={backlogs} streakCount={studentProfile.streakCount} />
        )}

        {/* Tab 2: Study Materials Hub */}
        {activeView === 'materials' && (
          <MaterialsHub
            materials={materials}
            selectedMaterialFromSearch={selectedMaterialFromSearch}
            onClearSelectedMaterial={() => setSelectedMaterialFromSearch(null)}
          />
        )}

        {/* Tab: Mentor Videos Hub */}
        {activeView === 'mentor_videos' && (
          <MentorVideosHub
            videos={mentorVideos}
            mentors={mentors}
            currentUser={currentUser}
            onRefreshVideos={async () => {
              const v = await getMentorVideos();
              setMentorVideos(v);
            }}
            onRefreshMentors={async () => {
              const m = await getMentors();
              setMentors(m);
            }}
          />
        )}

        {/* Tab 3: NTA CBT Mock Test Engine */}
        {activeView === 'mock_tests' && (
          <MockTestPortal
            questions={questions}
            studentName={studentProfile.name}
            defaultExamTarget={studentProfile.targetExam}
            preselectedChapter={preselectedChapter}
            onClearPreselectedChapter={() => setPreselectedChapter(null)}
            reattemptData={reattemptData}
            onClearReattempt={() => setReattemptData(null)}
            onViewHistory={() => setCurrentTab('history')}
          />
        )}

        {/* Tab 4: Mock Test History & Recharts Visualization */}
        {activeView === 'history' && (
          <TestHistory
            studentName={studentProfile.name}
            targetExam={studentProfile.targetExam}
            onReattemptTest={(attempt) => {
              setReattemptData(attempt);
              setCurrentTab('mock_tests');
            }}
            onStartNewTest={() => setCurrentTab('mock_tests')}
          />
        )}

        {/* Tab 5: 1:1 Mentorship Booking */}
        {activeView === 'mentorship' && (
          <MentorshipBooking
            initialStudentName={studentProfile.name}
            initialExamTarget={studentProfile.targetExam}
          />
        )}

        {/* Tab 6: About Prepskm Section */}
        {activeView === 'about' && (
          <AboutSection
            onStartMockTest={() => setCurrentTab('mock_tests')}
            onOpenBacklog={() => setCurrentTab('tracker')}
            onBookMentor={() => setCurrentTab('mentorship')}
          />
        )}

        {/* Tab 7: Secure Admin Panel (Protected) */}
        {activeView === 'admin' && isAdmin && (
          <AdminPanel
            questions={questions}
            materials={materials}
            currentAdminEmail={currentUser.email}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 py-8 px-4 sm:px-6 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500 dark:text-slate-400">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="font-extrabold text-slate-900 dark:text-white text-sm">PREPSKM</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                Engineered for Aspirants
              </span>
            </div>
            <p className="text-slate-500">
              Created by Sumit (@unfiltereddsumit) • Purely Distraction-Free JEE, NEET & Boards Preparation.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
            <button
              onClick={() => setCurrentTab('about')}
              className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <Info className="w-3.5 h-3.5" /> About Us
            </button>
            <a
              href="https://t.me/prepskm"
              target="_blank"
              rel="noreferrer"
              className="hover:text-sky-500 dark:hover:text-sky-400 transition flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" /> Telegram @prepskm
            </a>
            <a
              href="https://t.me/unfiltreddsumit"
              target="_blank"
              rel="noreferrer"
              className="hover:text-sky-500 dark:hover:text-sky-300 transition flex items-center gap-1"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Chat @unfiltreddsumit
            </a>
            <a
              href="https://youtube.com/@unfiltereddsumit"
              target="_blank"
              rel="noreferrer"
              className="hover:text-rose-500 dark:hover:text-rose-400 transition flex items-center gap-1"
            >
              <Youtube className="w-3.5 h-3.5" /> YouTube
            </a>
            <a
              href="https://instagram.com/unfiltereddsumit"
              target="_blank"
              rel="noreferrer"
              className="hover:text-pink-500 dark:hover:text-pink-400 transition flex items-center gap-1"
            >
              <Instagram className="w-3.5 h-3.5" /> Instagram
            </a>
          </div>
        </div>
      </footer>

      {/* Study Notification Modal (Distraction-free reminders) */}
      <StudyNotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        streak={studentProfile.streakCount || 5}
        targetExam={studentProfile.targetExam || 'JEE Main'}
      />

      {/* Universal Search Modal */}
      <UniversalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        materials={materials}
        questions={questions}
        onSelectChapter={handleSelectChapterFromSearch}
        onSelectMaterial={handleSelectMaterialFromSearch}
      />

      {/* Student Onboarding & Profile Modal */}
      <StudentOnboardingModal
        isOpen={isOnboardingOpen}
        initialProfile={studentProfile}
        currentUser={currentUser}
        onClose={handleOnboardingComplete}
      />

      {/* Auth Modal with Google Sign-In */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          if (isUserAdmin(user?.email)) {
            setCurrentTab('admin');
          }
        }}
      />

      {/* Campaign Promotional Hub Modal */}
      <CampaignHubModal
        isOpen={isCampaignOpen}
        onClose={() => setIsCampaignOpen(false)}
      />

      {/* Whole Website Customizer Modal (Super Admin Only) */}
      <SiteCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        onCustomizationUpdated={(updated) => setSiteCustomization(updated)}
      />

      {/* Corner Floating Pen Icon for Super Admin Live Website Customizer */}
      {isSuperAdmin(currentUser?.email) && (
        <button
          onClick={() => setIsCustomizerOpen(true)}
          className="fixed bottom-20 md:bottom-6 right-5 md:right-6 z-40 p-3 sm:px-4 sm:py-3 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center gap-2 group ring-4 ring-amber-400/30 cursor-pointer animate-fade-in"
          title="Whole Website Customizer (Super Admin Only)"
          aria-label="Customize Website"
        >
          <PenTool className="w-5 h-5 group-hover:rotate-45 transition duration-300" />
          <span className="hidden sm:inline text-xs font-black tracking-wide">
            Site Customizer
          </span>
        </button>
      )}
    </div>
  );
}
