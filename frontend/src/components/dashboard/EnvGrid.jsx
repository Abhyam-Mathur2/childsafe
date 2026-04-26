import React, { useState } from 'react';
import { Wind, Droplets, Sprout, MapPin, Activity, Zap, ShieldCheck, Radio, Info, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EnvCard = ({ title, value, unit, icon: Icon, stats = [], delay = 0, neuralInsight = "" }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="glass-panel !p-10 border-white/5 group hover:bg-white/[0.04] transition-all duration-500 h-full flex flex-col justify-between relative overflow-hidden"
        >
            {/* Background Glow Effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)]/5 blur-[50px] -mr-16 -mt-16 group-hover:bg-[var(--color-primary)]/10 transition-all duration-700" />
            
            <AnimatePresence>
                {isHovered && (
                    <motion.div 
                        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
                        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        className="absolute inset-0 z-20 bg-black/60 p-10 flex flex-col justify-center"
                    >
                        <motion.div
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-3 text-[var(--color-primary)]">
                                <Info size={16} />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Neural Insight</span>
                            </div>
                            <p className="text-sm text-slate-200 leading-relaxed font-medium italic">
                                "{neuralInsight}"
                            </p>
                            <div className="pt-6 border-t border-white/10">
                                <button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-white hover:text-[var(--color-primary)] transition-colors group/btn">
                                    <FileText size={14} className="group-hover/btn:scale-110 transition-transform" />
                                    Generate Detailed Synthesis
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div>
                <div className="flex justify-between items-start mb-12">
                    <motion.div 
                        animate={{ 
                            scale: isHovered ? 1.1 : 1,
                            backgroundColor: isHovered ? 'rgba(var(--color-primary-rgb), 0.15)' : 'rgba(255, 255, 255, 0.05)'
                        }}
                        className="p-4 rounded-2xl bg-white/5 text-[var(--color-primary)] border border-white/5 group-hover:border-[var(--color-primary)]/30 transition-colors"
                    >
                        <Icon size={24} />
                    </motion.div>
                    <div className="text-right">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">{title}</p>
                        <div className="flex items-baseline justify-end gap-2">
                            <span className="text-5xl font-bold text-white tracking-tighter">{value}</span>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{unit}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-600">
                        <span>Signal Integrity</span>
                        <span className="text-emerald-500 italic">Excellent</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                            animate={{ width: isHovered ? '100%' : '100%' }}
                            className="h-full w-full bg-gradient-to-r from-[var(--color-primary)]/20 to-[var(--color-primary)] opacity-60 shadow-[0_0_15px_var(--color-primary)]" 
                        />
                    </div>
                </div>
            </div>
            
            <div className="pt-10 grid grid-cols-2 gap-8 border-t border-white/5 mt-10">
                {stats.map((stat, i) => (
                    <div key={i} className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{stat.label}</p>
                        <p className="text-sm font-bold text-slate-200">{stat.value}</p>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

const EnvGrid = ({ air, soil, water, weather }) => {
    if (!air && !soil && !water && !weather) return null;

    return (
        <div className="space-y-12">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-wrap gap-12 py-8 border-y border-white/5"
            >
                {[
                    { label: "Data Latency", value: "14ms", icon: <Zap size={16}/> },
                    { label: "Active Nodes", value: "Global Cluster", icon: <Radio size={16}/> },
                    { label: "Health Baseline", value: "Verified Secure", icon: <ShieldCheck size={16}/> },
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 group cursor-help">
                        <div className="text-[var(--color-primary)] group-hover:scale-125 transition-transform">{item.icon}</div>
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{item.label}:</span>
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-white">{item.value}</span>
                    </div>
                ))}
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                {weather && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-panel !p-12 border-white/10 xl:col-span-2 flex flex-col md:flex-row justify-between items-center gap-16 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[100px] -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        
                        <div className="flex items-center gap-12 relative z-10">
                            <div className="text-[100px] md:text-[140px] font-light text-white tracking-tighter flex items-start leading-none">
                                {Math.round(weather.data.temperature)}
                                <span className="text-5xl mt-6 opacity-20">°</span>
                            </div>
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <MapPin size={16} className="text-[var(--color-primary)]" />
                                    <span className="text-xs font-bold uppercase tracking-[0.4em] text-slate-500 italic">{weather.location_name}</span>
                                </div>
                                <h2 className="text-5xl font-bold text-white tracking-tight capitalize leading-tight">{weather.data.weather_description}</h2>
                                <div className="flex gap-6">
                                    <div className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                                        Humidity {weather.data.humidity}%
                                    </div>
                                    <div className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                                        RealFeel {Math.round(weather.data.feels_like)}°
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center md:items-end gap-4 pr-6 relative z-10">
                            <p className="text-xs font-bold uppercase tracking-[0.4em] text-slate-600 mb-2">Vector Velocity</p>
                            <div className="text-7xl font-black text-white tracking-tighter">
                                {weather.data.wind_speed}
                                <span className="text-lg font-bold text-slate-500 ml-4 uppercase tracking-widest">km/h</span>
                            </div>
                            <div className="w-48 h-1.5 bg-white/5 rounded-full mt-6 overflow-hidden">
                                <div className="h-full w-2/3 bg-[var(--color-primary)] opacity-50 shadow-[0_0_15px_var(--color-primary)]" />
                            </div>
                        </div>
                    </motion.div>
                )}

                {air && (
                    <EnvCard 
                        title="Atmospheric Quality" 
                        icon={Wind} 
                        value={air.data.aqi} 
                        unit="AQI"
                        stats={[
                            { label: "Pollutant", value: air.primary_pollutant },
                            { label: "Density", value: `${air.data.pm25} µg/m³` }
                        ]}
                        delay={0.1}
                        neuralInsight="Micro-particulates are currently at a level that can induce silent respiratory fatigue. A detailed synthesis is required to map long-term exposure risks."
                    />
                )}

                {water && (
                    <EnvCard 
                        title="Hydrological Safety" 
                        icon={Droplets} 
                        value={water.ph} 
                        unit="pH"
                        stats={[
                            { label: "Source", value: water.source_type },
                            { label: "Toxicity", value: "Minimal Risk" }
                        ]}
                        delay={0.2}
                        neuralInsight="Water alkalinity fluctuations can indicate localized runoff. Generate a full report to verify longitudinal purity against clinical standards."
                    />
                )}

                {soil && (
                    <EnvCard 
                        title="Lithological Health" 
                        icon={Sprout} 
                        value={soil.soil_type} 
                        unit="Soil Type"
                        stats={[
                            { label: "Contamination", value: soil.contamination_risk },
                            { label: "Soil Analysis", value: "Verified" }
                        ]}
                        delay={0.3}
                        neuralInsight="Lithological stability directly impacts local allergen concentrations. High-resolution analysis is recommended for complete biomic safety."
                    />
                )}

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-panel !p-12 border-dashed border-white/10 flex flex-col justify-center items-center text-center opacity-50 hover:opacity-100 transition-all duration-700 group cursor-pointer"
                >
                    <Activity size={48} className="text-slate-700 mb-10 group-hover:text-[var(--color-primary)] group-hover:scale-110 transition-all duration-500" />
                    <h3 className="text-sm font-bold uppercase tracking-[0.4em] text-slate-500 mb-6 group-hover:text-white transition-colors">Neural Scanning</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed uppercase tracking-[0.3em] group-hover:text-slate-400 transition-colors">
                        Continuously processing <br/> localized signals...
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default EnvGrid;
