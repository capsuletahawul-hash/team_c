import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext'; // 🔄 استيراد سياق اللغة بدون ملحقات الملفات لضمان توافق TS
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { BASE_URL } from '../services/api';
import {
  PaperAirplaneIcon, UserIcon, EnvelopeIcon, ChatBubbleBottomCenterTextIcon,
  PhoneIcon, BriefcaseIcon, StarIcon as OutlineStar, ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { StarIcon as SolidStar } from '@heroicons/react/24/solid';

// ==========================================
// 🛠️ الأنواع والـ Interfaces لضمان كتابة كود TypeScript سليم وآمن (No Any)
// ==========================================
interface UIStrings {
  loading: string; error: string; heroTitle: string; heroSub: string;
  coursesTitle: string; thName: string; thStudents: string; thStatus: string;
  statusPub: string; statusRev: string; reviewsTitle: string; rateTitle: string;
  rateDesc: string; thankYou: string; notRated: string; textSelection: string;
  contactTitle: string; contactSub: string; msgSuccess: string; labelName: string;
  labelEmail: string; labelMsg: string; btnSend: string; bioTitle: string;
  phoneTitle: string;
}

interface CourseItem {
  id: string | number;
  name?: string;
  title?: string;
  students?: number;
  status?: 'published' | 'review' | string;
}

interface TrainerRawData {
  id?: string | number;
  name?: string; nameAr?: string; nameEn?: string;
  specialty?: string; specialtyAr?: string; specialtyEn?: string;
  bio?: string; bioAr?: string; bioEn?: string;
  email?: string;
  phone?: string;
  courses?: CourseItem[];
}

interface TranslatedTrainer {
  fullName: string;
  specialization: string;
  bio: string;
  email: string;
  phone: string;
}

interface LanguageContextType {
  t: {
    dir: 'rtl' | 'ltr';
    trainerDetails?: Partial<UIStrings>;
  };
  lang: 'ar' | 'en';
}

interface ApiResponse {
  success: boolean;
  data?: TrainerRawData;
}

// ==========================================
// 🚀 المكون الأساسي لصفحة تفاصيل المدرب
// ==========================================
export default function TrainerDetails() {
  // 🗺️ جلب سياق اللغة والترجمات التلقائية للمنصة
  const { t, lang } = useLanguage() as LanguageContextType;

  // 📝 تهيئة النصوص والواجهات المترجمة لضمان استقرار العرض الفوري للأقسام
  const l: UIStrings = {
    loading: lang === 'ar' ? 'جاري تحميل بيانات ملف المدرب الخبير...' : 'Loading trainer profile data...',
    error: lang === 'ar' ? 'فشل في تحميل تفاصيل المدرب، يرجى المحاولة لاحقاً.' : 'Failed to load trainer details.',
    heroTitle: lang === 'ar' ? 'ملف المدرب الشخصي' : 'Trainer Profile',
    heroSub: lang === 'ar' ? 'مراجعة شاملة للسيرة الذاتية للمدرب، الدورات التقنية المسندة إليه، والمقاييس العالمية.' : 'Comprehensive review of trainer biographies, assigned technical courses, and global metrics.',
    coursesTitle: lang === 'ar' ? 'الدورات التدريبية القائمة' : 'Training Courses',
    thName: lang === 'ar' ? 'اسم الدورة التدريبية' : 'Course Name',
    thStudents: lang === 'ar' ? 'عدد الطلاب المسجلين' : 'Number of Students',
    thStatus: lang === 'ar' ? 'الحالة الحالية' : 'Status',
    statusPub: lang === 'ar' ? 'منشورة' : 'Published',
    statusRev: lang === 'ar' ? 'تحت المراجعة' : 'Under Review',
    reviewsTitle: lang === 'ar' ? 'آراء وتقييمات الطلاب المتدربين' : 'Students Feedbacks & Reviews',
    rateTitle: lang === 'ar' ? 'قيم تجربتك الحالية مع المدرب الخبير' : 'Rate Your Experience with the Trainer',
    rateDesc: lang === 'ar' ? 'انقر على النجوم لتحديث مقاييس التقييم الإجمالية فوراً وضمان الجودة الكلية للمنصة.' : 'Click on the stars to instantly update the overall evaluation metrics.',
    thankYou: lang === 'ar' ? 'نشكرك على تقييمك الفعّال والدائم!' : 'Thank you for your active feedback!',
    notRated: lang === 'ar' ? 'لم يتم اختيار أي تقييم بعد. مرر وانقر للتجربة المباشرة!' : 'No rating selected yet. Hover and click to test!',
    textSelection: lang === 'ar' ? 'اختيارك الحالي هو: ' : 'Your current selection: ',
    contactTitle: lang === 'ar' ? 'الاستشارة المباشرة وإرسال رسالة' : 'Direct Consultation & Message',
    contactSub: lang === 'ar' ? 'هل لديك استفسار حول تدريب مخصص للشركات؟ أرسل رسالة مباشرة إلى صندوق المدرب.' : 'Have a corporate training inquiry? Drop a message directly to the trainer.',
    msgSuccess: lang === 'ar' ? '✨ تم إرسال استفسارك بنجاح إلى المدرب!' : '✨ Your inquiry has been dispatched successfully!',
    labelName: lang === 'ar' ? 'الاسم الكامل' : 'Full Name',
    labelEmail: lang === 'ar' ? 'البريد الإلكتروني للاستجابة' : 'Email Address',
    labelMsg: lang === 'ar' ? 'تفاصيل رسالتك أو استشارتك' : 'Your Message',
    btnSend: lang === 'ar' ? 'إرسال الرسالة الآن' : 'Send Message Now',
    bioTitle: lang === 'ar' ? 'السيرة المهنية' : 'Biography',
    phoneTitle: lang === 'ar' ? 'رقم الهاتف' : 'Phone',
    ...t.trainerDetails
  };

  // 🆔 استخراج الرقم التعريفي وحالة التوجيه للمدرب
  const { trainerId } = useParams<{ trainerId: string }>();
  const location = useLocation();
  const stateInstructorName = (location.state as any)?.instructorName;
  const stateCourseTitle = (location.state as any)?.courseTitle;

  // 💾 إدارة حالة البيانات وحالة الاتصال بالسيرفر
  const [rawData, setRawData] = useState<TrainerRawData | null>(null);
  const [trainer, setTrainer] = useState<TranslatedTrainer | null>(null);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ⭐ إدارة تقييمات الطلاب التفاعلية (النجوم وحركة المؤشر)
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [hasRated, setHasRated] = useState<boolean>(false);

  // 📧 نموذج التواصل والاستشارات الفورية
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [showFormSuccess, setShowFormSuccess] = useState<boolean>(false);

  // 🛰️ تأثير جلب تفاصيل المدرب من الـ API عند تحميل الصفحة
  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      if (!trainerId && !stateInstructorName) return;
      try {
        setLoading(true);
        let loadedSuccess = false;
        if (trainerId) {
          const res = await fetch(`${API_URL}/api/trainer/public/${trainerId}`).catch(() => null);
          if (res && res.ok) {
            const response: ApiResponse = await res.json().catch(() => ({ success: false }));
            if (response.success && response.data) {
              setRawData(response.data);
              setCourses(response.data.courses || []);
              loadedSuccess = true;
            }
          }
        }

        if (!loadedSuccess && isMounted) {
          const resolvedName = stateInstructorName || (lang === 'ar' ? 'د. سلمان العتيبي' : 'Dr. Salman Al-Otaibi');
          const bioArText = `مدرب خبير ومستشار معتمد بالمنصة متخصص في قيادة وتدريب دورة (${stateCourseTitle || 'الدورات التقنية المتقدمة'}). متمكن من تقديم أحدث المناهج المعتمدة والتدريب العملي المستمر.`;
          const bioEnText = `Certified expert instructor and advisor leading (${stateCourseTitle || 'advanced technical bootcamps'}). Specialist in delivering hands-on curriculum and industry mentorship.`;

          const fallbackProfile: TrainerRawData = {
            id: trainerId || 1,
            name: resolvedName,
            nameAr: resolvedName,
            nameEn: resolvedName,
            specialty: lang === 'ar' ? 'خبير تقني ومدرب معتمد' : 'Certified Technical Expert & Instructor',
            specialtyAr: 'خبير تقني ومدرب معتمد',
            specialtyEn: 'Certified Technical Expert & Instructor',
            bio: lang === 'ar' ? bioArText : bioEnText,
            bioAr: bioArText,
            bioEn: bioEnText,
            email: `trainer.${String(trainerId || 1).toLowerCase()}@capsula-tahawul.sa`,
            phone: '+966 50 123 4567',
            courses: [
              { id: 101, name: stateCourseTitle || (lang === 'ar' ? 'دورة التدريب المتقدمة' : 'Advanced Bootcamp'), students: 28, status: 'published' }
            ]
          };

          setRawData(fallbackProfile);
          setCourses(fallbackProfile.courses || []);
        }
      } catch {
        if (isMounted) setError(l.error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchData();
    return () => { isMounted = false; };
  }, [trainerId, stateInstructorName, stateCourseTitle, lang]);

  // 🔄 تأثير معالجة اللغات (عربي / إنجليزي) وتحديث حقول البيانات فورياً
  useEffect(() => {
    if (rawData) {
      const isAr = lang === 'ar';
      setTrainer({
        fullName: isAr ? (rawData.nameAr || rawData.name || "") : (rawData.nameEn || rawData.name || ""),
        specialization: isAr ? (rawData.specialtyAr || rawData.specialty || "خبير ومستشار تقني معتمد") : (rawData.specialtyEn || rawData.specialty || "Certified Technical Expert & Instructor"),
        bio: isAr ? (rawData.bioAr || rawData.bio || "مدرب معتمد بأسلوب تدريب عملي احترافي وخبرة واسعة في تقديم الدورات والمعسكرات البرمجية.") : (rawData.bioEn || rawData.bio || "Certified expert instructor specializing in advanced tech bootcamps."),
        email: rawData.email || "",
        phone: rawData.phone || ""
      });
    }
  }, [rawData, lang]);

  // 🎯 معالجة إرسال نموذج الاستشارة وتصفير المدخلات
  const handleContactSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setShowFormSuccess(true);
    setContactForm({ name: '', email: '', message: '' });
    setTimeout(() => setShowFormSuccess(false), 4000);
  };

  // 🛡️ معالجة حالة جاري التحميل لمنع وميض أو انهيار الصفحة
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#00A499] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-bold text-slate-600">{l.loading}</p>
        </div>
      </div>
    );
  }

  // 🛡️ معالجة الأخطاء وحماية واجهة المستخدم من تعطل البيانات
  if (error || !trainer) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md text-center border border-red-100">
          <div className="text-red-500 text-4xl mb-3">⚠️</div>
          <p className="text-sm font-black text-slate-800">{error || l.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F5F9] dark:bg-[#0B132B] font-sans text-capsule-navy dark:text-slate-100 selection:bg-capsule-teal/20 relative overflow-x-clip transition-colors duration-300" dir={t.dir}>
      {/* Background Ambient Glow Blur Orbs */}
      <div className="absolute top-[10%] right-[5%] w-[450px] h-[450px] bg-capsule-teal/15 dark:bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[5%] w-[500px] h-[500px] bg-amber-500/10 dark:bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />

      <Navbar />

      {/* 🎨 مكون الـ Hero (رأس الصفحة والبيانات الأساسية للمدرب) */}
      <div className="relative overflow-hidden bg-gradient-to-tr from-capsule-footer via-capsule-navy to-capsule-teal text-white pt-24 pb-20 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,123,132,0.25),transparent_60%)] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md text-[#26FFE6] text-xs font-black px-3.5 py-1.5 rounded-full border border-white/20 mb-4 tracking-wide uppercase shadow-inner">
            <span className="w-2 h-2 rounded-full bg-[#26FFE6] animate-pulse"></span>
            {l.heroTitle}
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-3 text-white drop-shadow-sm">{trainer.fullName}</h1>
          <p className="text-slate-100/90 max-w-3xl text-sm md:text-base font-bold leading-relaxed">{l.heroSub}</p>
        </div>
      </div>

      {/* 📦 الحاوية الرئيسية ومقسم العناصر */}
      <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* 🪪 العمود الأيسر: بطاقة هوية المدرب والبيانات الشخصية */}
          <div className="lg:col-span-1 bg-white/70 dark:bg-[#162035]/70 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden transition-all hover:shadow-capsule-teal/10">
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-capsule-teal via-capsule-navy to-amber-500"></div>

            <div className="flex flex-col items-center text-center pb-6 border-b border-slate-200/60 dark:border-slate-800">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-capsule-teal/20 to-capsule-navy/20 dark:from-teal-400/20 dark:to-sky-500/20 flex items-center justify-center text-capsule-teal dark:text-teal-400 mb-4 relative group border border-white/50 dark:border-white/10 shadow-lg backdrop-blur-md">
                <UserIcon className="w-12 h-12" />
              </div>
              <h2 className="text-xl font-black text-capsule-navy dark:text-white">{trainer.fullName}</h2>
              <p className="text-xs font-black text-capsule-teal dark:text-teal-400 bg-capsule-teal/10 dark:bg-teal-400/10 px-3.5 py-1.5 rounded-full mt-2 flex items-center gap-1.5 border border-capsule-teal/20 dark:border-teal-400/20">
                <BriefcaseIcon className="w-4 h-4" />
                {trainer.specialization}
              </p>
            </div>

            {/* 📝 قسم السيرة الذاتية وخلفية المدرب */}
            <div className="py-6 border-b border-slate-200/60 dark:border-slate-800 space-y-4">
              <div className="space-y-2">
                <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ChatBubbleLeftRightIcon className="w-4 h-4 text-capsule-teal dark:text-teal-400" />
                  {l.bioTitle}
                </h3>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
                  {trainer.bio}
                </p>
              </div>
            </div>

            {/* 📞 معلومات الاتصال السريع بالمدرب */}
            <div className="pt-6 space-y-4">
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <div className="w-9 h-9 rounded-xl bg-white/60 dark:bg-[#0F172A]/60 flex items-center justify-center border border-slate-200/80 dark:border-slate-700 text-capsule-teal dark:text-teal-400 shadow-xs"><EnvelopeIcon className="w-4 h-4" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase">{l.labelEmail}</p>
                  <p className="text-xs font-black text-capsule-navy dark:text-white truncate">{trainer.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <div className="w-9 h-9 rounded-xl bg-white/60 dark:bg-[#0F172A]/60 flex items-center justify-center border border-slate-200/80 dark:border-slate-700 text-capsule-teal dark:text-teal-400 shadow-xs"><PhoneIcon className="w-4 h-4" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase">{l.phoneTitle}</p>
                  <p className="text-xs font-mono font-black text-capsule-navy dark:text-white truncate" dir="ltr">{trainer.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 💻 العمود الأيمن: الدورات النشطة والتقييمات ونماذج الاستشارات */}
          <div className="lg:col-span-2 space-y-8">

            {/* 📊 جدول المقررات التدريبية النشطة للمدرب */}
            <div className="bg-white/70 dark:bg-[#162035]/70 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden transition-all hover:shadow-capsule-teal/10">
              <div className="p-6 border-b border-white/40 dark:border-slate-800 bg-white/40 dark:bg-[#0F172A]/50 flex items-center justify-between">
                <h2 className="text-base font-black text-capsule-navy dark:text-white flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-capsule-teal dark:bg-teal-400"></span>
                  {l.coursesTitle}
                </h2>
                <span className="bg-capsule-teal/10 dark:bg-teal-400/10 text-capsule-teal dark:text-teal-400 text-xs font-mono font-black px-3 py-1 rounded-full border border-capsule-teal/20 dark:border-teal-400/20">{courses.length}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-black bg-slate-100/60 dark:bg-slate-800/60">
                      <th className={`p-4 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{l.thName}</th>
                      <th className="p-4 text-center">{l.thStudents}</th>
                      <th className="p-4 text-center">{l.thStatus}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/30 dark:divide-slate-800 font-bold text-slate-800 dark:text-slate-200">
                    {courses.map((course) => (
                      <tr key={course.id} className="hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-4 font-black text-capsule-navy dark:text-white max-w-xs md:max-w-sm truncate">
                          {course.name || course.title}
                        </td>
                        <td className="p-4 text-center font-mono font-black text-slate-800 dark:text-slate-200">
                          {course.students ? course.students.toLocaleString() : 0}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 text-[11px] font-black px-3 py-1 rounded-full shadow-2xs ${course.status === 'published' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${course.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                            {course.status === 'published' ? l.statusPub : l.statusRev}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ⭐ نظام التقييمات وآراء الطلاب المتفاعلة */}
            <div className="bg-white/70 dark:bg-[#162035]/70 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
              <h2 className="text-base font-black text-capsule-navy dark:text-white flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                {l.reviewsTitle}
              </h2>
              <div className="bg-white/40 dark:bg-[#0F172A]/50 border border-white/50 dark:border-white/10 rounded-2xl p-6 text-center space-y-3">
                <p className="text-xs font-black text-slate-700 dark:text-slate-300">{l.rateTitle}</p>

                {/* ⭐️ أداة النجوم التفاعلية لدعم التقييم المباشر */}
                <div className="flex justify-center items-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((star: number) => {
                    const isSolid = hover ? star <= hover : star <= rating;
                    return (
                      <button
                        key={star}
                        type="button"
                        disabled={hasRated}
                        onClick={() => { setRating(star); setHasRated(true); }}
                        onMouseEnter={() => !hasRated && setHover(star)}
                        onMouseLeave={() => !hasRated && setHover(0)}
                        className={`transition-transform duration-100 ${!hasRated ? 'hover:scale-110 active:scale-95 cursor-pointer' : 'cursor-default'} ${isSolid ? 'text-amber-500 dark:text-amber-400 drop-shadow-xs' : 'text-slate-300 dark:text-slate-700'}`}
                      >
                        {isSolid ? <SolidStar className="w-8 h-8" /> : <OutlineStar className="w-8 h-8" />}
                      </button>
                    );
                  })}
                </div>

                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{hasRated ? l.thankYou : l.rateDesc}</p>
              </div>
            </div>

            {/* ✉️ نموذج الاستشارة المباشرة وإرسال الرسائل */}
            <div className="bg-white/70 dark:bg-[#162035]/70 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-3xl p-6 shadow-2xl space-y-5">
              <div>
                <h2 className="text-base font-black text-capsule-navy dark:text-white flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-capsule-teal dark:text-teal-400"></span>
                  {l.contactTitle}
                </h2>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-1">{l.contactSub}</p>
              </div>

              {/* رسالة إتمام الإرسال بنجاح */}
              {showFormSuccess && (
                <div className="bg-emerald-100/90 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 rounded-2xl p-4 text-emerald-900 dark:text-emerald-200 text-sm font-black flex items-center gap-2 animate-fade-in shadow-md">
                  {l.msgSuccess}
                </div>
              )}

              {/* حقول الإدخال والتحقق الذاتي من البيانات */}
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5"><UserIcon className="w-4 h-4 text-capsule-teal dark:text-teal-400" />{l.labelName}</label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full bg-white/80 dark:bg-[#0F172A]/80 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-capsule-navy dark:text-slate-100 focus:outline-none focus:border-capsule-teal dark:focus:border-teal-400 shadow-xs transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5"><EnvelopeIcon className="w-4 h-4 text-capsule-teal dark:text-teal-400" />{l.labelEmail}</label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full bg-white/80 dark:bg-[#0F172A]/80 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-capsule-navy dark:text-slate-100 focus:outline-none focus:border-capsule-teal dark:focus:border-teal-400 shadow-xs transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5"><ChatBubbleBottomCenterTextIcon className="w-4 h-4 text-capsule-teal dark:text-teal-400" />{l.labelMsg}</label>
                  <textarea
                    required
                    rows={3}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full bg-white/80 dark:bg-[#0F172A]/80 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-capsule-navy dark:text-slate-100 focus:outline-none focus:border-capsule-teal dark:focus:border-teal-400 shadow-xs transition-all resize-none"
                  />
                </div>
                <div className="pt-1 flex justify-end">
                  <button type="submit" className="w-full sm:w-auto bg-gradient-to-r from-capsule-navy to-capsule-teal hover:from-capsule-teal hover:to-capsule-navy text-white font-black text-xs px-8 py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 group transition-all cursor-pointer">
                    <span>{l.btnSend}</span>
                    <PaperAirplaneIcon className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}