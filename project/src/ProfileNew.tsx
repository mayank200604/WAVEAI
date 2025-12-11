import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, Bell, Shield, CreditCard, LogOut, ChevronRight, Moon, Globe, Lock, Mail, Smartphone } from 'lucide-react';
import { onAuthChange, logOut } from './firebase/auth';
import { UserDataService } from './services/userDataService';
import type { UserData } from './services/userDataService';

function ProfileNew() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [darkMode, setDarkMode] = useState(true);
  const [activeSection, setActiveSection] = useState('account');
  const [loading, setLoading] = useState(true);

  // Check authentication and load user data
  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          setLoading(true);
          const data = await UserDataService.loadUserData(user.uid);
          setUserData(data);
        } catch (error) {
          console.error('Error loading user data:', error);
          setUserData(UserDataService.getEmptyUserData());
        } finally {
          setLoading(false);
        }
      } else {
        setUserData(null);
        setLoading(false);
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await logOut();
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const menuItems = [
    { id: 'account', icon: User, label: 'Account', color: '#007AFF' },
    { id: 'security', icon: Shield, label: 'Security & Privacy', color: '#34C759' },
    { id: 'notifications', icon: Bell, label: 'Notifications', color: '#FF9500' },
    { id: 'billing', icon: CreditCard, label: 'Billing', color: '#FF3B30' },
    { id: 'preferences', icon: Settings, label: 'Preferences', color: '#5856D6' },
  ];

  const settingsOptions = [
    { icon: Moon, label: 'Dark Mode', type: 'toggle', value: darkMode, onChange: setDarkMode },
    { icon: Globe, label: 'Language', type: 'select', value: 'English' },
    { icon: Bell, label: 'Push Notifications', type: 'toggle', value: true },
    { icon: Mail, label: 'Email Notifications', type: 'toggle', value: true },
    { icon: Smartphone, label: 'Two-Factor Auth', type: 'toggle', value: false },
    { icon: Lock, label: 'Privacy Mode', type: 'toggle', value: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      {/* iOS-style Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/main')}
              className="text-[#007AFF] font-medium text-lg hover:opacity-70 transition-opacity"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
              Settings
            </h1>
            <div className="w-20"></div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200/50 dark:border-gray-800/50 overflow-hidden">
              {/* Profile Header */}
              <div className="relative h-32 bg-gradient-to-br from-[#007AFF] to-[#5856D6]">
                <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                  <div className="w-32 h-32 rounded-full bg-white dark:bg-gray-900 p-1 shadow-xl">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-[#007AFF] to-[#5856D6] flex items-center justify-center text-white text-4xl font-bold">
                      {userData?.profile?.name ? 
                        userData.profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 
                        currentUser?.email?.[0]?.toUpperCase() || 'W'
                      }
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-20 pb-6 px-6 text-center">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
                  {userData?.profile?.name || currentUser?.displayName || 'Wave User'}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {currentUser?.email || 'user@wave.ai'}
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {userData?.stats?.totalIdeas ? `${userData.stats.totalIdeas} Ideas` : 'New User'}
                  </span>
                </div>
              </div>

              {/* Menu Items */}
              <div className="px-3 pb-3">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all mb-2 ${
                      activeSection === item.id
                        ? 'bg-gray-100 dark:bg-gray-800 shadow-sm'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${item.color}20` }}
                    >
                      <item.icon size={20} style={{ color: item.color }} />
                    </div>
                    <span className="flex-1 text-left font-medium text-gray-900 dark:text-white">
                      {item.label}
                    </span>
                    <ChevronRight size={20} className="text-gray-400" />
                  </button>
                ))}

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all mt-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <LogOut size={20} className="text-red-500" />
                  </div>
                  <span className="flex-1 text-left font-medium text-red-500">
                    Sign Out
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200/50 dark:border-gray-800/50 p-8">
              {activeSection === 'account' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                    Account Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={userData?.profile?.name || currentUser?.displayName || ''}
                        placeholder="Please add your full name..."
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400"
                        readOnly
                      />
                    </div>

                    <div className="group">
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={currentUser?.email || ''}
                        placeholder="Please add your email address..."
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400"
                        readOnly
                      />
                    </div>

                    <div className="group">
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={''}
                        placeholder="Please add your phone number..."
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400"
                        readOnly
                      />
                    </div>

                    <div className="group">
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={''}
                        placeholder="Please add a bio about yourself..."
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400 resize-none"
                        readOnly
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="group">
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                          Join Date
                        </label>
                        <input
                          type="text"
                          value={userData?.stats?.joinDate || 'N/A'}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white"
                          readOnly
                        />
                      </div>
                      <div className="group">
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                          Last Login
                        </label>
                        <input
                          type="text"
                          value={userData?.stats?.lastLogin || 'N/A'}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white"
                          readOnly
                        />
                      </div>
                    </div>

                    <button className="w-full py-3 bg-[#007AFF] text-white font-semibold rounded-2xl hover:bg-[#0051D5] transition-all shadow-lg shadow-[#007AFF]/20">
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {activeSection === 'preferences' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                    Preferences
                  </h3>
                  
                  <div className="space-y-3">
                    {settingsOptions.map((option, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[#007AFF]/10 flex items-center justify-center">
                            <option.icon size={20} className="text-[#007AFF]" />
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {option.label}
                          </span>
                        </div>
                        
                        {option.type === 'toggle' && (
                          <button
                            onClick={() => option.onChange && option.onChange(!option.value)}
                            className={`relative w-14 h-8 rounded-full transition-all ${
                              option.value ? 'bg-[#34C759]' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          >
                            <div
                              className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${
                                option.value ? 'right-1' : 'left-1'
                              }`}
                            ></div>
                          </button>
                        )}
                        
                        {option.type === 'select' && (
                          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            <span>{option.value}</span>
                            <ChevronRight size={20} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'security' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                    Security & Privacy
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-800">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                          <Shield size={24} className="text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                            Account Secure
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Your account is protected with industry-standard encryption
                          </p>
                        </div>
                      </div>
                    </div>

                    <button className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all flex items-center justify-between">
                      <span className="font-medium text-gray-900 dark:text-white">
                        Change Password
                      </span>
                      <ChevronRight size={20} className="text-gray-400" />
                    </button>

                    <button className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all flex items-center justify-between">
                      <span className="font-medium text-gray-900 dark:text-white">
                        Two-Factor Authentication
                      </span>
                      <ChevronRight size={20} className="text-gray-400" />
                    </button>

                    <button className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all flex items-center justify-between">
                      <span className="font-medium text-gray-900 dark:text-white">
                        Active Sessions
                      </span>
                      <ChevronRight size={20} className="text-gray-400" />
                    </button>
                  </div>
                </div>
              )}

              {activeSection === 'billing' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                    Billing & Subscription
                  </h3>
                  
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                          Pro Plan
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          $29.99/month
                        </p>
                      </div>
                      <div className="px-4 py-2 bg-[#007AFF] text-white rounded-full font-semibold">
                        Active
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Next billing date: December 9, 2025
                    </p>
                  </div>

                  <button className="w-full py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
                    Manage Subscription
                  </button>
                </div>
              )}

              {activeSection === 'notifications' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                    Notifications
                  </h3>
                  
                  <div className="space-y-3">
                    {['Email Notifications', 'Push Notifications', 'SMS Alerts', 'Weekly Digest'].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl"
                      >
                        <span className="font-medium text-gray-900 dark:text-white">
                          {item}
                        </span>
                        <button className="relative w-14 h-8 rounded-full bg-[#34C759]">
                          <div className="absolute top-1 right-1 w-6 h-6 bg-white rounded-full shadow-md"></div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileNew;
