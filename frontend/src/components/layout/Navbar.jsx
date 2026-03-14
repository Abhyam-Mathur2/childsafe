import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Leaf, LogOut, User, Menu, X, LayoutDashboard, ClipboardList, FileText, Zap } from 'lucide-react';
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
            if (window.scrollY > 20) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
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
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-black/30 backdrop-blur-xl shadow-lg border-b border-white/10 ${
                scrolled || !isLanding ? 'py-3' : 'py-5'
            }`}
        >
            <div className="container mx-auto px-6 max-w-7xl flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="p-2 rounded-xl transition-all group-hover:rotate-12 bg-emerald-600 text-white shadow-emerald-500/30 shadow-lg">
                        <Leaf size={24} />
                    </div>
                    <span className="text-xl font-black tracking-tighter text-white">
                        ChildSafeEnviro
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                    {user ? (
                        <>
                            <div className="flex items-center gap-6">
                                {navLinks.map((link) => (
                                     <Link 
                                        key={link.path}
                                        to={link.path} 
                                        className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all hover:-translate-y-0.5 ${
                                            location.pathname === link.path 
                                                ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]' 
                                                : 'text-white/80 hover:text-white'
                                        }`}
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                            
                            <div className="h-8 w-px bg-white/10 mx-2"></div>
                            
                            {/* Gamified User Stats */}
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col items-end gap-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Level {level}</span>
                                        <div className="w-32 h-1.5 rounded-full overflow-hidden bg-white/10">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                                            ></motion.div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                                        <Zap size={12} className="text-yellow-400 fill-yellow-400" />
                                        {xp} XP
                                    </div>
                                </div>

                                <div className="relative group">
                                    <button className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-2xl transition-all border bg-white/10 border-white/10 text-white hover:bg-white/20">
                                        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-emerald-500/30">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-bold text-sm">{user.name}</span>
                                    </button>
                                    
                                    {/* Dropdown/Logout Tooltip */}
                                    <button 
                                        onClick={handleLogout}
                                        className="absolute -bottom-12 right-0 glass-panel !p-2 !rounded-xl text-emerald-400 hover:text-emerald-300 text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all flex items-center gap-2 border border-emerald-500/30"
                                    >
                                        <LogOut size={14} /> Logout
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link 
                                to="/login" 
                                className="text-xs font-black uppercase tracking-widest transition-colors text-white hover:text-emerald-300"
                            >
                                Log in
                            </Link>
                            <Link 
                                to="/signup" 
                                className="px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all transform hover:-translate-y-1 shadow-xl bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-500/30"
                            >
                                Join Platform
                            </Link>
                        </div>
                    )}
                </nav>

                {/* Mobile Menu Button */}
                <button 
                    className="md:hidden p-2 rounded-xl transition-colors text-white hover:bg-white/10"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden glass-panel !rounded-b-3xl !rounded-t-none border-b border-white/10 overflow-hidden shadow-2xl !p-6"
                    >
                        <div className="flex flex-col gap-4">
                            {user ? (
                                <>
                                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl mb-2 border border-white/10">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-500/30">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-lg font-black text-white tracking-tight">{user.name}</div>
                                            <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                                                <Zap size={10} fill="currentColor" /> Level {level}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {navLinks.map((link) => (
                                        <Link 
                                            key={link.path}
                                            to={link.path}
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-4 px-4 py-4 rounded-2xl text-emerald-100 hover:bg-white/10 hover:text-white transition-all font-black uppercase tracking-widest text-xs border border-transparent hover:border-white/20"
                                        >
                                            {link.icon}
                                            {link.name}
                                        </Link>
                                    ))}
                                    
                                    <button 
                                        onClick={() => { handleLogout(); setIsOpen(false); }}
                                        className="flex items-center gap-4 px-4 py-4 rounded-2xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all mt-2 font-black uppercase tracking-widest text-xs border border-transparent hover:border-red-500/20"
                                    >
                                        <LogOut size={18} />
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <Link 
                                        to="/login"
                                        onClick={() => setIsOpen(false)}
                                        className="w-full py-4 text-center rounded-2xl font-black uppercase tracking-widest text-xs text-white hover:bg-white/10 border border-white/20"
                                    >
                                        Log in
                                    </Link>
                                    <Link 
                                        to="/signup"
                                        onClick={() => setIsOpen(false)}
                                        className="w-full py-4 text-center rounded-2xl font-black uppercase tracking-widest text-xs text-white bg-emerald-600 hover:bg-emerald-500 shadow-xl shadow-emerald-500/30"
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
