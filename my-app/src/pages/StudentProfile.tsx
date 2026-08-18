import React, { useState, useEffect, useRef } from 'react';
// استيراد دالة جلب بيانات المستخدم الحالي من ملف الخدمات الأساسي
import { getCurrentUser, BASE_URL } from '../services/api'; 
// Import the default profile picture
import defaultProfilePic from '../assets/profile.png';

// Reusable Components
import StudentNavbar from "../components/StudentNavbar.js";
import Footer from '../components/Footer.jsx';
import LoadingIndicator from '../components/LoadingIndicator.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Button from '../components/Button.js';

// Global Context
import { useLanguage } from '../context/LanguageContext.jsx';

// ============================================================================
// TYPES & INTERFACES
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
// COMPONENT
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

  // 1. Reference for the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  const token = localStorage.getItem('user_token');

  useEffect(() => {
    let isMounted = true;

    async function loadProfileAndCourses() {
      try {
        setLoading(true);
        
        const userResponse: any = await getCurrentUser();
        const profileData = userResponse.user || userResponse;

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

  // 2. The function that converts your file into a Base64 string automatically
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 2MB to prevent Prisma payload errors)
    if (file.size > 2 * 1024 * 1024) {
      setFieldErrors(prev => ({ ...prev, avatar: 'حجم الصورة يجب أن لا يتجاوز 2 ميغابايت' }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        handleChange('avatar', reader.result); // Saves the Base64 string to formValues.avatar
        setFieldErrors(prev => ({ ...prev, avatar: undefined }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaveState('saving');
    setFieldErrors({});

    try {
      const response = await fetch(`${BASE_URL}/student/profile/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formValues) // Sends the Base64 string directly to Prisma
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

          <div className="bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden">
            <div className="bg-gradient-to-tr from-capsule-footer via-capsule-navy to-capsule-teal text-white py-10 px-8"></div>

            <div className="px-8 pb-8">
              <div className="flex flex-col sm:flex-row sm:items-end gap-6 -mt-12">
                
                {/* 3. The large profile image - updates instantly when a new file is chosen */}
                <div className="relative group">
                  <img
                    src={formValues.avatar || profile.avatar || defaultProfilePic}
                    alt="Profile Avatar"
                    className="w-24 h-24 rounded-2xl border-4 border-white shadow-md object-cover bg-white"
                  />
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 text-white rounded-2xl flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition cursor-pointer"
                    >
                      تغيير الصورة
                    </button>
                  )}
                </div>

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

              {isEditing && (
                <div className="mt-8 border-t border-gray-100 pt-6">
                  <h2 className="text-sm font-bold text-capsule-navy mb-4">{l.editSectionTitle}</h2>

                  {fieldErrors.global && <ErrorMessage message={fieldErrors.global} />}

                  {/* 4. The Hidden File Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />

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

                    {/* 5. The new UI Button replacing the URL text input */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2">صورة الحساب الشخصي</label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-capsule-navy text-xs font-bold rounded-xl transition cursor-pointer"
                        >
                          اختيار ملف من جهازك...
                        </button>
                        {/* Shows a checkmark if a file was selected */}
                        {formValues.avatar && formValues.avatar !== profile.avatar && (
                          <span className="text-xs text-emerald-600 font-bold">تم اختيار صورة جديدة ✓</span>
                        )}
                      </div>
                      {fieldErrors.avatar && (
                        <p className="text-xs font-bold text-red-500 mt-1">{fieldErrors.avatar}</p>
                      )}
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