// In: front_end/src/components/ui/Button.jsx
import React from 'react';

export const Button = ({ className, variant, ...props }) => {
  const baseStyle = "px-4 py-2 rounded-md font-medium transition-colors";
  const variantStyle =
    variant === "outline"
      ? "border border-gray-300 text-gray-700 hover:bg-gray-100"
      : "bg-indigo-600 text-white hover:bg-indigo-700";

  return (
    <button className={`${baseStyle} ${variantStyle} ${className}`} {...props} />
  );
};