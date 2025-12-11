import React, { useState, useEffect, useRef, useCallback } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { DownloadIcon, ChromeRingLogo, SparklesIcon, DocumentTextIcon, CursorArrowRaysIcon, ChartBarSquareIcon, BrainCircuitIcon } from './IconComponents';
import { aiService } from '../services/ai';

declare global {
    interface Window {
        mermaid: any;
    }
}

const AITooltip: React.FC<{ content: string; position: { top: number; left: number } }> = ({ content, position }) => {
    return (
        <div className="code-tooltip" style={{ top: position.top, left: position.left }}>
            <div className="flex items-center gap-2 mb-2">
                <SparklesIcon className="w-4 h-4 text-cyan-400" />
                <h4 className="font-semibold text-cyan-400">Code Explanation</h4>
            </div>
            {content}
        </div>
    );
};

const AIUITooltip: React.FC<{ content: string; position: { top: number; left: number } }> = ({ content, position }) => {
    return (
        <div className="ui-tooltip" style={{ top: position.top, left: position.left }}>
            <div className="flex items-center gap-2 mb-2">
                <CursorArrowRaysIcon className="w-4 h-4 text-purple-400" />
                <h4 className="font-semibold text-purple-400">UI Element Explanation</h4>
            </div>
            {content}
        </div>
    );
};


const ExplanationModal: React.FC<{ content: string; onClose: () => void }> = ({ content, onClose }) => {
    const [copyStatus, setCopyStatus] = React.useState('Copy');

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setCopyStatus('Copied!');
            setTimeout(() => setCopyStatus('Copy'), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4" onClick={onClose}>
            <div className="bg-slate-800/95 backdrop-blur-lg border border-blue-500/20 rounded-xl shadow-2xl w-full max-w-xs sm:max-w-2xl max-h-[90vh] sm:max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <DocumentTextIcon className="w-6 h-6 text-blue-400" />
                        <h3 className="text-lg font-bold text-white">Code Explanation</h3>
                    </div>
                    <button onClick={handleCopy} className="px-3 py-1.5 text-sm font-medium text-gray-300 bg-blue-600/40 hover:bg-blue-600/60 rounded-lg transition-all duration-200 border border-blue-500/30 hover:border-blue-500/50">
                        {copyStatus}
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="prose prose-sm prose-invert max-w-none text-gray-300">
                        {content ? (
                            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(content)) }} />
                        ) : "Generating explanation..."}
                    </div>
                </div>
                <div className="p-6 border-t border-slate-700/50 text-right">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600/50 hover:bg-blue-600/70 rounded-lg transition-all duration-200 border border-blue-500/30 hover:border-blue-500/50 transform hover:scale-105">Close</button>
                </div>
            </div>
        </div>
    );
};

