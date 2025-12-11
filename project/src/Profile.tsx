import React, { useState, useEffect } from 'react';
import { User, Bell, Palette, Key, Save, ArrowLeft, Shield, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProfileService, ProfileData } from './services/profileService';

function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');
  const [formData, setFormData] = useState<ProfileData>({
    fullName: 'Loading...',
    email: 'Loading...',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    notifications: {
      email: true,
      push: false,
      updates: true
    },
    theme: 'dark',
    language: 'en',
    apiKeys: {
      groq: '',
      gemini: '',
      perplexity: ''
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Load profile data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const profileData = ProfileService.loadProfileData();
        setFormData(profileData);
      } catch (error) {
        console.error('Error loading profile data:', error);
        setMessage({ type: 'error', text: 'Failed to load profile data' });
      }
    };
    loadData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      const [category, key] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [category]: {
          ...(prev[category as keyof typeof prev] as any),
          [key]: checkbox.checked
        }
      }));
    } else if (name.startsWith('apiKeys.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        apiKeys: {
          ...prev.apiKeys,
          [key]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage(null);
    setValidationErrors([]);

    try {
      // Validate form data
      const validation = ProfileService.validateProfileData(formData);
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        setMessage({ type: 'error', text: 'Please fix the validation errors below' });
        return;
      }

      // Update profile
      await ProfileService.updateUserProfile(formData);

      // Update password if provided
      if (formData.newPassword) {
        await ProfileService.updateUserPassword(formData.currentPassword, formData.newPassword);
        // Clear password fields after successful update
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      }

      setMessage({ type: 'success', text: 'Profile settings saved successfully!' });
    } catch (error: any) {
      console.error('Error saving profile:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to save profile settings' });
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Palette },
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#009DFF] to-[#0891b2] p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/main')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold" style={{fontFamily: 'Orbitron, sans-serif'}}>Profile Settings</h1>
              <p className="text-sm opacity-90 mt-1">Manage your account and preferences</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2 bg-white text-[#009DFF] px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Save size={20} />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 sticky top-6">
              {/* Profile Avatar */}
              <div className="text-center mb-6 pb-6 border-b border-[#2a2a2a]">
                <div className="w-24 h-24 bg-gradient-to-br from-[#009DFF] to-[#0891b2] rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold">
                  {formData.fullName.charAt(0)}
                </div>
                <h3 className="text-lg font-semibold">{formData.fullName}</h3>
                <p className="text-sm text-gray-400">{formData.email}</p>
              </div>

              {/* Navigation Tabs */}
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-[#009DFF] to-[#0891b2] text-white shadow-lg'
                          : 'text-gray-400 hover:bg-[#2a2a2a] hover:text-white'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Message Display */}
            {message && (
              <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                message.type === 'success' 
                  ? 'bg-green-900/20 border border-green-500/30 text-green-400' 
                  : 'bg-red-900/20 border border-red-500/30 text-red-400'
              }`}>
                {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                <span>{message.text}</span>
              </div>
            )}

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="mb-6 p-4 rounded-xl bg-red-900/20 border border-red-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={20} className="text-red-400" />
                  <span className="text-red-400 font-semibold">Please fix the following errors:</span>
                </div>
                <ul className="text-red-300 text-sm space-y-1 ml-6">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="list-disc">{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8">
              {/* Account Tab */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                      <User className="text-[#009DFF]" size={28} />
                      Account Information
                    </h2>
                    <p className="text-gray-400 mb-6">Update your personal information</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl text-white focus:border-[#009DFF] focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl text-white focus:border-[#009DFF] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                      <Shield className="text-[#009DFF]" size={28} />
                      Security Settings
                    </h2>
                    <p className="text-gray-400 mb-6">Manage your password and security preferences</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl text-white focus:border-[#009DFF] focus:outline-none transition-colors"
                        placeholder="Enter current password"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl text-white focus:border-[#009DFF] focus:outline-none transition-colors"
                        placeholder="Enter new password"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl text-white focus:border-[#009DFF] focus:outline-none transition-colors"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                      <Palette className="text-[#009DFF]" size={28} />
                      Preferences
                    </h2>
                    <p className="text-gray-400 mb-6">Customize your Wave AI experience</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
                      <select
                        name="theme"
                        value={formData.theme}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl text-white focus:border-[#009DFF] focus:outline-none transition-colors"
                      >
                        <option value="dark">Dark Mode</option>
                        <option value="light">Light Mode</option>
                        <option value="auto">Auto (System)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
                      <select
                        name="language"
                        value={formData.language}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl text-white focus:border-[#009DFF] focus:outline-none transition-colors"
                      >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* API Keys Tab */}
              {activeTab === 'api' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                      <Key className="text-[#009DFF]" size={28} />
                      API Keys
                    </h2>
                    <p className="text-gray-400 mb-6">Manage your AI provider API keys</p>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Zap className="text-[#009DFF]" size={20} />
                        <h3 className="font-semibold">Groq API Key</h3>
                      </div>
                      <input
                        type="password"
                        name="apiKeys.groq"
                        value={formData.apiKeys.groq}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:border-[#009DFF] focus:outline-none transition-colors"
                        placeholder="Enter Groq API key"
                      />
                    </div>

                    <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Zap className="text-[#009DFF]" size={20} />
                        <h3 className="font-semibold">Google Gemini API Key</h3>
                      </div>
                      <input
                        type="password"
                        name="apiKeys.gemini"
                        value={formData.apiKeys.gemini}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:border-[#009DFF] focus:outline-none transition-colors"
                        placeholder="Enter Gemini API key"
                      />
                    </div>

                    <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Zap className="text-[#009DFF]" size={20} />
                        <h3 className="font-semibold">Perplexity API Key</h3>
                      </div>
                      <input
                        type="password"
                        name="apiKeys.perplexity"
                        value={formData.apiKeys.perplexity}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:border-[#009DFF] focus:outline-none transition-colors"
                        placeholder="Enter Perplexity API key"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                      <Bell className="text-[#009DFF]" size={28} />
                      Notification Settings
                    </h2>
                    <p className="text-gray-400 mb-6">Choose what notifications you want to receive</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl">
                      <div>
                        <h3 className="font-semibold mb-1">Email Notifications</h3>
                        <p className="text-sm text-gray-400">Receive updates via email</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="notifications.email"
                          checked={formData.notifications.email}
                          onChange={handleInputChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#009DFF]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#009DFF]"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl">
                      <div>
                        <h3 className="font-semibold mb-1">Push Notifications</h3>
                        <p className="text-sm text-gray-400">Receive push notifications in browser</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="notifications.push"
                          checked={formData.notifications.push}
                          onChange={handleInputChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#009DFF]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#009DFF]"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl">
                      <div>
                        <h3 className="font-semibold mb-1">Product Updates</h3>
                        <p className="text-sm text-gray-400">Get notified about new features</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="notifications.updates"
                          checked={formData.notifications.updates}
                          onChange={handleInputChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#009DFF]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#009DFF]"></div>
                      </label>
                    </div>
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

export default Profile;
