import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight, ArrowLeft, CheckCircle, Activity, User,
    MapPin, Users, Cigarette, Zap, Moon, Brain, Home, Utensils,
    Flame, Stethoscope, Heart, Smile, ShieldCheck, Info,
    Sun, Droplets
} from 'lucide-react';

const AssessmentPage = () => {
    const navigate = useNavigate();
    const { gainXp } = useAuth();
    const { theme } = useTheme();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [direction, setDirection] = useState(1);

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
            gainXp(500);
            navigate('/report');
        } catch (error) {
            console.error("Assessment submission error", error);
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => {
        gainXp(100);
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

    const progress = (step / 5) * 100;

    const variants = {
        enter: (dir) => ({ x: dir > 0 ? 30 : -30, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir) => ({ x: dir < 0 ? 30 : -30, opacity: 0 })
    };

    return (
        <div className="min-h-screen pt-32 pb-20 px-6 flex justify-center items-start overflow-x-hidden">
            <div className="w-full max-w-2xl">
                <div className="flex gap-2 mb-12 justify-center">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className={`h-1 w-12 rounded-full transition-all duration-700 ${step >= i ? 'bg-white' : 'bg-white/10'}`} />
                    ))}
                </div>

                <motion.div
                    key={step}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="glass-panel !p-10 md:!p-16 border-white/5"
                >
                    {step === 0 && (
                        <div className="text-center">
                            <span className="text-5xl mb-8 block">{theme.greeting.flag}</span>
                            <h1 className="text-4xl font-bold mb-6 tracking-tight">Environmental Resilience</h1>
                            <p className="text-slate-400 text-lg mb-10 leading-relaxed max-w-lg mx-auto">
                                We'll analyze your daily patterns and surroundings to generate a high-precision health security report.
                            </p>
                            <div className="flex items-start gap-4 text-left p-6 bg-white/5 rounded-2xl text-xs text-slate-500 mb-12 border border-white/5">
                                <Info size={20} className="shrink-0 text-[var(--color-primary)]" />
                                <p className="leading-relaxed">This process takes approximately 4 minutes. Your data is encrypted and used exclusively for your personal risk assessment profile.</p>
                            </div>
                            <button onClick={nextStep} className="btn-modern !rounded-full w-full !py-5 text-lg font-bold">Initiate Sequence</button>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-10">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">Base Profile</h2>
                                <p className="text-slate-500 text-sm">Essential identifiers for localized analysis.</p>
                            </div>
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Legal Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-field-modern !bg-transparent !border-white/10" placeholder="Identifier" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Years at Residence</label>
                                    <input type="number" name="years_at_location" value={formData.years_at_location} onChange={handleChange} className="input-field-modern !bg-transparent !border-white/10" placeholder="e.g. 5" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Age Range</label>
                                        <select name="age_range" value={formData.age_range} onChange={handleChange} className="input-field-modern !bg-transparent !border-white/10">
                                            <option value="" className="bg-black">Select</option>
                                            {['0-1', '1-3', '3-12', '13-17', '18-25', '26-35', '36-50', '51-65', '65+'].map(a => <option key={a} value={a} className="bg-black">{a}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Gender</label>
                                        <select name="gender" value={formData.gender} onChange={handleChange} className="input-field-modern !bg-transparent !border-white/10">
                                            <option value="" className="bg-black">Select</option>
                                            <option value="male" className="bg-black">Male</option>
                                            <option value="female" className="bg-black">Female</option>
                                            <option value="other" className="bg-black">Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-4 pt-6">
                                <button onClick={prevStep} className="p-5 rounded-2xl bg-white/5 text-slate-400 hover:text-white transition-all border border-white/5"><ArrowLeft size={20} /></button>
                                <button onClick={nextStep} disabled={!isStepValid()} className="btn-modern flex-1 !rounded-2xl font-bold disabled:opacity-30">Continue Sequence</button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-10">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">Daily Habits</h2>
                                <p className="text-slate-500 text-sm">Quantifying lifestyle stressors and resilience patterns.</p>
                            </div>
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Smoking Status</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['never', 'former', 'current'].map(s => (
                                            <button key={s} onClick={() => handleOptionSelect('smoking_status', s)} className={`py-3 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all ${formData.smoking_status === s ? 'bg-white text-black border-white' : 'bg-transparent border-white/10 text-slate-500 hover:border-white/30'}`}>{s}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Activity Level</label>
                                        <select name="activity_level" value={formData.activity_level} onChange={(e) => {
                                            const v = e.target.value;
                                            handleOptionSelect('activity_level', v);
                                            const durations = { sedentary_0: '0 min', light_30: '30 min', moderate_60: '60 min', vigorous_90: '90+ min' };
                                            handleOptionSelect('activity_duration', durations[v] || '');
                                        }} className="input-field-modern !bg-transparent !border-white/10">
                                            <option value="" className="bg-black">Select</option>
                                            <option value="sedentary_0" className="bg-black">Sedentary</option>
                                            <option value="light_30" className="bg-black">Light</option>
                                            <option value="moderate_60" className="bg-black">Moderate</option>
                                            <option value="vigorous_90" className="bg-black">Vigorous</option>
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Sleep Hours</label>
                                        <select name="sleep_hours" value={formData.sleep_hours} onChange={handleChange} className="input-field-modern !bg-transparent !border-white/10">
                                            <option value="" className="bg-black">Select</option>
                                            <option value="<6" className="bg-black">&lt; 6h</option>
                                            <option value="6-8" className="bg-black">6-8h</option>
                                            <option value=">8" className="bg-black">&gt; 8h</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Stress Intensity</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['low', 'medium', 'high'].map(s => (
                                            <button key={s} onClick={() => handleOptionSelect('stress_level', s)} className={`py-3 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all ${formData.stress_level === s ? 'bg-white text-black border-white' : 'bg-transparent border-white/10 text-slate-500 hover:border-white/30'}`}>{s}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-4 pt-6">
                                <button onClick={prevStep} className="p-5 rounded-2xl bg-white/5 text-slate-400 hover:text-white transition-all border border-white/5"><ArrowLeft size={20} /></button>
                                <button onClick={nextStep} disabled={!isStepValid()} className="btn-modern flex-1 !rounded-2xl font-bold disabled:opacity-30">Continue Sequence</button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-10">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">Micro-Environment</h2>
                                <p className="text-slate-500 text-sm">Identifying potential indoor pollutant sources.</p>
                            </div>
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Work Context</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['indoor', 'outdoor', 'mixed'].map(s => (
                                            <button key={s} onClick={() => handleOptionSelect('work_environment', s)} className={`py-3 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all ${formData.work_environment === s ? 'bg-white text-black border-white' : 'bg-transparent border-white/10 text-slate-500 hover:border-white/30'}`}>{s}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Cooking Mechanism</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['electric', 'gas', 'wood'].map(s => (
                                            <button key={s} onClick={() => handleOptionSelect('cooking_method', s)} className={`py-3 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all ${formData.cooking_method === s ? 'bg-white text-black border-white' : 'bg-transparent border-white/10 text-slate-500 hover:border-white/30'}`}>{s}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Dietary Profile</label>
                                    <select name="diet_quality" value={formData.diet_quality} onChange={handleChange} className="input-field-modern !bg-transparent !border-white/10">
                                        <option value="" className="bg-black">Select</option>
                                        <option value="good" className="bg-black">Primarily Fresh / Organic</option>
                                        <option value="average" className="bg-black">Mixed / Balanced</option>
                                        <option value="poor" className="bg-black">Primarily Processed</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-4 pt-6">
                                <button onClick={prevStep} className="p-5 rounded-2xl bg-white/5 text-slate-400 hover:text-white transition-all border border-white/5"><ArrowLeft size={20} /></button>
                                <button onClick={nextStep} disabled={!isStepValid()} className="btn-modern flex-1 !rounded-2xl font-bold disabled:opacity-30">Continue Sequence</button>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-10">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">Resource Telemetry</h2>
                                <p className="text-slate-500 text-sm">Assessing water and radiation exposure vectors.</p>
                            </div>
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Water Intake Source</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['tap', 'filtered', 'bottled', 'well'].map(s => (
                                            <button key={s} onClick={() => handleOptionSelect('water_source', s)} className={`py-3 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all ${formData.water_source === s ? 'bg-white text-black border-white' : 'bg-transparent border-white/10 text-slate-500 hover:border-white/30'}`}>{s}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-6 bg-white/5 p-8 rounded-2xl border border-white/5">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Estimated Daily UV Exposure (0-11+)</label>
                                        <span className="text-xl font-black text-white">{formData.uv_index}</span>
                                    </div>
                                    <input type="range" min="0" max="11" step="1" value={formData.uv_index} onChange={(e) => handleOptionSelect('uv_index', parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white" />
                                    <div className="flex justify-between text-[8px] font-bold text-slate-600 uppercase tracking-tighter">
                                        <span>Minimal</span><span>Extreme</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-4 pt-6">
                                <button onClick={prevStep} className="p-5 rounded-2xl bg-white/5 text-slate-400 hover:text-white transition-all border border-white/5"><ArrowLeft size={20} /></button>
                                <button onClick={nextStep} disabled={!isStepValid()} className="btn-modern flex-1 !rounded-2xl font-bold disabled:opacity-30">Continue Sequence</button>
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="space-y-10">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">Clinical Context</h2>
                                <p className="text-slate-500 text-sm">Identifying underlying biological vulnerabilities.</p>
                            </div>
                            <div className="space-y-8 max-h-[40vh] overflow-y-auto pr-4 custom-scrollbar">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 block mb-4">Select all applicable conditions</label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {[
                                            { id: 'asthma', label: 'Respiratory (Asthma/COPD)' },
                                            { id: 'heart_disease', label: 'Cardiovascular Issues' },
                                            { id: 'allergies', label: 'Severe Allergies / Eczema' },
                                            { id: 'immune_disorder', label: 'Immune System Vulnerability' },
                                            { id: 'anxiety', label: 'Mental Health (Anxiety/Depression)' },
                                            { id: 'adhd', label: 'Neurodevelopmental (ADHD/Autism)' }
                                        ].map(c => (
                                            <button key={c.id} onClick={() => {
                                                if (c.id === 'anxiety' || c.id === 'adhd') handleMentalHealthChange(c.id);
                                                else handleCheckboxChange(c.id);
                                            }} className={`p-4 rounded-xl border text-left text-xs font-bold transition-all flex justify-between items-center ${formData.medical_history.includes(c.id) || formData.mental_health_conditions.includes(c.id) ? 'bg-white text-black border-white' : 'bg-transparent border-white/5 text-slate-400 hover:border-white/20'}`}>
                                                {c.label}
                                                {(formData.medical_history.includes(c.id) || formData.mental_health_conditions.includes(c.id)) && <CheckCircle size={14} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-4 pt-6">
                                <button onClick={prevStep} className="p-5 rounded-2xl bg-white/5 text-slate-400 hover:text-white transition-all border border-white/5"><ArrowLeft size={20} /></button>
                                <button onClick={handleSubmit} disabled={loading} className="btn-modern flex-1 !rounded-2xl font-bold">
                                    {loading ? <Loader className="animate-spin" size={20} /> : 'Generate Synthesis'}
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default AssessmentPage;