const ArchitectureModal: React.FC<{ diagramCode: string; isLoading: boolean; onClose: () => void }> = ({ diagramCode, isLoading, onClose }) => {
    const diagramRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (diagramCode && diagramRef.current && typeof window.mermaid !== 'undefined') {
            try {
                diagramRef.current.innerHTML = diagramCode;
                delete (diagramRef.current.dataset as any).processed;
                window.mermaid.run({ nodes: [diagramRef.current] }).catch((error: any) => {
                    console.error('Mermaid rendering error:', error);
                    diagramRef.current!.innerHTML = `<div class="text-red-400 p-4">Error rendering diagram: ${error.message}</div>`;
                });
            } catch (error) {
                console.error('Mermaid setup error:', error);
                diagramRef.current.innerHTML = `<div class="text-red-400 p-4">Error setting up diagram</div>`;
            }
        }
    }, [diagramCode]);


    const handleDownload = () => {
        if (diagramRef.current) {
            const svgElement = diagramRef.current.querySelector('svg');
            if (svgElement) {
                const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
                style.textContent = `* { font-family: 'Inter', sans-serif; } text { fill: #e5e7eb; } .edge-label { background-color: #374151; } .cluster-title { fill: #f9fafb; } .arrowhead, .edge-path { stroke: #6b7280; } .node-label { color: #d1d5db; } rect, polygon, ellipse, path { fill: #1f2937; stroke: #4b5563; }`;
                svgElement.prepend(style);

                const svgData = new XMLSerializer().serializeToString(svgElement);
                const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'architecture.svg';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4" onClick={onClose}>
            <div className="bg-slate-800/95 backdrop-blur-lg border border-blue-500/20 rounded-xl shadow-2xl w-full max-w-sm sm:max-w-4xl max-h-[90vh] sm:max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ChartBarSquareIcon className="w-6 h-6 text-blue-400" />
                        <h3 className="text-lg font-bold text-white">Architecture Diagram</h3>
                    </div>
                    <button onClick={handleDownload} disabled={isLoading || !diagramCode} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 bg-blue-600/40 hover:bg-blue-600/60 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-500/30 hover:border-blue-500/50 transform hover:scale-105">
                        <DownloadIcon className="w-4 h-4" />
                        Download SVG
                    </button>
                </div>
                <div className="flex-1 overflow-auto p-6 bg-slate-900/30">
                    <div className="bg-slate-800/50 p-6 rounded-lg min-h-[50vh] flex items-center justify-center border border-slate-700/30">
                        {isLoading ? (
                            <div className="text-center">
                                <ChromeRingLogo className="w-16 h-16 opacity-50 animate-spin-slow mx-auto mb-3" />
                                <p className="text-gray-400">Generating diagram...</p>
                            </div>
                        ) : (
                            <div ref={diagramRef} className="mermaid w-full h-full">{diagramCode}</div>
                        )}
                    </div>
                </div>
                <div className="p-6 border-t border-slate-700/50 text-right">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600/50 hover:bg-blue-600/70 rounded-lg transition-all duration-200 border border-blue-500/30 hover:border-blue-500/50 transform hover:scale-105">Close</button>
                </div>
            </div>
        </div>
    );
};

// Simple debounce function
const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return (...args: P<F>): Promise<R<F>> =>
        new Promise(resolve => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => resolve(func(...args)), waitFor);
        });
};
type R<F> = F extends (...args: any[]) => infer R ? R : never;
type P<F> = F extends (...args: infer P) => any ? P : never;

interface PreviewProps {
  code: string;
  isLoading: boolean;
  thinkingSteps: string[];
  files?: {
    html: string;
    css: string;
    js: string;
  };
  showMobilePreview?: boolean;
  onMobileToggle?: () => void;
  autoSwitchToPreview?: boolean;
}

