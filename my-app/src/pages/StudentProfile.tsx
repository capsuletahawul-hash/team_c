import React, { useState, useEffect } from 'react';
// استيراد دالة جلب بيانات المستخدم الحالي من ملف الخدمات الأساسي
import { getCurrentUser, BASE_URL } from '../services/api'; 

// Reusable Components[cite: 11]
import StudentNavbar from "../components/StudentNavbar.js";
import Footer from '../components/Footer.jsx';
import LoadingIndicator from '../components/LoadingIndicator.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Button from '../components/Button.js';

// Global Context[cite: 11]
import { useLanguage } from '../context/LanguageContext.jsx';

// ============================================================================
// TYPES & INTERFACES[cite: 11]
// ============================================================================

interface Profile {
  id: number;
  fullName: string;
  email: string;
  role: string;
  avatar: string;
  joinedAt: string;
  completedCourses: number;
  activeCourses: number;
  companyAffiliation: string;
}

interface Course {
  id: number;
  title: string;
  category: string;
  duration: string;
  progress: number;
  status: 'In Progress' | 'Completed';
}

interface FormValues {
  fullName: string;
  avatar: string;
}

interface FieldErrors {
  global?: string;
  fullName?: string;
  avatar?: string;
  [key: string]: string | undefined;
}

interface StudentProfileProps {
  onBack: () => void;
}

type SaveState = 'idle' | 'saving' | 'saved';

// ============================================================================
// COMPONENT[cite: 11]
// ============================================================================

