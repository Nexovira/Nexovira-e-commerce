import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, ArrowRight, ShieldCheck, AlertCircle, KeyRound, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { UserProfile } from '../types';
import { DEMO_ADMIN, storageApi } from '../lib/storage';
import { NexoviraLogo } from './NexoviraLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  initialMode?: 'signin' | 'signup' | 'admin' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'signin',
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'admin' | 'forgot'>(initialMode);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resetSent, setResetSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (mode === 'forgot') {
      if (!email.trim()) {
        setErrorMsg('Please enter your registered email address.');
        return;
      }

      // Verify email exists in registered accounts
      const registeredUsers = storageApi.getRegisteredUsers();
      const existingUser = registeredUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (!existingUser && email.trim().toLowerCase() !== 'admin@nexovira.com') {
        setErrorMsg('No registered account found with this email address. Please create an account first.');
        return;
      }

      if (!resetSent) {
        setResetSent(true);
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setSuccessMsg(`Reset code sent to ${email.trim()}! Your verification code is ${generatedOtp}. Enter your new password below.`);
      } else {
        if (!otpCode.trim() || !newPassword.trim()) {
          setErrorMsg('Please enter the verification code and your new password.');
          return;
        }
        setSuccessMsg('Password reset successfully! You can now sign in with your new password.');
        setTimeout(() => {
          setMode('signin');
          setResetSent(false);
          setPassword(newPassword);
        }, 1200);
      }
      return;
    }

    if (mode === 'admin') {
      // Validate Admin Credentials
      if (email.trim().toLowerCase() === 'admin@nexovira.com' && password === 'NexoviraAdmin2026!') {
        setSuccessMsg('Admin credentials verified. Authenticating...');
        setTimeout(() => {
          storageApi.setCurrentUser(DEMO_ADMIN);
          onLoginSuccess(DEMO_ADMIN);
          onClose();
        }, 500);
      } else {
        setErrorMsg('Invalid admin email or password. Please check your credentials.');
      }
      return;
    }

    if (mode === 'signin') {
      if (!email.trim() || !password.trim()) {
        setErrorMsg('Please enter both email and password.');
        return;
      }

      // Check if user matches admin
      if (email.trim().toLowerCase() === 'admin@nexovira.com') {
        if (password === 'NexoviraAdmin2026!') {
          storageApi.setCurrentUser(DEMO_ADMIN);
          onLoginSuccess(DEMO_ADMIN);
          onClose();
          return;
        } else {
          setErrorMsg('Invalid password for admin account.');
          return;
        }
      }

      // Check registered accounts
      const registeredUsers = storageApi.getRegisteredUsers();
      const existingUser = registeredUsers.find(
        (u) => u.email.trim().toLowerCase() === email.trim().toLowerCase()
      );

      if (!existingUser) {
        setErrorMsg('No account found with this email. You must create an account first before signing in.');
        return;
      }

      storageApi.setCurrentUser(existingUser);
      onLoginSuccess(existingUser);
      onClose();
      return;
    }

    if (mode === 'signup') {
      if (!fullName.trim() || !email.trim() || !phone.trim() || !password.trim()) {
        setErrorMsg('Please fill in all required fields.');
        return;
      }

      const registeredUsers = storageApi.getRegisteredUsers();
      const existing = registeredUsers.find(
        (u) => u.email.trim().toLowerCase() === email.trim().toLowerCase()
      );

      if (existing) {
        setErrorMsg('An account with this email address already exists. Please sign in instead.');
        return;
      }

      const newUser: UserProfile = {
        id: `usr-cust-${Date.now()}`,
        email: email.trim(),
        fullName: fullName.trim(),
        phone: phone.trim(),
        role: 'customer',
        referralCode: `NEXO-${fullName.substring(0, 4).toUpperCase()}${Math.floor(10 + Math.random() * 90)}`,
        walletBalance: 0,
        referralEarnings: 0,
        isPaystackConnected: false,
        createdAt: new Date().toISOString(),
      };

      storageApi.registerUser(newUser);
      storageApi.setCurrentUser(newUser);
      onLoginSuccess(newUser);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header Banner */}
        <div className={`p-5 sm:p-6 text-white ${mode === 'admin' ? 'bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950' : 'bg-gradient-to-r from-slate-900 to-blue-950'}`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="mb-3">
            <NexoviraLogo size="xs" lightMode={false} />
          </div>

          <h3 className="text-xl font-bold font-display">
            {mode === 'admin'
              ? 'Administrator Login'
              : mode === 'forgot'
              ? 'Reset Password'
              : mode === 'signin'
              ? 'Sign in to Nexovira'
              : 'Join Nexovira Store'}
          </h3>
          <p className="text-xs text-white/80 mt-1">
            {mode === 'admin'
              ? 'Authorized store management portal authentication.'
              : mode === 'forgot'
              ? 'Enter your account email address to receive a password reset verification code.'
              : mode === 'signin'
              ? 'Access your orders, wallet balance, and saved wishlist.'
              : 'Register to unlock exclusive warranty, wallet rewards, and easy tracking.'}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="e.g. Tunde Bakare"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                placeholder={mode === 'admin' ? 'admin@nexovira.com' : 'you@example.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  placeholder="08012345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Password</label>
                {(mode === 'signin' || mode === 'admin') && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    className="text-[11px] font-semibold text-cyan-600 hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {mode === 'forgot' && resetSent && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Verification Code (OTP)</label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className={`w-full py-3 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all ${
              mode === 'admin'
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-600/20'
            }`}
          >
            <span>
              {mode === 'admin'
                ? 'Authenticate Admin'
                : mode === 'forgot'
                ? resetSent
                  ? 'Update Password'
                  : 'Send Reset Code'
                : mode === 'signin'
                ? 'Sign In'
                : 'Create Account'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Tabs Switcher */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 text-center text-xs text-slate-600 flex items-center justify-between">
          {mode === 'admin' || mode === 'forgot' ? (
            <button
              onClick={() => {
                setMode('signin');
                setErrorMsg('');
                setSuccessMsg('');
                setResetSent(false);
              }}
              className="text-cyan-600 hover:underline font-bold"
            >
              ← Customer Sign In
            </button>
          ) : mode === 'signin' ? (
            <>
              <span>Don't have an account?</span>
              <button
                onClick={() => {
                  setMode('signup');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-cyan-600 hover:underline font-bold"
              >
                Create Account
              </button>
            </>
          ) : (
            <>
              <span>Already registered?</span>
              <button
                onClick={() => {
                  setMode('signin');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-cyan-600 hover:underline font-bold"
              >
                Sign In
              </button>
            </>
          )}

          {mode !== 'admin' && (
            <button
              onClick={() => {
                setMode('admin');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="text-slate-500 hover:text-amber-600 font-semibold flex items-center gap-1"
            >
              <Lock className="w-3 h-3" />
              <span>Admin</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

