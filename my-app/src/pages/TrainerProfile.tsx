import React, { useState, useEffect } from "react";

// Reusable Components
import TrainerNavbar from "../components/TrainerNavbar";
import Footer from "../components/Footer";
import LoadingIndicator from "../components/LoadingIndicator";
import SkeletonLoader from "../components/SkeletonLoader";

// Global Context
import { useLanguage } from "../context/LanguageContext";
// API base URL — single source of truth
import { BASE_URL } from "../services/api";

// Types reused from the mocks module (no runtime mock calls — API layer below is real)
import type { TrainerProfile as ApiTrainerProfile } from "../mocks/mockApi";

// Trainer basic contact and metrics interface
interface TrainerState {
  email: string;
  phone: string;
  students: number;
  rating: number;
}

// Editable trainer profile details interface
interface EditedDataState {
  fullName: string;
  specialization: string;
  bio: string;
  email: string;
  experienceVal: string;
}

// Course details interface
interface CourseItem {
  id: number;
  title: string;
  students: number;
  status: "published" | "underReview";
}

// Maps the raw mockApi trainer profile fields into the local editable-form shape, localized by lang
function apiToProfile(apiProfile: ApiTrainerProfile, lang: "ar" | "en"): EditedDataState {
  return {
    fullName: apiProfile.name,
    specialization: lang === "ar" ? (apiProfile.specialtyAr || apiProfile.specialty) : apiProfile.specialty,
    bio: lang === "ar" ? (apiProfile.bioAr || apiProfile.bio) : apiProfile.bio,
    email: apiProfile.email,
    experienceVal: `${apiProfile.experience}`,
  };
}

// Maps the raw mockApi course records (published/review) into the local table shape (published/underReview), localized by lang
function apiToCourses(apiCourses: ApiTrainerProfile["courses"], lang: "ar" | "en"): CourseItem[] {
  return apiCourses.map((c) => ({
    id: c.id,
    title: lang === "ar" ? (c.nameAr || c.name) : c.name,
    students: c.students,
    status: c.status === "published" ? "published" : "underReview",
  }));
}

