import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { signUp, login, googleLogin } from '../firebase/authservice';

function App() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isSignUp) {
        if (formData.password !== formData.confirmPassword) {
          setMessage('Passwords do not match.');
          setLoading(false);
          return;
        }
        const user = await signUp(formData.email, formData.password, formData.fullName);
        setMessage(`Account created successfully for ${user.email}`);
      } else {
        const user = await login(formData.email, formData.password);
        setMessage(`Welcome back, ${user.email}`);
      }
    } catch (error: any) {
      console.error('Auth (email) error:', error);
      setMessage(error?.message ?? String(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage('');
    try {
      const user = await googleLogin();
      setMessage(`Logged in with Google: ${user.email}`);
    } catch (error: any) {
      console.error('Auth (google) error:', error);
      setMessage(error?.message ?? String(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(0,212,255,0.1),transparent)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(120,119,198,0.1),transparent)]"></div>

      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Section - Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0 relative z-10">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              WAVE AI
            </h1>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-serif font-bold text-white mb-6">
              {isSignUp ? 'Create Your Account' : 'Welcome Back'}
            </h2>

            {message && (
              <div className="mb-4 text-center text-sm text-cyan-400 font-medium">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {isSignUp && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                    required={isSignUp}
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 bg-gray-900/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {isSignUp && (
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                    required={isSignUp}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-cyan-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-blue-400/25"
              >
                {loading
                  ? 'Please wait...'
                  : isSignUp
                  ? 'Sign up with email'
                  : 'Sign in with email'}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gray-800/50 text-gray-400">or</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3 bg-transparent border-2 border-blue-400/50 text-blue-400 font-semibold rounded-lg hover:bg-blue-400/10 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-400/25 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transform hover:scale-[1.02] transition-all duration-300"
              >
                {loading ? 'Connecting...' : isSignUp ? 'Sign up with Google' : 'Sign in with Google'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <span className="text-gray-400 text-sm">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-blue-400 hover:text-blue-300 font-medium hover:underline transition-all duration-200"
                >
                  {isSignUp ? 'Sign in' : 'Sign up'}
                </button>
              </span>
            </div>
          </div>
        </div>

        {/* Right Section - Illustration Area */}
        <div className="hidden lg:block">
          <div className="bg-gray-800/30 backdrop-blur-lg border border-gray-700/30 rounded-3xl p-12 h-[600px] flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-400/10 rounded-3xl"></div>
            <div className="absolute top-0 left-0 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-cyan-300/20 rounded-full blur-3xl"></div>
            
            <div className="text-center space-y-6 relative z-10">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-full mx-auto flex items-center justify-center shadow-lg">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
              <h3 className="text-2xl font-serif font-bold text-white">Welcome to the Future</h3>
              <p className="text-gray-300 max-w-sm leading-relaxed">
                Something like a mockup video or anything about Wave or some illustrations. 
                Experience the next generation of AI-powered solutions designed to transform your workflow.
              </p>
              <div className="flex justify-center space-x-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
