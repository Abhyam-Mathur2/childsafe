import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Zap, Wind, Droplets, Sprout, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DailyQuests = () => {
    const { gainXp } = useAuth();
    const [quests, setQuests] = useState([
        { id: 1, text: "Check local air quality index", xp: 50, completed: false, icon: <Wind size={18} className="text-blue-500" /> },
        { id: 2, text: "Complete 5-minute ventilation", xp: 100, completed: false, icon: <Clock size={18} className="text-emerald-500" /> },
        { id: 3, text: "Log your daily water source", xp: 75, completed: false, icon: <Droplets size={18} className="text-teal-500" /> },
        { id: 4, text: "Report one local hazard", xp: 150, completed: false, icon: <Sprout size={18} className="text-green-500" /> },
    ]);

    const handleComplete = (id, xpAmount) => {
        setQuests(prev => prev.map(q => 
            q.id === id ? { ...q, completed: !q.completed } : q
        ));
        
        // If it was just marked as completed, gain XP
        const quest = quests.find(q => q.id === id);
        if (!quest.completed) {
            gainXp(xpAmount);
        }
    };

    const completedCount = quests.filter(q => q.completed).length;

    return (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl h-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Daily Quests</h3>
                    <p className="text-sm text-gray-500 font-medium">{completedCount} of {quests.length} active</p>
                </div>
                <div className="px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-xl text-xs font-black uppercase tracking-widest border border-yellow-100 flex items-center gap-1.5">
                    <Zap size={14} /> New in 4h
                </div>
            </div>

            <div className="space-y-3">
                {quests.map((quest) => (
                    <motion.button
                        key={quest.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleComplete(quest.id, quest.xp)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                            quest.completed 
                                ? 'bg-green-50 border-green-100 opacity-60' 
                                : 'bg-white border-gray-50 hover:border-blue-100 hover:shadow-md'
                        }`}
                    >
                        <div className={`shrink-0 transition-colors ${quest.completed ? 'text-green-600' : 'text-gray-300'}`}>
                            {quest.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                        </div>
                        
                        <div className="flex-1 text-left">
                            <div className="flex items-center gap-2 mb-0.5">
                                {quest.icon}
                                <span className={`font-bold text-sm ${quest.completed ? 'text-green-800 line-through' : 'text-gray-700'}`}>
                                    {quest.text}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-blue-500">
                                <Zap size={10} /> +{quest.xp} XP
                            </div>
                        </div>
                    </motion.button>
                ))}
            </div>

            {completedCount === quests.length && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl text-center text-white font-black uppercase tracking-widest text-xs shadow-lg"
                >
                    🎉 Daily Bonus Unlocked! +200 XP
                </motion.div>
            )}
        </div>
    );
};

export default DailyQuests;
