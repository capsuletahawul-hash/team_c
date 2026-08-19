import React, { useState, useEffect } from "react";

// Reusable Components
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/Button";
import LoadingIndicator from "../components/LoadingIndicator";
import SkeletonLoader from "../components/SkeletonLoader";

// Global Context
import { useLanguage } from "../context/LanguageContext";

// Centralized API functions
import { 
  getAdminCourses, 
  approveAdminCourse, 
  rejectAdminCourse,
  approveAdminCourseDeletion,
  rejectAdminCourseDeletion
} from "../services/api";

// Union type restricting system course approval states
type CourseStatus = "pending" | "approved" | "rejected" | "pending_deletion";

// Interface enforcing types for course metrics and keys
interface CourseItem {
  id: number | string;
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
  const isRtl = t.dir === "rtl";

  const defaultCopy = {
    hero: {
      title: isRtl ? "اعتماد وتعديلات دورات المدربين" : "Courses & Bootcamp Approvals",
      subtitle: isRtl ? "مراجعة واعتماد الدورات الجديدة أو طلبات الحذف المقدمة من المدربين" : "Review, approve new courses or process deletion requests submitted by trainers",
    },
    stats: {
      total: isRtl ? "إجمالي الكورسات" : "Total Courses",
      approved: isRtl ? "المعتمدة" : "Approved",
      pending: isRtl ? "جديد (قيد الانتظار)" : "New Pending",
      deletionRequests: isRtl ? "طلبات الحذف" : "Deletion Requests",
    },
    table: {
      cardTitle: isRtl ? "جدول طلبات واعتمادات الدورات" : "Course Submissions & Deletion Requests",
      colTitle: isRtl ? "اسم الدورة" : "Course Title",
      colTrainer: isRtl ? "المدرب" : "Trainer",
      colCategory: isRtl ? "التصنيف" : "Category",
      colDuration: isRtl ? "المدة" : "Duration",
      colStatus: isRtl ? "الحالة" : "Status",
      colActions: isRtl ? "الإجراءات" : "Actions",
      unitHours: isRtl ? " أسبوع" : " Wks",
      actionApprove: isRtl ? "اعتماد" : "Approve",
      actionReject: isRtl ? "رفض" : "Reject",
      actionConfirmDelete: isRtl ? "تأكيد الحذف" : "Approve Deletion",
      actionRejectDelete: isRtl ? "رفض الحذف" : "Reject Deletion",
      statusApproved: isRtl ? "معتمد" : "Approved",
      statusRejected: isRtl ? "مرفوض" : "Rejected",
      statusPendingDeletion: isRtl ? "طلب حذف" : "Deletion Requested",
      approvedText: isRtl ? "معتمد" : "Approved",
      rejectedText: isRtl ? "مرفوض" : "Rejected",
      pendingText: isRtl ? "قيد الانتظار" : "Pending",
    }
  };

