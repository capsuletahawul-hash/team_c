import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import SkeletonLoader from './SkeletonLoader';

interface LoadingIndicatorProps {
  message?: string;
  variant?: 'spinner' | 'dashboard' | 'table' | 'cards' | 'form' | 'page';
}

function LoadingIndicator({ message, variant = 'spinner' }: LoadingIndicatorProps): React.JSX.Element {
  const { t } = useLanguage();
  const displayMessage = message || t.ui.defaultLoading;

  if (variant !== 'spinner') {
    return <SkeletonLoader variant={variant} dir={t.dir} />;
  }

  return (
    <div dir={t.dir} className="flex flex-col items-center justify-center p-8 font-sans">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-capsule-teal border-t-transparent mb-3"></div>
      <p className="text-capsule-navy dark:text-sky-300 text-xs font-bold animate-pulse">
        {displayMessage}
      </p>
    </div>
  );
}

export default LoadingIndicator;