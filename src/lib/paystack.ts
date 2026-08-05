interface PaystackInlineOptions {
  key: string;
  email: string;
  amount: number; // in Kobo (NGN * 100)
  ref: string;
  currency?: string;
  metadata?: Record<string, any>;
  onSuccess: (response: { reference: string; status: string }) => void;
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
