import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Trophy, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const GamifiedDashboardHeader = ({ safetyScore = 85 }) => {
    const { user, xp, level } = useAuth();
    const nextLevelThreshold = level * 1000;
    const progress = (xp / nextLevelThreshold) * 100;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Safety Shield Card */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="lg:col-span-2 bg-gradient-to-br from-indigo-900 via-blue-900 to-emerald-900 rounded-3xl p-8 relative overflow-hidden shadow-2xl text-white"
            >
                {/* Background Patterns */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-500/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    {/* The Shield Visual */}
                    <div className="relative group">
                        <motion.div 
                            animate={{ 
                                scale: [1, 1.05, 1],
                                rotate: [0, 2, -2, 0]
                            }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="w-40 h-40 md:w-48 md:h-48 rounded-full border-4 border-emerald-400/30 flex items-center justify-center bg-white/5 backdrop-blur-xl shadow-[0_0_50px_rgba(52,211,153,0.2)]"
                        >
                            <Shield className="text-emerald-400 w-24 h-24 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-4xl font-black mt-2 tracking-tighter">{safetyScore}</span>
                            </div>
                        </motion.div>
                        
                        {/* Level Badge */}
                        <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 w-12 h-12 rounded-2xl rotate-12 flex items-center justify-center font-black text-xl shadow-lg border-4 border-blue-900">
                            {level}
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-3xl font-black mb-2 tracking-tight">Environmental Resilience</h2>
                        <p className="text-blue-100/80 mb-6 font-medium">Your current safety status is <span className="text-emerald-400 font-bold">Strong</span>. Keep completing quests to level up your shield!</p>
                        
                        {/* XP Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-black uppercase tracking-widest text-blue-200/60">
                                <span className="flex items-center gap-1"><Zap size={12} /> XP: {xp} / {nextLevelThreshold}</span>
                                <span>Level {level}</span>
                            </div>
                            <div className="h-4 bg-black/30 rounded-full p-1 border border-white/10">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    className="h-full bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                                ></motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Daily Stats/Streaks Card */}
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl flex flex-col justify-between"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black text-gray-800 uppercase tracking-wider text-sm">Achievements</h3>
                    <Trophy className="text-yellow-500" size={20} />
                </div>
                
                <div className="space-y-4">
                    {[
                        { name: "Clean Air Sentinel", progress: 80, color: "bg-blue-500", icon: <Star size={14} /> },
                        { name: "Water Guardian", progress: 45, color: "bg-teal-500", icon: <Star size={14} /> },
                        { name: "Eco Explorer", progress: 30, color: "bg-emerald-500", icon: <Star size={14} /> }
                    ].map((achieve, i) => (
                        <div key={i} className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-gray-700 flex items-center gap-1">
                                    {achieve.icon} {achieve.name}
                                </span>
                                <span className="text-gray-400 font-black">{achieve.progress}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${achieve.progress}%` }}
                                    className={`h-full ${achieve.color}`}
                                ></motion.div>
                            </div>
                        </div>
                    ))}
                </div>

                <button className="mt-6 w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold rounded-xl text-xs uppercase tracking-widest transition-colors border border-gray-200">
                    View All Badges
                </button>
            </motion.div>
        </div>
    );
};

export default GamifiedDashboardHeader;
