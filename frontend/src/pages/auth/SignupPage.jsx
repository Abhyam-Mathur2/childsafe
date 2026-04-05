import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Loader, Leaf, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
            <motion.div
                className="glass-panel w-full max-w-[500px] border-[var(--color-border)] shadow-3xl"
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
                            className="w-20 h-20 bg-[var(--color-primary)] rounded-[2.5rem] mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-[var(--color-glow)]"
                        >
                            <Leaf size={32} className="text-white fill-current" />
                        </motion.div>

                        <motion.h2
                            className="auth-title-modern text-[var(--color-text)]"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            style={{ fontFamily: 'var(--font-heading)' }}
                        >
                            Join the Network
                        </motion.h2>
                        <motion.p
                            className="auth-subtitle-modern text-[var(--color-text-muted)]"
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
                                className="input-field-modern !bg-[var(--color-surface)] !border-[var(--color-border)]"
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
                                className="input-field-modern !bg-[var(--color-surface)] !border-[var(--color-border)]"
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
                                className="input-field-modern !bg-[var(--color-surface)] !border-[var(--color-border)]"
                                placeholder="Create Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>

                        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 mb-2">
                            <div className="flex items-start gap-4">
                                <CheckCircle2 className="text-[var(--color-primary)] mt-0.5 shrink-0" size={18} />
                                <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed font-bold uppercase tracking-wider">
                                    By signing up, you agree to our <span className="text-[var(--color-primary)] cursor-pointer">Terms of Service</span> and <span className="text-[var(--color-primary)] cursor-pointer">Privacy Policy</span>.
                                </p>
                            </div>
                        </div>

                        <motion.button
                            type="submit"
                            className="btn-modern group !rounded-2xl mt-4"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader className="animate-spin mx-auto text-white" size={28} />
                            ) : (
                                <span className="flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-xs">
                                    Create Account <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                                </span>
                            )}
                        </motion.button>
                    </form>

                    <motion.div
                        className="mt-12 text-center text-[var(--color-text-muted)]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                    >
                        <p className="font-medium">Already have an account? <Link to="/login" className="modern-link font-black uppercase tracking-widest text-xs">Sign in here</Link></p>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default SignupPage;