const Preview: React.FC<PreviewProps> = ({ code, isLoading, thinkingSteps = [], files, showMobilePreview, onMobileToggle, autoSwitchToPreview }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [copyStatus, setCopyStatus] = useState('Copy');
  const [tooltip, setTooltip] = useState<{ content: string; position: { top: number; left: number } } | null>(null);
  const [uiTooltip, setUiTooltip] = useState<{ content: string; position: { top: number; left: number } } | null>(null);
  const [explanationCache, setExplanationCache] = useState<Map<string, string>>(new Map());
  const [uiExplanationCache, setUiExplanationCache] = useState<Map<string, string>>(new Map());
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [explanation, setExplanation] = useState('');
  
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);
  const [architectureDiagram, setArchitectureDiagram] = useState('');
  const [isArchLoading, setIsArchLoading] = useState(false);
  
  // File explorer state
  const [selectedFile, setSelectedFile] = useState<'html' | 'css' | 'js'>('html');
  const [showFileExplorer, setShowFileExplorer] = useState(false);

  // Auto-switch to preview when code is generated
  useEffect(() => {
    if (autoSwitchToPreview && code && !isLoading) {
      setActiveTab('preview');
    }
  }, [code, isLoading, autoSwitchToPreview]);

    useEffect(() => {
        if (typeof window.mermaid !== 'undefined') {
            try {
                window.mermaid.initialize({ 
                    startOnLoad: false, 
                    theme: 'dark', 
                    fontFamily: 'Inter, sans-serif',
                    securityLevel: 'loose',
                    flowchart: { useMaxWidth: true, htmlLabels: true }
                });
            } catch (error) {
                console.error('Mermaid initialization error:', error);
            }
        }
    }, []);

    // Show file explorer when multi-file structure is available or when we have any code
    useEffect(() => {
        if (code && code.trim()) {
            setShowFileExplorer(true);
            // If we don't have files but have code, create a basic structure
            if (!files || (!files.css && !files.js)) {
                console.log('🔧 No multi-file structure detected, forcing file explorer with single HTML');
            }
        } else {
            setShowFileExplorer(false);
        }
    }, [files, code]);

    const getAIExplanation = useCallback(async (text: string, isFullCode = false) => {
        if (!isFullCode && explanationCache.has(text)) {
                return explanationCache.get(text);
        }
        const prompt = isFullCode
            ? `Provide a high-level explanation for this HTML and Tailwind CSS code. Focus on the overall structure, layout, and key components in a few paragraphs.`
            : /<([a-zA-Z0-9]+)/.test(text)
            ? `In one short sentence, what is the purpose of the HTML tag: ${text}`
            : `In one short sentence, what is the purpose of the Tailwind CSS class: "${text}"`;

        const content = isFullCode ? `${prompt}\n\n\`\`\`html\n${text}\n\`\`\`` : prompt;

        try {
                const response = await aiService.generateWithFallback(content);
                const explanationText = (response || '').trim();
                if (!isFullCode) {
                        setExplanationCache(prev => new Map(prev).set(text, explanationText));
                }
                return explanationText;
        } catch (error) {
                console.error("AI explanation error:", error);
                return "Could not fetch explanation.";
        }
    }, [explanationCache]);

  const getUIElementExplanation = useCallback(async (elementHtml: string) => {
    if (uiExplanationCache.has(elementHtml)) {
        return uiExplanationCache.get(elementHtml);
    }
    const prompt = `In one short sentence, what is the function of this UI element? Be concise and clear. HTML: \`${elementHtml.substring(0, 200)}\``;

    try {
        const response = await aiService.generateWithFallback(prompt);
        const explanationText = (response || '').trim();
        setUiExplanationCache(prev => new Map(prev).set(elementHtml, explanationText));
        return explanationText;
    } catch (error) {
        console.error("AI UI explanation error:", error);
        return "Could not fetch explanation.";
    }
  }, [uiExplanationCache]);


    useEffect(() => {
        const handleMessage = async (event: MessageEvent) => {
        if (typeof event.data !== 'object' || !event.data.type || !iframeRef.current) {
            return;
        }

        if (event.data.type === 'ui-hover') {
            const { elementHtml, rect } = event.data;
            const iframeRect = iframeRef.current.getBoundingClientRect();
            const top = iframeRect.top + rect.bottom + 10;
            const left = iframeRect.left + rect.left;
            
            setUiTooltip({ content: 'Analyzing...', position: { top, left } });
            const explanationText = await getUIElementExplanation(elementHtml);
            if (explanationText) {
                setUiTooltip({ content: explanationText, position: { top, left } });
            }
        } else if (event.data.type === 'ui-hover-out') {
            setUiTooltip(null);
        }
    };

    window.addEventListener('message', handleMessage);
    return () => {
        window.removeEventListener('message', handleMessage);
    };
}, [getUIElementExplanation]);


    const debouncedFetchExplanation = useCallback(debounce(getAIExplanation, 300), [getAIExplanation]);

  const handleMouseOver = async (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    if (target.dataset.token) {
        const token = target.dataset.token;
        setTooltip({ content: 'Analyzing...', position: { top: e.clientY + 15, left: e.clientX + 15 } });
        const explanationText = await debouncedFetchExplanation(token, false);
        if (explanationText) {
            setTooltip({ content: explanationText, position: { top: e.clientY + 15, left: e.clientX + 15 } });
        }
    }
  };

    const handleExplainCode = async () => {
        if (!code) return;
        setIsModalOpen(true);
        setExplanation('');
        // stream-ish: call the aiService and reveal progressively
        try {
            const full = await aiService.generateWithFallback(`Provide a clear, step-by-step explanation of this HTML/CSS/JS code. Highlight structure, interactivity, accessibility considerations, and important implementation notes.\n\n\`\`\`html\n${code}\n\`\`\``);
            setExplanation(full || 'Failed to get explanation.');
        } catch (e) {
            console.error('Explain code error', e);
            setExplanation('Failed to get explanation.');
        }
    };

    const handleGenerateArchitecture = async () => {
        if (!code) return;
        setIsArchModalOpen(true);
        setIsArchLoading(true);
        setArchitectureDiagram('');

    const prompt = `You are a technical architect analyzing website code. Generate a Mermaid.js diagram showing the site architecture.

ANALYZE THIS HTML CODE:
${code.substring(0, 6000)}

INSTRUCTIONS:
1. Identify ALL major sections (header, nav, hero, features, services, about, pricing, testimonials, gallery, contact, footer, etc.)
2. Show the hierarchical structure and relationships
3. Include interactive elements (buttons, forms, modals, etc.)
4. Use proper Mermaid syntax

OUTPUT REQUIREMENTS:
- Start with "graph TD" (top-down) or "graph LR" (left-right)
- Use format: NodeID[Display Name] for sections
- Use format: NodeID(Display Name) for interactive elements
- Use --> for connections
- Include 12-20 nodes for comprehensive view
- NO markdown fences, NO explanations, ONLY Mermaid code

EXAMPLE (analyze the actual code, don't copy this):
graph TD
    Root[Website Root]
    Root --> Header[Header]
    Root --> Main[Main Content]
    Root --> Footer[Footer]
    Header --> Logo[Logo]
    Header --> Nav[Navigation Menu]
    Header --> ThemeToggle(Theme Toggle)
    Main --> Hero[Hero Section]
    Main --> Features[Features Section]
    Main --> About[About Section]
    Hero --> HeroCTA(CTA Button)
    Features --> F1[Feature 1]
    Features --> F2[Feature 2]
    Features --> F3[Feature 3]

NOW GENERATE THE DIAGRAM FOR THE PROVIDED CODE:`;

        try {
            console.log('🎨 Generating architecture diagram...');
            const response = await aiService.generateWithFallback(prompt);
            let diagramCode = (response || '').trim();
            
            console.log('📊 Raw diagram response:', diagramCode.substring(0, 200));
            
            // Remove markdown fences if present
            diagramCode = diagramCode.replace(/```mermaid\n?/g, '').replace(/```\n?/g, '').replace(/```/g, '').trim();
            
            // Remove any leading/trailing text before/after the graph
            const graphMatch = diagramCode.match(/(graph\s+(TD|LR|TB|RL|BT)[\s\S]*)/i);
            if (graphMatch) {
              diagramCode = graphMatch[1].trim();
            }
            
            // Ensure it starts with "graph"
            if (!diagramCode.startsWith('graph')) {
              console.warn('⚠️ Diagram does not start with "graph", using fallback');
              // Generate a smart fallback based on code analysis
              const sections = [];
              if (/<header/i.test(code)) sections.push('Header');
              if (/<nav/i.test(code)) sections.push('Navigation');
              if (/hero|banner/i.test(code)) sections.push('Hero');
              if (/feature/i.test(code)) sections.push('Features');
              if (/about/i.test(code)) sections.push('About');
              if (/service/i.test(code)) sections.push('Services');
              if (/pricing|price/i.test(code)) sections.push('Pricing');
              if (/testimonial|review/i.test(code)) sections.push('Testimonials');
              if (/contact|form/i.test(code)) sections.push('Contact');
              if (/<footer/i.test(code)) sections.push('Footer');
              
              diagramCode = `graph TD
    Root[Website Root]
    ${sections.map((s, i) => `Root --> S${i}[${s} Section]`).join('\n    ')}
    ${/<button|<a/i.test(code) ? 'Root --> CTA(Call to Action Buttons)' : ''}
    ${/<form/i.test(code) ? 'Root --> Form(Interactive Forms)' : ''}
    ${/theme|dark.*mode/i.test(code) ? 'Root --> Theme(Theme Toggle)' : ''}`;
            }
            
            // Validate Mermaid syntax
            if (!diagramCode.includes('-->') && !diagramCode.includes('---')) {
              console.warn('⚠️ Diagram missing connections, using basic fallback');
              diagramCode = `graph TD
    Root[Website]
    Root --> Header[Header Section]
    Root --> Main[Main Content]
    Root --> Footer[Footer Section]
    Header --> Nav(Navigation)
    Main --> Hero[Hero Section]
    Main --> Content[Content Sections]
    Main --> CTA(Call to Action)`;
            }
            
            console.log('✅ Architecture diagram generated successfully');
            setArchitectureDiagram(diagramCode);
        } catch (error) {
            console.error("❌ Architecture diagram generation error:", error);
            // Smart fallback based on code analysis
            const sections = [];
            if (/<header/i.test(code)) sections.push('Header');
            if (/<nav/i.test(code)) sections.push('Navigation');
            if (/hero/i.test(code)) sections.push('Hero');
            if (/feature/i.test(code)) sections.push('Features');
            if (/<footer/i.test(code)) sections.push('Footer');
            
            const fallbackDiagram = `graph TD
    Root[Website]
    ${sections.map((s, i) => `Root --> S${i}[${s}]`).join('\n    ')}
    ${sections.length === 0 ? 'Root --> Content[Main Content]' : ''}`;
            
            setArchitectureDiagram(fallbackDiagram);
        } finally {
            setIsArchLoading(false);
        }
    };

    // Get current file content based on selection
    const getCurrentFileContent = () => {
        if (!files || (!files.css && !files.js)) {
            // If no multi-file structure, show the main code as HTML
            if (selectedFile === 'html') {
                return code;
            } else if (selectedFile === 'css') {
                return '/* CSS will be generated when you create a new website with multi-file structure */\n\n/* Click "Generate" to create separate CSS file */';
            } else if (selectedFile === 'js') {
                return '// JavaScript will be generated when you create a new website with multi-file structure\n\n// Click "Generate" to create separate JS file';
            }
        }
        
        switch (selectedFile) {
            case 'css':
                return files.css || '/* No CSS content - generating default styles... */';
            case 'js':
                return files.js || '// No JavaScript content - generating default functionality...';
            case 'html':
            default:
                return files.html || code;
        }
    };

    // Get file extension for syntax highlighting
    const getCurrentFileExtension = () => {
        switch (selectedFile) {
            case 'css': return 'css';
            case 'js': return 'javascript';
            case 'html':
            default: return 'html';
        }
    };

  const handleMouseOut = () => setTooltip(null);

  const renderInteractiveCode = (code: string) => {
    const lines = code.split('\n');
    const highlightedLines = lines.map(line => 
      line
        .replace(/<!--[\s\S]*?-->/g, (match) => `<span class="token-comment">${match}</span>`)
        .replace(/<([a-zA-Z0-9]+)/g, (match, p1) => `<span class="token-tag" data-token="${p1}">&lt;${p1}</span>`)
        .replace(/class="([^"]+)"/g, (match, classNames) => {
            const highlightedClasses = classNames.split(' ').map((cls: string) => `<span data-token="${cls}">${cls}</span>`).join(' ');
            return `<span class="token-attr-name">class</span>="<span class="token-attr-value">${highlightedClasses}</span>"`;
        })
    );
    
    return (
        <pre className="w-full h-full text-xs sm:text-sm overflow-x-auto">
            <div className="line-number" aria-hidden="true">
                {lines.map((_, i) => <div key={i} className="text-xs sm:text-sm">{i + 1}</div>)}
            </div>
            <code 
              onMouseOver={handleMouseOver} 
              onMouseOut={handleMouseOut} 
              dangerouslySetInnerHTML={{ __html: highlightedLines.join('\n') }} 
              className="block whitespace-pre font-mono leading-relaxed"
              style={{ 
                minWidth: 'max-content',
                paddingRight: '2rem' // Ensure content doesn't get cut off
              }}
            />
        </pre>
    );
  };

  useEffect(() => {
    if (code && activeTab !== 'code') {
      setActiveTab('preview');
    }
  }, [code]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopyStatus('Copied!');
    setTimeout(() => setCopyStatus('Copy'), 2000);
  };

  const handleExportCode = () => {
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wave-prototype.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateSrcDoc = (htmlCode: string) => {
    const script = `
        <script>
            document.addEventListener('DOMContentLoaded', () => {
                const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
                interactiveElements.forEach(el => {
                    el.addEventListener('mouseover', (e) => {
                        e.stopPropagation();
                        const rect = el.getBoundingClientRect();
                        window.parent.postMessage({
                            type: 'ui-hover',
                            elementHtml: el.outerHTML,
                            rect: { top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left }
                        }, '*');
                    });
                    el.addEventListener('mouseout', (e) => {
                        e.stopPropagation();
                        window.parent.postMessage({ type: 'ui-hover-out' }, '*');
                    });
                });
            });
        <\/script>
    `;
    return htmlCode.replace('</body>', `${script}</body>`);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center text-center p-4 min-h-[400px]">
          <div className="relative mb-4">
            <ChromeRingLogo className="w-16 sm:w-24 h-16 sm:h-24 opacity-40 animate-spin-slow" />
            <div className="absolute inset-0 blur-xl bg-blue-500/10 rounded-full"></div>
          </div>
          <p className="mt-6 text-base sm:text-lg font-semibold text-gray-300">Generating Prototype...</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">The AI is building your vision. Please wait.</p>
          
          {thinkingSteps && thinkingSteps.length > 0 && (
            <div className="mt-6 w-full max-w-sm sm:max-w-md text-left bg-slate-800/50 rounded-lg p-3 sm:p-4 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-blue-500/20">
                <BrainCircuitIcon className="w-4 sm:w-5 h-4 sm:h-5 text-blue-400 animate-spin-slow" />
                <span className="text-xs sm:text-sm font-semibold text-blue-300">AI Planning & Building</span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {thinkingSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs animate-slideIn">
                    <span className="text-yellow-400 font-bold flex-shrink-0 mt-0.5">○</span>
                    <span className="text-gray-300 leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-4 flex gap-1">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      );
    }
    if (!code) {
      return (
        <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center text-center p-4 min-h-[400px]">
            <div className="relative mb-4">
              <ChromeRingLogo className="w-24 sm:w-32 h-24 sm:h-32 opacity-20" />
              <div className="absolute inset-0 blur-2xl bg-blue-500/5 rounded-full"></div>
            </div>
            <p className="mt-6 text-lg sm:text-xl font-semibold text-gray-400">Ready to Create</p>
            <p className="text-sm text-gray-500 mt-2 max-w-xs sm:max-w-sm px-2">Describe your website or app idea in the chat to get started. The AI will generate production-ready code.</p>
            <div className="mt-6 sm:mt-8 px-3 sm:px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg mx-4">
              <p className="text-xs text-blue-300 flex items-center gap-2">
                <svg className="w-3 h-3 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Tip: Be descriptive about features, design, and functionality
              </p>
            </div>
        </div>
      );
    }
    if (activeTab === 'preview') {
      return (
        <div className="w-full h-full relative">
          <iframe 
            ref={iframeRef} 
            srcDoc={generateSrcDoc(code)} 
            title="Generated Preview" 
            className="w-full h-full border-none bg-white" 
            sandbox="allow-scripts"
            style={{ minHeight: '400px' }} // Ensure minimum height on mobile
          />
        </div>
      );
    }
    
    if (activeTab === 'code') {
      return (
        <div className="w-full h-full bg-slate-900 flex overflow-hidden">
          {/* File Explorer Panel */}
          {showFileExplorer && (
            <div className="w-48 bg-slate-800/50 border-r border-slate-700/50 flex-shrink-0">
              <div className="p-3 border-b border-slate-700/50">
                <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wide">Explorer</h3>
              </div>
              <div className="p-2">
                <div className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
                  </svg>
                  Generated Files
                </div>
                
                {/* HTML File */}
                <div 
                  className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-colors ${
                    selectedFile === 'html' ? 'bg-blue-600/30 text-blue-300' : 'text-gray-300 hover:bg-slate-700/50'
                  }`}
                  onClick={() => setSelectedFile('html')}
                >
                  <svg className="w-3 h-3 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-xs">index.html</span>
                </div>
                
                {/* CSS File */}
                <div 
                  className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-colors ${
                    selectedFile === 'css' ? 'bg-blue-600/30 text-blue-300' : 'text-gray-300 hover:bg-slate-700/50'
                  }`}
                  onClick={() => setSelectedFile('css')}
                >
                  <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zM3 15a1 1 0 011-1h1a1 1 0 011 1v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-1z" clipRule="evenodd"/>
                    <path d="M10.5 2.25a.75.75 0 00-1.5 0v6.5H7.75a.75.75 0 000 1.5h1.25v6.5a.75.75 0 001.5 0v-6.5h1.25a.75.75 0 000-1.5H10.5v-6.5z"/>
                  </svg>
                  <span className="text-xs">styles.css</span>
                  {(!files?.css) && <span className="text-xs text-gray-500 ml-1">(pending)</span>}
                </div>
                
                {/* JS File */}
                <div 
                  className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-colors ${
                    selectedFile === 'js' ? 'bg-blue-600/30 text-blue-300' : 'text-gray-300 hover:bg-slate-700/50'
                  }`}
                  onClick={() => setSelectedFile('js')}
                >
                  <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-xs">script.js</span>
                  {(!files?.js) && <span className="text-xs text-gray-500 ml-1">(pending)</span>}
                </div>
              </div>
            </div>
          )}
          
          {/* Code Display */}
          <div className="flex-1 overflow-auto ide-container relative">
            {/* Mobile Code View Optimization */}
            <div className="sm:hidden absolute top-2 right-2 z-10 bg-slate-800/90 rounded-lg p-2 text-xs text-gray-400">
              Swipe to scroll horizontally
            </div>
            
            {/* File Tab */}
            {showFileExplorer && (
              <div className="bg-slate-800/30 border-b border-slate-700/50 px-4 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {selectedFile === 'html' && (
                      <svg className="w-3 h-3 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"/>
                      </svg>
                    )}
                    {selectedFile === 'css' && (
                      <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4z" clipRule="evenodd"/>
                      </svg>
                    )}
                    {selectedFile === 'js' && (
                      <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                      </svg>
                    )}
                  </span>
                  <span className="text-sm text-gray-300">
                    {selectedFile === 'html' && 'index.html'}
                    {selectedFile === 'css' && 'styles.css'}
                    {selectedFile === 'js' && 'script.js'}
                  </span>
                </div>
              </div>
            )}
            
            <div className="min-w-full p-4" style={{ fontSize: 'clamp(10px, 2.5vw, 14px)' }}>
              {renderInteractiveCode(getCurrentFileContent())}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full w-full border-0 md:border md:border-blue-500/15 md:rounded-xl overflow-hidden bg-slate-800/40 backdrop-blur-sm shadow-xl shadow-black/30 min-h-0">
      {tooltip && <AITooltip content={tooltip.content} position={tooltip.position} />}
      {uiTooltip && <AIUITooltip content={uiTooltip.content} position={uiTooltip.position} />}
      {isModalOpen && <ExplanationModal content={explanation} onClose={() => setIsModalOpen(false)} />}
      {isArchModalOpen && <ArchitectureModal diagramCode={architectureDiagram} isLoading={isArchLoading} onClose={() => setIsArchModalOpen(false)} />}
      
      {/* Enhanced Mobile-Responsive Header */}
      <div className="bg-slate-800/50 flex border-b border-slate-700/30 flex-shrink-0">
        {/* Mobile Back Button */}
        {showMobilePreview && onMobileToggle && (
          <button
            onClick={onMobileToggle}
            className="md:hidden flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Chat</span>
          </button>
        )}
        
        {/* Tab Navigation - Full width on mobile */}
        <div className="flex flex-1 min-w-0">
          <button 
            onClick={() => setActiveTab('preview')} 
            className={`flex-1 sm:flex-none sm:px-6 px-3 py-3 sm:py-2.5 text-sm font-medium transition-all duration-200 ease-in-out ${
              activeTab === 'preview' 
                ? 'bg-slate-900/60 text-blue-400 border-b-2 border-blue-500' 
                : 'text-gray-400 hover:bg-slate-700/50 hover:text-gray-300'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <span className="hidden sm:inline">Preview</span>
              <span className="sm:hidden">👁️</span>
            </span>
          </button>
          <button 
            onClick={() => setActiveTab('code')} 
            className={`flex-1 sm:flex-none sm:px-6 px-3 py-3 sm:py-2.5 text-sm font-medium transition-all duration-200 ease-in-out ${
              activeTab === 'code' 
                ? 'bg-slate-900/60 text-blue-400 border-b-2 border-blue-500' 
                : 'text-gray-400 hover:bg-slate-700/50 hover:text-gray-300'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <span className="hidden sm:inline">Code</span>
              <span className="sm:hidden">💻</span>
            </span>
          </button>
        </div>
        
        {/* Action Buttons - Responsive Layout */}
        <div className="flex items-center gap-1 sm:gap-2 pr-2 sm:pr-3">
          {/* Mobile: Show only essential buttons */}
          <div className="sm:hidden flex items-center gap-1">
            {activeTab === 'code' && (
              <>
                <button 
                  onClick={handleCopyCode} 
                  className="p-2 text-xs font-medium text-gray-300 bg-slate-700/60 hover:bg-green-600/50 rounded-lg transition-all duration-200 border border-slate-600/30"
                  title="Copy Code"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z"/>
                    <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11.586l-3-3a1 1 0 00-1.414 0L9.293 9.879A1 1 0 0010 11.414V13h1.586l.707-.707L15 9.586z"/>
                  </svg>
                </button>
                <button 
                  onClick={handleExplainCode} 
                  className="p-2 text-xs font-medium text-gray-300 bg-slate-700/60 hover:bg-purple-600/50 rounded-lg transition-all duration-200 border border-slate-600/30"
                  title="Explain Code"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                  </svg>
                </button>
              </>
            )}
            <button 
              onClick={handleExportCode} 
              disabled={!code} 
              className="p-2 text-gray-300 bg-slate-700/60 hover:bg-blue-600/50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-600/30"
              title="Export HTML"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </button>
          </div>
          
          {/* Desktop: Show full buttons */}
          <div className="hidden sm:flex items-center gap-2">
            {activeTab === 'code' && (
              <>
                <button onClick={handleGenerateArchitecture} className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-gray-300 bg-slate-700/60 hover:bg-blue-600/50 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 border border-slate-600/30 hover:border-blue-500/30">
                  <ChartBarSquareIcon className="w-3.5 h-3.5" /> Architecture
                </button>
                <button onClick={handleExplainCode} className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-gray-300 bg-slate-700/60 hover:bg-purple-600/50 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 border border-slate-600/30 hover:border-purple-500/30">
                  <DocumentTextIcon className="w-3.5 h-3.5" /> Explain Code
                </button>
                <button onClick={handleCopyCode} className="px-3 py-1 text-xs font-medium text-gray-300 bg-slate-700/60 hover:bg-green-600/50 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 w-20 border border-slate-600/30 hover:border-green-500/30">{copyStatus}</button>
              </>
            )}
            <button onClick={handleExportCode} disabled={!code} className="p-2 text-gray-300 bg-slate-700/60 hover:bg-blue-600/50 rounded-lg transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed group transform hover:scale-110 border border-slate-600/30 hover:border-blue-500/30">
              <DownloadIcon className="w-4 h-4"/>
            </button>
          </div>
        </div>
      </div>
      
      {/* Content Area - Optimized for Mobile */}
      <div className="flex-grow min-h-0 relative overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
};

export default Preview;