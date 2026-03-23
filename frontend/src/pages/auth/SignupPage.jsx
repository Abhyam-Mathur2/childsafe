import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Loader, Leaf, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import VideoBackground from '../../components/ui/VideoBackground';

const SignupPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signup(name, email, password);
            setTimeout(() => navigate('/dashboard'), 500);
        } catch (err) {
            setError('Failed to create account. Please try again with a different email.');
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <VideoBackground opacity={0.4} />

            <motion.div
                className="glass-panel w-full max-w-[500px]"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className="w-full">
                    <div className="auth-header-modern">
                        <motion.div
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
                            className="w-20 h-20 bg-emerald-600 rounded-full mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-emerald-500/30"
                        >
                            <Leaf size={32} className="text-white fill-current" />
                        </motion.div>

                        <motion.h2
                            className="auth-title-modern"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            Join the Network
                        </motion.h2>
                        <motion.p
                            className="auth-subtitle-modern"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            Start your journey toward a safer environment for your children
                        </motion.p>
                    </div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                className="bg-rose-500/10 border border-rose-500/20 text-rose-200 p-4 rounded-2xl text-sm mb-8 text-center"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="input-group-modern group">
                            <User className="input-icon-modern" size={20} />
                            <input
                                type="text"
                                className="input-field-modern"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group-modern group">
                            <Mail className="input-icon-modern" size={20} />
                            <input
                                type="email"
                                className="input-field-modern"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group-modern group">
                            <Lock className="input-icon-modern" size={20} />
                            <input
                                type="password"
                                className="input-field-modern"
                                placeholder="Create Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>

                        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 mb-2">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="text-emerald-500 mt-0.5 shrink-0" size={16} />
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    By signing up, you agree to our <span className="text-emerald-400 cursor-pointer">Terms of Service</span> and <span className="text-emerald-400 cursor-pointer">Privacy Policy</span>.
                                </p>
                            </div>
                        </div>

                        <motion.button
                            type="submit"
                            className="btn-modern group mt-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader className="animate-spin mx-auto" size={24} />
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    Create Account <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </motion.button>
                    </form>

                    <motion.div
                        className="mt-10 text-center text-slate-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                    >
                        <p>Already have an account? <Link to="/login" className="modern-link font-bold">Sign in here</Link></p>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default SignupPage;