  const l = t.coursesApproval || defaultCopy;

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
  const approveCourse = async (id: number | string): Promise<void> => {
    try {
      await approveAdminCourse(Number(id) || (id as any));

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
  const rejectCourse = async (id: number | string): Promise<void> => {
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

  // Handler triggered by administrator to confirm deletion request (permanently deletes course)
  const handleApproveDeletion = async (id: number | string): Promise<void> => {
    if (!window.confirm(isRtl ? 'هل أنت متأكد من الموافقة على حذف هذه الدورة نهائياً؟' : 'Approve deletion request and remove course permanently?')) return;
    try {
      await approveAdminCourseDeletion(id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Error approving deletion request', err);
    }
  };

  // Handler triggered by administrator to reject deletion request (restores course to approved)
  const handleRejectDeletion = async (id: number | string): Promise<void> => {
    try {
      await rejectAdminCourseDeletion(id);
      setCourses((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "approved" } : c))
      );
    } catch (err) {
      console.error('Error rejecting deletion request', err);
    }
  };

  // Dynamic localization mapper to keep rendering logic clean and independent
  const getStatusLabel = (status: CourseStatus): string => {
    if (status === "approved") return l.table.statusApproved || l.data?.approvedText || (isRtl ? "معتمد" : "Approved");
    if (status === "rejected") return l.table.statusRejected || l.data?.rejectedText || (isRtl ? "مرفوض" : "Rejected");
    if (status === "pending_deletion") return l.table.statusPendingDeletion || (isRtl ? "طلب حذف" : "Deletion Requested");
    return l.table.pendingText || l.data?.pendingText || (isRtl ? "قيد الانتظار" : "Pending");
  };

  // Bidirectional layout utility flags
  const heroDecorationAlign = isRtl ? "left-[-40px]" : "right-[-40px]";
  const heroBallAlign = isRtl ? "rotate-[-25deg] left-10" : "rotate-[25deg] right-10";
  const heroArcAlign = isRtl ? "rotate-[-25deg]" : "rotate-[25deg]";
  const tableAlign = isRtl ? "text-right" : "text-left";

  if (loading) {
    if (isEmbedded) {
      return <SkeletonLoader variant="table" dir={t.dir} />;
    }
    return (
      <div className="min-h-screen bg-slate-200/80 dark:bg-[#030611] flex flex-col" dir={t.dir}>
        <Navbar activePage="home" />
        <div className="flex-grow max-w-7xl mx-auto px-6 py-10 w-full">
          <SkeletonLoader variant="table" dir={t.dir} />
        </div>
        <Footer />
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

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-100/90 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 hover:-translate-y-1 dark:hover:bg-slate-700/90 dark:hover:border-sky-400/60 dark:hover:shadow-sky-500/10 transition-all duration-300 cursor-pointer">
              <p className="text-[10px] font-black text-gray-600 dark:text-slate-300 uppercase mb-1">{l.stats?.total || (isRtl ? "إجمالي الكورسات" : "Total Courses")}</p>
              <p className="text-xl font-black font-mono text-capsule-navy dark:text-white">{courses.length}</p>
            </div>
            <div className="bg-slate-100/90 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 hover:-translate-y-1 dark:hover:bg-slate-700/90 dark:hover:border-emerald-400/60 dark:hover:shadow-emerald-500/10 transition-all duration-300 cursor-pointer">
              <p className="text-[10px] font-black text-gray-600 dark:text-slate-300 uppercase mb-1">{l.stats?.approved || (isRtl ? "المعتمدة" : "Approved")}</p>
              <p className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                {courses.filter((c) => c.status === "approved").length}
              </p>
            </div>
            <div className="bg-slate-100/90 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 hover:-translate-y-1 dark:hover:bg-slate-700/90 dark:hover:border-amber-400/60 dark:hover:shadow-amber-500/10 transition-all duration-300 cursor-pointer">
              <p className="text-[10px] font-black text-gray-600 dark:text-slate-300 uppercase mb-1">{l.stats?.pending || (isRtl ? "قيد الانتظار" : "Pending")}</p>
              <p className="text-xl font-black font-mono text-amber-500 dark:text-amber-400">
                {courses.filter((c) => c.status === "pending").length}
              </p>
            </div>
            <div className="bg-rose-50/90 dark:bg-rose-950/60 p-4 rounded-2xl border border-rose-200 dark:border-rose-800 hover:-translate-y-1 dark:hover:bg-rose-900/80 dark:hover:border-rose-500 dark:hover:shadow-rose-500/20 transition-all duration-300 cursor-pointer">
              <p className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase mb-1">{l.stats?.deletionRequests || (isRtl ? "طلبات الحذف" : "Deletion Requests")}</p>
              <p className="text-xl font-black font-mono text-rose-600 dark:text-rose-400">
                {courses.filter((c) => c.status === "pending_deletion").length}
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
                    <td className="p-3 align-middle whitespace-nowrap">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-extrabold whitespace-nowrap bg-capsule-teal/10 text-capsule-teal border border-capsule-teal/20">
                        {course.durationVal}{l.table.unitHours}
                      </span>
                    </td>
                    <td className="p-3 align-middle whitespace-nowrap">
                      <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-extrabold whitespace-nowrap ${
                        course.status === "approved"
                          ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60"
                          : course.status === "rejected"
                          ? "text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60"
                          : course.status === "pending_deletion"
                          ? "text-rose-700 bg-rose-100 dark:bg-rose-900/60 dark:text-rose-300 border border-rose-300 font-extrabold animate-pulse"
                          : "text-amber-700 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60"
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
                      ) : course.status === "pending_deletion" ? (
                        <div className="flex gap-2 justify-center">
                          <button onClick={() => handleApproveDeletion(course.id)} className="px-2.5 py-1 text-[10px] font-black text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition cursor-pointer shadow-sm">
                            {l.table?.actionConfirmDelete || (isRtl ? "قبول طلب الحذف" : "Approve Deletion")}
                          </button>
                          <button onClick={() => handleRejectDeletion(course.id)} className="px-2.5 py-1 text-[10px] font-black text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg transition cursor-pointer">
                            {l.table?.actionRejectDelete || (isRtl ? "رفض طلب الحذف" : "Reject Deletion")}
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
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-10">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <p className="text-xs font-bold text-gray-500 mb-1">{l.stats?.total || (isRtl ? "إجمالي الكورسات" : "Total Courses")}</p>
              <p className="text-2xl font-black text-[#0D4C54]">{courses.length}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <p className="text-xs font-bold text-gray-500 mb-1">{l.stats?.approved || (isRtl ? "المعتمدة" : "Approved")}</p>
              <p className="text-2xl font-black text-emerald-600">
                {courses.filter((c) => c.status === "approved").length}
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <p className="text-xs font-bold text-gray-500 mb-1">{l.stats?.pending || (isRtl ? "قيد الانتظار" : "Pending")}</p>
              <p className="text-2xl font-black text-[#EAB308]">
                {courses.filter((c) => c.status === "pending").length}
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-xs">
              <p className="text-xs font-bold text-rose-600 mb-1">{l.stats?.deletionRequests || (isRtl ? "طلبات الحذف" : "Deletion Requests")}</p>
              <p className="text-2xl font-black text-rose-600">
                {courses.filter((c) => c.status === "pending_deletion").length}
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
                      <td className="p-4 align-middle text-slate-900 dark:text-white font-bold">{course.title}</td>
                      <td className="p-4 align-middle text-gray-600 dark:text-slate-300">{course.trainer}</td>
                      <td className="p-4 align-middle text-gray-600 dark:text-slate-300">{course.category}</td>
                      <td className="p-4 align-middle whitespace-nowrap">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-extrabold bg-teal-50 dark:bg-teal-950/60 text-[#00A499] dark:text-teal-300 border border-teal-200/50 dark:border-teal-700/50 whitespace-nowrap">
                          {course.durationVal}{l.table.unitHours}
                        </span>
                      </td>
                      <td className="p-4 align-middle whitespace-nowrap">
                        <span
                          className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-extrabold whitespace-nowrap ${
                            course.status === "approved"
                              ? "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60"
                              : course.status === "rejected"
                              ? "text-red-700 dark:text-rose-300 bg-red-50 dark:bg-rose-950/60 border border-red-200/60 dark:border-rose-800/60"
                              : course.status === "pending_deletion"
                              ? "text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/60 border border-rose-300 dark:border-rose-700 animate-pulse"
                              : "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800/60"
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
                        ) : course.status === "pending_deletion" ? (
                          <div className="flex gap-2 justify-center">
                            <button
                              type="button"
                              onClick={() => handleApproveDeletion(course.id)}
                              className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition duration-150 active:scale-[0.98] shadow-xs cursor-pointer"
                            >
                              {l.table?.actionConfirmDelete || (isRtl ? "قبول طلب الحذف" : "Approve Deletion")}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectDeletion(course.id)}
                              className="px-4 py-2 text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl transition duration-150 active:scale-[0.98] cursor-pointer"
                            >
                              {l.table?.actionRejectDelete || (isRtl ? "رفض طلب الحذف" : "Reject Deletion")}
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