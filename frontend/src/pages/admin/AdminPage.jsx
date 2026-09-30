import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ShieldAlert, Users, ClipboardList, FileText, Loader,
    ChevronLeft, ChevronRight, ExternalLink, Lock, CheckCircle2, Gauge
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'dakshsingh791@gmail.com';
const PAGE_SIZE = 20;

const TABS = [
    { id: 'users', label: 'Users', icon: Users, endpoint: '/admin/users' },
    { id: 'lifestyle', label: 'Lifestyle Data', icon: ClipboardList, endpoint: '/admin/lifestyle' },
    { id: 'reports', label: 'Health Reports', icon: FileText, endpoint: '/admin/health-reports' },
];

const formatDate = (iso) => {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
        return iso;
    }
};

const StatCard = ({ label, value, icon: Icon }) => (
    <div className="glass-panel !p-6 border-white/5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 flex items-center justify-center shrink-0">
            <Icon className="text-[var(--color-primary)]" size={20} />
        </div>
        <div>
            <p className="text-2xl font-black text-white leading-none">{value ?? '—'}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">{label}</p>
        </div>
    </div>
);

const AdminPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

    const [activeTab, setActiveTab] = useState('users');
    const [offset, setOffset] = useState(0);
    const [data, setData] = useState({ total: 0, items: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        if (!isAdmin) return;
        api.get('/admin/stats').then(({ data }) => setStats(data)).catch(() => {});
    }, [isAdmin]);

    const load = useCallback(() => {
        if (!isAdmin) return;
        const tab = TABS.find(t => t.id === activeTab);
        setLoading(true);
        setError(null);
        api.get(tab.endpoint, { params: { limit: PAGE_SIZE, offset } })
            .then(({ data }) => setData(data))
            .catch(() => setError('Failed to load this data. Check that the backend is running and you are signed in as the admin account.'))
            .finally(() => setLoading(false));
    }, [activeTab, offset, isAdmin]);

    useEffect(() => { load(); }, [load]);

    useEffect(() => { setOffset(0); }, [activeTab]);

    if (!isAdmin) {
        return (
            <div className="min-h-screen pt-32 pb-20 px-6 flex justify-center items-start">
                <div className="glass-panel !p-16 text-center max-w-md border-rose-500/20">
                    <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldAlert className="text-rose-400" size={28} />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-3">Access Restricted</h1>
                    <p className="text-slate-400 leading-relaxed mb-8">
                        The admin CMS is only available to the platform administrator.
                    </p>
                    <button onClick={() => navigate('/dashboard')} className="btn-modern !rounded-full !px-10 !py-3 font-bold">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const totalPages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
    const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

    return (
        <div className="min-h-screen pt-32 pb-20 px-6 overflow-x-hidden">
            <div className="max-w-6xl mx-auto">
                <div className="mb-12">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 mb-4">
                        <ShieldAlert size={14} className="text-[var(--color-primary)]" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Admin CMS</span>
                    </motion.div>
                    <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                        Database Console
                    </motion.h1>
                </div>

                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                        <StatCard label="Total Users" value={stats.total_users} icon={Users} />
                        <StatCard label="Lifestyle Records" value={stats.total_lifestyle_records} icon={ClipboardList} />
                        <StatCard label="Health Reports" value={stats.total_reports} icon={FileText} />
                        <StatCard label="Paid Reports" value={stats.paid_reports} icon={Gauge} />
                    </div>
                )}

                <div className="flex gap-2 mb-8 border-b border-white/10">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-3 text-sm font-bold transition-all border-b-2 -mb-px ${
                                    activeTab === tab.id
                                        ? 'text-white border-[var(--color-primary)]'
                                        : 'text-slate-500 border-transparent hover:text-slate-300'
                                }`}
                            >
                                <Icon size={16} /> {tab.label}
                            </button>
                        );
                    })}
                </div>

                {loading && (
                    <div className="flex flex-col items-center justify-center py-32 gap-4 text-slate-400">
                        <Loader className="animate-spin text-[var(--color-primary)]" size={32} />
                        <p>Loading...</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-2xl text-rose-200 text-sm font-medium">
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <>
                        {activeTab === 'users' && (
                            <div className="glass-panel !p-0 overflow-hidden border-white/5">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-white/10 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                                <th className="px-6 py-4">Email</th>
                                                <th className="px-6 py-4">Username</th>
                                                <th className="px-6 py-4">Provider</th>
                                                <th className="px-6 py-4">Reports</th>
                                                <th className="px-6 py-4">Joined</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.items.map(u => (
                                                <tr key={u.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                                                    <td className="px-6 py-4 text-white font-medium">{u.email}</td>
                                                    <td className="px-6 py-4 text-slate-400">{u.username}</td>
                                                    <td className="px-6 py-4 text-slate-400 capitalize">{u.auth_provider}</td>
                                                    <td className="px-6 py-4 text-slate-400">{u.report_count}</td>
                                                    <td className="px-6 py-4 text-slate-500">{formatDate(u.created_at)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'lifestyle' && (
                            <div className="glass-panel !p-0 overflow-hidden border-white/5">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-white/10 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                                <th className="px-6 py-4">Name</th>
                                                <th className="px-6 py-4">User</th>
                                                <th className="px-6 py-4">Age</th>
                                                <th className="px-6 py-4">Smoking</th>
                                                <th className="px-6 py-4">Activity</th>
                                                <th className="px-6 py-4">Work Env</th>
                                                <th className="px-6 py-4">Submitted</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.items.map(r => (
                                                <tr key={r.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                                                    <td className="px-6 py-4 text-white font-medium">{r.name || '—'}</td>
                                                    <td className="px-6 py-4 text-slate-400">{r.user_email || 'Anonymous'}</td>
                                                    <td className="px-6 py-4 text-slate-400">{r.age_range || '—'}</td>
                                                    <td className="px-6 py-4 text-slate-400 capitalize">{r.smoking_status || '—'}</td>
                                                    <td className="px-6 py-4 text-slate-400 capitalize">{(r.activity_level || '—').replace('_', ' ')}</td>
                                                    <td className="px-6 py-4 text-slate-400 capitalize">{r.work_environment || '—'}</td>
                                                    <td className="px-6 py-4 text-slate-500">{formatDate(r.created_at)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'reports' && (
                            <div className="glass-panel !p-0 overflow-hidden border-white/5">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-white/10 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                                <th className="px-6 py-4">User</th>
                                                <th className="px-6 py-4">Location</th>
                                                <th className="px-6 py-4">Risk</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4">Generated</th>
                                                <th className="px-6 py-4"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.items.map(r => (
                                                <tr key={r.report_id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                                                    <td className="px-6 py-4 text-white font-medium">{r.user_email || 'Anonymous'}</td>
                                                    <td className="px-6 py-4 text-slate-400">{r.location_name || '—'}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                                                            r.risk_level === 'high' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                                            r.risk_level === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                                            'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                        }`}>
                                                            {r.risk_level} ({r.risk_score.toFixed(0)})
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-400">
                                                        {r.is_paid ? (
                                                            <span className="flex items-center gap-1.5 text-emerald-400"><CheckCircle2 size={14} /> Paid</span>
                                                        ) : (
                                                            <span className="flex items-center gap-1.5 text-slate-500"><Lock size={14} /> Unpaid</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-500">{formatDate(r.created_at)}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        {r.has_full_data ? (
                                                            <button
                                                                onClick={() => navigate(`/report/${r.report_id}`)}
                                                                className="text-[var(--color-primary)] hover:brightness-110 flex items-center gap-1.5 text-xs font-bold ml-auto"
                                                            >
                                                                View <ExternalLink size={13} />
                                                            </button>
                                                        ) : (
                                                            <span className="text-slate-700 text-xs">Unavailable</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between mt-6 text-sm text-slate-500">
                            <span>{data.total} total &middot; page {currentPage} of {totalPages}</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setOffset(o => Math.max(0, o - PAGE_SIZE))}
                                    disabled={offset === 0}
                                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 disabled:opacity-30 hover:bg-white/10 transition-all"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={() => setOffset(o => o + PAGE_SIZE)}
                                    disabled={offset + PAGE_SIZE >= data.total}
                                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 disabled:opacity-30 hover:bg-white/10 transition-all"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminPage;
