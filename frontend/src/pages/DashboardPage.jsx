import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import EnvGrid from '../components/dashboard/EnvGrid';
import GamifiedDashboardHeader from '../components/dashboard/GamifiedDashboardHeader';
import DailyQuests from '../components/dashboard/DailyQuests';
import { MapPin, Loader, RefreshCw, Activity, AlertTriangle, Leaf, Zap, ShieldCheck, Compass } from 'lucide-react';
import { motion } from 'framer-motion';
import VideoBackground from '../components/ui/VideoBackground';

const DashboardPage = () => {
    const [location, setLocation] = useState(null);
    const [envData, setEnvData] = useState({ air: null, soil: null, water: null, weather: null });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        handleGetLocation();
    }, []);

    const handleGetLocation = () => {
        setLoading(true);
        setError(null);

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ latitude, longitude });
                await fetchEnvironmentalData(latitude, longitude);
            },
            (err) => {
                setError('Unable to retrieve location. Please allow access.');
                setLoading(false);
            }
        );
    };

    const fetchEnvironmentalData = async (lat, lon) => {
        try {
            // 1. Fetch Weather
            let weatherData = null;
            let city = '', state = '', country = '';

            try {
                const weatherRes = await api.get(`/weather?latitude=${lat}&longitude=${lon}`);
                weatherData = weatherRes.data;
                const parts = (weatherData.location_name || '').split(',');
                city = parts[0]?.trim() || '';
                state = parts[1]?.trim() || '';
                country = parts[2]?.trim() || weatherData.sys?.country || '';
            } catch (e) {
                console.warn("Weather fetch failed", e);
            }

            // 2. Parallel Fetch
            const [airRes, soilRes, waterRes] = await Promise.allSettled([
                api.get(`/air-quality?latitude=${lat}&longitude=${lon}`),
                api.get(`/soil-research?latitude=${lat}&longitude=${lon}&city=${city}&state=${state}&country=${country}`),
                api.get(`/water-quality?latitude=${lat}&longitude=${lon}&city=${city}&state=${state}&country=${country}`)
            ]);

            setEnvData({
                weather: weatherData,
                air: airRes.status === 'fulfilled' ? airRes.value.data : null,
                soil: soilRes.status === 'fulfilled' ? soilRes.value.data : null,
                water: waterRes.status === 'fulfilled' ? waterRes.value.data : null
            });

        } catch (err) {
            console.error("Dashboard fetch error", err);
            setError("Failed to load some environmental data.");
        } finally {
            setLoading(false);
        }
    };

    const safetyScore = envData.air ? 100 - (envData.air.data.aqi / 2) : 85;

    return (
        <div className="min-h-screen relative overflow-hidden pt-28 pb-12 px-4 sm:px-6 lg:px-8">
            <VideoBackground opacity={0.4} />
            
            <div className="max-w-7xl mx-auto relative z-10">
                {/* Gamified Header */}
                {location && !loading && (
                    <GamifiedDashboardHeader safetyScore={Math.round(safetyScore)} />
                )}

                {/* Sub-Header Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <motion.h2 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-3xl font-black text-white tracking-tight shimmer-text"
                        >
                            Environmental Intel
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-slate-400 font-medium"
                        >
                            Real-time intelligence from your immediate surroundings.
                        </motion.p>
                    </div>
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleGetLocation}
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-3 px-6 py-3 bg-white/[0.03] border border-white/10 text-white font-bold rounded-2xl hover:bg-white/[0.08] hover:border-white/20 transition-all shadow-xl backdrop-blur-md group"
                    >
                        {loading ? <Loader className="animate-spin text-emerald-400" size={20} /> : <RefreshCw className="group-hover:rotate-180 transition-transform duration-500" size={20} />}
                        <span className="uppercase tracking-widest text-xs">Sync Intelligence</span>
                    </motion.button>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-rose-500/10 border border-rose-500/20 p-5 rounded-2xl mb-10 flex items-start gap-4 backdrop-blur-md"
                    >
                        <AlertTriangle className="text-rose-500 shrink-0" size={24} />
                        <div>
                            <h3 className="text-lg font-bold text-rose-200 tracking-tight">System Interruption</h3>
                            <p className="text-rose-200/70 mt-1 font-medium">{error}</p>
                        </div>
                    </motion.div>
                )}

                {loading && !envData.air ? (
                    <div className="glass-panel !rounded-[2.5rem] p-20 text-center max-w-3xl mx-auto mt-10">
                        <div className="relative mb-12">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                                className="w-32 h-32 border-4 border-emerald-500/10 border-t-emerald-400 rounded-full mx-auto"
                            ></motion.div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Compass size={40} className="text-emerald-400 animate-pulse" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-white mb-4 tracking-tight">Calibrating Local Sensors</h3>
                        <p className="text-slate-400 text-lg font-light max-w-md mx-auto leading-relaxed">
                            Synchronizing with orbital satellites and ground stations to fetch ultra-precise environmental metrics.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                        {/* Environmental Grid takes more space */}
                        <div className="lg:col-span-3">
                            {!location ? (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="glass-panel !rounded-[3rem] p-20 text-center max-w-2xl mx-auto mt-10"
                                >
                                    <div className="w-24 h-24 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-emerald-500/20 shadow-2xl">
                                        <MapPin size={48} className="text-emerald-400" />
                                    </div>
                                    <h2 className="text-4xl font-black text-white mb-6 tracking-tight">Telemetry Restricted</h2>
                                    <p className="text-slate-400 mb-12 text-lg leading-relaxed font-light">
                                        Active location data is required to establish a secure link with local environmental sensors and provide critical safety metrics.
                                    </p>
                                    <button
                                        onClick={handleGetLocation}
                                        className="btn-modern !py-5 !rounded-2xl text-lg flex items-center justify-center gap-3 group"
                                    >
                                        Authorize Access
                                        <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </motion.div>
                            ) : (
                                <EnvGrid
                                    air={envData.air}
                                    soil={envData.soil}
                                    water={envData.water}
                                    weather={envData.weather}
                                />
                            )}
                        </div>

                        {/* Daily Quests takes 1 col */}
                        <div className="lg:col-span-1">
                            <DailyQuests />
                        </div>
                    </div>
                )}

                {!loading && location && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="mt-16 relative overflow-hidden rounded-[3rem] glass-panel !p-0 border-white/10 shadow-3xl group"
                    >
                        {/* Interactive glow effect */}
                        <div className="absolute top-0 right-0 -mt-24 -mr-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] group-hover:bg-emerald-500/30 transition-colors duration-700"></div>
                        
                        <div className="relative z-10 p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12">
                            <div className="flex-1 text-center md:text-left">
                                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest mb-8 backdrop-blur-md">
                                    <ShieldCheck size={16} />
                                    Critical Optimization
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-white leading-tight">Forge Your <br />Child's Health Shield</h2>
                                <p className="text-slate-400 text-xl max-w-2xl leading-relaxed font-light">
                                    Passive monitoring is just the start. Integrate your child's lifestyle patterns with environmental intelligence to unlock the <span className="text-white font-bold">Resilience Engine</span>.
                                </p>
                            </div>
                            <div className="shrink-0 flex flex-col items-center">
                                <Link
                                    to="/assessment"
                                    className="btn-modern !px-10 !py-5 flex items-center gap-4 text-xl group shadow-emerald-900/40"
                                >
                                    Initiate Assessment
                                    <Zap size={24} className="group-hover:scale-125 transition-transform duration-500 text-yellow-300 fill-current" />
                                </Link>
                                <div className="mt-6 flex items-center gap-3">
                                    <div className="flex -space-x-2">
                                        {[1,2,3].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-emerald-600 flex items-center justify-center text-[10px] font-bold">P{i}</div>
                                        ))}
                                    </div>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Join 12k+ Secure Families</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

// Internal ArrowRight component since it's not imported
const ArrowRight = ({ className, size = 20 }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
);

export default DashboardPage;
