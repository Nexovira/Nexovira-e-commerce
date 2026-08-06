interface PaystackInlineOptions {
  key: string;
  email: string;
  amount: number; // in Kobo (NGN * 100)
  ref: string;
  currency?: string;
  channels?: string[];
  metadata?: Record<string, any>;
  onSuccess: (response: { reference: string; status: string; message?: string; trans?: string; transaction?: string }) => void;
  onCancel: () => void;
}

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: PaystackInlineOptions) => { openIframe: () => void };
    };
  }
}

export const loadPaystackScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.PaystackPop) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const paystackPublicKey = (import.meta as any).env?.VITE_PAYSTACK_PUBLIC_KEY || '';

export async function initializeTransactionServer(params: {
  email: string;
  amount: number;
  reference: string;
  callbackUrl?: string;
  metadata?: any;
}): Promise<{ status: boolean; message?: string; data?: { authorization_url: string; access_code: string; reference: string } }> {
  try {
    const res = await fetch('/api/paystack/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    return json;
  } catch (err: any) {
    console.error('Initialize transaction server error:', err);
    return { status: false, message: err?.message || 'Network error initializing transaction' };
  }
}

export async function verifyPaymentServer(reference: string, amountExpected: number): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const res = await fetch('/api/paystack/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference, amountExpected }),
    });
    const json = await res.json();
    return json;
  } catch (err: any) {
    console.error('Payment verification failed:', err);
    return { success: false, message: err?.message || 'Network error verifying payment' };
  }
}

export async function getPaystackConnectUrl(params: {
  userId: string;
  mode: 'signin' | 'signup';
  email: string;
  businessName: string;
}): Promise<{ success: boolean; url?: string; redirectUri?: string; sandboxUrl?: string; message?: string }> {
  try {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`/api/paystack/connect/url?${query}`);
    return await res.json();
  } catch (err: any) {
    console.error('Failed to get Paystack Connect URL:', err);
    return { success: false, message: err?.message || 'Network error getting Paystack OAuth URL' };
  }
}

export async function createPaystackSubaccountServer(params: {
  userId: string;
  businessName: string;
  email: string;
  settlementBank?: string;
  accountNumber?: string;
  percentageCharge?: number;
}): Promise<{ success: boolean; message?: string; data?: any }> {
  try {
    const res = await fetch('/api/paystack/connect/subaccount', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return await res.json();
  } catch (err: any) {
    console.error('Paystack subaccount creation failed:', err);
    return { success: false, message: err?.message || 'Network error connecting Paystack account' };
  }
}

