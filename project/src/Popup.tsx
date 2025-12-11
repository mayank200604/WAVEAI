import React, { useEffect, useState } from 'react';

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export const Popup: React.FC<PopupProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  duration = 3000
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [isOpen, duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  };

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-600/20',
          border: 'border-green-500',
          icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22,4 12,14.01 9,11.01"></polyline></svg>,
          text: 'text-green-400'
        };
      case 'error':
        return {
          bg: 'bg-red-600/20',
          border: 'border-red-500',
          icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>,
          text: 'text-red-400'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-600/20',
          border: 'border-yellow-500',
          icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
          text: 'text-yellow-400'
        };
      default:
        return {
          bg: 'bg-blue-600/20',
          border: 'border-blue-500',
          icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>,
          text: 'text-blue-400'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Popup */}
      <div 
        className={`
          relative max-w-md w-full p-6 rounded-xl border-2 
          ${styles.bg} ${styles.border}
          backdrop-blur-md shadow-2xl
          transform transition-all duration-300 ease-out
          ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
        `}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="flex items-start gap-4">
          <div className="text-2xl">{styles.icon}</div>
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${styles.text} mb-2`}>
              {title}
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Progress bar for auto-close */}
        {duration > 0 && (
          <div className="mt-4 w-full bg-gray-700/30 rounded-full h-1 overflow-hidden">
            <div 
              className={`h-full ${styles.bg.replace('/20', '/60')} transition-all ease-linear`}
              style={{
                animation: `shrink ${duration}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

// Hook for easy popup management
export const usePopup = () => {
  const [popup, setPopup] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration: number;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    duration: 3000
  });

  const showPopup = (
    title: string, 
    message: string, 
    type: 'success' | 'error' | 'info' | 'warning' = 'info',
    duration: number = 3000
  ) => {
    setPopup({
      isOpen: true,
      title,
      message,
      type,
      duration
    });
  };

  const hidePopup = () => {
    setPopup(prev => ({ ...prev, isOpen: false }));
  };

  return {
    popup,
    showPopup,
    hidePopup
  };
};
