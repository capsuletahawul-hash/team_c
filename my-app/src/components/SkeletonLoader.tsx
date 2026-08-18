import React from 'react';

export interface SkeletonLoaderProps {
  variant?: 'dashboard' | 'table' | 'cards' | 'form' | 'page';
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
      <div className="min-h-screen bg-[#C9D6DF] px-6 py-8 font-sans" dir={dir}>
        <div className="max-w-7xl mx-auto space-y-6">
          <Shimmer className="h-10 w-64 rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(count)].map((_, i) => (
              <div key={i} className="bg-white/90 rounded-3xl p-5 shadow-sm space-y-4">
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

  if (variant === 'table') {
    return (
      <div className="min-h-screen bg-[#C9D6DF] px-6 py-8 font-sans" dir={dir}>
        <div className="max-w-7xl mx-auto space-y-6">
          <Shimmer className="h-10 w-48 rounded-2xl mb-4" />
          <div className="bg-white/90 rounded-3xl p-6 shadow-sm space-y-4">
            <Shimmer className="h-8 w-full rounded-xl" />
            {[...Array(count)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-2 border-b border-slate-100">
                <Shimmer className="h-4 w-20 rounded" />
                <Shimmer className="h-4 flex-grow rounded" />
                <Shimmer className="h-4 w-24 rounded" />
                <Shimmer className="h-8 w-16 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'form') {
    return (
      <div className="min-h-screen bg-[#C9D6DF] px-6 py-8 flex justify-center items-center font-sans" dir={dir}>
        <div className="bg-white/90 rounded-3xl p-8 shadow-sm max-w-xl w-full space-y-5">
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

  if (variant === 'page') {
    return (
      <div className="min-h-screen bg-[#C9D6DF] px-6 py-8 font-sans" dir={dir}>
        <div className="max-w-7xl mx-auto space-y-6">
          <Shimmer className="h-12 w-1/3 rounded-2xl" />
          <Shimmer className="h-40 w-full rounded-3xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Shimmer className="h-64 rounded-3xl" />
            <Shimmer className="h-64 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Variant
  return (
    <div className="w-full font-sans flex flex-col" dir={dir}>
      <main className="flex-grow max-w-7xl mx-auto px-6 py-8 w-full grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 bg-white/90 rounded-3xl p-4 space-y-2.5 h-fit shadow-sm">
          <Shimmer className="h-4 w-3/4 mb-4 rounded-full" />
          {[...Array(7)].map((_, i) => (
            <Shimmer key={i} className="h-9 w-full rounded-xl" />
          ))}
        </div>
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/90 rounded-3xl p-5 shadow-sm">
                <Shimmer className="h-3 w-2/3 mb-3 rounded-full" />
                <Shimmer className="h-7 w-1/2 rounded-full" />
              </div>
            ))}
          </div>
          <div className="bg-white/90 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row gap-8 items-center">
            <Shimmer className="w-36 h-36 rounded-full shrink-0" />
            <div className="flex-grow w-full space-y-3">
              {[...Array(3)].map((_, i) => (
                <Shimmer key={i} className="h-8 w-full rounded-xl" />
              ))}
            </div>
          </div>
          <div className="bg-white/90 rounded-3xl p-6 shadow-sm space-y-3">
            <Shimmer className="h-3 w-1/3 mb-4 rounded-full" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 bg-slate-100/80 p-2.5 rounded-xl">
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
