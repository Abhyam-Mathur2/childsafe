import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Zap, Wind, Droplets, Sprout, Clock, Target } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DailyQuests = () => {
    const { gainXp } = useAuth();
    const [quests, setQuests] = useState([
        { id: 1, text: "Check AQI", xp: 50, completed: false, icon: <Wind size={14} /> },
        { id: 2, text: "Ventilation", xp: 100, completed: false, icon: <Clock size={14} /> },
        { id: 3, text: "Log Water", xp: 75, completed: false, icon: <Droplets size={14} /> },
        { id: 4, text: "Report Hazard", xp: 150, completed: false, icon: <Sprout size={14} /> },
    ]);

    const handleComplete = (id, xpAmount) => {
        setQuests(prev => prev.map(q => 
            q.id === id ? { ...q, completed: !q.completed } : q
        ));
        
        const quest = quests.find(q => q.id === id);
        if (!quest.completed) {
            gainXp(xpAmount);
        }
    };

    const completedCount = quests.filter(q => q.completed).length;

    return (
        <div className="glass-panel !p-6 border-white/5 bg-white/[0.01] w-full xl:w-[380px] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-1 opacity-10">
                <Target size={120} className="text-white" />
            </div>
            
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
                        <Zap size={18} fill="currentColor" />
                    </div>
                    <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Operational Objectives</h3>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Tactical Sequencing</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-xs font-black text-white uppercase tracking-tighter">{completedCount}/{quests.length}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-2 relative z-10">
                {quests.map((quest) => (
                    <button
                        key={quest.id}
                        onClick={() => handleComplete(quest.id, quest.xp)}
                        className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all duration-500 group/item ${
                            quest.completed 
                                ? 'bg-emerald-500/5 border-emerald-500/20' 
                                : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/20'
                        }`}
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className={`p-1.5 rounded-md transition-colors ${
                                quest.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-500 group-hover/item:text-white'
                            }`}>
                                {quest.icon}
                            </div>
                            <span className={`text-[11px] font-bold truncate tracking-tight transition-all ${
                                quest.completed ? 'text-emerald-200/40 line-through' : 'text-slate-300'
                            }`}>
                                {quest.text}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                             <span className={`text-[9px] font-black tracking-widest ${quest.completed ? 'text-emerald-500' : 'text-slate-600'}`}>
                                +{quest.xp}
                            </span>
                            <div className={`transition-all duration-500 ${quest.completed ? 'text-emerald-500 scale-110' : 'text-slate-800'}`}>
                                {quest.completed ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            <AnimatePresence>
                {completedCount === quests.length && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center"
                    >
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-400 animate-pulse">
                            Capacity Maximized
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DailyQuests;
