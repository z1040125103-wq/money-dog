import React from 'react';

export const GooseIcon: React.FC<{ size?: number, className?: string }> = ({ size = 24, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M16 2c2.5 0 4.5 2 4.5 4.5c0 1.5-1 2.5-2 3c-1 .5-2 1-2 2.5v2" />
    <path d="M12 22c4.5 0 8-3.5 8-8c0-3.5-3.5-5-5-5c-2.5 0-4 1.5-4 4" />
    <path d="M5.5 8.5c1-2.5 4-3.5 6-2.5" />
    <path d="M4 16c-1.5 0-2.5-1-2.5-2.5c0-2.5 2.5-4 5-5c1.5-.5 3 .5 4 2" />
    <circle cx="15.5" cy="5.5" r="1" fill="currentColor" />
    <path d="M19 4l2-1" />
  </svg>
);