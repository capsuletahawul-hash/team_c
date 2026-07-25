import React, { useState, useEffect } from 'react';
// استيراد دالة جلب بيانات المستخدم الحالي من ملف الخدمات المشترك
import { getCurrentUser, BASE_URL } from '../services/api'; 

// Reusable Components[cite: 10]
import StudentNavbar from "../components/StudentNavbar.jsx";
import Footer from '../components/Footer.jsx';
import LoadingIndicator from '../components/LoadingIndicator.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Button from '../components/Button.js';

// Global Context[cite: 10]
import { useLanguage } from '../context/LanguageContext.jsx';

// ============================================================================
// TYPES & INTERFACES[cite: 10]
// ============================================================================

interface Course {
  id: number;
  titleKey: string;
  catKey: string;
  durKey: string;
  progress: number;
  status: 'Active' | 'Completed';
}

interface Notification {
  notificationId: number;
  titleKey: string;
  msgKey: string;
  isRead: boolean;
}

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

interface StudentDashboardProps {
  onNavigateToProfile: () => void;
}

// ============================================================================
// COMPONENT[cite: 10]
// ============================================================================

function StudentDashboard({ onNavigateToProfile }: StudentDashboardProps) {
  const { t, lang } = useLanguage();
  const l = t.studentDashboard;

  const [profile, setProfile] = useState<Profile | null>(null);
  
  // تفريغ البيانات الثابتة وتحويلها إلى مصفوفات فارغة تنتظر البيانات الحية من السيرفر
  const [courses, setCourses] = useState<Course[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError('');

        // 1. جلب بيانات بروفايل الطالب الحالي من الباك إند
        const userResponse: any = await getCurrentUser();
        
// 2. جلب دورات الطالب من الباك إند
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const token = localStorage.getItem("user_token");

const coursesRes = await fetch(`${BASE_URL}/student/courses/purchased`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const coursesData = await coursesRes.json().catch(() => []);

// لا يوجد API للإشعارات حالياً
const notifsData: Notification[] = [];


        if (!isMounted) return;

        // تعيين البيانات القادمة من السيرفر في الـ State لقراءتها ديناميكياً
        setProfile(userResponse.user || userResponse);
        setCourses(Array.isArray(coursesData) ? coursesData : []);
        setNotifications(notifsData);

      } catch (err: any) {
        if (!isMounted) return;
        setError(l.errorNetwork || 'حدث خطأ أثناء تحميل بيانات لوحة التحكم');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchDashboardData();

    return () => { isMounted = false; };
  }, [lang, l.errorProfile, l.errorNetwork]);

  if (loading) {
    return (
      <div className="min-h-screen bg-capsule-bg flex flex-col items-center justify-center">
        <LoadingIndicator message={l.loading} />
      </div>
    );
  }

  const activeCourses = courses.filter(c => c.status !== 'Completed');
  const completedCourses = courses.filter(c => c.status === 'Completed');
  const unreadNotifications = notifications.filter(n => !n.isRead);

  // Safe fallback calculation for profile name[cite: 10]
  const firstName = profile?.fullName?.split(' ')[0] || l.hero.fallbackName;

  return (
    <div className="min-h-screen bg-capsule-bg text-capsule-navy font-sans antialiased flex flex-col" dir={t.dir}>
      <StudentNavbar activePage="dashboard" />

      <main className="flex-grow">
        {error && (
          <div className="max-w-7xl mx-auto px-6 pt-6">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* Hero Section[cite: 10] */}
        <div className="relative bg-capsule-gradient text-white py-10 px-8 overflow-hidden shadow-inner">
          <div className="max-w-7xl mx-auto relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="text-capsule-gold text-xs font-bold uppercase tracking-wider mb-1">
                {l.hero.badge}
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                {l.hero.welcomePrefix} {firstName} {l.hero.welcomeSuffix}
              </h1>
              <p className="text-gray-200 text-sm mt-2 max-w-lg">
                {l.hero.subtitle}
              </p>
            </div>

            {/* Profile Avatar Button[cite: 10] */}
            <button
              onClick={onNavigateToProfile}
              className={`flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl p-3 transition cursor-pointer ${t.dir === 'rtl' ? 'pl-5' : 'pr-5'}`}
            >
              <img
                src={profile?.avatar || 'https://via.placeholder.com/150'}
                alt="Profile Avatar"
                className="w-12 h-12 rounded-full border-2 border-capsule-gold object-cover"
              />
              <div className={t.dir === 'rtl' ? 'text-right' : 'text-left'}>
                <p className="text-sm font-bold text-white">{profile?.fullName}</p>
                <p className="text-xs text-gray-300">{l.hero.viewProfile}</p>
              </div>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-10">

          {/* Quick Stats Cards[cite: 10] */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <p className="text-xs font-bold text-gray-400 mb-1">{l.stats.activeCourses}</p>
              <p className="text-2xl font-black text-capsule-teal">{activeCourses.length}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <p className="text-xs font-bold text-gray-400 mb-1">{l.stats.completedCourses}</p>
              <p className="text-2xl font-black text-emerald-600">{completedCourses.length}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <p className="text-xs font-bold text-gray-400 mb-1">{l.stats.unreadNotifs}</p>
              <p className="text-2xl font-black text-capsule-dark-gold">{unreadNotifications.length}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <p className="text-xs font-bold text-gray-400 mb-1">{l.stats.affiliation}</p>
              <p className="text-base font-black text-capsule-navy mt-1 truncate">
                {profile?.companyAffiliation || l.stats.independent}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Resume Learning Section[cite: 10] */}
            <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <h2 className="text-base font-bold text-capsule-navy">{l.resume.title}</h2>
              </div>

              {courses.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="text-sm font-bold text-gray-400">{l.resume.empty}</p>
                  <div className="mt-4 inline-block">
                    <Button variant="primary">{l.resume.browseBtn}</Button>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {courses.map((course) => (
                    <div key={course.id} className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1">
                        {/* فحص ما إذا كان العنوان قادماً كمفتاح ترجمة أو كعنوان نصي مباشر من السيرفر */}
                        <p className="font-bold text-capsule-navy text-sm">
                          {l.mockData[course.titleKey] || (course as any).title}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {l.mockData[course.catKey] || (course as any).category} · {l.mockData[course.durKey] || (course as any).duration}
                        </p>

                        <div className="w-full bg-gray-100 rounded-full h-2 mt-3 overflow-hidden">
                          <div
                            className="bg-capsule-teal h-2 rounded-full transition-all"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs font-bold text-gray-400 mt-1">{course.progress}% {l.resume.completedProgress}</p>
                      </div>

                      <Button variant={course.status === 'Completed' ? 'secondary' : 'primary'}>
                        {course.status === 'Completed' ? l.resume.certBtn : l.resume.continueBtn}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications Section[cite: 10] */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden h-fit">
              <div className="p-6 border-b border-gray-100 bg-gray-50">
                <h2 className="text-base font-bold text-capsule-navy">{l.notifications.title}</h2>
              </div>

              {notifications.length === 0 ? (
                <p className="p-6 text-xs font-bold text-gray-400 text-center">{l.notifications.empty}</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((note) => (
                    <div key={note.notificationId} className="p-5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold text-capsule-navy">
                          {l.mockData[note.titleKey] || (note as any).title}
                        </p>
                        {!note.isRead && (
                          <span className="w-2 h-2 rounded-full bg-capsule-dark-gold mt-1 flex-shrink-0"></span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        {l.mockData[note.msgKey] || (note as any).message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default StudentDashboard;