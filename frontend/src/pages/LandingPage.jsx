import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, ShieldCheck, Activity, ArrowRight, Zap, Heart } from 'lucide-react';
import VideoBackground from '../components/ui/VideoBackground';

const LandingPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-200">
      <VideoBackground opacity={0.5} />
      
      <main className="container mx-auto px-6 pt-32 pb-20 relative z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center max-w-5xl mx-auto"
        >
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8 backdrop-blur-md"
          >
            <Zap size={16} />
            <span>The Future of Child Health Security</span>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-6xl md:text-8xl font-black tracking-tight mb-8 shimmer-text leading-tight"
          >
            Nurture Their World <br />With Intelligence
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto font-light leading-relaxed mb-12"
          >
            Experience ChildSafeEnviro—an advanced AI ecosystem dedicated to monitoring environmental health and securing a toxic-free future for our children.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-5 justify-center mb-24"
          >
            <Link 
              to="/signup" 
              className="btn-modern !w-auto !px-10 !py-5 flex items-center justify-center gap-3 text-lg group"
            >
              Sign Up
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/login" 
              className="px-10 py-5 bg-white/[0.03] hover:bg-white/[0.08] backdrop-blur-xl border border-white/10 text-white font-semibold rounded-2xl transition-all flex items-center justify-center gap-3 text-lg"
            >
              Sign In
            </Link>
          </motion.div>

          {/* Features Grid */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left mt-10"
          >
            {[
                { 
                  title: "Real-time Sentinels", 
                  desc: "Precision sensors tracking air, water, and soil quality across your environment.", 
                  icon: <Activity className="text-emerald-400" />,
                  color: "bg-emerald-500/10"
                },
                { 
                  title: "Predictive Analytics", 
                  desc: "Deep neural networks analyzing risk patterns before they become health issues.", 
                  icon: <ShieldCheck className="text-emerald-400" />,
                  color: "bg-blue-500/10"
                },
                { 
                  title: "Clinical Insights", 
                  desc: "Evidence-based health reports and actionable advice for parents and pediatricians.", 
                  icon: <Heart className="text-emerald-400" />,
                  color: "bg-rose-500/10"
                }
            ].map((feature, idx) => (
                <div 
                    key={idx}
                    className="glass-card p-8 group hover:glass-card-hover"
                >
                    <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                        {feature.icon}
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                    <p className="text-slate-400 leading-relaxed font-light">{feature.desc}</p>
                </div>
            ))}
          </motion.div>
        </motion.div>
      </main>

      {/* Decorative Blur Blobs */}
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none animate-aurora"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none animate-aurora" style={{ animationDelay: '-10s' }}></div>
    </div>
  );
};

export default LandingPage;
