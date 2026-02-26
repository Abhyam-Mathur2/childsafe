import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import EnvGrid from '../components/dashboard/EnvGrid';
import GamifiedDashboardHeader from '../components/dashboard/GamifiedDashboardHeader';
import DailyQuests from '../components/dashboard/DailyQuests';
import { MapPin, Loader, RefreshCw, Activity, AlertTriangle, Leaf, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

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
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Gamified Header */}
                {location && !loading && (
                    <GamifiedDashboardHeader safetyScore={Math.round(safetyScore)} />
                )}

                {/* Sub-Header Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Environmental Intel</h2>
                        <p className="text-gray-500 font-medium">Real-time status of your surroundings.</p>
                    </div>
                    <button
                        onClick={handleGetLocation}
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm focus:ring-2 focus:ring-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-xs"
                    >
                        {loading ? <Loader className="animate-spin text-green-600" size={16} /> : <RefreshCw size={16} />}
                        <span>Sync Environment</span>
                    </button>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-8 flex items-start gap-3"
                    >
                        <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
                        <div>
                            <h3 className="text-sm font-bold text-red-800">Error Loading Data</h3>
                            <p className="text-sm text-red-700 mt-1">{error}</p>
                        </div>
                    </motion.div>
                )}

                {loading && !envData.air ? (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center max-w-2xl mx-auto mt-10">
                        <div className="inline-block relative mb-8">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                className="w-24 h-24 border-4 border-blue-50 border-t-blue-500 rounded-full"
                            ></motion.div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Leaf size={32} className="text-blue-500" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Decoding your environment...</h3>
                        <p className="text-gray-500 font-medium">Gathering real-time satellite and ground data for your precise location.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Environmental Grid takes more space */}
                        <div className="lg:col-span-3">
                            {!location ? (
                                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-16 text-center max-w-xl mx-auto mt-10">
                                    <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 ring-8 ring-emerald-50/50">
                                        <MapPin size={48} className="text-emerald-600" />
                                    </div>
                                    <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Location Required</h2>
                                    <p className="text-gray-600 mb-10 leading-relaxed font-medium">
                                        We need your location to synchronize with local environmental sensors and provide accurate safety data.
                                    </p>
                                    <button
                                        onClick={handleGetLocation}
                                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl transition-all shadow-lg hover:shadow-emerald-200 transform hover:-translate-y-1 uppercase tracking-widest text-sm"
                                    >
                                        Sync Now
                                    </button>
                                </div>
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
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-12 relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-emerald-950 to-emerald-900 text-white shadow-2xl"
                    >
                        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>

                        <div className="relative z-10 p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10">
                            <div className="flex-1 text-center md:text-left">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-400/20 text-yellow-300 text-[10px] font-black uppercase tracking-widest mb-6 border border-yellow-400/20">
                                    <Zap size={12} />
                                    Master Quest Available
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">The Personal Shield</h2>
                                <p className="text-emerald-100/70 text-lg max-w-2xl leading-relaxed font-medium">
                                    Your environmental data is just the foundation. Integrate your lifestyle patterns to unlock a <span className="text-emerald-400 font-bold">100% Accurate Resilience Score</span> and personalized protection plan.
                                </p>
                            </div>
                            <div className="shrink-0 group">
                                <Link
                                    to="/assessment"
                                    className="px-10 py-5 bg-white text-emerald-900 font-black rounded-2xl hover:bg-emerald-50 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.3)] transform hover:-translate-y-1 flex items-center gap-3 uppercase tracking-widest text-sm"
                                >
                                    Start Master Quest
                                    <Activity size={20} className="group-hover:scale-125 transition-transform" />
                                </Link>
                                <p className="text-center mt-4 text-[10px] font-black uppercase tracking-widest text-emerald-400/60">
                                    Rewards: +500 XP • Epic Badge
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;
