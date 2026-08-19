// src/App.tsx
import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth, Role } from './context/AuthContext';

// استيراد الصفحات
import LandingPage from './pages/LandingPage';
import StudentDashboard from './pages/StudentDashboard';
import StudentProfile from './pages/StudentProfile';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import BusinessContractForm from './pages/BusinessContractForm';
import TrainerDetails from './pages/TrainerDetails';
import TrainerProfile from './pages/TrainerProfile';
import AdminDashboard from './pages/AdminDashboard';
import TrainerDashboard from './pages/TrainerDashboard';
import SignInSignUpApproval from './pages/CoursesApproval';
import ContractsApproval from './pages/ContractsApproval';
import CourseDetails from './pages/CourseDetails';
import CoursesOverview from "./pages/CoursesOverview";
import StudentCoursesOverview from './pages/StudentCoursesOverview';
import MyCourses from './pages/MyCourses';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import ForgotPassword from "./pages/ForgotPassword";
import CompanyDashboard from './pages/CompanyDashboard'; 
import PaymentPage from './pages/PaymentPage';
import TrainerCourses from "./pages/TrainerCourses";

// --- مكون حماية المسارات (Protected Route Component) ---
interface ProtectedRouteProps {
  element: React.ReactElement;
  allowedRoles?: Role[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, allowedRoles }) => {
  const { isAuthenticated, role } = useAuth();

  // إذا لم يكن المستخدم مسجلاً، يتم توجيهه لصفحة تسجيل الدخول
  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  // إذا كان مسجلاً ولكن رتبته لا تطابق الرتب المسموح لها بدخول الصفحة
  if (allowedRoles && !allowedRoles.includes(role)) {
    const roleDashboardMap: Record<Role, string> = {
      admin: '/admin-dashboard',
      company: '/company-dashboard',
      trainer: '/trainer-dashboard',
      student: '/student-dashboard',
    };
    return <Navigate to={roleDashboardMap[role] || '/'} replace />;
  }

  return element;
};

// --- Small wrappers for pages that expect navigation callbacks as props ---

const LandingRoute: React.FC = () => {
  const navigate = useNavigate();
  return (
    <LandingPage
      onNavigateToRegister={() => navigate('/sign-up')}
      onNavigateToLogin={() => navigate('/sign-in')}
      onNavigateToTrainerOnboarding={() => navigate('/sign-up')}
      onNavigateToCompanyOnboarding={() => navigate('/business-contract')} 
    />
  );
};

const StudentDashboardRoute: React.FC = () => {
  const navigate = useNavigate();
  return <StudentDashboard onNavigateToProfile={() => navigate('/student-profile')} />;
};

const StudentProfileRoute: React.FC = () => {
  const navigate = useNavigate();
  return <StudentProfile onBack={() => navigate('/student-dashboard')} />;
};

const SignInRoute: React.FC = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState<string>('ar');
  return (
    <SignIn
      lang={lang}
      onToggleLang={() => setLang((l) => (l === 'ar' ? 'en' : 'ar'))}
      onGoToSignUp={() => navigate('/sign-up')}
    />
  );
};

const SignUpRoute: React.FC = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState<string>('ar');
  return (
    <SignUp
      lang={lang}
      onToggleLang={() => setLang((l) => (l === 'ar' ? 'en' : 'ar'))}
      onGoToSignIn={() => navigate('/sign-in')}
    />
  );
};

