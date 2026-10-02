import React, { useState } from 'react';
import { Page } from '../types';
import { ENABLE_WHATSAPP, WHATSAPP_NUMBER, buildDistributorWhatsAppMessage } from '../config/features';
import { WhatsAppIcon } from '../components/WhatsAppComponents';
import { INDIAN_STATES } from '../data/indianStates';
import {
  DISPLAY_EMAIL,
  DISPLAY_PHONE,
  DISPLAY_ADDRESS,
} from '../data/products';
import {
  ShieldCheck,
  Sparkles,
  Truck,
  TrendingUp,
  MapPin,
  Store,
  Users,
  CheckCircle2,
  AlertCircle,
  Send,
  Building2,
  FileCheck,
  Award,
  Phone,
  Mail,
  ChevronRight,
  PackageCheck,
  Check,
  Clock,
} from 'lucide-react';

interface DistributorPageProps {
  onNavigate: (page: Page) => void;
}

const BUSINESS_TYPES = [
  'Retailer',
  'Wholesaler',
  'Distributor',
  'Supermarket',
  'Grocery Store',
  'Restaurant / Hotel',
  'Online Seller',
  'Other',
];

const YEARS_IN_BUSINESS_OPTIONS = [
  'New Venture (< 1 Year)',
  '1 - 3 Years',
  '3 - 5 Years',
  '5 - 10 Years',
  '10+ Years',
];

const MONTHLY_REQUIREMENT_OPTIONS = [
  '50 - 100 kg',
  '100 - 250 kg',
  '250 - 500 kg',
  '500 kg - 1 Ton',
  '1+ Ton (Commercial / Super Stockist)',
];

