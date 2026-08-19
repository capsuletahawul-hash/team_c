import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from "react-router-dom";
import { useLanguage } from '../context/LanguageContext'; // 🔄 سياق اللغة للتحويل الفوري وتجنب الشاشة البيضاء
import { useAuth } from '../context/AuthContext';
import StudentNavbar from "../components/StudentNavbar";
import TrainerNavbar from "../components/TrainerNavbar";
import Footer from '../components/Footer';
import {
  ChevronDownIcon, PlayIcon, DocumentTextIcon, CodeBracketSquareIcon,
  ClockIcon, VideoCameraIcon, AcademicCapIcon, CodeBracketIcon, CpuChipIcon, ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { StarIcon, CalendarDaysIcon, ChartBarIcon, LanguageIcon, UsersIcon, CheckCircleIcon, SparklesIcon, CheckIcon } from '@heroicons/react/24/solid';
import { getCourseDetails } from "../mocks/mockApi";

// ==========================================
// 🛠️ الأنواع والـ Interfaces لضمان كتابة كود TypeScript سليم وآمن (No Any)
// ==========================================
interface UIStrings {
  loading: string; notFound: string; backToCourses: string; metaUpdated: string; metaLevel: string;
  metaLanguage: string; statsDuration: string; statsStudents: string; statsRating: string; statsPrice: string;
  free: string; overviewTitle: string; curriculumTitle: string; curriculumSubtitle: string; expandAll: string;
  collapseAll: string; lessons: string; instructorTitle: string; verifiedExpert: string; requirementsTitle: string;
  requirementsSubtitle: string; enrollBtn: string; priceLabel: string; ratingReviews: string;
}

interface Topic { name?: string; nameAr?: string; nameEn?: string; duration?: string; durationAr?: string; durationEn?: string; type?: string; }
interface CurriculumModule { id: string | number; week?: string; weekAr?: string; weekEn?: string; title?: string; titleAr?: string; titleEn?: string; duration?: string; durationAr?: string; durationEn?: string; topics: Topic[]; }
interface InstructorProfile { role?: string; roleAr?: string; roleEn?: string; bio?: string; bioAr?: string; bioEn?: string; avatarLabel?: string; ratingText?: string; ratingTextAr?: string; ratingTextEn?: string; studentsText?: string; studentsTextAr?: string; studentsTextEn?: string; skills?: string[]; skillsAr?: string[]; skillsEn?: string[]; }
interface RequirementItem { id: string | number; type: string; title?: string; titleAr?: string; titleEn?: string; desc?: string; descAr?: string; descEn?: string; }
interface EnrollmentInfo { features?: string[]; featuresAr?: string[]; featuresEn?: string[]; timer?: string; timerAr?: string; timerEn?: string; }

interface CourseRawData {
  id: string | number; title?: string; titleAr?: string; titleEn?: string; category?: string; categoryAr?: string; categoryEn?: string;
  description?: string; descriptionAr?: string; descriptionEn?: string; subtitle?: string; subtitleAr?: string; subtitleEn?: string;
  instructor?: string; instructorAr?: string; instructorEn?: string; level?: string; levelAr?: string; levelEn?: string;
  language?: string; languageAr?: string; languageEn?: string; duration?: string; durationAr?: string; durationEn?: string;
  updated?: string; updatedAr?: string; updatedEn?: string; outcomes?: string[]; outcomesAr?: string[]; outcomesEn?: string[];
  rating?: number; price?: number; originalPrice?: number; discount?: string; students?: number; status?: string;
  instructorProfile?: InstructorProfile; requirements?: RequirementItem[]; curriculum?: CurriculumModule[]; enrollment?: EnrollmentInfo;
}

interface TranslatedCourse {
  id: string | number; title: string; category: string; description: string; subtitle: string; instructor: string;
  level: string; language: string; duration: string; updated: string; outcomes: string[]; rating?: number;
  price?: number; originalPrice?: number; discount?: string; students?: number; status?: string;
  instructorProfile: { role: string; bio: string; avatarLabel: string; ratingText: string; studentsText: string; skills: string[]; } | null;
  requirements: { id: string | number; type: string; title: string; desc: string; }[];
  curriculum: { id: string | number; week: string; title: string; duration: string; topics: { name: string; duration: string; type?: string; }[]; }[];
  enrollment: { features: string[]; timer: string; } | null;
}

// ==========================================
// 🗺️ نصوص الواجهة المترجمة (عربي / إنجليزي) لمنع وميض الشاشة أثناء التحميل
// ==========================================
const uiText: Record<'ar' | 'en', UIStrings> = {
  ar: { loading: 'جاري تحميل تفاصيل الدورة...', notFound: 'لم يتم العثور على هذه الدورة.', backToCourses: 'الرجوع إلى الدورات', metaUpdated: 'آخر تحديث', metaLevel: 'المستوى', metaLanguage: 'لغة التدريس', statsDuration: 'مدة الدورة', statsStudents: 'الطلاب المسجلون', statsRating: 'تقييم الدورة', statsPrice: 'السعر', free: 'مجاني', overviewTitle: 'ماذا ستتعلم', curriculumTitle: 'منهج الدورة', curriculumSubtitle: 'استكشف خارطة الطريق الكاملة لهذه الدورة أسبوعاً بأسبوع.', expandAll: 'توسيع الكل', collapseAll: 'إغلاق الكل', lessons: 'دروس', instructorTitle: 'تعرّف على المدرب', verifiedExpert: 'مدرّب معتمد', requirementsTitle: 'المتطلبات المسبقة', requirementsSubtitle: 'يرجى مراجعة المتطلبات التالية قبل الانضمام للدورة.', enrollBtn: 'احجز مقعدك الآن', priceLabel: 'السعر الحالي', ratingReviews: 'تقييم عام للدورة' },
  en: { loading: 'Loading course details...', notFound: 'This course could not be found.', backToCourses: 'Back to Courses', metaUpdated: 'Last updated', metaLevel: 'Level', metaLanguage: 'Language', statsDuration: 'Duration', statsStudents: 'Enrolled Students', statsRating: 'Course Rating', statsPrice: 'Price', free: 'Free', overviewTitle: 'What You Will Learn', curriculumTitle: 'Course Curriculum', curriculumSubtitle: 'Explore the full week-by-week roadmap for this course.', expandAll: 'Expand All', collapseAll: 'Collapse All', lessons: 'Lessons', instructorTitle: 'Meet Your Instructor', verifiedExpert: 'Verified Expert', requirementsTitle: 'Prerequisites', requirementsSubtitle: 'Please review the following requirements before joining.', enrollBtn: 'Secure Your Spot', priceLabel: 'Current Price', ratingReviews: 'Overall Course Rating' }
};

// ==========================================
// 🚀 المكون الأساسي لصفحة تفاصيل الكورس
// ==========================================
export default function CourseDetails() {
  const { id } = useParams<{ id: string }>();
  const { lang } = useLanguage() as { lang: 'ar' | 'en' };
  const { role } = useAuth();
  const ui = uiText[lang] || uiText['ar'];
  
  // 💾 إدارة حالة البيانات وحالة الاتصال بالسيرفر
  const [rawData, setRawData] = useState<CourseRawData | null>(null);
  const [course, setCourse] = useState<TranslatedCourse | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'not_found'>('loading');

  // 🛰️ تأثير جلب بيانات الكورس من الـ API عند تحميل الصفحة
  useEffect(() => {
    let isMounted = true;
    async function loadCourse() {
      if (!id) return;
      setStatus('loading');
      try {
        // 🛰️ نحاول أول شي نجيب الكورس من الباك اند الحقيقي (كورسات التراينر المعتمدة)
        const backendResponse = await fetch(`http://localhost:5000/api/courses/public/${id}`);
        if (backendResponse.ok) {
          const backendData = await backendResponse.json();
          if (isMounted && backendData?.success) {
            setRawData(backendData.course as CourseRawData);
            setStatus('success');
            return;
          }
        }
      } catch {
        // تجاهل الخطأ وكمل على بيانات الموك بالأسفل
      }

      try {
        const response = await getCourseDetails(id) as { success: boolean; data: CourseRawData };
        if (!isMounted) return;
        if (response?.success) { setRawData(response.data); setStatus('success'); }
        else { setRawData(null); setStatus('not_found'); }
      } catch {
        if (isMounted) { setRawData(null); setStatus('not_found'); }
      }
    }
    loadCourse();
    return () => { isMounted = false; };
  }, [id]);

  // 🔄 تأثير معالجة اللغات (عربي / إنجليزي) وتصفية البيانات فور تغير اللغة
  useEffect(() => {
    if (rawData) {
      const isAr = lang === 'ar';
      const getVal = (arVal?: string, enVal?: string, fallback?: string): string => isAr ? (arVal || fallback || '') : (enVal || fallback || '');
      setCourse({
        id: rawData.id, rating: rawData.rating, price: rawData.price, originalPrice: rawData.originalPrice, discount: rawData.discount, students: rawData.students, status: rawData.status,
        title: getVal(rawData.titleAr, rawData.titleEn, rawData.title),
        category: getVal(rawData.categoryAr, rawData.categoryEn, rawData.category),
        description: getVal(rawData.descriptionAr, rawData.descriptionEn, rawData.description),
        subtitle: getVal(rawData.subtitleAr, rawData.subtitleEn, rawData.subtitle),
        instructor: getVal(rawData.instructorAr, rawData.instructorEn, rawData.instructor),
        level: getVal(rawData.levelAr, rawData.levelEn, rawData.level),
        language: getVal(rawData.languageAr, rawData.languageEn, rawData.language),
        duration: getVal(rawData.durationAr, rawData.durationEn, rawData.duration),
        updated: getVal(rawData.updatedAr, rawData.updatedEn, rawData.updated),
        outcomes: isAr ? (rawData.outcomesAr || rawData.outcomes || []) : (rawData.outcomesEn || rawData.outcomes || []),
        instructorProfile: rawData.instructorProfile ? {
          role: getVal(rawData.instructorProfile.roleAr, rawData.instructorProfile.roleEn, rawData.instructorProfile.role),
          bio: getVal(rawData.instructorProfile.bioAr, rawData.instructorProfile.bioEn, rawData.instructorProfile.bio),
          avatarLabel: rawData.instructorProfile.avatarLabel || "",
          ratingText: getVal(rawData.instructorProfile.ratingTextAr, rawData.instructorProfile.ratingTextEn, rawData.instructorProfile.ratingText),
          studentsText: getVal(rawData.instructorProfile.studentsTextAr, rawData.instructorProfile.studentsTextEn, rawData.instructorProfile.studentsText),
          skills: isAr ? (rawData.instructorProfile.skillsAr || rawData.instructorProfile.skills || []) : (rawData.instructorProfile.skillsEn || rawData.instructorProfile.skills || [])
        } : null,
        requirements: (rawData.requirements || []).map(req => ({ id: req.id, type: req.type, title: getVal(req.titleAr, req.titleEn, req.title), desc: getVal(req.descAr, req.descEn, req.desc) })),
        curriculum: (rawData.curriculum || []).map(curr => ({
          id: curr.id, week: getVal(curr.weekAr, curr.weekEn, curr.week), title: getVal(curr.titleAr, curr.titleEn, curr.title), duration: getVal(curr.durationAr, curr.durationEn, curr.duration),
          topics: (curr.topics || []).map(t => ({ type: t.type, name: getVal(t.nameAr, t.nameEn, t.name), duration: getVal(t.durationAr, t.durationEn, t.duration) }))
        })),
        enrollment: rawData.enrollment ? { features: isAr ? (rawData.enrollment.featuresAr || rawData.enrollment.features || []) : (rawData.enrollment.featuresEn || rawData.enrollment.features || []), timer: getVal(rawData.enrollment.timerAr, rawData.enrollment.timerEn, rawData.enrollment.timer) } : null
      });
    }
  }, [rawData, lang]);

  const isRTL = lang === 'ar';

  // 🛡️ معالجة الخطأ وحالة عدم وجود الكورس لحماية واجهة المستخدم من الانهيار
  if (status === 'not_found') {
    return (
      <div className="min-h-screen bg-capsule-bg flex flex-col font-sans">
        {role === 'trainer' ? (
          <TrainerNavbar activePage="learn" />
        ) : (
          <StudentNavbar activePage="courses" />
        )}
        <main className="flex-grow flex flex-col items-center justify-center gap-4 p-10 text-center" dir={isRTL ? 'rtl' : 'ltr'}>
          <p className="text-lg font-bold text-capsule-navy">{ui.notFound}</p>
          <Link to="/courses-overview" className="text-capsule-teal font-semibold underline">{ui.backToCourses}</Link>
        </main>
        <Footer />
      </div>
    );
  }

  // ✨ بناء هيكل الصفحة الرئيسي وتقسيمها لجزئين (المحتوى + بطاقة الدفع الجانبية)
  return (
    <div className="min-h-screen bg-capsule-bg flex flex-col font-sans transition-colors duration-300" dir={isRTL ? 'rtl' : 'ltr'}>
      {role === 'trainer' ? (
        <TrainerNavbar activePage="learn" />
      ) : (
        <StudentNavbar activePage="courses" />
      )}
      <main className="flex-grow">
        {status === 'loading' ? (
          <>
            <CourseHeroSkeleton />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="space-y-2">
                        <div className="skeleton-shimmer h-3 w-16 rounded-md" />
                        <div className="skeleton-shimmer h-6 w-20 rounded-md" />
                      </div>
                    ))}
                  </div>
                  <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                    <div className="skeleton-shimmer h-6 w-40 rounded-md" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="skeleton-shimmer h-5 w-full rounded-lg" />
                      ))}
                    </div>
                  </div>
                  <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                    <div className="skeleton-shimmer h-6 w-48 rounded-md" />
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="skeleton-shimmer h-16 w-full rounded-2xl" />
                    ))}
                  </div>
                </div>
                <div className="lg:sticky lg:top-24">
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl space-y-6">
                    <div className="skeleton-shimmer h-40 w-full rounded-2xl" />
                    <div className="skeleton-shimmer h-8 w-28 rounded-md" />
                    <div className="skeleton-shimmer h-12 w-full rounded-xl" />
                    <div className="space-y-2 pt-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="skeleton-shimmer h-4 w-full rounded-md" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <CourseHero lang={lang} ui={ui} course={course} />
            {course && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  <div className="lg:col-span-2 space-y-8">
                    <CourseStats ui={ui} course={course} />
                    <CourseOverview ui={ui} course={course} />
                    <CourseCurriculum ui={ui} course={course} />
                    <CourseInstructor ui={ui} course={course} />
                    <CourseRequirements ui={ui} course={course} />
                  </div>
                  <div className="lg:sticky lg:top-24"><EnrollmentCard ui={ui} course={course} isRTL={isRTL} /></div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

function CourseHeroSkeleton() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#164961] via-[#1a5570] to-[#2B636B] py-16 lg:py-24 text-white">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl space-y-5">
        <div className="skeleton-shimmer h-6 w-28 rounded-full bg-white/20" />
        <div className="skeleton-shimmer h-10 w-3/4 rounded-xl bg-white/20" />
        <div className="skeleton-shimmer h-6 w-5/6 rounded-lg bg-white/20" />
        <div className="flex items-center gap-3 pt-6 border-t border-white/10">
          <div className="skeleton-shimmer h-12 w-36 rounded-xl bg-white/20" />
          <div className="skeleton-shimmer h-12 w-36 rounded-xl bg-white/20" />
          <div className="skeleton-shimmer h-12 w-36 rounded-xl bg-white/20" />
        </div>
      </div>
    </section>
  );
}

