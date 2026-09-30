import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton';

const SignupPage = () => {
    const [error, setError] = useState('');

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

                    <p className="text-center text-xs text-[var(--color-text-muted)] mb-6 leading-relaxed">
                        By continuing, you agree to our Terms of Service and Privacy Policy.
                    </p>

                    <GoogleSignInButton onError={setError} />

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
