import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            // Small delay for exit animation
            setTimeout(() => navigate('/dashboard'), 500);
        } catch (err) {
            setError('Failed to login. Please check your credentials.');
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            {/* Ambient Background Elements */}
            <div className="orb orb-1"></div>
            <div className="orb orb-2"></div>
            <div className="orb orb-3"></div>

            <motion.div
                className="glass-panel"
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className="glass-content w-full max-w-[420px]">
                    <div className="auth-header-modern">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-emerald-500/30"
                        >
                            <ShieldCheck className="text-white w-9 h-9" />
                        </motion.div>

                        <motion.h2
                            className="auth-title-modern"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            Welcome Back
                        </motion.h2>
                        <motion.p
                            className="auth-subtitle-modern"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            Sign in to access your environmental data
                        </motion.p>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                className="bg-red-500/10 border border-red-500/20 text-red-200 p-3 rounded-xl text-sm mb-6 text-center"
                                initial={{ opacity: 0, height: 0, y: -10 }}
                                animate={{ opacity: 1, height: 'auto', y: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <motion.div
                            className="input-group-modern"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <Mail className="input-icon-modern" size={20} />
                            <input
                                type="email"
                                className="input-field-modern"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </motion.div>

                        <motion.div
                            className="input-group-modern"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <Lock className="input-icon-modern" size={20} />
                            <input
                                type="password"
                                className="input-field-modern"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </motion.div>

                        <motion.button
                            type="submit"
                            className="btn-modern"
                            disabled={loading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                        >
                            {loading ? <Loader className="spin mx-auto" size={24} /> : "Sign In"}
                        </motion.button>
                    </form>

                    <motion.div
                        className="mt-8 text-center text-sm text-gray-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                    >
                        <p>Don't have an account? <Link to="/signup" className="modern-link">Create Account</Link></p>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
