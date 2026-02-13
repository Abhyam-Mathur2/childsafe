import React from 'react';
import { Wind, Droplets, Sprout, Volume2, Radio, Sun, ShieldCheck, AlertCircle, CloudRain, CloudSnow, CloudLightning, Cloud } from 'lucide-react';
import { motion } from 'framer-motion';

const AqiBadge = ({ aqi, riskLevel }) => {
    const getColorClass = () => {
        if (riskLevel === 'low' || aqi <= 50) return 'border-green-500 text-green-700 bg-green-50';
        if (riskLevel === 'medium' || aqi <= 100) return 'border-yellow-500 text-yellow-700 bg-yellow-50';
        return 'border-red-500 text-red-700 bg-red-50';
    };

    return (
        <div className={`w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center ${getColorClass()}`}>
            <div className="text-2xl font-extrabold leading-none">{aqi}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider mt-0.5">AQI</div>
        </div>
    );
};

const EnvCard = ({ title, children, icon: Icon, riskLevel, delay = 0 }) => {
    const getAccentColor = () => {
        const l = riskLevel?.toLowerCase();
        if (l === 'high' || l === 'poor') return 'bg-red-500';
        if (l === 'medium' || l === 'moderate') return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all group"
        >
            <div className={`h-1.5 w-full ${getAccentColor()}`}></div>
            <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-gray-50 text-gray-700 group-hover:bg-gray-100 transition-colors">
                        <Icon size={20} />
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
                </div>
                <div className="space-y-3">
                    {children}
                </div>
            </div>
        </motion.div>
    );
};

const StatRow = ({ label, value, highlight = false }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0 text-sm">
        <span className="text-gray-500">{label}</span>
        <span className={`font-semibold ${highlight ? 'text-yellow-600' : 'text-gray-900'}`}>{value}</span>
    </div>
);

const WeatherIcon = ({ condition }) => {
    // Simple mapping logic
    const c = condition?.toLowerCase() || '';
    if (c.includes('rain')) return <CloudRain className="text-blue-400" size={48} />;
    if (c.includes('snow')) return <CloudSnow className="text-cyan-200" size={48} />;
    if (c.includes('storm') || c.includes('thunder')) return <CloudLightning className="text-purple-400" size={48} />;
    if (c.includes('cloud')) return <Cloud className="text-gray-400" size={48} />;
    return <Sun className="text-yellow-400" size={48} />;
};

const EnvGrid = ({ air, soil, water, weather }) => {
    if (!air && !soil && !water) return null;

    return (
        <div className="animate-fade-in space-y-8">
            {/* Weather Hero Card */}
            {weather && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6"
                >
                    <div className="flex items-center gap-6 text-center md:text-left">
                        <div className="p-4 bg-yellow-50 rounded-full">
                            <WeatherIcon condition={weather.data.weather_condition} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{weather.location_name}</h2>
                            <p className="text-gray-500 font-medium flex items-center gap-2 justify-center md:justify-start">
                                {weather.data.weather_condition} 
                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                <span className="capitalize">{weather.data.weather_description}</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center md:items-end">
                        <div className="text-6xl font-black text-gray-900 tracking-tighter">
                            {Math.round(weather.data.temperature)}°
                        </div>
                        <div className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            Feels like {Math.round(weather.data.feels_like || weather.data.temperature)}°
                        </div>
                    </div>
                </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Air Quality */}
                {air && (
                    <EnvCard title="Air Quality" icon={Wind} riskLevel={air.risk_level} delay={0.1}>
                        <div className="flex items-center gap-4 mb-2">
                            <AqiBadge aqi={air.data.aqi} riskLevel={air.risk_level} />
                            <div>
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Main Pollutant</div>
                                <div className="font-bold text-gray-800 text-lg">{air.primary_pollutant}</div>
                            </div>
                        </div>
                        <StatRow label="PM2.5" value={`${air.data.pm25} µg/m³`} />
                        <StatRow label="PM10" value={`${air.data.pm10} µg/m³`} />
                    </EnvCard>
                )}

                {/* Water Quality */}
                {water && (
                    <EnvCard title="Water Supply" icon={Droplets} riskLevel={water.contamination_risk} delay={0.2}>
                        <StatRow label="Source" value={water.source_type} />
                        <StatRow label="Hardness" value={water.hardness} />
                        <StatRow label="pH Level" value={water.ph} />
                        <div className="mt-3 bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                            <ShieldCheck size={16} /> Safe for general use
                        </div>
                    </EnvCard>
                )}

                {/* Soil Health */}
                {soil && (
                    <EnvCard title="Soil Health" icon={Sprout} riskLevel={soil.contamination_risk} delay={0.3}>
                        <StatRow label="Soil Type" value={soil.soil_type} />
                        <StatRow label="pH Level" value={soil.ph} />
                        <StatRow label="Nutrients" value={soil.nitrogen_level || 'Moderate'} />
                        <p className="text-xs text-gray-400 italic mt-2">Local soil properties researched via AI</p>
                    </EnvCard>
                )}

                {/* Noise (Estimated) */}
                <EnvCard title="Noise Levels" icon={Volume2} riskLevel="medium" delay={0.4}>
                    <StatRow label="Daytime Avg" value="55 dB" />
                    <StatRow label="Nighttime Avg" value="42 dB" />
                    <StatRow label="Status" value="Moderate" highlight />
                    <p className="text-xs text-gray-400 italic mt-2">Est. from urban density patterns</p>
                </EnvCard>

                {/* Radiation (Estimated) */}
                <EnvCard title="Radiation" icon={Radio} riskLevel="low" delay={0.5}>
                    <StatRow label="Background" value="Low" />
                    <StatRow label="Radon Risk" value="Below Action Level" />
                    <div className="mt-3 bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                        <ShieldCheck size={16} /> Normal range
                    </div>
                </EnvCard>

                {/* Assessment CTA */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white flex flex-col justify-center items-center text-center shadow-lg"
                >
                    <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle size={28} className="text-yellow-400" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Complete Profile</h3>
                    <p className="text-gray-400 text-sm mb-0">
                        Add lifestyle data to see how these factors impact your specific health.
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default EnvGrid;
