import React from 'react';
import { UserPermission } from '../pages/AdminDashboard';

// ============================================================================
// 1. COURSE MODAL COMPONENT
// ============================================================================
export interface CourseModalProps {
  show: boolean;
  editCourseId: string | null;
  isRtl: boolean;
  courseForm: {
    title: string;
    description: string;
    category: string;
    level: string;
    price: string;
    durationWeeks: string;
    maxStudents: string;
    trainerId: string;
  };
  trainersList: UserPermission[];
  onClose: () => void;
  onFormChange: (form: any) => void;
  onSave: (e: React.FormEvent) => void;
}

export const CourseModal: React.FC<CourseModalProps> = ({
  show,
  editCourseId,
  isRtl,
  courseForm,
  trainersList,
  onClose,
  onFormChange,
  onSave,
}) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 border border-white p-6 rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4 text-start">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-sm font-black text-capsule-navy">
            {editCourseId ? (isRtl ? 'تعديل بيانات الدورة التدريبية' : 'Edit Course') : (isRtl ? 'إضافة دورة تدريبية جديدة' : 'Add New Course')}
          </h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={onSave} className="space-y-3.5 text-xs font-bold text-gray-700">
          <div>
            <label className="block text-gray-500 mb-1">{isRtl ? 'عنوان الدورة' : 'Course Title'}</label>
            <input type="text" name="title" value={courseForm.title} onChange={(e) => onFormChange({ ...courseForm, title: e.target.value })} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-capsule-navy font-bold" />
          </div>
          <div>
            <label className="block text-gray-500 mb-1">{isRtl ? 'وصف الدورة' : 'Course Description'}</label>
            <textarea name="description" value={courseForm.description} onChange={(e) => onFormChange({ ...courseForm, description: e.target.value })} required rows={3} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-capsule-navy font-bold" />
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-gray-500 mb-1">{isRtl ? 'التصنيف' : 'Category'}</label>
              <select name="category" value={courseForm.category} onChange={(e) => onFormChange({ ...courseForm, category: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-capsule-navy font-bold">
                {[{ val: 'Software Engineering', label: isRtl ? 'هندسة البرمجيات' : 'Software Engineering' }, { val: 'Cybersecurity', label: isRtl ? 'الأمن السيبراني' : 'Cybersecurity' }].map((o) => (
                  <option key={o.val} value={o.val}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-500 mb-1">{isRtl ? 'مستوى الصعوبة' : 'Difficulty Level'}</label>
              <select name="level" value={courseForm.level} onChange={(e) => onFormChange({ ...courseForm, level: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-capsule-navy font-bold">
                {[{ val: 'beginner', label: isRtl ? 'مبتدئ' : 'Beginner' }, { val: 'intermediate', label: isRtl ? 'متوسط' : 'Intermediate' }, { val: 'advanced', label: isRtl ? 'متقدم' : 'Advanced' }].map((o) => (
                  <option key={o.val} value={o.val}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3.5">
            <div>
              <label className="block text-gray-500 mb-1">{isRtl ? 'السعر (SAR)' : 'Price'}</label>
              <input type="number" name="price" value={courseForm.price} onChange={(e) => onFormChange({ ...courseForm, price: e.target.value })} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-capsule-navy font-bold font-mono" />
            </div>
            <div>
              <label className="block text-gray-500 mb-1">{isRtl ? 'المدة (أسابيع)' : 'Duration (Weeks)'}</label>
              <input type="number" name="durationWeeks" value={courseForm.durationWeeks} onChange={(e) => onFormChange({ ...courseForm, durationWeeks: e.target.value })} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-capsule-navy font-bold font-mono" />
            </div>
            <div>
              <label className="block text-gray-500 mb-1">{isRtl ? 'الأقصى للطلاب' : 'Max Students'}</label>
              <input type="number" name="maxStudents" value={courseForm.maxStudents} onChange={(e) => onFormChange({ ...courseForm, maxStudents: e.target.value })} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-capsule-navy font-bold font-mono" />
            </div>
          </div>
          <div>
            <label className="block text-gray-500 mb-1">{isRtl ? 'المدرب المسؤول' : 'Assigned Instructor'}</label>
            <select name="trainerId" value={courseForm.trainerId} onChange={(e) => onFormChange({ ...courseForm, trainerId: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-capsule-navy font-bold">
              <option value="">{isRtl ? 'اختر مدرباً...' : 'Select instructor...'}</option>
              {trainersList.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-3 border-t justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-gray-600 rounded-xl font-black cursor-pointer">{isRtl ? 'إلغاء' : 'Cancel'}</button>
            <button type="submit" className="px-5 py-2 bg-capsule-navy hover:bg-slate-800 text-white rounded-xl font-black cursor-pointer">{isRtl ? 'حفظ البيانات' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// 2. ADMIN OVERVIEW COMPONENT
// ============================================================================
export interface AdminOverviewProps {
  isRtl: boolean;
  statsData: { totalUsers: number; totalRevenue: number; activeEnrollments: number };
  coursesCount: number;
  categoryCounts: Record<string, number>;
  growthList: { monthAr: string; monthEn: string; count: number }[];
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  isRtl,
  statsData,
  coursesCount,
  categoryCounts,
  growthList,
}) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-start">
      {[
        { title: isRtl ? 'إجمالي المستخدمين' : 'Total Users', value: statsData.totalUsers, color: 'text-capsule-navy' },
        { title: isRtl ? 'الكورسات الحالية' : 'Total Platform Courses', value: coursesCount, color: 'text-capsule-teal' },
        { title: isRtl ? 'الاشتراكات النشطة' : 'Active Enrollments', value: statsData.activeEnrollments, color: 'text-capsule-navy' },
        { title: isRtl ? 'إجمالي الأرباح' : 'Total Revenue', value: `${statsData.totalRevenue} SAR`, color: 'text-emerald-600' },
      ].map((c, i) => (
        <div key={i} className="bg-white/90 border border-white p-5 rounded-3xl shadow-sm">
          <p className="text-xs font-black text-gray-500 mb-1">{c.title}</p>
          <p className={`text-xl font-black font-mono ${c.color}`}>{c.value}</p>
        </div>
      ))}
    </div>
    <div className="bg-white/90 border border-white rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-around gap-8">
      <div className="relative w-36 h-36 rounded-full flex items-center justify-center p-3 shadow-md" style={{ background: 'conic-gradient(#0f172a 0% 50%, #0d9488 50% 100%)' }}>
        <div className="w-24 h-24 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
          <span className="text-xl font-black font-mono text-capsule-navy">{coursesCount}</span>
          <span className="text-[9px] font-bold text-gray-400 uppercase">{isRtl ? 'إجمالي الكورسات' : 'Total Courses'}</span>
        </div>
      </div>
      <div className="space-y-2">
        {Object.entries(categoryCounts).map(([cat, count], idx) => (
          <div key={cat} className="flex items-center gap-4 p-2 bg-slate-100/80 rounded-xl border border-slate-200/60 min-w-[200px] justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-3.5 h-3.5 rounded-full ${idx === 0 ? 'bg-capsule-navy' : 'bg-capsule-teal'}`}></span>
              <span className="text-xs font-black text-capsule-navy">{cat}</span>
            </div>
            <span className="text-xs font-black font-mono bg-white px-2 py-0.5 rounded-lg border border-slate-200/60 shadow-2xs">{count}</span>
          </div>
        ))}
      </div>
    </div>
    <div className="bg-white/90 border border-white rounded-3xl p-6 shadow-sm">
      <h3 className="text-xs font-black text-capsule-navy uppercase mb-4 text-start">{isRtl ? 'المؤشر التزايدي لنمو مستخدمي المنصة' : 'User Registration Trajectory'}</h3>
      <div className="space-y-3">
        {growthList.map((tItem, idx) => (
          <div key={idx} className="bg-slate-100/80 p-2.5 rounded-xl border border-slate-200/60 flex items-center justify-between gap-4">
            <span className="text-xs font-black text-capsule-navy w-16 text-start">{isRtl ? tItem.monthAr : tItem.monthEn}</span>
            <div className="flex-grow bg-slate-200 h-2.5 rounded-full overflow-hidden p-0.5">
              <div className="bg-gradient-to-r from-capsule-teal to-capsule-navy h-full rounded-full" style={{ width: `${Math.min((tItem.count / 1600) * 100, 100)}%` }}></div>
            </div>
            <span className="text-xs font-black font-mono text-capsule-teal w-20 text-end">{tItem.count}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ============================================================================
// 3. ADMIN ORDERS TAB COMPONENT
// ============================================================================
export interface AdminOrdersTabProps {
  isRtl: boolean;
  ordersList: any[];
  onMarkOrderStatus: (orderId: string, status: 'PAID' | 'FAILED') => void;
}

export const AdminOrdersTab: React.FC<AdminOrdersTabProps> = ({ isRtl, ordersList, onMarkOrderStatus }) => {
  const paidOrders = ordersList.filter((o: any) => o.status === 'PAID');
  const totalRevenue = paidOrders.reduce((s: number, o: any) => s + (o.amount || 0), 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: isRtl ? 'إجمالي الطلبات' : 'Total Orders', value: ordersList.length, color: 'text-capsule-navy' },
          { label: isRtl ? 'طلبات مدفوعة' : 'Paid Orders', value: paidOrders.length, color: 'text-emerald-600' },
          { label: isRtl ? 'إجمالي الإيرادات' : 'Total Revenue', value: `${totalRevenue} SAR`, color: 'text-capsule-teal' },
        ].map((s, i) => (
          <div key={i} className="bg-white/90 border border-white p-4 rounded-2xl shadow-sm text-start">
            <p className="text-[10px] font-black text-gray-500 uppercase mb-1">{s.label}</p>
            <p className={`text-lg font-black font-mono ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white/90 border border-white rounded-3xl shadow-sm overflow-hidden p-6">
        <h3 className="text-sm font-black text-capsule-navy border-b pb-3 mb-4 text-start">{isRtl ? 'سجل العمليات والطلبات' : 'Billing & Orders Ledger'}</h3>
        {ordersList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            <p className="text-sm font-black text-gray-400">{isRtl ? 'لا توجد طلبات شراء بعد' : 'No orders found yet'}</p>
            <p className="text-xs text-gray-400 font-bold">{isRtl ? 'ستظهر هنا عمليات الشراء بمجرد اكتمالها' : 'Completed purchases will appear here'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr className="bg-slate-200/80 text-capsule-navy font-black border-b border-slate-300">
                  {['Order ID', isRtl ? 'المستخدم' : 'User', isRtl ? 'الكورس' : 'Course', isRtl ? 'المبلغ' : 'Amount', isRtl ? 'الحالة' : 'Status', isRtl ? 'التاريخ' : 'Date', isRtl ? 'إجراء' : 'Action'].map((h) => <th className="p-3" key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 font-bold">
                {ordersList.map((order: any) => (
                  <tr key={order.id} className="hover:bg-slate-100/50">
                    <td className="p-3 font-mono text-blue-600 text-start">{String(order.id).slice(0, 8)}...</td>
                    <td className="p-3 text-start"><p className="text-capsule-navy font-black">{order.user?.name || 'Guest'}</p><p className="text-[10px] text-gray-500 font-normal font-mono">{order.user?.email || ''}</p></td>
                    <td className="p-3 text-capsule-navy font-black text-start max-w-[150px] truncate">{order.course?.title || 'Unknown Course'}</td>
                    <td className="p-3 font-mono text-emerald-600">{order.amount} SAR</td>
                    <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${order.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : order.status === 'FAILED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>{order.status}</span></td>
                    <td className="p-3 font-mono text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="p-3">{order.status !== 'PAID' && (<button onClick={() => onMarkOrderStatus(order.id, 'PAID')} className="px-2 py-1 text-[10px] font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer transition">{isRtl ? 'تعيين PAID' : 'Mark PAID'}</button>)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 4. ADMIN USERS TAB COMPONENT
// ============================================================================
export interface AdminUsersTabProps {
  isRtl: boolean;
  usersList: UserPermission[];
  onRoleChange: (uid: string, role: string) => void;
  onToggleUserStatus: (uid: string) => void;
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({ isRtl, usersList, onRoleChange, onToggleUserStatus }) => (
  <div className="bg-white/90 border border-white rounded-3xl shadow-sm overflow-hidden p-6">
    <h3 className="text-sm font-black text-capsule-navy border-b pb-3 mb-4 text-start">{isRtl ? 'إدارة الهويات وحسابات النظام' : 'User Identity Control'}</h3>
    <div className="overflow-x-auto">
      <table className="w-full text-xs text-center border-collapse">
        <thead>
          <tr className="bg-slate-200/80 text-capsule-navy font-black border-b border-slate-300">
            {['ID', isRtl ? 'الاسم' : 'Name', isRtl ? 'البريد الإلكتروني' : 'Email', isRtl ? 'الصلاحية' : 'Role', isRtl ? 'الاشتراكات' : 'Enrollments', isRtl ? 'الحالة' : 'Status', isRtl ? 'الإجراء' : 'Action'].map((h) => <th className="p-3" key={h}>{h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200/60 font-bold">
          {usersList.map((user) => (
            <tr key={user.id} className="hover:bg-slate-100/50">
              <td className="p-3 font-mono text-blue-600 text-start">{user.id.slice(0, 8)}...</td>
              <td className="p-3 text-capsule-navy font-black">{user.name}</td>
              <td className="p-3 font-mono text-gray-500">{user.email}</td>
              <td className="p-3">
                <select value={user.role} onChange={(e) => onRoleChange(user.id, e.target.value)} className="p-1 bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold outline-none text-capsule-navy cursor-pointer">
                  <option value="STUDENT">STUDENT</option>
                  <option value="TRAINER">TRAINER</option>
                  <option value="COMPANY">COMPANY</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </td>
              <td className="p-3 font-mono text-capsule-teal">{user._count?.enrollments || 0}</td>
              <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${user.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>{user.status === 'active' ? (isRtl ? 'نشط' : 'Active') : (isRtl ? 'موقوف' : 'Suspended')}</span></td>
              <td className="p-3"><button onClick={() => onToggleUserStatus(user.id)} className={`px-2.5 py-1 rounded-lg text-[10px] font-black text-white cursor-pointer transition ${user.status === 'active' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>{user.status === 'active' ? (isRtl ? 'حظر' : 'Block') : (isRtl ? 'تنشيط' : 'Activate')}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
