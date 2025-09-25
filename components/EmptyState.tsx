import React from 'react';

interface EmptyStateProps {
  title: string;
  message: string;
  children?: React.ReactNode; // For Call-to-action buttons
}

const EmptyIllustration: React.FC = () => (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-75 text-border">
        <rect x="2" y="22" width="116" height="88" rx="8" stroke="currentColor" strokeWidth="4"/>
        <path d="M2 30C2 25.5817 5.58172 22 10 22H110C114.418 22 118 25.5817 118 30V40H2V30Z" fill="currentColor"/>
        <path d="M50 71H70" stroke="rgb(var(--color-text-secondary))" strokeWidth="4" strokeLinecap="round"/>
        <path d="M60 61V81" stroke="rgb(var(--color-text-secondary))" strokeWidth="4" strokeLinecap="round"/>
    </svg>
);


const EmptyState: React.FC<EmptyStateProps> = ({ title, message, children }) => {
  return (
    <div className="text-center p-8 md:p-16 bg-background rounded-lg border-2 border-dashed border-border">
      <div className="mx-auto mb-4">
        <EmptyIllustration />
      </div>
      <h3 className="text-xl font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary mb-6 max-w-sm mx-auto">{message}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};

export default EmptyState;