import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, ArrowRight, ShieldCheck, AlertCircle, KeyRound } from 'lucide-react';
import { UserProfile } from '../types';
import { DEMO_ADMIN, DEMO_CUSTOMER, storageApi } from '../lib/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  initialMode?: 'signin' | 'signup' | 'admin';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'signin',
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'admin'>(initialMode);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

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

      // Customer sign in
      const customerUser: UserProfile = {
        ...DEMO_CUSTOMER,
        email: email.trim(),
        fullName: email.split('@')[0].toUpperCase() || DEMO_CUSTOMER.fullName,
      };
      storageApi.setCurrentUser(customerUser);
      onLoginSuccess(customerUser);
      onClose();
      return;
    }

    if (mode === 'signup') {
      if (!fullName.trim() || !email.trim() || !phone.trim() || !password.trim()) {
        setErrorMsg('Please fill in all required fields.');
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
        createdAt: new Date().toISOString(),
      };

      storageApi.setCurrentUser(newUser);
      onLoginSuccess(newUser);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header Banner */}
        <div className={`p-6 text-white ${mode === 'admin' ? 'bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950' : 'bg-gradient-to-r from-cyan-600 to-blue-700'}`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              {mode === 'admin' ? <Lock className="w-4 h-4 text-amber-300" /> : <User className="w-4 h-4 text-cyan-200" />}
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-200">
              {mode === 'admin' ? 'Restricted Access' : mode === 'signin' ? 'Welcome Back' : 'Create Account'}
            </span>
          </div>

          <h3 className="text-xl font-bold font-display">
            {mode === 'admin'
              ? 'Administrator Login'
              : mode === 'signin'
              ? 'Sign in to Nexovira'
              : 'Join Nexovira Store'}
          </h3>
          <p className="text-xs text-white/80 mt-1">
            {mode === 'admin'
              ? 'Authorized store management portal authentication.'
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

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

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
                : mode === 'signin'
                ? 'Sign In'
                : 'Create Account'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Tabs Switcher */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 text-center text-xs text-slate-600 flex items-center justify-between">
          {mode === 'admin' ? (
            <button
              onClick={() => {
                setMode('signin');
                setErrorMsg('');
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
