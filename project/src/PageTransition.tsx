import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Fade-out then fade-in on route change
    setIsExiting(true);
    setIsVisible(false);

    const exitTimer = setTimeout(() => {
      setIsExiting(false);
      setIsVisible(true);
    }, 250);

    return () => clearTimeout(exitTimer);
  }, [location.pathname]);

  return (
    <div
      className={`transition-opacity duration-300 ease-in-out ${
        isExiting ? 'opacity-0' : isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {children}
    </div>
  );
};

export default PageTransition;
