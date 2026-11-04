import React from 'react';

interface StarLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showTagline?: boolean;
  className?: string;
}

export const StarLogo: React.FC<StarLogoProps> = ({
  size = 'md',
  showText = true,
  showTagline = false,
  className = '',
}) => {
  const dimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }[size];

  const textSize = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div
        className={`${dimensions} relative rounded-xl bg-gradient-to-br from-[#8B5CF6] via-[#C026D3] to-[#FF2D75] p-0.5 shadow-lg shadow-[#8B5CF6]/25 flex items-center justify-center shrink-0`}
      >
        <div className="w-full h-full bg-[#080808] rounded-[10px] flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#8B5CF6]/25 to-[#FF2D75]/25" />
          <svg
            viewBox="0 0 36 36"
            fill="none"
            className="w-4/5 h-4/5 relative z-10"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A78BFA" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#FF2D75" />
              </linearGradient>
            </defs>
            <path
              d="M18 3.5L21.9 12.6L31.8 13.6L24.3 20.2L26.5 29.9L18 24.8L9.5 29.9L11.7 20.2L4.2 13.6L14.1 12.6L18 3.5Z"
              stroke="url(#starGrad)"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="url(#starGrad)"
              fillOpacity="0.22"
            />
            <path
              d="M15.8 14.2L22.2 18L15.8 21.8V14.2Z"
              fill="#FFFFFF"
            />
          </svg>
        </div>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-display font-extrabold tracking-tight whitespace-nowrap ${textSize} text-slate-900 dark:text-white`}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#FF2D75] mr-0.5">
              ☆
            </span>
            MEDIA <span className="font-semibold text-[#8B5CF6]">APP</span>
          </span>
          {showTagline && (
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 tracking-wide mt-1">
              Create. Share. Connect. Earn.
            </span>
          )}
        </div>
      )}
    </div>
  );
};
