import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signUp, signIn, signInWithGoogle } from './firebase/auth';
import { createTestUser } from './utils/testAuth';

function LoginNew() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });

  // This component will be protected by ProtectedRoute, so no need for manual auth check

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
        
        // Sign up with Firebase
        const user = await signUp(formData.email, formData.password, formData.fullName);
        setMessage(`✅ Account created successfully! Welcome ${user.displayName || formData.email}`);
        
        // Store user data in localStorage for quick access
        localStorage.setItem('wave_user', JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          loginTime: new Date().toISOString()
        }));
        
        // Redirect to main app after a brief moment
        setTimeout(() => navigate('/main'), 1000);
      } else {
        // Sign in with Firebase
        const user = await signIn(formData.email, formData.password);
        setMessage(`✅ Welcome back, ${user.displayName || user.email}!`);
        
        // Store user data in localStorage
        localStorage.setItem('wave_user', JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          loginTime: new Date().toISOString()
        }));
        
        // Redirect to main app
        setTimeout(() => navigate('/main'), 1000);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      let errorMessage = error.message || 'Authentication failed';
        
        // Handle specific Firebase auth errors
        if (errorMessage.includes('auth/user-not-found')) {
          errorMessage = 'No account found with this email. Please sign up first.';
        } else if (errorMessage.includes('auth/wrong-password')) {
          errorMessage = 'Incorrect password. Please try again.';
        } else if (errorMessage.includes('auth/invalid-credential')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (errorMessage.includes('Firebase not initialized')) {
          errorMessage = 'Authentication service is temporarily unavailable. Please refresh the page and try again.';
        } else if (errorMessage.includes('auth/invalid-email')) {
          errorMessage = 'Please enter a valid email address.';
        } else if (errorMessage.includes('auth/user-disabled')) {
          errorMessage = 'This account has been disabled. Please contact support.';
        } else if (errorMessage.includes('auth/too-many-requests')) {
          errorMessage = 'Too many failed attempts. Please try again later.';
        } else if (errorMessage.includes('auth/network-request-failed')) {
          errorMessage = 'Network error. Please check your internet connection.';
        }
        
        setMessage(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setMessage('');
    try {
      const user = await signInWithGoogle();
      setMessage(`✅ Logged in with Google! Welcome ${user.displayName || user.email}`);
      
      // Store user data in localStorage
      localStorage.setItem('wave_user', JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        loginTime: new Date().toISOString()
      }));
      
      // Redirect to main app
      setTimeout(() => navigate('/main'), 1000);
    } catch (error: any) {
      console.error('Google auth error:', error);
      let errorMessage = error.message || 'Google sign-in failed';
      
      // Handle specific Google auth errors
      if (errorMessage.includes('popup-closed-by-user')) {
        errorMessage = 'Sign-in was cancelled.';
      } else if (errorMessage.includes('popup-blocked')) {
        errorMessage = 'Pop-up was blocked. Please allow pop-ups for this site.';
      } else if (errorMessage.includes('auth/unauthorized-domain')) {
        errorMessage = 'Redirecting to Google sign-in...';
      } else if (errorMessage.includes('Redirecting to Google sign-in')) {
        setMessage('🔄 Redirecting to Google sign-in...');
        return; // Don't show as error
      } else if (errorMessage.includes('Firebase not initialized')) {
        errorMessage = 'Authentication service is temporarily unavailable. Please refresh the page and try again.';
      } else if (errorMessage.includes('auth/operation-not-allowed')) {
        errorMessage = 'Google sign-in is not enabled. Please contact support.';
      } else if (errorMessage.includes('auth/account-exists-with-different-credential')) {
        errorMessage = 'An account already exists with this email using a different sign-in method.';
      }
      
      setMessage(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Development helper function
  const handleCreateTestUser = async () => {
    if (process.env.NODE_ENV !== 'development') return;
    
    setLoading(true);
    setMessage('Creating test user...');
    try {
      await createTestUser();
      setMessage('✅ Test user created! Email: test@wave.ai, Password: test123456');
      
      // Auto-fill the form with test credentials
      setFormData({
        ...formData,
        email: 'test@wave.ai',
        password: 'test123456'
      });
    } catch (error: any) {
      setMessage(`❌ Failed to create test user: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(0,212,255,0.15),transparent)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(120,119,198,0.15),transparent)]"></div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-2 h-2 bg-blue-400/30 rounded-full animate-float" style={{top: '20%', left: '10%', animationDelay: '0s'}}></div>
        <div className="absolute w-3 h-3 bg-cyan-400/30 rounded-full animate-float" style={{top: '60%', left: '80%', animationDelay: '2s'}}></div>
        <div className="absolute w-2 h-2 bg-purple-400/30 rounded-full animate-float" style={{top: '40%', left: '60%', animationDelay: '4s'}}></div>
      </div>

      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left Section - Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          {/* Logo */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent animate-pulse-slow">
              WAVE AI
            </h1>
            <p className="text-gray-400 mt-2">Next-Gen AI Platform</p>
          </div>

          <div className="bg-gray-800/60 backdrop-blur-2xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl shadow-blue-900/20 animate-fade-in" style={{animationDelay: '0.2s'}}>
            <h2 className="text-3xl font-bold text-white mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-gray-400 mb-6">
              {isSignUp ? 'Sign up to start your AI journey' : 'Sign in to continue'}
            </p>

            {message && (
              <div className={`p-4 rounded-xl text-sm font-medium ${
                message.includes('✅') 
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {message}
              </div>
            )}


            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && (
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 bg-gray-900/60 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-300"
                    required={isSignUp}
                  />
                </div>
              )}

              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-4 bg-gray-900/60 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-300"
                  required
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-14 py-4 bg-gray-900/60 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-300"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {isSignUp && (
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 bg-gray-900/60 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-300"
                    required={isSignUp}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 bg-[length:200%_100%] text-white font-bold text-lg rounded-xl hover:bg-[position:100%_0] focus:outline-none focus:ring-2 focus:ring-blue-400/50 transform hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-400/40 disabled:opacity-50 disabled:cursor-not-allowed animate-gradient"
              >
                {loading
                  ? 'Please wait...'
                  : isSignUp
                  ? 'Create Account'
                  : 'Sign In'}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600/50"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gray-800/60 text-gray-400">or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-4 bg-transparent border-2 border-blue-400/60 text-blue-400 font-bold text-lg rounded-xl hover:bg-blue-400/10 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-400/30 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {loading ? 'Connecting...' : 'Google'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <span className="text-gray-400 text-sm">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-blue-400 hover:text-cyan-300 font-semibold hover:underline transition-all duration-200"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </span>
              
              {/* Development only test user button */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleCreateTestUser}
                    disabled={loading}
                    className="text-xs text-yellow-400 hover:text-yellow-300 underline disabled:opacity-50"
                  >
                    Create Test User (Dev Only)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Section - Illustration */}
        <div className="hidden lg:block animate-fade-in" style={{animationDelay: '0.4s'}}>
          <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/40 rounded-3xl p-12 h-[650px] flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-cyan-400/5 to-purple-500/10 rounded-3xl"></div>
            <div className="absolute top-0 left-0 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-0 right-0 w-56 h-56 bg-cyan-300/20 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
            
            <div className="text-center space-y-8 relative z-10">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-400 via-cyan-300 to-blue-500 rounded-full mx-auto flex items-center justify-center shadow-2xl shadow-blue-500/40 animate-float">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <div className="w-8 h-8 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
              
              <div>
                <h3 className="text-3xl font-bold text-white mb-4">Transform Your Ideas</h3>
                <p className="text-gray-300 text-lg max-w-md mx-auto leading-relaxed">
                  Experience the next generation of AI-powered development. Build, deploy, and scale your projects with Wave AI.
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mb-2">10K+</div>
                  <p className="text-gray-400 text-sm">Projects</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent mb-2">50K+</div>
                  <p className="text-gray-400 text-sm">Users</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mb-2">99%</div>
                  <p className="text-gray-400 text-sm">Satisfaction</p>
                </div>
              </div>
              
              <div className="flex justify-center space-x-3 pt-6">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-cyan-300 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes animate-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-float {
          animation: animate-float 6s ease-in-out infinite;
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}

export default LoginNew;
