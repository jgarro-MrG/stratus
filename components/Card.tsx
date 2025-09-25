import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ children, className = '', title }, ref) => {
  return (
    <div ref={ref} className={`bg-surface rounded-xl border border-border shadow-sm ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
});

export default Card;