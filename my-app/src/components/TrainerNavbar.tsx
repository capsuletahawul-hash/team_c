import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import lightLogo from "../assets/light_trans_logo.png";
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import UserProfileMenu from './UserProfileMenu';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Structural definition for individual Trainer navigation data items.
 */
interface TrainerNavLink {
  id: string;
  label: string;
  to: string;
}

/**
 * Prop interface configuration for the TrainerNavbar component.
 */
interface TrainerNavbarProps {
  activePage?: string;
  showAuthButtons?: boolean;
  onSignIn?: () => void;
  onSignUp?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * TrainerNavbar Component
 * 
 * Secure internal dashboard navigation utility tailored for authorized trainer and 
 * content creator layout workflows. Responsive, multi-lingual, and supporting LTR/RTL.
 */
function TrainerNavbar({ 
  activePage = 'dashboard', 
  showAuthButtons = false, 
  onSignIn, 
  onSignUp 
}: TrainerNavbarProps): React.JSX.Element {
  // Mobile drawer drawer visibility state tracker
  const [isOpen, setIsOpen] = useState<boolean>(false);
  
  // Extract contextual parameters for regional localization setups
  const { t, lang, toggleLanguage } = useLanguage();
  const isRTL = t.dir === 'rtl';
  const { theme } = useTheme();

  const currentLogo = theme === 'dark' ? lightLogo : logo;

  /**
   * Safe localized application paths mapped specifically for the educator interface.
   */
  const navLinks: TrainerNavLink[] = [
    {
      id: "home",
      label: lang === "ar" ? "الرئيسية" : "Home",
      to: "/",
    },
    {
      id: "courses",
      label: lang === "ar" ? "دوراتي" : "My Courses",
      to: "/trainer-courses",
    },
    {
      id: "learn",
      label: lang === "ar" ? "الدورات" : "Courses",
      to: "/courses-overview",
    },
  ];

  return (
    <nav
      className="sticky top-0 z-50 bg-white/85 dark:bg-[#0A0F1D]/90 backdrop-blur-xl border-b border-gray-200/80 dark:border-slate-800/80 shadow-md transition-all duration-300"
      dir={t.dir}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-16">
        
        {/* Logo and Main Links */}
        <div className="flex items-center gap-12">
          {/* Main Home Branding Path */}
          <Link to="/trainer-dashboard" className="flex items-center gap-3 cursor-pointer">
            <img
              src={currentLogo}
              alt="Capsula Tahawul Logo"
              className="w-12 h-12 object-contain"
            />
            <span className="text-lg font-extrabold tracking-wide text-capsule-navy dark:text-white">
              {t.brand}
            </span>
          </Link>

          {/* Desktop Links Container */}
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

        {/* Desktop Actions Layout Panel */}
        <div className="hidden md:flex items-center gap-4 px-4">

          {/* 🛒 رابط السلة */}
          <Link
            to="/cart"
            className={`w-10 h-10 flex items-center justify-center rounded-full transition ${
              activePage === 'shopping-cart' ? 'bg-capsule-teal/10 text-capsule-teal' : 'hover:bg-gray-100 text-gray-700'
            }`}
            title={lang === "ar" ? "السلة" : "Cart"}
          >
            🛒
          </Link>

          {/* Desktop Language Toggle Button */}
          <button 
            onClick={toggleLanguage}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-xs px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer border border-gray-200 shadow-xs"
          >
            {lang === 'ar' ? 'EN' : 'AR'}
          </button>

          {/* Day/Night Theme Toggle (UIverse strong-squid-82 CSS Button) */}
          <ThemeToggle size="14px" />

          {/* Conditional layout switching based on public login settings context */}
          {showAuthButtons ? (
            <div className="flex items-center gap-3">
              <button
                onClick={onSignIn}
                className="px-4 h-8 rounded-full border border-capsule-navy text-capsule-navy font-semibold hover:bg-capsule-navy hover:text-white transition-all duration-300 flex items-center justify-center cursor-pointer"
              >
                {t.tabs.login}
              </button>

              <button
                onClick={onSignUp}
                className="px-4 h-8 rounded-full bg-gradient-to-r from-capsule-teal to-capsule-navy text-white font-semibold shadow-md hover:scale-105 transition-all duration-300 flex items-center justify-center cursor-pointer"
              >
                {t.tabs.signup}
              </button>
            </div>
          ) : (
            <UserProfileMenu customRole="trainer" />
          )}
        </div>

        {/* Mobile View Toggle Triggers */}
        <div className="md:hidden flex items-center gap-2">
          {/* Mobile Shortcut to Cart */}
          <Link to="/cart" className="p-2 text-lg">🛒</Link>

          {/* 👤 Mobile User Profile Dropdown Menu */}
          {!showAuthButtons && <UserProfileMenu customRole="trainer" />}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-capsule-navy dark:text-white focus:outline-none text-xl p-1 cursor-pointer"
          >
            {isOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation Drawer Block */}
      {isOpen && (
        <div className="md:hidden mt-4 bg-gray-50 dark:bg-[#111A2B] rounded-xl p-4 flex flex-col space-y-3 font-semibold text-sm border border-gray-100 dark:border-slate-800 mx-6 mb-4">
          
          {/* Mobile User Profile Section */}
          {!showAuthButtons && (
            <div className="pb-3 border-b border-gray-200 dark:border-slate-800">
              <UserProfileMenu customRole="trainer" />
            </div>
          )}

          {/* Mobile Specific Language Trigger */}
          <button 
            onClick={toggleLanguage}
            className="self-start mb-2 bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 text-gray-800 dark:text-slate-100 font-extrabold text-xs px-4 py-2 rounded-full transition-all duration-200 cursor-pointer"
          >
            {lang === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
          </button>

          {/* Render standard structured link arrays inside mobile view */}
          {navLinks.map((link) => (
            <Link
              key={link.id}
              to={link.to}
              onClick={() => setIsOpen(false)}
              className={`p-2 rounded-lg ${
                activePage === link.id
                  ? "bg-capsule-teal/10 text-capsule-teal"
                  : "text-gray-600"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Fallback configuration for missing authentication sessions */}
          {showAuthButtons && (
            <div className="flex flex-col gap-2 pt-3 mt-1 border-t border-gray-200">
              <button
                onClick={onSignIn}
                className={`p-2 rounded-lg font-bold text-capsule-navy hover:bg-gray-100 transition cursor-pointer ${
                  t.dir === 'rtl' ? 'text-right' : 'text-left'
                }`}
              >
                {t.tabs.login}
              </button>
              <button
                onClick={onSignUp}
                className="p-2.5 rounded-lg text-center font-bold text-white bg-capsule-navy hover:bg-capsule-teal transition cursor-pointer"
              >
                {t.tabs.signup}
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export default TrainerNavbar;