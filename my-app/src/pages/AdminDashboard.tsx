import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingIndicator from '../components/LoadingIndicator';
import { AdminOverview, AdminOrdersTab, AdminUsersTab, CourseModal } from '../components/AdminComponents';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import ContractsApproval from './ContractsApproval';
import CoursesApproval from './CoursesApproval';

export type ActiveTabType = 'overview' | 'users' | 'courses' | 'orders' | 'enrollments' | 'complaints' | 'contracts-approval' | 'courses-approval';
export interface UserPermission { id: string; name: string; email: string; role: string; status: string; _count?: { enrollments: number }; }
export interface CourseItem { id: string; title: string; description?: string; category?: string; level?: string; price: number; durationWeeks?: number; maxStudents?: number; trainerId?: string; status: string; }
export interface ComplaintItem { id: string; name: string; email: string; message: string; date: string; }
export interface GrowthMetric { monthAr: string; monthEn: string; count: number; }
export interface AdminStats { totalUsers: number; totalRevenue: number; activeEnrollments: number; }
export interface NotificationItem { id: string; textAr: string; textEn: string; }

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
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [enrollmentsList, setEnrollmentsList] = useState<any[]>([]);
  const [complaintsList, setComplaintsList] = useState<ComplaintItem[]>([]);
  const [growthList, setGrowthList] = useState<GrowthMetric[]>([]);
  const [notificationsList, setNotificationsList] = useState<NotificationItem[]>([]);
  const [showCourseModal, setShowCourseModal] = useState<boolean>(false);
  const [editCourseId, setEditCourseId] = useState<string | null>(null);
  const [courseForm, setCourseForm] = useState({ title: '', description: '', category: 'Software Engineering', level: 'beginner', price: '', durationWeeks: '', maxStudents: '', trainerId: '' });

  const API_BASE = 'http://localhost:5000/api';
  const isRtl = lang === 'ar';
  const getToken = () => {
    const raw = localStorage.getItem('auth_user') || localStorage.getItem('user');
    const parsed = raw ? JSON.parse(raw) : null;
    return token || parsed?.token || localStorage.getItem('user_token') || localStorage.getItem('token') || '';
  };

  const fetchAdminData = async () => {
    setLoading(true);
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` };
    const statsPromise = fetch(`${API_BASE}/admin/stats`, { headers }).then(async r => {
      if (r.ok) { const j = await r.json(); setStatsData(j.data || j); }
      setLoading(false);
    }).catch(() => setLoading(false));

    const [, usersRes, coursesRes, ordersRes, enrollmentsRes] = await Promise.allSettled([
      statsPromise,
      fetch(`${API_BASE}/admin/users`, { headers }),
      fetch(`${API_BASE}/admin/courses/crud`, { headers }),
      fetch(`${API_BASE}/admin/orders`, { headers }),
      fetch(`${API_BASE}/admin/enrollments`, { headers }),
    ]);
    if (usersRes.status === 'fulfilled' && (usersRes.value as Response).ok) {
      const u = await (usersRes.value as Response).json().then((j: any) => Array.isArray(j) ? j : (j.data?.users || j.data || j.users || []));
      setUsersList(u.map((x: any) => ({ id: x.id || '', name: x.name || 'User', email: x.email || '', role: x.role || 'STUDENT', status: x.status || 'active', _count: x._count || { enrollments: 0 } })));
      setNotificationsList([{ id: '1', textAr: `تم جلب ${u.length} مستخدم من قاعدة البيانات`, textEn: `Loaded ${u.length} users` }, { id: '2', textAr: 'النظام متصل وقاعدة البيانات تعمل بنجاح', textEn: 'Database connected successfully' }]);
    }
    if (coursesRes.status === 'fulfilled' && (coursesRes.value as Response).ok) {
      const c = await (coursesRes.value as Response).json().then((j: any) => Array.isArray(j) ? j : (j.data?.courses || j.data || j.courses || []));
      setCoursesList(c.map((x: any, i: number) => ({ ...x, status: x.status || 'coming_soon', category: x.category || (i % 2 === 0 ? (isRtl ? 'الأمن السيبراني' : 'Cybersecurity') : (isRtl ? 'هندسة البرمجيات' : 'Software Engineering')) })));
    }
    if (ordersRes.status === 'fulfilled' && (ordersRes.value as Response).ok) setOrdersList(await (ordersRes.value as Response).json().then((j: any) => j.data?.orders || j.data || j.orders || []));
    if (enrollmentsRes.status === 'fulfilled' && (enrollmentsRes.value as Response).ok) setEnrollmentsList(await (enrollmentsRes.value as Response).json().then((j: any) => j.data?.enrollments || j.data || j.enrollments || []));
    setComplaintsList([
      { id: 'TKT-991', name: 'سارة العبدالله', email: 'sara@example.com', message: isRtl ? 'تواجهني مشكلة أثناء تحميل الملفات.' : 'I face an issue downloading files.', date: '2026-08-14' },
      { id: 'TKT-992', name: 'خالد المنصور', email: 'khalid@example.com', message: isRtl ? 'طلب تفعيل واجهة الشركة B2B قيد الانتظار.' : 'B2B onboarding request is pending.', date: '2026-08-15' }
    ]);
    setGrowthList([{ monthAr: 'مايو', monthEn: 'May', count: 420 }, { monthAr: 'يونيو', monthEn: 'June', count: 850 }, { monthAr: 'يوليو', monthEn: 'July', count: 1240 }, { monthAr: 'أغسطس', monthEn: 'August', count: 1580 }]);
  };

  useEffect(() => { fetchAdminData(); }, [lang]);

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editCourseId ? `${API_BASE}/admin/courses/${editCourseId}` : `${API_BASE}/admin/courses`;
    try {
      const res = await fetch(url, { method: editCourseId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` }, body: JSON.stringify(courseForm) });
      if (res.ok) {
        setMessage(editCourseId ? (isRtl ? 'تم تعديل الدورة بنجاح.' : 'Course updated.') : (isRtl ? 'تم إضافة الدورة بنجاح.' : 'Course created.'));
        setShowCourseModal(false); setEditCourseId(null); fetchAdminData();
      } else alert(await res.json().then(j => j.error || 'Failed to save course'));
    } catch (err) { console.error(err); }
  };

  const handleEditCourseClick = (c: any) => {
    setEditCourseId(c.id);
    setCourseForm({ title: c.title || '', description: c.description || '', category: c.category || 'Software Engineering', level: c.level || 'beginner', price: String(c.price || ''), durationWeeks: String(c.durationWeeks || ''), maxStudents: String(c.maxStudents || ''), trainerId: c.trainerId || '' });
    setShowCourseModal(true);
  };

  const handleMarkOrderStatus = async (orderId: string, status: 'PAID' | 'FAILED') => {
    const label = status === 'PAID' ? (isRtl ? 'مدفوع' : 'PAID') : (isRtl ? 'فاشل' : 'FAILED');
    if (!window.confirm(isRtl ? `تعيين حالة الطلب إلى ${label}؟` : `Mark this order as ${label}?`)) return;
    try {
      const res = await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrdersList((prev: any[]) => prev.map((o: any) => o.id === orderId ? { ...o, status } : o));
        setStatsData(prev => {
          const updatedOrders = ordersList.map((o: any) => o.id === orderId ? { ...o, status } : o);
          const newRevenue = updatedOrders.filter((o: any) => o.status === 'PAID').reduce((s: number, o: any) => s + (o.amount || 0), 0);
          return { ...prev, totalRevenue: newRevenue };
        });
        setMessage(isRtl ? `تم تحديث حالة الطلب إلى ${label} بنجاح.` : `Order marked as ${label} successfully.`);
      } else {
        alert(await res.json().then((j: any) => j.error || 'Failed'));
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!window.confirm(isRtl ? 'هل أنت متأكد من حذف هذه الدورة نهائياً؟' : 'Delete course permanently?')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/courses/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } });
      if (res.ok) { setMessage(isRtl ? 'تم حذف الدورة بنجاح.' : 'Course deleted.'); setCoursesList(p => p.filter(c => c.id !== id)); }
      else alert(await res.json().then(j => j.error || 'Failed to delete'));
    } catch (err) { console.error(err); }
  };

  const handleToggleCourse = async (id: string, current: string) => {
    const act = current === 'archived' ? (isRtl ? 'تفعيل' : 'activate') : (isRtl ? 'إيقاف' : 'archive');
    if (!window.confirm(isRtl ? `هل أنت متأكد من ${act} الدورة؟` : `Are you sure to ${act} this course?`)) return;
    try {
      const res = await fetch(`${API_BASE}/admin/courses/${id}/toggle-status`, { method: 'PATCH', headers: { Authorization: `Bearer ${getToken()}` } });
      if (res.ok) {
        const next = await res.json().then(j => j.data?.status || (current === 'archived' ? 'published' : 'archived'));
        setCoursesList(p => p.map(c => c.id === id ? { ...c, status: next } : c));
        setMessage(next === 'archived' ? (isRtl ? 'تم إيقاف الدورة بنجاح.' : 'Course archived.') : (isRtl ? 'تم تفعيل الدورة بنجاح.' : 'Course published.'));
      }
    } catch (err) { console.error(err); }
  };

  const handleRoleChange = async (uid: string, role: string) => {
    try {
      const res = await fetch(`${API_BASE}/admin/users/${uid}/role`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` }, body: JSON.stringify({ role }) });
      if (res.ok) { setUsersList(p => p.map(u => u.id === uid ? { ...u, role } : u)); setMessage(isRtl ? 'تم تعديل رتبة وصلاحية حساب المستخدم.' : 'User permissions updated.'); }
      else alert('Failed to update role');
    } catch (err) { console.error(err); }
  };

  const toggleUserStatus = async (uid: string) => {
    try {
      const res = await fetch(`${API_BASE}/admin/users/${uid}/toggle-status`, { method: 'PATCH', headers: { Authorization: `Bearer ${getToken()}` } });
      if (res.ok) {
        const next = await res.json().then(j => j.data?.status || 'active');
        setUsersList(p => p.map(u => u.id === uid ? { ...u, status: next } : u));
        setMessage(isRtl ? 'تم تحديث وضع قفل الحساب الأمني بنجاح.' : 'User status toggled.');
      } else alert('Failed to toggle status');
    } catch (err) { console.error(err); }
  };

  const categoryCounts = coursesList.reduce<Record<string, number>>((a, c) => { const cat = c.category || (isRtl ? 'أخرى' : 'Other'); a[cat] = (a[cat] || 0) + 1; return a; }, {});
  const trainersList = usersList.filter(u => u.role.toUpperCase() === 'TRAINER');

  if (loading) return <LoadingIndicator variant="dashboard" />;

  return (
    <div className="min-h-screen bg-[#C9D6DF] text-capsule-navy font-sans antialiased flex flex-col relative overflow-hidden" dir={t.dir}>
      <div className="relative z-40 bg-white/70 backdrop-blur-md border-b border-white/80 shadow-xs">
        <Navbar activePage="home" />
        <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center justify-between">
          <span className="text-[10px] font-black tracking-widest text-capsule-teal uppercase bg-capsule-teal/10 px-3 py-1 rounded-full border border-capsule-teal/20">{isRtl ? 'لوحة تحكم المشرف الرئيسي' : 'SUPER ADMIN PANEL'}</span>
          <div className="relative">
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 bg-white/90 rounded-xl border border-white shadow-2xs hover:bg-white transition flex items-center gap-2 text-xs font-bold cursor-pointer">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              <span>{isRtl ? 'الإشعارات' : 'Notifications'}</span>
              <span className="bg-rose-500 text-white text-[10px] font-black font-mono px-1.5 py-0.2 rounded-full">{notificationsList.length}</span>
            </button>
            {showNotifications && (
              <div className={`absolute mt-2 w-72 bg-white/95 backdrop-blur-xl rounded-2xl border border-white shadow-xl p-3 space-y-2 text-xs text-start z-50 ${t.dir === 'rtl' ? 'left-0' : 'right-0'}`}>
                <p className="font-black text-capsule-navy border-b pb-1.5">{isRtl ? 'التنبيهات الواردة' : 'Inbound Tickets'}</p>
                {notificationsList.map(n => (
                  <div key={n.id} className="p-2.5 bg-slate-50 rounded-xl text-gray-700 border border-slate-200/60 flex gap-2 text-[11px] font-bold">
                    <svg className="w-4 h-4 text-capsule-teal shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>{isRtl ? n.textAr : n.textEn}</span>
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
            <p className="text-[10px] font-black text-capsule-teal uppercase tracking-widest">{isRtl ? 'لوحة تحكم المشرف' : 'CONTROL CENTER'}</p>
            <h4 className="text-xs font-black text-capsule-navy mt-0.5">{isRtl ? 'إدارة المنظومة' : 'Management Hub'}</h4>
          </div>
          {([
            { id: 'overview', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', labelAr: 'نظرة عامة ومؤشرات النظام', labelEn: 'System Overview' },
            { id: 'users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', labelAr: 'إدارة الهويات والصلاحيات', labelEn: 'Identity & IAM Control' },
            { id: 'courses', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', labelAr: 'إدارة الكورسات (CRUD)', labelEn: 'Courses Manager (CRUD)' },
            { id: 'orders', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', labelAr: 'إدارة الطلبات والمبيعات', labelEn: 'Orders UI & Ledger' },
            { id: 'enrollments', icon: 'M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z', labelAr: 'إدارة تراخيص الاشتراكات', labelEn: 'Enrollments Access UI' },
            { id: 'complaints', icon: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4', labelAr: 'صندوق الشكاوى والتواصل', labelEn: 'Complaints Box' }
          ] as const).map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full text-start p-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${activeTab === tab.id ? 'bg-capsule-navy text-white shadow-xs' : 'text-gray-600 hover:bg-slate-100/80'}`}>
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} /></svg>
              <span>{isRtl ? tab.labelAr : tab.labelEn}</span>
            </button>
          ))}
          <div className="pt-2 border-t border-slate-200/80 space-y-1 mt-2">
            <button onClick={() => setActiveTab('contracts-approval')} className={`w-full text-start p-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${activeTab === 'contracts-approval' ? 'bg-capsule-navy text-white shadow-xs' : 'text-gray-600 hover:bg-slate-100/80'}`}>
              <svg className="w-4 h-4 text-capsule-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4m-4 0a2 2 0 100 4m0-4a2 2 0 100-4" /></svg>
              <span>{isRtl ? 'اعتماد عقود الشركات (B2B)' : 'Corporate Approvals'}</span>
            </button>
            <button onClick={() => setActiveTab('courses-approval')} className={`w-full text-start p-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${activeTab === 'courses-approval' ? 'bg-capsule-navy text-white shadow-xs' : 'text-gray-600 hover:bg-slate-100/80'}`}>
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{isRtl ? 'اعتماد الدورات الفعلية' : 'Live Course Approval'}</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {message && <div className={`p-3.5 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-bold ${t.dir === 'rtl' ? 'border-r-4' : 'border-l-4'} border-emerald-500 shadow-2xs`}>{message}</div>}

          {activeTab === 'overview' && (
            <AdminOverview
              isRtl={isRtl}
              statsData={statsData}
              coursesCount={coursesList.length}
              categoryCounts={categoryCounts}
              growthList={growthList}
            />
          )}

          {activeTab === 'users' && (
            <AdminUsersTab
              isRtl={isRtl}
              usersList={usersList}
              onRoleChange={handleRoleChange}
              onToggleUserStatus={toggleUserStatus}
            />
          )}

          {activeTab === 'courses' && (
            <div className="bg-white/90 border border-white rounded-3xl shadow-sm overflow-hidden p-6">
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h3 className="text-sm font-black text-capsule-navy">{isRtl ? 'إدارة واعتماد الدورات التدريبية' : 'Course Approval Terminal'}</h3>
                <button onClick={() => { setEditCourseId(null); setCourseForm({ title: '', description: '', category: 'Software Engineering', level: 'beginner', price: '', durationWeeks: '', maxStudents: '', trainerId: '' }); setShowCourseModal(true); }} className="px-3.5 py-1.5 bg-capsule-teal hover:bg-teal-700 text-white rounded-xl text-xs font-black shadow-2xs transition flex items-center gap-1 cursor-pointer">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                  <span>{isRtl ? 'إضافة دورة جديدة' : 'Add New Course'}</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-center border-collapse">
                  <thead>
                    <tr className="bg-slate-200/80 text-capsule-navy font-black border-b border-slate-300">
                      {[isRtl ? 'عنوان الدورة' : 'Course Title', isRtl ? 'السعر' : 'Price', isRtl ? 'الحالة' : 'Status', isRtl ? 'التحكم' : 'Action'].map(h => <th className="p-3" key={h}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 font-bold">
                    {coursesList.length === 0 ? (
                      <tr><td colSpan={4} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                          <p className="text-xs font-black text-gray-400">{isRtl ? 'لا توجد دورات بعد، أضف دورة جديدة' : 'No courses yet — add one above'}</p>
                        </div>
                      </td></tr>
                    ) : coursesList.map(course => (
                      <tr key={course.id} className="hover:bg-slate-100/50">
                        <td className="p-3 text-start font-black text-capsule-navy truncate max-w-[160px]">{course.title}</td>
                        <td className="p-3 font-mono">{course.price} SAR</td>
                        <td className="p-3"><span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${course.status === 'archived' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>{course.status === 'archived' ? (isRtl ? 'موقوف' : 'Archived') : (isRtl ? 'نشط' : 'Published')}</span></td>
                        <td className="p-3 flex items-center justify-center gap-2">
                          <button onClick={() => handleToggleCourse(course.id, course.status)} className={`px-2.5 py-1 text-[10px] font-black text-white rounded-lg transition shadow-2xs cursor-pointer ${course.status === 'archived' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700'}`}>{course.status === 'archived' ? (isRtl ? 'تفعيل' : 'Publish') : (isRtl ? 'إيقاف' : 'Archive')}</button>
                          <button onClick={() => handleEditCourseClick(course)} className="px-2.5 py-1 text-[10px] font-black text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer transition shadow-2xs">{isRtl ? 'تعديل' : 'Edit'}</button>
                          <button onClick={() => handleDeleteCourse(course.id)} className="px-2.5 py-1 text-[10px] font-black text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer transition shadow-2xs">{isRtl ? 'حذف' : 'Delete'}</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <AdminOrdersTab
              isRtl={isRtl}
              ordersList={ordersList}
              onMarkOrderStatus={handleMarkOrderStatus}
            />
          )}

          {activeTab === 'enrollments' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: isRtl ? 'إجمالي الاشتراكات' : 'Total Enrollments', value: enrollmentsList.length, color: 'text-capsule-navy' },
                  { label: isRtl ? 'اشتراكات نشطة' : 'Active Access', value: enrollmentsList.filter((e: any) => new Date(e.accessEndsAt) >= new Date()).length, color: 'text-emerald-600' },
                  { label: isRtl ? 'اشتراكات منتهية' : 'Expired Access', value: enrollmentsList.filter((e: any) => new Date(e.accessEndsAt) < new Date()).length, color: 'text-rose-600' },
                ].map((s, i) => (
                  <div key={i} className="bg-white/90 border border-white p-4 rounded-2xl shadow-sm text-start">
                    <p className="text-[10px] font-black text-gray-500 uppercase mb-1">{s.label}</p>
                    <p className={`text-lg font-black font-mono ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white/90 border border-white rounded-3xl shadow-sm overflow-hidden p-6">
                <h3 className="text-sm font-black text-capsule-navy border-b pb-3 mb-4 text-start">{isRtl ? 'سجل اشتراكات الطلاب بالمسارات' : 'Student Course Access Control'}</h3>
                {enrollmentsList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                    <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>
                    <p className="text-sm font-black text-gray-400">{isRtl ? 'لا توجد اشتراكات مسجلة بعد' : 'No enrollments found yet'}</p>
                    <p className="text-xs text-gray-400 font-bold">{isRtl ? 'ستظهر هنا بيانات الطلاب المسجلين في الدورات' : 'Student course enrollments will appear here'}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-center border-collapse">
                      <thead>
                        <tr className="bg-slate-200/80 text-capsule-navy font-black border-b border-slate-300">
                          {[isRtl ? 'الطالب' : 'Student', isRtl ? 'المسار التدريبي' : 'Course Pathway', isRtl ? 'بداية الصلاحية' : 'Access Start', isRtl ? 'نهاية الصلاحية' : 'Access End', isRtl ? 'الوضعية الأمنية' : 'Status'].map(h => <th className="p-3" key={h}>{h}</th>)}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/60 font-bold">
                        {enrollmentsList.map((enrollment: any) => {
                          const active = new Date(enrollment.accessEndsAt) >= new Date();
                          return (
                            <tr key={enrollment.id} className="hover:bg-slate-100/50">
                              <td className="p-3 text-start"><p className="text-capsule-navy font-black">{enrollment.user?.name || 'Student'}</p><p className="text-[10px] text-gray-500 font-normal font-mono">{enrollment.user?.email || ''}</p></td>
                              <td className="p-3 text-capsule-navy font-black text-start max-w-[150px] truncate">{enrollment.course?.title || 'Unknown Course'}</td>
                              <td className="p-3 font-mono text-gray-500">{new Date(enrollment.accessStartsAt).toLocaleDateString()}</td>
                              <td className="p-3 font-mono text-gray-500">{new Date(enrollment.accessEndsAt).toLocaleDateString()}</td>
                              <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>{active ? (isRtl ? 'نشط' : 'Active') : (isRtl ? 'منتهي' : 'Expired')}</span></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'complaints' && (
            <div className="bg-white/90 border border-white rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-capsule-navy border-b pb-3 text-start">{isRtl ? 'صندوق الشكاوى والطلبات الواردة' : 'Complaints Box & Inbound Tickets'}</h3>
              <div className="grid grid-cols-1 gap-4">
                {complaintsList.map(ticket => (
                  <div key={ticket.id} className="p-4 bg-slate-100/80 border border-slate-200/80 flex flex-col sm:flex-row justify-between gap-4 text-start">
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

          {activeTab === 'contracts-approval' && <ContractsApproval isEmbedded={true} />}
          {activeTab === 'courses-approval' && <CoursesApproval isEmbedded={true} />}
        </div>
      </main>

      <CourseModal
        show={showCourseModal}
        editCourseId={editCourseId}
        isRtl={isRtl}
        courseForm={courseForm}
        trainersList={trainersList}
        onClose={() => setShowCourseModal(false)}
        onFormChange={setCourseForm}
        onSave={handleSaveCourse}
      />
      <Footer />
    </div>
  );
};

export default AdminDashboard;