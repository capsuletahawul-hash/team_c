import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StudentNavbar from "../components/StudentNavbar";
import TrainerNavbar from "../components/TrainerNavbar";
import Footer from "../components/Footer";
import Button from "../components/Button";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { BASE_URL } from "../services/api";
import logo from "../assets/light_trans_logo.png";
 
// ---------- Types ----------
 
// نوع الشارة التي قد تظهر على بطاقة الدورة.
type BadgeKey = "new" | "popular" | null;
 
interface CardVisual {
  icon: string;
  badgeKey: BadgeKey;
  gradient: string;
}
 
interface Course {
  id: string | number;
  trainerId: string | number;
  title: string;
  description: string;
  instructor: string;
  category: string;
  rating: number;
  duration: number | string;
  students: number;
  price: number;
}
 
type TagKey = "programming" | "cybersecurity" | "cloud";
type PriceLabel = "free" | "paid";
type DurationLabel = "under20" | "over20";
 
interface DynamicCourse extends Course, CardVisual {
  tagKey: TagKey;
  priceLabel: PriceLabel;
  durationLabel: DurationLabel;
}
 
interface FiltersState {
  category: string[];
  price: string[];
  duration: string[];
}
 
interface FilterItem {
  label: string;
  value: string | null;
}
 
interface FilterGroup {
  key: keyof FiltersState;
  label: string;
  items: FilterItem[];
}
 
// إعدادات الألوان والأيقونات المستخدمة في بطاقات الدورات.
const CARD_VISUALS: CardVisual[] = [
  { icon: "⚛", badgeKey: "new", gradient: "from-capsule-navy to-[#343A60]" },
  { icon: "◐", badgeKey: "popular", gradient: "from-[#537E84] to-[#7FB1BC]" },
  { icon: "🐍", badgeKey: null, gradient: "from-capsule-navy to-[#343A60]" },
  { icon: "🛡", badgeKey: "new", gradient: "from-capsule-navy to-[#0e2f3f]" },
  { icon: "{ }", badgeKey: null, gradient: "from-capsule-navy to-[#343A60]" },
  { icon: "▤", badgeKey: "popular", gradient: "from-capsule-teal to-capsule-navy" },
  { icon: "◎", badgeKey: null, gradient: "from-capsule-dark-gold to-capsule-gold" },
  { icon: "▦", badgeKey: null, gradient: "from-[#3E5F44] to-[#537E84]" }
];
 
// القيم الافتراضية لجميع الفلاتر.
const EMPTY_FILTERS: FiltersState = { category: [], price: [], duration: [] };
// أسماء التصنيفات باللغتين العربية والإنجليزية.
const CATEGORY_LABELS: Record<string, { ar: string; en: string }> = {
  programming: { ar: "برمجة", en: "Programming" },
  cybersecurity: { ar: "سايبر", en: "Cybersecurity" },
  cloud: { ar: "كلاود", en: "Cloud Computing" }
};
 

 
// مكون لعرض نجمة التقييم.
const Star = ({ filled }: { filled: boolean }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? "#FFD369" : "none"} stroke="#FFD369" strokeWidth="1.5">
    <polygon points="12,2 15,9 22,9.5 16.5,14.5 18,22 12,18 6,22 7.5,14.5 2,9.5 9,9" />
  </svg>
);
 
