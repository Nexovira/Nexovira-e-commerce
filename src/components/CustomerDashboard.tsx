import React, { useState } from 'react';
import {
  UserProfile,
  Order,
  WalletTransaction,
  WithdrawalRequest,
  ReferralRecord,
} from '../types';
import {
  User,
  ShoppingBag,
  Wallet,
  Share2,
  Copy,
  Check,
  ArrowUpRight,
  Plus,
  Truck,
  Clock,
  ShieldCheck,
  Send,
  Loader2,
} from 'lucide-react';
import { storageApi } from '../lib/storage';
import { loadPaystackScript, paystackPublicKey, verifyPaymentServer } from '../lib/paystack';

interface CustomerDashboardProps {
  currentUser: UserProfile;
  orders: Order[];
  onRefreshUserData: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  currentUser,
  orders,
  onRefreshUserData,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'orders' | 'wallet' | 'referrals' | 'profile'>('overview');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Paystack Connection State
  const [paystackEmailInput, setPaystackEmailInput] = useState(currentUser.paystackEmail || currentUser.email);
  const [paystackPublicKeyInput, setPaystackPublicKeyInput] = useState(currentUser.paystackPublicKey || 'pk_test_42ed8290f1ddc9550302b48d285a855a8286a0d2');
  const [paystackConnecting, setPaystackConnecting] = useState(false);
  const [connectSuccessMsg, setConnectSuccessMsg] = useState('');

  // Fund Wallet State
  const [depositAmount, setDepositAmount] = useState<number>(50000);
  const [depositMsg, setDepositMsg] = useState('');
  const [isFundingWallet, setIsFundingWallet] = useState(false);

