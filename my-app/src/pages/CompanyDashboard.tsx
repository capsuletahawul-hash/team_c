import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
// API base URL — single source of truth, plus the real current-user fetch
import { BASE_URL, getCurrentUser } from '../services/api';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { 
  BuildingOffice2Icon, 
  PlusCircleIcon, 
  DocumentArrowUpIcon, 
  TicketIcon, 
  ArrowDownTrayIcon, 
  UserGroupIcon, 
  ClockIcon, 
  ChartBarIcon, 
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

// --- DATA STRUCTURES (INTERFACES) ---

interface TicketItem {
  id: string;
  program: string;
  count: number;
  date: string;
  status: 'review' | 'issued' | 'approved';
  domain: string;
  base: number;
  discount: number;
}

interface EmployeeItem {
  id: number;
  name: string;
  progress: number;
}

// Real, logged-in company account details — fetched from /auth/me, never hardcoded
interface CompanyProfile {
  fullName: string;
  email: string;
}

interface FormState {
  program: string;
  count: string;
  budget: string;
  domain: string;
}

interface DictionarySchema {
  title: string;
  subtitle: string;
  tabRequest: string;
  tabTickets: string;
  tabAnalytics: string;
  formTitle: string;
  progName: string;
  empCount: string;
  budget: string;
  domain: string;
  rfpLabel: string;
  rfpHint: string;
  btnSubmit: string;
  toastSuccess: string;
  tableTitle: string;
  searchPlaceholder: string;
  thId: string;
  thProgram: string;
  thDate: string;
  thStatus: string;
  thAction: string;
  statusReview: string;
  statusIssued: string;
  statusApproved: string;
  viewQuoteBtn: string;
  quoteHeader: string;
  basePrice: string;
  groupDiscount: string;
  totalPrice: string;
  btnAcceptQuote: string;
  btnAmendQuote: string;
  cardActiveEmp: string;
  cardHours: string;
  cardProgress: string;
  exportBtn: string;
  empListTitle: string;
  thEmpName: string;
  thEmpProgress: string;
}

// --- COMPONENT START ---

export default function CompanyDashboard() {
  const { t, lang } = useLanguage();
  
  // 1. Dual-Language Translation Fallback Safeguard Matrix
  const l: DictionarySchema = (t as any).companyDashboard || {
    title: lang === 'ar' ? 'لوحة تحكم الشركات' : 'Company Dashboard',
    subtitle: lang === 'ar' ? 'إدارة المعسكرات المخصصة، تتبع عروض الأسعار، ومراقبة أداء الموظفين.' : 'Manage custom bootcamps, track quotations, and monitor employee metrics.',
    tabRequest: lang === 'ar' ? 'طلب معسكر مخصص' : 'Request Bootcamp',
    tabTickets: lang === 'ar' ? 'متابعة عروض الأسعار' : 'Quotations & Tickets',
    tabAnalytics: lang === 'ar' ? 'إحصائيات الموظفين' : 'Employees Analytics',
    formTitle: lang === 'ar' ? 'طلب برنامج تدريبي مخصص للشركات' : 'Request Custom B2B Training',
    progName: lang === 'ar' ? 'اسم البرنامج التدريبي' : 'Program Name',
    empCount: lang === 'ar' ? 'عدد الموظفين المستهدفين' : 'Target Employees Count',
    budget: lang === 'ar' ? 'الميزانية التقريبية (ر.س)' : 'Approximate Budget (SAR)',
    domain: lang === 'ar' ? 'المجال التقني' : 'Technical Domain',
    rfpLabel: lang === 'ar' ? 'كراسة الشروط والمتطلبات (RFP)' : 'Requirements Document (RFP)',
    rfpHint: lang === 'ar' ? 'اسحب وأفلت الملف هنا أو انقر للاختيار (PDF, DOCX)' : 'Drag & drop your file here or click to browse (PDF, DOCX)',
    btnSubmit: lang === 'ar' ? 'إرسال طلب المعسكر الإستراتيجي' : 'Submit Strategic Request',
    toastSuccess: lang === 'ar' ? '✨ تم إرسال طلبك بنجاح! تم إنشاء تذكرة جديدة وقيد المراجعة الإدارية.' : '✨ Request submitted successfully! A tracking ticket has been opened.',
    tableTitle: lang === 'ar' ? 'سجل تذاكر وعروض أسعار الـ B2B' : 'B2B Tickets & Quotation Log',
    searchPlaceholder: lang === 'ar' ? 'بحث برقم التذكرة أو البرنامج...' : 'Search by ticket ID or program...',
    thId: lang === 'ar' ? 'رقم التذكرة' : 'Ticket ID',
    thProgram: lang === 'ar' ? 'البرنامج' : 'Program',
    thDate: lang === 'ar' ? 'التاريخ' : 'Date',
    thStatus: lang === 'ar' ? 'الحالة الكلية' : 'Status',
    thAction: lang === 'ar' ? 'إجراءات العرض المالي' : 'Financial Actions',
    statusReview: lang === 'ar' ? 'قيد المراجعة الإدارية' : 'Under Review',
    statusIssued: lang === 'ar' ? 'تم إصدار عرض السعر' : 'Quotation Issued',
    statusApproved: lang === 'ar' ? 'معتمد ومقبول' : 'Approved',
    viewQuoteBtn: lang === 'ar' ? 'عرض السعر المخصص' : 'View Custom Quote',
    quoteHeader: lang === 'ar' ? 'تفاصيل عرض السعر المالي المخصص' : 'Custom Financial Quotation Details',
    basePrice: lang === 'ar' ? 'الرسوم الأساسية لكل موظف' : 'Base Fee Per Employee',
    groupDiscount: lang === 'ar' ? 'خصم المجموعات والشركات' : 'Corporate Group Discount',
    totalPrice: lang === 'ar' ? 'إجمالي الصافي المستحق' : 'Net Total Amount',
    btnAcceptQuote: lang === 'ar' ? 'قبول واعتماد العرض المالي' : 'Accept & Approve Quote',
    btnAmendQuote: lang === 'ar' ? 'طلب تعديل العرض' : 'Request Amendment',
    cardActiveEmp: lang === 'ar' ? 'الموظفين النشطين حالياً' : 'Currently Active Employees',
    cardHours: lang === 'ar' ? 'الساعات التدريبية المنجزة' : 'Training Hours Completed',
    cardProgress: lang === 'ar' ? 'نسبة التقدم الإجمالية' : 'Overall Progress Rate',
    exportBtn: lang === 'ar' ? 'تصدير التقرير المعتمد (CSV)' : 'Export Approved Report (CSV)',
    empListTitle: lang === 'ar' ? 'بيانات ومعدلات إنجاز موظفي الشركة الكلية' : 'Company Employee Performance Roster',
    thEmpName: lang === 'ar' ? 'اسم الموظف' : 'Employee Name',
    thEmpProgress: lang === 'ar' ? 'نسبة الإنجاز' : 'Completion Rate'
  };

  const token = localStorage.getItem('user_token');

  // إفراغ المصفوفات من البيانات الثابتة لانتظار البيانات الحية من السيرفر[cite: 9]
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);

  // بيانات الشركة الحقيقية (الاسم والبريد) — تُجلب من السيرفر ولا تُكتب بشكل ثابت بالكود
  const [profile, setProfile] = useState<CompanyProfile | null>(null);

  // UI Navigation & View Screen Switches
  const [activeTab, setActiveTab] = useState<'request' | 'tickets' | 'analytics'>('request');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showToast, setShowToast] = useState<boolean>(false);
  const [selectedQuote, setSelectedQuote] = useState<TicketItem | null>(null);

  // Form Input Tracking Structure
  const [form, setForm] = useState<FormState>({ program: '', count: '', budget: '', domain: 'Cybersecurity' });
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  // جلب بيانات عروض الأسعار والموظفين عند تحميل الصفحة بشكل ديناميكي[cite: 9]
  useEffect(() => {
    let isMounted = true;

    async function loadCompanyData() {
      try {
        const ticketsRes = await fetch(`${BASE_URL}/company/tickets`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const ticketsData = await ticketsRes.json().catch(() => []);

        const employeesRes = await fetch(`${BASE_URL}/company/employees`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const employeesData = await employeesRes.json().catch(() => []);

        // جلب بيانات حساب الشركة الحقيقية (الاسم والبريد المسجّلين فعلياً عند التسجيل)
        const userResponse: any = await getCurrentUser().catch(() => null);

        if (!isMounted) return;

        setTickets(Array.isArray(ticketsData) ? ticketsData : []);
        setEmployees(Array.isArray(employeesData) ? employeesData : []);

        const rawUser = userResponse?.user || userResponse;
        if (rawUser?.fullName || rawUser?.email) {
          setProfile({ fullName: rawUser.fullName || '', email: rawUser.email || '' });
        }
      } catch (err) {
        console.error('Failed to load company dashboard telemetry data', err);
      }
    }

    loadCompanyData();
    return () => { isMounted = false; };
  }, [BASE_URL, token]);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}/company/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          program: form.program,
          count: parseInt(form.count) || 10,
          budget: parseFloat(form.budget) || 0,
          domain: form.domain,
          fileName: uploadedFileName
        })
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        alert(result.error || result.message || 'فشل في إرسال طلب المعسكر المخصص');
        return;
      }

      const newTicket = result.ticket || result;
      setTickets(prev => [newTicket, ...prev]);
      setShowToast(true);
      setForm({ program: '', count: '', budget: '', domain: 'Cybersecurity' });
      setUploadedFileName('');
      setTimeout(() => setShowToast(false), 5000);
    } catch (err) {
      alert('حدث خطأ في الاتصال بالخادم، يرجى المحاولة لاحقاً');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFileName(e.target.files[0].name);
    }
  };

  const handleUpdateQuoteStatus = async (ticketId: string, nextStatus: 'review' | 'issued' | 'approved') => {
    try {
      const response = await fetch(`${BASE_URL}/company/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || 'فشل في تعديل حالة عرض السعر');
        return;
      }

      setTickets(prev => prev.map(tkt => tkt.id === ticketId ? { ...tkt, status: nextStatus } : tkt));
      setSelectedQuote(null);
    } catch (err) {
      alert('حدث خطأ أثناء إرسال الإجراء المقرب للسيرفر');
    }
  };

  const handleExportCSV = () => {
    alert(lang === 'ar' ? 'جاري إنشاء وتصدير ملف التقرير المالي الشامل...' : 'Generating and exporting complete data report stream...');
  };

  const filteredTickets = tickets.filter(tkt => {
    const matchesSearch = tkt.program.toLowerCase().includes(searchTerm.toLowerCase()) || tkt.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tkt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#C9D6DF] font-sans text-slate-800 selection:bg-[#00A499]/10" dir={t.dir}>
       {/* إضاءات بلور خلفية ناعمة للهوية البصرية */}
      <div className={`absolute top-30 ${t.dir === 'rtl' ? 'right-12' : 'left-12'} w-[450px] h-[450px] bg-capsule-teal/15 rounded-full blur-[110px] pointer-events-none z-0`}></div>
      <div className={`absolute top-[90%] ${t.dir === 'rtl' ? 'left-12' : 'right-12'} w-[400px] h-[400px] bg-capsule-gold/15 rounded-full blur-[110px] pointer-events-none z-0`}></div>

      <Navbar activePage="dashboard" />

      {showToast && (
        <div className="fixed bottom-6 right-6 left-6 md:left-auto md:w-[450px] bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-4 rounded-2xl shadow-xl z-50 flex items-center gap-3 animate-bounce border border-emerald-400/20">
          <CheckCircleIcon className="w-6 h-6 flex-shrink-0 text-emerald-200" />
          <p className="text-xs font-black leading-relaxed">{l.toastSuccess}</p>
        </div>
      )}

<div className="relative overflow-hidden bg-gradient-to-tr from-capsule-footer via-capsule-navy to-capsule-teal text-white pt-24 pb-16">        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,164,153,0.12),transparent_50%)]"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-[#00A499]/20 text-[#26FFE6] text-xs font-black px-3 py-1 rounded-full border border-[#00A499]/30 mb-4 tracking-wide uppercase">
            <BuildingOffice2Icon className="w-3.5 h-3.5" />
            {l.title}
          </div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight mb-2">
            {profile?.fullName
              ? (lang === 'ar' ? `مرحباً، ${profile.fullName}` : `Welcome, ${profile.fullName}`)
              : l.title}
          </h1>
          <p className="text-slate-300 max-w-2xl text-xs md:text-sm font-semibold leading-relaxed">{l.subtitle}</p>
          {profile?.email && (
            <p dir="ltr" className="text-[#26FFE6] text-xs font-bold mt-2 inline-flex items-center gap-1.5">
              📧 {profile.email}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex border-b border-slate-200/80 mb-8 gap-1 md:gap-2 overflow-x-auto">
          <button onClick={() => setActiveTab('request')} className={`whitespace-nowrap px-4 py-3 font-black text-xs md:text-sm transition-all border-b-2 cursor-pointer ${activeTab === 'request' ? 'border-b-[#00A499] text-[#00A499]' : 'border-b-transparent text-slate-400 hover:text-slate-600'}`}>
            <PlusCircleIcon className="w-4 h-4 inline-block mx-1" />
            {l.tabRequest}
          </button>
          <button onClick={() => setActiveTab('tickets')} className={`whitespace-nowrap px-4 py-3 font-black text-xs md:text-sm transition-all border-b-2 cursor-pointer ${activeTab === 'tickets' ? 'border-b-[#00A499] text-[#00A499]' : 'border-b-transparent text-slate-400 hover:text-slate-600'}`}>
            <TicketIcon className="w-4 h-4 inline-block mx-1" />
            {l.tabTickets}
          </button>
          <button onClick={() => setActiveTab('analytics')} className={`whitespace-nowrap px-4 py-3 font-black text-xs md:text-sm transition-all border-b-2 cursor-pointer ${activeTab === 'analytics' ? 'border-b-[#00A499] text-[#00A499]' : 'border-b-transparent text-slate-400 hover:text-slate-600'}`}>
            <ChartBarIcon className="w-4 h-4 inline-block mx-1" />
            {l.tabAnalytics}
          </button>
        </div>

        {activeTab === 'request' && (
          <div className="max-w-3xl bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#00A499] to-[#0D4C54]"></div>
            <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00A499]"></span>
              {l.formTitle}
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">{l.progName}</label>
                <input type="text" required value={form.program} onChange={(e) => setForm({...form, program: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs md:text-sm font-semibold focus:outline-none focus:border-[#00A499] focus:bg-white transition-all" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">{l.empCount}</label>
                  <input type="number" required value={form.count} onChange={(e) => setForm({...form, count: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs md:text-sm font-semibold focus:outline-none focus:border-[#00A499] focus:bg-white transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">{l.budget}</label>
                  <input type="number" required value={form.budget} onChange={(e) => setForm({...form, budget: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs md:text-sm font-semibold focus:outline-none focus:border-[#00A499] focus:bg-white transition-all" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">{l.domain}</label>
                <select value={form.domain} onChange={(e) => setForm({...form, domain: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs md:text-sm font-semibold focus:outline-none focus:border-[#00A499] focus:bg-white transition-all cursor-pointer">
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                  <option value="Cloud Computing">Cloud Computing</option>
                  <option value="Web Development">Web Development</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">{l.rfpLabel}</label>
                <div className="relative border-2 border-dashed border-slate-200 hover:border-[#00A499] bg-slate-50/50 rounded-2xl p-6 transition-all text-center cursor-pointer group">
                  <input type="file" onChange={handleFileUpload} accept=".pdf,.doc,.docx" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <DocumentArrowUpIcon className="w-8 h-8 mx-auto text-slate-300 group-hover:text-[#00A499] transition-colors mb-2" />
                  <p className="text-xs font-bold text-slate-600">{uploadedFileName || l.rfpHint}</p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button type="submit" className="w-full sm:w-auto bg-[#0D4C54] hover:bg-[#003947] text-white font-black text-xs md:text-sm px-8 py-3.5 rounded-xl shadow-md transition-all cursor-pointer">
                  {l.btnSubmit}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'tickets' && (
          <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00A499]"></span>
                {l.tableTitle}
              </h2>
              
              <div className="flex flex-wrap items-center gap-3">
                <input type="text" placeholder={l.searchPlaceholder} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#00A499] max-w-[200px]" />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#00A499] cursor-pointer">
                  <option value="all">{lang === 'ar' ? 'الكل' : 'All States'}</option>
                  <option value="review">{l.statusReview}</option>
                  <option value="issued">{l.statusIssued}</option>
                  <option value="approved">{l.statusApproved}</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold bg-slate-50/20">
                    <th className={`p-4 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{l.thId}</th>
                    <th className={`p-4 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{l.thProgram}</th>
                    <th className="p-4 text-center">{l.thDate}</th>
                    <th className="p-4 text-center">{l.thStatus}</th>
                    <th className="p-4 text-center">{l.thAction}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                  {filteredTickets.map((tkt) => (
                    <tr key={tkt.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="p-4 font-mono font-bold text-[#0D4C54]">{tkt.id}</td>
                      <td className="p-4 font-bold text-slate-900 max-w-xs truncate">
                        <p>{tkt.program}</p>
                        <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 mt-1 inline-block">{tkt.domain}</span>
                      </td>
                      <td className="p-4 text-center text-slate-400 font-mono">{tkt.date}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full ${
                          tkt.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                          tkt.status === 'issued' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                          'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            tkt.status === 'approved' ? 'bg-emerald-500' : tkt.status === 'issued' ? 'bg-indigo-500' : 'bg-amber-500'
                          }`}></span>
                          {tkt.status === 'approved' ? l.statusApproved : tkt.status === 'issued' ? l.statusIssued : l.statusReview}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {tkt.status === 'issued' ? (
                          <button onClick={() => setSelectedQuote(tkt)} className="bg-[#00A499] hover:bg-[#00867D] text-white text-[11px] font-black px-3 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer">
                            {l.viewQuoteBtn}
                          </button>
                        ) : tkt.status === 'approved' ? (
                          <span className="text-emerald-600 flex items-center justify-center gap-1 text-xs">✓ {l.statusApproved}</span>
                        ) : (
                          <span className="text-slate-400 font-normal italic text-xs">{lang === 'ar' ? 'بانتظار التسعير' : 'Awaiting pricing matrix'}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#00A499]/10 flex items-center justify-center text-[#00A499]"><UserGroupIcon className="w-6 h-6" /></div>
                <div><p className="text-xs font-bold text-slate-400">{l.cardActiveEmp}</p><p className="text-xl font-black text-slate-900 font-mono mt-0.5">{employees.length}</p></div>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600"><ClockIcon className="w-6 h-6" /></div>
                <div><p className="text-xs font-bold text-slate-400">{l.cardHours}</p><p className="text-xl font-black text-slate-900 font-mono mt-0.5">1,240</p></div>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600"><ChartBarIcon className="w-6 h-6" /></div>
                <div><p className="text-xs font-bold text-slate-400">{l.cardProgress}</p><p className="text-xl font-black text-slate-900 font-mono mt-0.5">79.3%</p></div>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00A499]"></span>
                  {l.empListTitle}
                </h3>
                <button onClick={handleExportCSV} className="inline-flex items-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer">
                  <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                  {l.exportBtn}
                </button>
              </div>

              <div className="space-y-4">
                {employees.map((emp) => (
                  <div key={emp.id} className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-200/60 font-mono font-bold text-slate-600 text-xs flex items-center justify-center">#{emp.id}</div>
                      <p className="text-xs font-black text-slate-800">{emp.name}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 flex-1 sm:max-w-md w-full">
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div className="bg-gradient-to-r from-[#00A499] to-[#0D4C54] h-2 transition-all duration-500" style={{ width: `${emp.progress}%` }}></div>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-500 w-10 text-center">{emp.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {selectedQuote && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-slate-900 mb-2 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00A499]"></span>
              {l.quoteHeader}
            </h3>
            <p className="text-xs text-slate-400 font-bold mb-6 font-mono">{selectedQuote.id} — {selectedQuote.program}</p>
            
            <div className="divide-y divide-slate-100 space-y-4 border-b border-slate-100 pb-6 mb-6 font-semibold">
              <div className="flex justify-between items-center text-xs md:text-sm pt-2">
                <span className="text-slate-500">{l.basePrice}</span>
                <span className="font-mono font-bold text-slate-900">{selectedQuote.base} {lang === 'ar' ? 'ر.س' : 'SAR'}</span>
              </div>
              <div className="flex justify-between items-center text-xs md:text-sm pt-4">
                <span className="text-slate-500">{l.empCount}</span>
                <span className="font-mono font-bold text-slate-900">{selectedQuote.count}</span>
              </div>
              <div className="flex justify-between items-center text-xs md:text-sm pt-4 text-emerald-600">
                <span>{l.groupDiscount}</span>
                <span className="font-mono font-bold">-{selectedQuote.discount}%</span>
              </div>
              <div className="flex justify-between items-center text-base font-black pt-4 text-[#0D4C54]">
                <span>{l.totalPrice}</span>
                <span className="font-mono">
                  {Math.round((selectedQuote.base * selectedQuote.count) * (1 - selectedQuote.discount / 100)).toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => handleUpdateQuoteStatus(selectedQuote.id, 'approved')} className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs md:text-sm px-4 py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                <CheckCircleIcon className="w-4 h-4" />
                {l.btnAcceptQuote}
              </button>
              <button onClick={() => handleUpdateQuoteStatus(selectedQuote.id, 'review')} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-xs md:text-sm px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                <ArrowPathIcon className="w-4 h-4" />
                {l.btnAmendQuote}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}