import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  size?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', size = '11px' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <label
        className="theme-switch"
        style={{ fontSize: size }}
        title={theme === 'dark' ? 'التبديل إلى الوضع النهاري (Light Mode)' : 'التبديل إلى الوضع الليلي (Dark Mode)'}
      >
        <input
          type="checkbox"
          className="theme-switch__checkbox"
          checked={theme === 'dark'}
          onChange={toggleTheme}
          aria-label="Toggle Theme"
        />
        <div className="theme-switch__container">
          <div className="theme-switch__clouds">
            <svg viewBox="0 0 100 40" fill="none" className="w-full h-full">
              <path
                d="M15 30 C10 30 5 25 8 20 C10 15 18 14 22 17 C25 10 37 9 42 15 C47 12 55 14 58 19 C64 16 72 20 70 25 C75 25 80 28 78 32 C75 35 70 34 68 32 L15 30 Z"
                fill="white"
                opacity="0.85"
              />
              <path
                d="M50 32 C46 32 42 28 44 24 C46 20 52 19 55 21 C58 15 67 14 71 19 C75 17 81 18 83 22 C88 20 94 23 93 27 C97 27 100 29 99 32 L50 32 Z"
                fill="white"
                opacity="0.6"
              />
            </svg>
          </div>
          <div className="theme-switch__stars-container">
            <svg viewBox="0 0 100 40" fill="none" className="w-full h-full">
              <circle cx="15" cy="12" r="1.5" fill="white" opacity="0.9" />
              <circle cx="35" cy="8" r="1.2" fill="white" opacity="0.8" />
              <circle cx="55" cy="18" r="1.4" fill="white" opacity="0.95" />
              <circle cx="75" cy="10" r="1.5" fill="white" opacity="0.85" />
              <circle cx="25" cy="25" r="1.1" fill="white" opacity="0.75" />
              <circle cx="68" cy="26" r="1.3" fill="white" opacity="0.9" />
              <path d="M40 22 L41 24 L43 25 L41 26 L40 28 L39 26 L37 25 L39 24 Z" fill="white" opacity="0.9" />
            </svg>
          </div>
          <div className="theme-switch__circle-container">
            <div className="theme-switch__sun-moon-container">
              <div className="theme-switch__moon">
                <div className="theme-switch__spot" />
                <div className="theme-switch__spot" />
                <div className="theme-switch__spot" />
              </div>
            </div>
          </div>
        </div>
      </label>
    </div>
  );
};

export default ThemeToggle;
