import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import EnvGrid from '../components/dashboard/EnvGrid';
import GamifiedDashboardHeader from '../components/dashboard/GamifiedDashboardHeader';
import DailyQuests from '../components/dashboard/DailyQuests';
import { Loader, RefreshCw, MapPin, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
    const { user } = useAuth();
    const { theme, countryName } = useTheme();
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

    return (
        <div className="min-h-screen pt-32 pb-20 px-6 overflow-x-hidden">
            <div className="max-w-7xl mx-auto">
                {/* Minimalist Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-2 mb-4"
                        >
                            <MapPin size={14} className="text-[var(--color-primary)]" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">
                                Monitoring from {countryName} {theme.greeting.flag}
                            </span>
                        </motion.div>
                        <motion.h1 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-bold tracking-tight text-white"
                        >
                            Welcome, {user.name.split(' ')[0]}
                        </motion.h1>
                    </div>
                    
                    <button
                        onClick={handleGetLocation}
                        disabled={loading}
                        className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all text-slate-300"
                    >
                        {loading ? <Loader className="animate-spin text-[var(--color-primary)]" size={16} /> : <RefreshCw size={16} />}
                        Sync Data
                    </button>
                </div>

                {error && (
                    <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-2xl mb-12 flex items-center gap-4">
                        <ShieldCheck className="text-rose-500" size={24} />
                        <p className="text-rose-200 text-sm font-medium">{error}</p>
                    </div>
                )}

                {location ? (
                    <div className="space-y-16">
                        <GamifiedDashboardHeader safetyScore={Math.round(safetyScore)} />
                        
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-16">
                            <div className="lg:col-span-3">
                                <EnvGrid
                                    air={envData.air}
                                    soil={envData.soil}
                                    water={envData.water}
                                    weather={envData.weather}
                                />
                            </div>
                            <div className="lg:col-span-1">
                                <DailyQuests />
                            </div>
                        </div>

                        {/* Assessment CTA */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-panel !p-12 md:!p-20 relative overflow-hidden border-white/5"
                        >
                            <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-primary)]/5 rounded-full blur-[100px] -mr-48 -mt-48"></div>
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
                                <div className="max-w-2xl">
                                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Forge Your Child's Health Shield</h2>
                                    <p className="text-slate-400 text-lg leading-relaxed">
                                        Integrate lifestyle patterns with environmental intelligence to unlock advanced resilience metrics and personalized protection strategies.
                                    </p>
                                </div>
                                <Link
                                    to="/assessment"
                                    className="btn-modern !px-12 !py-5 !rounded-full text-lg font-bold group shrink-0"
                                >
                                    Initiate Assessment
                                    <Zap size={20} className="fill-current text-white group-hover:scale-110 transition-transform" />
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                ) : (
                    !loading && (
                        <div className="glass-panel text-center py-32 border-dashed border-white/10 opacity-60">
                            <MapPin size={64} className="mx-auto mb-8 text-slate-700" />
                            <h2 className="text-2xl font-bold mb-4">Telemetry Restricted</h2>
                            <p className="text-slate-500 max-w-md mx-auto mb-10 text-lg">Active location data is required to establish a secure link with local sensors.</p>
                            <button onClick={handleGetLocation} className="btn-modern !rounded-full !px-12 mx-auto !py-4 font-bold">Authorize Access</button>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default DashboardPage;