function StudentProfile({ onBack }: StudentProfileProps) {
  const { t, lang } = useLanguage();
  const l = t.studentProfile;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formValues, setFormValues] = useState<FormValues>({ fullName: '', avatar: '' });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saveState, setSaveState] = useState<SaveState>('idle');

  const token = localStorage.getItem('user_token');

  useEffect(() => {
    let isMounted = true;

    async function loadProfileAndCourses() {
      try {
        setLoading(true);
        
        // 1. جلب بيانات المستخدم الأساسية من الباك إند
        const userResponse :any = await getCurrentUser();
        const profileData = userResponse.user || userResponse;

        // 2. جلب الدورات المشتراة من الباك إند
        const coursesRes = await fetch(`${BASE_URL}/student/courses/purchased`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const coursesData = await coursesRes.json().catch(() => []);

        if (!isMounted) return;

        if (profileData) {
          setProfile(profileData);
          setFormValues({ fullName: profileData.fullName || '', avatar: profileData.avatar || '' });
        }
        if (Array.isArray(coursesData)) {
          setCourses(coursesData);
        }
      } catch (err) {
        if (isMounted) {
          setFieldErrors({ global: 'حدث خطأ أثناء تحميل البيانات من السيرفر' });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProfileAndCourses();

    return () => { isMounted = false; };
  }, [BASE_URL, token]);

  const handleChange = (field: keyof FormValues, value: string) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaveState('saving');
    setFieldErrors({});

    try {
      // إرسال البيانات المحدثة إلى الباك إند مباشرة
      const response = await fetch(`${BASE_URL}/student/profile/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formValues)
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setFieldErrors((result.details as FieldErrors) || { global: result.error || 'فشل حفظ التعديلات' });
        setSaveState('idle');
        return;
      }

      const updatedProfile = result.data || result.user || result;
      setProfile(updatedProfile);
      setFormValues({ fullName: updatedProfile.fullName, avatar: updatedProfile.avatar });
      
      setIsEditing(false);
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2000);
    } catch (err) {
      setFieldErrors({ global: 'حدث خطأ في الاتصال بالسيرفر' });
      setSaveState('idle');
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormValues({ fullName: profile.fullName, avatar: profile.avatar });
    }
    setFieldErrors({});
    setIsEditing(false);
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-capsule-bg flex flex-col items-center justify-center">
        <LoadingIndicator message={l.loading} />
      </div>
    );
  }

  const completedCount = courses.filter(c => c.status === 'Completed').length;
  const activeCount = courses.filter(c => c.status !== 'Completed').length;

  return (
    <div className="min-h-screen bg-capsule-bg text-capsule-navy font-sans antialiased flex flex-col" dir={t.dir}>
      <StudentNavbar activePage="profile" />

      <main className="flex-grow">
        <div className="max-w-5xl mx-auto px-6 pt-6 flex">
          <button onClick={onBack} className="text-xs font-bold text-capsule-teal hover:text-capsule-navy transition cursor-pointer bg-transparent border-none">
            {l.backBtn}
          </button>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-8">

          {saveState === 'saved' && (
            <div className={`mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold shadow-xs border-emerald-500 ${t.dir === 'rtl' ? 'border-r-4' : 'border-l-4'}`}>
              {l.successSave}
            </div>
          )}

          {/* Main Header Card[cite: 11] */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden">
            <div className="bg-capsule-gradient h-28"></div>

            <div className="px-8 pb-8">
              <div className="flex flex-col sm:flex-row sm:items-end gap-6 -mt-12">
                <img
                  src={formValues.avatar || profile.avatar || 'https://via.placeholder.com/150'}
                  alt="Profile Avatar"
                  className="w-24 h-24 rounded-2xl border-4 border-white shadow-md object-cover bg-white"
                />

                <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 sm:pt-0">
                  <div className={t.dir === 'rtl' ? 'text-right' : 'text-left'}>
                    <h1 className="text-xl font-black text-capsule-navy">{profile.fullName}</h1>
                    <p className="text-xs text-gray-400 font-bold mt-1" dir="ltr" style={{ textAlign: t.dir === 'rtl' ? 'right' : 'left' }}>
                      {profile.email}
                    </p>
                  </div>

                  {!isEditing && (
                    <Button variant="secondary" onClick={() => setIsEditing(true)}>
                      {l.editBtn}
                    </Button>
                  )}
                </div>
              </div>

              {/* Quick Badges[cite: 11] */}
              <div className="flex flex-wrap gap-2 mt-6">
                <span className="bg-capsule-teal/10 text-capsule-teal text-xs font-bold px-3 py-1.5 rounded-full">
                  {profile.role === 'Student' ? l.roles.student : profile.role}
                </span>
                {profile.companyAffiliation && (
                  <span className="bg-capsule-gold/20 text-capsule-dark-gold text-xs font-bold px-3 py-1.5 rounded-full">
                    {profile.companyAffiliation}
                  </span>
                )}
                <span className="bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1.5 rounded-full">
                  {l.joinedPrefix} {profile.joinedAt}
                </span>
              </div>

              {/* Edit Form[cite: 11] */}
              {isEditing && (
                <div className="mt-8 border-t border-gray-100 pt-6">
                  <h2 className="text-sm font-bold text-capsule-navy mb-4">{l.editSectionTitle}</h2>

                  {fieldErrors.global && <ErrorMessage message={fieldErrors.global} />}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2">{l.inputs.fullName}</label>
                      <input
                        type="text"
                        value={formValues.fullName}
                        onChange={(e) => handleChange('fullName', e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-capsule-teal"
                      />
                      {fieldErrors.fullName && (
                        <p className="text-xs font-bold text-capsule-dark-gold mt-1">{fieldErrors.fullName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2">{l.inputs.avatar}</label>
                      <input
                        type="text"
                        value={formValues.avatar}
                        onChange={(e) => handleChange('avatar', e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-capsule-teal"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button variant="primary" onClick={handleSave} disabled={saveState === 'saving'}>
                      {saveState === 'saving' ? l.actions.saving : l.actions.save}
                    </Button>
                    <Button variant="secondary" onClick={handleCancel}>{l.actions.cancel}</Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Academic Progress Summary[cite: 11] */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <p className="text-xs font-bold text-gray-400 mb-1">{l.stats.active}</p>
              <p className="text-2xl font-black text-capsule-teal">{activeCount}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <p className="text-xs font-bold text-gray-400 mb-1">{l.stats.completed}</p>
              <p className="text-2xl font-black text-emerald-600">{completedCount}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <p className="text-xs font-bold text-gray-400 mb-1">{l.stats.total}</p>
              <p className="text-2xl font-black text-capsule-navy">{courses.length}</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default StudentProfile;