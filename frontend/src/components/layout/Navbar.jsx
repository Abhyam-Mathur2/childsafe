import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Leaf, LogOut, User, Menu, X, LayoutDashboard, ClipboardList, FileText, Zap, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { user, logout, xp, level } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const nextLevelThreshold = level * 1000;
    const progress = (xp / nextLevelThreshold) * 100;

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navLinks = [
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
        { name: 'Assessment', path: '/assessment', icon: <ClipboardList size={18} /> },
        { name: 'Report', path: '/report', icon: <FileText size={18} /> },
    ];

    const isLanding = location.pathname === '/';

    return (
        <header 
            className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
                scrolled || !isLanding 
                ? 'py-4 bg-slate-950/80 backdrop-blur-2xl border-b border-white/5 shadow-2xl' 
                : 'py-8 bg-transparent'
            }`}
        >
            <div className="container mx-auto px-6 max-w-7xl flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-2xl shadow-emerald-500/20 group-hover:rotate-12 transition-transform duration-500">
                        <Leaf size={28} className="fill-current" />
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-white group-hover:text-emerald-400 transition-colors duration-300">
                        ChildSafe<span className="text-emerald-500">Enviro</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-10">
                    {user ? (
                        <>
                            <div className="flex items-center gap-8">
                                {navLinks.map((link) => (
                                     <Link 
                                        key={link.path}
                                        to={link.path} 
                                        className={`relative text-sm font-semibold tracking-wide transition-all duration-300 flex items-center gap-2 ${
                                            location.pathname === link.path 
                                                ? 'text-emerald-400' 
                                                : 'text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        {link.name}
                                        {location.pathname === link.path && (
                                            <motion.div 
                                                layoutId="nav-underline"
                                                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-emerald-400 rounded-full"
                                            />
                                        )}
                                    </Link>
                                ))}
                            </div>
                            
                            <div className="h-6 w-px bg-white/10"></div>
                            
                            {/* Premium User Profile */}
                            <div className="flex items-center gap-6">
                                <div className="flex flex-col items-end">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Level {level}</span>
                                        <div className="w-24 h-1.5 rounded-full bg-white/5 overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                            />
                                        </div>
                                    </div>
                                    <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                                        <Zap size={12} className="fill-current" />
                                        {xp} XP
                                    </div>
                                </div>

                                <div className="relative group">
                                    <button 
                                        className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] transition-all duration-300"
                                    >
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold shadow-lg">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-semibold text-slate-200">{user.name}</span>
                                        <ChevronDown size={14} className="text-slate-500 group-hover:rotate-180 transition-transform duration-300" />
                                    </button>
                                    
                                    {/* DROPDOWN MENU - Visible on Hover or Click */}
                                    <div className="absolute top-full right-0 mt-2 w-48 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto">
                                        <div className="glass-card p-2 !rounded-2xl border border-white/10 shadow-2xl">
                                            <div className="px-4 py-2 border-b border-white/5 mb-1">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Signed in as</p>
                                                <p className="text-xs font-semibold text-white truncate">{user.email}</p>
                                            </div>
                                            <button 
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                                            >
                                                <LogOut size={16} /> Logout
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-6">
                            <Link 
                                to="/login" 
                                className="text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                            >
                                Sign In
                            </Link>
                            <Link 
                                to="/signup" 
                                className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-2xl shadow-xl shadow-emerald-900/20 transition-all duration-300 transform hover:-translate-y-1 active:scale-95"
                            >
                                Sign Up
                            </Link>
                        </div>
                    )}
                </nav>

                {/* Mobile Trigger */}
                <button 
                    className="md:hidden w-12 h-12 flex items-center justify-center rounded-2xl bg-white/[0.03] border border-white/5 text-white"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="md:hidden absolute top-full left-0 right-0 p-6"
                    >
                        <div className="glass-panel !p-6 shadow-2xl">
                            {user ? (
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-3xl mb-2">
                                        <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-bold text-2xl shadow-xl">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-xl font-bold text-white">{user.name}</div>
                                            <div className="text-xs text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                                <Zap size={10} className="fill-current" /> Level {level}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {navLinks.map((link) => (
                                        <Link 
                                            key={link.path}
                                            to={link.path}
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-4 px-5 py-4 rounded-2xl text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all border border-transparent hover:border-emerald-500/20"
                                        >
                                            {link.icon}
                                            <span className="font-semibold">{link.name}</span>
                                        </Link>
                                    ))}
                                    
                                    <button 
                                        onClick={handleLogout}
                                        className="flex items-center gap-4 px-5 py-4 rounded-2xl text-rose-400 hover:bg-rose-500/10 transition-all mt-2 border border-transparent hover:border-rose-500/20"
                                    >
                                        <LogOut size={18} />
                                        <span className="font-semibold">Sign Out</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    <Link 
                                        to="/login"
                                        onClick={() => setIsOpen(false)}
                                        className="w-full py-4 text-center rounded-2xl font-bold text-slate-300 bg-white/5 border border-white/10"
                                    >
                                        Sign In
                                    </Link>
                                    <Link 
                                        to="/signup"
                                        onClick={() => setIsOpen(false)}
                                        className="w-full py-4 text-center rounded-2xl font-bold text-white bg-emerald-600 shadow-xl"
                                    >
                                        Create Account
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Navbar;
