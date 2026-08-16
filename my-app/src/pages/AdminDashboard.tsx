import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingIndicator from '../components/LoadingIndicator';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

type ActiveTabType = 'overview' | 'users' | 'courses' | 'complaints';
export interface UserPermission { id: string; name: string; email: string; role: 'STUDENT' | 'ADMIN' | string; status: string; _count?: { enrollments: number }; }
export interface CourseItem { id: string; title: string; instructor?: string; price: number; category?: string; status: string; }
export interface ComplaintItem { id: string; name: string; email: string; message: string; date: string; }
export interface GrowthMetric { monthAr: string; monthEn: string; count: number; }
export interface AdminStats { totalUsers: number; totalRevenue: number; activeEnrollments: number; }

const AdminDashboard: React.FC = () => {
  const { t, lang } = useLanguage();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTabType>('overview');
  const [message, setMessage] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [statsData, setStatsData] = useState<AdminStats>({ totalUsers: 0, totalRevenue: 0, activeEnrollments: 0 });
  const [usersList, setUsersList] = useState<UserPermission[]>([]);
  const [coursesList, setCoursesList] = useState<CourseItem[]>([]);
  const [complaintsList, setComplaintsList] = useState<ComplaintItem[]>([]);
  const [growthList, setGrowthList] = useState<GrowthMetric[]>([]);

  const adminNotifications = [
    { id: '1', textAr: 'طلب انضمام مدرب جديد قيد المراجعة', textEn: 'New trainer application under review' },
    { id: '2', textAr: 'تم تسجيل اشتراكات جديدة في دورة الذكاء الاصطناعي', textEn: 'New enrollments in AI course' }
  ];

  const API_BASE = 'http://localhost:5000/api';

  const fetchAdminData = async () => {
    setLoading(true);
    const authToken = token || localStorage.getItem('user_token') || '';
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` };

    try {
      // 1. جلب الإحصائيات من الداتابيس
      const statsRes = await fetch(`${API_BASE}/admin/stats`, { headers });
      if (statsRes.ok) {
        const resJson = await statsRes.json();
        setStatsData(resJson.data || resJson);
      }

      // 2. جلب المستخدمين من الداتابيس
      const usersRes = await fetch(`${API_BASE}/admin/users`, { headers });
      if (usersRes.ok) {
        const resJson = await usersRes.json();
        const uData = Array.isArray(resJson) ? resJson : resJson.data || [];
        setUsersList(uData.map((u: any) => ({ ...u, status: u.status || 'active' })));
      }

      // 3. جلب الكورسات من الداتابيس
      const coursesRes = await fetch(`${API_BASE}/courses`, { headers });
      if (coursesRes.ok) {
        const resJson = await coursesRes.json();
        const cData = Array.isArray(resJson) ? resJson : resJson.data || resJson.courses || [];
        setCoursesList(cData.map((c: any, i: number) => ({
          ...c,
          instructor: c.instructor || 'Ahmed Mohammed',
          status: c.status || 'available',
          category: c.category || (i % 2 === 0 ? (lang === 'ar' ? 'الأمن السيبراني' : 'Cybersecurity') : (lang === 'ar' ? 'هندسة البرمجيات' : 'Software Engineering'))
        })));
      }

      setComplaintsList([
        { id: 'TKT-991', name: 'سارة العبدالله', email: 'sara@example.com', message: lang === 'ar' ? 'تواجهني مشكلة أثناء تحميل الملفات.' : 'I face an issue downloading files.', date: '2026-08-14' },
        { id: 'TKT-992', name: 'خالد المنصور', email: 'khalid@example.com', message: lang === 'ar' ? 'طلب تفعيل واجهة الشركة B2B قيد الانتظار.' : 'B2B onboarding request is pending.', date: '2026-08-15' }
      ]);
      setGrowthList([{ monthAr: 'مايو', monthEn: 'May', count: 420 }, { monthAr: 'يونيو', monthEn: 'June', count: 850 }, { monthAr: 'يوليو', monthEn: 'July', count: 1240 }, { monthAr: 'أغسطس', monthEn: 'August', count: 1580 }]);
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAdminData(); }, [lang]);

  const categoryCounts = coursesList.reduce<Record<string, number>>((acc, course) => {
    const cat = course.category || (lang === 'ar' ? 'تخصصات أخرى' : 'Other');
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذه الدورة؟' : 'Are you sure you want to delete this course?')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/courses/${courseId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token || localStorage.getItem('user_token')}` },
      });
      if (res.ok) {
        setCoursesList((prev) => prev.filter((c) => c.id !== courseId));
        setMessage(lang === 'ar' ? 'تم حذف الكورس بنجاح من قاعدة البيانات.' : 'Course deleted successfully.');
      }
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="min-h-screen bg-[#C9D6DF] flex items-center justify-center"><LoadingIndicator message={t.admin.loading} /></div>;

  return (
    <div className="min-h-screen bg-[#C9D6DF] text-capsule-navy font-sans antialiased flex flex-col relative overflow-hidden" dir={t.dir}>
      <div className={`absolute top-10 ${t.dir === 'rtl' ? 'right-12' : 'left-12'} w-[450px] h-[450px] bg-capsule-teal/15 rounded-full blur-[120px] pointer-events-none z-0`}></div>
      <div className={`absolute top-[40%] ${t.dir === 'rtl' ? 'left-12' : 'right-12'} w-[400px] h-[400px] bg-capsule-gold/15 rounded-full blur-[120px] pointer-events-none z-0`}></div>

      <div className="relative z-40 bg-white/70 backdrop-blur-md border-b border-white/80 shadow-xs">
        <Navbar activePage="home" />
        <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center justify-between">
          <span className="text-[10px] font-black tracking-widest text-capsule-teal uppercase bg-capsule-teal/10 px-3 py-1 rounded-full border border-capsule-teal/20">
            {lang === 'ar' ? 'لوحة تحكم المشرف الرئيسي' : 'SUPER ADMIN PANEL'}
          </span>
          <div className="relative">
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 bg-white/90 backdrop-blur-md rounded-xl border border-white shadow-2xs hover:bg-white transition text-capsule-navy flex items-center gap-2 text-xs font-bold">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              <span>{lang === 'ar' ? 'الإشعارات' : 'Notifications'}</span>
              <span className="bg-rose-500 text-white text-[10px] font-black font-mono px-1.5 py-0.2 rounded-full">{adminNotifications.length}</span>
            </button>
            {showNotifications && (
              <div className={`absolute mt-2 w-72 bg-white/95 backdrop-blur-xl rounded-2xl border border-white shadow-xl p-3 space-y-2 text-xs text-start z-50 ${t.dir === 'rtl' ? 'left-0' : 'right-0'}`}>
                <p className="font-black text-capsule-navy border-b pb-1.5">{lang === 'ar' ? 'التنبيهات الواردة' : 'Inbound Tickets'}</p>
                {adminNotifications.map((n) => (
                  <div key={n.id} className="p-2.5 bg-slate-50 rounded-xl text-gray-700 border border-slate-200/60 flex gap-2 text-[11px] font-bold">
                    <svg className="w-4 h-4 text-capsule-teal shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>{lang === 'ar' ? n.textAr : n.textEn}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="flex-grow max-w-7xl mx-auto px-6 py-8 w-full grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10">
        <div className="lg:col-span-1 bg-white/90 backdrop-blur-xl border border-white p-4 rounded-3xl shadow-md space-y-1.5 h-fit sticky top-6">
          <div className="p-3 border-b border-slate-200/80 mb-2">
            <p className="text-[10px] font-black text-capsule-teal uppercase tracking-widest">{lang === 'ar' ? 'لوحة تحكم المشرف' : 'CONTROL CENTER'}</p>
            <h4 className="text-xs font-black text-capsule-navy mt-0.5">{lang === 'ar' ? 'إدارة المنظومة' : 'Management Hub'}</h4>
          </div>
          <button onClick={() => setActiveTab('overview')} className={`w-full text-start p-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${activeTab === 'overview' ? 'bg-capsule-navy text-white shadow-xs' : 'text-gray-600 hover:bg-slate-100/80'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            <span>{lang === 'ar' ? 'نظرة عامة ومؤشرات النظام' : 'System Overview'}</span>
          </button>
          <button onClick={() => setActiveTab('users')} className={`w-full text-start p-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${activeTab === 'users' ? 'bg-capsule-navy text-white shadow-xs' : 'text-gray-600 hover:bg-slate-100/80'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            <span>{lang === 'ar' ? 'إدارة الهويات والصلاحيات' : 'Identity & IAM Control'}</span>
          </button>
          <button onClick={() => setActiveTab('courses')} className={`w-full text-start p-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${activeTab === 'courses' ? 'bg-capsule-navy text-white shadow-xs' : 'text-gray-600 hover:bg-slate-100/80'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <span>{lang === 'ar' ? 'إدارة واعتماد الكورسات' : 'Course Pipeline Control'}</span>
          </button>
          <button onClick={() => setActiveTab('complaints')} className={`w-full text-start p-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${activeTab === 'complaints' ? 'bg-capsule-navy text-white shadow-xs' : 'text-gray-600 hover:bg-slate-100/80'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
            <span>{lang === 'ar' ? 'صندوق الشكاوى والتواصل' : 'Complaints Box'}</span>
          </button>
          <div className="pt-2 border-t border-slate-200/80 space-y-1 mt-2">
            <Link to="/contracts-approval" className="w-full text-start p-2.5 rounded-xl text-xs font-bold transition text-gray-600 hover:bg-slate-100/80 flex items-center gap-2.5">
              <svg className="w-4 h-4 text-capsule-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4m-4 0a2 2 0 100 4m0-4a2 2 0 100-4" /></svg>
              <span>{lang === 'ar' ? 'اعتماد عقود الشركات (B2B)' : 'Corporate Approvals'}</span>
            </Link>
            <Link to="/courses-approval" className="w-full text-start p-2.5 rounded-xl text-xs font-bold transition text-gray-600 hover:bg-slate-100/80 flex items-center gap-2.5">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{lang === 'ar' ? 'اعتماد الدورات الفعلية' : 'Live Course Approval'}</span>
            </Link>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {message && <div className={`p-3.5 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-bold ${t.dir === 'rtl' ? 'border-r-4' : 'border-l-4'} border-emerald-500 shadow-2xs`}>{message}</div>}

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white/90 backdrop-blur-md border border-white p-5 rounded-3xl shadow-sm">
                  <p className="text-xs font-black text-gray-500 mb-1">{lang === 'ar' ? 'إجمالي المستخدمين' : 'Total Users'}</p>
                  <p className="text-xl font-black text-capsule-navy font-mono">{statsData.totalUsers}</p>
                </div>
                <div className="bg-white/90 backdrop-blur-md border border-white p-5 rounded-3xl shadow-sm">
                  <p className="text-xs font-black text-gray-500 mb-1">{lang === 'ar' ? 'الكورسات الحالية' : 'Total Platform Courses'}</p>
                  <p className="text-xl font-black text-capsule-teal font-mono">{coursesList.length}</p>
                </div>
                <div className="bg-white/90 backdrop-blur-md border border-white p-5 rounded-3xl shadow-sm">
                  <p className="text-xs font-black text-gray-500 mb-1">{lang === 'ar' ? 'الاشتراكات النشطة' : 'Active Enrollments'}</p>
                  <p className="text-xl font-black text-capsule-navy font-mono">{statsData.activeEnrollments}</p>
                </div>
                <div className="bg-white/90 backdrop-blur-md border border-white p-5 rounded-3xl shadow-sm">
                  <p className="text-xs font-black text-gray-500 mb-1">{lang === 'ar' ? 'إجمالي الأرباح' : 'Total Revenue'}</p>
                  <p className="text-xl font-black text-emerald-600 font-mono">{statsData.totalRevenue} SAR</p>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-md border border-white rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <svg className="w-5 h-5 text-capsule-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.001 0 0120.488 9z" /></svg>
                  <h3 className="text-xs font-black text-capsule-navy uppercase tracking-wider">{lang === 'ar' ? 'توزيع الدورات التدريبية حسب التخصص' : 'Course Distribution by Specialization'}</h3>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-around gap-8 py-2">
                  <div className="relative w-40 h-40 rounded-full flex items-center justify-center p-3 shadow-md" style={{ background: 'conic-gradient(#0f172a 0% 50%, #0d9488 50% 100%)' }}>
                    <div className="w-28 h-28 bg-white/95 rounded-full flex flex-col items-center justify-center shadow-inner">
                      <span className="text-2xl font-black font-mono text-capsule-navy">{coursesList.length}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">{lang === 'ar' ? 'إجمالي الكورسات' : 'Total Courses'}</span>
                    </div>
                  </div>
                  <div className="space-y-3 w-full sm:w-auto">
                    {Object.entries(categoryCounts).map(([cat, count], idx) => (
                      <div key={cat} className="flex items-center justify-between sm:justify-start gap-4 p-3 bg-slate-100/80 rounded-2xl border border-slate-200/80 min-w-[220px]">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-3.5 h-3.5 rounded-full shadow-2xs ${idx === 0 ? 'bg-capsule-navy' : 'bg-capsule-teal'}`}></span>
                          <span className="text-xs font-black text-capsule-navy">{cat}</span>
                        </div>
                        <span className="text-xs font-black font-mono text-capsule-teal bg-white px-2.5 py-1 rounded-xl border border-slate-200/80 shadow-2xs">{count} {lang === 'ar' ? 'دورة' : 'Courses'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-md border border-white rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-capsule-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  <h3 className="text-xs font-black text-capsule-navy uppercase tracking-wider">{lang === 'ar' ? 'المؤشر التزايدي الإجمالي لتفاعل ونمو مستخدمي المنصة' : 'Incremental Monthly User Registration Trajectory'}</h3>
                </div>
                <div className="space-y-3.5 pt-1">
                  {growthList.map((tItem: GrowthMetric, idx: number) => (
                    <div key={idx} className="bg-slate-100/80 p-3 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-4">
                      <span className="text-xs font-black text-capsule-navy w-24">{lang === 'ar' ? tItem.monthAr : tItem.monthEn}</span>
                      <div className="flex-grow bg-slate-200 h-3 rounded-full overflow-hidden p-0.5 border border-slate-300/50">
                        <div className="bg-gradient-to-r from-capsule-teal to-capsule-navy h-full rounded-full transition-all duration-700" style={{ width: `${Math.min((tItem.count / 1600) * 100, 100)}%` }}></div>
                      </div>
                      <span className="text-xs font-black font-mono text-capsule-teal w-24 text-end">{tItem.count} {lang === 'ar' ? 'حساب' : 'Accounts'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white/90 backdrop-blur-md border border-white rounded-3xl shadow-sm overflow-hidden p-6">
              <h3 className="text-sm font-black text-capsule-navy border-b pb-3 mb-4">{lang === 'ar' ? 'إدارة الهويات وحسابات النظام' : 'User Identity Control'}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-center border-collapse">
                  <thead>
                    <tr className="bg-slate-200/80 text-capsule-navy font-black border-b border-slate-300">
                      <th className="p-3 text-start">ID</th>
                      <th className="p-3">{lang === 'ar' ? 'الاسم' : 'Name'}</th>
                      <th className="p-3">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</th>
                      <th className="p-3">{lang === 'ar' ? 'الصلاحية' : 'Role'}</th>
                      <th className="p-3">{lang === 'ar' ? 'الاشتراكات' : 'Enrollments'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 font-bold">
                    {usersList.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-100/50">
                        <td className="p-3 font-mono text-blue-600 text-start">{user.id.slice(0, 8)}...</td>
                        <td className="p-3 text-capsule-navy font-black">{user.name}</td>
                        <td className="p-3 font-mono text-gray-500">{user.email}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-capsule-teal">{user._count?.enrollments || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="bg-white/90 backdrop-blur-md border border-white rounded-3xl shadow-sm overflow-hidden p-6">
              <h3 className="text-sm font-black text-capsule-navy border-b pb-3 mb-4">{lang === 'ar' ? 'إدارة واعتماد الدورات التدريبية' : 'Course Approval Terminal'}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-center border-collapse">
                  <thead>
                    <tr className="bg-slate-200/80 text-capsule-navy font-black border-b border-slate-300">
                      <th className="p-3 text-start">{lang === 'ar' ? 'عنوان الدورة' : 'Course Title'}</th>
                      <th className="p-3">{lang === 'ar' ? 'السعر' : 'Price'}</th>
                      <th className="p-3">{lang === 'ar' ? 'العمليات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 font-bold">
                    {coursesList.map((course) => (
                      <tr key={course.id} className="hover:bg-slate-100/50">
                        <td className="p-3 text-start font-black text-capsule-navy truncate max-w-[160px]">{course.title}</td>
                        <td className="p-3 font-mono">{course.price} SAR</td>
                        <td className="p-3">
                          <button onClick={() => handleDeleteCourse(course.id)} className="px-2.5 py-1 text-[10px] font-black text-white bg-rose-600 hover:bg-rose-700 rounded-lg">
                            {lang === 'ar' ? 'حذف' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'complaints' && (
            <div className="bg-white/90 backdrop-blur-md border border-white rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-capsule-navy border-b pb-3">{lang === 'ar' ? 'صندوق الشكاوى والطلبات الواردة' : 'Complaints Box & Inbound Tickets'}</h3>
              <div className="grid grid-cols-1 gap-4">
                {complaintsList.map((ticket) => (
                  <div key={ticket.id} className="p-4 bg-slate-100/80 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <span className="font-mono text-[10px] font-black bg-slate-200 text-slate-800 px-2 py-0.5 rounded-md">{ticket.id}</span>
                      <h4 className="text-xs font-black text-capsule-navy mt-1.5">{ticket.name} <span className="text-gray-500 font-normal">({ticket.email})</span></h4>
                      <p className="text-xs text-gray-600 font-bold mt-1">{ticket.message}</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-gray-500 self-end sm:self-center">{ticket.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;