import React, { useState } from 'react';
import { MessageCircle, Phone, Mail, MapPin, Send, Instagram, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setName('');
      setEmail('');
      setMessage('');
      setSubmitted(false);
    }, 4000);
  };

  return (
    <div className="py-12 bg-slate-50 text-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
            We're Always Ready to Help
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 font-display mt-1">
            Contact Nexovira Appliance Store
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            Have questions about appliance installation, generator sizing, warranty claims, or custom orders? Reach out directly via phone, WhatsApp, or instant message.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Direct Contact Methods Cards */}
          <div className="lg:col-span-5 space-y-4">
            {/* WhatsApp Cards */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Official WhatsApp Sales & Support</h3>
                  <p className="text-xs text-slate-500">Instant response during business hours</p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <a
                  href="https://wa.me/2348129595134"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-emerald-600 font-bold"
                >
                  <span>Line 1: 08129595134</span>
                  <Send className="w-3.5 h-3.5" />
                </a>

                <a
                  href="https://wa.me/2347025900156"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-emerald-600 font-bold"
                >
                  <span>Line 2: 07025900156</span>
                  <Send className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3 text-xs shadow-sm">
              <h3 className="font-bold text-slate-900 text-sm">Follow Nexovira Social Channels</h3>
              <div className="space-y-2">
                <a
                  href="https://www.instagram.com/nexov_ira/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-700"
                >
                  <Instagram className="w-4 h-4 text-rose-500" />
                  <div>
                    <p className="font-bold text-slate-900">Instagram</p>
                    <p className="text-[11px] text-slate-500">@nexov_ira</p>
                  </div>
                </a>

                <a
                  href="https://x.com/Nexovira"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-700"
                >
                  <div className="w-4 h-4 text-blue-600 font-bold text-xs flex items-center justify-center">𝕏</div>
                  <div>
                    <p className="font-bold text-slate-900">X (Twitter)</p>
                    <p className="text-[11px] text-slate-500">@Nexovira</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Showroom Address */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-2 text-xs shadow-sm">
              <div className="flex items-center gap-2 text-blue-600 font-bold">
                <MapPin className="w-4 h-4" /> Nexovira Experience Hub
              </div>
              <p className="text-slate-600 leading-relaxed">
                Nexovira Experience Hub, Lekki Expressway Phase 1, Lagos State, Nigeria.
              </p>
            </div>
          </div>

          {/* Contact Inquiry Form */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 font-display">Send Us an Inquiry</h2>

            {submitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="font-bold text-slate-900 text-base">Thank you for contacting Nexovira!</h3>
                <p className="text-xs text-slate-600">
                  Our appliance expert has received your inquiry and will contact you via WhatsApp/Email shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Chidi Okafor"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. chidi@example.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Message / Inquiry Details</label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe what appliance you need assistance with..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-sm"
                >
                  Send Inquiry Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
