import React, { useState } from "react";

// Reusable UI components
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/Button";

// Global language context for localization (i18n)
import { useLanguage } from "../context/LanguageContext";

// Centralized API layer — submits directly to the backend so the request
// reaches the Admin's contract review queue (no runtime mock calls)
import { submitContractRequest } from "../services/api";

// TypeScript interface for strict form data typing
interface FormDataState {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  trainingType: string;
  trainees: string;
  startDate: string;
  notes: string;
}

const BusinessContractForm: React.FC = () => {
  const { t, lang } = useLanguage();
  const l = t.businessForm;

  // Initial state values for clean form resetting
  const initialFormState: FormDataState = {
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    trainingType: "",
    trainees: "",
    startDate: "",
    notes: "",
  };

  const [formData, setFormData] = useState<FormDataState>(initialFormState);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Dynamic input handler updating state by input name attribute
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handles form submission via the real backend (/api/contracts), surfaces
  // validation errors, and resets the form + shows the success notification
  // only once the request is confirmed. The submission lands in the Admin's
  // contract review queue (see ContractsApproval.tsx) for approval.
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);

    try {
      const response = await submitContractRequest({
        companyName: formData.companyName,
        contactPerson: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        trainingType: formData.trainingType,
        trainees: Number(formData.trainees) || 0,
        startDate: formData.startDate,
        notes: formData.notes,
      });

      if (response.success) {
        setSubmitted(true);
        setFormData(initialFormState);
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        const rawError = (response as any).error;
        const fieldError =
          rawError && typeof rawError === "object" ? Object.values(rawError).flat()[0] : rawError;
        setSubmitError(
          (fieldError as string) ||
            (isRtl ? "حدث خطأ أثناء إرسال الطلب." : "Something went wrong while submitting the request.")
        );
      }
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : isRtl
          ? "تعذر الاتصال بالسيرفر."
          : "Could not reach the server."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Dynamic styling variables based on active layout direction
  const isRtl = lang === "ar" || t.dir === "rtl";
  const borderSide = isRtl ? "border-r-4" : "border-l-4";
  const textAlign = isRtl ? "text-right" : "text-left";
  const flexAlignment = isRtl ? "justify-end" : "justify-start";
  const heroDecorationAlign = isRtl ? "left-[-40px]" : "right-[-40px]";
  const heroBallAlign = isRtl ? "rotate-[-25deg] left-10" : "rotate-[25deg] right-10";
  const heroArcAlign = isRtl ? "rotate-[-25deg]" : "rotate-[25deg]";

  return (
    <div 
      dir={t.dir} 
      className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0F1D] flex flex-col font-sans text-slate-800 dark:text-slate-100 antialiased transition-all duration-300"
    >
      <Navbar 
        activePage="companies" 
        showAuthButtons={true} 
        onSignIn={() => {}} 
        onSignUp={() => {}} 
      />

      <main className="flex-grow">
        {/* Hero Section with responsive bidirectional background graphics */}
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

        {/* Main Form container */}
        <div className="max-w-3xl mx-auto py-12 px-6">
          <div className={`bg-white dark:bg-[#162035]/80 backdrop-blur-xl rounded-2xl border border-gray-100 dark:border-white/10 shadow-xl p-8 ${textAlign}`}>
            <h2 className="text-base font-bold text-[#0D4C54] dark:text-white mb-6 pb-3 border-b border-gray-100 dark:border-slate-800">{l.form.title}</h2>

            {/* Conditionally rendered success message */}
            {submitted && (
              <div className={`p-4 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold shadow-xs mb-6 flex items-center gap-2 ${borderSide}`}>
                <span>{l.form.successMsg}</span>
              </div>
            )}

            {/* Conditionally rendered API/validation error message */}
            {submitError && (
              <div className={`p-4 bg-red-50 dark:bg-rose-950/60 border-red-500 text-red-700 dark:text-rose-300 rounded-xl text-xs font-bold shadow-xs mb-6 flex items-center gap-2 ${borderSide}`}>
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Company & Contact names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="font-bold text-xs text-gray-500 dark:text-slate-300 block mb-1.5">{l.inputs.companyName}</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-200 dark:border-white/15 rounded-xl p-3 text-sm font-medium focus:outline-none focus:border-[#00A499] bg-gray-50/50 dark:bg-[#0F172A] text-[#0D4C54] dark:text-white transition placeholder:text-gray-400 dark:placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-xs text-gray-500 dark:text-slate-300 block mb-1.5">{l.inputs.contactPerson}</label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-200 dark:border-white/15 rounded-xl p-3 text-sm font-medium focus:outline-none focus:border-[#00A499] bg-gray-50/50 dark:bg-[#0F172A] text-[#0D4C54] dark:text-white transition placeholder:text-gray-400 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Email & Phone numbers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="font-bold text-xs text-gray-500 dark:text-slate-300 block mb-1.5">{l.inputs.email}</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-200 dark:border-white/15 rounded-xl p-3 text-sm font-medium focus:outline-none focus:border-[#00A499] bg-gray-50/50 dark:bg-[#0F172A] text-[#0D4C54] dark:text-white text-left transition placeholder:text-gray-400 dark:placeholder:text-slate-500"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="font-bold text-xs text-gray-500 dark:text-slate-300 block mb-1.5">{l.inputs.phone}</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-200 dark:border-white/15 rounded-xl p-3 text-sm font-medium focus:outline-none focus:border-[#00A499] bg-gray-50/50 dark:bg-[#0F172A] text-[#0D4C54] dark:text-white text-left transition placeholder:text-gray-400 dark:placeholder:text-slate-500"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Training type selection & Trainees count */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="font-bold text-xs text-gray-500 dark:text-slate-300 block mb-1.5">{l.inputs.trainingType}</label>
                  <select
                    name="trainingType"
                    value={formData.trainingType}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-200 dark:border-white/15 rounded-xl p-3 text-sm font-bold focus:outline-none focus:border-[#00A499] bg-gray-50 dark:bg-[#0F172A] text-[#0D4C54] dark:text-white transition cursor-pointer"
                  >
                    <option value="" className="text-gray-400 dark:text-slate-500">{l.inputs.selectType}</option>
                    <option value="course">{l.inputs.type1}</option>
                    <option value="bootcamp">{l.inputs.type2}</option>
                    <option value="workshop">{l.inputs.type3}</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-xs text-gray-500 dark:text-slate-300 block mb-1.5">{l.inputs.trainees}</label>
                  <input
                    type="number"
                    name="trainees"
                    min="1"
                    value={formData.trainees}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-200 dark:border-white/15 rounded-xl p-3 text-sm font-medium focus:outline-none focus:border-[#00A499] bg-gray-50/50 dark:bg-[#0F172A] text-[#0D4C54] dark:text-white transition placeholder:text-gray-400 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Training start date */}
              <div>
                <label className="font-bold text-xs text-gray-500 dark:text-slate-300 block mb-1.5">{l.inputs.startDate}</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className={`w-full border border-gray-200 dark:border-white/15 rounded-xl p-3 text-sm font-bold focus:outline-none focus:border-[#00A499] bg-gray-50/50 dark:bg-[#0F172A] text-[#0D4C54] dark:text-white transition ${textAlign}`}
                />
              </div>

              {/* Additional Notes & Document Upload Dropzone */}
              <div>
                <label className="font-bold text-xs text-gray-500 dark:text-slate-300 block mb-1.5">{l.inputs.notes}</label>
                <textarea
                  rows={4}
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder={l.inputs.placeholderNotes}
                  className="w-full border border-gray-200 dark:border-white/15 rounded-xl p-3 text-sm font-medium focus:outline-none focus:border-[#00A499] resize-none bg-gray-50/50 dark:bg-[#0F172A] text-[#0D4C54] dark:text-white transition placeholder:text-gray-400 dark:placeholder:text-slate-500"
                />
              </div>

              {/* File Attachment Dropzone (RFP / Requirement Documents) */}
              <div>
                <label className="font-bold text-xs text-gray-500 dark:text-slate-300 block mb-1.5">
                  {isRtl ? "إرفاق ملف الشروط أو كراسة الطلب (RFP / PDF)" : "Attach RFP / Contract Document (PDF/Doc)"}
                </label>
                <div className="border-2 border-dashed border-gray-200 dark:border-white/20 hover:border-capsule-teal dark:hover:border-teal-400 rounded-xl p-5 text-center bg-gray-50/40 dark:bg-[#0F172A]/60 transition cursor-pointer">
                  <span className="text-2xl block mb-1">📁</span>
                  <p className="text-xs font-bold text-gray-600 dark:text-slate-300">
                    {isRtl ? "انقر هنا لاختيار الملف أو اسحبه لإرفاقه مع الطلب" : "Click to browse or drag & drop RFP document"}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1 font-mono">PDF, DOCX, ZIP (MAX 10MB)</p>
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx,.zip" />
                </div>
              </div>

              {/* Submit action container */}
              <div className={`pt-4 border-t border-gray-100 dark:border-slate-800 flex ${flexAlignment}`}>
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? (isRtl ? "جارٍ الإرسال..." : "Submitting...") : l.inputs.submitBtn}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BusinessContractForm;
