import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, ShieldCheck, Activity } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 animate-gradient text-white">
      {/* Decorative Orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-20 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="container mx-auto px-6 py-20 relative z-10 flex flex-col items-center justify-center min-h-screen text-center">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-4 inline-block mb-6 shadow-glow">
            <Leaf size={48} className="text-green-300" />
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 drop-shadow-lg">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-300 via-emerald-200 to-teal-300">
              Childsafeenvirons
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-emerald-100 max-w-2xl mx-auto font-light leading-relaxed">
            AI-Powered Environmental Health Monitoring Platform ensuring a safer future for the next generation.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-6 mt-8"
        >
          <Link 
            to="/login" 
            className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-emerald-500/50 transform hover:-translate-y-1 flex items-center gap-2"
          >
            <ShieldCheck size={20} />
            Login
          </Link>
          <Link 
            to="/signup" 
            className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold rounded-xl transition-all shadow-lg transform hover:-translate-y-1 flex items-center gap-2"
          >
            <Activity size={20} />
            Create Account
          </Link>
        </motion.div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl text-left">
            {[
                { title: "Real-time Monitoring", desc: "Track air, water, and soil quality instantly.", icon: <Activity className="text-green-400" /> },
                { title: "AI Risk Analysis", desc: "Predict health risks based on environmental data.", icon: <ShieldCheck className="text-teal-400" /> },
                { title: "Personalized Reports", desc: "Get tailored advice for your family's safety.", icon: <Leaf className="text-emerald-400" /> }
            ].map((feature, idx) => (
                <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + (idx * 0.2) }}
                    className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-colors"
                >
                    <div className="mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
                    <p className="text-emerald-100/70">{feature.desc}</p>
                </motion.div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
