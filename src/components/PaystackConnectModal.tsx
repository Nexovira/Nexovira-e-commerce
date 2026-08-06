import React, { useState } from 'react';
import { UserProfile } from '../types';
import {
  ShieldCheck,
  Building2,
  Mail,
  CreditCard,
  ExternalLink,
  CheckCircle2,
  X,
  Loader2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Unlink,
} from 'lucide-react';
import { getPaystackConnectUrl, createPaystackSubaccountServer } from '../lib/paystack';
import { storageApi } from '../lib/storage';

interface PaystackConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSuccess: (updatedUser: UserProfile) => void;
}

export const PaystackConnectModal: React.FC<PaystackConnectModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSuccess,
}) => {
  const [onboardingMode, setOnboardingMode] = useState<'select' | 'existing_oauth' | 'new_subaccount'>('select');
  const [businessName, setBusinessName] = useState(currentUser.paystackBusinessName || `${currentUser.fullName}'s Appliances`);
  const [email, setEmail] = useState(currentUser.paystackEmail || currentUser.email);
  const [bankCode, setBankCode] = useState('058'); // GTBank default
  const [accountNumber, setAccountNumber] = useState('0123456789');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const currentConnection = storageApi.getPaystackConnection(currentUser.id);
  const isConnected = currentUser.isPaystackConnected || currentUser.paystackConnectionStatus === 'connected';

  // Handle OAuth Authorization with Popup
  const handleInitiateOAuth = async (mode: 'signin' | 'signup') => {
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await getPaystackConnectUrl({
        userId: currentUser.id,
        mode,
        email,
        businessName,
      });

      if (!res.success) {
        throw new Error(res.message || 'Failed to initialize OAuth URL');
      }

      // Open OAuth popup window directly
      const popup = window.open(
        res.url || res.sandboxUrl,
        'paystack_connect_oauth',
        'width=600,height=720,scrollbars=yes,status=yes'
      );

      if (!popup) {
        setErrorMsg('Browser popup blocked. Please allow popups for Nexovira Store to connect your Paystack account.');
        setIsLoading(false);
        return;
      }

      // Simulate OAuth exchange or listen for message
      setTimeout(async () => {
        const subaccountRes = await createPaystackSubaccountServer({
          userId: currentUser.id,
          businessName,
          email,
          settlementBank: bankCode,
          accountNumber,
          percentageCharge: 2.5,
        });

        if (subaccountRes.success && subaccountRes.data) {
          const updatedUser: UserProfile = {
            ...currentUser,
            isPaystackConnected: true,
            paystackConnectionStatus: 'connected',
            paystackEmail: email,
            paystackBusinessName: businessName,
            paystackSubaccountCode: subaccountRes.data.subaccountCode,
            paystackConnectedAt: new Date().toISOString(),
          };

          storageApi.setCurrentUser(updatedUser);
          storageApi.savePaystackConnection(currentUser.id, {
            subaccountCode: subaccountRes.data.subaccountCode,
            businessName,
            email,
            status: 'connected',
            merchantId: subaccountRes.data.merchantId || 'MCH-' + Date.now(),
            connectedAt: new Date().toISOString(),
          });

          setSuccessMsg('🎉 Paystack Account Connected Successfully!');
          setIsLoading(false);
          onSuccess(updatedUser);

          setTimeout(() => {
            onClose();
          }, 1800);
        } else {
          setErrorMsg(subaccountRes.message || 'Failed to complete Paystack connection.');
          setIsLoading(false);
        }
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error initializing Paystack Connect');
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    if (confirm('Are you sure you want to disconnect your Paystack account?')) {
      setIsLoading(true);
      storageApi.disconnectPaystack(currentUser.id);
      
      const updatedUser: UserProfile = {
        ...currentUser,
        isPaystackConnected: false,
        paystackConnectionStatus: 'disconnected',
      };

      storageApi.setCurrentUser(updatedUser);
      setIsLoading(false);
      setSuccessMsg('Paystack connection removed.');
      onSuccess(updatedUser);
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl max-w-xl w-full p-6 md:p-8 shadow-2xl relative overflow-hidden">
        {/* Top Accent Gradient */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight">Paystack Connect</h3>
            <p className="text-xs text-slate-400">Authorize automated payouts & merchant transactions securely</p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-6 p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-3 h-3 rounded-full ${
                isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <div className="text-xs">
              <span className="text-slate-400">Connection Status: </span>
              <span className={`font-bold capitalize ${isConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isConnected ? 'Connected & Active' : 'Disconnected / Pending'}
              </span>
            </div>
          </div>
          {isConnected && (
            <button
              onClick={handleDisconnect}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20"
            >
              <Unlink className="w-3.5 h-3.5" />
              Disconnect
            </button>
          )}
        </div>

        {/* Messages */}
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Current Connected Info */}
        {isConnected ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Business Name:</span>
                <span className="font-semibold text-slate-200">{currentUser.paystackBusinessName || businessName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Merchant Email:</span>
                <span className="font-semibold text-slate-200">{currentUser.paystackEmail || currentUser.email}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Subaccount Code:</span>
                <span className="font-mono text-emerald-400 font-bold">{currentUser.paystackSubaccountCode || 'ACCT_LIVE_SECURE'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Connected Date:</span>
                <span className="text-slate-300">
                  {currentUser.paystackConnectedAt ? new Date(currentUser.paystackConnectedAt).toLocaleDateString() : 'Active'}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Mode Selection */}
            {onboardingMode === 'select' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Connect your Paystack account to receive direct customer payments, automated merchant settlements, and real-time revenue syncing.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => setOnboardingMode('existing_oauth')}
                    className="p-4 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 text-left transition group"
                  >
                    <div className="flex items-center gap-2 mb-1.5 text-emerald-400 font-semibold text-sm">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Existing Account</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Authorize with your existing Paystack merchant login via OAuth 2.0.
                    </p>
                    <div className="mt-3 flex items-center text-[11px] font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
                      <span>Sign In & Connect</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </div>
                  </button>

                  <button
                    onClick={() => setOnboardingMode('new_subaccount')}
                    className="p-4 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 text-left transition group"
                  >
                    <div className="flex items-center gap-2 mb-1.5 text-cyan-400 font-semibold text-sm">
                      <Sparkles className="w-4 h-4" />
                      <span>Create New Account</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Setup a new Paystack subaccount with automated settlement bank details.
                    </p>
                    <div className="mt-3 flex items-center text-[11px] font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
                      <span>Register New Paystack</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Mode 1: Existing OAuth */}
            {onboardingMode === 'existing_oauth' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleInitiateOAuth('signin');
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Business / Store Name</label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Nexovira Lekki Store"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Paystack Account Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    placeholder="merchant@paystack.com"
                  />
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setOnboardingMode('select')}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    ← Back to options
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-emerald-900/30 disabled:opacity-50 transition"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Authorizing Paystack...</span>
                      </>
                    ) : (
                      <>
                        <span>Connect Existing Account</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Mode 2: New Subaccount */}
            {onboardingMode === 'new_subaccount' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleInitiateOAuth('signup');
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Business Name</label>
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Contact Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Settlement Bank</label>
                    <select
                      value={bankCode}
                      onChange={(e) => setBankCode(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="058">GTBank (Guaranty Trust)</option>
                      <option value="011">First Bank of Nigeria</option>
                      <option value="033">United Bank for Africa (UBA)</option>
                      <option value="057">Zenith Bank</option>
                      <option value="044">Access Bank</option>
                      <option value="214">First City Monument Bank (FCMB)</option>
                      <option value="035">Wema Bank (ALAT)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Account Number</label>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                      placeholder="10 digit NUBAN"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-[11px] text-cyan-200">
                  ⚡ <strong>Auto-Settlement:</strong> Earnings from your sales on Nexovira store will be automatically settled to your bank account within T+1 working days via Paystack.
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setOnboardingMode('select')}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    ← Back to options
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-cyan-900/30 disabled:opacity-50 transition"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Registering Paystack Merchant...</span>
                      </>
                    ) : (
                      <>
                        <span>Create & Connect Paystack</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
