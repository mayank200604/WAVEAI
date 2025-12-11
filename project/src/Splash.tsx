import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import waveLogo from "/wave_logo.png";

const Splash: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/landing");
    }, 1800);
    return () => clearTimeout(timer);
  }, [navigate]);
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#141414] fade-in-out overflow-hidden">
      {/* Minimalistic background effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        <img src={waveLogo} alt="Wave Logo" className="w-48 h-48 animate-pulse mb-8 drop-shadow-2xl" />
        <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4"></div>
        <span className="text-cyan-400 font-bold text-xl tracking-wider animate-fadeInUp">Loading Wave AI...</span>
      </div>
    </div>
  );
};
export default Splash;
