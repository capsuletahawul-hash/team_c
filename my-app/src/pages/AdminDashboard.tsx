// src/pages/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getAdminDashboardMetrics,
  getAllUsersForAdmin,
  updateUserRoleInMock,
  toggleUserStatusInMock,
  getCourses,
  getAdminComplaints,
  getAdminGrowthStats
} from '../mocks/mockApi';

// استيراد الـ Hook المشترك والأصلح لويك 2
import { useApi } from '../Hooks/useApi'; // Capital 'H'
// Reusable Components
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingIndicator from '../components/LoadingIndicator';

import { useLanguage } from '../context/LanguageContext';

type ActiveTabType = 'overview' | 'users' | 'courses' | 'complaints';

export interface UserPermission {
  id: string;
  name: string;
  email: string;
  role: 'Student' | 'Trainer' | 'Company' | 'Admin' | string;
  status: 'active' | 'suspended' | string;
  joinedAt?: string;
}

export interface CourseItem {
  id: number;
  title: string;
  instructor: string;
  duration: string;
  students: number;
  status: 'available' | 'coming_soon' | 'pending_deletion' | 'completed' | string;
}

export interface ComplaintItem {
  id: string;
  name: string;
  email: string;
  message: string;
  date: string;
}
export interface GrowthMetric {
  monthAr: string;
  monthEn: string;
  count: number;
}

