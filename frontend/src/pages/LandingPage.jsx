import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Zap, Globe, HeartPulse } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const LandingPage = () => {
  const { theme } = useTheme();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }
    }
  };

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden">
      <main className="container mx-auto px-6 pt-32 pb-20 relative z-10">
        
        {/* Hero Section */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl"
        >
          <motion.div variants={itemVariants} className="flex items-center gap-4 mb-10">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-primary)]">
              Intelligence for Wellbeing
            </span>
            <div className="h-px w-8 bg-white/20" />
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
              {theme.name} Edition
            </span>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-7xl md:text-9xl font-bold tracking-tight leading-[0.85] mb-12"
          >
            Turning Signals <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/40 to-white/10">
              Into Safety.
            </span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-xl md:text-2xl text-slate-400 max-w-2xl font-light leading-relaxed mb-16"
          >
            The environment speaks. We translate. ChildSafe Sync analyzes local environmental risks to help you create a healthier future for those who matter most.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-8 items-center"
          >
            <Link 
              to="/signup" 
              className="relative overflow-hidden px-12 py-5 bg-white text-black font-bold rounded-full transition-all flex items-center gap-3 group"
            >
              <span className="relative z-10">Protect Your Family</span>
              <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
              <motion.div 
                className="absolute inset-0 bg-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </Link>
            <Link 
              to="/login" 
              className="text-sm font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors flex items-center gap-2"
            >
              Access Dashboard
            </Link>
          </motion.div>
        </motion.div>

        {/* Narrative Section: The Problem & Solution */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
          className="mt-64 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center"
        >
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
              From Invisible Risks <br />
              <span className="opacity-30">To Actionable Clarity.</span>
            </h2>
            <div className="space-y-12 mt-16">
              {[
                { 
                  icon: <Globe className="text-red-500" />, 
                  title: "The Reality", 
                  desc: "Pollution, allergens, and toxic soil often go unnoticed until health issues arise. Awareness is the first step to prevention." 
                },
                { 
                  icon: <HeartPulse className="text-emerald-500" />, 
                  title: "The Vision", 
                  desc: "By monitoring air quality, water safety, and soil health, we empower you to make lifestyle changes that lead to vibrant longevity." 
                }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 group">
                  <div className="mt-1 p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:border-white/20 transition-colors">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2 uppercase tracking-wider">{item.title}</h3>
                    <p className="text-slate-400 leading-relaxed font-light">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-tr from-[var(--color-primary)] to-transparent opacity-10 blur-3xl rounded-full" />
            <div className="relative glass-panel p-12 aspect-square flex flex-col justify-center border-white/5 bg-white/[0.02] backdrop-blur-2xl">
               <div className="space-y-8">
                  <div className="h-1 w-24 bg-[var(--color-primary)] rounded-full" />
                  <blockquote className="text-3xl font-light italic text-slate-200 leading-snug">
                    "Data alone is noise. Context is what protects. We provide the context that saves lives."
                  </blockquote>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-white/10 border border-white/20" />
                    <div>
                      <p className="text-sm font-bold uppercase tracking-widest">ChildSafe Mission</p>
                      <p className="text-xs text-slate-500 uppercase tracking-widest">Est. 2026</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </motion.section>

        {/* Features Grid */}
        <motion.section 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-64"
        >
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter">
              Engineered for <br />
              <span className="opacity-20 font-light italic">total resilience.</span>
            </h2>
            <p className="text-slate-500 max-w-xs text-sm uppercase tracking-widest leading-loose">
              A comprehensive toolset designed for the modern caregiver.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-1px bg-white/5 border border-white/5 rounded-3xl overflow-hidden">
            {[
              { 
                icon: <ShieldCheck />, 
                title: "Safety Analysis", 
                desc: "Real-time auditing of surrounding environmental factors with clinical precision." 
              },
              { 
                icon: <Zap />, 
                title: "Instant Alerts", 
                desc: "Critical notifications when environmental metrics exceed safe thresholds for children." 
              },
              { 
                icon: <HeartPulse />, 
                title: "Health Reports", 
                desc: "AI-driven correlations between your environment and personal health markers." 
              }
            ].map((feature, i) => (
              <div key={i} className="bg-black/40 p-12 hover:bg-white/[0.02] transition-colors group">
                <div className="mb-8 text-slate-400 group-hover:text-[var(--color-primary)] transition-colors">
                  {React.cloneElement(feature.icon, { size: 32, strokeWidth: 1.5 })}
                </div>
                <h3 className="text-xl font-bold mb-4 uppercase tracking-wider">{feature.title}</h3>
                <p className="text-slate-500 font-light leading-relaxed group-hover:text-slate-300 transition-colors">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Final CTA */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-64 mb-32 text-center"
        >
          <div className="inline-block mb-12 h-px w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <h2 className="text-6xl md:text-8xl font-bold tracking-tighter mb-16">
            The change starts <br />
            <span className="opacity-40 italic font-light">with a single report.</span>
          </h2>
          <Link 
            to="/signup" 
            className="inline-flex px-16 py-6 border border-white/20 rounded-full text-lg font-bold uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all"
          >
            Create Your Report
          </Link>
        </motion.section>

      </main>

      {/* Footer Decoration */}
      <div className="fixed bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent pointer-events-none z-20" />
    </div>
  );
};

export default LandingPage;
