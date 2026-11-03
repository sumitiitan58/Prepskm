import React, { useState } from 'react';
import {
  Video,
  Play,
  Plus,
  Trash2,
  Edit3,
  User,
  Sparkles,
  ExternalLink,
  Send,
  GraduationCap,
  CheckCircle,
  Eye,
  Clock,
  BookOpen,
  X
} from 'lucide-react';
import { MentorVideo, Mentor, SubjectName } from '../types';
import {
  saveMentorVideo,
  deleteMentorVideo,
  saveMentor,
  isUserMentor,
  isSuperAdmin
} from '../lib/firebase';

interface MentorVideosHubProps {
  videos: MentorVideo[];
  mentors: Mentor[];
  currentUser: any;
  onRefreshVideos: () => void;
  onRefreshMentors: () => void;
}

export const MentorVideosHub: React.FC<MentorVideosHubProps> = ({
  videos,
  mentors,
  currentUser,
  onRefreshVideos,
  onRefreshMentors,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [activeVideoModal, setActiveVideoModal] = useState<MentorVideo | null>(null);
  
  // Modals for Mentor Actions
  const [isAddVideoModalOpen, setIsAddVideoModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  // Form states for adding video
  const [vTitle, setVTitle] = useState('');
  const [vUrl, setVUrl] = useState('');
  const [vSubject, setVSubject] = useState<SubjectName>('Physics');
  const [vChapter, setVChapter] = useState('');
  const [vDescription, setVDescription] = useState('');
  const [vDuration, setVDuration] = useState('15:00');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states for mentor editing their own bio/description
  const currentEmail = currentUser?.email?.toLowerCase().trim() || '';
  const currentMentorProfile = mentors.find(
    (m) => m.email.toLowerCase().trim() === currentEmail
  );

  const [editBio, setEditBio] = useState(currentMentorProfile?.bio || '');
  const [editName, setEditName] = useState(currentMentorProfile?.name || currentUser?.displayName || '');
  const [editTagline, setEditTagline] = useState(currentMentorProfile?.tagline || '');
  const [editImageUrl, setEditImageUrl] = useState(currentMentorProfile?.imageUrl || '');
  const [editTelegram, setEditTelegram] = useState(currentMentorProfile?.telegramUsername || '');

  const canUploadVideo = currentUser && (isUserMentor(currentEmail) || isSuperAdmin(currentEmail));
  const canEditBio = Boolean(currentMentorProfile);

  const filteredVideos = selectedSubject === 'All'
    ? videos
    : videos.filter((v) => v.subject === selectedSubject);

  const handleCreateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vTitle.trim() || !vUrl.trim()) return;

    setIsSubmitting(true);
    const mentorInfo = currentMentorProfile || {
      id: 'mentor-' + Date.now(),
      name: currentUser?.displayName || 'Faculty Mentor',
      email: currentEmail,
      imageUrl: currentUser?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    };

    const newVid: MentorVideo = {
      id: 'vid-' + Date.now(),
      mentorId: mentorInfo.id,
      mentorName: mentorInfo.name,
      mentorEmail: mentorInfo.email,
      mentorImage: mentorInfo.imageUrl,
      title: vTitle.trim(),
      description: vDescription.trim() || 'Concept explanation and problem-solving strategy lecture by faculty mentor.',
      videoUrl: vUrl.trim(),
      subject: vSubject,
      chapter: vChapter.trim() || undefined,
      duration: vDuration.trim() || '20:00',
      createdAt: new Date().toISOString(),
      viewsCount: Math.floor(50 + Math.random() * 200),
    };

    await saveMentorVideo(newVid);
    setIsSubmitting(false);
    setIsAddVideoModalOpen(false);
    setVTitle('');
    setVUrl('');
    setVDescription('');
    setVChapter('');
    onRefreshVideos();
  };

  const handleSaveMentorBio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMentorProfile) return;

    const updatedMentor: Mentor = {
      ...currentMentorProfile,
      name: editName.trim() || currentMentorProfile.name,
      bio: editBio.trim() || currentMentorProfile.bio,
      tagline: editTagline.trim() || currentMentorProfile.tagline,
      imageUrl: editImageUrl.trim() || currentMentorProfile.imageUrl,
      telegramUsername: editTelegram.trim() || currentMentorProfile.telegramUsername,
    };

    await saveMentor(updatedMentor);
    setIsEditProfileModalOpen(false);
    onRefreshMentors();
  };

  const handleDeleteVideo = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this mentor video lecture?')) {
      await deleteMentorVideo(id);
      onRefreshVideos();
    }
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/25 relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-300 font-bold text-xs border border-rose-500/30 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5" /> Mentor Video Hub
              </span>
              <span className="text-xs text-slate-300 font-semibold">Zero Clickbait • Direct Concepts</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Faculty Lectures & Strategy Masterclasses
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Watch step-by-step chapter shortcuts, backlog destruction strategies, and high-yield PYQ solutions directly from verified Prepskm faculty mentors.
            </p>
          </div>

          {/* Action buttons for mentors & admins */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {canEditBio && (
              <button
                onClick={() => {
                  setEditBio(currentMentorProfile?.bio || '');
                  setEditName(currentMentorProfile?.name || '');
                  setEditTagline(currentMentorProfile?.tagline || '');
                  setEditImageUrl(currentMentorProfile?.imageUrl || '');
                  setEditTelegram(currentMentorProfile?.telegramUsername || '');
                  setIsEditProfileModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition flex items-center gap-2 active:scale-95"
              >
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span>Edit My Mentor Bio</span>
              </button>
            )}

            {canUploadVideo && (
              <button
                onClick={() => setIsAddVideoModalOpen(true)}
                className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ Upload Mentor Video</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Subject Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-bold">
        {['All', 'Physics', 'Chemistry', 'Mathematics', 'Biology', 'General Strategy'].map((sub) => (
          <button
            key={sub}
            onClick={() => setSelectedSubject(sub)}
            className={`px-4 py-2 rounded-2xl transition shrink-0 ${
              selectedSubject === sub
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-400'
            }`}
          >
            {sub}
          </button>
        ))}
      </div>

      {/* Videos Grid */}
      {filteredVideos.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <Video className="w-10 h-10 mx-auto text-slate-400 mb-2" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No videos found for {selectedSubject}</p>
          <p className="text-xs text-slate-500 mt-1">Check back soon or select another subject category above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((vid) => {
            const mentor = mentors.find((m) => m.email.toLowerCase() === vid.mentorEmail.toLowerCase());
            const isCreatorOrAdmin =
              currentUser &&
              (isSuperAdmin(currentEmail) || currentEmail === vid.mentorEmail.toLowerCase());

            return (
              <div
                key={vid.id}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col group"
              >
                {/* Video Thumbnail / Preview Area */}
                <div
                  onClick={() => setActiveVideoModal(vid)}
                  className="aspect-video bg-slate-950 relative overflow-hidden cursor-pointer group-hover:brightness-105 transition"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10" />
                  
                  {/* Subject & Duration Badges */}
                  <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-600/90 text-white font-bold text-[10px] tracking-wide uppercase backdrop-blur-md">
                      {vid.subject}
                    </span>
                    {vid.chapter && (
                      <span className="px-2 py-0.5 rounded-lg bg-black/60 text-slate-200 font-semibold text-[10px] backdrop-blur-md truncate max-w-[140px]">
                        {vid.chapter}
                      </span>
                    )}
                  </div>

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xl shadow-rose-600/40 group-hover:scale-110 transition duration-200">
                      <Play className="w-5 h-5 ml-0.5 fill-current" />
                    </div>
                  </div>

                  {/* Duration Pill */}
                  <div className="absolute bottom-3 right-3 z-20 px-2 py-0.5 rounded-md bg-black/80 text-white text-[11px] font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{vid.duration || '20:00'}</span>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <h3
                      onClick={() => setActiveVideoModal(vid)}
                      className="font-bold text-slate-900 dark:text-white text-base leading-snug hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition line-clamp-2"
                    >
                      {vid.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {vid.description}
                    </p>
                  </div>

                  {/* Mentor Profile & Description Section */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={vid.mentorImage || mentor?.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                          alt={vid.mentorName}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {vid.mentorName}
                          </p>
                          <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold truncate">
                            {mentor?.tagline || 'Verified Prepskm Mentor'}
                          </p>
                        </div>
                      </div>

                      {isCreatorOrAdmin && (
                        <button
                          onClick={(e) => handleDeleteVideo(vid.id, e)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition"
                          title="Delete Video"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Mentor Bio / Description Box */}
                    {mentor?.bio && (
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                        <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                          About the Mentor:
                        </span>
                        {mentor.bio}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Video Player Modal */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 flex items-center justify-between border-b border-slate-800 text-white">
              <div className="flex items-center gap-2 truncate pr-4">
                <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-[10px] uppercase">
                  {activeVideoModal.subject}
                </span>
                <span className="font-bold text-sm truncate">{activeVideoModal.title}</span>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video bg-black w-full">
              {activeVideoModal.videoUrl.includes('youtube.com') || activeVideoModal.videoUrl.includes('youtu.be') ? (
                <iframe
                  src={getEmbedUrl(activeVideoModal.videoUrl)}
                  title={activeVideoModal.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={activeVideoModal.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            <div className="p-5 space-y-3 bg-slate-950 text-slate-200">
              <h3 className="font-bold text-base text-white">{activeVideoModal.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{activeVideoModal.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Video Modal */}
      {isAddVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Video className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Upload New Mentor Video
              </h3>
              <button
                onClick={() => setIsAddVideoModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVideo} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Video Title
                </label>
                <input
                  type="text"
                  required
                  value={vTitle}
                  onChange={(e) => setVTitle(e.target.value)}
                  placeholder="e.g. Kinematics 2D: Projectile Motion Tricks"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  YouTube / Video URL
                </label>
                <input
                  type="url"
                  required
                  value={vUrl}
                  onChange={(e) => setVUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Subject
                  </label>
                  <select
                    value={vSubject}
                    onChange={(e) => setVSubject(e.target.value as SubjectName)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Biology">Biology</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Estimated Duration
                  </label>
                  <input
                    type="text"
                    value={vDuration}
                    onChange={(e) => setVDuration(e.target.value)}
                    placeholder="e.g. 24:30"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                  </input>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Chapter / Topic Name
                </label>
                <input
                  type="text"
                  value={vChapter}
                  onChange={(e) => setVChapter(e.target.value)}
                  placeholder="e.g. Laws of Motion"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={vDescription}
                  onChange={(e) => setVDescription(e.target.value)}
                  placeholder="Explain key takeaways, formulas covered, and PYQs solved..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddVideoModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Mentor Profile / Bio Modal */}
      {isEditProfileModalOpen && currentMentorProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-500" />
                Edit My Mentor Profile & Bio
              </h3>
              <button
                onClick={() => setIsEditProfileModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMentorBio} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Mentor Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Tagline / Specialization
                </label>
                <input
                  type="text"
                  value={editTagline}
                  onChange={(e) => setEditTagline(e.target.value)}
                  placeholder="e.g. Lead JEE Physics Mentor | AIR 142"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Profile Photo URL
                </label>
                <input
                  type="url"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  About Me / Bio Description
                </label>
                <textarea
                  rows={4}
                  required
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Write about your credentials, teaching style, years of experience, and how you help students crack JEE/NEET..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white leading-relaxed"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  Save Profile Bio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
