import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const GamifiedDashboardHeader = ({ safetyScore = 85 }) => {
    const { xp, level } = useAuth();
    const nextLevelThreshold = level * 1000;
    const progress = (xp / nextLevelThreshold) * 100;

    return (
        <div className="glass-panel !p-12 flex flex-col md:flex-row items-center gap-16 border-white/5">
            <div className="relative shrink-0">
                <div className="w-48 h-48 md:w-56 md:h-56 rounded-full border border-white/10 flex items-center justify-center bg-white/5 relative">
                    <Shield className="w-24 h-24 text-[var(--color-primary)] opacity-40" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center mt-2">
                        <span className="text-6xl font-black text-white tracking-tighter">{safetyScore}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Resilience</span>
                    </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-14 h-14 rounded-xl bg-white text-black flex flex-col items-center justify-center shadow-2xl">
                    <span className="text-[8px] font-bold uppercase tracking-tighter opacity-50">Lvl</span>
                    <span className="text-xl font-black leading-none">{level}</span>
                </div>
            </div>

            <div className="flex-1 space-y-8">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-3">Environmental Intelligence Node</h2>
                    <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-2xl">
                        System status is currently <span className="text-white">optimal</span>. Your localized safety index is calculated based on synchronized orbital and ground-level telemetry.
                    </p>
                </div>

                <div className="space-y-4 max-w-md">
                    <div className="flex justify-between items-end">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                            <Zap size={12} className="text-[var(--color-primary)] fill-current" />
                            XP Sequence Progress
                        </div>
                        <span className="text-[10px] font-black text-white">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-white"
                            transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GamifiedDashboardHeader;
