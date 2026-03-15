import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight, ArrowLeft, CheckCircle, Activity, User, Calendar,
    MapPin, Users, Cigarette, Zap, Moon, Brain, Home, Utensils,
    Flame, Stethoscope, Briefcase, Heart, Smile, ShieldCheck, Info,
    Sun, Droplets
} from 'lucide-react';

const AssessmentPage = () => {
    const navigate = useNavigate();
    const { gainXp } = useAuth();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [direction, setDirection] = useState(1); // 1 for next, -1 for back

    const [formData, setFormData] = useState({
        name: '',
        years_at_location: '',
        age_range: '',
        child_age_range: '',
        gender: '',
        smoking_status: '',
        activity_level: '',
        activity_duration: '',
        sleep_hours: '',
        stress_level: '',
        work_environment: '',
        diet_quality: '',
        medical_history: [],
        mental_health_conditions: [],
        cooking_method: '',
        water_source: '',
        uv_index: 5
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOptionSelect = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (value) => {
        setFormData(prev => {
            if (prev.medical_history.includes(value)) {
                return { ...prev, medical_history: prev.medical_history.filter(item => item !== value) };
            } else {
                return { ...prev, medical_history: [...prev.medical_history, value] };
            }
        });
    };

    const handleMentalHealthChange = (value) => {
        setFormData(prev => {
            if (value === 'none') {
                return { ...prev, mental_health_conditions: ['none'] };
            }
            let newConditions = prev.mental_health_conditions.filter(item => item !== 'none');
            if (newConditions.includes(value)) {
                newConditions = newConditions.filter(item => item !== value);
            } else {
                newConditions.push(value);
            }
            return { ...prev, mental_health_conditions: newConditions };
        });
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);

        const mergedMedicalHistory = [...formData.medical_history];
        if (formData.mental_health_conditions) {
            formData.mental_health_conditions.forEach(cond => {
                if (cond !== 'none' && !mergedMedicalHistory.includes(cond)) {
                    mergedMedicalHistory.push(cond);
                }
            });
        }

        const payload = {
            ...formData,
            years_at_location: parseInt(formData.years_at_location) || 0,
            medical_history: mergedMedicalHistory,
            home_environment: {
                cooking_method: formData.cooking_method,
                water_source: formData.water_source,
                uv_index: formData.uv_index,
                activity_duration: formData.activity_duration
            },
            mental_health_conditions: formData.mental_health_conditions.filter(c => c !== 'none')
        };
        delete payload.cooking_method;

        try {
            const response = await api.post('/lifestyle', payload);
            localStorage.setItem('lifestyleId', response.data.id);
            gainXp(500); // Massive XP for finishing
            navigate('/report');
        } catch (error) {
            console.error("Assessment submission error", error);
            alert("Failed to submit assessment. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => {
        gainXp(100); // Small reward for each step
        setDirection(1);
        setStep(prev => prev + 1);
    };
    const prevStep = () => {
        setDirection(-1);
        setStep(prev => prev - 1);
    };

    const isStepValid = () => {
        if (step === 0) return true;
        if (step === 1) return formData.name && formData.years_at_location && formData.age_range && formData.gender;
        if (step === 2) return formData.smoking_status && formData.activity_level && formData.activity_duration && formData.sleep_hours && formData.stress_level;
        if (step === 3) return formData.work_environment && formData.diet_quality && formData.cooking_method;
        if (step === 4) return formData.water_source && formData.uv_index !== undefined;
        return true;
    };

    const progress = step > 0 ? (step / 5) * 100 : 0;

    const variants = {
        enter: (direction) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
            transition: {
                duration: 0.3,
                ease: "easeOut"
            }
        },
        exit: (direction) => ({
            x: direction < 0 ? 50 : -50,
            opacity: 0,
            transition: {
                duration: 0.2
            }
        })
    };

    return (
        <div className="min-h-screen relative z-10 text-white flex justify-center items-center py-20 px-4">
            <motion.div
                layout
                className="w-full max-w-2xl bg-[#093520]/80 backdrop-blur-2xl border border-emerald-500/30 rounded-3xl !p-0 overflow-hidden shadow-[0_0_40px_rgba(4,120,87,0.4)] text-white"
            >
                {/* Progress Header */}
                {step > 0 && (
                    <div className="h-1.5 bg-transparent/10 w-full">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ type: "spring", stiffness: 50, damping: 20 }}
                            className="h-full bg-emerald-500 shadow-[0_0_10px_#34d399]"
                        ></motion.div>
                    </div>
                )}

                <div className="p-8 md:p-12">
                    {/* Navigation Header */}
                    {step > 0 && (
                        <div className="flex justify-between items-center mb-10">
                            <AnimatePresence mode="wait">
                                {step > 1 ? (
                                    <motion.button
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        onClick={prevStep}
                                        className="text-emerald-100/80 hover:text-emerald-300 transition-colors"
                                    >
                                        <ArrowLeft size={24} />
                                    </motion.button>
                                ) : <div className="w-6"></div>}
                            </AnimatePresence>

                            <span className="text-sm font-bold uppercase tracking-widest text-emerald-100/80">
                                Step {step} of 5
                            </span>
                            <div className="w-6"></div>
                        </div>
                    )}

                    <AnimatePresence custom={direction} mode="wait">
                        <motion.div
                            key={step}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                        >
                            {/* Step 0: Intro Screen */}
                            {step === 0 && (
                                <div className="text-center py-8">
                                    <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <ShieldCheck size={40} className="text-emerald-400" />
                                    </div>
                                    <h1 className="text-4xl font-extrabold text-white mb-6 shimmer-text">Welcome to ChildSafeEnviro</h1>
                                    <p className="text-emerald-50 text-lg leading-relaxed mb-8">
                                        ChildSafeEnviro helps parents and caregivers understand how your child's environment, health conditions, and daily habits interact with air quality, UV exposure, temperature, and seasonal changes — so you can make safer decisions every day.
                                    </p>
                                    <div className="bg-transparent/10 text-white border border-white/20 p-4 rounded-xl text-sm mb-8 flex items-start gap-3 text-left">
                                        <Info className="shrink-0 mt-0.5" size={20} />
                                        <p>This assessment takes about 3-5 minutes. Your data is kept private and used solely to generate your personalized environmental health report.</p>
                                    </div>
                                </div>
                            )}
                            {/* Step 1: Personal Profile */}
                            {step === 1 && (
                                <>
                                    <h1 className="text-3xl font-bold text-white text-shadow-sm shimmer-text mb-2 text-center">Let's build your profile</h1>
                                    <p className="text-emerald-100/90 text-center mb-10 text-lg">We use this to customize your environmental risk calculations.</p>

                                    <div className="space-y-6 mb-10">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-emerald-100 flex items-center gap-2">
                                                <User size={16} /> What is your full name?
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Enter name"
                                                className="w-full px-5 py-4 bg-transparent/10 border-white/20 text-white placeholder-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all text-lg"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-emerald-100 flex items-center gap-2">
                                                <MapPin size={16} /> Years at current location?
                                            </label>
                                            <input
                                                type="number"
                                                name="years_at_location"
                                                value={formData.years_at_location}
                                                onChange={handleChange}
                                                placeholder="e.g. 5"
                                                className="w-full px-5 py-4 bg-transparent/10 border-white/20 text-white placeholder-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all text-lg"
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-10">
                                        <label className="block text-xs font-bold text-emerald-100/80 uppercase tracking-wider mb-4">Age group of the child</label>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                            {['0-1', '1-3', '3-12', '13-17', '18-25', '26-35', '36-50', '51-65', '65+'].map((age) => (
                                                <button
                                                    key={age}
                                                    onClick={() => handleOptionSelect('age_range', formData.age_range === age ? '' : age)}
                                                    className={`p-4 rounded-xl border-2 font-semibold transition-all flex flex-col items-center gap-2 ${formData.age_range === age
                                                            ? 'border-green-600 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                                                            : 'border-white/20 bg-transparent/5 text-emerald-100/90 hover:bg-transparent/10 hover:border-emerald-400'
                                                        }`}
                                                >
                                                    <Smile size={20} className={formData.age_range === age ? 'text-emerald-400' : 'text-emerald-100/80'} />
                                                    {age}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mb-10">
                                        <label className="block text-xs font-bold text-emerald-100/80 uppercase tracking-wider mb-4">Your gender</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {['Male', 'Female', 'Other'].map((g) => (
                                                <button
                                                    key={g}
                                                    onClick={() => handleOptionSelect('gender', g.toLowerCase())}
                                                    className={`p-4 rounded-xl border-2 font-semibold transition-all flex flex-col items-center gap-2 ${formData.gender?.toLowerCase() === g.toLowerCase()
                                                            ? 'border-green-600 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                                                            : 'border-white/20 bg-transparent/5 text-emerald-100/90 hover:bg-transparent/10 hover:border-emerald-400'
                                                        }`}
                                                >
                                                    <Users size={20} className={formData.gender?.toLowerCase() === g.toLowerCase() ? 'text-emerald-400' : 'text-emerald-100/80'} />
                                                    {g}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Step 2: Lifestyle */}
                            {step === 2 && (
                                <>
                                    <h1 className="text-3xl font-bold text-white text-shadow-sm shimmer-text mb-2 text-center">Your daily habits</h1>
                                    <p className="text-emerald-100/90 text-center mb-10 text-lg">Lifestyle choices can either protect you or increase your vulnerability.</p>

                                    <div className="mb-10">
                                        <label className="block text-xs font-bold text-emerald-100/80 uppercase tracking-wider mb-4">Smoking Status</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                { id: 'never', label: 'Never', icon: <Smile /> },
                                                { id: 'former', label: 'Former', icon: <CheckCircle /> },
                                                { id: 'current', label: 'Current', icon: <Cigarette /> }
                                            ].map((item) => (
                                                <button
                                                    key={item.id}
                                                    onClick={() => handleOptionSelect('smoking_status', item.id)}
                                                    className={`p-4 rounded-xl border-2 font-semibold transition-all flex flex-col items-center gap-3 ${formData.smoking_status === item.id
                                                            ? 'border-green-600 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                                                            : 'border-white/20 bg-transparent/5 text-emerald-100/90 hover:bg-transparent/10 hover:border-emerald-400'
                                                        }`}
                                                >
                                                    <span className={formData.smoking_status === item.id ? 'text-emerald-400' : 'text-emerald-100/80'}>{item.icon}</span>
                                                    {item.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mb-10">
                                        <label className="block text-xs font-bold text-emerald-100/80 uppercase tracking-wider mb-4">Physical Activity</label>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                            {[
                                                { level: 'sedentary_0', label: 'Sedentary', duration: '0 min', icon: <Zap className="opacity-30" /> },
                                                { level: 'light_30', label: 'Light', duration: '30 min/day', icon: <Zap className="opacity-50" /> },
                                                { level: 'moderate_60', label: 'Moderate', duration: '60 min/day', icon: <Zap className="opacity-75" /> },
                                                { level: 'vigorous_90', label: 'Vigorous', duration: '90+ min/day', icon: <Zap /> }
                                            ].map((item) => (
                                                <button
                                                    key={item.level}
                                                    onClick={() => {
                                                        handleOptionSelect('activity_level', item.level);
                                                        handleOptionSelect('activity_duration', item.duration);
                                                    }}
                                                    className={`p-4 rounded-xl border-2 font-semibold transition-all flex flex-col items-center gap-2 ${formData.activity_level === item.level
                                                            ? 'border-green-600 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                                                            : 'border-white/20 bg-transparent/5 text-emerald-100/90 hover:bg-transparent/10 hover:border-emerald-400'
                                                        }`}
                                                >
                                                    <span className={formData.activity_level === item.level ? 'text-emerald-400' : 'text-emerald-100/80'}>{item.icon}</span>
                                                    <span>{item.label}</span>
                                                    <span className="text-xs text-emerald-100/80 font-normal">{item.duration}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-emerald-100 flex items-center gap-2">
                                                <Moon size={16} /> Average Sleep
                                            </label>
                                            <select
                                                name="sleep_hours"
                                                value={formData.sleep_hours}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-transparent/10 border-white/20 text-white placeholder-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all"
                                            >
                                                <option className="bg-[#093520] text-emerald-50" value="">Duration</option>
                                                <option className="bg-[#093520] text-emerald-50" value="<6">Less than 6h</option>
                                                <option className="bg-[#093520] text-emerald-50" value="6-8">6-8 hours</option>
                                                <option className="bg-[#093520] text-emerald-50" value=">8">8+ hours</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-emerald-100 flex items-center gap-2">
                                                <Brain size={16} /> Stress Level
                                            </label>
                                            <select
                                                name="stress_level"
                                                value={formData.stress_level}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-transparent/10 border-white/20 text-white placeholder-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all"
                                            >
                                                <option className="bg-[#093520] text-emerald-50" value="">Level</option>
                                                <option className="bg-[#093520] text-emerald-50" value="low">Low</option>
                                                <option className="bg-[#093520] text-emerald-50" value="medium">Medium</option>
                                                <option className="bg-[#093520] text-emerald-50" value="high">High</option>
                                            </select>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Step 3: Environment */}
                            {step === 3 && (
                                <>
                                    <h1 className="text-3xl font-bold text-white text-shadow-sm shimmer-text mb-2 text-center">Home & Work</h1>
                                    <p className="text-emerald-100/90 text-center mb-10 text-lg">Where you spend your time significantly affects your exposure levels.</p>

                                    <div className="mb-10">
                                        <label className="block text-xs font-bold text-emerald-100/80 uppercase tracking-wider mb-4">Main Work Environment</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                { id: 'indoor', label: 'Indoor', icon: <Home /> },
                                                { id: 'outdoor', label: 'Outdoor', icon: <Briefcase /> },
                                                { id: 'mixed', label: 'Mixed', icon: <Zap /> }
                                            ].map((item) => (
                                                <button
                                                    key={item.id}
                                                    onClick={() => handleOptionSelect('work_environment', item.id)}
                                                    className={`p-4 rounded-xl border-2 font-semibold transition-all flex flex-col items-center gap-3 ${formData.work_environment === item.id
                                                            ? 'border-green-600 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                                                            : 'border-white/20 bg-transparent/5 text-emerald-100/90 hover:bg-transparent/10 hover:border-emerald-400'
                                                        }`}
                                                >
                                                    <span className={formData.work_environment === item.id ? 'text-emerald-400' : 'text-emerald-100/80'}>{item.icon}</span>
                                                    {item.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mb-10">
                                        <label className="block text-xs font-bold text-emerald-100/80 uppercase tracking-wider mb-4">Diet Quality</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                { id: 'good', label: 'Balanced', icon: <Utensils /> },
                                                { id: 'average', label: 'Mixed', icon: <Utensils className="opacity-60" /> },
                                                { id: 'poor', label: 'Processed', icon: <Utensils className="opacity-40" /> }
                                            ].map((item) => (
                                                <button
                                                    key={item.id}
                                                    onClick={() => handleOptionSelect('diet_quality', item.id)}
                                                    className={`p-4 rounded-xl border-2 font-semibold transition-all flex flex-col items-center gap-3 ${formData.diet_quality === item.id
                                                            ? 'border-green-600 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                                                            : 'border-white/20 bg-transparent/5 text-emerald-100/90 hover:bg-transparent/10 hover:border-emerald-400'
                                                        }`}
                                                >
                                                    <span className={formData.diet_quality === item.id ? 'text-emerald-400' : 'text-emerald-100/80'}>{item.icon}</span>
                                                    {item.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mb-10">
                                        <label className="block text-xs font-bold text-emerald-100/80 uppercase tracking-wider mb-4">Cooking Source</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                { id: 'electric', label: 'Electric', icon: <Zap /> },
                                                { id: 'gas', label: 'Gas', icon: <Flame /> },
                                                { id: 'wood', label: 'Wood', icon: <Flame className="text-amber-800" /> }
                                            ].map((item) => (
                                                <button
                                                    key={item.id}
                                                    onClick={() => handleOptionSelect('cooking_method', item.id)}
                                                    className={`p-4 rounded-xl border-2 font-semibold transition-all flex flex-col items-center gap-3 ${formData.cooking_method === item.id
                                                            ? 'border-green-600 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                                                            : 'border-white/20 bg-transparent/5 text-emerald-100/90 hover:bg-transparent/10 hover:border-emerald-400'
                                                        }`}
                                                >
                                                    <span className={formData.cooking_method === item.id ? 'text-emerald-400' : 'text-emerald-100/80'}>{item.icon}</span>
                                                    {item.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Step 4: Environment & Health */}
                            {step === 4 && (
                                <>
                                    <h1 className="text-3xl font-bold text-white text-shadow-sm shimmer-text mb-2 text-center">Local Environment</h1>
                                    <p className="text-emerald-100/90 text-center mb-10 text-lg">Specific details about your home's surrounding environment.</p>

                                    <div className="mb-10">
                                        <label className="block text-xs font-bold text-emerald-100/80 uppercase tracking-wider mb-4">Primary Water Source</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {[
                                                { id: 'tap', label: 'Tap Water', icon: <Droplets /> },
                                                { id: 'filtered', label: 'Filtered Water', icon: <Droplets className="text-blue-400" /> },
                                                { id: 'bottled', label: 'Bottled Water', icon: <Droplets className="text-teal-400" /> },
                                                { id: 'well', label: 'Well Water', icon: <Droplets className="text-cyan-600" /> }
                                            ].map((item) => (
                                                <button
                                                    key={item.id}
                                                    onClick={() => handleOptionSelect('water_source', item.id)}
                                                    className={`p-4 rounded-xl border-2 font-semibold transition-all flex flex-col items-center gap-3 ${formData.water_source === item.id
                                                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                            : 'border-white/20 bg-transparent/5 text-blue-100/70 hover:bg-transparent/10 hover:border-blue-400'
                                                        }`}
                                                >
                                                    <span className={formData.water_source === item.id ? 'text-blue-600' : 'text-emerald-100/80'}>{item.icon}</span>
                                                    <span className="text-sm text-center">{item.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mb-10 bg-transparent p-6 rounded-2xl border border-white/10 shadow-sm">
                                        <div className="flex justify-between items-center mb-6">
                                            <label className="text-sm font-bold text-emerald-100 flex items-center gap-2">
                                                <Sun size={18} className="text-yellow-500" /> Typical Daily UV Exposure
                                            </label>
                                            <span className="text-2xl font-bold bg-yellow-100 text-yellow-800 w-12 h-12 flex items-center justify-center rounded-xl">
                                                {formData.uv_index}
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="11"
                                            step="1"
                                            value={formData.uv_index}
                                            onChange={(e) => handleOptionSelect('uv_index', parseInt(e.target.value))}
                                            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500 mb-4"
                                        />
                                        <div className="flex justify-between text-xs font-bold text-emerald-100/80 uppercase">
                                            <span>Low (0-2)</span>
                                            <span>Mod (3-5)</span>
                                            <span>High (6-7)</span>
                                            <span>Very High (8-10)</span>
                                            <span>Extreme (11+)</span>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Step 5: Medical */}
                            {step === 5 && (
                                <>
                                    <h1 className="text-3xl font-bold text-white text-shadow-sm shimmer-text mb-2 text-center">Health History</h1>
                                    <p className="text-emerald-100/90 text-center mb-10 text-lg">Pre-existing conditions can make environmental factors more hazardous.</p>

                                    <div className="space-y-3 mb-10">
                                        {[
                                            { id: 'asthma', label: 'Asthma', icon: <Activity /> },
                                            { id: 'copd', label: 'COPD', icon: <Activity /> },
                                            { id: 'heart_disease', label: 'Heart Disease', icon: <Heart /> },
                                            { id: 'diabetes', label: 'Diabetes', icon: <Activity /> },
                                            { id: 'hypertension', label: 'Hypertension', icon: <Activity /> },
                                            { id: 'allergies', label: 'Allergies', icon: <Smile /> },
                                            { id: 'immune_disorder', label: 'Immune Disorder', icon: <ShieldCheck size={20} /> },
                                            { id: 'eczema', label: 'Eczema / Skin Conditions', icon: <Activity /> },
                                            { id: 'cystic_fibrosis', label: 'Cystic Fibrosis', icon: <Activity /> },
                                            { id: 'epilepsy', label: 'Epilepsy / Seizures', icon: <Brain size={20} /> },
                                            { id: 'obesity', label: 'Obesity', icon: <Activity /> },
                                            { id: 'congenital_heart', label: 'Congenital Heart Defect', icon: <Heart /> },
                                            { id: 'premature_birth', label: 'Premature Birth Complications', icon: <Activity /> }
                                        ].map((cond) => (
                                            <button
                                                key={cond.id}
                                                onClick={() => handleCheckboxChange(cond.id)}
                                                className={`w-full p-4 rounded-xl border-2 flex justify-between items-center transition-all ${formData.medical_history.includes(cond.id)
                                                        ? 'border-green-600 bg-emerald-500/20 border border-emerald-500/30 text-green-800'
                                                        : 'border-white/20 bg-transparent/5 text-emerald-50 hover:bg-transparent/10 hover:border-emerald-400'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4 font-bold">
                                                    <span className={formData.medical_history.includes(cond.id) ? 'text-emerald-400' : 'text-emerald-100/80'}>
                                                        {cond.icon}
                                                    </span>
                                                    {cond.label}
                                                </div>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.medical_history.includes(cond.id)
                                                        ? 'border-green-600 bg-emerald-500 shadow-[0_0_10px_#34d399] text-white'
                                                        : 'border-gray-200'
                                                    }`}>
                                                    {formData.medical_history.includes(cond.id) && <CheckCircle size={16} />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    <h2 className="text-xl font-bold text-white mb-4 mt-8">Mental Health / Neurodevelopmental</h2>
                                    <div className="space-y-3 mb-10">
                                        {[
                                            { id: 'anxiety', label: 'Anxiety' },
                                            { id: 'adhd', label: 'ADHD' },
                                            { id: 'autism_spectrum', label: 'Autism Spectrum' },
                                            { id: 'depression', label: 'Depression' },
                                            { id: 'bipolar', label: 'Bipolar Disorder' },
                                            { id: 'schizophrenia', label: 'Schizophrenia' },
                                            { id: 'ocd', label: 'OCD' },
                                            { id: 'ptsd', label: 'PTSD' },
                                            { id: 'none', label: 'None' }
                                        ].map((cond) => (
                                            <button
                                                key={cond.id}
                                                onClick={() => handleMentalHealthChange(cond.id)}
                                                className={`w-full p-4 rounded-xl border-2 flex justify-between items-center transition-all ${formData.mental_health_conditions.includes(cond.id)
                                                        ? 'border-indigo-400 bg-indigo-500/30 text-indigo-200'
                                                        : 'border-white/20 bg-transparent/5 text-indigo-50 hover:bg-transparent/10 hover:border-indigo-400'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4 font-bold">
                                                    <Brain size={20} className={formData.mental_health_conditions.includes(cond.id) ? 'text-indigo-600' : 'text-emerald-100/80'} />
                                                    {cond.label}
                                                </div>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.mental_health_conditions.includes(cond.id)
                                                        ? 'border-indigo-400 bg-indigo-500 shadow-[0_0_10px_rgba(129,140,248,0.5)] text-white'
                                                        : 'border-white/20'
                                                    }`}>
                                                    {formData.mental_health_conditions.includes(cond.id) && <CheckCircle size={16} />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="bg-transparent/10 border border-white/20 rounded-2xl p-6 flex gap-4 items-center text-emerald-100/90 text-sm">
                                        <Stethoscope size={24} className="shrink-0 text-emerald-100/80" />
                                        <p>We adjust your risk multipliers based on these vulnerabilities to provide a safer assessment.</p>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-white/10 flex justify-center">
                    <button
                        onClick={step === 5 ? handleSubmit : nextStep}
                        disabled={loading || !isStepValid()}
                        className="w-full max-w-sm py-4 bg-emerald-500 shadow-[0_0_10px_#34d399] text-white rounded-full font-bold text-lg shadow-lg hover:bg-green-700 hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                    >
                        {loading ? (
                            <Zap className="animate-spin" size={24} />
                        ) : (step === 0 ? 'Begin Assessment' : (step === 5 ? 'See Results' : 'Continue'))}
                        {!loading && step < 5 && <ArrowRight size={20} />}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default AssessmentPage;
