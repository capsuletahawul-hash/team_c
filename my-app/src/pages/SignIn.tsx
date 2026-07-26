// صفحة تسجيل الدخول.
import React, { ChangeEvent, FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

import { COPY } from "../i18n/copy";
import { EyeIcon } from "../components/Icons";
import logo from "../assets/light_trans_logo.png";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../mocks/mockApi";
// import { CapsuleMark, EyeIcon } from "../components/Icons";
// import { useAuth } from "../context/AuthContext";
// API base URL — single source of truth
import { BASE_URL } from "../services/api";
// @ts-ignore: allow side-effect CSS import without type declarations
import "../styles/auth.css";

/**
 * صفحة تسجيل الدخول.
 * تستقبل من الأب (App.jsx):
 * - lang        : اللغة الحالية ("ar" أو "en")
 * - onToggleLang: دالة لتبديل اللغة
 * - onGoToSignUp: دالة للتنقل إلى صفحة إنشاء الحساب
 */
interface SignInProps {
  lang: string;
  onToggleLang: () => void;
  onGoToSignUp: () => void;
}

export default function SignIn({ lang, onToggleLang, onGoToSignUp }: SignInProps) {
  const [showPw, setShowPw] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const navigate = useNavigate();
  const { login } = useAuth();



  const t = COPY[lang as keyof typeof COPY];
  const form = t.login;

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        // أخطاء التحقق من الحقول ترجع من الباك اند كـ object (حقل -> رسائل)، نحولها لنص واحد مقروء
        const rawError = result.error || result.message;
        const serverError =
          rawError && typeof rawError === "object"
            ? Object.values(rawError).flat().join(" ")
            : rawError;

        setErrorMsg(serverError || "البريد الإلكتروني أو كلمة المرور غير صحيحة.");
        return;
      }

      // تحويل الرتبة إلى حروف صغيرة لتتوافق مع نظام الـ Dashboard الحالي
      const role = result.user.role.toLowerCase();

      // تخزين التوكن الحقيقي القادم من الباك اند — بدونه أي طلب محمي لاحقاً يفشل بـ invalid_token
      login(role as any, result.token);

      // التوجيه للوحة التحكم الصحيحة بناءً على نوع المستخدم
      if (role === "student") {
        navigate("/student-dashboard");
      } else if (role === "trainer") {
        navigate("/trainer-dashboard");
      } else if (role === "admin") {
        navigate("/admin-dashboard");
      } else if (role === "company") {
        navigate("/company-dashboard");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      setErrorMsg("حدث خطأ غير متوقع أثناء الاتصال بالخادم، يرجى المحاولة لاحقاً.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root" dir={t.dir} lang={lang}>
      <div className="auth-shell">
        {/* القسم الخاص بالشكل والتصميم */}
        <div className="auth-visual">
          <button className="lang-toggle" onClick={onToggleLang}>
            {lang === "ar" ? "EN" : "AR"}
          </button>
          <div className="auth-visual-inner">
            <div className="auth-brand" style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"12px"}}>
              <img
                src={logo}
                alt="Capsule Tahawul"
                style={{width:"300px",height:"auto"}}
              />
              <span>{t.brand}</span>
            </div>
            <p className="auth-tagline">{t.tagline}</p>
          </div>
        </div>

        {/* نموذج تسجيل الدخول */}
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
              >
                {lang === "ar" ? "← رجوع" : "Back →"}
              </button>
            </div>

            <div className="auth-tabs">
              <button className="is-active">{t.tabs.login}</button>
              <button onClick={onGoToSignUp}>{t.tabs.signup}</button>
              <span className="tab-underline pos-1" />
            </div>

            <h2>{form.title}</h2>
            <p className="auth-subtitle">{form.subtitle}</p>

            {/* تم حذف زر تعبئة بيانات الأدمن السريع من هنا */}

            {/* عرض رسالة الخطأ في حال وجودها */}
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

            {/* نموذج إدخال بيانات تسجيل الدخول */}
            <form className="auth-form" onSubmit={handleLogin}>
              {/* حقل البريد الإلكتروني */}
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

              {/* حقل كلمة المرور */}
              <div className="field">
                <label>{form.password}</label>
                <div className="password-input">
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder={form.passwordPh}
                    value={password}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
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
              </div>

              {/* خيارات تذكرني ورابط نسيت كلمة المرور */}
              <div className="row-between">
                <label className="checkbox">
                  <input type="checkbox" disabled={loading} />
                  <span>{form.remember}</span>
                </label>
                <Link to="/forgot-password" className="link-muted">
                  {form.forgot}
                </Link>
              </div>

              <button 
                type="submit" 
                className="submit-btn" 
                disabled={loading}
                style={{ opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
              >
                {loading ? (lang === "ar" ? "جاري تسجيل الدخول..." : "Signing in...") : form.submit}
              </button>
            </form>

            <div className="divider"><span>{form.or}</span></div>

            {/* أزرار تسجيل الدخول عبر وسائل التواصل */}
            <div className="social-row">
              {t.social.map((s: string, i: number) => (
                <button key={i} className="social-btn" disabled={loading}>
                  {s === "Google" ? "🔴" : "🔵"} {s}
                </button>
              ))}
            </div>

            <p className="switch-line">
              {form.noAccount}{" "}
              <button className="switch-btn" onClick={onGoToSignUp} disabled={loading}>
                {form.switchLink}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}