import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import EnvGrid from '../components/dashboard/EnvGrid';
import { Loader, RefreshCw, MapPin, ShieldCheck, Zap, ArrowRight, LayoutDashboard, Database, Activity, Target, Shield, Lock, Cpu, Network, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import DailyQuests from '../components/dashboard/DailyQuests';

const DashboardPage = () => {
    const { user, level } = useAuth();
    const { theme, countryName } = useTheme();
    const [location, setLocation] = useState(null);
    const [envData, setEnvData] = useState({ air: null, soil: null, water: null, weather: null });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("overview");

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
            let weatherData = null;
            let city = '', country = '';

            try {
                const weatherRes = await api.get(`/weather?latitude=${lat}&longitude=${lon}`);
                weatherData = weatherRes.data;
                const parts = (weatherData.location_name || '').split(',');
                city = parts[0]?.trim() || '';
                country = parts[2]?.trim() || weatherData.sys?.country || '';
            } catch (e) {
                console.warn("Weather fetch failed", e);
            }

            const [airRes, soilRes, waterRes] = await Promise.allSettled([
                api.get(`/air-quality?latitude=${lat}&longitude=${lon}`),
                api.get(`/soil-research?latitude=${lat}&longitude=${lon}&city=${city}&country=${country}`),
                api.get(`/water-quality?latitude=${lat}&longitude=${lon}&city=${city}&country=${country}`)
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

    const getScoreStatus = (score) => {
        if (score >= 75) return { color: 'text-emerald-400', glow: 'rgba(16, 185, 129, 0.5)', label: 'Optimal Parameters', desc: 'System environment is currently within safe parameters.' };
        if (score >= 50) return { color: 'text-amber-400', glow: 'rgba(245, 158, 11, 0.5)', label: 'Caution Advised', desc: 'Minor environmental anomalies detected in local telemetry.' };
        return { color: 'text-rose-500', glow: 'rgba(244, 63, 94, 0.5)', label: 'Critical Alert', desc: 'Severe environmental degradation detected. Immediate action recommended.' };
    };

    const status = getScoreStatus(Math.round(safetyScore));

    const charVariants = {
        hidden: { opacity: 0, y: 50, rotateX: -90, scale: 0.5, filter: 'blur(10px)' },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            rotateX: 0,
            scale: 1,
            filter: 'blur(0px)',
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 200,
                delay: i * 0.04,
                duration: 0.8
            }
        })
    };

    const synthesisVariants = {
        hidden: { opacity: 0, x: 20, filter: 'brightness(0)' },
        visible: (i) => ({
            opacity: 1,
            x: 0,
            filter: 'brightness(1.5)',
            transition: {
                type: "spring",
                damping: 20,
                stiffness: 100,
                delay: 0.5 + (i * 0.03),
                duration: 1.2
            }
        })
    };

    const renderAnimatedText = (text, variants, className) => {
        return text.split("").map((char, i) => (
            <motion.span
                key={i}
                custom={i}
                variants={variants}
                initial="hidden"
                animate="visible"
                className={`inline-block ${className}`}
                whileHover={{ 
                    scale: 1.2, 
                    color: 'var(--color-primary)', 
                    filter: 'drop-shadow(0 0 20px var(--color-primary))',
                    transition: { duration: 0.2 }
                }}
            >
                {char === " " ? "\u00A0" : char}
            </motion.span>
        ));
    };

    const PlaceholderView = ({ title, icon: Icon, description }) => (
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel !p-24 text-center flex flex-col items-center justify-center min-h-[600px] border-dashed border-white/10"
        >
            <div className="relative mb-12">
                <div className="absolute inset-0 bg-[var(--color-primary)]/20 blur-[100px] rounded-full" />
                <div className="p-10 rounded-full bg-white/5 border border-white/10 relative z-10">
                    <Icon size={80} className="text-[var(--color-primary)]" />
                </div>
                <Lock size={28} className="absolute bottom-0 right-0 text-white" />
            </div>
            <h2 className="text-5xl font-bold text-white mb-8 uppercase tracking-tighter" style={{ fontFamily: "var(--font-heading)" }}>{title} Access Restricted</h2>
            <p className="text-slate-400 text-xl max-w-xl mx-auto leading-relaxed">
                {description}
            </p>
            <div className="mt-16 flex gap-8">
                <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] text-slate-600">
                    <Cpu size={16} />
                    Hardware Sync Required
                </div>
                <div className="w-px h-6 bg-white/10" />
                <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] text-slate-600">
                    <Network size={16} />
                    Level {level + 5} Authorization
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="min-h-screen pt-24 md:pt-40 pb-20 md:pb-32 px-6 lg:px-20 selection:bg-[var(--color-primary)] selection:text-white">
            <div className="max-w-[1900px] mx-auto">
                
                <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-20">
                    
                    {/* Perspective Sidebar */}
                    <aside className="space-y-12">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass-panel !p-12 border-white/5 bg-white/[0.01]"
                        >
                            <div className="flex items-center gap-8 mb-12">
                                <div className="w-20 h-20 rounded-3xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] font-black text-3xl border border-[var(--color-primary)]/20 shadow-2xl">
                                    {level}
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Node Operative</p>
                                    <h2 className="text-3xl font-bold text-white tracking-tight leading-none">{user.name.split(' ')[0]}</h2>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">Node Sync Status</span>
                                    <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Active</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: '85%' }}
                                        className="h-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                                    />
                                </div>
                            </div>
                        </motion.div>

                        <motion.nav 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="space-y-4"
                        >
                            {[
                                { id: "overview", icon: <LayoutDashboard size={24} />, label: "Terminal Overview" },
                                { id: "biometrics", icon: <Activity size={24} />, label: "Bio-Metrics" },
                                { id: "tactical", icon: <Target size={24} />, label: "Tactical Goals" },
                                { id: "telemetry", icon: <Database size={24} />, label: "Raw Telemetry" },
                            ].map((item) => (
                                <button 
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-6 px-10 py-6 rounded-3xl transition-all duration-300 group ${
                                        activeTab === item.id 
                                            ? 'bg-white/5 text-white border border-white/10 shadow-2xl' 
                                            : 'text-slate-500 hover:text-slate-100 hover:bg-white/[0.02]'
                                    }`}
                                >
                                    <div className={`transition-transform duration-500 ${activeTab === item.id ? 'scale-110 text-[var(--color-primary)]' : 'group-hover:scale-110'}`}>
                                        {item.icon}
                                    </div>
                                    <span className="text-sm font-black uppercase tracking-[0.2em]">{item.label}</span>
                                    {activeTab === item.id && (
                                        <motion.div 
                                            layoutId="nav-glow-scaled"
                                            className="ml-auto w-2 h-2 rounded-full bg-[var(--color-primary)] shadow-[0_0_15px_var(--color-primary)]"
                                        />
                                    )}
                                </button>
                            ))}
                        </motion.nav>
                    </aside>

                    {/* Main Intelligence View */}
                    <main className="space-y-20">
                        
                        <div className="flex flex-col xl:flex-row justify-between items-start gap-16 relative">
                            <div className="flex-1">
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center gap-5 mb-8"
                                >
                                    <MapPin size={20} className="text-[var(--color-primary)]" />
                                    <span className="text-sm font-black uppercase tracking-[0.6em] text-slate-500 font-sans">
                                        Active Surveillance: {countryName} {theme.greeting.flag}
                                    </span>
                                </motion.div>
                                
                                <div className="flex flex-col perspective-1000 mb-16">
                                    <motion.span 
                                        initial={{ opacity: 0, letterSpacing: '0em' }}
                                        animate={{ opacity: 0.4, letterSpacing: '0.8em' }}
                                        transition={{ duration: 2, ease: "easeOut" }}
                                        className="text-xs font-black uppercase text-[var(--color-primary)] mb-8 block"
                                    >
                                        Intelligence Node Alpha
                                    </motion.span>
                                    
                                    <h1 
                                        className="text-5xl md:text-7xl lg:text-[90px] leading-[0.85] tracking-tighter flex flex-col uppercase"
                                        style={{ fontFamily: "var(--font-heading)" }}
                                    >
                                        <div className="flex overflow-hidden">
                                            {renderAnimatedText("Health risk", charVariants, "font-black text-white")}
                                        </div>
                                        <div className="flex ml-8 md:ml-16 overflow-hidden">
                                            {renderAnimatedText("analysis.", synthesisVariants, "font-light italic text-transparent bg-clip-text bg-gradient-to-r from-white/40 via-white to-transparent")}
                                        </div>
                                    </h1>
                                </div>
                                
                                <div className="flex flex-wrap gap-8 items-center">
                                    <button
                                        onClick={handleGetLocation}
                                        className="group flex items-center gap-5 px-12 py-6 bg-white/[0.03] border border-white/10 rounded-3xl text-sm font-black uppercase tracking-widest hover:bg-white/[0.08] transition-all text-slate-300 hover:text-white"
                                    >
                                        {loading ? <RefreshCw className="animate-spin text-[var(--color-primary)]" size={22} /> : <RefreshCw size={22} />}
                                        Refresh Feed
                                    </button>
                                    <Link
                                        to="/assessment"
                                        className="flex items-center gap-5 px-12 py-6 bg-[var(--color-primary)] text-black font-black rounded-3xl text-sm font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_50px_rgba(var(--color-primary-rgb),0.2)]"
                                    >
                                        Scan Individual
                                        <ArrowRight size={22} />
                                    </Link>
                                    
                                    {/* Cinematic Scroll Indicator */}
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 2 }}
                                        className="ml-8 hidden xl:flex flex-col items-center gap-2 text-[9px] font-black uppercase tracking-[0.4em] text-slate-600"
                                    >
                                        <motion.div
                                            animate={{ y: [0, 8, 0] }}
                                            transition={{ repeat: Infinity, duration: 2 }}
                                        >
                                            <ChevronDown size={20} />
                                        </motion.div>
                                        Telemetry Feed
                                    </motion.div>
                                </div>
                            </div>

                            {/* Redesigned Integrated Objectives Panel */}
                            <div className="shrink-0 xl:w-[420px]">
                                <DailyQuests />
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {activeTab === "overview" ? (
                                <motion.div 
                                    key="overview"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-20"
                                >
                                    {location ? (
                                        <>
                                            <div className="grid grid-cols-1 xl:grid-cols-[1fr_480px] gap-12">
                                                <div className="glass-panel !p-20 relative overflow-hidden flex items-center border-white/5 bg-white/[0.01]">
                                                    <div className="relative z-10 w-full">
                                                        <div className="flex flex-col md:flex-row justify-between md:items-end gap-16 mb-20">
                                                            <div className="flex-1">
                                                                <h2 className={`text-sm font-black uppercase tracking-[0.5em] ${status.color} mb-10`}>Localized Resilience Index</h2>
                                                                <p className="text-5xl font-bold text-white tracking-tighter leading-[1.1]" style={{ fontFamily: "var(--font-heading)" }}>
                                                                    {status.desc}
                                                                </p>
                                                            </div>
                                                            <div className="text-left md:text-right relative min-w-[250px]">
                                                                <Shield size={220} className={`absolute -top-12 -right-12 ${status.color} opacity-5 z-0`} />
                                                                <div className="relative z-10">
                                                                    <div className={`text-[140px] md:text-[180px] font-black ${status.color} leading-none tracking-tighter`} style={{ fontFamily: "var(--font-heading)", filter: `drop-shadow(0 0 40px ${status.glow})` }}>
                                                                        {Math.round(safetyScore)}
                                                                    </div>
                                                                    <div className="text-xs font-black uppercase tracking-[0.5em] text-slate-500 mt-10 flex items-center md:justify-end gap-4">
                                                                        <ShieldCheck size={20} className={status.color} />
                                                                        {status.label}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-16 pt-20 border-t border-white/5">
                                                            {[
                                                                { label: "Stability", value: "94%", color: "text-emerald-400" },
                                                                { label: "Risk Level", value: "Low", color: "text-emerald-400" },
                                                                { label: "Sync Nodes", value: "14/15", color: "text-white" },
                                                            ].map((item, i) => (
                                                                <div key={i}>
                                                                    <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-5">{item.label}</p>
                                                                    <p className={`text-4xl font-bold ${item.color}`}>{item.value}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="glass-panel !p-16 border-white/5 bg-white/[0.01] flex flex-col justify-between">
                                                    <div>
                                                        <ShieldCheck className="text-[var(--color-primary)] mb-12" size={64} />
                                                        <h3 className="text-4xl font-bold mb-8 leading-tight text-white" style={{ fontFamily: "var(--font-heading)" }}>Continuous AI <br/> Surveillance Active.</h3>
                                                        <p className="text-xl text-slate-400 font-medium leading-relaxed font-sans">
                                                            The system is cross-referencing global health patterns with localized telemetry in real-time.
                                                        </p>
                                                    </div>
                                                    <div className="space-y-6 text-xs font-black uppercase tracking-[0.4em] pt-16 border-t border-white/5">
                                                        <div className="flex items-center gap-5 text-emerald-400 text-xl tracking-tight">
                                                            <div className="w-3 h-3 rounded-full bg-current animate-pulse shadow-[0_0_15px_currentColor]" />
                                                            Satellite Link Secure
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <EnvGrid
                                                air={envData.air}
                                                soil={envData.soil}
                                                water={envData.water}
                                                weather={envData.weather}
                                            />
                                            
                                            {/* Final Action Tier */}
                                            <motion.div 
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                className="pt-12 text-center"
                                            >
                                                <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/10 to-transparent mx-auto mb-16" />
                                                <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tighter mb-16" style={{ fontFamily: "var(--font-heading)" }}>
                                                    Ready for a <span className="text-transparent bg-clip-text bg-gradient-to-r from-white/60 to-white/20 italic font-light">Deep Scan?</span>
                                                </h2>
                                                <Link 
                                                    to="/assessment"
                                                    className="inline-flex items-center gap-6 px-16 py-8 bg-white text-black font-black rounded-3xl text-lg uppercase tracking-widest hover:bg-[var(--color-primary)] hover:text-white transition-all shadow-[0_30px_60px_rgba(0,0,0,0.5)] group"
                                                >
                                                    Scan Individual
                                                    <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                                                </Link>
                                            </motion.div>
                                        </>
                                    ) : (
                                        <motion.div 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="glass-panel !p-64 text-center border-dashed border-white/10"
                                        >
                                            <Loader className="animate-spin text-[var(--color-primary)] mx-auto mb-12" size={80} />
                                            <h2 className="text-4xl font-bold text-white mb-6 uppercase tracking-tighter">Establishing Secure Connection</h2>
                                            <p className="text-slate-500 text-xl font-medium">Calibrating sensors to your specific coordinates...</p>
                                        </motion.div>
                                    )}
                                </motion.div>
                            ) : activeTab === "biometrics" ? (
                                <PlaceholderView 
                                    key="biometrics"
                                    title="Bio-Metric"
                                    icon={Activity}
                                    description="Integrate wearable diagnostic hardware to synchronize heart rate, respiratory patterns, and blood oxygen levels with environmental intelligence."
                                />
                            ) : activeTab === "tactical" ? (
                                <PlaceholderView 
                                    key="tactical"
                                    title="Tactical"
                                    icon={Target}
                                    description="Advanced health optimization protocols and objective sequencing. Fulfill daily operational requirements to increase resilience rating."
                                />
                            ) : (
                                <PlaceholderView 
                                    key="telemetry"
                                    title="Telemetry"
                                    icon={Database}
                                    description="Direct interface with raw environmental sensor arrays. High-resolution data streams from satellite and localized ground-level telemetry."
                                />
                            )}
                        </AnimatePresence>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
