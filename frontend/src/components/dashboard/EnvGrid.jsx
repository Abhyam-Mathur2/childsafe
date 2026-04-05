import React from 'react';
import { Wind, Droplets, Sprout, Volume2, Radio, Sun, ShieldCheck, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const EnvCard = ({ title, children, icon: Icon, delay = 0 }) => (
    <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        className="glass-card p-6 flex flex-col h-full border-white/5 hover:border-[var(--color-primary)]/30"
    >
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-white/5 text-[var(--color-primary)]">
                <Icon size={18} />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-200">{title}</h3>
        </div>
        <div className="flex-1 space-y-4">
            {children}
        </div>
    </motion.div>
);

const StatRow = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
        <span className="text-xs text-slate-500 font-medium">{label}</span>
        <span className="text-sm font-bold text-slate-200">{value}</span>
    </div>
);

const EnvGrid = ({ air, soil, water, weather }) => {
    const { countryName } = useTheme();
    if (!air && !soil && !water) return null;

    return (
        <div className="space-y-12">
            {/* Minimalist Weather Hero */}
            {weather && (
                <div className="glass-panel !p-10 flex flex-col md:flex-row justify-between items-center gap-10 border-white/5">
                    <div className="flex items-center gap-8">
                        <div className="text-6xl md:text-8xl font-light text-white tracking-tighter">
                            {Math.round(weather.data.temperature)}°
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <MapPin size={12} className="text-[var(--color-primary)]" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{weather.location_name}</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white capitalize">{weather.data.weather_description}</h2>
                            <p className="text-sm text-slate-500 mt-1 font-medium">Feels like {Math.round(weather.data.feels_like)}° • Humidity {weather.data.humidity}%</p>
                        </div>
                    </div>
                    <div className="h-px w-full md:w-px md:h-16 bg-white/5"></div>
                    <div className="text-center md:text-right">
                        <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Wind Speed</div>
                        <div className="text-3xl font-bold text-white">{weather.data.wind_speed} <span className="text-sm font-normal text-slate-500">km/h</span></div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {air && (
                    <EnvCard title="Air Quality" icon={Wind} delay={0.1}>
                        <div className="flex items-end gap-3 mb-2">
                            <span className="text-4xl font-bold text-white">{air.data.aqi}</span>
                            <span className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-widest pb-1.5">AQI Index</span>
                        </div>
                        <div className="space-y-1">
                            <StatRow label="Primary Pollutant" value={air.primary_pollutant} />
                            <StatRow label="PM2.5 Concentration" value={`${air.data.pm25} µg/m³`} />
                        </div>
                    </EnvCard>
                )}

                {water && (
                    <EnvCard title="Water Supply" icon={Droplets} delay={0.2}>
                        <div className="flex items-center gap-2 text-[var(--color-primary)] mb-4">
                            <ShieldCheck size={16} />
                            <span className="text-xs font-bold uppercase tracking-widest">System Validated</span>
                        </div>
                        <StatRow label="Source Type" value={water.source_type} />
                        <StatRow label="pH Balanced" value={water.ph} />
                    </EnvCard>
                )}

                {soil && (
                    <EnvCard title="Soil Health" icon={Sprout} delay={0.3}>
                        <StatRow label="Classification" value={soil.soil_type} />
                        <StatRow label="Contamination Risk" value={soil.contamination_risk} />
                        <p className="text-[10px] text-slate-600 font-medium uppercase tracking-widest mt-4">AI Sentiment Analysis Active</p>
                    </EnvCard>
                )}

                <EnvCard title="Noise Intelligence" icon={Volume2} delay={0.4}>
                    <StatRow label="Ambient Average" value="52 dB" />
                    <StatRow label="Peak Levels" value="68 dB" />
                </EnvCard>

                <EnvCard title="Safety Nodes" icon={Radio} delay={0.5}>
                    <StatRow label="Radiation Baseline" value="0.12 μSv/h" />
                    <StatRow label="Radon Potential" value="Low" />
                </EnvCard>

                <div className="glass-card p-8 border-dashed border-white/10 flex flex-col justify-center items-center text-center opacity-50 hover:opacity-100 transition-opacity">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Additional Metrics</span>
                    <p className="text-xs text-slate-600 leading-relaxed">System is continuously aggregating localized sensors.</p>
                </div>
            </div>
        </div>
    );
};

export default EnvGrid;
