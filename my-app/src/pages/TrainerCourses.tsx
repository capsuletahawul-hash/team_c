// src/pages/TrainerCourses.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Reusable Components
import TrainerNavbar from '../components/TrainerNavbar';
import Footer from '../components/Footer';
import Button from '../components/Button';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';
// Global Context
import { useLanguage } from '../context/LanguageContext';
// API base URL — single source of truth
import { BASE_URL } from '../services/api';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CourseItem {
  id: number;
  title: string;
  category: string;
  description: string;
  price: number;
  duration: string;
  level: string;
  rating: number;
  status: string;
  students: number;
  thumbnail: string;
  isVisible?: boolean;
}

interface FormDataState {
  title: string;
  price: string;
  durationWeeks: string;
  maxStudents: string;
  videoDurationMinutes: string;
  level: 'beginner' | 'intermediate' | 'advanced' | string;
  category: 'Cybersecurity' | 'Software Engineering' | 'Artificial Intelligence' | 'Cloud Computing' | string;
  description: string;
  requirementsNotes: string;
}

type StatusFilter = 'all' | 'available' | 'coming_soon' | 'pending_deletion';

const EMPTY_FORM: FormDataState = {
  title: '',
  price: '',
  durationWeeks: '',
  maxStudents: '',
  videoDurationMinutes: '',
  level: 'beginner',
  category: 'Cybersecurity',
  description: '',
  requirementsNotes: ''
};

// ============================================================================
// COMPONENT
// ============================================================================

