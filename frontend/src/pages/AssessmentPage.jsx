import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight, ArrowLeft, CheckCircle, Activity, User, Calendar,
    MapPin, Users, Cigarette, Zap, Moon, Brain, Home, Utensils,
    Flame, Stethoscope, Briefcase, Heart, Smile, ShieldCheck
} from 'lucide-react';

const AssessmentPage = () => {
    const navigate = useNavigate();
    const { gainXp } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [direction, setDirection] = useState(1); // 1 for next, -1 for back

    const [formData, setFormData] = useState({
        name: '',
        years_at_location: '',
        age_range: '',
        gender: '',
        smoking_status: '',
        activity_level: '',
        sleep_hours: '',
        stress_level: '',
        work_environment: '',
        diet_quality: '',
        medical_history: [],
        cooking_method: ''
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

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);

        const payload = {
            ...formData,
            years_at_location: parseInt(formData.years_at_location) || 0,
            medical_history: formData.medical_history,
            home_environment: {
                cooking_method: formData.cooking_method
            }
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
        if (step === 1) return formData.name && formData.years_at_location && formData.age_range && formData.gender;
        if (step === 2) return formData.smoking_status && formData.activity_level && formData.sleep_hours && formData.stress_level;
        if (step === 3) return formData.work_environment && formData.diet_quality && formData.cooking_method;
        return true;
    };

    const progress = (step / 4) * 100;

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
        <div className="min-h-screen bg-gray-50 flex justify-center items-center py-20 px-4">
            <motion.div
                layout
                className="w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
            >
                {/* Progress Header */}
                <div className="h-1.5 bg-gray-100 w-full">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ type: "spring", stiffness: 50, damping: 20 }}
                        className="h-full bg-green-600"
                    ></motion.div>
                </div>

                <div className="p-8 md:p-12">
                    {/* Navigation Header */}
                    <div className="flex justify-between items-center mb-10">
                        <AnimatePresence mode="wait">
                            {step > 1 ? (
                                <motion.button
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    onClick={prevStep}
                                    className="text-gray-400 hover:text-green-700 transition-colors"
                                >
                                    <ArrowLeft size={24} />
                                </motion.button>
                            ) : <div className="w-6"></div>}
                        </AnimatePresence>

                        <span className="text-sm font-bold uppercase tracking-widest text-gray-400">
                            Step {step} of 4
                        </span>
                        <div className="w-6"></div>
                    </div>

                    <AnimatePresence custom={direction} mode="wait">
                        <motion.div
                            key={step}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                        >
                            {/* Step 1: Personal Profile */}
                            {step === 1 && (
                                <>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Let's build your profile</h1>
                                    <p className="text-gray-500 text-center mb-10 text-lg">We use this to customize your environmental risk calculations.</p>

                                    <div className="space-y-6 mb-10">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                                <User size={16} /> What is your full name?
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Enter name"
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-lg"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                                <MapPin size={16} /> Years at current location?
                                            </label>
                                            <input
                                                type="number"
                                                name="years_at_location"
                                                value={formData.years_at_location}
                                                onChange={handleChange}
                                                placeholder="e.g. 5"
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-lg"
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-10">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Select your age group</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {['13-17', '18-25', '26-35', '36-50', '51-65', '65+'].map((age) => (
                                                <button
                                                    key={age}
                                                    onClick={() => handleOptionSelect('age_range', age)}
                                                    className={`p-4 rounded-xl border-2 font-semibold transition-all flex flex-col items-center gap-2 ${formData.age_range === age
                                                            ? 'border-green-600 bg-green-50 text-green-700'
                                                            : 'border-gray-100 bg-white text-gray-500 hover:border-green-200'
                                                        }`}
                                                >
                                                    <Calendar size={20} className={formData.age_range === age ? 'text-green-600' : 'text-gray-400'} />
                                                    {age}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mb-10">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Your gender</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {['Male', 'Female', 'Other'].map((g) => (
                                                <button
                                                    key={g}
                                                    onClick={() => handleOptionSelect('gender', g.toLowerCase())}
                                                    className={`p-4 rounded-xl border-2 font-semibold transition-all flex flex-col items-center gap-2 ${formData.gender?.toLowerCase() === g.toLowerCase()
                                                            ? 'border-green-600 bg-green-50 text-green-700'
                                                            : 'border-gray-100 bg-white text-gray-500 hover:border-green-200'
                                                        }`}
                                                >
                                                    <Users size={20} className={formData.gender?.toLowerCase() === g.toLowerCase() ? 'text-green-600' : 'text-gray-400'} />
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
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Your daily habits</h1>
                                    <p className="text-gray-500 text-center mb-10 text-lg">Lifestyle choices can either protect you or increase your vulnerability.</p>

                                    <div className="mb-10">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Smoking Status</label>
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
                                                            ? 'border-green-600 bg-green-50 text-green-700'
                                                            : 'border-gray-100 bg-white text-gray-500 hover:border-green-200'
                                                        }`}
                                                >
                                                    <span className={formData.smoking_status === item.id ? 'text-green-600' : 'text-gray-400'}>{item.icon}</span>
                                                    {item.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mb-10">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Physical Activity</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                { id: 'sedentary', label: 'Sedentary', icon: <Zap className="opacity-30" /> },
                                                { id: 'moderate', label: 'Moderate', icon: <Zap className="opacity-60" /> },
                                                { id: 'active', label: 'Active', icon: <Zap /> }
                                            ].map((item) => (
                                                <button
                                                    key={item.id}
                                                    onClick={() => handleOptionSelect('activity_level', item.id)}
                                                    className={`p-4 rounded-xl border-2 font-semibold transition-all flex flex-col items-center gap-3 ${formData.activity_level === item.id
                                                            ? 'border-green-600 bg-green-50 text-green-700'
                                                            : 'border-gray-100 bg-white text-gray-500 hover:border-green-200'
                                                        }`}
                                                >
                                                    <span className={formData.activity_level === item.id ? 'text-green-600' : 'text-gray-400'}>{item.icon}</span>
                                                    {item.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                                <Moon size={16} /> Average Sleep
                                            </label>
                                            <select
                                                name="sleep_hours"
                                                value={formData.sleep_hours}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                                            >
                                                <option value="">Duration</option>
                                                <option value="<6">Less than 6h</option>
                                                <option value="6-8">6-8 hours</option>
                                                <option value=">8">8+ hours</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                                <Brain size={16} /> Stress Level
                                            </label>
                                            <select
                                                name="stress_level"
                                                value={formData.stress_level}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                                            >
                                                <option value="">Level</option>
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                            </select>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Step 3: Environment */}
                            {step === 3 && (
                                <>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Home & Work</h1>
                                    <p className="text-gray-500 text-center mb-10 text-lg">Where you spend your time significantly affects your exposure levels.</p>

                                    <div className="mb-10">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Main Work Environment</label>
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
                                                            ? 'border-green-600 bg-green-50 text-green-700'
                                                            : 'border-gray-100 bg-white text-gray-500 hover:border-green-200'
                                                        }`}
                                                >
                                                    <span className={formData.work_environment === item.id ? 'text-green-600' : 'text-gray-400'}>{item.icon}</span>
                                                    {item.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mb-10">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Diet Quality</label>
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
                                                            ? 'border-green-600 bg-green-50 text-green-700'
                                                            : 'border-gray-100 bg-white text-gray-500 hover:border-green-200'
                                                        }`}
                                                >
                                                    <span className={formData.diet_quality === item.id ? 'text-green-600' : 'text-gray-400'}>{item.icon}</span>
                                                    {item.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mb-10">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Cooking Source</label>
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
                                                            ? 'border-green-600 bg-green-50 text-green-700'
                                                            : 'border-gray-100 bg-white text-gray-500 hover:border-green-200'
                                                        }`}
                                                >
                                                    <span className={formData.cooking_method === item.id ? 'text-green-600' : 'text-gray-400'}>{item.icon}</span>
                                                    {item.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Step 4: Medical */}
                            {step === 4 && (
                                <>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Health History</h1>
                                    <p className="text-gray-500 text-center mb-10 text-lg">Pre-existing conditions can make environmental factors more hazardous.</p>

                                    <div className="space-y-3 mb-10">
                                        {[
                                            { id: 'asthma', label: 'Asthma', icon: <Activity /> },
                                            { id: 'copd', label: 'COPD', icon: <Activity /> },
                                            { id: 'heart_disease', label: 'Heart Disease', icon: <Heart /> },
                                            { id: 'diabetes', label: 'Diabetes', icon: <Activity /> },
                                            { id: 'hypertension', label: 'Hypertension', icon: <Activity /> },
                                            { id: 'allergies', label: 'Allergies', icon: <Smile /> },
                                            { id: 'immune_disorder', label: 'Immune Disorder', icon: <ShieldCheck size={20} /> }
                                        ].map((cond) => (
                                            <button
                                                key={cond.id}
                                                onClick={() => handleCheckboxChange(cond.id)}
                                                className={`w-full p-4 rounded-xl border-2 flex justify-between items-center transition-all ${formData.medical_history.includes(cond.id)
                                                        ? 'border-green-600 bg-green-50 text-green-800'
                                                        : 'border-gray-100 bg-white text-gray-600 hover:border-green-100'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4 font-bold">
                                                    <span className={formData.medical_history.includes(cond.id) ? 'text-green-600' : 'text-gray-400'}>
                                                        {cond.icon}
                                                    </span>
                                                    {cond.label}
                                                </div>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.medical_history.includes(cond.id)
                                                        ? 'border-green-600 bg-green-600 text-white'
                                                        : 'border-gray-200'
                                                    }`}>
                                                    {formData.medical_history.includes(cond.id) && <CheckCircle size={16} />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="bg-gray-50 rounded-2xl p-6 flex gap-4 items-center text-gray-500 text-sm">
                                        <Stethoscope size={24} className="shrink-0 text-gray-400" />
                                        <p>We adjust your risk multipliers based on these vulnerabilities to provide a safer assessment.</p>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-gray-100 flex justify-center">
                    <button
                        onClick={step === 4 ? handleSubmit : nextStep}
                        disabled={loading || !isStepValid()}
                        className="w-full max-w-sm py-4 bg-green-600 text-white rounded-full font-bold text-lg shadow-lg hover:bg-green-700 hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                    >
                        {loading ? (
                            <Zap className="animate-spin" size={24} />
                        ) : (step === 4 ? 'See Results' : 'Continue')}
                        {!loading && step < 4 && <ArrowRight size={20} />}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default AssessmentPage;
