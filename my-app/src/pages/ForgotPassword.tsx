// src/pages/ForgotPassword.tsx
import React, { useState, ChangeEvent, FormEvent } from "react";
import { CapsuleMark } from "../components/Icons";
import "../styles/auth.css";
import { Link } from "react-router-dom";
// ربط الصفحة بالسياق العالمي للغات لكي تعمل الترجمة فوراً[cite: 11]
import { useLanguage } from "../context/LanguageContext";
// API base URL — single source of truth
import { BASE_URL } from "../services/api";

// النصوص المستخدمة في الصفحة باللغتين العربية والإنجليزية[cite: 11]
const TEXT = {
  ar: {
    dir: "rtl",
    brand: "Capsule",
    tagline: "أدخل بريدك الإلكتروني وسنرسل لك رابط استعادة كلمة المرور",
    title: "نسيت كلمة المرور؟",
    subtitle: "أدخل بريدك الإلكتروني المسجل وسنرسل لك رابط إعادة تعيين كلمة المرور.",
    email: "البريد الإلكتروني",
    emailPlaceholder: "example@email.com",
    send: "إرسال",
    sending: "جارٍ الإرسال...",
    back: "العودة إلى تسجيل الدخول",
    successTitle: "تحقق من بريدك الإلكتروني",
    successMessage: "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.",
    resendText: "لم يصلك البريد الإلكتروني؟",
    resend: "إعادة الإرسال",
    invalidEmail: "الرجاء إدخل بريد إلكتروني صحيح.",
    serverError: "حدث خطأ في الاتصال بالخادم، يرجى المحاولة مرة أخرى.",
  },
  en: {
    dir: "ltr",
    brand: "Capsule",
    tagline: "Enter your email and we'll send you a password reset link",
    title: "Forgot Password?",
    subtitle: "Enter your registered email and we'll send you a password reset link.",
    email: "Email",
    emailPlaceholder: "example@email.com",
    send: "Send",
    sending: "Sending...",
    back: "Back to Sign In",
    successTitle: "Check your email",
    successMessage: "A password reset link has been sent to your email.",
    resendText: "Didn't receive the email?",
    resend: "Resend",
    invalidEmail: "Please enter a valid email address.",
    serverError: "An error occurred connecting to the server, please try again.",
  },
};

export default function ForgotPassword() {
  // جلب حالة اللغة ودالة التبديل مباشرة من الـ Context المشترك للمشروع[cite: 11]
  const { lang, toggleLanguage } = useLanguage();
  const t = TEXT[lang as keyof typeof TEXT] ?? TEXT.ar;

  // تخزين البريد الإلكتروني الذي يدخله المستخدم[cite: 11]
  const [email, setEmail] = useState<string>("");
  // تخزين رسالة الخطأ[cite: 11]
  const [error, setError] = useState<string>("");
  // تحديد ما إذا كانت عملية الإرسال جارية[cite: 11]
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  // تحديد ما إذا تم إرسال الطلب بنجاح[cite: 11]
  const [submitted, setSubmitted] = useState<boolean>(false);

  // التحقق من صحة صيغة البريد الإلكتروني[cite: 11]
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // تنفيذ عملية إرسال النموذج والربط مع السيرفر[cite: 11]
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!emailRegex.test(email.trim())) {
      setError(t.invalidEmail);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error || data.message || t.serverError);
        return;
      }

      setSubmitted(true);
    } catch (err) {
      setError(t.serverError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-root" dir={t.dir} lang={lang}>
      <div className="auth-shell">
        <div className="auth-visual">
          <button
            type="button"
            className="lang-toggle"
            onClick={toggleLanguage}
            disabled={isSubmitting}
          >
            {lang === "ar" ? "EN" : "AR"}
          </button>

          <div className="auth-visual-inner">
            <div className="auth-brand">
              <CapsuleMark size={36} />
              <span>{t.brand}</span>
            </div>

            <div className="auth-art" aria-hidden="true">
              <div className="capsule-big" />
              <div className="capsule-small" />
              <span className="spark spark-1">✦</span>
              <span className="spark spark-2">✦</span>
            </div>

            <p className="auth-tagline">{t.tagline}</p>
          </div>
        </div>

        <div className="auth-form-side">
          <div className="auth-form-wrap">
            <h2>{t.title}</h2>

            {!submitted ? (
              <>
                <p className="auth-subtitle">{t.subtitle}</p>

                <form className="auth-form" onSubmit={handleSubmit}>
                  <div className="field">
                    <label>{t.email}</label>
                    <input
                      type="email"
                      placeholder={t.emailPlaceholder}
                      value={email}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                    {error && <span className="field-error" style={{ color: "#991b1b", display: "block", marginTop: "4px" }}>{error}</span>}
                  </div>

                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t.sending : t.send}
                  </button>
                </form>
              </>
            ) : (
              <div className="success-box">
                <div className="success-icon" style={{ color: "#16a34a", fontSize: "24px", marginBottom: "8px" }}>✓</div>
                <h3>{t.successTitle}</h3>
                <p className="auth-subtitle">{t.successMessage}</p>

                <p className="switch-line">
                  {t.resendText}{" "}
                  <button
                    type="button"
                    className="switch-btn"
                    onClick={() => setSubmitted(false)}
                  >
                    {t.resend}
                  </button>
                </p>
              </div>
            )}

            <p className="switch-line">
              <Link to="/sign-in" className="link-muted as-link" style={{ pointerEvents: isSubmitting ? "none" : "auto" }}>
                {t.back}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}