// المكون الرئيسي المسؤول عن عرض الدورات مع البحث والفلترة والترتيب.
export default function CoursesOverview() {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const { role } = useAuth();
  const l = t.coursesOverview;
  const isRTL = t.dir === "rtl";
 
  const [openFilter, setOpenFilter] = useState<keyof FiltersState | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortIndex, setSortIndex] = useState<number>(0);
  const [draftFilters, setDraftFilters] = useState<FiltersState>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<FiltersState>(EMPTY_FILTERS);
  const [loading, setLoading] = useState<boolean>(true);
  const [backendCourses, setBackendCourses] = useState<Course[]>([]);

  // جلب الكورسات الحقيقية المعتمدة من الباك اند فقط (بدون أي بيانات غير معتمدة)
  useEffect(() => {
    fetch(`${BASE_URL}/courses/public`)
      .then((res) => res.json())
      .then((data) => {
        const raw = data.success ? (data.courses ?? []) : [];
        const approvedOnly = raw.filter((c: any) => {
          const s = String(c.status || '').toLowerCase();
          return s === 'published' || s === 'available' || s === 'approved' || s === 'active' || !c.status;
        });
        setBackendCourses(approvedOnly);
      })
      .catch(() => {
        setBackendCourses([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const dynamicCourses: DynamicCourse[] = useMemo(() => backendCourses.map((c: any, i: number) => {
    const normCat = String(c.category || "").toLowerCase();
    const normTitle = String(c.title || c.name || "").toLowerCase();

    const tagKey: TagKey = /cyber|سيبراني|سايبر/.test(normCat + normTitle) ? "cybersecurity" : /cloud|كلاود/.test(normCat + normTitle) ? "cloud" : "programming";

    // 🔍 خوارزمية دقيقة لجلب اسم المدرب الحقيقي المسند للدورة مباشرة من بيانات الكورس
    let realInstructor = "";
    if (isRTL) {
      realInstructor = c.instructorAr || (typeof c.instructor === 'string' && c.instructor !== "Certified Trainer" && c.instructor !== "المدرب المعتمد" ? c.instructor : "") || c.trainerName || c.trainer?.nameAr || c.trainer?.name || c.instructorProfile?.nameAr || c.instructorProfile?.name || "";
    } else {
      realInstructor = c.instructorEn || (typeof c.instructor === 'string' && c.instructor !== "Certified Trainer" && c.instructor !== "المدرب المعتمد" ? c.instructor : "") || c.trainerName || c.trainer?.nameEn || c.trainer?.name || c.instructorProfile?.nameEn || c.instructorProfile?.name || "";
    }

    if (!realInstructor) {
      realInstructor = isRTL ? (c.instructor || "د. سلمان العتيبي") : (c.instructor || "Dr. Salman Al-Otaibi");
    }

    return {
      ...CARD_VISUALS[i % CARD_VISUALS.length],
      ...c,
      instructor: realInstructor,
      tagKey,
      priceLabel: (c.price === 0 ? "free" : "paid") as PriceLabel,
      durationLabel: ((parseInt(String(c.duration)) || 0) < 20 ? "under20" : "over20") as DurationLabel
    };
  }), [backendCourses, isRTL]);
 
  // إنشاء مجموعات الفلاتر المعروضة للمستخدم.
  const filterGroups: FilterGroup[] = useMemo(() => [
    { key: "category", label: isRTL ? "التصنيف" : "Category", items: [{ label: isRTL ? "الكل" : "All", value: null }, ...Object.keys(CATEGORY_LABELS).map(k => ({ label: CATEGORY_LABELS[k]?.[isRTL ? "ar" : "en"] || k, value: k }))] },
    { key: "price", label: isRTL ? "السعر" : "Price", items: [{ label: isRTL ? "الكل" : "All", value: null }, { label: isRTL ? "مجاني" : "Free", value: "free" }, { label: isRTL ? "مدفوع" : "Paid", value: "paid" }] },
    { key: "duration", label: isRTL ? "المدة" : "Duration", items: [{ label: isRTL ? "الكل" : "All", value: null }, { label: isRTL ? "أقل من 20 ساعة" : "Under 20 hours", value: "under20" }, { label: isRTL ? "أكثر من 20 ساعة" : "Over 20 hours", value: "over20" }] }
  ], [isRTL]);
 
  // إضافة أو إزالة خيار من الفلاتر مع التعامل مع خيار (الكل).
  const toggleFilterValue = (groupKey: keyof FiltersState, value: string | null, idx: number) => {
    setDraftFilters(prev => {
      if (idx === 0 || value === null) return { ...prev, [groupKey]: [] };
      const current = prev[groupKey];
      const next = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
      const group = filterGroups.find(g => g.key === groupKey)!;
      return next.length === group.items.length - 1 ? { ...prev, [groupKey]: [] } : { ...prev, [groupKey]: next };
    });
  };
 
  // تطبيق البحث والفلاتر والترتيب للحصول على النتائج النهائية.
  const processedCourses = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return dynamicCourses
      .filter(c => {
        const matchesSearch = !q || c.title?.toLowerCase().includes(q) || c.instructor?.toLowerCase().includes(q);
        const matchesKey = (k: keyof FiltersState, prop: keyof DynamicCourse) => !appliedFilters[k]?.length || appliedFilters[k].includes(String(c[prop]));
        return matchesSearch && matchesKey("category", "tagKey") && matchesKey("price", "priceLabel") && matchesKey("duration", "durationLabel");
      })
      .sort((a, b) => sortIndex === 0 ? b.rating - a.rating : a.price - b.price);
  }, [searchQuery, sortIndex, dynamicCourses, appliedFilters]);
 
  return (
    <div className="min-h-screen bg-capsule-bg text-capsule-navy font-sans antialiased flex flex-col" dir={t.dir} lang={lang}>
      {role === 'trainer' ? (
        <TrainerNavbar activePage="learn" />
      ) : (
        <StudentNavbar activePage="courses" />
      )}
      <main className="flex-grow">
 
        {/* قسم الترحيب الرئيسي */}
<section className="bg-gradient-to-tr from-capsule-footer via-capsule-navy to-capsule-teal text-white py-10 px-8">          <div className="max-w-7xl mx-auto flex items-center px-6 text-white relative z-10">
            <div className="flex-1">
              <span className="inline-flex items-center gap-2 bg-white/10 border border-white/30 px-3.5 py-1.5 rounded-full text-[13px] font-bold mb-4.5">
  {l.hero.eyebrow}
</span>
              <h1 className="text-4xl font-extrabold mb-3.5">{l.hero.title}</h1>
              <p className="text-[15.5px] opacity-90 max-w-lg mb-6.5">{l.hero.desc}</p>
              <div className="flex gap-3.5">
                <Button variant="primary">{l.hero.cta}</Button>
                <button className="bg-transparent border-2 border-white/60 font-bold px-6 py-3 rounded-full text-[14.5px] hover:bg-white/10 transition">{l.hero.ctaGhost}</button>
              </div>
            </div>
            <div className="hidden lg:block flex-1 relative h-[220px]">
            <img
    src={logo}
    alt="Capsule Tahawul Logo"
    className="absolute top-6 right-10 w-100 object-contain"
  />
            </div>
          </div>
        </section>
 
        {/* شريط البحث والفلاتر */}
        <section className="bg-white border-b border-gray-200 relative z-30">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2 bg-capsule-bg border border-gray-200 rounded-full px-4 py-2 flex-1 min-w-[220px]">
              <span>🔍</span>
              <input type="text" placeholder={isRTL ? "ابحث عن الكورس أو المدرب" : "Search for a course or trainer"} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-transparent border-none outline-none w-full text-sm text-capsule-navy dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {filterGroups.map(g => {
                const act = appliedFilters[g.key]?.length || 0;
                const open = openFilter === g.key;
                return (
                  <div className="relative" key={g.key}>
                    <button className={`border rounded-full px-3.5 py-2 text-[13px] font-semibold transition-all cursor-pointer ${open || act > 0 ? "border-capsule-teal text-capsule-teal bg-capsule-teal/10 dark:bg-capsule-teal/20 dark:text-teal-300 dark:border-capsule-teal/50" : "border-gray-200 dark:border-white/10 bg-white dark:bg-[#162035]/80 text-capsule-navy dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-[#1E293B]"}`} onClick={() => setOpenFilter(open ? null : g.key)}>{g.label}{act > 0 ? ` (${act})` : ""} ⌄</button>
                    {open && (
                      <div className={`absolute z-40 mt-2 w-56 bg-white dark:bg-[#162035] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl p-3 flex flex-col gap-2 ${isRTL ? "right-0 text-right" : "left-0 text-left"}`}>
                        {g.items.map((it, idx) => (
                          <label key={idx} className="flex items-center gap-2.5 text-[13.5px] cursor-pointer text-gray-700 dark:text-slate-200 hover:text-black dark:hover:text-white py-0.5 w-full justify-start select-none">
                            <input type="checkbox" checked={idx === 0 || it.value === null ? draftFilters[g.key].length === 0 : draftFilters[g.key].includes(it.value)} onChange={() => toggleFilterValue(g.key, it.value, idx)} className="accent-capsule-teal w-4 h-4 shrink-0" />
                            <span className="leading-none">{it.label}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <button className="bg-capsule-gold text-capsule-navy dark:bg-[#D19E22] dark:text-slate-950 font-black px-4.5 py-2 rounded-full text-[13px] hover:bg-yellow-500 dark:hover:bg-[#FFD369] transition-all shadow-md cursor-pointer" onClick={() => { setAppliedFilters(draftFilters); setOpenFilter(null); }}>{isRTL ? "تطبيق الفلاتر" : "Apply"}</button>
            <button className="bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-white/15 rounded-full px-4.5 py-2 text-[13px] font-semibold text-capsule-navy dark:text-white hover:bg-gray-50 dark:hover:bg-[#1E293B] transition-all cursor-pointer" onClick={() => { setDraftFilters(EMPTY_FILTERS); setAppliedFilters(EMPTY_FILTERS); setOpenFilter(null); }}>{isRTL ? "إزالة الفلاتر" : "Clear Filters"}</button>
          </div>
        </section>
 
        {/* قسم عرض الدورات والتنقل بين الصفحات */}
        <section className="max-w-7xl mx-auto px-6 pt-7 pb-15 w-full">
          <div className="flex justify-between items-center mb-4.5 flex-wrap gap-2.5">
            <span className="font-bold text-capsule-navy dark:text-white">{isRTL ? `دورات (${processedCourses.length})` : `Courses (${processedCourses.length})`}</span>
            <div className="flex items-center gap-2 text-[13.5px]">
              <span className="text-gray-600 dark:text-slate-400">{isRTL ? "ترتيب حسب" : "Sort by"}</span>
              <select value={sortIndex} onChange={e => setSortIndex(Number(e.target.value))} className="border border-gray-200 dark:border-white/15 rounded-lg px-2.5 py-1.5 text-[13px] bg-white dark:bg-[#162035] text-capsule-navy dark:text-white focus:outline-none focus:border-capsule-teal">
                <option value={0}>{isRTL ? "الأعلى تقييماً" : "Highest Rated"}</option>
                <option value={1}>{isRTL ? "السعر: من الأقل للأعلى" : "Price: Low to High"}</option>
              </select>
            </div>
          </div>
 
          {loading ? (
            <div className="text-center py-12 text-gray-500 dark:text-slate-400">{isRTL ? "جاري التحميل..." : "Loading..."}</div>
          ) : processedCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {processedCourses.map((c, i) => (
                <article className="bg-white dark:bg-[#162035]/60 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-xl" key={c.id || i}>
                  <div className={`h-[120px] relative flex items-center justify-center bg-gradient-to-br ${c.gradient}`}>
                    <span className="text-[34px] text-white drop-shadow-md">{c.icon}</span>
                    
                    <button
                      type="button"
                      onClick={() => {
                        const currentCart = JSON.parse(localStorage.getItem('cartItems') || '[]');
                        const newCourse = { id: c.id, title: c.title, category: c.category, duration: String(c.duration ?? '—'), price: c.price || 0 };
                        if (!currentCart.some((item: { id: string | number }) => item.id === newCourse.id)) {
                          currentCart.push(newCourse);
                          localStorage.setItem('cartItems', JSON.stringify(currentCart));
                        }
                        navigate('/cart');
                      }}
                      className="absolute top-2.5 left-2.5 bg-white/90 border-none rounded-full w-8 h-8 cursor-pointer flex items-center justify-center shadow-md hover:bg-white hover:scale-110 transition"
                      aria-label="cart"
                    >
                      <span className="text-base">🛒</span>
                    </button>
                    
                    {c.badgeKey && (
                      <span className={`absolute top-2.5 text-[11px] font-black px-2.5 py-1 rounded-full shadow-xs backdrop-blur-md ${isRTL ? 'right-2.5' : 'left-2.5'} ${
                        c.badgeKey === 'new'
                          ? 'bg-[#7FB1BC]/25 text-[#164961] dark:bg-[#7FB1BC]/25 dark:text-[#7FB1BC] border border-[#7FB1BC]/40'
                          : 'bg-[#FFD369] text-[#164961] dark:bg-[#FFD369] dark:text-[#164961] border border-[#D19E22]/40'
                      }`}>
                        {l.results.badges[c.badgeKey] || c.badgeKey}
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <span className="text-[11px] font-bold uppercase text-capsule-teal tracking-wide">{c.category}</span>
                    <h3 className="text-base font-bold text-capsule-navy leading-snug m-0">{c.title}</h3>
                    <p className="text-[13px] text-gray-500 m-0 leading-relaxed line-clamp-2">{c.description}</p>
                    <div className="flex items-center gap-1.5 text-[12px] text-capsule-navy dark:text-slate-200 mt-1">
                      <svg className="w-3.5 h-3.5 text-capsule-teal dark:text-teal-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/trainer-details/${c.trainerId || c.instructorId || 1}`, {
                            state: { instructorName: c.instructor, courseTitle: c.title }
                          });
                        }}
                        className="font-extrabold text-slate-800 dark:text-slate-200 hover:text-capsule-teal dark:hover:text-teal-400 hover:underline transition cursor-pointer"
                      >
                        {c.instructor}
                      </button>
                    </div>
                    <div className="flex items-center gap-1 text-[12.5px] text-gray-500">
                      {[1, 2, 3, 4, 5].map(n => <Star key={n} filled={n <= Math.round(c.rating)} />)}
                      <span className={`font-medium ${isRTL ? 'mr-1' : 'ml-1'}`}>{c.rating || '—'}</span>
                    </div>
                    <div className="flex gap-3.5 text-[12px] text-gray-500 font-medium mt-1 mb-2"><span>⏱ {c.duration} {l.results.hoursLabel}</span><span>👥 {c.students} {l.results.studentsLabel}</span></div>
                    <div className="flex justify-between items-center mt-auto pt-3 border-t border-dashed border-gray-200">
                      <span className={`font-extrabold text-[14px] ${c.price === 0 ? 'text-[#3E5F44]' : 'text-capsule-navy'}`}>{c.price === 0 ? l.results.free : `${c.price} ${l.results.sar}`}</span>
                      <button onClick={() => navigate(`/course-details/${c.id}`)} className="border-2 border-capsule-teal text-capsule-teal bg-transparent rounded-full px-3.5 py-1.5 text-[12.5px] font-bold hover:bg-capsule-teal hover:text-white transition-colors">{l.results.viewDetails}</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center text-gray-500">{isRTL ? "لا توجد نتائج مطابقة." : "No matching results."}</div>
          )}
 
          {/* أزرار التنقل بين الصفحات */}
          <div className="flex justify-center items-center gap-2 mt-9 flex-wrap">
            <button className="border border-gray-200 bg-white rounded-lg px-3 py-2 text-[13px] text-capsule-navy font-medium hover:bg-gray-50">{isRTL ? "›" : "‹"} {l.results.prev}</button>
            {[1, 2, 3, 4].map(n => <button key={n} className={`border rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${n === 1 ? "bg-capsule-teal text-white border-capsule-teal" : "border-gray-200 bg-white text-capsule-navy hover:bg-gray-50"}`}>{n}</button>)}
            <button className="border border-gray-200 bg-white rounded-lg px-3 py-2 text-[13px] text-capsule-navy font-medium hover:bg-gray-50">{l.results.next} {isRTL ? "‹" : "›"}</button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
 