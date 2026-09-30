import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton';

const LoginPage = () => {
    const [error, setError] = useState('');

    return (
        <div className="auth-container">
            <motion.div
                className="glass-panel w-full max-w-[460px] border-[var(--color-border)] shadow-3xl"
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
                            className="w-20 h-20 bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-secondary)] rounded-[2.5rem] mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-[var(--color-glow)]"
                        >
                            <ShieldCheck className="text-white w-10 h-10" />
                        </motion.div>

                        <motion.h2
                            className="auth-title-modern text-[var(--color-text)]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            style={{ fontFamily: 'var(--font-heading)' }}
                        >
                            Welcome Back
                        </motion.h2>
                        <motion.p
                            className="auth-subtitle-modern text-[var(--color-text-muted)]"
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

                    <GoogleSignInButton onError={setError} />

                    <motion.div
                        className="mt-10 text-center text-[var(--color-text-muted)]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        <p className="font-medium">New to Childsafeenvirons? Signing in with Google creates your account automatically.</p>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
