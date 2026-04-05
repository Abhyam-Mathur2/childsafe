import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const LandingPage = () => {
  const { theme } = useTheme();

  return (
    <div className="relative min-h-screen text-white">
      <main className="container mx-auto px-6 pt-48 pb-20 relative z-10">
        <div className="max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-8"
          >
            <span className="text-4xl">{theme.greeting.flag}</span>
            <div className="h-px w-12 bg-[var(--color-primary)] opacity-50" />
            <span className="text-xs font-bold uppercase tracking-[0.4em] text-slate-400">
              {theme.greeting.text} from {theme.name}
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-bold tracking-tight leading-[0.9] mb-10"
          >
            Nurture Their World <br />
            <span className="opacity-40 font-light">With Intelligence.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl font-medium leading-relaxed mb-12"
          >
            An advanced environmental monitoring platform designed for the next generation of caregivers. Precise data, actionable insights, total peace of mind.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-6 items-center"
          >
            <Link 
              to="/signup" 
              className="px-10 py-4 bg-white text-black font-bold rounded-full hover:bg-[var(--color-primary)] hover:text-white transition-all flex items-center gap-2 group"
            >
              Get Started
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/login" 
              className="text-sm font-bold flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              Sign In to Dashboard
              <ChevronRight size={16} />
            </Link>
          </motion.div>
        </div>

        {/* Minimalist Feature List */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-white/5 pt-12"
        >
          {[
            { title: "Real-time Quality", desc: "Live tracking of air, water, and soil metrics." },
            { title: "Smart Resilience", desc: "Predictive analytics for localized health risks." },
            { title: "Clinical Reporting", desc: "Expert-validated environmental health summaries." }
          ].map((item, i) => (
            <div key={i} className="group">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-primary)] mb-3">{item.title}</h3>
              <p className="text-sm text-slate-500 group-hover:text-slate-300 transition-colors leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
};

export default LandingPage;
