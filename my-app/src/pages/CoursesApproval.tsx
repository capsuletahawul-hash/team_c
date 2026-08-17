import React, { useState, useEffect } from "react";

// Reusable Components
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/Button";
import LoadingIndicator from "../components/LoadingIndicator";

// Global Context
import { useLanguage } from "../context/LanguageContext";

// Centralized API functions
import { getAdminCourses, approveAdminCourse, rejectAdminCourse } from "../services/api";

// Union type restricting system course approval states
type CourseStatus = "pending" | "approved" | "rejected";

// Interface enforcing types for course metrics and keys
interface CourseItem {
  id: number;
  title: string;
  trainer: string;
  category: string;
  durationVal: number;
  status: CourseStatus;
}

interface CoursesApprovalProps {
  isEmbedded?: boolean;
}

const CoursesApproval: React.FC<CoursesApprovalProps> = ({ isEmbedded = false }) => {
  const { t } = useLanguage();
  const l = t.coursesApproval;

  // React states to manage asynchronous UI lifecycle and dynamic list updates
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<boolean>(false);

  // Safely fetch and populate the course pipelines on mount with clean-up tracking
  useEffect(() => {
    let isMounted = true;

    const loadCourses = async () => {
      try {
        const result = await getAdminCourses();
        if (!isMounted) return;

        if (result?.success && result.data) {
          setCourses(result.data.courses as CourseItem[]);
        } else {
          setLoadError(true);
        }
      } catch (err) {
        console.error('Error fetching courses for approval', err);
        if (isMounted) setLoadError(true);
      }

      if (isMounted) setLoading(false);
    };

    loadCourses();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handler triggered by the administrator to approve a specific course pipeline
  const approveCourse = async (id: number): Promise<void> => {
    try {
      await approveAdminCourse(id);

      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course.id === id ? { ...course, status: "approved" } : course
        )
      );
    } catch (err) {
      console.error('Error approving course', err);
    }
  };

  // Handler triggered by the administrator to reject a specific course pipeline
  const rejectCourse = async (id: number): Promise<void> => {
    try {
      await rejectAdminCourse(id);

      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course.id === id ? { ...course, status: "rejected" } : course
        )
      );
    } catch (err) {
      console.error('Error rejecting course', err);
    }
  };

  // Dynamic localization mapper to keep rendering logic clean and independent
  const getStatusLabel = (status: CourseStatus): string => {
    if (status === "approved") return l.data.approvedText;
    if (status === "rejected") return l.data.rejectedText;
    return l.data.pendingText;
  };

  // Bidirectional layout utility flags
  const isRtl = t.dir === "rtl";
  const heroDecorationAlign = isRtl ? "left-[-40px]" : "right-[-40px]";
  const heroBallAlign = isRtl ? "rotate-[-25deg] left-10" : "rotate-[25deg] right-10";
  const heroArcAlign = isRtl ? "rotate-[-25deg]" : "rotate-[25deg]";
  const tableAlign = isRtl ? "text-right" : "text-left";

  // Graceful handling of loading states
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <LoadingIndicator message={l.loading} />
      </div>
    );
  }

  // Graceful handling of fetch failures to prevent blank UI or crashes
  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <p className="text-sm font-semibold text-[#0D4C54]">
          {isRtl ? "تعذر تحميل قائمة الكورسات." : "Unable to load courses."}
        </p>
      </div>
    );
  }

  if (isEmbedded) {
    return (
      <div dir={t.dir} className="font-sans text-slate-800 antialiased">
        <div className="bg-white/90 backdrop-blur-md border border-white rounded-3xl p-6 shadow-sm overflow-hidden mb-6">
          <h2 className="text-sm font-black text-capsule-navy border-b pb-3 mb-4">{l.hero.title}</h2>
          <p className="text-xs text-gray-500 font-bold mb-4">{l.hero.subtitle}</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-100/80 p-4 rounded-2xl border border-slate-200/80">
              <p className="text-[10px] font-black text-gray-500 uppercase mb-1">{l.stats.total}</p>
              <p className="text-xl font-black font-mono text-capsule-navy">{courses.length}</p>
            </div>
            <div className="bg-slate-100/80 p-4 rounded-2xl border border-slate-200/80">
              <p className="text-[10px] font-black text-gray-500 uppercase mb-1">{l.stats.approved}</p>
              <p className="text-xl font-black font-mono text-emerald-600">
                {courses.filter((c) => c.status === "approved").length}
              </p>
            </div>
            <div className="bg-slate-100/80 p-4 rounded-2xl border border-slate-200/80">
              <p className="text-[10px] font-black text-gray-500 uppercase mb-1">{l.stats.pending}</p>
              <p className="text-xl font-black font-mono text-amber-500">
                {courses.filter((c) => c.status === "pending").length}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className={`w-full border-collapse ${tableAlign} text-xs`}>
              <thead>
                <tr className="bg-slate-200/80 text-capsule-navy font-black border-b border-slate-300">
                  <th className="p-3">{l.table.colTitle}</th>
                  <th className="p-3">{l.table.colTrainer}</th>
                  <th className="p-3">{l.table.colCategory}</th>
                  <th className="p-3">{l.table.colDuration}</th>
                  <th className="p-3">{l.table.colStatus}</th>
                  <th className="p-3 text-center">{l.table.colActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 font-bold">
                {courses.length === 0 ? (
                  <tr><td colSpan={6} className="py-12 text-center">
                    <p className="text-xs font-black text-gray-400">{isRtl ? 'لا توجد دورات معلقة للاعتماد' : 'No courses pending approval'}</p>
                  </td></tr>
                ) : courses.map((course) => (
                  <tr key={course.id} className="hover:bg-slate-100/50 transition">
                    <td className="p-3 text-capsule-navy font-black">{course.title}</td>
                    <td className="p-3 text-gray-500">{course.trainer}</td>
                    <td className="p-3 text-gray-500">{course.category}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-capsule-teal/10 text-capsule-teal border border-capsule-teal/20">
                        {course.durationVal}{l.table.unitHours}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`text-[10px] font-black ${
                        course.status === "approved" ? "text-emerald-600" : course.status === "rejected" ? "text-rose-600" : "text-amber-500"
                      }`}>
                        {getStatusLabel(course.status)}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {course.status === "pending" ? (
                        <div className="flex gap-2 justify-center">
                          <button onClick={() => approveCourse(course.id)} className="px-2.5 py-1 text-[10px] font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition cursor-pointer">
                            {l.table.actionApprove}
                          </button>
                          <button onClick={() => rejectCourse(course.id)} className="px-2.5 py-1 text-[10px] font-black text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition cursor-pointer">
                            {l.table.actionReject}
                          </button>
                        </div>
                      ) : course.status === "approved" ? (
                        <span className="text-emerald-600 text-[10px] font-black">{l.table.statusApproved}</span>
                      ) : (
                        <span className="text-rose-600 text-[10px] font-black">{l.table.statusRejected}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      dir={t.dir} 
      className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800 antialiased transition-all duration-300"
    >
      <Navbar 
        activePage="courses" 
        showAuthButtons={false} 
        onSignIn={() => {}} 
        onSignUp={() => {}} 
      />

      <main className="flex-grow">
        
        {/* Hero Banner with responsive graphic calculations based on layout direction */}
        <div className="relative bg-gradient-to-tr from-capsule-footer via-capsule-navy to-capsule-teal text-white py-14 px-8 overflow-hidden shadow-inner">
          <div className={`absolute top-1/2 -translate-y-1/2 hidden lg:block opacity-80 ${heroDecorationAlign}`}>
            <div className="relative w-80 h-40">
              <div className={`absolute w-72 h-24 bg-white/10 border border-white/20 rounded-full ${heroArcAlign}`}></div>
              <div className={`absolute w-64 h-20 bg-[#EAB308] rounded-full top-12 shadow-lg ${heroBallAlign}`}></div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto relative z-10">
            <h1 className="text-3xl font-extrabold text-white">{l.hero.title}</h1>
            <p className="text-gray-100 text-sm max-w-xl mt-2">{l.hero.subtitle}</p>
          </div>
        </div>

        {/* Primary Dashboard layout workspace */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          
          {/* Top KPI Metrics Row to display real-time counters dynamically computed from state */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <p className="text-xs font-bold text-gray-400 mb-1">{l.stats.total}</p>
              <p className="text-2xl font-black text-[#0D4C54]">{courses.length}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <p className="text-xs font-bold text-gray-400 mb-1">{l.stats.approved}</p>
              <p className="text-2xl font-black text-emerald-600">
                {courses.filter((c) => c.status === "approved").length}
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <p className="text-xs font-bold text-gray-400 mb-1">{l.stats.pending}</p>
              <p className="text-2xl font-black text-[#EAB308]">
                {courses.filter((c) => c.status === "pending").length}
              </p>
            </div>
          </div>

          {/* Interactive Administrative Courses Approval Data Table */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-base font-bold text-[#0D4C54]">{l.table.cardTitle}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className={`w-full border-collapse ${tableAlign}`}>
                <thead>
                  <tr className="bg-gray-100/50 text-xs font-bold text-gray-500 border-b border-gray-100">
                    <th className="p-4">{l.table.colTitle}</th>
                    <th className="p-4">{l.table.colTrainer}</th>
                    <th className="p-4">{l.table.colCategory}</th>
                    <th className="p-4">{l.table.colDuration}</th>
                    <th className="p-4">{l.table.colStatus}</th>
                    <th className="p-4 text-center">{l.table.colActions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm font-medium">
                  {courses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50/50 transition">
                      <td className="p-4 text-[#0D4C54] font-bold">{course.title}</td>
                      <td className="p-4 text-gray-500">{course.trainer}</td>
                      <td className="p-4 text-gray-500">{course.category}</td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded-md text-xs font-bold bg-teal-50 text-[#00A499]">
                          {course.durationVal}{l.table.unitHours}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-xs font-bold ${
                            course.status === "approved"
                              ? "text-emerald-600"
                              : course.status === "rejected"
                              ? "text-red-600"
                              : "text-[#EAB308]"
                          }`}
                        >
                          {getStatusLabel(course.status)}
                        </span>
                      </td>
                      {/* Contextual Action cells that respond to the current course approval state */}
                      <td className="p-4 text-center">
                        {course.status === "pending" ? (
                          <div className="flex gap-2 justify-center">
                            <Button onClick={() => approveCourse(course.id)}>
                              {l.table.actionApprove}
                            </Button>
                            <button
                              type="button"
                              onClick={() => rejectCourse(course.id)}
                              className="px-5 py-2.5 text-sm font-bold bg-red-500 hover:bg-red-600 text-white rounded-xl transition duration-150 active:scale-[0.98] shadow-xs cursor-pointer"
                            >
                              {l.table.actionReject}
                            </button>
                          </div>
                        ) : course.status === "approved" ? (
                          <span className="text-emerald-600 text-xs font-bold">{l.table.statusApproved}</span>
                        ) : (
                          <span className="text-red-600 text-xs font-bold">{l.table.statusRejected}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CoursesApproval;