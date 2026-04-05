import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { themes } from '../../config/locationThemes';
import { Leaf, LogOut, Menu, X, Globe, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { theme, countryName, setThemeOverride } = useTheme();
    const navigate = useNavigate();
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

    return (
        <header 
            className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 ${
                scrolled ? 'py-4 bg-black/40 backdrop-blur-xl border-b border-white/5' : 'py-8 bg-transparent'
            }`}
        >
            <div className="container mx-auto px-6 max-w-7xl flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2 group">
                    <Leaf size={24} className="text-[var(--color-primary)] fill-current" />
                    <span className="text-xl font-bold tracking-tight text-white">
                        ChildSafe<span className="opacity-60 font-light">Enviro</span>
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    {user ? (
                        <>
                            <div className="flex items-center gap-8">
                                {navLinks.map((link) => (
                                    <Link 
                                        key={link.path}
                                        to={link.path} 
                                        className={`text-sm font-medium transition-all ${
                                            location.pathname === link.path ? 'text-white' : 'text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                            
                            <div className="h-4 w-px bg-white/10"></div>
                            
                            <div className="relative">
                                <button 
                                    onClick={() => setShowThemeMenu(!showThemeMenu)}
                                    className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-all uppercase tracking-widest"
                                >
                                    <Globe size={14} />
                                    {theme.greeting.flag} {countryName}
                                </button>
                                <AnimatePresence>
                                    {showThemeMenu && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute top-full right-0 mt-4 w-48 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-xl p-2 shadow-2xl"
                                        >
                                            {Object.values(themes).map((t) => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => {
                                                        setThemeOverride(t.countryCode === 'default' ? null : t.countryCode);
                                                        setShowThemeMenu(false);
                                                    }}
                                                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 text-sm font-medium transition-colors"
                                                >
                                                    <span className="text-slate-400">{t.name}</span>
                                                    <span>{t.greeting.flag}</span>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <button 
                                onClick={logout}
                                className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
                            >
                                <LogOut size={18} />
                            </button>
                        </>
                    ) : (
                        <div className="flex items-center gap-8">
                            <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Sign In</Link>
                            <Link to="/signup" className="text-sm font-bold px-6 py-2 border border-white/20 rounded-full hover:bg-white hover:text-black transition-all">Sign Up</Link>
                        </div>
                    )}
                </nav>

                <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>
        </header>
    );
};

export default Navbar;
