import React, { useState, useEffect } from "react";

// Reusable Components
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/Button";
import LoadingIndicator from "../components/LoadingIndicator";

// Global Context
import { useLanguage } from "../context/LanguageContext";

// Centralized API functions
import {
  getAdminContracts,
  approveAdminContract,
  rejectAdminContract,
  getAdminTickets,
  updateAdminTicketStatus,
} from "../services/api";

// Union type restricting system contract-request approval states
type ContractStatus = "pending" | "approved" | "rejected";
type TicketStatus = "review" | "issued" | "approved";

// Interface enforcing types for public onboarding contract-request records
// (submitted from the public Business Contract form, before signup)
interface ContractItem {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  trainingType: string;
  trainees: number;
  startDate: string;
  notes: string;
  status: ContractStatus;
  createdAt: string;
}

// Interface enforcing types for authenticated companies' bootcamp tickets
// (submitted from the "Request Bootcamp" tab inside the Company Dashboard)
interface TicketItem {
  id: string;
  companyId: string;
  companyName: string;
  program: string;
  count: number;
  budget: number;
  domain: string;
  date: string;
  status: TicketStatus;
  base: number;
  discount: number;
}

interface ContractsApprovalProps {
  isEmbedded?: boolean;
}

const ContractsApproval: React.FC<ContractsApprovalProps> = ({ isEmbedded = false }) => {
  const { t } = useLanguage();
  const l = t.contractsApproval;
  const isRtl = t.dir === "rtl";

  // Which queue is currently on screen — mirrors the tab pattern already
  // used in CompanyDashboard.tsx for visual consistency across dashboards
  const [activeTab, setActiveTab] = useState<"onboarding" | "tickets">("onboarding");

  // React states to manage asynchronous UI lifecycle and dynamic list updates
  const [requests, setRequests] = useState<ContractItem[]>([]);
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<boolean>(false);

  // Safely fetch and populate both queues on mount with clean-up tracking
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [contractsResult, ticketsResult] = await Promise.all([
          getAdminContracts(),
          getAdminTickets(),
        ]);
        if (!isMounted) return;

        if (contractsResult?.success && contractsResult.data) {
          setRequests(contractsResult.data.requests as ContractItem[]);
        }
        if (ticketsResult?.success && ticketsResult.data) {
          setTickets(ticketsResult.data.tickets as TicketItem[]);
        }
        if (!contractsResult?.success && !ticketsResult?.success) {
          setLoadError(true);
        }
      } catch (err) {
        console.error("Error fetching company requests for approval", err);
        if (isMounted) setLoadError(true);
      }

      if (isMounted) setLoading(false);
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handler triggered by the administrator to approve a specific onboarding request
  const approveRequest = async (id: string): Promise<void> => {
    try {
      await approveAdminContract(id);
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "approved" } : r)));
    } catch (err) {
      console.error("Error approving contract request", err);
    }
  };

  // Handler triggered by the administrator to reject a specific onboarding request
  const rejectRequest = async (id: string): Promise<void> => {
    try {
      await rejectAdminContract(id);
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "rejected" } : r)));
    } catch (err) {
      console.error("Error rejecting contract request", err);
    }
  };

  // Handler triggered by the administrator to issue a quote on a pending bootcamp ticket,
  // moving it from "review" to "issued" so the company can accept/amend it on their side
  const issueQuote = async (id: string): Promise<void> => {
    try {
      await updateAdminTicketStatus(id, "issued");
      setTickets((prev) => prev.map((tkt) => (tkt.id === id ? { ...tkt, status: "issued" } : tkt)));
    } catch (err) {
      console.error("Error issuing quote for ticket", err);
    }
  };

  // Dynamic localization mapper to keep rendering logic clean and independent
  const getStatusLabel = (status: ContractStatus): string => {
    if (status === "approved") return l.data.approvedText;
    if (status === "rejected") return l.data.rejectedText;
    return l.data.pendingText;
  };

  const getTicketStatusLabel = (status: TicketStatus): string => {
    if (status === "approved") return isRtl ? "معتمد ومقبول" : "Approved";
    if (status === "issued") return isRtl ? "تم إصدار عرض السعر" : "Quotation Issued";
    return isRtl ? "قيد المراجعة" : "Under Review";
  };

  // Bidirectional layout utility flags
  const heroDecorationAlign = isRtl ? "left-[-40px]" : "right-[-40px]";
  const heroBallAlign = isRtl ? "rotate-[-25deg] left-10" : "rotate-[25deg] right-10";
  const heroArcAlign = isRtl ? "rotate-[-25deg]" : "rotate-[25deg]";
  const tableAlign = isRtl ? "text-right" : "text-left";

  // Graceful handling of loading states
  if (loading) {
    if (isEmbedded) {
      return (
        <div className="w-full py-2">
          <LoadingIndicator variant="table" message={l.loading} />
        </div>
      );
    }
    return (
      <div className="min-h-screen flex flex-col justify-between bg-[#C9D6DF] dark:bg-[#0A0F1D]">
        <Navbar activePage="home" />
        <div className="max-w-7xl mx-auto px-6 py-6 w-full">
          <LoadingIndicator variant="table" message={l.loading} />
        </div>
        <Footer />
      </div>
    );
  }

  // Graceful handling of fetch failures to prevent blank UI or crashes
  if (loadError) {
    return (
      <div className="p-8 flex items-center justify-center bg-transparent">
        <p className="text-sm font-semibold text-rose-500">
          {isRtl ? "تعذر تحميل طلبات الشركات." : "Unable to load company requests."}
        </p>
      </div>
    );
  }

  if (isEmbedded) {
    return (
      <div dir={t.dir} className="font-sans text-slate-800 dark:text-slate-100 antialiased">
        <div className="bg-white/90 dark:bg-[#162035]/80 backdrop-blur-md border border-white dark:border-white/10 rounded-3xl p-6 shadow-sm overflow-hidden mb-6">
          <h2 className="text-sm font-black text-capsule-navy dark:text-white border-b border-slate-200/80 dark:border-slate-800 pb-3 mb-4">{l.hero.title}</h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 font-bold mb-4">{l.hero.subtitle}</p>

          <div className="flex border-b border-slate-200/80 dark:border-slate-800 mb-6 gap-1 md:gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab("onboarding")}
              className={`whitespace-nowrap px-4 py-2 font-black text-xs transition-all border-b-2 cursor-pointer ${
                activeTab === "onboarding" ? "border-b-capsule-teal text-capsule-teal dark:text-teal-300" : "border-b-transparent text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-white"
              }`}
            >
              {isRtl ? "طلبات الانضمام (نموذج عام)" : "Onboarding Requests"}
            </button>
            <button
              onClick={() => setActiveTab("tickets")}
              className={`whitespace-nowrap px-4 py-2 font-black text-xs transition-all border-b-2 cursor-pointer ${
                activeTab === "tickets" ? "border-b-capsule-teal text-capsule-teal dark:text-teal-300" : "border-b-transparent text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-white"
              }`}
            >
              {isRtl ? "تذاكر المعسكرات (من لوحة الشركة)" : "Bootcamp Tickets"}
            </button>
          </div>

          {activeTab === "onboarding" && (
            <div className="overflow-x-auto">
              {requests.length === 0 ? (
                <p className="p-6 text-xs text-gray-400 dark:text-slate-400 font-black">{l.table.noRequestsText}</p>
              ) : (
                <table className={`w-full border-collapse ${tableAlign} text-xs`}>
                  <thead>
                    <tr className="bg-slate-200/80 dark:bg-[#0F172A]/80 text-capsule-navy dark:text-white font-black border-b border-slate-300 dark:border-slate-800">
                      <th className="p-3">{l.table.id}</th>
                      <th className="p-3">{l.table.company}</th>
                      <th className="p-3">{l.table.contact}</th>
                      <th className="p-3">{l.table.trainingType}</th>
                      <th className="p-3">{l.table.trainees}</th>
                      <th className="p-3">{l.table.status}</th>
                      <th className="p-3 text-center">{l.table.action}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800 font-bold">
                    {requests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition">
                        <td className="p-3 font-mono text-capsule-teal dark:text-sky-400">{req.id.slice(0, 8)}...</td>
                        <td className="p-3 text-gray-700 dark:text-white font-bold">{req.companyName}</td>
                        <td className="p-3 text-gray-500 dark:text-slate-300">
                          <p>{req.contactPerson}</p>
                          <span className="text-[9px] text-gray-400 dark:text-slate-400">{req.email}</span>
                        </td>
                        <td className="p-3 text-gray-500 dark:text-slate-300">{req.trainingType}</td>
                        <td className="p-3 text-gray-500 dark:text-slate-300">{req.trainees}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                            req.status === 'approved' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' : req.status === 'rejected' ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                          }`}>
                            {getStatusLabel(req.status)}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {req.status === "pending" ? (
                            <div className="flex gap-2 justify-center">
                              <button onClick={() => approveRequest(req.id)} className="px-2 py-1 text-[10px] font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition cursor-pointer">
                                {l.table.approveAction}
                              </button>
                              <button onClick={() => rejectRequest(req.id)} className="px-2 py-1 text-[10px] font-black text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition cursor-pointer">
                                {l.table.rejectAction}
                              </button>
                            </div>
                          ) : req.status === "approved" ? (
                            <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-black">{l.table.statusApproved}</span>
                          ) : (
                            <span className="text-rose-600 dark:text-rose-400 text-[10px] font-black">{l.table.statusRejected}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === "tickets" && (
            <div className="overflow-x-auto mt-4">
              {tickets.length === 0 ? (
                <p className="p-6 text-xs text-gray-400 dark:text-slate-400 font-black">{isRtl ? "لا توجد تذاكر معسكرات بعد." : "No bootcamp tickets yet."}</p>
              ) : (
                <table className={`w-full border-collapse ${tableAlign} text-xs`}>
                  <thead>
                    <tr className="bg-slate-200/80 dark:bg-[#0F172A]/80 text-capsule-navy dark:text-white font-black border-b border-slate-300 dark:border-slate-800">
                      <th className="p-3">{isRtl ? "رقم التذكرة" : "Ticket ID"}</th>
                      <th className="p-3">{isRtl ? "الشركة" : "Company"}</th>
                      <th className="p-3">{isRtl ? "البرنامج" : "Program"}</th>
                      <th className="p-3">{isRtl ? "عدد الموظفين" : "Employees"}</th>
                      <th className="p-3">{isRtl ? "الميزانية" : "Budget"}</th>
                      <th className="p-3">{isRtl ? "الحالة" : "Status"}</th>
                      <th className="p-3 text-center">{isRtl ? "الإجراء" : "Action"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800 font-bold">
                    {tickets.map((tkt) => (
                      <tr key={tkt.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition">
                        <td className="p-3 font-mono text-capsule-teal dark:text-sky-400">{tkt.id.slice(0, 8)}...</td>
                        <td className="p-3 text-gray-700 dark:text-white font-bold">{tkt.companyName}</td>
                        <td className="p-3 text-gray-500 dark:text-slate-300">
                          <p>{tkt.program}</p>
                          <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-300 inline-block mt-0.5">{tkt.domain}</span>
                        </td>
                        <td className="p-3 text-gray-500 dark:text-slate-300">{tkt.count}</td>
                        <td className="p-3 text-gray-500 dark:text-slate-300 font-mono">{tkt.budget.toLocaleString()} {isRtl ? "ر.س" : "SAR"}</td>
                        <td className="p-3">
                          <span className={`text-[10px] font-black ${
                            tkt.status === "approved" ? "text-emerald-600 dark:text-emerald-400" : tkt.status === "issued" ? "text-indigo-600 dark:text-sky-400" : "text-amber-500 dark:text-amber-400"
                          }`}>
                            {getTicketStatusLabel(tkt.status)}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {tkt.status === "review" ? (
                            <button onClick={() => issueQuote(tkt.id)} className="px-2.5 py-1 text-[10px] bg-capsule-teal text-white rounded-lg font-black hover:bg-teal-700 transition cursor-pointer">
                              {isRtl ? "إصدار عرض السعر" : "Issue Quote"}
                            </button>
                          ) : (
                            <span className="text-gray-400 dark:text-slate-500 italic text-[10px]">
                              {isRtl ? "بانتظار قرار الشركة" : "Awaiting company decision"}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      dir={t.dir}
      className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0F1D] flex flex-col font-sans text-slate-800 dark:text-slate-100 antialiased transition-all duration-300"
    >
      <Navbar activePage="companies" showAuthButtons={false} onSignIn={() => {}} onSignUp={() => {}} />

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

          {/* Tab switcher — same visual pattern as CompanyDashboard.tsx's tabs */}
          <div className="flex border-b border-slate-200/80 dark:border-slate-800 mb-8 gap-1 md:gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab("onboarding")}
              className={`whitespace-nowrap px-4 py-3 font-black text-xs md:text-sm transition-all border-b-2 cursor-pointer ${
                activeTab === "onboarding" ? "border-b-[#00A499] text-[#00A499] dark:text-teal-300" : "border-b-transparent text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-white"
              }`}
            >
              {isRtl ? "طلبات الانضمام (نموذج عام)" : "Onboarding Requests"}
            </button>
            <button
              onClick={() => setActiveTab("tickets")}
              className={`whitespace-nowrap px-4 py-3 font-black text-xs md:text-sm transition-all border-b-2 cursor-pointer ${
                activeTab === "tickets" ? "border-b-[#00A499] text-[#00A499] dark:text-teal-300" : "border-b-transparent text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-white"
              }`}
            >
              {isRtl ? "تذاكر المعسكرات (من لوحة الشركة)" : "Bootcamp Tickets"}
            </button>
          </div>

          {activeTab === "onboarding" && (
            <>
              {/* Top KPI Metrics Row to display real-time counters dynamically computed from state */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                <div className="bg-white dark:bg-[#162035]/80 backdrop-blur-xl p-5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs">
                  <p className="text-xs font-bold text-gray-400 dark:text-slate-400 mb-1">{l.stats.total}</p>
                  <p className="text-2xl font-black text-[#0D4C54] dark:text-white">{requests.length}</p>
                </div>
                <div className="bg-white dark:bg-[#162035]/80 backdrop-blur-xl p-5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs">
                  <p className="text-xs font-bold text-gray-400 dark:text-slate-400 mb-1">{l.stats.approved}</p>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {requests.filter((r) => r.status === "approved").length}
                  </p>
                </div>
                <div className="bg-white dark:bg-[#162035]/80 backdrop-blur-xl p-5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs">
                  <p className="text-xs font-bold text-gray-400 dark:text-slate-400 mb-1">{l.stats.pending}</p>
                  <p className="text-2xl font-black text-[#EAB308] dark:text-amber-400">
                    {requests.filter((r) => r.status === "pending").length}
                  </p>
                </div>
              </div>

              {/* Interactive Administrative Contract Requests Approval Data Table */}
              <div className="bg-white dark:bg-[#162035]/80 backdrop-blur-xl border border-gray-100 dark:border-white/10 rounded-2xl shadow-xs overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-[#0F172A]/50">
                  <h2 className="text-base font-bold text-[#0D4C54] dark:text-white">{l.table.cardTitle}</h2>
                </div>
                <div className="overflow-x-auto">
                  {requests.length === 0 ? (
                    <p className="p-6 text-sm text-gray-400 dark:text-slate-400 font-semibold">
                      {isRtl ? "لا توجد طلبات انضمام بعد." : "No onboarding requests yet."}
                    </p>
                  ) : (
                    <table className={`w-full border-collapse ${tableAlign}`}>
                      <thead>
                        <tr className="bg-gray-100/50 dark:bg-[#0F172A]/80 text-xs font-bold text-gray-500 dark:text-slate-300 border-b border-gray-100 dark:border-slate-800">
                          <th className="p-4">{l.table.colCompany}</th>
                          <th className="p-4">{l.table.colContact}</th>
                          <th className="p-4">{l.table.colTrainingType}</th>
                          <th className="p-4">{l.table.colTrainees}</th>
                          <th className="p-4">{l.table.colStatus}</th>
                          <th className="p-4 text-center">{l.table.colActions}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60 text-sm font-medium">
                        {requests.map((req) => (
                          <tr key={req.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition">
                            <td className="p-4 align-middle text-[#0D4C54] dark:text-white font-bold">{req.companyName}</td>
                            <td className="p-4 align-middle text-gray-500 dark:text-slate-300">
                              <p>{req.contactPerson}</p>
                              <p dir="ltr" className="text-xs text-gray-400 dark:text-slate-400">{req.email}</p>
                            </td>
                            <td className="p-4 align-middle text-gray-500 dark:text-slate-300">{req.trainingType}</td>
                            <td className="p-4 align-middle whitespace-nowrap">
                              <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-50 dark:bg-teal-950/60 text-[#00A499] dark:text-teal-300 border border-teal-200/50 dark:border-teal-700/40">
                                {req.trainees}
                              </span>
                            </td>
                            <td className="p-4 align-middle whitespace-nowrap">
                              <span
                                className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${
                                  req.status === "approved" 
                                    ? "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60" 
                                    : req.status === "rejected" 
                                    ? "text-red-700 dark:text-rose-300 bg-red-50 dark:bg-rose-950/60 border border-red-200/60 dark:border-rose-800/60" 
                                    : "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800/60"
                                }`}
                              >
                                {getStatusLabel(req.status)}
                              </span>
                            </td>
                            {/* Contextual Action cells that respond to the current request approval state */}
                            <td className="p-4 text-center">
                              {req.status === "pending" ? (
                                <div className="flex gap-2 justify-center">
                                  <Button onClick={() => approveRequest(req.id)}>{l.table.actionApprove}</Button>
                                  <button
                                    type="button"
                                    onClick={() => rejectRequest(req.id)}
                                    className="px-5 py-2.5 text-sm font-bold bg-red-500 hover:bg-red-600 text-white rounded-xl transition duration-150 active:scale-[0.98] shadow-xs cursor-pointer"
                                  >
                                    {l.table.actionReject}
                                  </button>
                                </div>
                              ) : req.status === "approved" ? (
                                <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold">{l.table.statusApproved}</span>
                              ) : (
                                <span className="text-red-600 dark:text-rose-400 text-xs font-bold">{l.table.statusRejected}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === "tickets" && (
            <>
              {/* Top KPI Metrics Row for bootcamp tickets */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                <div className="bg-white dark:bg-[#162035]/80 backdrop-blur-xl p-5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs">
                  <p className="text-xs font-bold text-gray-400 dark:text-slate-400 mb-1">{isRtl ? "إجمالي التذاكر" : "Total Tickets"}</p>
                  <p className="text-2xl font-black text-[#0D4C54] dark:text-white">{tickets.length}</p>
                </div>
                <div className="bg-white dark:bg-[#162035]/80 backdrop-blur-xl p-5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs">
                  <p className="text-xs font-bold text-gray-400 dark:text-slate-400 mb-1">{isRtl ? "عروض صادرة" : "Quoted"}</p>
                  <p className="text-2xl font-black text-indigo-600 dark:text-sky-400">
                    {tickets.filter((tk) => tk.status === "issued").length}
                  </p>
                </div>
                <div className="bg-white dark:bg-[#162035]/80 backdrop-blur-xl p-5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs">
                  <p className="text-xs font-bold text-gray-400 dark:text-slate-400 mb-1">{isRtl ? "بانتظار المراجعة" : "Pending Review"}</p>
                  <p className="text-2xl font-black text-[#EAB308] dark:text-amber-400">
                    {tickets.filter((tk) => tk.status === "review").length}
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-[#162035]/80 backdrop-blur-xl border border-gray-100 dark:border-white/10 rounded-2xl shadow-xs overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-[#0F172A]/50">
                  <h2 className="text-base font-bold text-[#0D4C54] dark:text-white">
                    {isRtl ? "تذاكر طلب المعسكرات التدريبية" : "Bootcamp Request Tickets"}
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  {tickets.length === 0 ? (
                    <p className="p-6 text-sm text-gray-400 dark:text-slate-400 font-semibold">
                      {isRtl ? "لا توجد تذاكر معسكرات بعد." : "No bootcamp tickets yet."}
                    </p>
                  ) : (
                    <table className={`w-full border-collapse ${tableAlign}`}>
                      <thead>
                        <tr className="bg-gray-100/50 dark:bg-[#0F172A]/80 text-xs font-bold text-gray-500 dark:text-slate-300 border-b border-gray-100 dark:border-slate-800">
                          <th className="p-4">{isRtl ? "رقم التذكرة" : "Ticket ID"}</th>
                          <th className="p-4">{isRtl ? "الشركة" : "Company"}</th>
                          <th className="p-4">{isRtl ? "البرنامج" : "Program"}</th>
                          <th className="p-4">{isRtl ? "عدد الموظفين" : "Employees"}</th>
                          <th className="p-4">{isRtl ? "الميزانية" : "Budget"}</th>
                          <th className="p-4">{isRtl ? "الحالة" : "Status"}</th>
                          <th className="p-4 text-center">{isRtl ? "الإجراء" : "Action"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60 text-sm font-medium">
                        {tickets.map((tkt) => (
                          <tr key={tkt.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition">
                            <td className="p-4 font-mono font-bold text-[#0D4C54] dark:text-sky-400">{tkt.id}</td>
                            <td className="p-4 text-gray-700 dark:text-white font-bold">{tkt.companyName}</td>
                            <td className="p-4 text-gray-500 dark:text-slate-300">
                              <p>{tkt.program}</p>
                              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-300 mt-1 inline-block">{tkt.domain}</span>
                            </td>
                            <td className="p-4 text-gray-500 dark:text-slate-300">{tkt.count}</td>
                            <td className="p-4 text-gray-500 dark:text-slate-300 font-mono">{tkt.budget.toLocaleString()} {isRtl ? "ر.س" : "SAR"}</td>
                            <td className="p-4">
                              <span
                                className={`text-xs font-bold ${
                                  tkt.status === "approved" ? "text-emerald-600 dark:text-emerald-400" : tkt.status === "issued" ? "text-indigo-600 dark:text-sky-400" : "text-[#EAB308] dark:text-amber-400"
                                }`}
                              >
                                {getTicketStatusLabel(tkt.status)}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              {tkt.status === "review" ? (
                                <Button onClick={() => issueQuote(tkt.id)}>
                                  {isRtl ? "إصدار عرض السعر" : "Issue Quote"}
                                </Button>
                              ) : (
                                <span className="text-gray-400 dark:text-slate-500 italic text-xs">
                                  {isRtl ? "بانتظار قرار الشركة" : "Awaiting company decision"}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContractsApproval;
