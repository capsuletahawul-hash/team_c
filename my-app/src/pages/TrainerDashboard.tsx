// src/pages/TrainerDashboard.tsx
import React, { useState, useEffect } from 'react';

// Reusable Components
import TrainerNavbar from "../components/TrainerNavbar";
import Footer from '../components/Footer';
import Button from '../components/Button';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';
import { useLanguage } from '../context/LanguageContext';
import { BASE_URL } from '../services/api';
import { calculateCourseEarnings, getTrainerMockReviews, getTrainerMockProgress } from '../mocks/mockApi';

export interface CourseItem {
  id: number; title: string; category: string; description: string; price: number; students: number; status: string; isVisible?: boolean;
}

export default function TrainerDashboard() {
  const { t, lang } = useLanguage();
  const l = t.trainerDashboard;
  const token = localStorage.getItem('user_token');

  const [coursesList, setCoursesList] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  interface LearningCourse { id: number; title: string; category: string; duration: string; progress: number; status: string; }
  const [learningCourses, setLearningCourses] = useState<LearningCourse[]>([]);

  const [formData, setFormData] = useState({
    title: '', price: '', durationWeeks: '', maxStudents: '', videoDurationMinutes: '', level: 'beginner', category: 'Cybersecurity', description: '', requirementsNotes: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const refetchCourses = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/trainer/courses`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json().catch(() => ({ courses: [] }));
      if (data?.courses) {
        setCoursesList((data.courses as CourseItem[]).map(c => ({ ...c, price: c.price > 1000 ? 350 : c.price, isVisible: c.isVisible !== false })));
      }
    } catch {
      setError(lang === 'ar' ? 'فشل في جلب البيانات من الخادم' : 'Failed to fetch engine telemetry data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refetchCourses(); }, [lang]);

  // 🎓 الكورسات اللي المدرب اشتراها لنفسه ليتعلم
  useEffect(() => {
    fetch(`${BASE_URL}/student/courses/purchased`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setLearningCourses(Array.isArray(data) ? data : []))
      .catch(() => setLearningCourses([]));
  }, []);

  const reviewsList = getTrainerMockReviews(lang);
  const progressList = getTrainerMockProgress(lang);

  const totalPayoutCollected = coursesList
    .filter(c => {
      const s = (c.status || '').toLowerCase();
      return s === 'available' || s === 'published' || s === 'approved' || s === 'active';
    })
    .reduce((acc, c) => acc + (Number(c.students || 0) * Number(c.price || 0) * 0.85), 0)
    .toFixed(2);

  const totalStudentsEnrolled = coursesList
    .filter(c => {
      const s = (c.status || '').toLowerCase();
      return s === 'available' || s === 'published' || s === 'approved' || s === 'active';
    })
    .reduce((acc, c) => acc + Number(c.students || 0), 0);

  const requestDeletionFromAdmin = async (courseId: number, courseTitle: string) => {
    if (!window.confirm(lang === 'ar' ? `هل تريد إرسال طلب للمسؤول لحذف دورة "${courseTitle}"؟` : `Submit deletion request for "${courseTitle}"?`)) return;
    try {
      const res = await fetch(`${BASE_URL}/trainer/courses/${courseId}/deletion-request`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) return alert(lang === 'ar' ? 'تعذر إرسال طلب الحذف' : 'Failed deletion request');
      setCoursesList(prev => prev.map(c => c.id === courseId ? { ...c, status: 'pending_deletion' } : c));
      setMessage(lang === 'ar' ? 'تم إرسال طلب الحذف للمسؤول بنجاح.' : 'Deletion request submitted successfully.');
    } catch (err) { console.error(err); }
  };

  const toggleVisibility = async (courseId: number) => {
    const targetCourse = coursesList.find(c => c.id === courseId);
    if (!targetCourse) return;
    const nextVisibility = !targetCourse.isVisible;
    try {
      const res = await fetch(`${BASE_URL}/trainer/courses/${courseId}/visibility`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ isVisible: nextVisibility })
      });
      if (!res.ok) return alert(lang === 'ar' ? 'فشل تعديل حالة الظهور' : 'Failed visibility update');
      setCoursesList(prev => prev.map(c => c.id === courseId ? { ...c, isVisible: nextVisibility } : c));
      setMessage(lang === 'ar' ? 'تم تحديث حالة ظهور الدورة.' : 'Course store visibility updated.');
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(''); setError('');

    if (formData.requirementsNotes.trim().length < 20) return setError(l.messages.valErrorLength);

    try {
      const res = await fetch(`${BASE_URL}/trainer/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price) || 0,
          durationWeeks: Number(formData.durationWeeks) || 0,
          maxStudents: Number(formData.maxStudents) || 0,
          videoDurationMinutes: Number(formData.videoDurationMinutes) || 0
        })
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) return setError((result.error || result.message) || l.messages.genericError);

      const generatedId = result.ticketId || result.id || Math.floor(Math.random() * 900 + 100);
      
      // ✅ ترجمة ديناميكية لرسالة رفع الدورة مع الـ ID
      setMessage(
        lang === 'ar' 
          ? `تم رفع الدورة المفصلة بنجاح وهي قيد المراجعة برقم: ${generatedId}`
          : `Detailed course submitted under review with ticket ID: ${generatedId}`
      );

      await refetchCourses();
      setFormData({ title: '', price: '', durationWeeks: '', maxStudents: '', videoDurationMinutes: '', level: 'beginner', category: 'Cybersecurity', description: '', requirementsNotes: '' });
    } catch {
      const generatedId = Math.floor(Math.random() * 900 + 100);
      
      // ✅ ترجمة ديناميكية لرسالة رفع الدورة مع الـ ID
      setMessage(
        lang === 'ar' 
          ? `تم رفع الدورة المفصلة بنجاح وهي قيد المراجعة برقم: ${generatedId}`
          : `Detailed course submitted under review with ticket ID: ${generatedId}`
      );

      setFormData({ title: '', price: '', durationWeeks: '', maxStudents: '', videoDurationMinutes: '', level: 'beginner', category: 'Cybersecurity', description: '', requirementsNotes: '' });
    }
  };

  if (loading) return <div className="min-h-screen bg-capsule-bg dark:bg-[#0A0F1D] flex items-center justify-center"><LoadingIndicator message={l.loading} /></div>;

  const borderSide = t.dir === 'rtl' ? 'border-r-4' : 'border-l-4';

  return (
    <div className="min-h-screen bg-[#C9D6DF] dark:bg-[#0A0F1D] text-capsule-navy dark:text-slate-100 font-sans antialiased flex flex-col relative overflow-hidden transition-colors duration-300" dir={t.dir}>
      {/* Ambient Seamless Radial Glass Glows */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[5%] left-[20%] w-[500px] h-[500px] bg-capsule-teal/15 dark:bg-sky-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[10%] right-[20%] w-[500px] h-[500px] bg-capsule-gold/15 dark:bg-indigo-500/10 rounded-full blur-[140px]" />
      </div>

      <TrainerNavbar activePage="dashboard" />
      
      <main className="flex-grow max-w-7xl mx-auto px-6 py-10 w-full grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        <div className="lg:col-span-2 space-y-6">
          
          {/* Stat Cards with Glassmorphism */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`bg-white/40 dark:bg-[#162035]/60 backdrop-blur-xl p-6 rounded-3xl border border-white/50 dark:border-white/10 shadow-xl ${borderSide} border-capsule-teal hover:border-capsule-teal transition-all duration-300`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-black text-gray-500 dark:text-slate-400">{lang === 'ar' ? 'صافي الأرباح المحققة الحالي' : 'Total Dynamic Net Payout'}</p>
                <svg className="w-5 h-5 text-capsule-teal dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-2xl font-black text-capsule-teal dark:text-teal-400 font-mono tracking-tight">{totalPayoutCollected} SAR</h3>
            </div>

            <div className={`bg-white/40 dark:bg-[#162035]/60 backdrop-blur-xl p-6 rounded-3xl border border-white/50 dark:border-white/10 shadow-xl ${borderSide} border-capsule-gold hover:border-capsule-gold transition-all duration-300`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-black text-capsule-dark-gold dark:text-amber-400">{lang === 'ar' ? 'الطلاب بالدورات النشطة' : 'Active Course Students'}</p>
                <svg className="w-5 h-5 text-capsule-gold dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <h3 className="text-2xl font-black text-capsule-navy dark:text-sky-300 font-mono tracking-tight">{totalStudentsEnrolled}</h3>
            </div>

            <div className={`bg-white/40 dark:bg-[#162035]/60 backdrop-blur-xl p-6 rounded-3xl border border-white/50 dark:border-white/10 shadow-xl ${borderSide} border-capsule-navy hover:border-capsule-navy transition-all duration-300`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-black text-capsule-navy dark:text-sky-300">{l.stats.accountStatus}</p>
                <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-md font-black text-emerald-600 dark:text-emerald-400 mt-1">{l.stats.verified}</h3>
            </div>
          </div>

          {/* Density Breakdown Glassmorphism */}
          <div className="bg-white/40 dark:bg-[#162035]/60 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-3xl p-6 shadow-2xl backdrop-saturate-150 border-t-4 border-t-capsule-navy">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-capsule-navy dark:text-sky-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              <h3 className="text-sm font-black text-capsule-navy dark:text-sky-300">{lang === 'ar' ? 'مؤشرات الكثافة الاستيعابية وصافي الربح لكل دورة' : 'Course Density & Net Revenue Breakdown'}</h3>
            </div>
            <div className="space-y-3.5 pt-1">
              {coursesList.map((course) => (
                <div key={course.id} className="bg-white/30 dark:bg-[#0F172A]/50 backdrop-blur-md p-3.5 rounded-2xl border border-white/30 dark:border-white/10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2 text-xs font-bold">
                    <span className="text-capsule-navy dark:text-sky-300 font-black max-w-[45%] truncate">{course.title}</span>
                    <div className="flex items-center gap-3 text-gray-600 dark:text-slate-400">
                      <span className="font-mono text-[11px] font-bold">{course.students} {lang === 'ar' ? 'طالب' : 'Students'}</span>
                      <span className="text-capsule-teal dark:text-teal-400 font-black font-mono text-[11px] flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-capsule-teal dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        {calculateCourseEarnings(course.students, course.price)} SAR
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200/60 dark:bg-slate-800/80 h-2.5 rounded-full overflow-hidden p-0.5">
                    <div className={`h-full rounded-full transition-all duration-700 ${!course.isVisible ? 'bg-gray-400' : 'bg-gradient-to-l from-capsule-teal to-capsule-navy'}`} style={{ width: `${Math.min((course.students / 1300) * 100, 100) || 4}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Course Pipeline Controls Glassmorphism */}
          <div className="bg-white/40 dark:bg-[#162035]/60 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-3xl p-6 shadow-2xl backdrop-saturate-150 border-t-4 border-t-capsule-teal">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-capsule-teal dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <h2 className="text-sm font-black text-capsule-navy dark:text-sky-300">{lang === 'ar' ? 'خط التحكم الشامل بالدورات التدريبية' : 'Interactive Course Pipeline Controls'}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-gray-700 dark:text-slate-300 text-center border-collapse">
                <thead>
                  <tr className="bg-white/50 dark:bg-[#0F172A]/80 text-capsule-navy dark:text-sky-300 font-black border-b border-slate-300/60 dark:border-slate-700">
                    <th className="py-3 px-2.5 text-start">{lang === 'ar' ? 'اسم الدورة' : 'Course Title'}</th>
                    <th className="py-3 px-2.5">{lang === 'ar' ? 'السعر' : 'Price'}</th>
                    <th className="py-3 px-2.5">{lang === 'ar' ? 'الطلاب' : 'Students'}</th>
                    <th className="py-3 px-2.5 text-emerald-900 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/60">{lang === 'ar' ? 'صافي ربحك' : 'Net Payout'}</th>
                    <th className="py-3 px-2.5">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                    <th className="py-3 px-2.5">{lang === 'ar' ? 'العمليات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800 font-bold text-center">
                  {coursesList.map((course) => (
                    <tr key={course.id} className="hover:bg-white/30 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-2.5 text-start font-black text-capsule-navy dark:text-sky-300 truncate max-w-[140px]">{course.title}</td>
                      <td className="py-3.5 px-2.5 font-mono dark:text-slate-200">{course.price} SAR</td>
                      <td className="py-3.5 px-2.5 font-mono text-gray-600 dark:text-slate-400">{course.students}</td>
                      <td className="py-3.5 px-2.5 font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100/40 dark:bg-emerald-950/40 font-mono">{calculateCourseEarnings(course.students, course.price)} SAR</td>
                      <td className="py-3.5 px-2.5">
                        {(() => {
                          const s = (course.status || '').toLowerCase();
                          let badge = {
                            label: course.status || (lang === 'ar' ? 'مسودة' : 'Draft'),
                            cls: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                          };
                          if (s === 'available' || s === 'approved' || s === 'active') {
                            badge = { label: lang === 'ar' ? 'نشطة' : 'Active', cls: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' };
                          } else if (s === 'coming_soon' || s === 'review' || s === 'pending') {
                            badge = { label: lang === 'ar' ? 'قيد المراجعة' : 'Pending', cls: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800' };
                          } else if (s === 'pending_deletion') {
                            badge = { label: lang === 'ar' ? 'انتظار الحذف' : 'Pending Delete', cls: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-400 border border-rose-200 dark:border-rose-800' };
                          } else if (s === 'rejected') {
                            badge = { label: lang === 'ar' ? 'مرفوضة' : 'Rejected', cls: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-400 border border-rose-200 dark:border-rose-800' };
                          }
                          return (
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${badge.cls}`}>
                              {badge.label}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="py-3.5 px-2.5 flex justify-center gap-1.5">
                        <button onClick={() => toggleVisibility(course.id)} className="px-2.5 py-1 rounded-lg text-[10px] font-black text-white bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 transition shadow-xs cursor-pointer">
                          {course.isVisible ? (lang === 'ar' ? 'إخفاء' : 'Hide') : (lang === 'ar' ? 'عرض' : 'Show')}
                        </button>
                        <button onClick={() => requestDeletionFromAdmin(course.id, course.title)} disabled={course.status === 'pending_deletion'} className={`px-2.5 py-1 rounded-lg text-[10px] font-black text-white transition shadow-xs ${course.status === 'pending_deletion' ? 'bg-gray-300 dark:bg-slate-800 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-700 cursor-pointer'}`}>
                          {course.status === 'pending_deletion' ? (lang === 'ar' ? 'مرفوع' : 'Sent') : (lang === 'ar' ? 'طلب حذف' : 'Delete')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Form & Feedback Glassmorphism */}
        <div className="space-y-6">
          {learningCourses.length > 0 && (
            <div className="bg-white/40 dark:bg-[#162035]/60 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-white/30 dark:border-slate-800 bg-white/20 dark:bg-[#0F172A]/50">
                <h2 className="text-base font-bold text-capsule-navy dark:text-sky-300">{lang === 'ar' ? 'دوراتي التعليمية' : 'My Learning'}</h2>
              </div>
              <div className="divide-y divide-white/20 dark:divide-slate-800">
                {learningCourses.map((c) => (
                  <div key={c.id} className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <p className="font-bold text-capsule-navy dark:text-sky-300 text-sm">{c.title}</p>
                      <p className="text-xs text-gray-400 dark:text-slate-400 mt-1">{c.category} · {c.duration}</p>
                      <div className="w-full bg-slate-200/60 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                        <div className="bg-capsule-teal h-2 rounded-full transition-all" style={{ width: `${c.progress}%` }}></div>
                      </div>
                      <p className="text-xs font-bold text-gray-400 dark:text-slate-400 mt-1">{c.progress}% {lang === 'ar' ? 'مكتمل' : 'Completed'}</p>
                    </div>
                    <Button variant="primary">{lang === 'ar' ? 'إكمال' : 'Continue'}</Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white/40 dark:bg-[#162035]/60 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-3xl p-6 shadow-2xl backdrop-saturate-150 border-t-4 border-t-capsule-navy h-fit">
            <div className="flex items-center gap-2 border-b border-white/30 dark:border-slate-800 pb-3 mb-4">
              <svg className="w-5 h-5 text-capsule-navy dark:text-sky-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <h2 className="text-md font-black text-capsule-navy dark:text-sky-300">{lang === 'ar' ? 'إنشاء وتفصيل دورة جديدة' : 'Create Detailed Course'}</h2>
            </div>
            {message && <div className={`mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 rounded-xl text-xs font-bold ${borderSide} border-emerald-500`}>{message}</div>}
            <ErrorMessage message={error} />

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-700 dark:text-slate-300 mb-1">{l.form.labels.title} *</label>
                <input 
                  type="text" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleInputChange} 
                  required 
                  className="w-full p-2.5 bg-white/60 dark:bg-[#0F172A] border border-white/40 dark:border-slate-700 rounded-xl text-xs font-bold text-capsule-navy dark:text-slate-100 outline-none focus:border-capsule-teal" 
                  placeholder={lang === 'ar' ? 'معسكر هندسة برمجيات متقدم' : 'Advanced Software Engineering Bootcamp'} 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-gray-700 dark:text-slate-300 mb-1">{lang === 'ar' ? 'التصنيف *' : 'Category *'}</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className="w-full p-2.5 bg-white/60 dark:bg-[#0F172A] border border-white/40 dark:border-slate-700 rounded-xl text-xs font-bold text-capsule-navy dark:text-slate-100 outline-none focus:border-capsule-teal">
                    <option value="Cybersecurity">{lang === 'ar' ? 'الأمن السيبراني' : 'Cybersecurity'}</option>
                    <option value="Software Engineering">{lang === 'ar' ? 'هندسة البرمجيات' : 'Software Engineering'}</option>
                    <option value="Artificial Intelligence">{lang === 'ar' ? 'الذكاء الاصطناعي' : 'Artificial Intelligence'}</option>
                    <option value="Cloud Computing">{lang === 'ar' ? 'الحوسبة السحابية' : 'Cloud Computing'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-700 dark:text-slate-300 mb-1">{lang === 'ar' ? 'المستوى *' : 'Level *'}</label>
                  <select name="level" value={formData.level} onChange={handleInputChange} className="w-full p-2.5 bg-white/60 dark:bg-[#0F172A] border border-white/40 dark:border-slate-700 rounded-xl text-xs font-bold text-capsule-navy dark:text-slate-100 outline-none focus:border-capsule-teal">
                    <option value="beginner">{lang === 'ar' ? 'مبتدئ' : 'Beginner'}</option>
                    <option value="intermediate">{lang === 'ar' ? 'متوسط' : 'Intermediate'}</option>
                    <option value="advanced">{lang === 'ar' ? 'متقدم' : 'Advanced'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-gray-700 dark:text-slate-300 mb-1">{l.form.labels.price} (SAR) *</label>
                  <input type="number" name="price" value={formData.price} onChange={handleInputChange} required className="w-full p-2.5 bg-white/60 dark:bg-[#0F172A] border border-white/40 dark:border-slate-700 rounded-xl text-xs font-bold text-capsule-navy dark:text-slate-100 outline-none focus:border-capsule-teal" placeholder="350" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-700 dark:text-slate-300 mb-1">{l.form.labels.duration} *</label>
                  <input type="number" name="durationWeeks" value={formData.durationWeeks} onChange={handleInputChange} required className="w-full p-2.5 bg-white/60 dark:bg-[#0F172A] border border-white/40 dark:border-slate-700 rounded-xl text-xs font-bold text-capsule-navy dark:text-slate-100 outline-none focus:border-capsule-teal" placeholder="6" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-gray-700 dark:text-slate-300 mb-1">{l.form.labels.maxStudents} *</label>
                  <input type="number" name="maxStudents" value={formData.maxStudents} onChange={handleInputChange} required className="w-full p-2.5 bg-white/60 dark:bg-[#0F172A] border border-white/40 dark:border-slate-700 rounded-xl text-xs font-bold text-capsule-navy dark:text-slate-100 outline-none focus:border-capsule-teal" placeholder="50" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-700 dark:text-slate-300 mb-1">{l.form.labels.videoDuration} *</label>
                  <input type="number" name="videoDurationMinutes" value={formData.videoDurationMinutes} onChange={handleInputChange} required className="w-full p-2.5 bg-white/60 dark:bg-[#0F172A] border border-white/40 dark:border-slate-700 rounded-xl text-xs font-bold text-capsule-navy dark:text-slate-100 outline-none focus:border-capsule-teal" placeholder="120" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 dark:text-slate-300 mb-1">{lang === 'ar' ? 'نبذة ووصف مختصر للدورة *' : 'Short Description *'}</label>
                <input 
                  type="text" 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  required 
                  className="w-full p-2.5 bg-white/60 dark:bg-[#0F172A] border border-white/40 dark:border-slate-700 rounded-xl text-xs font-bold text-capsule-navy dark:text-slate-100 outline-none focus:border-capsule-teal" 
                  placeholder={lang === 'ar' ? 'نبذة توضح محتوى الدورة للطلاب...' : 'Brief summary explaining course content...'} 
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 dark:text-slate-300 mb-1">{l.form.labels.requirements} *</label>
                <textarea name="requirementsNotes" value={formData.requirementsNotes} onChange={handleInputChange} required rows={2} className="w-full p-2.5 bg-white/60 dark:bg-[#0F172A] border border-white/40 dark:border-slate-700 rounded-xl text-xs font-bold text-capsule-navy dark:text-slate-100 resize-none outline-none focus:border-capsule-teal" placeholder={l.form.placeholders.requirements}></textarea>
              </div>

              <Button type="submit" variant="primary">{l.form.submitBtn}</Button>
            </form>
          </div>

          <div className="bg-white/40 dark:bg-[#162035]/60 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-3xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-capsule-gold dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              <h4 className="text-xs font-black text-capsule-navy dark:text-sky-300 uppercase tracking-wider">{lang === 'ar' ? 'تقييمات الطلاب الحية' : 'Live Student Reviews'}</h4>
            </div>
            <div className="space-y-2 max-h-[160px] overflow-y-auto divide-y divide-white/20 dark:divide-slate-800">
              {reviewsList.map(rev => (
                <div key={rev.id} className="pt-2 text-[11px] font-medium">
                  <div className="flex justify-between items-center font-black mb-0.5 text-capsule-navy dark:text-sky-300">
                    <span>{rev.name}</span>
                    <span className="text-capsule-gold dark:text-amber-400 font-mono">{"★".repeat(rev.rating)}</span>
                  </div>
                  <p className="text-gray-600 dark:text-slate-400 text-xs font-bold">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/40 dark:bg-[#162035]/60 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-3xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-capsule-navy dark:text-sky-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              <h4 className="text-xs font-black text-capsule-navy dark:text-sky-300 uppercase tracking-wider">{lang === 'ar' ? 'سجل تقدم الطلاب المشتركين' : 'Students Progress Log'}</h4>
            </div>
            <div className="space-y-2 text-[11px] font-bold text-gray-700 dark:text-slate-300">
              {progressList.map(student => (
                <div key={student.id} className="flex justify-between items-center bg-white/30 dark:bg-[#0F172A]/50 backdrop-blur-xs p-2.5 rounded-xl border border-white/30 dark:border-white/10 shadow-2xs">
                  <div>
                    <p className="font-black text-capsule-navy dark:text-sky-300">{student.name} (#{student.id})</p>
                    <p className="text-[10px] text-gray-500 dark:text-slate-400 font-bold truncate max-w-[150px]">{lang === 'ar' ? student.courseAr : student.courseEn}</p>
                  </div>
                  <span className="font-mono text-capsule-teal dark:text-teal-400 font-black text-xs">{student.progress}%</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}