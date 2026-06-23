import React, { useState, useEffect } from 'react';

export const LuxuryImage = ({
  src,
  alt = '',
  className = '',
  wrapperClassName = '',
  loading = 'lazy',
  ...props
}) => {
  const [status, setStatus] = useState('loading'); // 'loading' | 'loaded' | 'error'

  useEffect(() => {
    if (!src) {
      setStatus('error');
      return;
    }
    // Set to loading on src change
    setStatus('loading');

    const img = new Image();
    img.src = src;
    img.onload = () => {
      setStatus('loaded');
    };
    img.onerror = () => {
      setStatus('error');
    };
  }, [src]);

  return (
    <div className={`relative overflow-hidden w-full h-full flex items-center justify-center ${wrapperClassName}`}>
      {/* Centered SSJewellery Logo Placeholder with Luxury Gold Shimmer */}
      <div 
        className={`absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-slate-900 z-10 transition-opacity duration-500 ${
          status === 'loading' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 luxury-gold-shimmer pointer-events-none" />
        <img
          src="/logo.svg"
          alt="Loading..."
          className="h-10 w-auto opacity-50 object-contain relative z-20 animate-pulse"
        />
      </div>

      {/* Error Fallback State: SSJewellery Logo & "Image Unavailable" text */}
      <div 
        className={`absolute inset-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 border border-[#F2E8D9]/40 dark:border-slate-800/80 p-4 text-center z-10 transition-opacity duration-500 ${
          status === 'error' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <img
          src="/logo.svg"
          alt="Image Unavailable"
          className="h-10 w-auto opacity-30 object-contain mb-2"
        />
        <span className="text-[10px] sm:text-xs font-semibold text-[#D4A75F] tracking-wider uppercase">
          Image Unavailable
        </span>
      </div>

      {/* Actual Image component with smooth fade-in */}
      {src && (
        <img
          src={src}
          alt={alt}
          loading={loading}
          className={`${className} transition-opacity duration-500 ease-in-out ${
            status === 'loaded' ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          {...props}
        />
      )}
    </div>
  );
};

