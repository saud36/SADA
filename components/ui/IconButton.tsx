
import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const IconButton: React.FC<IconButtonProps> = ({ children, ...props }) => {
  return (
    <button
      {...props}
      className="p-2 rounded-full bg-gray-600/50 hover:bg-gray-500/70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400"
    >
      {children}
    </button>
  );
};
