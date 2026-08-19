// src/pages/Contact.tsx
import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { 
  EnvelopeIcon, MapPinIcon, ClockIcon, PaperAirplaneIcon, 
  ExclamationCircleIcon, CheckCircleIcon, XMarkIcon 
} from '@heroicons/react/24/outline';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';
// API base URL — single source of truth
import { BASE_URL } from '../services/api';

// ==========================================
// 1. تعريف واجهات البيانات (TypeScript Interfaces)
// ==========================================

interface ContactFormData {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  category: string;
  message: string;
}

interface ContactFormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  subject?: string;
  category?: string;
  message?: string;
}

interface InfoItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  val: string;
  link: string | null;
}

// ==========================================
// 2. المكون البرمجي الرئيسي لصفحة اتصل بنا
// ==========================================
export default function Contact() {
  const { t, lang } = useLanguage();
  const c = t.contact; 
  const isRTL = lang === 'ar';

  const [formData, setFormData] = useState<ContactFormData>({ 
    fullName: '', email: '', phone: '', subject: '', category: '', message: '' 
  });
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // ==========================================
  // 3. دوال التحقق من صحة البيانات (Validation)
  // ==========================================
  const validateForm = (): boolean => {
    const tempErrors: ContactFormErrors = {};

    if (!formData.fullName.trim()) tempErrors.fullName = c.form.errRequired;
    else if (formData.fullName.trim().length < 3) tempErrors.fullName = c.form.errMinName;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) tempErrors.email = c.form.errRequired;
    else if (!emailRegex.test(formData.email)) tempErrors.email = c.form.errEmail;

    const phoneRegex = /^05\d{8}$/;
    if (!formData.phone.trim()) tempErrors.phone = c.form.errRequired;
    else if (!phoneRegex.test(formData.phone)) tempErrors.phone = c.form.errPhone;
    
    if (!formData.subject.trim()) tempErrors.subject = c.form.errRequired;
    if (!formData.category) tempErrors.category = c.form.errRequired;
    if (!formData.message.trim()) tempErrors.message = c.form.errRequired;
    else if (formData.message.trim().length < 20) tempErrors.message = c.form.errMinMsg;

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // ==========================================
  // 4. معالجة إرسال النموذج وحفظ الحالات حياً مع السيرفر
  // ==========================================
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitError("");
    setIsSubmitting(true);
    try {
      const response = await fetch(`${BASE_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setSubmitError(result.message || (isRTL ? "فشل إرسال الرسالة، يرجى التحقق من الخادم." : "Failed to send message, please check server response."));
        return;
      }

      setShowAlert(true);
      setFormData({ fullName: '', email: '', phone: '', subject: '', category: '', message: '' });
    } catch (err) {
      setSubmitError(isRTL ? "حدث خطأ أثناء الاتصال بالسيرفر، حاول مرة أخرى." : "Network connection error, please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const infoItems: InfoItem[] = [
    { icon: EnvelopeIcon, title: c.info.emailTitle, desc: c.info.emailDesc, val: c.info.emailValue, link: `mailto:${c.info.emailValue}` },
    { icon: MapPinIcon, title: c.info.locationTitle, desc: c.info.locationDesc, val: c.info.locationValue, link: null },
    { icon: ClockIcon, title: c.info.hoursTitle, desc: c.info.hoursDesc, val: c.info.hoursValue, link: null }
  ];

  return (
    <div className="min-h-screen bg-[#F0F5F9] dark:bg-[#0A0F1D] font-sans flex flex-col text-capsule-navy dark:text-slate-100 relative overflow-x-clip transition-colors duration-300" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Background Ambient Blur Glows */}
      <div className="absolute top-[15%] right-[10%] w-[500px] h-[500px] bg-capsule-teal/15 dark:bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[10%] w-[500px] h-[500px] bg-amber-500/10 dark:bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />

      <Navbar activePage="contact" />

      {/* 🎨 Header Section with Dark Mode support & Smooth SVG Divider */}
      <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#164961] via-[#1a5570] to-capsule-teal py-16 text-center text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 shadow-inner">
            <EnvelopeIcon className="w-5 h-5 text-capsule-gold" />
            <span className="text-sm font-bold text-white">{c.hero.badge}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black mb-4 tracking-tight text-white drop-shadow-sm">{c.hero.title}</h1>
          <p className="text-base sm:text-lg text-white/90 max-w-2xl leading-relaxed font-semibold">{c.hero.subtitle}</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto text-[#F0F5F9] dark:text-[#0A0F1D] transition-colors duration-300" preserveAspectRatio="none">
            <path d="M0 60h1440V20c-360 40-1080-40-1440 0v40z" fill="currentColor"/>
          </svg>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12 w-full flex-grow relative z-10">
        
        {/* 📝 Contact Form Card with Full Glassmorphism & Dark Mode */}
        <div className="bg-white/70 dark:bg-[#162035]/70 backdrop-blur-xl rounded-3xl border border-white/60 dark:border-white/10 shadow-2xl p-6 sm:p-8 space-y-6 transition-all hover:shadow-capsule-teal/10">
          <h2 className="text-2xl font-black text-capsule-navy dark:text-white border-b border-slate-200/60 dark:border-slate-800 pb-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-capsule-teal dark:bg-teal-400"></span>
            {c.form.title}
          </h2>
          
          {showAlert && (
            <div className="w-full bg-emerald-100/90 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 rounded-2xl p-4 shadow-md flex items-start gap-3 transition-all duration-300" role="alert">
              <CheckCircleIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-base font-black text-emerald-900 dark:text-emerald-200 mb-0.5">{c.form.alertTitle}</h3>
                <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">{c.form.alertDesc}</p>
              </div>
              <button onClick={() => setShowAlert(false)} className="p-1 rounded-lg text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200/50">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          )}

          {submitError && (
            <div className="w-full bg-rose-100/90 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 rounded-2xl p-4 mb-4 font-black text-xs flex items-center gap-2 shadow-md">
              <ExclamationCircleIcon className="w-5 h-5 text-rose-500 flex-shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">{c.form.fullName}</label>
              <input type="text" value={formData.fullName} onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({...formData, fullName: e.target.value})} placeholder={c.form.fullNamePlaceholder} className={`w-full px-4 py-2.5 rounded-xl border text-xs font-bold text-capsule-navy dark:text-slate-100 focus:outline-none focus:border-capsule-teal dark:focus:border-teal-400 transition-all ${errors.fullName ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30' : 'border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-[#0F172A]/80'}`} />
              {errors.fullName && <p className="text-rose-500 text-xs font-bold mt-1 flex items-center gap-1"><ExclamationCircleIcon className="w-4 h-4" />{errors.fullName}</p>}
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">{c.form.email}</label>
              <input type="text" value={formData.email} onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({...formData, email: e.target.value})} placeholder={c.form.emailPlaceholder} className={`w-full px-4 py-2.5 rounded-xl border text-xs font-bold text-capsule-navy dark:text-slate-100 focus:outline-none focus:border-capsule-teal dark:focus:border-teal-400 transition-all ${errors.email ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30' : 'border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-[#0F172A]/80'}`} />
              {errors.email && <p className="text-rose-500 text-xs font-bold mt-1 flex items-center gap-1"><ExclamationCircleIcon className="w-4 h-4" />{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">{c.form.phone}</label>
              <input type="tel" value={formData.phone} onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, phone: e.target.value })} placeholder={c.form.phonePlaceholder} className={`w-full px-4 py-2.5 rounded-xl border text-xs font-bold text-capsule-navy dark:text-slate-100 focus:outline-none focus:border-capsule-teal dark:focus:border-teal-400 transition-all ${errors.phone ? "border-rose-500 bg-rose-50/50 dark:bg-rose-950/30" : "border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-[#0F172A]/80"}`} />
              {errors.phone && <p className="text-rose-500 text-xs font-bold mt-1 flex items-center gap-1"><ExclamationCircleIcon className="w-4 h-4" />{errors.phone}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">{c.form.subject}</label>
                <input type="text" value={formData.subject} onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({...formData, subject: e.target.value})} placeholder={c.form.subjectPlaceholder} className={`w-full px-4 py-2.5 rounded-xl border text-xs font-bold text-capsule-navy dark:text-slate-100 focus:outline-none focus:border-capsule-teal dark:focus:border-teal-400 transition-all ${errors.subject ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30' : 'border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-[#0F172A]/80'}`} />
                {errors.subject && <p className="text-rose-500 text-xs font-bold mt-1 flex items-center gap-1"><ExclamationCircleIcon className="w-4 h-4" />{errors.subject}</p>}
              </div>
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">{c.form.category}</label>
                <select value={formData.category} onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData({...formData, category: e.target.value})} className={`w-full px-4 py-2.5 rounded-xl border text-xs font-bold text-capsule-navy dark:text-slate-100 focus:outline-none focus:border-capsule-teal dark:focus:border-teal-400 transition-all ${errors.category ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30' : 'border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-[#0F172A]/80'}`}>
                  <option value="" className="dark:bg-[#0F172A] text-slate-800 dark:text-slate-200">{c.form.categorySelect}</option>
                  <option value="bootcamps" className="dark:bg-[#0F172A] text-slate-800 dark:text-slate-200">{c.form.cat1}</option>
                  <option value="support" className="dark:bg-[#0F172A] text-slate-800 dark:text-slate-200">{c.form.cat2}</option>
                  <option value="partnerships" className="dark:bg-[#0F172A] text-slate-800 dark:text-slate-200">{c.form.cat3}</option>
                  <option value="other" className="dark:bg-[#0F172A] text-slate-800 dark:text-slate-200">{c.form.cat4}</option>
                </select>
                {errors.category && <p className="text-rose-500 text-xs font-bold mt-1 flex items-center gap-1"><ExclamationCircleIcon className="w-4 h-4" />{errors.category}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">{c.form.message}</label>
              <textarea rows={4} value={formData.message} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, message: e.target.value})} placeholder={c.form.messagePlaceholder} className={`w-full px-4 py-2.5 rounded-xl border text-xs font-bold text-capsule-navy dark:text-slate-100 focus:outline-none focus:border-capsule-teal dark:focus:border-teal-400 transition-all resize-none ${errors.message ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30' : 'border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-[#0F172A]/80'}`}></textarea>
              {errors.message && <p className="text-rose-500 text-xs font-bold mt-1 flex items-center gap-1"><ExclamationCircleIcon className="w-4 h-4" />{errors.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-capsule-navy to-capsule-teal hover:from-capsule-teal hover:to-capsule-navy text-white font-black py-3 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer">
              {isSubmitting ? (
                <><svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>{c.form.loadingBtn}</>
              ) : (
                <>{c.form.submitBtn}<PaperAirplaneIcon className={`w-5 h-5 ${isRTL ? 'transform rotate-180' : ''}`} /></>
              )}
            </button>
          </form>
        </div>

        {/* 📞 Contact Info Cards with Full Glassmorphism & Dark Mode */}
        <div className="flex flex-col justify-start space-y-6">
          {infoItems.map((item, index) => (
            <div key={index} className="bg-white/70 dark:bg-[#162035]/70 backdrop-blur-xl rounded-3xl p-6 border border-white/60 dark:border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-capsule-teal/10 dark:bg-teal-400/10 text-capsule-teal dark:text-teal-400 mb-4 group-hover:bg-capsule-teal group-hover:text-white dark:group-hover:bg-teal-400 dark:group-hover:text-slate-950 transition-colors duration-300 border border-capsule-teal/20 dark:border-teal-400/20 shadow-xs">
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-capsule-navy dark:text-white mb-1">{item.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold mb-3">{item.desc}</p>
              {item.link ? (
                <a href={item.link} className="text-sm font-black text-capsule-teal dark:text-teal-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors duration-200">{item.val}</a>
              ) : (
                <p className="text-sm font-black text-slate-800 dark:text-slate-200">{item.val}</p>
              )}
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}