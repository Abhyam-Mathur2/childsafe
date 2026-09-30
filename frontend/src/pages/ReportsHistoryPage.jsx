import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, MapPin, Calendar, Lock, CheckCircle2, Zap, Loader, AlertCircle, ChevronRight } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const RISK_STYLES = {
    low: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    medium: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    high: { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
};

const formatDate = (iso) => {
    if (!iso) return 'Unknown date';
    try {
        return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
        return iso;
    }
};

const ReportsHistoryPage = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        let cancelled = false;
        api.get('/health-reports/mine')
            .then(({ data }) => { if (!cancelled) setReports(data); })
            .catch(() => { if (!cancelled) setError('Failed to load your report history.'); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    return (
        <div className="min-h-screen pt-32 pb-20 px-6 overflow-x-hidden">
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-2 mb-4"
                        >
                            <FileText size={14} className="text-[var(--color-primary)]" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">
                                Your Report Archive
                            </span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-bold tracking-tight text-white"
                        >
                            Welcome back, {user?.name?.split(' ')[0] || 'there'}
                        </motion.h1>
                        <p className="text-slate-400 mt-4 text-lg">
                            Here's every health risk report generated for your account.
                        </p>
                    </div>

                    <Link
                        to="/assessment"
                        className="btn-modern !px-10 !py-4 !rounded-full font-bold group shrink-0"
                    >
                        New Assessment
                        <Zap size={18} className="fill-current text-white group-hover:scale-110 transition-transform" />
                    </Link>
                </div>

                {loading && (
                    <div className="flex flex-col items-center justify-center py-32 gap-4 text-slate-400">
                        <Loader className="animate-spin text-[var(--color-primary)]" size={32} />
                        <p>Loading your reports...</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-2xl flex items-center gap-4">
                        <AlertCircle className="text-rose-500 shrink-0" size={24} />
                        <p className="text-rose-200 text-sm font-medium">{error}</p>
                    </div>
                )}

                {!loading && !error && reports.length === 0 && (
                    <div className="glass-panel text-center py-32 border-dashed border-white/10 opacity-60">
                        <FileText size={64} className="mx-auto mb-8 text-slate-700" />
                        <h2 className="text-2xl font-bold mb-4">No Reports Yet</h2>
                        <p className="text-slate-500 max-w-md mx-auto mb-10 text-lg">
                            You haven't generated a health risk assessment yet. Start one to see it here next time you sign in.
                        </p>
                        <Link to="/assessment" className="btn-modern !rounded-full !px-12 mx-auto !py-4 font-bold inline-flex">
                            Initiate Assessment
                        </Link>
                    </div>
                )}

                {!loading && !error && reports.length > 0 && (
                    <div className="space-y-4">
                        {reports.map((report, i) => {
                            const style = RISK_STYLES[report.risk_level] || RISK_STYLES.medium;
                            return (
                                <motion.button
                                    key={report.report_id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => navigate(`/report/${report.report_id}`)}
                                    className="w-full glass-panel !p-6 md:!p-8 flex items-center justify-between gap-6 text-left border-white/5 hover:border-white/20 transition-all group"
                                >
                                    <div className="flex items-center gap-6 min-w-0">
                                        <div className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center ${style.bg} border ${style.border}`}>
                                            <FileText className={style.text} size={24} />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-lg font-bold text-white truncate">
                                                    {report.location_name || 'Environmental Health Report'}
                                                </h3>
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${style.bg} ${style.text} border ${style.border} shrink-0`}>
                                                    {report.risk_level} risk
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-slate-400">
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar size={14} /> {formatDate(report.created_at)}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    {report.is_paid ? (
                                                        <><CheckCircle2 size={14} className="text-emerald-400" /> Unlocked</>
                                                    ) : (
                                                        <><Lock size={14} /> Locked</>
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight className="text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" size={22} />
                                </motion.button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportsHistoryPage;