const AdminDashboard: React.FC = () => {
  const { t, lang } = useLanguage();
  const l = t.admin;

  const [activeTab, setActiveTab] = useState<ActiveTabType>('overview');
  const [message, setMessage] = useState<string>('');
// 🌟 1️⃣ جلب البيانات بالـ Hooks بما فيها الأشهر والنمو
  const { data: statsData, loading: statsLoading } = useApi(async () => {
    const res = await getAdminDashboardMetrics();
    if (res.success) return { success: true, data: res.data };
    const errorMsg = res && 'error' in res && typeof res.error === 'string' ? res.error : "Error loading metrics";
    return { success: false, error: errorMsg };
  });

  const { data: initialUsers, loading: usersLoading } = useApi(async () => {
    const res = await getAllUsersForAdmin();
    if (res.success) return { success: true, data: res.data };
    const errorMsg = res && 'error' in res && typeof res.error === 'string' ? res.error : "Error loading users";
    return { success: false, error: errorMsg };
  });

  const { data: initialCourses, loading: coursesLoading } = useApi(async () => {
    const res = await getCourses();
    if (res.success) return { success: true, data: res.data };
    const errorMsg = res && 'error' in res && typeof res.error === 'string' ? res.error : "Error loading courses";
    return { success: false, error: errorMsg };
  });

  const { data: initialComplaints, loading: complaintsLoading } = useApi(async () => {
    const res = await getAdminComplaints();
    if (res.success) return { success: true, data: res.data };
    const errorMsg = res && 'error' in res && typeof res.error === 'string' ? res.error : "Error loading complaints";
    return { success: false, error: errorMsg };
  });

  // الـ Hook الخاص بأشهر النمو والغراف
  const { data: initialGrowth, loading: growthLoading } = useApi(async () => {
    const res = await getAdminGrowthStats();
    if (res.success) return { success: true, data: res.data };
    const errorMsg = res && 'error' in res && typeof res.error === 'string' ? res.error : "Error loading growth stats";
    return { success: false, error: errorMsg };
  });

  // 🌟 2️⃣ الحالات المحلية لإدارة القوائم
  const [usersList, setUsersList] = useState<UserPermission[]>([]);
  const [coursesList, setCoursesList] = useState<CourseItem[]>([]);
  const [complaintsList, setComplaintsList] = useState<ComplaintItem[]>([]);
  const [growthList, setGrowthList] = useState<GrowthMetric[]>([]); // حالة الأشهر المحلية

  // 🌟 3️⃣ المزامنة فور انتهاء التحميل
  useEffect(() => {
    if (initialUsers) setUsersList(initialUsers as UserPermission[]);
  }, [initialUsers]);

  useEffect(() => {
    if (initialCourses?.courses) setCoursesList(initialCourses.courses as CourseItem[]);
  }, [initialCourses]);

  useEffect(() => {
    if (initialComplaints) {
      const translatedComplaints = (initialComplaints as ComplaintItem[]).map(c => ({
        ...c,
        message: lang === 'ar' 
          ? (c.id === 'TKT-991' ? 'تواجهني مشكلة أثناء تحميل ملفات موديول خطافات ريأكت المتقدمة.' : 'طلب تفعيل واجهة الشركة B2B لم يتم الرد عليه بعرض السعر حتى الآن.')
          : (c.id === 'TKT-991' ? 'I face an issue downloading advanced React hooks modules.' : 'B2B corporate onboarding request has not been answered yet.')
      }));
      setComplaintsList(translatedComplaints);
    }
  }, [initialComplaints, lang]);

  useEffect(() => {
    if (initialGrowth) setGrowthList(initialGrowth as GrowthMetric[]);
  }, [initialGrowth]);

  const handleUpdateCourseStatus = (courseId: number, newStatus: CourseItem['status']) => {
    setCoursesList((prev: CourseItem[]) => prev.map((c: CourseItem) => c.id === courseId ? { ...c, status: newStatus } : c));
    setMessage(lang === 'ar' ? '📝 تم تحديث حالة الدورة بنجاح في النظام.' : '📝 Course operational status updated.');
  };

  const handleRoleChange = (userId: string, newRole: UserPermission['role']) => {
    updateUserRoleInMock(userId, newRole).then(() => {
      setUsersList((prev: UserPermission[]) => prev.map((u: UserPermission) => u.id === userId ? { ...u, role: newRole } : u));
      setMessage(lang === 'ar' ? '⚙️ تم تعديل رتبة وصلاحية حساب المستخدم.' : '⚙️ User system permissions updated.');
    });
  };

  const toggleUserStatus = (userId: string) => {
    toggleUserStatusInMock(userId).then(() => {
      setUsersList((prev: UserPermission[]) => prev.map((u: UserPermission) => u.id === userId ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u));
      setMessage(lang === 'ar' ? '🔒 تم تحديث وضع قفل الحساب الأمني بنجاح.' : '🔒 Security account state toggled.');
    });
  };

  // حارس التحميل الشامل لويك 2
 if (statsLoading || usersLoading || coursesLoading || complaintsLoading || growthLoading) {
    return <div className="min-h-screen bg-capsule-bg flex items-center justify-center"><LoadingIndicator message={l.loading} /></div>;
  }

  const borderSide = t.dir === 'rtl' ? 'border-r-4' : 'border-l-4';

  return (
    <div className="min-h-screen bg-[#C9D6DF] text-capsule-navy font-sans antialiased flex flex-col relative overflow-hidden" dir={t.dir}>
      <div className={`absolute top-24 ${t.dir === 'rtl' ? 'right-12' : 'left-12'} w-80 h-80 bg-capsule-gold/20 rounded-full blur-3xl pointer-events-none z-0 animate-pulse`}></div>
      <Navbar activePage="home" />

      <main className="flex-grow max-w-7xl mx-auto px-6 py-8 w-full grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10">
        <div className="lg:col-span-1 bg-white/30 backdrop-blur-xl border border-white/50 p-4 rounded-3xl shadow-xs space-y-1.5 h-fit sticky top-6">
          <div className="p-3 border-b border-gray-200/40 mb-2">
            <p className="text-[10px] font-black tracking-widest text-capsule-teal uppercase">{lang === 'ar' ? 'لوحة تحكم المشرف' : 'SUPER ADMIN TERMINAL'}</p>
            <h4 className="text-xs font-bold text-capsule-navy mt-0.5">{lang === 'ar' ? 'إدارة الكورسات والمستخدمين' : 'Core Command Board'}</h4>
          </div>
          <button onClick={() => setActiveTab('overview')} className={`w-full text-start p-2.5 rounded-xl text-xs font-bold transition ${activeTab === 'overview' ? 'bg-capsule-navy text-white shadow-xs' : 'text-gray-500 hover:bg-white/60'}`}>📊 {lang === 'ar' ? 'نظرة عامة ومؤشرات النظام' : 'System Overview'}</button>
          <button onClick={() => setActiveTab('users')} className={`w-full text-start p-2.5 rounded-xl text-xs font-bold transition ${activeTab === 'users' ? 'bg-capsule-navy text-white shadow-xs' : 'text-gray-500 hover:bg-white/60'}`}>👥 {lang === 'ar' ? 'إدارة الهويات والصلاحيات' : 'Identity & IAM Control'}</button>
          <button onClick={() => setActiveTab('courses')} className={`w-full text-start p-2.5 rounded-xl text-xs font-bold transition ${activeTab === 'courses' ? 'bg-capsule-navy text-white shadow-xs' : 'text-gray-500 hover:bg-white/60'}`}>⚙️ {lang === 'ar' ? 'إدارة واعتماد الكورسات' : 'Course Pipeline Control'}</button>
          <button onClick={() => setActiveTab('complaints')} className={`w-full text-start p-2.5 rounded-xl text-xs font-bold transition ${activeTab === 'complaints' ? 'bg-capsule-navy text-white shadow-xs' : 'text-gray-500 hover:bg-white/60'}`}>📥 {lang === 'ar' ? 'صندوق الشكاوى والتواصل' : 'Complaints Box'}</button>
          <Link to="/courses-approval" className="block w-full text-start p-2.5 rounded-xl text-xs font-bold transition text-gray-500 hover:bg-white/60">✅ {lang === 'ar' ? 'اعتماد الدورات الفعلية' : 'Live Course Approval'}</Link>

          <Link to="/contracts-approval" className="block w-full text-start p-2.5 rounded-xl text-xs font-bold transition text-gray-500 hover:bg-white/60">📄 {lang === 'ar' ? 'اعتماد طلبات الشركات' : 'Contract Requests Approval'}</Link>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {message && <div className={`p-3.5 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-bold ${borderSide} border-emerald-500 shadow-2xs`}>{message}</div>}

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                  <p className="text-xs font-bold text-gray-400 mb-1">{l.stats.activeUsers}</p>
                  <p className="text-xl font-black text-capsule-navy font-mono">{statsData?.activeUserLoginsToday || 0}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                  <p className="text-xs font-bold text-gray-400 mb-1">{lang === 'ar' ? 'الكورسات الحالية' : 'Total Platform Courses'}</p>
                  <p className="text-xl font-black text-capsule-teal font-mono">{coursesList.length}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                  <p className="text-xs font-bold text-gray-400 mb-1">{lang === 'ar' ? 'المستخدمين النشطين' : 'Total Registered Users'}</p>
                  <p className="text-xl font-black text-capsule-navy font-mono">{usersList.length + 42} {lang === 'ar' ? 'حساب' : 'Users'}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                  <p className="text-xs font-bold text-gray-400 mb-1">{lang === 'ar' ? 'تذاكر شكاوى معلقة' : 'Open Complaints'}</p>
                  <p className="text-xl font-black text-rose-600 font-mono">{complaintsList.length}</p>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs">
                <h3 className="text-xs font-bold text-capsule-navy mb-4 uppercase tracking-wider">{lang === 'ar' ? '📈 المؤشر التزايدي الإجمالي لتفاعل ونمو مستخدمي المنصة' : '📈 Incremental Monthly User Registration Trajectory'}</h3>
                <div className="space-y-3.5">
                 {growthList.map((tItem: GrowthMetric, idx: number) => {
                    const maxScale = 1600;
                    const growthRatio = Math.min((tItem.count / maxScale) * 100, 100);
                    return (
                      <div key={idx} className="bg-gray-50/70 p-3 rounded-xl border border-gray-100/50 flex items-center justify-between gap-4">
                        <span className="text-xs font-bold text-capsule-navy w-24">
                          {lang === 'ar' ? tItem.monthAr : tItem.monthEn}
                        </span>
                        <div className="flex-grow bg-gray-200 h-3 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-capsule-teal to-capsule-navy h-full rounded-full" style={{ width: `${growthRatio}%` }}></div>
                        </div>
                        <span className="text-xs font-black font-mono text-capsule-teal w-24 text-end">{tItem.count} {lang === 'ar' ? 'حساب' : 'Accounts'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs text-center">
                  <thead>
                    <tr className="bg-gray-100/40 text-gray-500 font-bold border-b border-gray-100">
                      <th className="p-3 text-start">ID</th>
                      <th className="p-3">{lang === 'ar' ? 'الاسم الكامل' : 'Name'}</th>
                      <th className="p-3">{lang === 'ar' ? 'الصلاحية (Permission Role)' : 'Role'}</th>
                      <th className="p-3">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                      <th className="p-3">{lang === 'ar' ? 'إجراء الإدارة' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 font-medium text-gray-600">
                    {usersList.map((user: UserPermission) => (
                      <tr key={user.id} className="hover:bg-slate-50/40 transition">
                        <td className="p-3 font-mono font-bold text-blue-600 text-start">{user.id}</td>
                        <td className="p-3 text-capsule-navy font-bold">{user.name}</td>
                        <td className="p-3">
                          <select value={user.role} onChange={(e) => handleRoleChange(user.id, e.target.value)} className="p-1.5 bg-gray-50 border rounded-lg text-[10px] font text-capsule-navy">
                            <option value="Student">Student</option>
                            <option value="Trainer">Trainer</option>
                            <option value="Company">Company</option>
                          </select>
                        </td>
                        <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${user.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{user.status}</span></td>
                        <td className="p-3"><button onClick={() => toggleUserStatus(user.id)} className={`px-2.5 py-1 rounded-md text-[10px] font-black text-white transition ${user.status === 'active' ? 'bg-rose-600' : 'bg-emerald-600'}`}>{user.status === 'active' ? (lang === 'ar' ? 'حظر الحساب' : 'Block') : (lang === 'ar' ? 'تنشيط الحساب' : 'Activate')}</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs text-center">
                  <thead>
                    <tr className="bg-gray-100/40 text-gray-500 font-bold border-b border-gray-100">
                      <th className="p-3 text-start">{lang === 'ar' ? 'عنوان الدورة' : 'Course Title'}</th>
                      <th className="p-3">{lang === 'ar' ? 'الموجّه / المدرب' : 'Instructor'}</th>
                      <th className="p-3">{lang === 'ar' ? 'الحالة الحالية' : 'Current Status'}</th>
                      <th className="p-3">{lang === 'ar' ? 'العمليات الفيدرالية' : 'Operational Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 font-medium text-gray-600">
                    {coursesList.map((course: CourseItem) => (
                      <tr key={course.id} className="hover:bg-slate-50/40 transition">
                        <td className="p-3 text-start font-bold text-capsule-navy truncate max-w-[160px]">{course.title}</td>
                        <td className="p-3 text-gray-500 font-semibold">{course.instructor}</td>
                        <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${course.status === 'available' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{course.status}</span></td>
                        <td className="p-3">
                          <button onClick={() => handleUpdateCourseStatus(course.id, course.status === 'available' ? 'coming_soon' : 'available')} className={`px-2.5 py-1 text-[10px] font-black text-white rounded-md transition ${course.status === 'available' ? 'bg-amber-600' : 'bg-emerald-600'}`}>
                            {course.status === 'available' ? (lang === 'ar' ? 'إيقاف مؤقت' : 'Suspend') : (lang === 'ar' ? 'اعتماد ونشر' : 'Approve')}
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
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-capsule-navy border-b pb-2">📥 {lang === 'ar' ? 'صندوق الشكاوى والطلبات الواردة' : 'Complaints Box & Inbound Tickets'}</h3>
              <div className="grid grid-cols-1 gap-4">
                {complaintsList.map((ticket) => (
                  <div key={ticket.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="font-mono text-[10px] font-black bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md">{ticket.id}</span>
                      <h4 className="text-xs font-bold text-capsule-navy mt-1.5">{ticket.name} <span className="text-gray-400 font-normal">({ticket.email})</span></h4>
                      <p className="text-xs text-gray-500 mt-1">{ticket.message}</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-gray-400 self-end sm:self-center">{ticket.date}</span>
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