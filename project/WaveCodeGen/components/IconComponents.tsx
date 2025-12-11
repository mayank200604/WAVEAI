import React, { useState } from 'react';

const CHROME_RING_LOGO_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAAAXNSR0IArs4c6QAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAABAqADAAQAAAABAAABAAAAAADdQgcFAAADiUlEQVR4Ae3bQQ0AMADCILH/6Y5sYyQk2I13Jz1aA3gIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4gIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAh4CHgIeAg8BvK8A0G1aQ6TAAAAAElFTkSuQmCC";

// New Main Logo
export const ChromeRingLogo: React.FC<{ className?: string }> = ({ className }) => {
  // Try to use a user-supplied logo at the project root (/no_bg_wave_logo.png or in public/).
  // If it fails to load, fall back to the embedded chrome-ring placeholder.
  const defaultPath = '/no_bg_wave_logo.png';
  const [src, setSrc] = useState(defaultPath);
  return (
    <img src={src} alt="WaveCodeGen Logo" className={className} onError={() => setSrc(CHROME_RING_LOGO_BASE64)} />
  );
};

export const BrainCircuitIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 2a.5 .5 0 0 0-.5 .5v2a.5 .5 0 0 0 .5 .5.5 .5 0 0 0 .5-.5v-2a.5 .5 0 0 0-.5-.5Z"/>
        <path d="M12 19a.5 .5 0 0 0-.5 .5v2a.5 .5 0 0 0 .5 .5.5 .5 0 0 0 .5-.5v-2a.5 .5 0 0 0-.5-.5Z"/>
        <path d="M5 12a.5 .5 0 0 0-.5-.5h-2a.5 .5 0 0 0-.5 .5.5 .5 0 0 0 .5 .5h2a.5 .5 0 0 0 .5-.5Z"/>
        <path d="M21 12a.5 .5 0 0 0-.5-.5h-2a.5 .5 0 0 0-.5 .5.5 .5 0 0 0 .5 .5h2a.5 .5 0 0 0 .5-.5Z"/>
        <path d="m16.5 7.5-.5.5a.5 .5 0 0 0 0 .707l.5 .5a.5 .5 0 0 0 .707 0l.5-.5a.5 .5 0 0 0 0-.707l-.5-.5a.5 .5 0 0 0-.707 0Z"/>
        <path d="m16.5 15.5-.5.5a.5 .5 0 0 0 0 .707l.5 .5a.5 .5 0 0 0 .707 0l.5-.5a.5 .5 0 0 0 0-.707l-.5-.5a.5 .5 0 0 0-.707 0Z"/>
        <path d="m7.5 7.5-.5.5a.5 .5 0 0 0 0 .707l.5 .5a.5 .5 0 0 0 .707 0l.5-.5a.5 .5 0 0 0 0-.707l-.5-.5a.5 .5 0 0 0-.707 0Z"/>
        <path d="m7.5 15.5-.5.5a.5 .5 0 0 0 0 .707l.5 .5a.5 .5 0 0 0 .707 0l.5-.5a.5 .5 0 0 0 0-.707l-.5-.5a.5 .5 0 0 0-.707 0Z"/>
        <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/>
        <path d="M12 2a10 10 0 1 0 10 10"/>
    </svg>
);

export const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
);

export const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
);

export const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2.12l-.15.1a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1 0-2.12l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);

export const MagicWandIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 3v4M19 17v4M3 5h4M17 19h4M12 3a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0V4a1 1 0 0 0-1-1zM9.5 5.5 7 8M14.5 5.5 17 8M9.5 18.5 7 16M14.5 18.5 17 16M12 15a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0v-2a1 1 0 0 0-1-1z"/></svg>
);

export const DocumentTextIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
);

export const PlusCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
);

export const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>
);

export const CursorArrowRaysIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path d="M10.42 2.222a1.25 1.25 0 00-1.84 0l-4.5 6.3a1.25 1.25 0 001.033 1.978H8.75v5.25a1.25 1.25 0 002.5 0V10.5h2.637a1.25 1.25 0 001.033-1.978l-4.5-6.3z" />
        <path d="M10 12.5a.75.75 0 01.75.75v5.01a.75.75 0 01-1.5 0V13.25a.75.75 0 01.75-.75zM4.634 10.992a.75.75 0 010-1.5l5.01-.002a.75.75 0 010 1.5l-5.01.002z" />
    </svg>
);

export const ChartBarSquareIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M2 3a1 1 0 011-1h1.5a1 1 0 011 1v1.5a1 1 0 01-1 1H3a1 1 0 01-1-1V3zM2 8.5a1 1 0 011-1h1.5a1 1 0 011 1v1.5a1 1 0 01-1 1H3a1 1 0 01-1-1V8.5zM2 14a1 1 0 011-1h1.5a1 1 0 011 1v1.5a1 1 0 01-1 1H3a1 1 0 01-1-1V14zM7.5 3a1 1 0 011-1h1.5a1 1 0 011 1v1.5a1 1 0 01-1 1h-1.5a1 1 0 01-1-1V3zM7.5 8.5a1 1 0 011-1h1.5a1 1 0 011 1v1.5a1 1 0 01-1 1h-1.5a1 1 0 01-1-1V8.5zM7.5 14a1 1 0 011-1h1.5a1 1 0 011 1v1.5a1 1 0 01-1 1h-1.5a1 1 0 01-1-1V14zM13 3a1 1 0 011-1h1.5a1 1 0 011 1v1.5a1 1 0 01-1 1H14a1 1 0 01-1-1V3zM13 8.5a1 1 0 011-1h1.5a1 1 0 011 1v1.5a1 1 0 01-1 1H14a1 1 0 01-1-1V8.5zM13 14a1 1 0 011-1h1.5a1 1 0 011 1v1.5a1 1 0 01-1 1H14a1 1 0 01-1-1V14z" />
    </svg>
);