import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// استيراد دالة جلب بيانات المستخدم الحالي من ملف الخدمات المشترك
import { getCurrentUser, BASE_URL } from '../services/api'; 
// Import the default profile picture
import defaultProfilePic from '../assets/profile.png';

// Reusable Components
import StudentNavbar from "../components/StudentNavbar.jsx";
import Footer from '../components/Footer.jsx';
import LoadingIndicator from '../components/LoadingIndicator.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Button from '../components/Button.js';
import CourseAssistant from "../components/CourseAssistant";

// Global Context
import { useLanguage } from '../context/LanguageContext.jsx';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Course {
  id: number;
  titleKey: string;
  catKey: string;
  durKey: string;
  progress: number;
  status: 'Active' | 'Completed' | 'Expired';
  accessStartsAt?: string;
  accessEndsAt?: string;
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
// COMPONENT
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
        // ملاحظة: studentRoutes مرتبطة في server.ts بالمسار /api/student، و BASE_URL
        // المستورد من services/api.ts يتضمن /api بالفعل — لازم نستخدمه كما هو.
        const token = sessionStorage.getItem("user_token");

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

  const activeCourses = courses.filter(c => c.status === 'Active');
  const completedCourses = courses.filter(c => c.status === 'Completed');
  const unreadNotifications = notifications.filter(n => !n.isRead);

  // Safe fallback calculation for profile name
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

        {/* Hero Section */}
        <div className="bg-gradient-to-tr from-capsule-footer via-capsule-navy to-capsule-teal text-white py-10 px-8"  >
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

            {/* Profile Avatar Button */}
            <button
              onClick={onNavigateToProfile}
              className={`flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl p-3 transition cursor-pointer ${t.dir === 'rtl' ? 'pl-5' : 'pr-5'}`}
            >
              <img
                src={profile?.avatar || defaultProfilePic}
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
          {/* Quick Stats Cards */}
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

{/* AI Course Assistant */}
<div className="mb-10">
  <CourseAssistant />
</div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Resume Learning Section */}
            <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <h2 className="text-base font-bold text-capsule-navy">{l.resume.title}</h2>
                <Link
                  to="/my-courses"
                  className="text-xs font-bold text-capsule-teal hover:underline"
                >
                  {t.dir === 'rtl' ? 'عرض جميع دوراتي ←' : 'View all my courses →'}
                </Link>
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
                        <p className="font-bold text-capsule-navy text-sm">
                          {l.mockData[course.titleKey] || (course as any).title}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {l.mockData[course.catKey] || (course as any).category} · {l.mockData[course.durKey] || (course as any).duration}
                        </p>

                        <div className="w-full bg-gray-100 dark:bg-slate-800/80 border border-slate-200/40 dark:border-white/10 rounded-full h-2.5 mt-3 overflow-hidden shadow-inner">
                          <div
                            className="bg-capsule-teal dark:bg-gradient-to-r dark:from-teal-400 dark:to-emerald-400 h-full rounded-full transition-all shadow-xs"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs font-black text-gray-400 dark:text-slate-300 mt-1.5">{course.progress}% {l.resume.completedProgress}</p>
                      </div>

                      <Button
                        variant={
                          course.status === 'Completed' || course.status === 'Expired'
                            ? 'secondary'
                            : 'primary'
                        }
                      >
                        {course.status === 'Completed'
                          ? l.resume.certBtn
                          : course.status === 'Expired'
                            ? 'Locked'
                            : l.resume.continueBtn}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications Section */}
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