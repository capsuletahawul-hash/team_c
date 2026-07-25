// صفحة إنشاء حساب جديد حية ومتصلة بالسيرفر
import React, { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { COPY } from "../i18n/copy";

import { EyeIcon } from "../components/Icons";
import logo from "../assets/light_trans_logo.png";
import { useAuth } from "../context/AuthContext";
// import { CapsuleMark, EyeIcon } from "../components/Icons";
// import { useAuth } from "../context/AuthContext";
// API base URL — single source of truth
import { BASE_URL } from "../services/api";
import "../styles/auth.css";

/**
 * صفحة إنشاء حساب.
 * تستقبل من الأب (App.jsx):
 * - lang        : اللغة الحالية ("ar" أو "en")
 * - onToggleLang: دالة لتبديل اللغة
 * - onGoToSignIn: دالة للتنقل إلى صفحة تسجيل الدخول
 */
interface SignUpProps {
  lang: string;
  onToggleLang: () => void;
  onGoToSignIn: () => void;
}

export default function SignUp({ lang, onToggleLang, onGoToSignIn }: SignUpProps) {
  const [showPw, setShowPw] = useState<boolean>(false);
  const [pwValue, setPwValue] = useState<string>("");
  const [role, setRole] = useState<number>(0); // 0: Student, 1: Trainer, 2: Company
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);
  
  // حالات التحميل ورسائل الأخطاء القادمة من السيرفر
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const navigate = useNavigate();
  const { login } = useAuth();


  const t = COPY[lang as keyof typeof COPY];
  const form = t.signup;

  // حساب مستوى قوة كلمة المرور.
  const pwStrength =
    pwValue.length < 6
      ? 0
      : pwValue.length < 10
      ? 1
      : 2;

  // التحقق من استيفاء كلمة المرور لجميع الشروط المطلوبة.
  const passwordChecks = {
    length: pwValue.length >= 8,
    uppercase: /[A-Z]/.test(pwValue),
    lowercase: /[a-z]/.test(pwValue),
    number: /[0-9]/.test(pwValue),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(pwValue),
  };

  // التحقق من صحة البيانات ثم إنشاء الحساب وتوجيه المستخدم حسب نوعه حياً مع الباك إند
  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    // نتأكد أن الحقول ليست فارغة
    if (!name || !email || !pwValue) {
      setErrorMsg(lang === "ar" ? "يرجى تعبئة جميع الحقول المطلوبة." : "Please fill in all required fields.");
      return;
    }

    // التحقق من قبول الشروط
    if (!acceptedTerms) {
      setErrorMsg(
        lang === "ar"
          ? "يجب الموافقة على الشروط والأحكام أولاً للمتابعة."
          : "You must accept the Terms and Conditions to proceed."
      );
      return;
    }

    const isPasswordValid =
      passwordChecks.length &&
      passwordChecks.uppercase &&
      passwordChecks.lowercase &&
      passwordChecks.number &&
      passwordChecks.special;

    if (!isPasswordValid) {
      setErrorMsg(
        lang === "ar" 
          ? "تأكد من استيفاء كلمة المرور لجميع الشروط الأمنية بالأسفل." 
          : "Please ensure your password meets all security requirements below."
      );
      return;
    }

    setLoading(true);

    // تحويل رتبة الحساب الرقمية إلى نصية تتوافق مع السيرفر ونظام التوجيه
    const roleMapping = ["Student", "Trainer", "Company"];
    const roleString = roleMapping[role] || "Student";

    try {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          password: pwValue,
          role: roleString
        })
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        // أخطاء التحقق من الحقول ترجع من الباك اند كـ object (حقل -> رسائل)، نحولها لنص واحد مقروء
        const rawError = result.error || result.message || result.details?.email || result.details?.global;
        const serverError =
          rawError && typeof rawError === "object"
            ? Object.values(rawError).flat().join(" ")
            : rawError;

        setErrorMsg(serverError || (lang === "ar" ? "فشل إنشاء الحساب، يرجى التحقق من البيانات." : "Failed to create account."));
        return;
      }

      // حفظ بيانات التوكين حية داخل الـ Storage في حال إرجاعها من السيرفر مباشرة بعد التسجيل
      if (result.token) {
        localStorage.setItem("user_token", result.token);
      }

      // تحويل الرتبة إلى حروف صغيرة لتتوافق مع نظام الـ Dashboard الحالي
      const role = roleString.toLowerCase();

      login(role as any, result.token);
      // التوجيه التلقائي إلى لوحة التحكم المناسبة للدور الفعلي
      if (role === "student") {
        navigate("/student-dashboard");
      } else if (role === "trainer") {
        navigate("/trainer-dashboard");
      } else if (role === "company") {
        navigate("/company-dashboard");
      } else {
        navigate("/");
      }

    } catch (err: any) {
      setErrorMsg(lang === "ar" ? "حدث خطأ في الاتصال بالخادم، يرجى المحاولة مرة أخرى." : "Server connection failure, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root" dir={t.dir} lang={lang}>
      <div className="auth-shell">
        <div className="auth-visual">
          <button className="lang-toggle" onClick={onToggleLang}>
            {lang === "ar" ? "EN" : "AR"}
          </button>
          <div className="auth-visual-inner">
            <div
              className="auth-brand"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "20px",
              }}
            >
              <img
                src={logo}
                alt="Capsule Tahawul"
                style={{
                  width: "300px",
                  
                  height: "auto",
                }}
              />
            </div>
            <p className="auth-tagline">{t.tagline}</p>
          </div>
        </div>

        <div className="auth-form-side">
          <div className="auth-form-wrap">
            <div
              style={{
                textAlign: lang === "ar" ? "left" : "right",
                marginBottom: "16px",
              }}
            >
              <button
                type="button"
                onClick={() => navigate("/")}
                className="text-[#0f4c81] font-semibold"
                disabled={loading}
              >
                {lang === "ar" ? "← رجوع" : "Back →"}
              </button>
            </div>

            <div className="auth-tabs">
              <button onClick={onGoToSignIn} disabled={loading}>{t.tabs.login}</button>
              <button className="is-active">{t.tabs.signup}</button>
              <span className="tab-underline pos-2" />
            </div>

            <h2>{form.title}</h2>
            <p className="auth-subtitle">{form.subtitle}</p>

            {errorMsg && (
              <div 
                style={{
                  padding: "10px 14px",
                  backgroundColor: "#fee2e2",
                  color: "#991b1b",
                  borderRadius: "6px",
                  marginBottom: "16px",
                  fontSize: "14px",
                  fontWeight: "500",
                  textAlign: "right"
                }}
              >
                ⚠️ {errorMsg}
              </div>
            )}

            <form className="auth-form" onSubmit={handleSignUp}>
              <div className="field">
                <label>{form.name}</label>
                <input
                  type="text"
                  placeholder={form.namePh}
                  value={name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="field">
                <label>{form.email}</label>
                <input
                  type="email"
                  placeholder={form.emailPh}
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="field">
                <label>{form.password}</label>
                <div className="password-input">
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder={form.passwordPh}
                    value={pwValue}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPwValue(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPw(!showPw)}
                    aria-label="toggle password visibility"
                  >
                    <EyeIcon open={showPw} />
                  </button>
                </div>
                {pwValue.length > 0 && (
                  <div className="pw-strength">
                    <div className="pw-bars">
                      {[0, 1, 2].map((i: number) => (
                        <span key={i} className={`pw-bar ${i <= pwStrength ? `level-${pwStrength}` : ""}`} />
                      ))}
                    </div>
                    <span className="pw-label">
                      {t.strengthLabel}: {t.strength[pwStrength]}
                    </span>
                  </div>
                )}
                {pwValue.length === 0 && <span className="pw-hint">{t.passwordHint}</span>}
              </div>

              <div className="password-rules">
                <div className="rule">
                  <span className={`rule-dot ${passwordChecks.length ? "valid" : ""}`}></span>
                  <span>{lang === "ar" ? "8 أحرف على الأقل" : "At least 8 characters"}</span>
                </div>
                <div className="rule">
                  <span className={`rule-dot ${passwordChecks.uppercase ? "valid" : ""}`}></span>
                  <span>{lang === "ar" ? "حرف كبير (A-Z)" : "Uppercase letter (A-Z)"}</span>
                </div>
                <div className="rule">
                  <span className={`rule-dot ${passwordChecks.lowercase ? "valid" : ""}`}></span>
                  <span>{lang === "ar" ? "حرف صغير (a-z)" : "Lowercase letter (a-z)"}</span>
                </div>
                <div className="rule">
                  <span className={`rule-dot ${passwordChecks.number ? "valid" : ""}`}></span>
                  <span>{lang === "ar" ? "رقم (0-9)" : "Number (0-9)"}</span>
                </div>
                <div className="rule">
                  <span className={`rule-dot ${passwordChecks.special ? "valid" : ""}`}></span>
                  <span>{lang === "ar" ? "رمز خاص (!@#$)" : "Special character (!@#$)"}</span>
                </div>
              </div>

              <div className="field">
                <label>{form.role}</label>
                <div className="role-pills">
                  {form.roleOptions.map((r: string, i: number) => (
                    <button
                      type="button"
                      key={i}
                      className={role === i ? "is-active" : ""}
                      onClick={() => setRole(i)}
                      disabled={loading}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <label className="checkbox terms-check">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  disabled={loading}
                />
                <span>{form.terms}</span>
              </label>

              <button 
                type="submit" 
                className="submit-btn" 
                disabled={loading}
                style={{ opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
              >
                {loading ? (lang === "ar" ? "جاري إنشاء الحساب..." : "Creating account...") : form.submit}
              </button>
            </form>

            <div className="divider"><span>{form.or}</span></div>

            <div className="social-row">
              {t.social.map((s: string, i: number) => (
                <button key={i} className="social-btn" disabled={loading}>
                  {s === "Google" ? "🔴" : "🔵"} {s}
                </button>
              ))}
            </div>

            <p className="switch-line">
              {form.haveAccount}{" "}
              <button className="switch-btn" onClick={onGoToSignIn} disabled={loading}>
                {form.switchLink}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}