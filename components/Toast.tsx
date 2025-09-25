import React, { useEffect, useState } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const toastConfig = {
  success: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    barClass: 'bg-green-500',
    textClass: 'text-green-800 dark:text-green-300',
    bgClass: 'bg-green-100 dark:bg-green-900/50',
    borderClass: 'border-green-400'
  },
  error: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    barClass: 'bg-red-500',
    textClass: 'text-red-800 dark:text-red-300',
    bgClass: 'bg-red-100 dark:bg-red-900/50',
    borderClass: 'border-red-400'
  },
  info: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    barClass: 'bg-blue-500',
    textClass: 'text-blue-800 dark:text-blue-300',
    bgClass: 'bg-blue-100 dark:bg-blue-900/50',
    borderClass: 'border-blue-400'
  },
  warning: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    barClass: 'bg-yellow-500',
    textClass: 'text-yellow-800 dark:text-yellow-300',
    bgClass: 'bg-yellow-100 dark:bg-yellow-900/50',
    borderClass: 'border-yellow-400'
  },
};

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [show, setShow] = useState(false);
  const config = toastConfig[type];

  useEffect(() => {
    setShow(true);
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const handleClose = () => {
      setShow(false);
      setTimeout(onClose, 300);
  }

  return (
    <div
      className={`relative w-80 max-w-sm rounded-lg shadow-lg overflow-hidden border ${config.borderClass} ${config.bgClass} transition-all duration-300 ease-in-out transform ${show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
      role="alert"
    >
      <div className={`absolute left-0 top-0 bottom-0 w-2 ${config.barClass}`}></div>
      <div className="flex items-center p-4 pl-6">
        <div className={`mr-4 ${config.textClass}`}>{config.icon}</div>
        <p className={`flex-1 text-sm font-medium ${config.textClass}`}>{message}</p>
        <button
          onClick={handleClose}
          className="ml-4 p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Toast;
