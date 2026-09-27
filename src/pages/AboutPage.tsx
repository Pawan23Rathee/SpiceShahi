import React from 'react';
import { Page } from '../types';
import {
  ShieldCheck,
  Leaf,
  Sun,
  Award,
  HeartHandshake,
  CheckCircle,
  ArrowRight,
  Sparkles,
  PhoneCall,
} from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: Page) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const steps = [
    {
      step: '01',
      title: 'Direct Farmer Partnerships',
      subtitle: 'Single-Origin Heritage Crops',
      desc: 'We skip the layers of middlemen and brokers. Our Lakadong turmeric comes straight from indigenous tribal women cooperatives in Meghalaya, while our cumin and coriander are harvested in Rajasthan and Gujarat.',
      image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=800&auto=format&fit=crop',
    },
    {
      step: '02',
      title: 'Hygienic Sun-Drying',
      subtitle: 'Clean Air & Natural Sunlight',
      desc: 'Instead of dirty road-side drying, our partner farmers dry whole roots, seeds, and pods on elevated food-grade cotton drying sheets under clean sunshine until optimal moisture levels (<10%) are achieved.',
      image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=800&auto=format&fit=crop',
    },
    {
      step: '03',
      title: 'Carefully Sourced & Traditional Slow Grinding',
      subtitle: 'Gentle Milling Without Heat',
      desc: 'High-speed industrial pin mills overheat spices up to 95°C, vaporizing the delicate essential oils that give spices their healing power and soul. SpiceShahi follows the time-honored tradition of gentle cold milling without machine heat so volatile aroma remains 100% intact.',
      image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?q=80&w=800&auto=format&fit=crop',
    },
    {
      step: '04',
      title: 'Aroma-Lock Resealable Pouching',
      subtitle: 'Packed with Zipper Freshness',
      desc: 'Every batch is sealed in multi-layer airtight pouches with resealable zippers. When you open a pack in your home, the khushboo is as fresh and intense as the day it was prepared.',
      image: '/images/spiceshahi-hero.jpg',
    },
  ];

  const values = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#96281B]" />,
      title: 'Uncompromised Purity',
      desc: 'We guarantee zero synthetic food dyes, Sudan red, metanil yellow, chalk, or starch. What you see is 100% pure spice.',
    },
    {
      icon: <Leaf className="w-6 h-6 text-[#2D5A27]" />,
      title: 'Farmer Prosperity',
      desc: 'We pay above-market fair-trade rates directly to smallholder farmers to encourage sustainable, clean cultivation.',
    },
    {
      icon: <Sun className="w-6 h-6 text-[#D35400]" />,
      title: 'Time-Honored Craft',
      desc: 'Patience over shortcuts. Sun-dried, unbleached, and stone-ground inspired techniques that honor our grandmothers’ kitchens.',
    },
    {
      icon: <Award className="w-6 h-6 text-[#F39C12]" />,
      title: 'FSSAI Certified Standards',
      desc: 'Every single batch undergoes stringent food safety and moisture testing at our Bahadurgarh processing facility.',
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Banner - Artistic Flair */}
      <section className="bg-[#FCFAF2] border-b border-[#E8E4D5] py-16">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-4">
          <span className="inline-block px-3 py-1 bg-[#F39C12]/20 text-[#D35400] text-[10px] font-bold uppercase tracking-[0.2em] rounded">
            Our Heritage & Philosophy
          </span>
          <h1 className="font-serif italic font-bold text-4xl sm:text-5xl text-[#2C3E50] tracking-tight leading-tight">
            We Treat Spices as <span className="text-[#96281B]">Sacred Medicine</span>, Not Just Powder
          </h1>
          <p className="text-base sm:text-lg text-[#5D6D7E] max-w-2xl mx-auto leading-relaxed">
            In an era of mass commercialization and chemical dyes, SpiceShahi preserves India’s heirloom spice varieties and traditional cold-grinding methods.
          </p>
        </div>
      </section>

      {/* Origin Story Section */}
      <section className="max-w-7xl mx-auto px-6 sm:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-5">
            <span className="inline-block px-3 py-1 bg-[#F39C12]/20 text-[#D35400] text-[10px] font-bold uppercase tracking-[0.2em] rounded">
              Why We Started
            </span>
            <h2 className="font-serif italic font-bold text-3xl sm:text-4xl text-[#2C3E50] leading-tight">
              A Quest to Reclaim India’s Sacred Kitchen Heritage
            </h2>
            <p className="text-[#5D6D7E] leading-relaxed text-sm sm:text-base">
              Growing up, our grandmothers would purchase whole sun-dried chilies, unpolished turmeric roots, and green coriander seeds, having them slow-ground and stone-milled at home. The aroma would fill the entire lane, making mouths water before dinner was even cooked.
            </p>
            <p className="text-[#5D6D7E] leading-relaxed text-sm sm:text-base">
              Over the last two decades, commercial food manufacturing replaced quality with cost cutting: bleaching spices, extracting precious essential oils to sell separately, and using synthetic red and yellow powders.
            </p>
            <p className="text-[#5D6D7E] leading-relaxed text-sm sm:text-base">
              <strong className="text-[#2C3E50]">SpiceShahi</strong> (SRS Global Enterprises) was established in Bahadurgarh, Haryana to change that forever. We forge direct ties with farmers who still cultivate native heirloom seeds with love and pride, delivering authentic, traditionally crafted masalas to modern homes.
            </p>

            <div className="p-4 rounded-xl bg-white border border-[#E8E4D5] text-[#2C3E50] text-sm font-medium flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-[#2D5A27] shrink-0"></span>
              <span className="italic">Our motto: If it doesn’t release mouthwatering desi khushboo in warm ghee, it doesn’t deserve the SpiceShahi seal.</span>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-[#E8E4D5]">
              <img
                src="/images/spiceshahi-hero.jpg"
                alt="SpiceShahi Handcrafted Spices"
                className="w-full h-[440px] object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent flex items-end p-8 text-white">
                <div>
                  <p className="font-serif italic font-bold text-xl">Pure Desi Khushboo</p>
                  <p className="text-xs text-[#FCFAF2]/80">Nothing added. Nothing taken away.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sourcing & Milling Process */}
      <section className="bg-white py-16 border-y border-[#E8E4D5]">
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-block px-3 py-1 bg-[#F39C12]/20 text-[#D35400] text-[10px] font-bold uppercase tracking-[0.2em] rounded">
              The Journey
            </span>
            <h2 className="font-serif italic font-bold text-3xl sm:text-4xl text-[#2C3E50] mt-2">
              From Sacred Soil to Resealable Freshness
            </h2>
            <p className="text-sm text-[#5D6D7E] mt-3">
              Every step is designed to protect raw essential oils and natural botanical colors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, idx) => (
              <div
                key={idx}
                className="bg-[#FCFAF2] rounded-xl border border-[#E8E4D5] overflow-hidden group hover:shadow-lg transition-all"
              >
                <div className="h-44 overflow-hidden relative">
                  <img
                    src={s.image}
                    alt={s.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 bg-[#96281B] text-white text-xs font-bold px-2.5 py-1 rounded">
                    {s.step}
                  </span>
                </div>
                <div className="p-5 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#D35400]">
                    {s.subtitle}
                  </p>
                  <h3 className="font-serif italic font-bold text-lg text-[#2C3E50]">
                    {s.title}
                  </h3>
                  <p className="text-xs text-[#5D6D7E] leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="max-w-7xl mx-auto px-6 sm:px-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block px-3 py-1 bg-[#F39C12]/20 text-[#D35400] text-[10px] font-bold uppercase tracking-[0.2em] rounded">
            Our Pillars
          </span>
          <h2 className="font-serif italic font-bold text-3xl sm:text-4xl text-[#2C3E50] mt-2">
            The SpiceShahi Standards
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-xl border border-[#E8E4D5] space-y-3 hover:border-[#96281B] transition-colors"
            >
              <div className="p-3 rounded-lg bg-[#FCFAF2] inline-block border border-[#E8E4D5]">
                {v.icon}
              </div>
              <h3 className="font-serif italic font-bold text-base text-[#2C3E50]">{v.title}</h3>
              <p className="text-xs text-[#5D6D7E] leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Call to Action - Artistic Flair */}
      <section className="max-w-7xl mx-auto px-6 sm:px-12">
        <div className="bg-[#2C3E50] rounded-2xl p-8 sm:p-12 text-[#FCFAF2] text-center max-w-4xl mx-auto space-y-6 border border-[#E8E4D5]/20">
          <h3 className="font-serif italic font-bold text-3xl sm:text-4xl text-[#FCFAF2]">
            Taste the Difference in Your Very Next Meal
          </h3>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Order your fresh spice pouch today and experience true aroma delivered directly to your doorstep.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('products')}
              className="px-8 py-3.5 rounded-lg bg-[#96281B] hover:bg-[#7D2116] text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-[#96281B]/20"
            >
              <span>Explore All Spices</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('contact')}
              className="px-8 py-3.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-md cursor-pointer border border-white/20"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Contact Us</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
