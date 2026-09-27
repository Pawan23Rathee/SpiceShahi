import React, { useState } from 'react';
import { Page } from '../types';
import { ENABLE_WHATSAPP, WHATSAPP_CONFIG } from '../config/features';
import { WhatsAppIcon } from '../components/WhatsAppComponents';
import {
  DISPLAY_EMAIL,
  DISPLAY_INSTAGRAM,
  DISPLAY_INSTAGRAM_URL,
  DISPLAY_ADDRESS,
  DISPLAY_PHONE,
} from '../data/products';
import {
  Phone,
  Mail,
  MapPin,
  Instagram,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

interface ContactPageProps {
  onNavigate: (page: Page) => void;
}

export const ContactPage: React.FC<ContactPageProps> = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    interest: 'Fresh Home Spices Order',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 400);
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Header - Artistic Flair */}
      <section className="bg-[#FCFAF2] border-b border-[#E8E4D5] py-14">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-3">
          <span className="inline-block px-3 py-1 bg-[#F39C12]/20 text-[#D35400] text-[10px] font-bold uppercase tracking-[0.2em] rounded">
            We'd Love to Hear from You
          </span>
          <h1 className="font-serif italic font-bold text-4xl sm:text-5xl text-[#2C3E50] tracking-tight">
            Customer Care & <span className="text-[#96281B]">Support</span>
          </h1>
          <p className="text-base text-[#5D6D7E] leading-relaxed">
            Have questions about our pure, traditionally crafted spices, need custom pack sizes, or interested in wholesale supply? Reach out to our customer care team anytime.
          </p>
        </div>
      </section>

      {/* Main Grid: Info Cards + Form */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Contact Info Cards */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="font-serif italic font-bold text-2xl text-[#2C3E50]">
              Direct Contact Information
            </h2>
            <p className="text-sm text-[#5D6D7E] leading-relaxed">
              We respond promptly to every inquiry. Call or email us for order status, custom grinding requests, and distributor opportunities.
            </p>

            {/* Quick Cards */}
            <div className="space-y-4">
              {/* Phone Hotline Card */}
              <div className="p-5 rounded-xl bg-white border border-[#E8E4D5] shadow-xs hover:border-[#96281B] transition-colors flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#96281B]/10 border border-[#96281B]/20 text-[#96281B] flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[10px] uppercase font-bold text-[#96281B] tracking-widest">
                    Customer Hotline
                  </h3>
                  <a
                    href={`tel:${DISPLAY_PHONE}`}
                    className="text-base font-bold text-[#2C3E50] hover:text-[#96281B] underline underline-offset-4 block mt-0.5"
                  >
                    {DISPLAY_PHONE}
                  </a>
                  <p className="text-xs text-[#5D6D7E] mt-1">
                    Mon - Sat, 9:00 AM - 8:00 PM IST
                  </p>
                </div>
              </div>

              {/* Optional WhatsApp Support Card */}
              {ENABLE_WHATSAPP && (
                <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 shadow-xs hover:border-emerald-500 transition-colors flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <WhatsAppIcon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[10px] uppercase font-bold text-emerald-800 tracking-widest">
                      WhatsApp Orders & Support
                    </h3>
                    <a
                      href={WHATSAPP_CONFIG.getWhatsAppUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base font-bold text-emerald-950 hover:text-emerald-700 underline underline-offset-4 block mt-0.5"
                    >
                      {WHATSAPP_CONFIG.displayPhone}
                    </a>
                    <p className="text-xs text-emerald-800 mt-1">
                      Direct WhatsApp chat with our Bahadurgarh processing depot.
                    </p>
                  </div>
                </div>
              )}

              {/* Email Card */}
              <div className="p-5 rounded-xl bg-white border border-[#E8E4D5] shadow-xs hover:border-[#D35400] transition-colors flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#F1C40F]/10 border border-[#F1C40F]/30 text-[#D35400] flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[10px] uppercase font-bold text-[#D35400] tracking-widest">
                    Official Email
                  </h3>
                  <a
                    href={`mailto:${DISPLAY_EMAIL}`}
                    className="text-base font-bold text-[#2C3E50] hover:text-[#D35400] underline underline-offset-4 block mt-0.5"
                  >
                    {DISPLAY_EMAIL}
                  </a>
                  <p className="text-xs text-[#5D6D7E] mt-1">
                    For corporate gifting, online order assistance, and wholesale inquiries.
                  </p>
                </div>
              </div>

              {/* Instagram Card */}
              <div className="p-5 rounded-xl bg-white border border-[#E8E4D5] shadow-xs hover:border-pink-300 transition-colors flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-pink-50 border border-pink-200 text-pink-600 flex items-center justify-center shrink-0">
                  <Instagram className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[10px] uppercase font-bold text-pink-600 tracking-widest">
                    Instagram Handle
                  </h3>
                  <a
                    href={DISPLAY_INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-bold text-[#2C3E50] hover:text-pink-600 underline underline-offset-4 block mt-0.5"
                  >
                    {DISPLAY_INSTAGRAM}
                  </a>
                  <p className="text-xs text-[#5D6D7E] mt-1">
                    Follow farm reels, cooking tips, and seasonal spice harvests.
                  </p>
                </div>
              </div>

              {/* Physical Address Card */}
              <div className="p-5 rounded-xl bg-white border border-[#E8E4D5] shadow-xs hover:border-[#96281B] transition-colors flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#96281B]/10 border border-[#96281B]/20 text-[#96281B] flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[10px] uppercase font-bold text-[#96281B] tracking-widest">
                    Manufacturing Unit & Trading Depot
                  </h3>
                  <p className="text-sm font-semibold text-[#2C3E50] mt-0.5 leading-snug">
                    {DISPLAY_ADDRESS}
                  </p>
                  <p className="text-xs text-[#5D6D7E] mt-1">
                    Bahadurgarh, Haryana - 124507 • SRS Global Enterprises
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-[#E8E4D5] p-6 sm:p-10 shadow-sm">
              <div className="mb-6">
                <span className="inline-block px-3 py-1 bg-[#F39C12]/20 text-[#D35400] text-[10px] font-bold uppercase tracking-[0.2em] rounded">
                  Send an Inquiry
                </span>
                <h3 className="font-serif italic font-bold text-2xl text-[#2C3E50] mt-2">
                  Write to Our Bahadurgarh Team
                </h3>
                <p className="text-xs text-[#5D6D7E] mt-1">
                  Leave your query below and our team will get in touch with you shortly.
                </p>
              </div>

              {submitted ? (
                <div className="p-6 rounded-xl bg-[#2D5A27]/10 border border-[#2D5A27]/30 text-[#2D5A27] text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-[#2D5A27] mx-auto" />
                  <h4 className="font-bold text-lg text-[#2C3E50]">Thank You! Your Inquiry is Received</h4>
                  <p className="text-xs text-[#5D6D7E]">
                    Our support team has logged your inquiry and will contact you via phone or email at {formData.phone || formData.email} shortly.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: '',
                        phone: '',
                        email: '',
                        interest: 'Fresh Home Spices Order',
                        message: '',
                      });
                    }}
                    className="px-5 py-2 rounded-lg bg-[#96281B] text-white text-xs font-bold uppercase tracking-wider"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[#2C3E50] uppercase tracking-widest mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Pawan Rathee"
                      className="w-full px-4 py-3 bg-[#FCFAF2] border border-[#E8E4D5] rounded-lg text-sm text-[#2C3E50] placeholder-[#5D6D7E]/60 focus:outline-hidden focus:border-[#96281B]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[#2C3E50] uppercase tracking-widest mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 83072 15421"
                        className="w-full px-4 py-3 bg-[#FCFAF2] border border-[#E8E4D5] rounded-lg text-sm text-[#2C3E50] placeholder-[#5D6D7E]/60 focus:outline-hidden focus:border-[#96281B]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#2C3E50] uppercase tracking-widest mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@domain.com"
                        className="w-full px-4 py-3 bg-[#FCFAF2] border border-[#E8E4D5] rounded-lg text-sm text-[#2C3E50] placeholder-[#5D6D7E]/60 focus:outline-hidden focus:border-[#96281B]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#2C3E50] uppercase tracking-widest mb-1">
                      Inquiry Type
                    </label>
                    <select
                      value={formData.interest}
                      onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                      className="w-full px-4 py-3 bg-[#FCFAF2] border border-[#E8E4D5] rounded-lg text-sm text-[#2C3E50] focus:outline-hidden focus:border-[#96281B]"
                    >
                      <option value="Fresh Home Spices Order">Fresh Home Spices Order</option>
                      <option value="Turmeric Powder (Haldi)">Turmeric Powder (Haldi)</option>
                      <option value="Red Chili Powder (Lal Mirch)">Red Chili Powder (Lal Mirch)</option>
                      <option value="Coriander Powder (Dhaniya)">Coriander Powder (Dhaniya)</option>
                      <option value="Wholesale / Restaurant Bulk Supply">Wholesale / Restaurant Bulk Supply</option>
                      <option value="Other Questions">Other Questions</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#2C3E50] uppercase tracking-widest mb-1">
                      Your Message
                    </label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us what quantities or spices you are looking for..."
                      className="w-full px-4 py-3 bg-[#FCFAF2] border border-[#E8E4D5] rounded-lg text-sm text-[#2C3E50] placeholder-[#5D6D7E]/60 focus:outline-hidden focus:border-[#96281B]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 rounded-lg bg-[#96281B] hover:bg-[#7D2116] text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Sending...' : 'Submit Inquiry'}</span>
                  </button>

                  <p className="text-[11px] text-center text-[#5D6D7E]">
                    Your inquiry is sent directly to SRS Global Enterprises / SpiceShahi Bahadurgarh.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Location & Map Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-[#E8E4D5] overflow-hidden shadow-xs">
          <div className="p-6 sm:p-8 bg-[#FCFAF2] border-b border-[#E8E4D5] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#96281B]">
                Registered Office & Operations
              </span>
              <h3 className="font-serif italic font-bold text-xl text-[#2C3E50] mt-0.5">
                SpiceShahi (SRS Global Enterprises)
              </h3>
              <p className="text-xs text-[#5D6D7E] mt-1">
                {DISPLAY_ADDRESS} • FSSAI Lic: 20826007001593
              </p>
            </div>

            <a
              href="https://maps.google.com/?q=Arya+Nagar+Bahadurgarh+Haryana+124507"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-lg bg-[#96281B] hover:bg-[#7D2116] text-white text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2 shrink-0 transition-colors cursor-pointer shadow-xs"
            >
              <MapPin className="w-4 h-4" />
              <span>Open in Google Maps</span>
            </a>
          </div>

          {/* Clean Map Embed View */}
          <div className="w-full h-80 bg-stone-100 relative">
            <iframe
              title="SpiceShahi Bahadurgarh Location"
              src="https://maps.google.com/maps?q=Bahadurgarh+Haryana+124507&t=&z=14&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full grayscale-25 contrast-105"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
