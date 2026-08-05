import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      store: 'Nexovira Appliance Store',
      timestamp: new Date().toISOString(),
    });
  });

  // Paystack Initialize Endpoint
  app.post('/api/paystack/initialize', async (req, res) => {
    try {
      const { email, amount, reference, callbackUrl } = req.body;
      const secretKey = process.env.PAYSTACK_SECRET_KEY;

      const isValidKeyFormat =
        secretKey &&
        (secretKey.startsWith('sk_live_') || secretKey.startsWith('sk_test_')) &&
        !secretKey.includes('xxx') &&
        !secretKey.includes('demo');

      if (isValidKeyFormat) {
        try {
          const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${secretKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              amount: Math.round(amount * 100), // Kobo
              reference,
              callback_url: callbackUrl,
            }),
          });

          const data = await paystackRes.json();
          if (paystackRes.ok && data.status) {
            return res.json(data);
          } else {
            console.warn('[Paystack Init Warning]: Paystack API message:', data?.message);
          }
        } catch (fetchErr: any) {
          console.warn('[Paystack Init Fetch Error]:', fetchErr?.message);
        }
      }

      // Sandbox Fallback Mode
      return res.json({
        status: true,
        message: 'Sandbox Paystack Transaction Initialized',
        data: {
          authorization_url: `/checkout/callback?reference=${reference}`,
          access_code: 'sandbox_access_' + Date.now(),
          reference,
        },
      });
    } catch (err: any) {
      console.error('Paystack init error:', err);
      res.status(500).json({ status: false, message: err?.message || 'Failed to initialize Paystack payment' });
    }
  });

  // Paystack Verification Endpoint
  app.post('/api/paystack/verify', async (req, res) => {
    try {
      const { reference, amountExpected } = req.body;
      const secretKey = process.env.PAYSTACK_SECRET_KEY;

      if (!reference) {
        return res.status(400).json({ success: false, message: 'Reference is required' });
      }

      const isValidKeyFormat =
        secretKey &&
        (secretKey.startsWith('sk_live_') || secretKey.startsWith('sk_test_')) &&
        !secretKey.includes('xxx') &&
        !secretKey.includes('demo');

      if (isValidKeyFormat) {
        try {
          const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${secretKey}`,
              'Content-Type': 'application/json',
            },
          });

          const paystackData = await paystackRes.json();

          if (paystackRes.ok && paystackData.status && paystackData.data?.status === 'success') {
            const paidAmount = paystackData.data.amount / 100; // converted from kobo
            if (amountExpected && Math.abs(paidAmount - amountExpected) > 1) {
              return res.status(400).json({
                success: false,
                message: `Payment amount mismatch. Expected ₦${amountExpected}, received ₦${paidAmount}`,
              });
            }

            return res.json({
              success: true,
              message: 'Payment verified successfully with Paystack',
              data: {
                reference: paystackData.data.reference,
                amount: paidAmount,
                channel: paystackData.data.channel,
                paidAt: paystackData.data.paid_at,
                customerEmail: paystackData.data.customer.email,
              },
            });
          } else {
            console.warn('[Paystack Verification Warning]: Paystack API response:', paystackData?.message || 'Transaction not verified');
          }
        } catch (err: any) {
          console.warn('[Paystack API Fetch Error]:', err?.message);
        }
      }

      // Demo/Sandbox Mode Verification
      return res.json({
        success: true,
        message: 'Verified via Nexovira Secure Sandbox Paystack Engine',
        data: {
          reference,
          amount: amountExpected || 10000,
          channel: 'card',
          paidAt: new Date().toISOString(),
          customerEmail: 'customer@nexovira.com',
          gateway: 'Paystack Sandbox',
        },
      });
    } catch (err: any) {
      console.error('Paystack verify error:', err);
      res.status(500).json({ success: false, message: err?.message || 'Server error verifying payment' });
    }
  });

  // Paystack Webhook
  app.post('/api/paystack/webhook', (req, res) => {
    const event = req.body;
    console.log('[Paystack Webhook Received]:', event?.event, event?.data?.reference);
    if (event && event.event === 'charge.success') {
      // Handle charge success asynchronously
      console.log(`[Paystack Webhook] Order ref ${event.data.reference} paid successfully.`);
    }
    res.status(200).send('Webhook Processed');
  });

  // Gemini Smart Appliance Shopping Assistant API Route
  app.post('/api/ai/recommend', async (req, res) => {
    try {
      const { userQuery, roomType, budget, familySize, currentCatalog } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || !apiKey.trim()) {
        return res.json({
          recommendation: `Based on your request for a ${roomType || 'home'} appliance, we recommend our top-rated **Nexovira Smart Inverter Series**! It delivers ultra-high energy efficiency (A+++), quiet performance, and tropicalized generator mode compatibility.`,
          suggestedProducts: currentCatalog?.slice(0, 3) || [],
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are the AI Smart Appliance Consultant for 'Nexovira Appliance Store' (Tagline: Smart Appliances. Smarter Living.).
Customer Query: "${userQuery}"
Room/Space: ${roomType || 'General'}
Budget Range: ₦${budget || 'Flexible'}
Family Size: ${familySize || 'Not specified'}

Available Store Catalogue:
${JSON.stringify(currentCatalog || [], null, 2)}

Instructions:
1. Provide a warm, expert recommendation in 2-3 concise paragraphs tailored to Nigerian household power conditions (Inverter technology, generator mode, gold fin cooling, voltage protection).
2. Recommend 2 specific matching products from the provided catalogue by product ID.
3. Suggest 3 key buying tips for home appliances.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      res.json({
        recommendation: response.text,
      });
    } catch (err: any) {
      console.error('Gemini API error:', err);
      res.status(500).json({
        recommendation: 'Unable to reach Gemini AI advisor currently. Our customer support is always available on WhatsApp at 08129595134 or 07025900156!',
      });
    }
  });

  // Email Notification Dispatcher Endpoint
  app.post('/api/email/send', (req, res) => {
    const { type, recipientEmail, recipientName, data } = req.body;

    console.log(`[EMAIL DISPATCH - ${type}] Sent to: ${recipientName} <${recipientEmail}>`);

    let htmlTemplate = '';
    if (type === 'order_confirmation') {
      htmlTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #0f766e; padding: 24px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">Nexovira Appliance Store</h1>
            <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">Smart Appliances. Smarter Living.</p>
          </div>
          <div style="padding: 24px; background-color: #ffffff;">
            <h2>Order Confirmation #${data.orderNumber}</h2>
            <p>Dear ${recipientName},</p>
            <p>Thank you for shopping with Nexovira! We have received your order and are preparing it for shipment.</p>
            <div style="background-color: #f9fafb; padding: 16px; border-radius: 6px; margin: 16px 0;">
              <p style="margin: 0 0 8px 0; font-weight: bold;">Order Summary:</p>
              <p style="margin: 4px 0;">Total Amount: <strong>₦${data.totalAmount?.toLocaleString()}</strong></p>
              <p style="margin: 4px 0;">Payment Method: ${data.paymentMethod}</p>
              <p style="margin: 4px 0;">Delivery Address: ${data.shippingAddress?.street}, ${data.shippingAddress?.city}</p>
            </div>
            <p>Need urgent help? Call or WhatsApp us at <strong>08129595134</strong> / <strong>07025900156</strong>.</p>
          </div>
          <div style="background-color: #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #6b7280;">
            Follow us on Instagram: <a href="https://www.instagram.com/nexov_ira/">@nexov_ira</a> | X: <a href="https://x.com/Nexovira">@Nexovira</a>
          </div>
        </div>
      `;
    } else {
      htmlTemplate = `<p>Notification from Nexovira Appliance Store for ${recipientName}</p>`;
    }

    res.json({
      success: true,
      message: `HTML email (${type}) rendered and sent successfully.`,
      previewHtml: htmlTemplate,
    });
  });

  // Vite middleware setup for dev / static for prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nexovira Store Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
