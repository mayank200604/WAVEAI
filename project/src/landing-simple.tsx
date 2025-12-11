import { useNavigate } from "react-router-dom";

function LandingSimple() {
  const navigate = useNavigate();

  const handleTryClick = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white flex flex-col items-center justify-center p-8">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Header */}
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          WAVE AI
        </h1>
        
        <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-cyan-400">
          Resurrect Your Ideas
        </h2>
        
        <p className="text-lg md:text-xl text-gray-300 mb-12 leading-relaxed max-w-2xl mx-auto">
          Transform abandoned concepts into market-ready opportunities with AI-powered analysis and strategic questioning. 
          Ideas don't die. They evolve.
        </p>

        {/* CTA Button */}
        <button
          onClick={handleTryClick}
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-400/25"
        >
          Try for Free
        </button>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#1e1e1e] p-6 rounded-lg border border-[#2a2a2a]">
            <div className="text-cyan-400 text-2xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold mb-2">Idea Analysis</h3>
            <p className="text-gray-400 text-sm">Deep dive analysis of why ideas failed and what can be learned.</p>
          </div>
          
          <div className="bg-[#1e1e1e] p-6 rounded-lg border border-[#2a2a2a]">
            <div className="text-cyan-400 text-2xl mb-4">🚀</div>
            <h3 className="text-lg font-semibold mb-2">AI Mutations</h3>
            <p className="text-gray-400 text-sm">Intelligent transformations of existing ideas into new opportunities.</p>
          </div>
          
          <div className="bg-[#1e1e1e] p-6 rounded-lg border border-[#2a2a2a]">
            <div className="text-cyan-400 text-2xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">Viability Scoring</h3>
            <p className="text-gray-400 text-sm">Real-time market analysis to score potential success of revived ideas.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingSimple;
