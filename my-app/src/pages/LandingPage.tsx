import React, { useState, useEffect, useRef } from 'react';
import { getPlatformOverview } from '../mocks/mockApi.js';
import { BASE_URL } from '../services/api';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import LoadingIndicator from '../components/LoadingIndicator.jsx';
import SkeletonLoader from '../components/SkeletonLoader';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Button from '../components/Button';
import { Link } from 'react-router-dom';
// @ts-ignore 
import heroImage from '../assets/light_trans_logo.png';
import ImageWithSkeleton from '../components/ImageWithSkeleton';
// Import the global language context
import { useLanguage } from '../context/LanguageContext.jsx';

// --- AGENTX-STYLE SCROLL REVEAL COMPONENT ---
const ScrollReveal: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'zoom';
}> = ({ children, className = '', delay = 0, direction = 'up' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (domRef.current) observer.unobserve(domRef.current);
          }
        });
      },
      { threshold: 0.12 }
    );

    const currentRef = domRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  const getTransformStyle = () => {
    if (isVisible) return 'opacity-100 translate-x-0 translate-y-0 scale-100';
    switch (direction) {
      case 'up': return 'opacity-0 translate-y-12 scale-95';
      case 'down': return 'opacity-0 -translate-y-12 scale-95';
      case 'left': return 'opacity-0 translate-x-12';
      case 'right': return 'opacity-0 -translate-x-12';
      case 'zoom': return 'opacity-0 scale-90';
      default: return 'opacity-0 translate-y-12';
    }
  };

  return (
    <div
      ref={domRef}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out transform ${getTransformStyle()} ${className}`}
    >
      {children}
    </div>
  );
};

// --- DATABASE DATA BLUEPRINTS (STATE TYPES) ---

interface TrackData {
  title: string;
  title_en?: string;
  description: string;
  description_en?: string;
}

interface PlatformOverview {
  platformName: string;
  studentTrack: TrackData;
  trainerTrack: TrackData;
  companyTrack: TrackData;
}

interface Course {
  id: string | number;
  category: string;
  title: string;
  title_en?: string;
  duration: string;
  rating: number;
  price: number;
  students: number;
  imageUrl?: string;
}

// --- API ENVELOPE TYPES ---

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  details?: Record<string, string>;
}

interface CoursesPayload {
  page: number;
  totalPages: number;
  courses: Course[];
}

// --- PROPS CONTRACT ---

interface LandingPageProps {
  onNavigateToRegister: () => void;
  onNavigateToLogin: () => void;
  onNavigateToTrainerOnboarding: () => void;
  onNavigateToCompanyOnboarding: () => void;
}

// --- VISUAL ICONS & GRADIENTS (Matching CoursesOverview) ---
const CARD_VISUALS = [
  { icon: "⚛", gradient: "from-capsule-navy to-[#343A60]" },
  { icon: "◐", gradient: "from-[#537E84] to-[#7FB1BC]" },
  { icon: "🐍", gradient: "from-capsule-navy to-[#343A60]" },
  { icon: "🛡", gradient: "from-capsule-navy to-[#0e2f3f]" },
  { icon: "{ }", gradient: "from-capsule-navy to-[#343A60]" },
  { icon: "▤", gradient: "from-capsule-teal to-capsule-navy" },
  { icon: "◎", gradient: "from-capsule-navy to-capsule-teal" },
  { icon: "▦", gradient: "from-[#3E5F44] to-[#537E84]" }
];

// --- HELPER FETCH FUNCTION ---

async function fetchRealCourses() {
  try {
    const url = `${BASE_URL}/courses/public`;
    const response = await fetch(url);
    const result = await response.json();

    if (!response.ok) {
      return { success: false, data: { courses: [] } };
    }

    const coursesArray = Array.isArray(result) ? result : (result.data?.courses || result.data || result.courses || []);

    return {
      success: true,
      data: { courses: coursesArray }
    };
  } catch (error) {
    return { success: false, data: { courses: [] } };
  }
}

// --- COMPONENT START ---

function LandingPage({
  onNavigateToRegister,
  onNavigateToLogin,
  onNavigateToTrainerOnboarding,
  onNavigateToCompanyOnboarding
}: LandingPageProps) {
  const { t, lang } = useLanguage();
  const l = t.platformOverview;

  const [overview, setOverview] = useState<PlatformOverview | null>(null);

  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  const [activeCategoryKey, setActiveCategoryKey] = useState<string>(l.catalog.filterAll);

  const [loading, setLoading] = useState<boolean>(true);
  const [catalogLoading, setCatalogLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const CATEGORIES = [
    { key: l.catalog.filterAll, label: l.catalog.filterAll },
    { key: 'Web Development', label: lang === 'ar' ? 'تطوير الويب' : 'Web Development' },
    { key: 'Artificial Intelligence', label: lang === 'ar' ? 'الذكاء الاصطناعي' : 'Artificial Intelligence' },
    { key: 'Cybersecurity', label: lang === 'ar' ? 'الأمن السيبراني' : 'Cybersecurity' },
    { key: 'Cloud Computing', label: lang === 'ar' ? 'الحوسبة السحابية' : 'Cloud Computing' }
  ];

  const getLocalizedValue = (arValue: string | undefined, enValue: string | undefined): string => {
    if (lang === 'ar') {
      return arValue || enValue || '';
    }
    return enValue || arValue || '';
  };

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      getPlatformOverview() as Promise<ApiResponse<PlatformOverview>>,
      fetchRealCourses() as Promise<ApiResponse<CoursesPayload>>
    ])
      .then(([overviewRes, coursesRes]) => {
        if (!isMounted) return;

        if (overviewRes.success) setOverview(overviewRes.data);
        else setError(l.errorPlatform);

        if (coursesRes.success) {
          setAllCourses(coursesRes.data.courses);
          setCourses(coursesRes.data.courses);
        }

        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setError(l.errorNetwork);
        setLoading(false);
      });

    return () => { isMounted = false; };
  }, [lang, l.errorPlatform, l.errorNetwork]);

  const handleCategoryClick = (categoryKey: string) => {
    setActiveCategoryKey(categoryKey);
    setCatalogLoading(true);

    setTimeout(() => {
      if (categoryKey === l.catalog.filterAll) {
        setCourses(allCourses);
      } else {
        const filtered = allCourses.filter(c => {
          if (categoryKey === 'Web Development') {
            return c.category === 'Web Development' || c.category === 'Software Engineering';
          }
          return c.category === categoryKey;
        });

        setCourses(filtered);
      }
      setCatalogLoading(false);
    }, 150);
  };



  return (
    <div className="min-h-screen bg-capsule-bg text-capsule-navy font-sans antialiased" dir={t.dir}>
      <Navbar
        activePage="home"
        showAuthButtons
        onSignIn={onNavigateToLogin}
        onSignUp={onNavigateToRegister}
      />

      {error && (
        <div className="max-w-7xl mx-auto px-6 pt-6">
          <ErrorMessage message={error} />
        </div>
      )}

      {/* Hero Section with Floating Animation & Glowing Orbs */}
      <div className="relative bg-gradient-to-tr from-capsule-footer via-capsule-navy to-capsule-teal text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-10">
          <ScrollReveal direction="right" delay={100}>
            <span className="inline-block bg-white/10 backdrop-blur-md border border-white/20 text-capsule-gold text-xs font-bold px-4 py-1.5 rounded-full mb-5 shadow-xs">
              ✨ {l.hero.badge}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight">
              {l.hero.title}
            </h1>
            <p className="text-gray-200 text-sm sm:text-base mt-5 max-w-lg leading-relaxed">
              {l.hero.subtitle}
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Button variant="primary" onClick={onNavigateToRegister}>{l.hero.btnStart}</Button>
              <button
                onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-6 py-3 font-bold text-sm rounded-xl border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/60 transition-all duration-300 cursor-pointer shadow-sm active:scale-95"
              >
                {l.hero.btnBrowse}
              </button>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="zoom" delay={300} className="flex justify-center items-center relative z-10">
            <div className="relative p-6 group">
              <div className="absolute inset-0 bg-capsule-teal/30 rounded-full blur-3xl animate-pulse-glow"></div>
              <ImageWithSkeleton
                src={heroImage}
                alt="Hero representation"
                className="w-full max-w-md drop-shadow-[0_25px_40px_rgba(0,164,153,0.35)] animate-float relative z-10 transform group-hover:scale-105 transition-transform duration-500"
                containerClassName="relative z-10 w-full max-w-md flex justify-center"
                skeletonClassName="rounded-3xl shadow-[0_0_60px_rgba(0,164,153,0.4)]"
              />
            </div>
          </ScrollReveal>
        </div>

        {/* Ambient Glowing Spheres */}
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-capsule-gold/15 rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute -right-10 top-0 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl animate-pulse-glow"></div>
      </div>

      {/* Tracks Section (Interactive AgentX Cards with ScrollReveal) */}
      <section className="max-w-7xl mx-auto px-6 -mt-10 relative z-20 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <ScrollReveal direction="up" delay={100}>
            <div className="agentx-glow-card bg-white dark:bg-[#18233C] rounded-3xl border-2 border-slate-200/80 dark:border-slate-700/80 shadow-2xl p-7 hover:-translate-y-2.5 hover:shadow-[0_25px_50px_rgba(0,164,153,0.25)] transition-all duration-300 group cursor-pointer h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-capsule-teal/10 dark:bg-teal-400/20 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300">🎓</div>
                <h3 className="font-black text-capsule-navy dark:text-white text-lg mb-2">
                  {getLocalizedValue(overview?.studentTrack?.title, overview?.studentTrack?.title_en)}
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-300 leading-relaxed mb-5">
                  {getLocalizedValue(overview?.studentTrack?.description, overview?.studentTrack?.description_en)}
                </p>
              </div>
              <button onClick={onNavigateToRegister} className="text-xs font-black text-capsule-teal dark:text-teal-400 hover:underline transition cursor-pointer flex items-center gap-1">
                <span>{l.tracks.btnStudent}</span>
              </button>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={250}>
            <div className="agentx-glow-card bg-white dark:bg-[#18233C] rounded-3xl border-2 border-slate-200/80 dark:border-slate-700/80 shadow-2xl p-7 hover:-translate-y-2.5 hover:shadow-[0_25px_50px_rgba(209,158,34,0.25)] transition-all duration-300 group cursor-pointer h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-capsule-dark-gold/10 dark:bg-amber-400/20 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300">🧑‍🏫</div>
                <h3 className="font-black text-capsule-navy dark:text-white text-lg mb-2">
                  {getLocalizedValue(overview?.trainerTrack?.title, overview?.trainerTrack?.title_en)}
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-300 leading-relaxed mb-5">
                  {getLocalizedValue(overview?.trainerTrack?.description, overview?.trainerTrack?.description_en)}
                </p>
              </div>
              <button onClick={onNavigateToTrainerOnboarding} className="text-xs font-black text-capsule-dark-gold dark:text-amber-400 hover:underline transition cursor-pointer flex items-center gap-1">
                <span>{l.tracks.btnTrainer}</span>
              </button>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={400}>
            <div className="agentx-glow-card bg-white dark:bg-[#18233C] rounded-3xl border-2 border-slate-200/80 dark:border-slate-700/80 shadow-2xl p-7 hover:-translate-y-2.5 hover:shadow-[0_25px_50px_rgba(22,73,97,0.25)] transition-all duration-300 group cursor-pointer h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-capsule-navy/10 dark:bg-sky-400/20 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300">🏢</div>
                <h3 className="font-black text-capsule-navy dark:text-white text-lg mb-2">
                  {getLocalizedValue(overview?.companyTrack?.title, overview?.companyTrack?.title_en)}
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-300 leading-relaxed mb-5">
                  {getLocalizedValue(overview?.companyTrack?.description, overview?.companyTrack?.description_en)}
                </p>
              </div>
              <button onClick={onNavigateToCompanyOnboarding} className="text-xs font-black text-capsule-navy dark:text-sky-400 hover:underline transition cursor-pointer flex items-center gap-1">
                <span>{l.tracks.btnCompany}</span>
              </button>
            </div>
          </ScrollReveal>

        </div>
      </section>

      {/* Catalog Section with ScrollReveal */}
      <section id="catalog" className="max-w-7xl mx-auto px-6 pb-20">
        <ScrollReveal direction="up" delay={100}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-capsule-teal dark:text-teal-400 text-xs font-bold uppercase tracking-wider mb-1">{l.catalog.label}</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-capsule-navy dark:text-white">{l.catalog.title}</h2>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-8">
            {CATEGORIES.map((category) => (
              <button
                key={category.key}
                onClick={() => handleCategoryClick(category.key)}
                className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer active:scale-95 ${activeCategoryKey === category.key
                    ? 'bg-capsule-teal text-white shadow-lg scale-105'
                    : 'bg-white dark:bg-[#18233C] text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {catalogLoading || loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white dark:bg-[#18233C] rounded-3xl border border-slate-200 dark:border-slate-700/80 p-4 space-y-4 shadow-md">
                <div className="skeleton-shimmer h-36 w-full rounded-2xl" />
                <div className="skeleton-shimmer h-4 w-24 rounded-md" />
                <div className="skeleton-shimmer h-5 w-3/4 rounded-md" />
                <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="skeleton-shimmer h-5 w-16 rounded-md" />
                  <div className="skeleton-shimmer h-4 w-20 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white dark:bg-[#18233C] border border-gray-200 dark:border-slate-700 rounded-3xl p-10 text-center shadow-xl">
            <p className="text-sm font-bold text-gray-400 dark:text-slate-400">{l.catalog.empty}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course, i) => {
              const visual = CARD_VISUALS[i % CARD_VISUALS.length];
              return (
                <ScrollReveal key={course.id} direction="up" delay={(i % 4) * 120}>
                  <Link
                    to={`/course-details/${course.id}`}
                    className="agentx-glow-card bg-white dark:bg-[#18233C] rounded-3xl border-2 border-slate-200/80 dark:border-slate-700/80 shadow-xl overflow-hidden hover:-translate-y-2.5 hover:shadow-2xl transition-all duration-300 block cursor-pointer group h-full"
                  >
                    {course.imageUrl && (course.imageUrl.startsWith('http') || course.imageUrl.startsWith('/') || course.imageUrl.startsWith('data:')) ? (
                      <div className="overflow-hidden h-36 relative">
                        <ImageWithSkeleton
                          src={course.imageUrl}
                          alt=""
                          className="h-full w-full object-cover group-hover:scale-108 transition-transform duration-500"
                          containerClassName="w-full h-36 overflow-hidden"
                          skeletonClassName="w-full h-36"
                          onError={(e: any) => {
                            e.currentTarget.parentElement.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className={`h-36 bg-gradient-to-br ${visual.gradient} flex items-center justify-center text-white text-4xl drop-shadow-md group-hover:scale-105 transition-transform duration-500`}>
                        <span>{visual.icon}</span>
                      </div>
                    )}
                    <div className="p-5 flex flex-col justify-between">
                      <div>
                        <span className="text-[11px] font-extrabold text-capsule-teal dark:text-teal-300 bg-capsule-teal/10 dark:bg-teal-950/60 px-2.5 py-1 rounded-lg border border-capsule-teal/20">
                          {course.category}
                        </span>
                        <h3 className="font-bold text-capsule-navy dark:text-white text-sm mt-3 leading-snug group-hover:text-capsule-teal transition-colors">
                          {getLocalizedValue(course.title, course.title_en)}
                        </h3>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mt-4">
                          <p className="text-xs text-gray-400 dark:text-slate-400 font-bold">{course.duration}</p>
                          {course.rating > 0 && (
                            <p className="text-xs font-bold text-capsule-dark-gold dark:text-amber-300">⭐ {course.rating}</p>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-slate-800">
                          <p className="font-black text-capsule-navy dark:text-white text-sm">
                            {course.price === 0 ? l.catalog.free : `${course.price} ${lang === 'ar' ? 'ر.س' : 'SAR'}`}
                          </p>
                          <span className="text-xs font-bold text-gray-400 dark:text-slate-400">{course.students} {l.catalog.students}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA Banner Section with ScrollReveal */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <ScrollReveal direction="zoom" delay={200}>
          <div className="agentx-glow-card bg-gradient-to-tr from-capsule-footer via-capsule-navy to-capsule-teal rounded-3xl p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <h3 className="text-xl sm:text-2xl font-black">{l.cta.title}</h3>
              <p className="text-gray-200 text-sm mt-2 max-w-lg">
                {l.cta.subtitle}
              </p>
            </div>
            <div className="flex gap-3 flex-shrink-0 relative z-10">
              <Button variant="primary" onClick={onNavigateToTrainerOnboarding}>{l.cta.btnTrainer}</Button>
              <button
                onClick={onNavigateToCompanyOnboarding}
                className="px-5 py-2.5 font-bold text-sm rounded-xl border-2 border-white/30 text-white hover:bg-white/10 transition duration-300 cursor-pointer active:scale-95"
              >
                {l.cta.btnCompany}
              </button>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <Footer />
    </div>
  );
}

export default LandingPage;