  const handleConnectPaystack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paystackEmailInput.trim()) return;

    setPaystackConnecting(true);
    setTimeout(() => {
      const updatedUser: UserProfile = {
        ...currentUser,
        isPaystackConnected: true,
        paystackEmail: paystackEmailInput.trim(),
        paystackPublicKey: paystackPublicKeyInput.trim(),
      };
      storageApi.setCurrentUser(updatedUser);
      setPaystackConnecting(false);
      setConnectSuccessMsg('Paystack Account successfully linked! Real payment gateway features unlocked.');
      onRefreshUserData();
    }, 600);
  };

  const handleDisconnectPaystack = () => {
    if (confirm('Disconnecting Paystack will lock wallet access until re-connected. Proceed?')) {
      const updatedUser: UserProfile = {
        ...currentUser,
        isPaystackConnected: false,
      };
      storageApi.setCurrentUser(updatedUser);
      onRefreshUserData();
    }
  };

  // Withdrawal Request State
  const [withdrawAmount, setWithdrawAmount] = useState<number>(20000);
  const [bankName, setBankName] = useState('GTBank');
  const [accountNumber, setAccountNumber] = useState('0123456789');
  const [accountName, setAccountName] = useState(currentUser.fullName);
  const [withdrawMsg, setWithdrawMsg] = useState('');

  const customerOrders = orders.filter((o) => o.userId === currentUser.id || o.customerEmail === currentUser.email);
  const myTransactions = storageApi.getWalletTransactions(currentUser.id);
  const myReferrals = storageApi.getReferrals(currentUser.id);

  const referralLink = `${window.location.origin}?ref=${currentUser.referralCode}`;

  const handleCopy = (text: string, isLink: boolean) => {
    navigator.clipboard.writeText(text);
    if (isLink) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleFundWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (depositAmount <= 0) return;

    setIsFundingWallet(true);
    setDepositMsg('');

    try {
      const loaded = await loadPaystackScript();
      const reference = 'WAL-' + Date.now();

      const completeTopUp = (ref: string) => {
        const updatedUser: UserProfile = {
          ...currentUser,
          walletBalance: currentUser.walletBalance + depositAmount,
        };
        storageApi.setCurrentUser(updatedUser);

        const tx: WalletTransaction = {
          id: 'tx-' + Date.now(),
          userId: currentUser.id,
          type: 'deposit',
          amount: depositAmount,
          status: 'completed',
          reference: ref,
          description: 'Paystack Wallet Top Up',
          createdAt: new Date().toISOString(),
        };
        storageApi.addWalletTransaction(tx);

        setDepositMsg(`Successfully funded ₦${depositAmount.toLocaleString()} to your Nexovira Wallet!`);
        setIsFundingWallet(false);
        onRefreshUserData();
        setTimeout(() => setDepositMsg(''), 5000);
      };

      const pkey = currentUser.paystackPublicKey || paystackPublicKey || 'pk_test_42ed8290f1ddc9550302b48d285a855a8286a0d2';

      if (loaded && window.PaystackPop) {
        const handler = window.PaystackPop.setup({
          key: pkey,
          email: currentUser.paystackEmail || currentUser.email,
          amount: Math.round(depositAmount * 100), // kobo
          ref: reference,
          currency: 'NGN',
          metadata: {
            custom_fields: [
              {
                display_name: 'Customer Name',
                variable_name: 'customer_name',
                value: currentUser.fullName,
              },
            ],
          },
          onSuccess: async (response) => {
            await verifyPaymentServer(response.reference, depositAmount);
            completeTopUp(response.reference);
          },
          onCancel: () => {
            setIsFundingWallet(false);
            setDepositMsg('Paystack payment cancelled.');
          },
        });
        handler.openIframe();
      } else {
        const res = await verifyPaymentServer(reference, depositAmount);
        completeTopUp(res.data?.reference || reference);
      }
    } catch (err: any) {
      console.error('Wallet top-up error:', err);
      setIsFundingWallet(false);
      setDepositMsg('Failed to process Paystack payment. Please try again.');
    }
  };

  const handleRequestWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmount > currentUser.walletBalance) {
      setWithdrawMsg('Insufficient wallet balance.');
      return;
    }

    const req: WithdrawalRequest = {
      id: 'wth-' + Date.now(),
      userId: currentUser.id,
      userName: currentUser.fullName,
      userEmail: currentUser.email,
      amount: withdrawAmount,
      bankName,
      accountNumber,
      accountName,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };

    storageApi.addWithdrawalRequest(req);

    // Deduct pending amount from user wallet
    const updatedUser: UserProfile = {
      ...currentUser,
      walletBalance: currentUser.walletBalance - withdrawAmount,
    };
    storageApi.setCurrentUser(updatedUser);

    setWithdrawMsg(`Withdrawal request of ₦${withdrawAmount.toLocaleString()} submitted for admin processing.`);
    onRefreshUserData();
    setTimeout(() => setWithdrawMsg(''), 4000);
  };

  const handleTransferReferralToWallet = () => {
    if (currentUser.referralEarnings <= 0) return;

    const earnings = currentUser.referralEarnings;
    const updatedUser: UserProfile = {
      ...currentUser,
      walletBalance: currentUser.walletBalance + earnings,
      referralEarnings: 0,
    };
    storageApi.setCurrentUser(updatedUser);

    const tx: WalletTransaction = {
      id: 'tx-ref-' + Date.now(),
      userId: currentUser.id,
      type: 'referral_bonus',
      amount: earnings,
      status: 'completed',
      reference: 'REF-CLAIM-' + Date.now(),
      description: 'Transfer Referral Earnings to Main Wallet',
      createdAt: new Date().toISOString(),
    };
    storageApi.addWalletTransaction(tx);

    onRefreshUserData();
  };

  return (
    <div className="py-10 bg-slate-50 text-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        {/* User Header Profile Banner */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-black text-2xl flex items-center justify-center shadow-md">
              {currentUser.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 font-display">{currentUser.fullName}</h1>
                <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded font-bold uppercase">
                  Verified Customer
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{currentUser.email} • {currentUser.phone}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Wallet Balance</span>
              <span className="text-base font-black text-slate-900">
                ₦{currentUser.walletBalance.toLocaleString()}
              </span>
            </div>

            <div className="bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Referral Earnings</span>
              <span className="text-base font-black text-emerald-600">
                ₦{currentUser.referralEarnings.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 mb-8 overflow-x-auto pb-2 text-xs font-semibold">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'orders', label: `My Orders (${customerOrders.length})` },
            { id: 'wallet', label: 'Wallet & Deposits' },
            { id: 'referrals', label: 'Referral Hub' },
            { id: 'profile', label: 'Profile Settings' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                activeSubTab === tab.id
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeSubTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <ShoppingBag className="w-6 h-6 text-blue-600 mb-2" />
                <h3 className="text-xs font-bold text-slate-500 uppercase">Total Orders Placed</h3>
                <p className="text-2xl font-black text-slate-900 mt-1">{customerOrders.length}</p>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <Wallet className="w-6 h-6 text-blue-600 mb-2" />
                <h3 className="text-xs font-bold text-slate-500 uppercase">Available Wallet Funds</h3>
                {currentUser.isPaystackConnected ? (
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    ₦{currentUser.walletBalance.toLocaleString()}
                  </p>
                ) : (
                  <div className="mt-1">
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 inline-flex items-center gap-1">
                      🔒 Paystack Not Connected
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <Share2 className="w-6 h-6 text-emerald-600 mb-2" />
                <h3 className="text-xs font-bold text-slate-500 uppercase">Referral Code</h3>
                <p className="text-2xl font-black text-emerald-600 mt-1">{currentUser.referralCode}</p>
              </div>
            </div>

            {/* Quick Recent Orders */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                Recent Orders
              </h3>
              {customerOrders.length === 0 ? (
                <p className="text-slate-500 text-xs">No orders placed yet.</p>
              ) : (
                <div className="space-y-3 text-xs">
                  {customerOrders.slice(0, 3).map((ord) => (
                    <div
                      key={ord.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4"
                    >
                      <div>
                        <p className="font-bold text-slate-900">#{ord.orderNumber}</p>
                        <p className="text-[11px] text-slate-500">
                          {new Date(ord.createdAt).toLocaleDateString()} • {ord.items.length} items
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">₦{ord.totalAmount.toLocaleString()}</p>
                        <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold uppercase border border-blue-100">
                          {ord.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeSubTab === 'orders' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 text-xs shadow-sm">
            <h2 className="text-base font-bold text-slate-900 font-display mb-2">Order History & Tracking</h2>
            {customerOrders.length === 0 ? (
              <p className="text-slate-500">You haven't placed any orders yet.</p>
            ) : (
              customerOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">Order #{ord.orderNumber}</span>
                      <span className="text-slate-500 ml-2">({new Date(ord.createdAt).toLocaleDateString()})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-2.5 py-0.5 rounded font-bold uppercase text-[10px]">
                        Payment: {ord.paymentStatus}
                      </span>
                      <span className="bg-blue-50 text-blue-600 border border-blue-200 px-2.5 py-0.5 rounded font-bold uppercase text-[10px]">
                        Status: {ord.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {ord.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 object-cover rounded-lg border border-slate-200 bg-white"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 truncate">{item.productName}</p>
                          <p className="text-[10px] text-slate-500">
                            Qty: {item.quantity} × ₦{item.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-slate-500">
                    <span>Tracking Number: <strong className="text-blue-600 font-mono">{ord.trackingNumber}</strong></span>
                    <span className="font-bold text-slate-900 text-sm">Total: ₦{ord.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeSubTab === 'wallet' && !currentUser.isPaystackConnected && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-xl mx-auto shadow-sm space-y-6 text-xs text-center">
            <div className="w-14 h-14 bg-cyan-50 border border-cyan-200 text-cyan-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 font-display">Paystack Account Connection Required</h3>
              <p className="text-slate-500 mt-1 leading-relaxed">
                To access your Nexovira Wallet, top up funds, or withdraw earnings to your bank, you must connect your registered Paystack account.
              </p>
            </div>

            {connectSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-left font-medium">
                {connectSuccessMsg}
              </div>
            )}

            <form onSubmit={handleConnectPaystack} className="space-y-4 text-left bg-slate-50 p-5 border border-slate-200 rounded-xl">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Paystack Account Email</label>
                <input
                  type="email"
                  required
                  value={paystackEmailInput}
                  onChange={(e) => setPaystackEmailInput(e.target.value)}
                  placeholder="e.g. user@example.com"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-cyan-600 font-medium"
                />
                <p className="text-[11px] text-slate-500 mt-1">This connects your customer profile with Paystack secure payment services.</p>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Paystack Merchant Public Key</label>
                <input
                  type="text"
                  required
                  value={paystackPublicKeyInput}
                  onChange={(e) => setPaystackPublicKeyInput(e.target.value)}
                  placeholder="pk_live_... or pk_test_..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 font-mono focus:outline-none focus:border-cyan-600 font-medium text-xs"
                />
                <p className="text-[11px] text-slate-500 mt-1">Enter your real Paystack merchant public key to process live checkout and deposits.</p>
              </div>

              <button
                type="submit"
                disabled={paystackConnecting}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                {paystackConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting Paystack Account...</span>
                  </>
                ) : (
                  <span>Connect Paystack Account & Unlock Wallet</span>
                )}
              </button>
            </form>
          </div>
        )}

        {activeSubTab === 'wallet' && currentUser.isPaystackConnected && (
          <div className="space-y-6 text-xs">
            {/* Paystack Connection Status Banner */}
            <div className="bg-cyan-50 border border-cyan-200 text-cyan-900 p-4 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-600 text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Paystack Account Connected</p>
                  <p className="text-slate-600 text-[11px]">
                    Linked Email: <span className="font-semibold text-slate-900">{currentUser.paystackEmail || currentUser.email}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={handleDisconnectPaystack}
                className="text-xs font-bold text-rose-600 hover:bg-rose-100/60 px-3 py-1.5 rounded-lg border border-rose-200 transition-colors"
              >
                Disconnect
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Fund & Withdraw */}
            <div className="lg:col-span-6 space-y-6">
              {/* Fund Wallet Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Plus className="w-4 h-4 text-blue-600" /> Fund Nexovira Wallet
                </h3>

                {depositMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 font-medium rounded-xl">
                    {depositMsg}
                  </div>
                )}

                <form onSubmit={handleFundWallet} className="space-y-3">
                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Deposit Amount (NGN)</label>
                    <input
                      type="number"
                      required
                      min={1000}
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isFundingWallet}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isFundingWallet ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Connecting Paystack...</span>
                      </>
                    ) : (
                      <span>Top Up via Paystack</span>
                    )}
                  </button>
                </form>
              </div>

              {/* Withdraw Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-600" /> Request Withdrawal to Bank
                </h3>

                {withdrawMsg && (
                  <div className="p-3 bg-slate-50 border border-slate-200 text-blue-600 font-medium rounded-xl">
                    {withdrawMsg}
                  </div>
                )}

                <form onSubmit={handleRequestWithdrawal} className="space-y-3">
                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Withdrawal Amount (NGN)</label>
                    <input
                      type="number"
                      required
                      min={1000}
                      max={currentUser.walletBalance}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-600 mb-1 font-medium">Bank Name</label>
                      <input
                        type="text"
                        required
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1 font-medium">Account Number</label>
                      <input
                        type="text"
                        required
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Account Name</label>
                    <input
                      type="text"
                      required
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-sm"
                  >
                    Submit Bank Withdrawal
                  </button>
                </form>
              </div>
            </div>

            {/* Right: Wallet Transaction History */}
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Wallet History
              </h3>

              {myTransactions.length === 0 ? (
                <p className="text-slate-500">No transaction logs available.</p>
              ) : (
                <div className="space-y-2">
                  {myTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{tx.description}</p>
                        <p className="text-[10px] text-slate-500">
                          {new Date(tx.createdAt).toLocaleString()} • Ref: {tx.reference}
                        </p>
                      </div>

                      <div
                        className={`font-bold ${
                          tx.type === 'deposit' || tx.type === 'referral_bonus'
                            ? 'text-emerald-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {tx.type === 'deposit' || tx.type === 'referral_bonus' ? '+' : '-'}₦
                        {tx.amount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        )}

        {activeSubTab === 'referrals' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 text-xs shadow-sm">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display mb-1">
                Nexovira Referral Partner Program
              </h2>
              <p className="text-slate-500">
                Earn 5% commission on every appliance order completed using your unique referral code or link!
              </p>
            </div>

            {/* Copy Links Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Your Referral Code</span>
                <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="font-mono font-bold text-blue-600 text-sm">{currentUser.referralCode}</span>
                  <button
                    onClick={() => handleCopy(currentUser.referralCode, false)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] flex items-center gap-1 border border-slate-200 font-medium"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Your Direct Link</span>
                <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="font-mono text-blue-600 truncate text-xs">{referralLink}</span>
                  <button
                    onClick={() => handleCopy(referralLink, true)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] flex items-center gap-1 shrink-0 ml-2 border border-slate-200 font-medium"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Transfer to Main Wallet Button */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900">Unclaimed Referral Earnings</p>
                <p className="text-emerald-600 font-black text-lg">
                  ₦{currentUser.referralEarnings.toLocaleString()}
                </p>
              </div>

              <button
                disabled={currentUser.referralEarnings <= 0}
                onClick={handleTransferReferralToWallet}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl disabled:opacity-50 shadow-sm"
              >
                Claim to Main Wallet
              </button>
            </div>
          </div>
        )}

        {activeSubTab === 'profile' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 text-xs max-w-xl shadow-sm">
            <h2 className="text-base font-bold text-slate-900 font-display mb-2">Profile & Delivery Address</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Full Name</label>
                <input
                  type="text"
                  readOnly
                  value={currentUser.fullName}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Email Address</label>
                <input
                  type="email"
                  readOnly
                  value={currentUser.email}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Phone Number</label>
                <input
                  type="text"
                  defaultValue={currentUser.phone}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Default Address</label>
                <input
                  type="text"
                  defaultValue={currentUser.address?.street || '15 Admiralty Way, Lekki Phase 1'}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                />
              </div>

              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-sm">
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