function TrainerCourses(): React.JSX.Element {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const isRTL = t.dir === 'rtl';
  const borderSide = isRTL ? 'border-r-4' : 'border-l-4';

  const token = sessionStorage.getItem('user_token');

  const [coursesList, setCoursesList] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showForm, setShowForm] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [formData, setFormData] = useState<FormDataState>(EMPTY_FORM);

  // جلب دورات المدرب من السيرفر
  const fetchCourses = async (): Promise<void> => {
    try {
      const response = await fetch(`${BASE_URL}/trainer/courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json().catch(() => ({ courses: [] }));

      if (!response.ok) {
        setError(isRTL ? 'فشل في جلب دوراتك من السيرفر' : 'Failed to fetch your courses');
        return;
      }

      if (data?.courses) {
        setCoursesList(
          (data.courses as CourseItem[]).map((c) => ({
            ...c,
            isVisible: c.isVisible !== false
          }))
        );
      }
    } catch (err) {
      console.error('Error fetching trainer courses', err);
      setError(isRTL ? 'فشل في جلب دوراتك من السيرفر' : 'Failed to fetch your courses');
    }
  };

  useEffect(() => {
    let isMounted = true;

    (async () => {
      setLoading(true);
      await fetchCourses();
      if (isMounted) setLoading(false);
    })();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = (): string => {
    if (
      !formData.title.trim() ||
      !formData.category.trim() ||
      !formData.level.trim() ||
      !formData.price.trim() ||
      !formData.durationWeeks.trim() ||
      !formData.maxStudents.trim() ||
      !formData.videoDurationMinutes.trim() ||
      !formData.description.trim() ||
      !formData.requirementsNotes.trim()
    ) {
      return isRTL ? 'يرجى تعبئة جميع الحقول المطلوبة' : 'Please fill in all required fields';
    }

    if (Number(formData.price) <= 0) {
      return isRTL ? 'يجب أن يكون السعر أكبر من صفر' : 'Price must be greater than 0';
    }

    if (Number(formData.durationWeeks) <= 0) {
      return isRTL ? 'يجب أن تكون مدة الدورة أكبر من صفر' : 'Duration must be greater than 0';
    }

    if (Number(formData.maxStudents) <= 0) {
      return isRTL ? 'يجب أن يكون الحد الأقصى للطلاب أكبر من صفر' : 'Maximum students must be greater than 0';
    }

    if (Number(formData.videoDurationMinutes) <= 0) {
      return isRTL ? 'يجب أن تكون مدة الفيديو أكبر من صفر' : 'Video duration must be greater than 0';
    }

    if (formData.requirementsNotes.trim().length < 20) {
      return isRTL
        ? 'يجب أن تحتوي المتطلبات على 20 حرفاً على الأقل'
        : 'Requirements must be at least 20 characters';
    }

    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`${BASE_URL}/trainer/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        const rawError = result.error || result.message;
        const serverError =
          rawError && typeof rawError === 'object' ? Object.values(rawError).flat().join(' ') : rawError;

        setError(serverError || (isRTL ? 'حدث خطأ أثناء إنشاء الدورة' : 'An error occurred while creating the course'));
        return;
      }

      setMessage(isRTL ? '✅ تم إنشاء الدورة بنجاح.' : '✅ Course created successfully.');
      setFormData(EMPTY_FORM);
      setShowForm(false);
      await fetchCourses();
    } catch (err) {
      console.error(err);
      setError(isRTL ? 'حدث خطأ أثناء إنشاء الدورة' : 'An error occurred while creating the course');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleVisibility = async (courseId: number) => {
    const targetCourse = coursesList.find((c) => c.id === courseId);
    if (!targetCourse) return;
    const nextVisibility = !targetCourse.isVisible;

    try {
      const response = await fetch(`${BASE_URL}/trainer/courses/${courseId}/visibility`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isVisible: nextVisibility })
      });

      if (!response.ok) {
        setError(isRTL ? 'فشل تعديل حالة ظهور الدورة' : 'Failed to update course visibility');
        return;
      }

      setCoursesList((prev) => prev.map((c) => (c.id === courseId ? { ...c, isVisible: nextVisibility } : c)));
      setMessage(isRTL ? '👁️ تم تحديث حالة ظهور الدورة.' : '👁️ Course visibility updated.');
    } catch (err) {
      console.error(err);
      setError(isRTL ? 'فشل تعديل حالة ظهور الدورة' : 'Failed to update course visibility');
    }
  };

  const requestDeletion = async (courseId: number, courseTitle: string) => {
    const confirmRequest = window.confirm(
      isRTL ? `هل تريد إرسال طلب حذف لدورة "${courseTitle}"؟` : `Send a deletion request for "${courseTitle}"?`
    );
    if (!confirmRequest) return;

    try {
      const response = await fetch(`${BASE_URL}/trainer/courses/${courseId}/deletion-request`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        setError(isRTL ? 'تعذر إرسال طلب الحذف، يرجى المحاولة لاحقاً' : 'Failed to submit deletion request');
        return;
      }

      setCoursesList((prev) => prev.map((c) => (c.id === courseId ? { ...c, status: 'pending_deletion' } : c)));
      setMessage(isRTL ? '🚀 تم إرسال طلب الحذف بنجاح.' : '🚀 Deletion request submitted successfully.');
    } catch (err) {
      console.error(err);
      setError(isRTL ? 'تعذر إرسال طلب الحذف، يرجى المحاولة لاحقاً' : 'Failed to submit deletion request');
    }
  };

  const filteredCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return coursesList.filter((course) => {
      const matchesSearch = !q || course.title?.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [coursesList, searchQuery, statusFilter]);

  const statusLabel = (status: string): string => {
    if (status === 'available') return isRTL ? 'متاحة' : 'Available';
    if (status === 'coming_soon') return isRTL ? 'قريباً' : 'Coming Soon';
    if (status === 'pending_deletion') return isRTL ? 'قيد الحذف' : 'Pending Deletion';
    if (status === 'rejected') return isRTL ? 'مرفوضة' : 'Rejected';
    return status;
  };

  const statusBadgeClass = (status: string): string => {
    if (status === 'available') return 'bg-emerald-50 text-emerald-700';
    if (status === 'coming_soon') return 'bg-amber-50 text-amber-700';
    if (status === 'pending_deletion') return 'bg-rose-50 text-rose-700';
    if (status === 'rejected') return 'bg-gray-100 text-gray-600';
    return 'bg-gray-100 text-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-capsule-bg flex flex-col items-center justify-center">
        <LoadingIndicator message={isRTL ? 'جاري تحميل دوراتك...' : 'Loading your courses...'} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-capsule-bg text-capsule-navy font-sans antialiased flex flex-col" dir={t.dir}>
      <TrainerNavbar activePage="courses" />

      <main className="flex-grow">
        {/* Hero */}
        <section className="relative bg-gradient-to-tr from-capsule-footer via-capsule-navy to-capsule-teal overflow-hidden py-14 lg:py-16">
          <div className="max-w-7xl mx-auto px-6 text-white relative z-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">
              {isRTL ? 'دوراتي التدريبية' : 'My Courses'}
            </h1>
            <p className="text-[15.5px] opacity-90 max-w-lg">
              {isRTL ? 'إدارة جميع الدورات الخاصة بك في مكان واحد.' : 'Manage all your training courses from one place.'}
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-6 py-8 w-full">
          {message && (
            <div
              className={`mb-6 p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold ${borderSide} border-emerald-500`}
            >
              {message}
            </div>
          )}
          <ErrorMessage message={error} />

          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <p className="text-xs font-bold text-gray-400 mb-1">
                {isRTL ? 'إجمالي الدورات' : 'Total Courses'}
              </p>
              <h3 className="text-2xl font-black text-capsule-teal font-mono">{coursesList.length}</h3>
            </div>
          </div>

          {/* Search + Filter + Add */}
          <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm mb-6 flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2 bg-capsule-bg border border-gray-200 rounded-full px-4 py-2 flex-1 min-w-[220px]">
              <span>🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRTL ? 'ابحث باسم الدورة' : 'Search by course title'}
                className="bg-transparent border-none outline-none w-full text-sm text-capsule-navy placeholder:text-gray-400"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="border border-gray-200 rounded-full px-4 py-2 text-xs font-bold bg-white text-capsule-navy focus:outline-none focus:border-capsule-teal"
            >
              <option value="all">{isRTL ? 'الكل' : 'All'}</option>
              <option value="available">{isRTL ? 'متاحة' : 'Available'}</option>
              <option value="coming_soon">{isRTL ? 'قريباً' : 'Coming Soon'}</option>
              <option value="pending_deletion">{isRTL ? 'قيد الحذف' : 'Pending Deletion'}</option>
            </select>

            <Button variant="primary" onClick={() => setShowForm((prev) => !prev)}>
              {isRTL ? '+ إضافة دورة جديدة' : '+ Add New Course'}
            </Button>
          </div>

          {/* Course Form */}
          {showForm && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm mb-8">
              <h2 className="text-md font-bold text-capsule-navy border-b border-gray-100 pb-3 mb-4">
                {isRTL ? '➕ إنشاء دورة جديدة' : '➕ Create New Course'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">
                    {isRTL ? 'عنوان الدورة *' : 'Course Title *'}
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                    placeholder={isRTL ? 'معسكر هندسة برمجيات متقدم' : 'Advanced Software Engineering Bootcamp'}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                      {isRTL ? 'التصنيف *' : 'Category *'}
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none"
                    >
                      <option value="Cybersecurity">{isRTL ? 'الأمن السيبراني' : 'Cybersecurity'}</option>
                      <option value="Software Engineering">{isRTL ? 'هندسة البرمجيات' : 'Software Engineering'}</option>
                      <option value="Artificial Intelligence">{isRTL ? 'الذكاء الاصطناعي' : 'Artificial Intelligence'}</option>
                      <option value="Cloud Computing">{isRTL ? 'الحوسبة السحابية' : 'Cloud Computing'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                      {isRTL ? 'المستوى *' : 'Level *'}
                    </label>
                    <select
                      name="level"
                      value={formData.level}
                      onChange={handleInputChange}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none"
                    >
                      <option value="beginner">{isRTL ? 'مبتدئ' : 'Beginner'}</option>
                      <option value="intermediate">{isRTL ? 'متوسط' : 'Intermediate'}</option>
                      <option value="advanced">{isRTL ? 'متقدم' : 'Advanced'}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                      {isRTL ? 'السعر (ريال) *' : 'Price (SAR) *'}
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min={1}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                      placeholder="350"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                      {isRTL ? 'المدة (أسابيع) *' : 'Duration (Weeks) *'}
                    </label>
                    <input
                      type="number"
                      name="durationWeeks"
                      value={formData.durationWeeks}
                      onChange={handleInputChange}
                      required
                      min={1}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                      placeholder="6"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                      {isRTL ? 'الحد الأقصى للطلاب *' : 'Maximum Students *'}
                    </label>
                    <input
                      type="number"
                      name="maxStudents"
                      value={formData.maxStudents}
                      onChange={handleInputChange}
                      required
                      min={1}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                      placeholder="50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                      {isRTL ? 'مدة الفيديو (دقيقة) *' : 'Video Duration (minutes) *'}
                    </label>
                    <input
                      type="number"
                      name="videoDurationMinutes"
                      value={formData.videoDurationMinutes}
                      onChange={handleInputChange}
                      required
                      min={1}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                      placeholder="120"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">
                    {isRTL ? 'نبذة ووصف مختصر للدورة *' : 'Short Description *'}
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                    placeholder={isRTL ? 'نبذة توضح محتوى الدورة للطلاب...' : 'A short summary of the course content...'}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">
                    {isRTL ? 'المتطلبات (٢٠ حرف على الأقل) *' : 'Requirements (min 20 characters) *'}
                  </label>
                  <textarea
                    name="requirementsNotes"
                    value={formData.requirementsNotes}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold resize-none"
                    placeholder={isRTL ? 'اذكر المتطلبات الأساسية لهذه الدورة...' : 'List the prerequisites for this course...'}
                  ></textarea>
                </div>

                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting
                    ? isRTL
                      ? 'جاري الإنشاء...'
                      : 'Creating...'
                    : isRTL
                    ? 'إنشاء الدورة'
                    : 'Create Course'}
                </Button>
              </form>
            </div>
          )}

          {/* Course Cards */}
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredCourses.map((course) => (
                <article
                  key={course.id}
                  className="bg-white border border-gray-100 rounded-3xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="h-[130px] relative flex items-center justify-center bg-gradient-to-br from-capsule-navy to-[#343A60] overflow-hidden">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[32px] text-white/90">📚</span>
                    )}
                    <span
                      className={`absolute top-2.5 ${
                        isRTL ? 'right-2.5' : 'left-2.5'
                      } text-[10px] font-extrabold px-2.5 py-1 rounded-full ${statusBadgeClass(course.status)}`}
                    >
                      {statusLabel(course.status)}
                    </span>
                  </div>

                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <span className="text-[11px] font-bold uppercase text-capsule-teal tracking-wide">
                      {course.category}
                    </span>
                    <h3 className="text-base font-bold text-capsule-navy leading-snug m-0 truncate">
                      {course.title}
                    </h3>

                    <div className="flex items-center gap-1 text-[12.5px] text-gray-500">
                      <span className="text-capsule-gold font-mono">{'★'.repeat(Math.round(course.rating || 0))}</span>
                      <span className="font-medium">{course.rating || '—'}</span>
                    </div>

                    <div className="flex gap-3.5 text-[12px] text-gray-500 font-medium mt-1">
                      <span>
                        ⏱ {course.duration} {isRTL ? 'أسابيع' : 'weeks'}
                      </span>
                      <span>
                        👥 {course.students} {isRTL ? 'طالب' : 'students'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-auto pt-3 border-t border-dashed border-gray-200">
                      <span className="font-extrabold text-[14px] text-capsule-navy font-mono">
                        {course.price} {isRTL ? 'ريال' : 'SAR'}
                      </span>
                    </div>

                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      <button
                        onClick={() => navigate(`/course-details/${course.id}`)}
                        className="px-2.5 py-1.5 rounded-md text-[10px] font-bold text-capsule-navy bg-gray-100 hover:bg-gray-200 transition"
                      >
                        {isRTL ? 'عرض' : 'View'}
                      </button>
                      <button
                        onClick={() => toggleVisibility(course.id)}
                        className="px-2.5 py-1.5 rounded-md text-[10px] font-bold text-white bg-slate-600 hover:bg-slate-700 transition"
                      >
                        {course.isVisible ? (isRTL ? 'إخفاء' : 'Hide') : isRTL ? 'إظهار' : 'Show'}
                      </button>
                      <button
                        onClick={() => requestDeletion(course.id, course.title)}
                        disabled={course.status === 'pending_deletion'}
                        className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold text-white transition ${
                          course.status === 'pending_deletion'
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-rose-600 hover:bg-rose-700'
                        }`}
                      >
                        {course.status === 'pending_deletion'
                          ? isRTL
                            ? 'مرفوع'
                            : 'Sent'
                          : isRTL
                          ? 'طلب حذف'
                          : 'Delete Request'}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-3xl p-10 text-center text-gray-500 shadow-sm">
              {isRTL ? 'لا توجد دورات مطابقة.' : 'No matching courses found.'}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default TrainerCourses;