const TrainerProfile: React.FC = () => {
  const { t, lang } = useLanguage();
  const l = t.trainerProfile;
  const isRTL = lang === "ar";

  const token = sessionStorage.getItem('user_token');

  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string>('');

  // 1. Basic non-translated trainer states, populated from mockApi
  const [trainer, setTrainer] = useState<TrainerState>({
    email: "",
    phone: "",
    students: 0,
    rating: 0,
  });

  const [courses, setCourses] = useState<CourseItem[]>([]);

  // Raw bilingual profile as returned by mockApi, kept so we can re-localize on language toggle without refetching
  const [rawProfile, setRawProfile] = useState<ApiTrainerProfile | null>(null);

  // 2. Baseline profile fetched from mockApi, used as the display source before any local edit
  const [fetchedProfile, setFetchedProfile] = useState<EditedDataState | null>(null);

  // 3. Temporarily storage and draft state for local form updates
  const [editedData, setEditedData] = useState<EditedDataState | null>(null);
  const [draft, setDraft] = useState<Partial<EditedDataState>>({});

  useEffect(() => {
    let isMounted = true;

    async function fetchTrainerProfile() {
      try {
        setLoading(true);
        const headers = { 'Authorization': `Bearer ${token}` };

        const response = await fetch(`${BASE_URL}/trainer/profile`, { headers });
        const result = await response.json().catch(() => ({ success: false }));

        if (!isMounted) return;

        if (result?.success && result.data) {
          setRawProfile(result.data);
          setFetchedProfile(apiToProfile(result.data, lang));
          setCourses(apiToCourses(result.data.courses, lang));
          setTrainer({
            email: result.data.email,
            phone: result.data.phone,
            students: result.data.stats.studentsCount,
            rating: result.data.stats.rating,
          });
        } else {
          setLoadError(true);
        }
      } catch (err) {
        console.error('Error fetching trainer profile', err);
        if (isMounted) setLoadError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchTrainerProfile();
    return () => { isMounted = false; };
  }, [BASE_URL, token]);

  // Closes edit mode on language toggle while retaining any edited user modifications
  useEffect(() => {
    setIsEditing(false);
  }, [lang]);

  // Re-localizes the fetched (non-edited) profile fields whenever the language toggles
  useEffect(() => {
    if (!rawProfile) return;
    setFetchedProfile(apiToProfile(rawProfile, lang));
    setCourses(apiToCourses(rawProfile.courses, lang));
  }, [lang, rawProfile]);

  // Dynamically resolves metadata with priority to manual user edits over fetched mockApi data
  const currentTrainer: EditedDataState = {
    fullName: editedData?.fullName || fetchedProfile?.fullName || "",
    specialization: editedData?.specialization || fetchedProfile?.specialization || "",
    bio: editedData?.bio || fetchedProfile?.bio || "",
    email: editedData?.email || trainer.email,
    experienceVal: editedData?.experienceVal || fetchedProfile?.experienceVal || "",
  };

  const handleStartEdit = (): void => {
    setDraft({ ...currentTrainer });
    setSaveError('');
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setSaveError('');

    // Save draft data (asserting full properties since form inputs are required)
    const finalizedData = draft as EditedDataState;

    try {
      const response = await fetch(`${BASE_URL}/trainer/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: finalizedData.fullName,
          specialization: finalizedData.specialization,
          bio: finalizedData.bio,
          experienceVal: finalizedData.experienceVal
        })
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        const rawError = result.error || result.message;
        const serverError = rawError && typeof rawError === 'object'
          ? Object.values(rawError).flat().join(' ')
          : rawError;
        setSaveError(serverError || (isRTL ? 'تعذر حفظ التعديلات' : 'Failed to save changes'));
        return;
      }

      setEditedData(finalizedData);
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving trainer profile', err);
      setSaveError(isRTL ? 'تعذر الاتصال بالسيرفر' : 'Could not reach the server');
    }
  };

  const publicCourses = courses.filter((c) => c.status === "published");

  return (
    <div dir={t.dir} className="min-h-screen bg-slate-200/80 dark:bg-[#030611] flex flex-col font-sans text-capsule-navy dark:text-slate-100 antialiased">
      <TrainerNavbar
        activePage="profile"
        onSignIn={() => {}}
        onSignUp={() => {}}
      />
      
      <main className="flex-grow">
        {/* Banner Title — Renders immediately */}
        <div className="relative bg-gradient-to-tr from-capsule-footer via-capsule-navy to-capsule-teal text-white py-14 px-8 overflow-hidden shadow-inner">
          <div className="max-w-7xl mx-auto relative z-10">
            <h1 className="text-3xl font-extrabold text-white">{l.hero.title}</h1>
            <p className="text-sm text-gray-200 mt-2">{l.hero.subtitle}</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
          {loading ? (
            /* Inline Skeleton Loader while fetching backend data */
            <SkeletonLoader variant="trainer-profile" dir={t.dir} />
          ) : loadError ? (
            <div className="p-8 text-center bg-white dark:bg-[#18233C] rounded-3xl border border-slate-300 dark:border-slate-700 shadow-xl">
              <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
                {isRTL ? "تعذر تحميل بيانات المدرب من الخادم." : "Unable to load trainer profile from server."}
              </p>
            </div>
          ) : (
            <>
              <div className="bg-white dark:bg-[#18233C] rounded-3xl shadow-2xl border-2 border-slate-300 dark:border-slate-700/80 p-8 mb-8">
            {!isEditing ? (
              /* Public read-only profile layout view */
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="w-28 h-28 rounded-full bg-capsule-teal text-white flex items-center justify-center text-4xl font-black shrink-0 select-none">
                  {currentTrainer.fullName?.charAt(0) || "T"}
                </div>
                <div className={`flex-1 ${isRTL ? "text-center md:text-right" : "text-center md:text-left"}`}>
                  <h2 className="text-2xl font-black mb-2 text-capsule-navy">{currentTrainer.fullName}</h2>
                  <p className="text-capsule-teal font-semibold mb-2">{currentTrainer.specialization}</p>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p dir="ltr" className={isRTL ? "text-right" : "text-left"}>📧 {currentTrainer.email}</p>
                    <p className="text-sm text-gray-600 font-bold mt-2">{l.profile?.experience}{currentTrainer.experienceVal}</p>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-gray-600 max-w-2xl mx-auto md:mx-0">{currentTrainer.bio}</p>
                  <div className="pt-4 flex justify-center md:justify-start">
                    <button onClick={handleStartEdit} className="bg-[#387B84] hover:bg-[#2C6269] text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer">
                      {l.editBtn || (isRTL ? "تعديل الملف الشخصي" : "Edit Profile")}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Active modification and edit form */
              <form onSubmit={handleSave} className="space-y-6">
                {saveError && (
                  <div className="p-3 bg-amber-50 text-amber-800 rounded-xl text-xs font-bold border-r-4 border-capsule-dark-gold">
                    ⚠️ {saveError}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    required 
                    value={draft.fullName || ""} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft({ ...draft, fullName: e.target.value })} 
                    placeholder={l.table?.colTitle} 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold" 
                  />
                  <input 
                    type="text" 
                    value={draft.specialization || ""} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft({ ...draft, specialization: e.target.value })} 
                    placeholder={l.data?.specialization || l.hero?.subtitle} 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold" 
                  />
                  <input 
                    type="email" 
                    required 
                    value={draft.email || ""} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft({ ...draft, email: e.target.value })} 
                    placeholder={trainer.email} 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold" 
                  />
                  <input 
                    type="text" 
                    value={draft.experienceVal || ""} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft({ ...draft, experienceVal: e.target.value })} 
                    placeholder={l.profile?.experience} 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold" 
                  />
                </div>
                <textarea 
                  rows={3} 
                  value={draft.bio || ""} 
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDraft({ ...draft, bio: e.target.value })} 
                  placeholder={l.data?.bio} 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold resize-none" 
                />
                
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="bg-capsule-navy text-white font-bold text-sm px-5 py-2.5 rounded-xl cursor-pointer">
                    {l.saveBtn || (isRTL ? "حفظ" : "Save")}
                  </button>
                  <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-100 text-gray-600 font-bold text-sm px-5 py-2.5 rounded-xl cursor-pointer">
                    {l.cancelBtn || (isRTL ? "إلغاء" : "Cancel")}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Aggregate Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            <div className="bg-white/70 dark:bg-[#162035]/70 backdrop-blur-xl rounded-3xl p-6 border border-white/60 dark:border-white/10 shadow-xl hover:-translate-y-1 transition-all">
              <p className="text-xs text-gray-500 dark:text-slate-400 font-bold">{l.stats.coursesCount}</p>
              <h3 className="text-3xl font-black mt-2 text-capsule-navy dark:text-white">{publicCourses.length}</h3>
            </div>
            <div className="bg-white/70 dark:bg-[#162035]/70 backdrop-blur-xl rounded-3xl p-6 border border-white/60 dark:border-white/10 shadow-xl hover:-translate-y-1 transition-all">
              <p className="text-xs text-gray-500 dark:text-slate-400 font-bold">{l.stats.studentsCount}</p>
              <h3 className="text-3xl font-black mt-2 text-capsule-teal dark:text-teal-400">{trainer.students}</h3>
            </div>
            <div className="bg-white/70 dark:bg-[#162035]/70 backdrop-blur-xl rounded-3xl p-6 border border-white/60 dark:border-white/10 shadow-xl hover:-translate-y-1 transition-all">
              <p className="text-xs text-gray-500 dark:text-slate-400 font-bold">{l.stats.rating}</p>
              <h3 className="text-3xl font-black mt-2 text-amber-600 dark:text-amber-400 font-mono">⭐ {trainer.rating}</h3>
            </div>
          </div>

          {/* Courses Table Glassmorphism */}
          <div className="bg-white/70 dark:bg-[#162035]/70 backdrop-blur-xl rounded-3xl border border-white/60 dark:border-white/10 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/40 dark:border-slate-800 bg-white/40 dark:bg-[#0F172A]/50">
              <h2 className="text-base font-black text-capsule-navy dark:text-white">{l.table.cardTitle}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className={`w-full border-collapse ${isRTL ? "text-right" : "text-left"}`}>
                <thead>
                  <tr className="bg-slate-100/60 dark:bg-slate-800/60 text-xs font-black text-slate-700 dark:text-slate-300 border-b border-white/40 dark:border-slate-800">
                    <th className="p-4">{l.table.colTitle}</th>
                    <th className="p-4">{l.table.colStudents}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/30 dark:divide-slate-800 text-sm font-medium">
                  {publicCourses.map((c) => (
                    <tr key={c.id} className="hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors">
                      <td className="p-4 font-black text-capsule-navy dark:text-white">{c.title}</td>
                      <td className="p-4 font-mono font-bold text-slate-700 dark:text-slate-300">{c.students} {isRTL ? 'طالب' : 'students'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TrainerProfile;