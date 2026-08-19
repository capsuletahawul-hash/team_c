import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import lightLogo from "../assets/light_trans_logo.png";
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import UserProfileMenu from './UserProfileMenu';

// ... inside Navbar component:
function Navbar({ 
  activePage = 'dashboard', 
}: NavbarProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { t, lang, toggleLanguage } = useLanguage();
  const isRTL = t.dir === 'rtl';
  const { theme } = useTheme();
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks: NavLinkItem[] = [
    { id: "home", label: t.nav.home, to: "/" },
    { id: "courses", label: t.nav.courses, to: "/courses-overview" },
    { id: "bootcamps", label: t.nav.bootcamps, to: "/courses-overview" },
  ];

  const currentLogo = theme === 'dark' ? lightLogo : logo;

  return (
    <nav
      className="sticky top-0 z-50 bg-white/85 dark:bg-[#0A0F1D]/90 backdrop-blur-xl border-b border-gray-200/80 dark:border-slate-800/80 shadow-md transition-all duration-300"
      dir={t.dir}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-16">
        
        {/* Logo and Main Links */}
        <div className="flex items-center gap-12">
          {/* Logo Brand Frame */}
          <Link to="/" className="flex items-center gap-3 cursor-pointer">
            <img
              src={currentLogo}
              alt="Capsula Tahawul Logo"
              className="w-12 h-12 object-contain"
            />
            <span className="text-lg font-extrabold tracking-wide text-capsule-navy dark:text-white">
              {t.brand}
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                to={link.to}
                className={`group relative pb-2 transition-all duration-300 ${
                  activePage === link.id
                    ? "text-capsule-teal"
                    : "text-gray-600 hover:text-capsule-teal"
                }`}
              >
                {link.label}
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-capsule-teal transition-all duration-300 ${
                    activePage === link.id
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            ))}
          </div>
        </div>

        {/* Desktop Actions: Toggle + Auth */}
        <div className="hidden md:flex items-center gap-4 px-4">
          
          {/* Language Toggle (Desktop) */}
          <button 
            onClick={toggleLanguage}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-xs px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer border border-gray-200 shadow-xs"
          >
            {lang === 'ar' ? 'EN' : 'AR'}
          </button>

          {/* Day/Night Theme Toggle (UIverse strong-squid-82 CSS Button) */}
          <ThemeToggle size="14px" />

          {/* Conditional authentication buttons framework — now based on real auth state */}
          {!isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                to="/sign-in"
                className="px-4 h-8 rounded-full border border-capsule-navy text-capsule-navy dark:border-sky-400 dark:text-sky-400 font-semibold hover:bg-capsule-navy hover:text-white transition-all duration-300 flex items-center justify-center cursor-pointer text-xs"
              >
                {t.tabs.login}
              </Link>

              <Link
                to="/sign-up"
                className="px-4 h-8 rounded-full bg-gradient-to-r from-capsule-teal to-capsule-navy text-white font-semibold shadow-md hover:scale-105 transition-all duration-300 flex items-center justify-center cursor-pointer text-xs"
              >
                {t.tabs.signup}
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/cart"
                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-capsule-teal/20 text-gray-700 dark:text-sky-300 font-bold flex items-center justify-center transition-all cursor-pointer border border-gray-200 dark:border-white/10 shadow-xs"
                title={lang === 'ar' ? 'السلة' : 'Cart'}
              >
                🛒
              </Link>

              {/* 👤 Modern Profile Menu with Avatar, Name, Role Badge, and Dashboard Links */}
              <UserProfileMenu />
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="text-capsule-navy focus:outline-none text-xl p-1 cursor-pointer"
          >
            {isOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu Drawer */}
      {isOpen && (
        <div className="md:hidden mt-4 bg-gray-50 rounded-xl p-4 flex flex-col space-y-3 font-semibold text-sm border border-gray-100 mx-6 mb-4">
          
          {/* Language Toggle (Mobile) */}
          <button 
            onClick={toggleLanguage}
            className="self-start mb-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-extrabold text-xs px-4 py-2 rounded-full transition-all duration-200 cursor-pointer"
          >
            {lang === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
          </button>

          {/* FIXED: Swapped 'a' element mapping with 'href' to React Router 'Link' mapping with 'to' */}
          {navLinks.map(link => (
            <Link 
              key={link.id} 
              to={link.to} 
              onClick={() => setIsOpen(false)}
              className={`p-2 rounded-lg ${
                activePage === link.id ? 'bg-capsule-teal/10 text-capsule-teal' : 'text-gray-600'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {!isAuthenticated ? (
            <div className="flex flex-col gap-2 pt-3 mt-1 border-t border-gray-200">
              <Link
                to="/sign-in"
                onClick={() => setIsOpen(false)}
                className={`p-2 rounded-lg font-bold text-capsule-navy hover:bg-gray-100 transition cursor-pointer ${
                  t.dir === 'rtl' ? 'text-right' : 'text-left'
                }`}
              >
                {t.tabs.login}
              </Link>
              <Link
                to="/sign-up"
                onClick={() => setIsOpen(false)}
                className="p-2.5 rounded-lg text-center font-bold text-white bg-capsule-navy hover:bg-capsule-teal transition cursor-pointer"
              >
                {t.tabs.signup}
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-3 mt-1 border-t border-gray-200">
              <button
                onClick={() => { setIsOpen(false); handleLogout(); }}
                className={`p-2.5 rounded-lg text-center font-bold text-white bg-capsule-navy hover:bg-capsule-teal transition cursor-pointer`}
              >
                {lang === 'ar' ? 'تسجيل الخروج' : 'Log Out'}
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;