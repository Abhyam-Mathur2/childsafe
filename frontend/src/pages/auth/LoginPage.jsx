import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import VideoBackground from '../../components/ui/VideoBackground';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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
            setTimeout(() => navigate('/dashboard'), 500);
        } catch (err) {
            setError('The email or password you entered is incorrect.');
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <VideoBackground opacity={0.4} />

            <motion.div
                className="glass-panel w-full max-w-[460px]"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className="w-full">
                    <div className="auth-header-modern">
                        <motion.div
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
                            className="w-20 h-20 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-[2rem] mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-emerald-500/30"
                        >
                            <ShieldCheck className="text-white w-10 h-10" />
                        </motion.div>

                        <motion.h2
                            className="auth-title-modern"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
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
                            Securely sign in to your health dashboard
                        </motion.p>
                    </div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                className="bg-rose-500/10 border border-rose-500/20 text-rose-200 p-4 rounded-2xl text-sm mb-8 text-center"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="input-group-modern">
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

                        <div className="input-group-modern">
                            <Lock className="input-icon-modern" size={20} />
                            <input
                                type={showPassword ? "text" : "password"}
                                className="input-field-modern"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-400 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <div className="flex justify-end">
                            <button type="button" className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
                                Forgot password?
                            </button>
                        </div>

                        <motion.button
                            type="submit"
                            className="btn-modern group"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader className="animate-spin mx-auto" size={24} />
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </motion.button>
                    </form>

                    <motion.div
                        className="mt-10 text-center text-slate-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        <p>New to ChildSafeEnviro? <Link to="/signup" className="modern-link">Create an account</Link></p>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