// ==========================================
// 🎨 مكون الـ Hero (رأس الصفحة والبيانات الأساسية)
// ==========================================
function CourseHero({ ui, course }: { lang: 'ar' | 'en'; ui: UIStrings; course: TranslatedCourse | null }) {
  if (!course) return null;
  const ratingRounded = Math.round(course.rating || 0);
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#164961] via-[#1a5570] to-[#2B636B] py-16 lg:py-24 text-white">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none"><div className="absolute -top-40 -right-45 w-96 h-96 rounded-full bg-[#FFD369] opacity-15 blur-[100px]" /></div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <div className="inline-block px-3 py-1.5 mb-6 rounded-full text-xs font-semibold bg-white/10 text-[#FFD369] border border-white/10">{course.category}</div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight">{course.title}</h1>
        <p className="text-base sm:text-lg text-white/85 mb-6 leading-relaxed">{course.subtitle || course.description}</p>
        <div className="flex items-center gap-2 mb-8 bg-black/15 p-2 rounded-xl inline-flex border border-white/5">
          <div className="flex items-center text-[#FFD369]">{[...Array(5)].map((_, i) => <StarIcon key={i} className={`w-5 h-5 ${i < ratingRounded ? '' : 'opacity-30'}`} />)}</div>
          <span className="text-sm font-medium px-1">{course.rating ? `${course.rating} (${ui.ratingReviews})` : ui.ratingReviews}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10">
          {[
            { label: ui.metaUpdated, val: course.updated || '—', icon: CalendarDaysIcon },
            { label: ui.metaLevel, val: course.level || '—', icon: ChartBarIcon },
            { label: ui.metaLanguage, val: course.language || '—', icon: LanguageIcon }
          ].map((m, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
              <div className="p-2 rounded-lg bg-[#387B84]/40 text-[#FFD369]"><m.icon className="w-5 h-5" /></div>
              <div className="flex flex-col"><span className="text-xs text-white/60">{m.label}</span><span className="text-sm font-medium">{m.val}</span></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==========================================
// 📊 مكون الإحصائيات السريعة (المدة، عدد الطلاب، التقييم، السعر)
// ==========================================
function CourseStats({ ui, course }: { ui: UIStrings; course: TranslatedCourse }) {
  const cards = [
    { key: 'duration', label: ui.statsDuration, val: course.duration || '—', icon: ClockIcon, color: 'from-cyan-500 to-blue-600', bg: 'bg-cyan-50', text: 'text-cyan-600' },
    { key: 'students', label: ui.statsStudents, val: course.students ?? 0, icon: UsersIcon, color: 'from-purple-500 to-indigo-600', bg: 'bg-purple-50', text: 'text-purple-600' },
    { key: 'rating', label: ui.statsRating, val: course.rating ? course.rating : '—', icon: AcademicCapIcon, color: 'from-emerald-400 to-teal-600', bg: 'bg-emerald-50', text: 'text-emerald-600' },
    { key: 'price', label: ui.statsPrice, val: course.price === 0 ? ui.free : course.price, icon: VideoCameraIcon, color: 'from-amber-400 to-orange-500', bg: 'bg-amber-50', text: 'text-amber-600' }
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((cfg) => (
        <div key={cfg.key} className="group relative bg-white dark:bg-[#162035]/80 backdrop-blur-xl p-5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-md overflow-hidden transform hover:-translate-y-1 transition-all">
          <div className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${cfg.color}`} />
          <div className={`p-3 rounded-xl inline-block ${cfg.bg} dark:bg-slate-800 ${cfg.text}`}><cfg.icon className="w-6 h-6 stroke-[2]" /></div>
          <div className="space-y-1 mt-4">
            <h3 className={`text-xl font-black bg-gradient-to-r ${cfg.color} bg-clip-text text-transparent`}>{cfg.val}</h3>
            <p className="text-xs font-semibold text-gray-600 dark:text-slate-200 leading-snug">{cfg.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ==========================================
// 💡 مكون نظرة عامة على الكورس ومخرجات التعلم
// ==========================================
function CourseOverview({ ui, course }: { ui: UIStrings; course: TranslatedCourse }) {
  const outcomes = course.outcomes || [];
  if (outcomes.length === 0) return null;
  return (
    <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-md relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-capsule-teal to-cyan-500" />
      <div className="space-y-3 mb-8">
        <h2 className="text-xl font-black text-capsule-navy flex items-center gap-3"><span className="w-2.5 h-6 rounded-full bg-gradient-to-b from-capsule-teal to-cyan-600" />{ui.overviewTitle}</h2>
        <p className="text-sm text-capsule-navy/75 leading-relaxed">{course.description}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {outcomes.map((outcome, idx) => (
          <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-capsule-bg/40 to-white border border-gray-50 hover:border-capsule-teal/20 transition-all group">
            <CheckCircleIcon className="w-6 h-6 text-capsule-teal group-hover:scale-110 transition-transform flex-shrink-0" />
            <p className="text-sm font-semibold text-capsule-navy/85 leading-relaxed">{outcome}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ==========================================
// 📚 مكون المنهج الدراسي وتفاصيل المحاضرات (أكورديون)
// ==========================================
function CourseCurriculum({ ui, course }: { ui: UIStrings; course: TranslatedCourse }) {
  const modules = course.curriculum || [];
  const [expanded, setExpanded] = useState<(string | number)[]>([]);
  useEffect(() => { if (modules.length && expanded.length === 0) setExpanded([modules[0].id]); }, [modules, expanded.length]);
  if (modules.length === 0) return null;
  return (
    <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-md relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 to-capsule-teal" />
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-black text-capsule-navy flex items-center gap-3"><span className="w-2.5 h-6 rounded-full bg-gradient-to-b from-purple-500 to-indigo-600" />{ui.curriculumTitle}</h2>
          <p className="text-sm text-capsule-navy/70 mt-1">{ui.curriculumSubtitle}</p>
        </div>
        <div className="flex gap-3 text-xs font-bold self-start">
          <button onClick={() => setExpanded(modules.map(m => m.id))} className="text-capsule-teal bg-capsule-bg px-3 py-1.5 rounded-lg">{ui.expandAll}</button>
          <button onClick={() => setExpanded([])} className="text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg">{ui.collapseAll}</button>
        </div>
      </div>
      <div className="space-y-4">
        {modules.map((module) => {
          const isOpen = expanded.includes(module.id);
          return (
            <div key={module.id} className={`border rounded-xl transition-all ${isOpen ? 'border-capsule-teal/30 bg-capsule-bg/20' : 'border-gray-100'}`}>
              <button onClick={() => setExpanded(isOpen ? expanded.filter(id => id !== module.id) : [...expanded, module.id])} className="w-full flex items-center justify-between p-4 text-start">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <span className="px-2.5 py-1 text-xs font-bold text-white rounded-md bg-gradient-to-r from-capsule-navy to-[#1a5570]">{module.week}</span>
                  <h3 className="text-sm font-bold text-capsule-navy">{module.title}</h3>
                </div>
                <div className="flex items-center gap-3 ml-4 mr-4">
                  <span className="hidden sm:inline-block text-xs text-capsule-navy/60 bg-white border border-gray-100 px-2 py-0.5 rounded-md">{module.topics.length} {ui.lessons} • {module.duration}</span>
                  <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'transform rotate-180 text-capsule-teal' : ''}`} />
                </div>
              </button>
              <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-[1000px] border-t border-gray-100/70' : 'max-h-0'}`}>
                <div className="p-4 space-y-3 bg-white/60">
                  {module.topics.map((topic, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-50 shadow-xs">
                      <div className="flex items-center gap-3">
                        {topic.type === 'video' ? <PlayIcon className="w-4 h-4 text-cyan-500" /> : topic.type === 'code' ? <CodeBracketSquareIcon className="w-4 h-4 text-amber-500" /> : <DocumentTextIcon className="w-4 h-4 text-purple-500" />}
                        <span className="text-xs sm:text-sm text-capsule-navy/90">{topic.name}</span>
                      </div>
                      <span className="text-xs font-bold text-gray-400">{topic.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ==========================================
// 👨‍🏫 مكون المدرب (الخبرات، المهارات والسيرة الذاتية)
// ==========================================
function CourseInstructor({ ui, course }: { ui: UIStrings; course: TranslatedCourse }) {
  const profile = course.instructorProfile;
  if (!profile) return null;
  return (
    <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-md relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
      <h2 className="text-xl font-black text-capsule-navy flex items-center gap-3 mb-8"><span className="w-2.5 h-6 rounded-full bg-gradient-to-b from-amber-400 to-orange-500" />{ui.instructorTitle}</h2>
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-capsule-teal to-purple-600 shadow-lg">
            <div className="w-full h-full rounded-full bg-white p-1 flex items-center justify-center overflow-hidden">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400 font-bold text-3xl">
                {profile.avatarLabel || (course.instructor ? course.instructor.slice(0, 2).toUpperCase() : '')}
              </div>
            </div>
          </div>
          <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />{ui.verifiedExpert}</span>
        </div>
        <div className="flex-grow text-center md:text-start space-y-4">
          <div><h3 className="text-xl font-black text-capsule-navy">{course.instructor}</h3><p className="text-sm font-bold text-capsule-teal">{profile.role}</p></div>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 text-xs font-bold text-gray-500">
            <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg border">{profile.ratingText}</div>
            <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg border">{profile.studentsText}</div>
          </div>
          <p className="text-sm text-capsule-navy/75 leading-relaxed">{profile.bio}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
            {(profile.skills || []).map((s, i) => <span key={i} className="px-2.5 py-1 rounded-xl text-xs font-bold bg-gray-50 border text-gray-600">#{s}</span>)}
          </div>
        </div>
      </div>
    </section>
  );
}

// ==========================================
// 🛡️ مكون المتطلبات التقنية والمسبقة قبل البدء
// ==========================================
function CourseRequirements({ ui, course }: { ui: UIStrings; course: TranslatedCourse }) {
  const items = course.requirements || [];
  const icons: Record<string, React.ComponentType<{ className?: string }>> = { code: CodeBracketIcon, cpu: CpuChipIcon, shield: ShieldCheckIcon };
  if (items.length === 0) return null;
  return (
    <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-md relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-400 to-purple-500" />
      <div className="mb-8"><h2 className="text-xl font-black text-capsule-navy flex items-center gap-3"><span className="w-2.5 h-6 rounded-full bg-gradient-to-b from-cyan-500 to-purple-600" />{ui.requirementsTitle}</h2><p className="text-sm text-capsule-navy/70 mt-1">{ui.requirementsSubtitle}</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item) => {
          const Comp = icons[item.type] || ShieldCheckIcon;
          return (
            <div key={item.id} className="p-5 rounded-2xl border bg-white shadow-xs hover:-translate-y-1 transition-all border-gray-100">
              <div className="p-3 rounded-xl inline-block mb-4 bg-capsule-bg text-capsule-teal"><Comp className="w-6 h-6 stroke-[2]" /></div>
              <h3 className="text-base font-extrabold text-capsule-navy mb-2">{item.title}</h3>
              <p className="text-xs font-medium text-capsule-navy/70 leading-relaxed">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ==========================================
// ⚡ بطاقة الدفع أو التسجيل الجانبية (Enrollment Card)
// ==========================================
function EnrollmentCard({ ui, course, isRTL }: { ui: UIStrings; course: TranslatedCourse; isRTL: boolean }) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth(); // Check real authentication state
  const enrollment = course.enrollment || { features: [], timer: "" };
  const isFree = course.price === 0;

  // Handles click behavior based on authentication
  const handleAction = (): void => {
    if (!isAuthenticated) {
      // If user is not logged in, send them to sign up
      navigate('/sign-up');
      return;
    }

    // If logged in, proceed to cart/checkout flow
    const currentCart: { id: string | number; title: string; category: string; duration: string; price: number; }[] = JSON.parse(localStorage.getItem('cartItems') || '[]');
    const newCourse = { id: course.id || id || Date.now(), title: course.title, category: course.category, duration: course.duration || '—', price: course.price || 0 };
    if (!currentCart.some(item => item.id === newCourse.id)) {
      currentCart.push(newCourse);
      localStorage.setItem('cartItems', JSON.stringify(currentCart));
    }
    navigate('/cart');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-6 relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* عرض تفاصيل السعر والخصومات الحالية */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-3xl font-black text-capsule-navy">{isFree ? ui.free : course.price}</h3>
          {course.originalPrice && course.originalPrice > (course.price || 0) && <span className="text-sm font-bold text-gray-400 line-through">{course.originalPrice}</span>}
          {course.discount && <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-md">{course.discount}</span>}
        </div>
        <h4 className="text-lg font-bold text-capsule-navy">{course.title}</h4>
      </div>
      
      {/* قائمة الميزات والشهادات التي يحصل عليها الطالب */}
      <ul className="space-y-4 mb-8">
        {(enrollment.features || []).map((f, idx) => <li key={idx} className="flex items-center gap-3 text-sm font-semibold text-capsule-navy/80"><CheckIcon className="w-5 h-5 text-capsule-teal" />{f}</li>)}
      </ul>
      
      {/* Dynamic button: Shows "Sign Up Now" if logged out, or "Secure Your Spot" if logged in */}
      <button 
        onClick={handleAction} 
        disabled={course.status === 'coming_soon' || course.status === 'completed'} 
        className="w-full bg-gradient-to-r from-capsule-navy to-[#2B636B] text-white font-black py-4 rounded-xl shadow-lg hover:-translate-y-0.5 transition-all mb-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <SparklesIcon className="w-5 h-5 text-amber-400" />
        {isAuthenticated ? ui.enrollBtn : (isRTL ? 'سجل الآن مجاناً' : 'Sign Up Now')}
      </button>
      
      {/* مؤقت العرض والتحذير قبل انتهاء الخصم */}
      {enrollment.timer && <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-500 bg-gray-50 p-3 rounded-lg border"><ClockIcon className="w-4 h-4 text-purple-500" />{enrollment.timer}</div>}
    </div>
  );
}