export const DistributorPage: React.FC<DistributorPageProps> = ({ onNavigate }) => {
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    mobile: '',
    email: '',
    city: '',
    state: 'Haryana',
    pincode: '',
    businessType: 'Distributor',
    yearsInBusiness: '1 - 3 Years',
    currentCategories: '',
    monthlyRequirement: '100 - 250 kg',
    preferredTerritory: '',
    fmcgExperience: 'Yes',
    message: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedEnquiryId, setSubmittedEnquiryId] = useState<string | null>(null);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.businessName.trim()) errors.businessName = 'Business name is required';

    const cleanMobile = formData.mobile.replace(/\D/g, '');
    if (!formData.mobile.trim() || cleanMobile.length < 10) {
      errors.mobile = 'Enter a valid 10-digit mobile number';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errors.email = 'Enter a valid email address';
    }

    if (!formData.city.trim()) errors.city = 'City / District is required';
    if (!formData.state.trim()) errors.state = 'State is required';

    const cleanPin = formData.pincode.replace(/\D/g, '');
    if (!formData.pincode.trim() || cleanPin.length < 5) {
      errors.pincode = 'Enter a valid PIN code';
    }

    if (!formData.businessType) errors.businessType = 'Select your business type';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      window.scrollTo({ top: 600, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/distributor/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit enquiry. Please try again.');
      }

      setSubmittedEnquiryId(data.enquiryId || 'DIST-1001');
      window.scrollTo({ top: 400, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Distributor enquiry submit error:', err);
      setSubmitError(err.message || 'Something went wrong. Please check your connection or contact our desk directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppEnquiry = () => {
    const text = buildDistributorWhatsAppMessage({
      name: formData.name.trim() || 'Prospective Distributor',
      businessName: formData.businessName.trim() || 'Food Business',
      mobile: formData.mobile.trim() || undefined,
      city: formData.city.trim() || 'My City',
      state: formData.state || 'Haryana',
      businessType: formData.businessType || 'Distributor',
      monthlyRequirement: formData.monthlyRequirement,
      preferredTerritory: formData.preferredTerritory.trim() || formData.city.trim() || 'Local District',
    });

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO SECTION */}
      <section className="bg-linear-to-b from-[#FCFAF2] via-[#F7F3E8] to-[#FCFAF2] border-b border-[#E8E4D5] py-16 sm:py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#96281B]/10 border border-[#96281B]/20 text-[#96281B] text-xs font-bold uppercase tracking-widest">
              <Building2 className="w-3.5 h-3.5" />
              <span>Grow With SpiceShahi • B2B & Wholesale Partnership</span>
            </div>

            <h1 className="font-serif italic font-bold text-4xl sm:text-5xl lg:text-6xl text-[#2C3E50] tracking-tight leading-tight">
              Become a <span className="text-[#96281B]">SpiceShahi</span> Distributor
            </h1>

            <p className="text-base sm:text-lg text-[#5D6D7E] leading-relaxed">
              Bring authentic, traditionally cold-ground SpiceShahi spices to customers in your city. Partner with SRS Global Enterprises for protected territories, attractive trade margins, and direct factory-fresh dispatches from our Bahadurgarh processing mill.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <a
                href="#enquiry-form"
                className="px-7 py-3.5 rounded-xl bg-[#96281B] hover:bg-[#7D2116] text-white font-bold text-xs uppercase tracking-widest transition-all shadow-md shadow-[#96281B]/20 flex items-center gap-2"
              >
                <span>Become a Distributor</span>
                <ChevronRight className="w-4 h-4" />
              </a>

              <a
                href="#enquiry-form"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, businessType: 'Wholesaler' }));
                }}
                className="px-6 py-3.5 rounded-xl border border-[#2C3E50] text-[#2C3E50] hover:bg-[#2C3E50] hover:text-white font-bold text-xs uppercase tracking-widest transition-all"
              >
                <span>Wholesale Enquiry</span>
              </a>

              {ENABLE_WHATSAPP && (
                <button
                  type="button"
                  onClick={handleWhatsAppEnquiry}
                  className="px-5 py-3 rounded-xl border border-emerald-600 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
                  title="Chat directly on WhatsApp"
                >
                  <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
                  <span>Enquire on WhatsApp</span>
                </button>
              )}
            </div>

            {/* Micro Trust Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-[#E8E4D5]">
              <div>
                <p className="font-serif text-2xl font-bold text-[#96281B]">100%</p>
                <p className="text-xs text-[#5D6D7E]">Pure Cold Ground</p>
              </div>
              <div>
                <p className="font-serif text-2xl font-bold text-[#2D5A27]">Exclusive</p>
                <p className="text-xs text-[#5D6D7E]">City Territory</p>
              </div>
              <div>
                <p className="font-serif text-2xl font-bold text-[#D35400]">24 - 48h</p>
                <p className="text-xs text-[#5D6D7E]">Depot Dispatch</p>
              </div>
              <div>
                <p className="font-serif text-2xl font-bold text-[#2C3E50]">FSSAI</p>
                <p className="text-xs text-[#5D6D7E]">20826007001593</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PARTNERSHIP BENEFITS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#D35400] bg-[#F39C12]/20 px-3 py-1 rounded">
            Why Partner With Us
          </span>
          <h2 className="font-serif italic font-bold text-3xl sm:text-4xl text-[#2C3E50]">
            Distributor Advantages & Benefits
          </h2>
          <p className="text-sm text-[#5D6D7E]">
            We build long-term, mutually prosperous relationships with our regional trade partners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Benefit 1 */}
          <div className="p-6 rounded-2xl bg-white border border-[#E8E4D5] shadow-xs hover:border-[#96281B] transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#96281B]/10 text-[#96281B] flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#2C3E50]">
              Protected City Territory
            </h3>
            <p className="text-xs text-[#5D6D7E] leading-relaxed">
              We allocate protected regional boundaries for approved distributors to avoid intra-brand price wars and ensure healthy retail distribution margins.
            </p>
          </div>

          {/* Benefit 2 */}
          <div className="p-6 rounded-2xl bg-white border border-[#E8E4D5] shadow-xs hover:border-[#96281B] transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#2D5A27]/10 text-[#2D5A27] flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#2C3E50]">
              Attractive Trade Margins
            </h3>
            <p className="text-xs text-[#5D6D7E] leading-relaxed">
              Direct mill supply pricing allows competitive margins for both your wholesale business and the grocers, supermarkets, and restaurants you supply.
            </p>
          </div>

          {/* Benefit 3 */}
          <div className="p-6 rounded-2xl bg-white border border-[#E8E4D5] shadow-xs hover:border-[#96281B] transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#F1C40F]/20 text-[#D35400] flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#2C3E50]">
              Uncompromising Quality Purity
            </h3>
            <p className="text-xs text-[#5D6D7E] leading-relaxed">
              Zero chemical adulteration, no artificial color, and traditional slow stone milling. Your customers taste the real desi aroma and repeat buy regularly.
            </p>
          </div>

          {/* Benefit 4 */}
          <div className="p-6 rounded-2xl bg-white border border-[#E8E4D5] shadow-xs hover:border-[#96281B] transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#2C3E50]/10 text-[#2C3E50] flex items-center justify-center">
              <PackageCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#2C3E50]">
              Marketing & POS Collateral
            </h3>
            <p className="text-xs text-[#5D6D7E] leading-relaxed">
              Receive retail countertop display racks, branded banners, free sample pouches for local store owners, and high-res digital assets for promotion.
            </p>
          </div>

          {/* Benefit 5 */}
          <div className="p-6 rounded-2xl bg-white border border-[#E8E4D5] shadow-xs hover:border-[#96281B] transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#D35400]/10 text-[#D35400] flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#2C3E50]">
              Fast Mill Depot Dispatch
            </h3>
            <p className="text-xs text-[#5D6D7E] leading-relaxed">
              Centrally situated in Bahadurgarh, Haryana (NCR hub), enabling reliable 24-48 hour truck/courier dispatches across North India and all major transport hubs.
            </p>
          </div>

          {/* Benefit 6 */}
          <div className="p-6 rounded-2xl bg-white border border-[#E8E4D5] shadow-xs hover:border-[#96281B] transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#96281B]/10 text-[#96281B] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#2C3E50]">
              FSSAI Certified & Tested
            </h3>
            <p className="text-xs text-[#5D6D7E] leading-relaxed">
              Every production batch undergoes strict quality checks. All master cartons and consumer pouches carry clear FSSAI certification and batch traceability.
            </p>
          </div>
        </div>
      </section>

      {/* 3. HOW THE PARTNERSHIP WORKS */}
      <section className="bg-white border-y border-[#E8E4D5] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#2D5A27] bg-[#2D5A27]/10 px-3 py-1 rounded">
              Clear 4-Step Process
            </span>
            <h2 className="font-serif italic font-bold text-3xl sm:text-4xl text-[#2C3E50]">
              How the Partnership Works
            </h2>
            <p className="text-sm text-[#5D6D7E]">
              From enquiry to your first consignment on store shelves in under 5 business days.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-[#FCFAF2] border border-[#E8E4D5] space-y-3 relative">
              <div className="w-8 h-8 rounded-full bg-[#96281B] text-white flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h3 className="font-serif font-bold text-base text-[#2C3E50]">
                Submit Enquiry
              </h3>
              <p className="text-xs text-[#5D6D7E] leading-relaxed">
                Fill the business form below or message our sales desk on WhatsApp with your target territory and business profile.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-[#FCFAF2] border border-[#E8E4D5] space-y-3 relative">
              <div className="w-8 h-8 rounded-full bg-[#D35400] text-white flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h3 className="font-serif font-bold text-base text-[#2C3E50]">
                Territory Review
              </h3>
              <p className="text-xs text-[#5D6D7E] leading-relaxed">
                Our Bahadurgarh leadership team reviews existing regional dealership coverage within 24 to 48 hours to confirm exclusivity.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-[#FCFAF2] border border-[#E8E4D5] space-y-3 relative">
              <div className="w-8 h-8 rounded-full bg-[#F39C12] text-white flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h3 className="font-serif font-bold text-base text-[#2C3E50]">
                Margins & Catalog
              </h3>
              <p className="text-xs text-[#5D6D7E] leading-relaxed">
                Upon qualification, receive confidential trade price tiers, credit terms, promotional pack assortments, and MOQs.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-[#FCFAF2] border border-[#E8E4D5] space-y-3 relative">
              <div className="w-8 h-8 rounded-full bg-[#2D5A27] text-white flex items-center justify-center font-bold text-xs">
                4
              </div>
              <h3 className="font-serif font-bold text-base text-[#2C3E50]">
                Stock Dispatch
              </h3>
              <p className="text-xs text-[#5D6D7E] leading-relaxed">
                First shipment is packed fresh from the mill floor and dispatched with store banners and display stands.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DISTRIBUTOR ENQUIRY FORM & DIRECT CONTACT */}
      <section id="enquiry-form" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Form Details & Value */}
          <div className="lg:col-span-4 space-y-6">
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#96281B] bg-[#96281B]/10 px-3 py-1 rounded">
                Direct Mill Partnership
              </span>
              <h2 className="font-serif italic font-bold text-3xl text-[#2C3E50]">
                Apply for Dealership
              </h2>
              <p className="text-sm text-[#5D6D7E] leading-relaxed">
                Please provide accurate contact and operational details. Applications are reviewed manually by SRS Global Enterprises executives to ensure authorized territorial compliance.
              </p>
            </div>

            {/* Direct Contact Cards */}
            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-xl bg-white border border-[#E8E4D5] flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#96281B]/10 text-[#96281B] flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#5D6D7E]">Wholesale Phone Desk</p>
                  <a href={`tel:${DISPLAY_PHONE}`} className="text-sm font-bold text-[#2C3E50] hover:text-[#96281B]">
                    {DISPLAY_PHONE}
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E8E4D5] flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#D35400]/10 text-[#D35400] flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#5D6D7E]">Official B2B Email</p>
                  <a href={`mailto:contact@spiceshahi.in?subject=SpiceShahi Distributor Wholesale Enquiry`} className="text-sm font-bold text-[#2C3E50] hover:text-[#D35400]">
                    contact@spiceshahi.in
                  </a>
                </div>
              </div>

              {ENABLE_WHATSAPP && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <WhatsAppIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-emerald-800">WhatsApp Wholesale Desk</p>
                      <p className="text-xs font-bold text-emerald-950">+{WHATSAPP_NUMBER}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleWhatsAppEnquiry}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                  >
                    Chat
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-[#FCFAF2] border border-[#E8E4D5] text-xs text-[#5D6D7E] space-y-1.5">
              <p className="font-semibold text-[#2C3E50] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#2D5A27]" />
                Confidential Trade Policy
              </p>
              <p className="text-[11px] leading-relaxed">
                Wholesale margins and trade slabs are confidential. They will be shared strictly after applicant verification by our Bahadurgarh headquarters.
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Form or Success State */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-10 border border-[#E8E4D5] shadow-xl">
              {submittedEnquiryId ? (
                /* Success View */
                <div className="text-center py-8 space-y-5 animate-in fade-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 rounded-full bg-[#2D5A27]/10 text-[#2D5A27] flex items-center justify-center mx-auto border border-[#2D5A27]/20 shadow-sm">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#2D5A27]">
                      Enquiry Successfully Received
                    </span>
                    <h3 className="font-serif italic font-bold text-2xl sm:text-3xl text-[#2C3E50]">
                      Thank You, {formData.name}!
                    </h3>
                    <p className="text-sm text-[#5D6D7E] max-w-lg mx-auto">
                      Your distributor application for <strong>{formData.businessName}</strong> has been assigned reference ID:
                    </p>
                    <div className="inline-block px-5 py-2 rounded-xl bg-[#FCFAF2] border border-[#E8E4D5] text-xl font-mono font-bold text-[#96281B] my-2">
                      {submittedEnquiryId}
                    </div>
                  </div>

                  <div className="bg-[#FAF8F2] p-5 rounded-2xl border border-[#E8E4D5] max-w-md mx-auto text-left text-xs space-y-2 text-[#5D6D7E]">
                    <p className="font-bold text-[#2C3E50]">What happens next?</p>
                    <p>• An acknowledgement email has been dispatched to <strong>{formData.email}</strong>.</p>
                    <p>• Our regional manager will call or WhatsApp you at <strong>{formData.mobile}</strong> within 24 to 48 business hours.</p>
                    <p>• Keep your GST/FSSAI details handy for distributor onboarding.</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                    <button
                      onClick={() => {
                        setSubmittedEnquiryId(null);
                        setFormData({
                          name: '',
                          businessName: '',
                          mobile: '',
                          email: '',
                          city: '',
                          state: 'Haryana',
                          pincode: '',
                          businessType: 'Distributor',
                          yearsInBusiness: '1 - 3 Years',
                          currentCategories: '',
                          monthlyRequirement: '100 - 250 kg',
                          preferredTerritory: '',
                          fmcgExperience: 'Yes',
                          message: '',
                        });
                      }}
                      className="px-6 py-2.5 rounded-xl border border-[#E8E4D5] text-xs font-semibold text-[#2C3E50] hover:bg-stone-50"
                    >
                      Submit Another Enquiry
                    </button>

                    <button
                      onClick={() => onNavigate('home')}
                      className="px-6 py-2.5 rounded-xl bg-[#96281B] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#7D2116]"
                    >
                      Return to Homepage
                    </button>
                  </div>
                </div>
              ) : (
                /* Form View */
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h3 className="font-serif italic font-bold text-2xl text-[#2C3E50]">
                      Distributor & Wholesale Application
                    </h3>
                    <p className="text-xs text-[#5D6D7E] mt-1">
                      Fields marked with * are required for territory evaluation.
                    </p>
                  </div>

                  {submitError && (
                    <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Section 1: Contact Details */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#96281B] border-b border-[#E8E4D5] pb-1">
                      1. Contact & Business Identity
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#2C3E50] mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Ramesh Kumar"
                          className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-[#FCFAF2] text-[#2C3E50] ${
                            formErrors.name ? 'border-red-500' : 'border-[#E8E4D5]'
                          }`}
                        />
                        {formErrors.name && (
                          <p className="text-[10px] text-red-600 mt-1">{formErrors.name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#2C3E50] mb-1">
                          Business / Firm Name *
                        </label>
                        <input
                          type="text"
                          value={formData.businessName}
                          onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                          placeholder="e.g. Kumar Trading Co."
                          className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-[#FCFAF2] text-[#2C3E50] ${
                            formErrors.businessName ? 'border-red-500' : 'border-[#E8E4D5]'
                          }`}
                        />
                        {formErrors.businessName && (
                          <p className="text-[10px] text-red-600 mt-1">{formErrors.businessName}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#2C3E50] mb-1">
                          Mobile Number * (10 Digits)
                        </label>
                        <input
                          type="tel"
                          maxLength={10}
                          value={formData.mobile}
                          onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                          placeholder="98XXXXXXXX"
                          className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-[#FCFAF2] text-[#2C3E50] ${
                            formErrors.mobile ? 'border-red-500' : 'border-[#E8E4D5]'
                          }`}
                        />
                        {formErrors.mobile && (
                          <p className="text-[10px] text-red-600 mt-1">{formErrors.mobile}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#2C3E50] mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="ramesh@kumartrading.com"
                          className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-[#FCFAF2] text-[#2C3E50] ${
                            formErrors.email ? 'border-red-500' : 'border-[#E8E4D5]'
                          }`}
                        />
                        {formErrors.email && (
                          <p className="text-[10px] text-red-600 mt-1">{formErrors.email}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Location & Territory */}
                  <div className="space-y-4 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#96281B] border-b border-[#E8E4D5] pb-1">
                      2. Territory & Location
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#2C3E50] mb-1">
                          City / District *
                        </label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="e.g. Rohtak / Gurugram"
                          className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-[#FCFAF2] text-[#2C3E50] ${
                            formErrors.city ? 'border-red-500' : 'border-[#E8E4D5]'
                          }`}
                        />
                        {formErrors.city && (
                          <p className="text-[10px] text-red-600 mt-1">{formErrors.city}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#2C3E50] mb-1">
                          State *
                        </label>
                        <select
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className="w-full px-3 py-2.5 text-xs rounded-xl border border-[#E8E4D5] bg-[#FCFAF2] text-[#2C3E50]"
                        >
                          {INDIAN_STATES.map((s) => (
                            <option key={s.name} value={s.name}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#2C3E50] mb-1">
                          PIN Code *
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={formData.pincode}
                          onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                          placeholder="124001"
                          className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-[#FCFAF2] text-[#2C3E50] ${
                            formErrors.pincode ? 'border-red-500' : 'border-[#E8E4D5]'
                          }`}
                        />
                        {formErrors.pincode && (
                          <p className="text-[10px] text-red-600 mt-1">{formErrors.pincode}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#2C3E50] mb-1">
                        Preferred Territory / Target Towns
                      </label>
                      <input
                        type="text"
                        value={formData.preferredTerritory}
                        onChange={(e) => setFormData({ ...formData, preferredTerritory: e.target.value })}
                        placeholder="e.g. Rohtak District & nearby tehsils"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#E8E4D5] bg-[#FCFAF2] text-[#2C3E50]"
                      />
                    </div>
                  </div>

                  {/* Section 3: Business Profile */}
                  <div className="space-y-4 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#96281B] border-b border-[#E8E4D5] pb-1">
                      3. Operational Experience & Capacity
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#2C3E50] mb-1">
                          Business Type *
                        </label>
                        <select
                          value={formData.businessType}
                          onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                          className="w-full px-3 py-2.5 text-xs rounded-xl border border-[#E8E4D5] bg-[#FCFAF2] text-[#2C3E50]"
                        >
                          {BUSINESS_TYPES.map((bt) => (
                            <option key={bt} value={bt}>
                              {bt}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#2C3E50] mb-1">
                          Years in Business
                        </label>
                        <select
                          value={formData.yearsInBusiness}
                          onChange={(e) => setFormData({ ...formData, yearsInBusiness: e.target.value })}
                          className="w-full px-3 py-2.5 text-xs rounded-xl border border-[#E8E4D5] bg-[#FCFAF2] text-[#2C3E50]"
                        >
                          {YEARS_IN_BUSINESS_OPTIONS.map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#2C3E50] mb-1">
                          Expected Monthly Requirement
                        </label>
                        <select
                          value={formData.monthlyRequirement}
                          onChange={(e) => setFormData({ ...formData, monthlyRequirement: e.target.value })}
                          className="w-full px-3 py-2.5 text-xs rounded-xl border border-[#E8E4D5] bg-[#FCFAF2] text-[#2C3E50]"
                        >
                          {MONTHLY_REQUIREMENT_OPTIONS.map((mr) => (
                            <option key={mr} value={mr}>
                              {mr}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#2C3E50] mb-1">
                          Do you currently distribute Food / FMCG?
                        </label>
                        <div className="flex items-center gap-6 pt-2">
                          <label className="flex items-center gap-2 text-xs font-medium text-[#2C3E50] cursor-pointer">
                            <input
                              type="radio"
                              name="fmcgExperience"
                              value="Yes"
                              checked={formData.fmcgExperience === 'Yes'}
                              onChange={() => setFormData({ ...formData, fmcgExperience: 'Yes' })}
                              className="text-[#96281B] focus:ring-[#96281B]"
                            />
                            <span>Yes, Active Distribution</span>
                          </label>
                          <label className="flex items-center gap-2 text-xs font-medium text-[#2C3E50] cursor-pointer">
                            <input
                              type="radio"
                              name="fmcgExperience"
                              value="No"
                              checked={formData.fmcgExperience === 'No'}
                              onChange={() => setFormData({ ...formData, fmcgExperience: 'No' })}
                              className="text-[#96281B] focus:ring-[#96281B]"
                            />
                            <span>No, Entering This Category</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#2C3E50] mb-1">
                        Current Product Categories Handled (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.currentCategories}
                        onChange={(e) => setFormData({ ...formData, currentCategories: e.target.value })}
                        placeholder="e.g. Edible Oils, Atta, Pulses, Tea, Confectionery"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#E8E4D5] bg-[#FCFAF2] text-[#2C3E50]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#2C3E50] mb-1">
                        Message / Additional Business Details
                      </label>
                      <textarea
                        rows={3}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us about your distribution network, retail counter reach, delivery fleet, or specific queries..."
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#E8E4D5] bg-[#FCFAF2] text-[#2C3E50]"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 border-t border-[#E8E4D5] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[11px] text-[#5D6D7E]">
                      Submission creates an enquiry for manual review by mill executives.
                    </p>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-8 py-3.5 bg-[#96281B] hover:bg-[#7D2116] disabled:bg-stone-400 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#96281B]/20 transition-all cursor-pointer"
                    >
                      {isSubmitting ? (
                        <span>Submitting Application...</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Distributor Enquiry</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
