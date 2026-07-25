import React, { useState, useMemo, useEffect, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import TrainerNavbar from "../components/TrainerNavbar";
import Footer from "../components/Footer";
import Button from "../components/Button";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

interface Filters {
  category: string[];
  price: string[];
  duration: string[];
}

type FilterKey = keyof Filters;

// إعدادات الشكل والألوان والأيقونات الخاصة ببطاقات الدورات.
const CARD_VISUALS = [
  { icon: "⚛", badgeKey: "new", gradient: "from-capsule-navy to-[#343A60]" },
  { icon: "◐", badgeKey: "popular", gradient: "from-[#537E84] to-[#7FB1BC]" },
  { icon: "🐍", badgeKey: null, gradient: "from-capsule-navy to-[#343A60]" },
  { icon: "🛡", badgeKey: "new", gradient: "from-capsule-navy to-[#0e2f3f]" },
  { icon: "{ }", badgeKey: null, gradient: "from-capsule-navy to-[#343A60]" },
  { icon: "▤", badgeKey: "popular", gradient: "from-capsule-teal to-capsule-navy" },
  { icon: "◎", badgeKey: null, gradient: "from-capsule-dark-gold to-capsule-gold" },
  { icon: "▦", badgeKey: null, gradient: "from-[#3E5F44] to-[#537E84]" }
];

// القيم الافتراضية للفلاتر عند فتح الصفحة أو إعادة تعيينها.
const EMPTY_FILTERS: Filters = { category: [], price: [], duration: [] };
const CATEGORY_LABELS = {
  programming: { ar: "برمجة", en: "Programming" },
  cybersecurity: { ar: "سايبر", en: "Cybersecurity" },
  cloud: { ar: "كلاود", en: "Cloud Computing" },
};

// مكونات صغيرة مدمجة لتوفير المساحة
const CapsuleMark = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <linearGradient id="capsuleGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#7FB1BC" /><stop offset="0.5" stopColor="#164961" /><stop offset="1" stopColor="#537E84" />
    </linearGradient>
    <rect x="6" y="24" width="30" height="14" rx="7" transform="rotate(-18 21 31)" fill="url(#capsuleGrad)" />
    <rect x="28" y="26" width="30" height="14" rx="7" transform="rotate(-18 43 33)" fill="#FFD369" opacity="0.9" />
    <path d="M11 15 L13 20 L18 21 L13 22 L11 27 L9 22 L4 21 L9 20 Z" fill="#FFD369" />
  </svg>
);

interface StarProps {
  filled: boolean;
}

const Star = ({ filled }: StarProps) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? "#FFD369" : "none"} stroke="#FFD369" strokeWidth="1.5">
    <polygon points="12,2 15,9 22,9.5 16.5,14.5 18,22 12,18 6,22 7.5,14.5 2,9.5 9,9" />
  </svg>
);


interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  category: string;
  level: string;
  duration: string;
  students: number;
  rating: number;
  price: number;

  // هذه الخصائص تضيفينها في dynamicCourses
  tagKey?: string;
  priceLabel?: string;
  durationLabel?: string;
}


