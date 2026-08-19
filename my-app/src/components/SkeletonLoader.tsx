import React from 'react';

export interface SkeletonLoaderProps {
  variant?: 'dashboard' | 'trainer-dashboard' | 'student-dashboard' | 'landing-page' | 'table' | 'cards' | 'form' | 'page';
  count?: number;
  dir?: 'rtl' | 'ltr';
}

const Shimmer: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`skeleton-shimmer ${className}`} />
);

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'dashboard',
  count = 6,
  dir = 'rtl',
}) => {
  if (variant === 'cards') {
    return (
      <div className="w-full space-y-6 font-sans" dir={dir}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(count)].map((_, i) => (
            <div key={i} className="bg-white/40 dark:bg-[#162035]/60 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-3xl p-5 shadow-xl space-y-4">
              <Shimmer className="h-40 w-full rounded-2xl" />
              <Shimmer className="h-5 w-3/4 rounded-lg" />
              <Shimmer className="h-4 w-1/2 rounded-md" />
              <div className="flex justify-between items-center pt-2">
                <Shimmer className="h-6 w-20 rounded-lg" />
                <Shimmer className="h-9 w-28 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className="w-full space-y-4 font-sans" dir={dir}>
        <div className="bg-white/40 dark:bg-[#162035]/60 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
          <Shimmer className="h-7 w-48 rounded-xl mb-3" />
          <Shimmer className="h-10 w-full rounded-xl" />
          {[...Array(Math.min(count, 5))].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-2.5 border-b border-slate-200/50 dark:border-slate-800">
              <Shimmer className="h-4 w-20 rounded" />
              <Shimmer className="h-4 flex-grow rounded" />
              <Shimmer className="h-4 w-24 rounded" />
              <Shimmer className="h-7 w-16 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'form') {
    return (
      <div className="w-full flex justify-center items-center font-sans py-4" dir={dir}>
        <div className="bg-white/40 dark:bg-[#162035]/60 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-3xl p-8 shadow-xl max-w-xl w-full space-y-5">
          <Shimmer className="h-8 w-1/2 rounded-xl mb-4" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Shimmer className="h-3 w-1/4 rounded" />
              <Shimmer className="h-11 w-full rounded-xl" />
            </div>
          ))}
          <Shimmer className="h-12 w-full rounded-2xl mt-6" />
        </div>
      </div>
    );
  }

  if (variant === 'trainer-dashboard') {
    return (
      <div className="w-full font-sans" dir={dir}>
        <main className="max-w-7xl mx-auto py-2 w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* 3 Top Stat Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-[#18233C] p-6 rounded-3xl border border-slate-200 dark:border-slate-700/80 shadow-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <Shimmer className="h-3 w-28 rounded-full" />
                    <Shimmer className="h-5 w-5 rounded-full" />
                  </div>
                  <Shimmer className="h-8 w-24 rounded-xl" />
                </div>
              ))}
            </div>

            {/* Density Breakdown Box Skeleton */}
            <div className="bg-white dark:bg-[#18233C] border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-4">
              <Shimmer className="h-4 w-60 rounded-full" />
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-slate-100 dark:bg-slate-800/50 p-3.5 rounded-2xl space-y-2">
                  <div className="flex justify-between">
                    <Shimmer className="h-3.5 w-40 rounded" />
                    <Shimmer className="h-3.5 w-24 rounded" />
                  </div>
                  <Shimmer className="h-2.5 w-full rounded-full" />
                </div>
              ))}
            </div>

            {/* Published Courses Management Table Skeleton */}
            <div className="bg-white dark:bg-[#18233C] border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-4">
              <Shimmer className="h-5 w-52 rounded-xl mb-4" />
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between items-center py-2.5 border-b border-slate-200 dark:border-slate-800">
                  <Shimmer className="h-4 w-36 rounded" />
                  <Shimmer className="h-4 w-20 rounded" />
                  <Shimmer className="h-7 w-20 rounded-xl" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column (1 Col) */}
          <div className="space-y-6">
            {/* Active Bootcamps Box */}
            <div className="bg-white dark:bg-[#18233C] border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-4">
              <Shimmer className="h-4 w-40 rounded-full mb-3" />
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                  <Shimmer className="h-3.5 w-32 rounded" />
                  <Shimmer className="h-5 w-16 rounded-full" />
                </div>
              ))}
            </div>

            {/* Form Card Skeleton */}
            <div className="bg-white dark:bg-[#18233C] border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-4">
              <Shimmer className="h-5 w-48 rounded-xl mb-4" />
              <Shimmer className="h-10 w-full rounded-xl" />
              <div className="grid grid-cols-2 gap-3">
                <Shimmer className="h-10 w-full rounded-xl" />
                <Shimmer className="h-10 w-full rounded-xl" />
              </div>
              <Shimmer className="h-20 w-full rounded-xl" />
              <Shimmer className="h-11 w-full rounded-2xl mt-2" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (variant === 'student-dashboard') {
    return (
      <div className="w-full font-sans" dir={dir}>
        {/* Hero Banner Skeleton */}
        <div className="bg-gradient-to-tr from-capsule-footer via-capsule-navy to-capsule-teal text-white py-10 px-8 rounded-3xl mb-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-3 w-full max-w-lg">
            <Shimmer className="h-3.5 w-32 rounded-full bg-white/20" />
            <Shimmer className="h-8 w-64 rounded-xl bg-white/30" />
            <Shimmer className="h-4 w-full rounded-lg bg-white/20" />
          </div>
          <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl border border-white/20">
            <Shimmer className="w-12 h-12 rounded-full bg-white/30 shrink-0" />
            <div className="space-y-2">
              <Shimmer className="h-4 w-28 rounded bg-white/30" />
              <Shimmer className="h-3 w-20 rounded bg-white/20" />
            </div>
          </div>
        </div>

        {/* 4 Stat Cards Row Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-[#18233C] p-5 rounded-2xl border-2 border-slate-300 dark:border-slate-700/80 shadow-2xl space-y-2">
              <Shimmer className="h-3 w-28 rounded" />
              <Shimmer className="h-8 w-16 rounded-xl" />
            </div>
          ))}
        </div>

        {/* AI Course Assistant Box Skeleton */}
        <div className="bg-white dark:bg-[#18233C] border-2 border-slate-300 dark:border-slate-700/80 rounded-3xl p-6 shadow-2xl mb-8 space-y-4">
          <div className="flex items-center gap-3">
            <Shimmer className="w-10 h-10 rounded-2xl shrink-0" />
            <div className="space-y-2 flex-grow">
              <Shimmer className="h-4 w-48 rounded" />
              <Shimmer className="h-3 w-64 rounded" />
            </div>
          </div>
          <Shimmer className="h-12 w-full rounded-2xl" />
        </div>

        {/* 2-Column Main Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (Resume Learning) */}
          <div className="lg:col-span-2 bg-white dark:bg-[#18233C] border-2 border-slate-300 dark:border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <Shimmer className="h-5 w-40 rounded" />
              <Shimmer className="h-3 w-24 rounded" />
            </div>
            {[...Array(2)].map((_, i) => (
              <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-2 flex-grow">
                  <Shimmer className="h-4 w-48 rounded" />
                  <Shimmer className="h-3 w-32 rounded" />
                  <Shimmer className="h-2 w-full rounded-full" />
                </div>
                <Shimmer className="h-9 w-28 rounded-xl shrink-0" />
              </div>
            ))}
          </div>

          {/* Right Column (Notifications/Activity) */}
          <div className="bg-white dark:bg-[#18233C] border-2 border-slate-300 dark:border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-4">
            <Shimmer className="h-5 w-36 rounded border-b border-slate-200 dark:border-slate-800 pb-3" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3 py-2 border-b border-slate-100 dark:border-slate-800/50">
                <Shimmer className="w-8 h-8 rounded-full shrink-0" />
                <div className="space-y-1.5 flex-grow">
                  <Shimmer className="h-3.5 w-full rounded" />
                  <Shimmer className="h-2.5 w-20 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'landing-page') {
    return (
      <div className="w-full font-sans" dir={dir}>
        {/* Landing Hero Banner Skeleton */}
        <div className="bg-gradient-to-tr from-capsule-footer via-capsule-navy to-capsule-teal text-white py-16 px-8 rounded-3xl mb-12 shadow-2xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <Shimmer className="h-4 w-36 rounded-full bg-white/20" />
            <Shimmer className="h-10 w-4/5 rounded-2xl bg-white/30" />
            <Shimmer className="h-5 w-full rounded-xl bg-white/20" />
            <Shimmer className="h-5 w-3/4 rounded-xl bg-white/20" />
            <div className="flex gap-4 pt-4">
              <Shimmer className="h-12 w-36 rounded-xl bg-white/40" />
              <Shimmer className="h-12 w-36 rounded-xl bg-white/20" />
            </div>
          </div>
          <div className="flex justify-center items-center">
            <div className="w-72 h-44 sm:w-96 sm:h-60 rounded-[3rem] bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_0_60px_rgba(0,164,153,0.4)] flex items-center justify-center p-6 transition-all animate-pulse">
              <Shimmer className="w-full h-full rounded-[2.2rem] bg-white/20" />
            </div>
          </div>
        </div>

        {/* 3 Value Track Cards Skeleton */}
        <div className="mb-14 space-y-6">
          <div className="text-center space-y-2 max-w-md mx-auto">
            <Shimmer className="h-6 w-48 mx-auto rounded-xl" />
            <Shimmer className="h-3 w-64 mx-auto rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-[#18233C] p-6 rounded-3xl border-2 border-slate-300 dark:border-slate-700/80 shadow-2xl space-y-4">
                <Shimmer className="w-12 h-12 rounded-2xl" />
                <Shimmer className="h-5 w-40 rounded" />
                <Shimmer className="h-3.5 w-full rounded" />
                <Shimmer className="h-3.5 w-4/5 rounded" />
                <Shimmer className="h-9 w-32 rounded-xl mt-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Course Catalog Filter + Cards Skeleton */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-300 dark:border-slate-700 pb-4">
            <Shimmer className="h-7 w-52 rounded-xl" />
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <Shimmer key={i} className="h-8 w-24 rounded-full" />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-[#18233C] border-2 border-slate-300 dark:border-slate-700/80 rounded-3xl p-5 shadow-2xl space-y-4">
                <Shimmer className="h-44 w-full rounded-2xl" />
                <Shimmer className="h-5 w-3/4 rounded-lg" />
                <Shimmer className="h-4 w-1/2 rounded-md" />
                <div className="flex justify-between items-center pt-2">
                  <Shimmer className="h-6 w-20 rounded-lg" />
                  <Shimmer className="h-9 w-28 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Variant
  return (
    <div className="w-full font-sans flex flex-col" dir={dir}>
      <main className="flex-grow max-w-7xl mx-auto px-6 py-8 w-full grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 bg-white/40 dark:bg-[#162035]/60 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-3xl p-4 space-y-2.5 h-fit shadow-xl">
          <Shimmer className="h-4 w-3/4 mb-4 rounded-full" />
          {[...Array(7)].map((_, i) => (
            <Shimmer key={i} className="h-9 w-full rounded-xl" />
          ))}
        </div>
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/40 dark:bg-[#162035]/60 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-3xl p-5 shadow-xl">
                <Shimmer className="h-3 w-2/3 mb-3 rounded-full" />
                <Shimmer className="h-7 w-1/2 rounded-full" />
              </div>
            ))}
          </div>
          <div className="bg-white/40 dark:bg-[#162035]/60 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row gap-8 items-center">
            <Shimmer className="w-36 h-36 rounded-full shrink-0" />
            <div className="flex-grow w-full space-y-3">
              {[...Array(3)].map((_, i) => (
                <Shimmer key={i} className="h-8 w-full rounded-xl" />
              ))}
            </div>
          </div>
          <div className="bg-white/40 dark:bg-[#162035]/60 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-3">
            <Shimmer className="h-3 w-1/3 mb-4 rounded-full" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 bg-slate-100/40 dark:bg-slate-800/40 p-2.5 rounded-xl">
                <Shimmer className="h-3 w-16 shrink-0 rounded" />
                <Shimmer className="flex-grow h-2.5 rounded-full" />
                <Shimmer className="h-3 w-12 shrink-0 rounded" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SkeletonLoader;
