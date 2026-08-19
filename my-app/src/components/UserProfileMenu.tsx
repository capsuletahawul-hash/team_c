import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, Role } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  UserIcon, ChevronDownIcon, ArrowLeftStartOnRectangleIcon,
  Square2StackIcon, BookOpenIcon, Cog6ToothIcon, ShieldCheckIcon,
  AcademicCapIcon, BuildingOfficeIcon
} from '@heroicons/react/24/outline';

interface UserProfileMenuProps {
  customRole?: Role;
  customName?: string;
  customEmail?: string;
}

export default function UserProfileMenu({ customRole, customName, customEmail }: UserProfileMenuProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [fetchedUser, setFetchedUser] = useState<{ name?: string; email?: string; avatar?: string } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { role: authRole, logout } = useAuth();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const isRTL = lang === 'ar';

  const activeRole: Role = customRole || authRole || (sessionStorage.getItem('user_role') as Role) || 'student';

  // 🛰️ Fetch real user details from Backend API if logged in
  useEffect(() => {
    const token = sessionStorage.getItem('user_token');
    if (token) {
      fetch('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user) {
            const userName = data.user.name || data.user.fullName;
            if (userName) sessionStorage.setItem('user_name', userName);
            if (data.user.email) sessionStorage.setItem('user_email', data.user.email);
            if (data.user.avatar) sessionStorage.setItem('user_avatar', data.user.avatar);
            setFetchedUser({
              name: userName,
              email: data.user.email,
              avatar: data.user.avatar
            });
          }
        })
        .catch(() => { });
    }
  }, []);

  // Extract user details from storage, state, or fallbacks
  const storedName = customName || fetchedUser?.name || sessionStorage.getItem('user_name');
  const storedEmail = customEmail || fetchedUser?.email || sessionStorage.getItem('user_email');
  const userAvatar = fetchedUser?.avatar || sessionStorage.getItem('user_avatar');

  // Role metadata mapping
  const roleConfig = {
    admin: {
      titleAr: "المشرف الرئيسي",
      titleEn: "Administrator",
      dashboardPath: "/admin-dashboard",
      profilePath: "/admin-dashboard",
      badgeColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      icon: ShieldCheckIcon,
      defaultNameAr: "مشرف المنصة الرئيسي",
      defaultNameEn: "System Administrator",
      defaultEmail: "admin@capsula-tahawul.sa"
    },
    trainer: {
      titleAr: "مدرب معتمد",
      titleEn: "Certified Trainer",
      dashboardPath: "/trainer-dashboard",
      profilePath: "/trainer-profile",
      badgeColor: "bg-capsule-teal/10 text-capsule-teal dark:text-teal-400 border-capsule-teal/20",
      icon: AcademicCapIcon,
      defaultNameAr: "حساب المدرب",
      defaultNameEn: "Trainer Account",
      defaultEmail: "trainer@capsula-tahawul.sa"
    },
    student: {
      titleAr: "طالب متدرب",
      titleEn: "Enrolled Student",
      dashboardPath: "/student-dashboard",
      profilePath: "/student-profile",
      badgeColor: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
      icon: UserIcon,
      defaultNameAr: "حساب الطالب",
      defaultNameEn: "Student Account",
      defaultEmail: "student@capsula-tahawul.sa"
    },
    company: {
      titleAr: "حساب شريك / شركة",
      titleEn: "Corporate Partner",
      dashboardPath: "/company-dashboard",
      profilePath: "/company-dashboard",
      badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      icon: BuildingOfficeIcon,
      defaultNameAr: "شركة التحول التقني",
      defaultNameEn: "Tech Transformation Co.",
      defaultEmail: "business@capsula-tahawul.sa"
    }
  };

  const currentConfig = roleConfig[activeRole || 'student'] || roleConfig.student;

  const displayName = storedName || (isRTL ? currentConfig.defaultNameAr : currentConfig.defaultNameEn);
  const displayEmail = storedEmail || currentConfig.defaultEmail;
  const roleTitle = isRTL ? currentConfig.titleAr : currentConfig.titleEn;

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate('/');
  };

  return (
    <div className="relative inline-block text-start" ref={dropdownRef}>
      {/* 👤 Trigger Button: User Avatar + Name + Role Subtitle + Chevron */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 pr-3 pl-2 sm:px-3 sm:py-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-gray-200/80 dark:border-slate-700/80 shadow-xs transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-capsule-teal/50"
      >
        {/* Avatar Image or Initial Letter Circle */}
        {userAvatar ? (
          <img src={userAvatar} alt={displayName} className="w-8 h-8 rounded-full object-cover shadow-xs shrink-0 border border-capsule-teal/30" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-capsule-navy to-capsule-teal text-white flex items-center justify-center font-extrabold text-xs shadow-xs shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}

        {/* User Name & Role Subtitle (Desktop View) */}
        <div className="hidden sm:flex flex-col text-start leading-tight">
          <span className="text-xs font-black text-capsule-navy dark:text-slate-100 max-w-[120px] truncate">
            {displayName}
          </span>
          <span className="text-[10px] font-extrabold text-capsule-teal dark:text-teal-400">
            {roleTitle}
          </span>
        </div>

        {/* Chevron Dropdown Arrow */}
        <ChevronDownIcon className={`w-3.5 h-3.5 text-gray-500 dark:text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* 📜 Dropdown Popover Window (100% Solid Opaque Background - Zero Transparency) */}
      {isOpen && (
        <div
          className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-72 bg-white dark:bg-[#0B1120] rounded-2xl border-2 border-slate-300 dark:border-slate-700 shadow-[0_30px_90px_rgba(0,0,0,0.98)] z-[99999] overflow-hidden animate-in fade-in zoom-in-95 duration-150`}
        >
          {/* Top User Info Card (100% Solid Background) */}
          <div className="p-4 bg-slate-100 dark:bg-[#162035] border-b-2 border-slate-200 dark:border-slate-700 flex items-center gap-3">
            {userAvatar ? (
              <img src={userAvatar} alt={displayName} className="w-11 h-11 rounded-2xl object-cover shadow-md shrink-0 border border-white/20" />
            ) : (
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-capsule-navy via-capsule-teal to-sky-400 text-white flex items-center justify-center font-black text-base shadow-md shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0 text-start">
              <h4 className="text-xs font-black text-capsule-navy dark:text-white truncate">
                {displayName}
              </h4>
              <p className="text-[10px] text-slate-600 dark:text-slate-300 truncate mb-1">
                {displayEmail}
              </p>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-black border ${currentConfig.badgeColor}`}>
                <currentConfig.icon className="w-3 h-3" />
                {roleTitle}
              </span>
            </div>
          </div>

          {/* Quick Action Navigation Links (Solid 100% Opaque Fill) */}
          <div className="p-2 space-y-1 text-xs font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-[#0B1120]">
            {/* Dashboard Link (Always shown) */}
            <Link
              to={currentConfig.dashboardPath}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-[#162035] hover:bg-teal-50 dark:hover:bg-teal-950/60 hover:text-capsule-teal dark:hover:text-teal-400 transition-colors"
            >
              <Square2StackIcon className="w-4 h-4 text-capsule-teal dark:text-teal-400" />
              <span>{isRTL ? 'لوحة التحكم الرئيسية' : 'Main Dashboard'}</span>
            </Link>

            {/* Profile Link — Shown for Student/Trainer/Company */}
            {activeRole !== 'admin' && (
              <Link
                to={currentConfig.profilePath}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-[#162035] hover:bg-teal-50 dark:hover:bg-teal-950/60 hover:text-capsule-teal dark:hover:text-teal-400 transition-colors"
              >
                <UserIcon className="w-4 h-4 text-capsule-teal dark:text-teal-400" />
                <span>{isRTL ? 'الملف الشخصي والبيانات' : 'Profile & Account'}</span>
              </Link>
            )}
          </div>

          {/* 100% Solid Divider Line */}
          <div className="h-[2px] w-full bg-slate-200 dark:bg-slate-700" />

          {/* Log Out Action Button */}
          <div className="p-2 bg-white dark:bg-[#0B1120]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-[#162035] text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/80 font-bold transition-colors text-xs cursor-pointer"
            >
              <ArrowLeftStartOnRectangleIcon className="w-4 h-4" />
              <span>{isRTL ? 'تسجيل الخروج' : 'Log Out'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
