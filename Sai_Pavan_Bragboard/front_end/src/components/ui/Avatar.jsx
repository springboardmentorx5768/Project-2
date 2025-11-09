// In: front_end/src/components/ui/Avatar.jsx
import React from 'react';

export const Avatar = ({ className, children, ...props }) => (
  <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`} {...props}>
    {children}
  </div>
);

export const AvatarFallback = ({ className, children, ...props }) => (
  <span className={`flex h-full w-full items-center justify-center rounded-full bg-gray-200 text-gray-700 font-medium ${className}`} {...props}>
    {children}
  </span>
);