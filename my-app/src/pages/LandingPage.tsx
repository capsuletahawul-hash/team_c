import React, { useState, useEffect } from 'react';
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
// Import the global language context
import { useLanguage } from '../context/LanguageContext.jsx';

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
  { icon: "◎", gradient: "from-capsule-dark-gold to-capsule-gold" },
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-200/80 dark:bg-[#030611] text-capsule-navy dark:text-slate-100 font-sans antialiased flex flex-col" dir={t.dir}>
        <Navbar activePage="home" showAuthButtons onSignIn={onNavigateToLogin} onSignUp={onNavigateToRegister} />
        <div className="flex-grow max-w-7xl mx-auto px-6 py-10 w-full">
          <SkeletonLoader variant="landing-page" dir={t.dir} />
        </div>
        <Footer />
      </div>
    );
  }

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

      {/* Hero Section */}
      <div className="relative bg-gradient-to-tr from-capsule-footer via-capsule-navy to-capsule-teal text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-10">
          <div>
            <span className="inline-block bg-white/10 border border-white/20 text-capsule-gold text-xs font-bold px-4 py-1.5 rounded-full mb-5">
              {l.hero.badge}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
              {l.hero.title}
            </h1>
            <p className="text-gray-200 text-sm sm:text-base mt-5 max-w-lg leading-relaxed">
              {l.hero.subtitle}
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Button variant="primary" onClick={onNavigateToRegister}>{l.hero.btnStart}</Button>
              <button
                onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-5 py-2.5 font-bold text-sm rounded-xl border border-white/30 text-white hover:bg-white/10 transition cursor-pointer"
              >
                {l.hero.btnBrowse}
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            <img src={heroImage} alt="Hero representation" className="w-full max-w-md drop-shadow-2xl" />
          </div>
        </div>

        <div className="absolute -left-16 -bottom-16 w-72 h-72 bg-capsule-gold/10 rounded-full blur-3xl"></div>
        <div className="absolute -right-10 top-0 w-56 h-56 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      {/* Tracks Section */}
      <section className="max-w-7xl mx-auto px-6 -mt-10 relative z-10 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-7">
            <div className="w-11 h-11 bg-capsule-teal/10 rounded-xl flex items-center justify-center text-xl mb-4">🎓</div>
            <h3 className="font-black text-capsule-navy mb-2">
              {getLocalizedValue(overview?.studentTrack?.title, overview?.studentTrack?.title_en)}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">
              {getLocalizedValue(overview?.studentTrack?.description, overview?.studentTrack?.description_en)}
            </p>
            <button onClick={onNavigateToRegister} className="text-xs font-bold text-capsule-teal hover:text-capsule-navy transition cursor-pointer">
              {l.tracks.btnStudent}
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-7">
            <div className="w-11 h-11 bg-capsule-dark-gold/10 rounded-xl flex items-center justify-center text-xl mb-4">🧑‍🏫</div>
            <h3 className="font-black text-capsule-navy mb-2">
              {getLocalizedValue(overview?.trainerTrack?.title, overview?.trainerTrack?.title_en)}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">
              {getLocalizedValue(overview?.trainerTrack?.description, overview?.trainerTrack?.description_en)}
            </p>
            <button onClick={onNavigateToTrainerOnboarding} className="text-xs font-bold text-capsule-dark-gold hover:text-capsule-navy transition cursor-pointer">
              {l.tracks.btnTrainer}
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-7">
            <div className="w-11 h-11 bg-capsule-navy/10 rounded-xl flex items-center justify-center text-xl mb-4">🏢</div>
            <h3 className="font-black text-capsule-navy mb-2">
              {getLocalizedValue(overview?.companyTrack?.title, overview?.companyTrack?.title_en)}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">
              {getLocalizedValue(overview?.companyTrack?.description, overview?.companyTrack?.description_en)}
            </p>
            <button onClick={onNavigateToCompanyOnboarding} className="text-xs font-bold text-capsule-navy hover:text-capsule-teal transition cursor-pointer">
              {l.tracks.btnCompany}
            </button>
          </div>

        </div>
      </section>

      {/* Catalog Section */}
      <section id="catalog" className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-capsule-teal text-xs font-bold uppercase tracking-wider mb-1">{l.catalog.label}</p>
            <h2 className="text-2xl font-extrabold text-capsule-navy">{l.catalog.title}</h2>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          {CATEGORIES.map((category) => (
            <button
              key={category.key}
              onClick={() => handleCategoryClick(category.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeCategoryKey === category.key
                  ? 'bg-capsule-teal text-white shadow-xs'
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {catalogLoading ? (
          <LoadingIndicator message={l.catalogLoading} />
        ) : courses.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center">
            <p className="text-sm font-bold text-gray-400">{l.catalog.empty}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course, i) => {
              const visual = CARD_VISUALS[i % CARD_VISUALS.length];
              return (
                <Link
                  to={`/course-details/${course.id}`}
                  key={course.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden hover:shadow-md transition block cursor-pointer"
                >
                  {course.imageUrl ? (
                    <img src={course.imageUrl} alt={course.title} className="h-32 w-full object-cover" />
                  ) : (
                    <div className={`h-32 bg-gradient-to-br ${visual.gradient} flex items-center justify-center text-white text-3xl drop-shadow-md`}>
                      <span>{visual.icon}</span>
                    </div>
                  )}
                  <div className="p-5">
                    <span className="text-[11px] font-bold text-capsule-teal bg-capsule-teal/10 px-2 py-1 rounded-md">
                      {course.category}
                    </span>
                    <h3 className="font-bold text-capsule-navy text-sm mt-3 leading-snug">
                      {getLocalizedValue(course.title, course.title_en)}
                    </h3>

                    <div className="flex items-center justify-between mt-4">
                      <p className="text-xs text-gray-400 font-bold">{course.duration}</p>
                      {course.rating > 0 && (
                        <p className="text-xs font-bold text-capsule-dark-gold">⭐ {course.rating}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <p className="font-black text-capsule-navy text-sm">
                        {course.price === 0 ? l.catalog.free : `${course.price} ${lang === 'ar' ? 'ر.س' : 'SAR'}`}
                      </p>
                      <span className="text-xs font-bold text-gray-400">{course.students} {l.catalog.students}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA Banner Section */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="bg-capsule-footer rounded-3xl p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-black">{l.cta.title}</h3>
            <p className="text-gray-300 text-sm mt-2 max-w-lg">
              {l.cta.subtitle}
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Button variant="primary" onClick={onNavigateToTrainerOnboarding}>{l.cta.btnTrainer}</Button>
            <button
              onClick={onNavigateToCompanyOnboarding}
              className="px-5 py-2.5 font-bold text-sm rounded-xl border border-white/30 text-white hover:bg-white/10 transition cursor-pointer"
            >
              {l.cta.btnCompany}
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default LandingPage;