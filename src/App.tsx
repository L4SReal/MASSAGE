/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'motion/react';
import { Menu, Search, ShoppingCart, Clock, Phone, MapPin, ArrowUp, ArrowRight, X, Facebook, Instagram, Linkedin, Twitter, Sparkles, Users, Award, Heart } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const Counter = ({ value, suffix = "", duration = 2 }: { value: number, suffix?: string, duration?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    let start = 0;
    const end = value;
    const totalMiliseconds = duration * 1000;
    const incrementTime = totalMiliseconds / end;

    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return (
    <span ref={ref}>
      {count}{suffix}
    </span>
  );
};

const BeforeAfterSlider = () => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const relativeX = x - rect.left;
    const percentage = Math.max(0, Math.min(100, (relativeX / rect.width) * 100));
    setSliderPos(percentage);
  };

  return (
    <div 
      ref={containerRef}
      className="comparison-slider cursor-ew-resize"
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
      <img 
        src="https://picsum.photos/seed/skin-after/800/1000" 
        alt="After" 
        className="comparison-image"
        referrerPolicy="no-referrer"
      />
      <div 
        className="comparison-image overflow-hidden"
        style={{ width: `${sliderPos}%` }}
      >
        <img 
          src="https://picsum.photos/seed/skin-before/800/1000" 
          alt="Before" 
          className="w-[100vw] max-w-none h-full object-cover"
          style={{ width: containerRef.current?.offsetWidth }}
          referrerPolicy="no-referrer"
        />
      </div>
      <div 
        className="comparison-handle"
        style={{ left: `${sliderPos}%` }}
      />
    </div>
  );
};

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-bg selection:bg-primary/20 selection:text-primary overflow-x-hidden">
      {/* Progress Bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-accent z-[100] origin-left" style={{ scaleX }} />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-line px-6 py-4 flex justify-between items-center transition-all duration-300">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-serif tracking-widest text-primary uppercase">Serava</h1>
        </div>
        <div className="flex items-center gap-6">
          <button className="text-primary hover:text-accent transition-colors">
            <Search size={22} strokeWidth={1.5} />
          </button>
          <button className="text-primary hover:text-accent transition-colors relative">
            <ShoppingCart size={22} strokeWidth={1.5} />
            <span className="absolute -top-1 -right-1 bg-accent text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">0</span>
          </button>
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="text-primary hover:text-accent transition-colors"
          >
            <Menu size={26} strokeWidth={1.5} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-white p-8 flex flex-col"
          >
            <div className="flex justify-between items-center mb-12">
              <h1 className="text-2xl font-serif tracking-widest text-primary uppercase">Serava</h1>
              <button onClick={() => setIsMenuOpen(false)} className="text-primary">
                <X size={32} strokeWidth={1.5} />
              </button>
            </div>
            <ul className="space-y-6 text-3xl font-serif text-primary">
              {['Home', 'About', 'Services', 'Pricing', 'Blog', 'Contact'].map((item) => (
                <li key={item}>
                  <a href={`#${item.toLowerCase()}`} onClick={() => setIsMenuOpen(false)} className="hover:text-accent transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-12 border-t border-line">
              <p className="text-xs uppercase tracking-[0.3em] font-bold mb-6 text-primary/40">Follow Us</p>
              <div className="flex gap-8 text-primary">
                <Facebook size={20} className="hover:text-accent cursor-pointer transition-colors" />
                <Instagram size={20} className="hover:text-accent cursor-pointer transition-colors" />
                <Twitter size={20} className="hover:text-accent cursor-pointer transition-colors" />
                <Linkedin size={20} className="hover:text-accent cursor-pointer transition-colors" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative h-[100vh] flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://picsum.photos/seed/spa-hero/1080/1920?blur=2" 
            alt="Spa Interior" 
            className="w-full h-full object-cover brightness-50 scale-110"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <h2 className="text-[14vw] leading-[1] font-serif text-white uppercase tracking-tight mb-4">
              Luxury Spa &<br />
              Wellness<br />
              Retreat
            </h2>
          </motion.div>
        </div>

        {/* Glass Overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <div className="glass mx-6 mb-12 p-8 rounded-2xl text-white">
            <div className="space-y-10">
              {[
                { title: 'RELAX RELAX RELAX RELAX', desc: 'Allow Your Body And Mind To Fully Release Tension' },
                { title: 'REFRESH', desc: 'Revive Your Senses With Soothing Rituals For Balance.' },
                { title: 'RENEW', desc: 'Restore Balance And Reveal Your Natural Radiance.' }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2, duration: 0.8 }}
                  className={cn(i !== 0 && "pt-10 border-t border-white/10")}
                >
                  <h4 className="text-[10px] font-sans font-bold tracking-[0.3em] uppercase mb-3 text-white/60">{item.title}</h4>
                  <p className="text-xl font-serif italic leading-snug">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-32 px-6 bg-bg">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="max-w-xl mx-auto text-center"
        >
          <h3 className="text-6xl font-serif text-black mb-10 leading-[1.1]">
            Where Peace<br />Begins Within
          </h3>
          <p className="text-xl leading-relaxed mb-14 text-primary/80">
            Every detail at Serava Spa gently invites you to slow down, unwind.
          </p>
          <button className="group relative flex items-center gap-6 mx-auto border border-primary px-10 py-5 rounded-full text-primary overflow-hidden transition-all duration-500">
            <span className="relative z-10 uppercase tracking-[0.2em] text-xs font-bold group-hover:text-white transition-colors duration-500">View All Services</span>
            <ArrowRight size={18} className="relative z-10 group-hover:translate-x-2 group-hover:text-white transition-all duration-500" />
            <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
          </button>
        </motion.div>
      </section>

      {/* Contact Info Section */}
      <section className="pb-32 px-6 bg-bg">
        <div className="max-w-xl mx-auto space-y-12">
          {[
            { icon: Clock, label: 'Practice Hours:', value: 'Monday – Saturday: 9:00 AM – 8:30 PM' },
            { icon: MapPin, label: 'Location:', value: 'Conveniently located near Bushey & Stanmore' }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className="flex items-start gap-8"
            >
              <div className="w-14 h-14 rounded-full border border-line flex items-center justify-center text-primary shrink-0 transition-transform hover:scale-110 duration-300">
                <item.icon size={22} strokeWidth={1.2} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-primary/40 uppercase tracking-[0.3em] mb-2">{item.label}</p>
                <p className="text-2xl font-serif text-black">{item.value}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="relative bg-primary py-40 px-6 overflow-hidden">
        {/* Decorative Motif */}
        <div className="absolute top-10 right-[-50px] opacity-20 pointer-events-none scale-150">
          <svg width="400" height="400" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 10C60 30 90 30 90 50C90 70 60 70 50 90C40 70 10 70 10 50C10 30 40 30 50 10Z" stroke="white" strokeWidth="0.2" />
            <path d="M50 20C55 35 75 35 75 50C75 65 55 65 50 80C45 65 25 65 25 50C25 35 45 35 50 20Z" stroke="white" strokeWidth="0.2" />
          </svg>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative z-10 max-w-xl mx-auto"
        >
          <h3 className="text-5xl font-serif text-white mb-12 leading-[1.1] uppercase tracking-tight">
            Professional<br />Therapy Tailored<br />To Your<br />Body
          </h3>
          <p className="text-white/70 text-xl leading-relaxed mb-16 font-light">
            With 10 years of clinical practice and Level 3 VTCT certification, we provide tailored Swedish, Deep Tissue, Hot Stone and Relaxation Massage. Located in Bushey, conveniently near Stanmore, with unhurried care and dedicated client parking.
          </p>
          <a href="/contact.html#book" className="group relative inline-flex items-center gap-6 border border-white/20 px-10 py-5 rounded-full text-white overflow-hidden transition-all duration-500">
            <span className="relative z-10 uppercase tracking-[0.2em] text-xs font-bold group-hover:text-primary transition-colors duration-500">Book an Appointment</span>
            <ArrowRight size={18} className="relative z-10 group-hover:translate-x-2 group-hover:text-primary transition-all duration-500" />
            <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
          </a>
        </motion.div>
      </section>

      {/* Wellness Expertise Section */}
      <section className="py-32 px-6 bg-bg">
        <div className="max-w-xl mx-auto">
          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl font-serif text-black mb-16"
          >
            Our Wellness Expertise
          </motion.h3>
          <div className="space-y-0">
            {[
              'Holistic Skincare Treatments',
              'Aromatherapy & Essential Oils',
              'Wellness Rituals for Mind & Body'
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="py-10 border-t border-line last:border-b group cursor-pointer flex justify-between items-center"
              >
                <span className="text-2xl font-serif text-black group-hover:text-primary transition-colors duration-300">{item}</span>
                <ArrowRight size={24} className="text-primary/20 group-hover:text-primary group-hover:translate-x-2 transition-all duration-300" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Before/After Section */}
      <section className="pb-32 px-6 bg-bg">
        <div className="max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <BeforeAfterSlider />
            <div className="mt-8 flex justify-between text-[10px] font-bold uppercase tracking-[0.3em] text-primary/40">
              <span>Before Treatment</span>
              <span>After Treatment</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-32 px-6 bg-primary overflow-hidden relative">
        <div className="container mx-auto">
          <div className="flex items-center gap-4 mb-20">
            <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4 text-[#c5a059]" />
            </div>
            <h4 className="text-sm font-bold uppercase tracking-[0.3em] text-white/60">Our achievements</h4>
          </div>

          <div className="grid grid-cols-1 gap-24 max-w-xl mx-auto">
            {[
              { label: 'visitors', value: 15, suffix: 'k' },
              { label: 'years of experience', value: 10, suffix: '+' },
              { label: 'positive feedback', value: 98, suffix: '%' }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative group"
              >
                {/* Line Art Background Placeholder */}
                <div className="absolute inset-0 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity duration-700">
                   <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 50 Q 25 10 50 50 T 90 50" stroke="white" strokeWidth="0.5" />
                    <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="0.2" />
                  </svg>
                </div>

                <div className="relative z-10">
                  <p className="text-xs font-bold text-white/40 uppercase tracking-[0.4em] mb-6">{stat.label}</p>
                  <div className="flex items-baseline">
                    <span className="text-8xl font-serif text-white tracking-tighter">
                      <Counter value={stat.value} suffix={stat.suffix} />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-32 px-6 bg-bg overflow-hidden">
        <div className="container mx-auto">
          <div className="mb-20">
            <motion.h3 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-6xl font-serif text-black mb-12 uppercase tracking-tight"
            >
              Spa Services
            </motion.h3>
            <div className="flex flex-wrap gap-x-10 gap-y-6">
              {['Aromatherapy', 'Massage', 'Skincare', 'Wellness Care'].map((cat, i) => (
                <button key={cat} className={cn("text-[10px] font-bold uppercase tracking-[0.3em] pb-2 border-b-2 transition-all duration-300", i === 0 ? "border-primary text-primary" : "border-transparent text-primary/30 hover:text-primary")}>
                  <span className="text-[8px] mr-2 opacity-50">0{i+1}/</span>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-20">
            {[
              { 
                title: 'Bespoke Facial for Sensitive Skin', 
                img: 'https://picsum.photos/seed/facial-spa/1000/800',
                desc: "Experience customized care in its purest form. This gentle, consultative treatment is personally tailored to your skin's unique needs, using only the mildest, most effective ingredients.",
                features: ['1-on-1 Sensitivity Facial', 'Hypoallergenic Calming Blend', 'Barrier-Support Redness Relief', 'Cool Wave Soothing & Repair Mask']
              }
            ].map((service, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-3xl mb-12 shadow-2xl shadow-primary/10">
                  <img 
                    src={service.img} 
                    alt={service.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s] ease-out"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h4 className="text-4xl font-serif text-black mb-8 leading-tight group-hover:text-primary transition-colors duration-500">{service.title}</h4>
                <p className="text-lg text-primary/70 mb-10 leading-relaxed font-light">{service.desc}</p>
                <ul className="space-y-4 mb-12">
                  {service.features.map(f => (
                    <li key={f} className="flex items-center gap-4 text-xs text-primary font-bold uppercase tracking-[0.15em]">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(86,196,119,0.6)]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button className="group/btn relative inline-flex items-center gap-6 border border-primary px-10 py-5 rounded-full text-primary overflow-hidden transition-all duration-500">
                  <span className="relative z-10 uppercase tracking-[0.2em] text-xs font-bold group-hover/btn:text-white transition-colors duration-500">Read More</span>
                  <div className="absolute inset-0 bg-primary translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 ease-out" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Special Offers Section */}
      <section className="py-32 px-6 bg-[#f5f5ed]">
        <div className="container mx-auto">
          <h3 className="text-5xl font-serif text-black mb-20 text-center uppercase tracking-tight">Special Offers Now</h3>
          <div className="grid grid-cols-1 gap-10 max-w-xl mx-auto">
            {[
              { 
                price: '–20%', 
                title: 'Relaxation Combo', 
                desc: 'Perfect for relieving stress, easing tension, and fully restoring your energy.',
                list: ['Body massage + Aroma therapy', '90 minutes'],
                style: 'bg-white'
              },
              { 
                price: '–15%', 
                title: 'Facial Glow Package', 
                desc: 'Helps your skin look instantly brighter, smoother, and naturally healthier.',
                list: ['Detox facial + Hydrating mask', '60 minutes'],
                style: 'bg-primary text-white'
              },
              { 
                price: '–10%', 
                title: 'Wellness Weekday Deal', 
                desc: 'Helps your skin look instantly brighter, smoother, and naturally healthier.',
                list: ['All basic care services', 'Monday – Thursday'],
                style: 'bg-white'
              }
            ].map((offer, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={cn("p-12 rounded-[2.5rem] flex flex-col items-center text-center shadow-xl shadow-primary/5 transition-transform hover:scale-[1.02] duration-500", offer.style)}
              >
                <span className={cn("text-5xl font-serif mb-8", offer.style.includes('primary') ? "text-accent" : "text-primary")}>{offer.price}</span>
                <h4 className={cn("text-3xl font-serif mb-6", offer.style.includes('primary') ? "text-white" : "text-black")}>{offer.title}</h4>
                <p className={cn("text-lg mb-10 leading-relaxed opacity-80", offer.style.includes('primary') ? "text-white/70" : "text-primary/70")}>{offer.desc}</p>
                <ul className="space-y-3 mb-12 w-full">
                  {offer.list.map(item => (
                    <li key={item} className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-50">{item}</li>
                  ))}
                </ul>
                <button className={cn("mt-auto w-full py-5 rounded-full border uppercase tracking-[0.2em] text-[10px] font-bold transition-all duration-500", 
                  offer.style.includes('primary') ? "border-white/20 text-white hover:bg-white hover:text-primary" : "border-primary/20 text-primary hover:bg-primary hover:text-white")}>
                  Book Now
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white pt-40 pb-16 px-6 border-t border-line relative overflow-hidden">
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-32">
            <motion.h2 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[22vw] font-serif uppercase tracking-tighter title-stroke select-none mb-[-4vw]"
            >
              SeravaSpa
            </motion.h2>
            <motion.h3 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="text-5xl font-serif text-black max-w-2xl mx-auto leading-[1.1] relative z-20"
            >
              Begin Your Journey to Radiant Wellness Today
            </motion.h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 mb-32">
            <div className="space-y-8">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40">Appointments:</h4>
              <p className="text-xl font-serif text-primary">
                Online Booking Only
              </p>
              <div className="pt-2">
                <a href="/contact.html#book" className="inline-block px-6 py-3 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-accent transition-colors">
                  Book Online
                </a>
              </div>
            </div>

            <div className="space-y-8">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40">Location:</h4>
              <p className="text-xl leading-relaxed font-serif text-black">
                Private Studio, Bushey<br />Near Stanmore & Watford
              </p>
              <p className="text-xs font-bold text-primary/60 uppercase tracking-[0.2em]">
                Mon – Sat: 9:00 AM – 8:30 PM
              </p>
            </div>

            <div className="lg:col-span-2 space-y-10">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40">Join Our Newsletter</h4>
              <p className="text-xl text-primary/70 font-light leading-relaxed">
                Sign up to stay updated with the latest spa treatments, wellness tips, and exclusive offers.
              </p>
              <form className="flex gap-6 border-b border-line pb-6 group">
                <input 
                  type="email" 
                  placeholder="Your email*" 
                  className="bg-transparent border-none outline-none flex-grow text-2xl italic font-serif placeholder:text-primary/20"
                />
                <button type="submit" className="text-primary hover:text-accent transition-all duration-300 group-hover:translate-x-2">
                  <ArrowRight size={32} strokeWidth={1} />
                </button>
              </form>
            </div>
          </div>

          <div className="pt-16 border-t border-line flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] uppercase tracking-[0.3em] text-primary/30 font-bold">
            <p>© 2026 Case Themes. All rights reserved.</p>
            <div className="flex gap-12">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-10 right-10 z-40 w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-accent transition-all duration-500 group"
          >
            <ArrowUp size={28} className="group-hover:-translate-y-1 transition-transform duration-300" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
