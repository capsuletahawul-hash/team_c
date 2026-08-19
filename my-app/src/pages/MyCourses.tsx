import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentNavbar from '../components/StudentNavbar';
import Footer from '../components/Footer';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';
import Button from '../components/Button';
import { BASE_URL, getToken } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

// ============================================================================
// TYPES
// ============================================================================

// Mirrors what GET /student/courses/purchased returns (backend: studentController.getPurchasedCourses).
// Every row here IS an Enrollment — the same "entitlement" record the Week 5 handbook
// describes, whether it was created after a Moyasar-verified purchase or a free signup.
interface MyCourse {
  id: string;
  title: string;
  category: string;
  duration: string;
  price?: number;
  progress: number;
  status: 'Active' | 'Completed' | 'Expired';
  accessStartsAt?: string;
  accessEndsAt?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

function daysRemaining(accessEndsAt?: string): number | null {
  if (!accessEndsAt) return null;
  const end = new Date(accessEndsAt).getTime();
  const now = Date.now();
  return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function MyCourses() {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const isRTL = lang === 'ar';

  const [courses, setCourses] = useState<MyCourse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [tab, setTab] = useState<'active' | 'expired' | 'completed'>('active');

  useEffect(() => {
    let isMounted = true;

    async function fetchMyCourses() {
      try {
        setLoading(true);
        setError('');

        const token = getToken();
        // NOTE: server.ts mounts studentRoutes at /api/student, and BASE_URL
        // (services/api.ts) already includes /api — do not strip it here.
        const res = await fetch(`${BASE_URL}/student/courses/purchased`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json().catch(() => []);
        if (!isMounted) return;

        setCourses(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!isMounted) return;
        setError(isRTL ? 'حدث خطأ أثناء تحميل دوراتك' : 'Something went wrong loading your courses');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchMyCourses();
    return () => { isMounted = false; };
  }, [isRTL]);

  const activeCourses = courses.filter(c => c.status === 'Active');
  const expiredCourses = courses.filter(c => c.status === 'Expired');
  const completedCourses = courses.filter(c => c.status === 'Completed');

  const visibleCourses =
    tab === 'active' ? activeCourses : tab === 'expired' ? expiredCourses : completedCourses;

  const tabs: Array<{ key: typeof tab; label: string; count: number }> = [
    { key: 'active', label: isRTL ? 'نشطة' : 'Active', count: activeCourses.length },
    { key: 'expired', label: isRTL ? 'منتهية الصلاحية' : 'Expired', count: expiredCourses.length },
    { key: 'completed', label: isRTL ? 'مكتملة' : 'Completed', count: completedCourses.length },
  ];

  return (
    <div className="min-h-screen bg-capsule-bg text-capsule-navy font-sans antialiased flex flex-col" dir={t.dir}>
      <StudentNavbar activePage="my-courses" />

      <main className="flex-grow">
        <div className="bg-gradient-to-tr from-capsule-footer via-capsule-navy to-capsule-teal text-white py-10 px-8">
          <div className="max-w-7xl mx-auto">
            <p className="text-capsule-gold text-xs font-bold uppercase tracking-wider mb-1">
              {isRTL ? 'دوراتي' : 'My Courses'}
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {isRTL ? 'كل الدورات التي تملك صلاحية الوصول إليها' : 'Every course you currently have access to'}
            </h1>
            <p className="text-gray-200 text-sm mt-2 max-w-lg">
              {isRTL
                ? 'سواء اشتريتها أو سجّلت في نسخة مجانية منها — كلها هنا في مكان واحد.'
                : 'Purchased or free — anything you have access to right now lives here.'}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-10">
          {error && <ErrorMessage message={error} />}

          {loading ? (
            <LoadingIndicator />
          ) : (
            <>
              {/* Tabs */}
              <div className="flex gap-2 mb-6 flex-wrap">
                {tabs.map(tb => (
                  <button
                    key={tb.key}
                    onClick={() => setTab(tb.key)}
                    className={`px-4 py-2 rounded-full text-xs font-bold border transition ${
                      tab === tb.key
                        ? 'bg-capsule-teal text-white border-capsule-teal'
                        : 'bg-white text-capsule-navy border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {tb.label} ({tb.count})
                  </button>
                ))}
              </div>

              {visibleCourses.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
                  <p className="text-sm font-bold text-gray-400 mb-4">
                    {tab === 'active'
                      ? isRTL
                        ? 'لا توجد لديك دورات نشطة بعد.'
                        : "You don't have any active courses yet."
                      : tab === 'expired'
                      ? isRTL
                        ? 'لا توجد دورات منتهية الصلاحية.'
                        : 'No expired courses.'
                      : isRTL
                      ? 'لم تكمل أي دورة بعد.'
                      : "You haven't completed any course yet."}
                  </p>
                  {tab === 'active' && (
                    <Button variant="primary" onClick={() => navigate('/student-courses-overview')}>
                      {isRTL ? 'تصفح الدورات' : 'Browse Courses'}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {visibleCourses.map(course => {
                    const remaining = daysRemaining(course.accessEndsAt);
                    const isFree = course.price === 0;

                    return (
                      <div
                        key={course.id}
                        className="bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden flex flex-col"
                      >
                        <div className="p-5 flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold uppercase text-capsule-teal tracking-wide">
                              {course.category}
                            </span>
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                isFree
                                  ? 'bg-emerald-50 text-emerald-600'
                                  : 'bg-capsule-gold/20 text-capsule-dark-gold'
                              }`}
                            >
                              {isFree ? (isRTL ? 'مجاني' : 'Free') : (isRTL ? 'مدفوع' : 'Paid')}
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-capsule-navy leading-snug mb-1">
                            {course.title}
                          </h3>
                          <p className="text-xs text-gray-400 mb-3">{course.duration}</p>

                          <div className="w-full bg-gray-100 dark:bg-slate-800/80 border border-slate-200/40 dark:border-white/10 rounded-full h-2.5 overflow-hidden mb-1.5 shadow-inner">
                            <div
                              className="bg-capsule-teal dark:bg-gradient-to-r dark:from-teal-400 dark:to-emerald-400 h-full rounded-full transition-all shadow-xs"
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs font-black text-gray-400 dark:text-slate-300 mb-3">
                            {course.progress}% {isRTL ? 'مكتمل' : 'complete'}
                          </p>

                          {course.status === 'Active' && remaining !== null && (
                            <p className="text-[11px] font-semibold text-gray-500">
                              {remaining > 0
                                ? isRTL
                                  ? `الوصول متاح لمدة ${remaining} يوم آخر`
                                  : `${remaining} day${remaining === 1 ? '' : 's'} of access left`
                                : isRTL
                                ? 'ينتهي الوصول اليوم'
                                : 'Access ends today'}
                            </p>
                          )}

                          {course.status === 'Expired' && (
                            <p className="text-[11px] font-semibold text-red-500">
                              {isRTL ? 'انتهت صلاحية الوصول لهذه الدورة' : 'Access to this course has expired'}
                            </p>
                          )}
                        </div>

                        <div className="p-5 pt-0">
                          <Button
                            variant={course.status === 'Expired' ? 'secondary' : 'primary'}
                            onClick={() => navigate(`/course-details/${course.id}`)}
                          >
                            {course.status === 'Expired'
                              ? isRTL
                                ? 'تجديد الوصول'
                                : 'Renew Access'
                              : course.status === 'Completed'
                              ? isRTL
                                ? 'عرض الشهادة'
                                : 'View Certificate'
                              : isRTL
                              ? 'متابعة التعلم'
                              : 'Continue Learning'}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