// Dev-only index for local navigation
const DevIndex: React.FC = () => {
  const links: Array<[string, string]> = [
    ['/', 'Landing Page'],
    ['/sign-in', 'Sign In'],
    ['/sign-up', 'Sign Up'],
    ['/student-dashboard', 'Student Dashboard'],
    ['/student-profile', 'Student Profile'],
    ['/my-courses', 'My Courses 🎓'],
    ['/company-dashboard', 'Company Dashboard 🏢'],
    ['/trainer-details', 'Trainer Details'],
    ['/trainer-profile', 'Trainer Profile (standalone)'],
    ['/trainer-dashboard', 'Trainer Dashboard'],
    ['/trainer-courses-catalog', 'Trainer Courses Catalog (learn)'],
    ['/admin-dashboard', 'Admin Dashboard'],
    ['/courses-approval', 'Courses Approval'],
    ['/contracts-approval', 'Contracts Approval 📄'],
    ['/courses-overview', 'Courses Overview'],
    ['/course-details/1', 'Course Details'],
    ['/business-contract', 'Business Contract Form'],
    ['/contact', 'Contact'],
    ['/cart', 'Cart'],
    ['/payment', 'Payment Page 💳'],
  ];

  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h1>Dev Page Index</h1>
      <ul>
        {links.map(([href, label]) => (
          <li key={href}>
            <Link to={href}>{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Routes>
      {/* المسارات العامة (متاحة للجميع) */}
      <Route path="/" element={<LandingRoute />} />
      <Route path="/dev" element={<DevIndex />} />
      <Route path="/sign-in" element={<SignInRoute />} />
      <Route path="/sign-up" element={<SignUpRoute />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/trainer-details/:trainerId" element={<TrainerDetails />} />
      <Route path="/trainer-details" element={<TrainerDetails />} />
      <Route path="/course-details/:id" element={<CourseDetails />} />
      <Route path="/courses-overview" element={<CoursesOverview />} />
      <Route path="/courses" element={<CoursesOverview />} />
      <Route path="/business-contract" element={<BusinessContractForm />} />
      <Route path="/c" element={<PaymentPage />} />

      {/* مسارات الطلاب المحمية (مع السماح للأدمن بالشراء والتصفح) */}
      <Route path="/student-dashboard" element={<ProtectedRoute allowedRoles={['student']} element={<StudentDashboardRoute />} />} />
      <Route path="/student-profile" element={<ProtectedRoute allowedRoles={['student']} element={<StudentProfileRoute />} />} />
      <Route path="/student-courses-overview" element={<ProtectedRoute allowedRoles={['student', 'admin', 'trainer']} element={<StudentCoursesOverview />} />} />
      <Route path="/my-courses" element={<ProtectedRoute allowedRoles={['student', 'admin', 'trainer']} element={<MyCourses />} />} />
      <Route path="/cart" element={<ProtectedRoute allowedRoles={['student', 'trainer', 'admin', 'company']} element={<Cart />} />} />
      
      {/* مسارات الدفع ومعالجة العودة من Moyasar */}
      <Route path="/payment" element={<ProtectedRoute allowedRoles={['student', 'trainer', 'admin', 'company']} element={<PaymentPage />} />} />
      <Route path="/payment/return" element={<ProtectedRoute allowedRoles={['student', 'trainer', 'admin', 'company']} element={<PaymentPage />} />} />

      {/* مسارات الشركات المحمية */}
      <Route path="/company-dashboard" element={<ProtectedRoute allowedRoles={['company']} element={<CompanyDashboard />} />} /> 

      {/* مسارات المدربين المحمية */}
      <Route path="/trainer-dashboard" element={<ProtectedRoute allowedRoles={['trainer']} element={<TrainerDashboard />} />} />
      <Route path="/trainer-profile" element={<ProtectedRoute allowedRoles={['trainer']} element={<TrainerProfile />} />} />
      <Route path="/trainer-courses" element={<ProtectedRoute allowedRoles={['trainer']} element={<TrainerCourses />} />} />
      <Route path="/trainer-courses-catalog" element={<ProtectedRoute allowedRoles={['trainer']} element={<StudentCoursesOverview />} />} />

      {/* مسارات المسؤول (Admin) المحمية */}
      <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={['admin']} element={<AdminDashboard />} />} />
      <Route path="/courses-approval" element={<ProtectedRoute allowedRoles={['admin']} element={<SignInSignUpApproval />} />} />
      <Route path="/contracts-approval" element={<ProtectedRoute allowedRoles={['admin']} element={<ContractsApproval />} />} />
    </Routes>
  );
};

export default App;