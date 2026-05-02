import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { themes } from '../../config/locationThemes';
import { Leaf, LogOut, Menu, X, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { theme, countryName, setThemeOverride } = useTheme();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [showThemeMenu, setShowThemeMenu] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Assessment', path: '/assessment' },
        { name: 'Report', path: '/report' },
    ];

    const handleReportClick = (e) => {
        const lifestyleId = localStorage.getItem('lifestyleId');
        if (!lifestyleId) {
            e.preventDefault();
            alert('complete the assessment first');
        }
    };

    return (
        <header 
            className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-1000 ${
                scrolled ? 'py-4 bg-black/40 backdrop-blur-2xl border-b border-white/5' : 'py-10 bg-transparent'
            }`}
        >
            <div className="container mx-auto px-6 max-w-7xl flex justify-between items-center">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-[var(--color-primary)]/50 transition-all duration-500">
                        <Leaf size={20} className="text-[var(--color-primary)] fill-current" />
                    </div>
                    <span className="text-lg font-bold uppercase tracking-[0.2em] text-white">
                        Childsafe<span className="opacity-40 font-light">environs</span>
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-12">
                    {user ? (
                        <>
                            <div className="flex items-center gap-10">
                                {navLinks.map((link) => (
                                    <Link 
                                        key={link.path}
                                        to={link.path} 
                                        onClick={link.path === '/report' ? handleReportClick : undefined}
                                        className={`nav-link ${location.pathname === link.path ? 'text-white' : ''}`}
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                            
                            <div className="h-4 w-px bg-white/10" />
                            
                            <div className="relative">
                                <button 
                                    onClick={() => setShowThemeMenu(!showThemeMenu)}
                                    className="flex items-center gap-3 text-[10px] font-bold text-slate-500 hover:text-white transition-all uppercase tracking-[0.3em]"
                                >
                                    <Globe size={14} className="text-[var(--color-primary)]" />
                                    {theme.greeting.flag} {countryName}
                                </button>
                                <AnimatePresence>
                                    {showThemeMenu && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                            className="absolute top-full right-0 mt-6 w-56 bg-black/90 backdrop-blur-3xl border border-white/10 rounded-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
                                        >
                                            <div className="px-4 py-3 mb-1 border-b border-white/5">
                                                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">Select Region</p>
                                            </div>
                                            {Object.values(themes).map((t) => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => {
                                                        setThemeOverride(t.countryCode === 'default' ? null : t.countryCode);
                                                        setShowThemeMenu(false);
                                                    }}
                                                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl hover:bg-white/5 text-[11px] font-bold uppercase tracking-wider transition-all group"
                                                >
                                                    <span className="text-slate-400 group-hover:text-white">{t.name}</span>
                                                    <span>{t.greeting.flag}</span>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <button 
                                onClick={logout}
                                className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                            >
                                <LogOut size={18} strokeWidth={1.5} />
                            </button>
                        </>
                    ) : (
                        <div className="flex items-center gap-10">
                            <Link to="/login" className="nav-link">Sign In</Link>
                            <Link 
                                to="/signup" 
                                className="text-[10px] font-bold uppercase tracking-[0.3em] px-8 py-3 bg-white text-black rounded-full hover:bg-[var(--color-primary)] hover:text-white transition-all shadow-xl shadow-white/5"
                            >
                                Get Started
                            </Link>
                        </div>
                    )}
                </nav>

                <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>
            
            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-black/95 backdrop-blur-3xl border-b border-white/5 overflow-hidden"
                    >
                        <div className="flex flex-col p-8 gap-6">
                             {navLinks.map((link) => (
                                <Link 
                                    key={link.path}
                                    to={link.path} 
                                    onClick={() => setIsOpen(false)}
                                    className="text-xl font-bold uppercase tracking-widest text-slate-400"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            {user ? (
                                <button onClick={logout} className="text-xl font-bold uppercase tracking-widest text-rose-500 text-left">Logout</button>
                            ) : (
                                <>
                                    <Link to="/login" onClick={() => setIsOpen(false)} className="text-xl font-bold uppercase tracking-widest">Sign In</Link>
                                    <Link to="/signup" onClick={() => setIsOpen(false)} className="text-xl font-bold uppercase tracking-widest text-[var(--color-primary)]">Sign Up</Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Navbar;