// المكون الرئيسي المسؤول عن عرض الدورات والبحث والفلترة والترتيب.
export default function CoursesOverview() {
  const { t, lang } = useLanguage();
  // Type assertion for translations
  const typedLang = lang as keyof typeof CATEGORY_LABELS["programming"];
  const navigate = useNavigate();
  const { role } = useAuth();
  const l = t.coursesOverview;
  const isRTL = t.dir === "rtl";

  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortIndex, setSortIndex] = useState<number>(0);
  const [draftFilters, setDraftFilters] = useState<typeof EMPTY_FILTERS>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<typeof EMPTY_FILTERS>(EMPTY_FILTERS);
  const [backendCourses, setBackendCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // جلب الكورسات الحقيقية المعتمدة من الباك اند فقط (بدون أي بيانات وهمية)
  useEffect(() => {
    fetch("http://localhost:5000/api/courses/public")
      .then((res) => res.json())
      .then((data) => {
        setBackendCourses(data.success ? (data.courses ?? []) : []);
      })
      .catch(() => {
        setBackendCourses([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // تجهيز بيانات الدورات وإضافة خصائص تستخدم فقط في واجهة المستخدم.
  const dynamicCourses = useMemo(() => {
    return backendCourses.map((c, i) => {
      const normCat = String(c.category || "").toLowerCase();
      let tagKey = "programming";
      if (/cyber|سيبراني|سايبر/.test(normCat)) tagKey = "cybersecurity";
      if (/cloud|كلاود/.test(normCat)) tagKey = "cloud";

      return {
        ...CARD_VISUALS[i % CARD_VISUALS.length],
        ...c,
        tagKey,
        level: String(c.level || "beginner").toLowerCase(),
        priceLabel: c.price === 0 ? "free" : "paid",
        durationLabel: (parseInt(c.duration) || 0) < 20 ? "under20" : "over20"
      };
    });
  }, [backendCourses]);

  const filterGroups = useMemo(() => [
    { 
      key: "category", label: isRTL ? "التصنيف" : "Category", 
      items: [{ label: isRTL ? "الكل" : "All", value: null }, ...Object.keys(CATEGORY_LABELS).map(k => ({ label: CATEGORY_LABELS[k as keyof typeof CATEGORY_LABELS]?.[isRTL ? "ar" : "en"] || k, value: k }))] 
    },
    { 
      key: "price", label: isRTL ? "السعر" : "Price", 
      items: [{ label: isRTL ? "الكل" : "All", value: null }, { label: isRTL ? "مجاني" : "Free", value: "free" }, { label: isRTL ? "مدفوع" : "Paid", value: "paid" }] 
    },
    { 
      key: "duration", label: isRTL ? "المدة" : "Duration", 
      items: [{ label: isRTL ? "الكل" : "All", value: null }, { label: isRTL ? "أقل من 20 ساعة" : "Under 20 hours", value: "under20" }, { label: isRTL ? "أكثر من 20 ساعة" : "Over 20 hours", value: "over20" }] 
    },
  ], [isRTL]);

  // إضافة أو إزالة قيمة من الفلتر مع التعامل مع خيار (الكل).
  const toggleFilterValue = (
  groupKey: FilterKey,
  value: string | null,
  idx: number
) => {
  setDraftFilters((prev) => {
    if (idx === 0 || value === null) {
      return { ...prev, [groupKey]: [] };
    }

    const current = prev[groupKey];

    const next = current.includes(value)
      ? current.filter((v: string) => v !== value)
      : [...current, value];

    const group = filterGroups.find(
      (g: typeof filterGroups[number]) => g.key === groupKey
    );

    return next.length === (group?.items.length ?? 0) - 1
      ? { ...prev, [groupKey]: [] }
      : { ...prev, [groupKey]: next };
  });
};

  // تطبيق البحث والفلاتر والترتيب قبل عرض النتائج.
  const processedCourses = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return dynamicCourses
      .filter(c => {
        const matchesSearch = !q || c.title?.toLowerCase().includes(q) || c.instructor?.toLowerCase().includes(q);

      const matchesKey = (
  k: FilterKey,
  prop: "tagKey" | "priceLabel" | "durationLabel"
) =>
  !appliedFilters[k].length ||
  appliedFilters[k].includes(c[prop]);

        return matchesSearch && matchesKey("category", "tagKey") && matchesKey("price", "priceLabel") && matchesKey("duration", "durationLabel");
      })
      .sort((a, b) => sortIndex === 0 ? b.rating - a.rating : a.price - b.price);
  }, [searchQuery, sortIndex, dynamicCourses, appliedFilters]);

  return (
    <div className="min-h-screen bg-capsule-bg text-capsule-navy font-sans antialiased flex flex-col" dir={t.dir} lang={lang}>
      {/* التعديل هنا فقط: تم إرجاع المكون الاصلي مع الخاصية لضبط تسجيل الخروج */}
      {role === 'trainer' ? (
        <TrainerNavbar activePage="learn" />
      ) : (
        <Navbar
          activePage="courses"
          showAuthButtons={true}
          onSignIn={() => navigate("/sign-in")}
          onSignUp={() => navigate("/sign-up")}
        />
      )}

      <main className="flex-grow">
        
        {/* قسم الترحيب الرئيسي */}
        <section className="relative bg-gradient-to-tr from-[#7FB1BC] via-capsule-navy to-[#537E84] overflow-hidden py-14 lg:py-20 min-h-[320px]">
          <div className="max-w-7xl mx-auto flex items-center px-6 text-white relative z-10">
            <div className="flex-1">
              <span className="inline-flex items-center gap-2 bg-white/10 border border-white/30 px-3.5 py-1.5 rounded-full text-[13px] font-bold mb-4.5"><CapsuleMark size={18} /> {l.hero.eyebrow}</span>
              <h1 className="text-4xl font-extrabold mb-3.5">{l.hero.title}</h1>
              <p className="text-[15.5px] opacity-90 max-w-lg mb-6.5">{l.hero.desc}</p>
              <div className="flex gap-3.5">
                <Button variant="primary">{l.hero.cta}</Button>
                <button className="bg-transparent border-2 border-white/60 font-bold px-6 py-3 rounded-full text-[14.5px] hover:bg-white/10 transition">{l.hero.ctaGhost}</button>
              </div>
            </div>
            <div className="hidden lg:block flex-1 relative h-[220px]">
              <div className={`absolute w-[260px] h-[90px] bg-white/15 border-2 border-white/30 rounded-full top-8 ${isRTL ? 'rotate-[18deg] right-5' : 'rotate-[-18deg] left-5'}`} />
              <div className={`absolute w-[200px] h-[70px] bg-capsule-gold opacity-85 rounded-full top-[100px] ${isRTL ? 'rotate-[18deg] right-[130px]' : 'rotate-[-18deg] left-[130px]'}`} />
            </div>
          </div>
        </section>

        {/* شريط البحث والفلاتر */}
        <section className="bg-white border-b border-gray-200 relative z-30">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2 bg-capsule-bg border border-gray-200 rounded-full px-4 py-2 flex-1 min-w-[220px]">
              <span>🔍</span>
              <input type="text" placeholder={isRTL ? "ابحث عن الكورس أو المدرب" : "Search for a course or trainer"} value={searchQuery} onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)} className="bg-transparent border-none outline-none w-full text-sm text-capsule-navy placeholder:text-gray-400" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {filterGroups.map(g => {
                const act = appliedFilters[g.key as FilterKey]?.length || 0;
                const open = openFilter === g.key;
                return (
                  <div className="relative" key={g.key}>
                    <button className={`border rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors ${open || act > 0 ? "border-capsule-teal text-capsule-teal bg-capsule-teal/10" : "border-gray-200 bg-white text-capsule-navy hover:bg-gray-50"}`} onClick={() => setOpenFilter(open ? null : g.key)}>{g.label}{act > 0 ? ` (${act})` : ""} ⌄</button>
                    {open && (
                      <div className={`absolute z-40 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg p-3 flex flex-col gap-2 ${isRTL ? "right-0 text-right" : "left-0 text-left"}`}>
                        {g.items.map((it, idx) => (
                          <label key={idx} className="flex items-center gap-2.5 text-[13.5px] cursor-pointer text-gray-700 hover:text-black py-0.5 w-full justify-start select-none">
                            <input type="checkbox" checked={idx === 0 || it.value === null ? draftFilters[g.key as FilterKey].length === 0 : draftFilters[g.key as FilterKey].includes(it.value)} onChange={() => toggleFilterValue(g.key as FilterKey, it.value, idx)} className="accent-capsule-teal w-4 h-4 shrink-0" />
                            <span className="leading-none">{it.label}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <button className="bg-capsule-gold text-capsule-navy font-bold px-4 py-2 rounded-full text-[13px] hover:bg-yellow-500 transition-colors" onClick={() => { setAppliedFilters(draftFilters); setOpenFilter(null); }}>{isRTL ? "تطبيق الفلاتر" : "Apply"}</button>
            <button className="bg-white border border-gray-200 rounded-full px-4 py-2 text-[13px] font-semibold text-capsule-navy hover:bg-gray-50 transition-colors" onClick={() => { setDraftFilters(EMPTY_FILTERS); setAppliedFilters(EMPTY_FILTERS); setOpenFilter(null); }}>{isRTL ? "إزالة الفلاتر" : "Clear Filters"}</button>
          </div>
        </section>

        {/* قسم عرض الدورات */}
        <section className="max-w-7xl mx-auto px-6 pt-7 pb-15 w-full">
          <div className="flex justify-between items-center mb-4.5 flex-wrap gap-2.5">
            <span className="font-bold text-capsule-navy">{isRTL ? `دورات (${processedCourses.length})` : `Courses (${processedCourses.length})`}</span>
            <div className="flex items-center gap-2 text-[13.5px]">
              <span className="text-gray-600">{isRTL ? "ترتيب حسب" : "Sort by"}</span>
              <select value={sortIndex} onChange={(e: ChangeEvent<HTMLSelectElement>) => setSortIndex(Number(e.target.value))} className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-[13px] bg-white focus:outline-none focus:border-capsule-teal">
                <option value={0}>{isRTL ? "الأعلى تقييماً" : "Highest Rated"}</option>
                <option value={1}>{isRTL ? "السعر: من الأقل للأعلى" : "Price: Low to High"}</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">{isRTL ? "جاري التحميل..." : "Loading..."}</div>
          ) : processedCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {processedCourses.map((c, i) => (
                <article className="bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-capsule-navy/10" key={c.id || i}>
                  <div className={`h-[120px] relative flex items-center justify-center bg-gradient-to-br ${c.gradient}`}>
                    <span className="text-[34px] text-white drop-shadow-md">{c.icon}</span>
                    {c.badgeKey && <span className={`absolute top-2.5 bg-capsule-gold text-capsule-navy text-[11px] font-extrabold px-2.5 py-1 rounded-full ${isRTL ? 'right-2.5' : 'left-2.5'}`}>{l.results.badges[c.badgeKey]}</span>}
                  </div>
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <span className="text-[11px] font-bold uppercase text-capsule-teal tracking-wide">{c.category}</span>
                    <h3 className="text-base font-bold text-capsule-navy leading-snug m-0">{c.title}</h3>
                    <p className="text-[13px] text-gray-500 m-0 leading-relaxed line-clamp-2">{c.description}</p>
                    <div className="flex items-center gap-1.5 text-[12.5px] text-capsule-navy mt-1"><span className="w-4 h-4 rounded-full bg-capsule-teal/60 inline-block" /><span className="font-medium">{c.instructor}</span></div>
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