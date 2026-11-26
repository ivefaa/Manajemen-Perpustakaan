import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-9 h-9 rounded-lg',
    lg: 'w-12 h-12 rounded-xl',
  }[size];

  const svgClasses = {
    sm: 'w-4.5 h-4.5',
    md: 'w-5 h-5',
    lg: 'w-6.5 h-6.5',
  }[size];

  return (
    <div
      className={`${sizeClasses} bg-[#0B1E33] text-white flex items-center justify-center shadow-sm shrink-0 ${className}`}
      aria-hidden="true"
    >
      {/* New PustakaModern Emblem: Stylized reader circle above an open book */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={svgClasses}
      >
        <circle cx="12" cy="5.6" r="2.35" fill="currentColor" />
        <path
          d="M4.2 9.2C7.1 9.2 9.85 10.4 12 12.4C14.15 10.4 16.9 9.2 19.8 9.2C20.35 9.2 20.8 9.65 20.8 10.2V17.4C20.8 17.95 20.35 18.4 19.8 18.4C17.05 18.4 14.35 19.35 12.45 20.85C12.18 21.06 11.82 21.06 11.55 20.85C9.65 19.35 6.95 18.4 4.2 18.4C3.65 18.4 3.2 17.95 3.2 17.4V10.2C3.2 9.65 3.65 9.2 4.2 9.2Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 12.4V20.6"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};
