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
    Sun, Droplets, Loader, Plus, X
} from 'lucide-react';

// Condition catalogue shown in the Clinical Context step, grouped by the
// environmental exposure pathway most strongly linked to it. `type: 'mental'`
// routes into mental_health_conditions instead of medical_history.
const CONDITION_CATEGORIES = [
    {
        category: 'Air Pollution',
        note: 'The strongest evidence, so start here',
        items: [
            { label: 'Asthma and breathing trouble', type: 'medical' },
            { label: "Smoker's lung, even in non-smokers (COPD)", type: 'medical' },
            { label: 'Lung infections like pneumonia, especially in children and the elderly', type: 'medical' },
            { label: 'Heart attack and heart disease', type: 'medical' },
            { label: 'Stroke', type: 'medical' },
            { label: 'Lung cancer', type: 'medical' },
            { label: 'Eye irritation, cough, and sore throat (early warning signals)', type: 'medical' },
        ]
    },
    {
        category: 'Dirty Water & Poor Sanitation',
        items: [
            { label: 'Loose motions and stomach infections (diarrhoea)', type: 'medical' },
            { label: 'Typhoid', type: 'medical' },
            { label: 'Jaundice and hepatitis A/E (liver infections)', type: 'medical' },
            { label: 'Cholera', type: 'medical' },
            { label: 'Worm infections and stunted growth in children', type: 'medical' },
            { label: 'Skin and eye infections from unclean water', type: 'medical' },
            { label: 'Kidney disease and cancer from long-term contamination (arsenic, fluoride, heavy metals)', type: 'medical' },
        ]
    },
    {
        category: 'Heat & Climate',
        items: [
            { label: 'Heat stroke and dehydration', type: 'medical' },
            { label: 'Kidney stones and kidney damage (outdoor workers)', type: 'medical' },
            { label: 'Worsening of heart and lung disease during heat waves', type: 'medical' },
            { label: 'Mosquito-borne fevers: dengue, malaria, chikungunya', type: 'medical' },
            { label: 'Waterborne outbreaks after floods', type: 'medical' },
        ]
    },
    {
        category: 'Noise & Urban Living',
        items: [
            { label: 'High blood pressure (BP)', type: 'medical' },
            { label: 'Sleep problems', type: 'medical' },
            { label: 'Stress, anxiety, and depression', type: 'mental' },
            { label: 'Hearing loss', type: 'medical' },
        ]
    },
    {
        category: 'Chemicals, Soil & Food',
        items: [
            { label: "Lead poisoning (children's brain development)", type: 'medical' },
            { label: 'Pesticide exposure (skin, nerve, and fertility problems)', type: 'medical' },
            { label: 'Birth defects, low birth weight, and premature births', type: 'medical' },
            { label: 'Certain cancers (industrial areas / contaminated food)', type: 'medical' },
        ]
    },
    {
        category: 'Other Conditions',
        items: [
            { label: 'Severe Allergies / Eczema', type: 'medical' },
            { label: 'Immune System Vulnerability', type: 'medical' },
            { label: 'Neurodevelopmental (ADHD/Autism)', type: 'mental' },
        ]
    },
];

const AssessmentPage = () => {
    const navigate = useNavigate();
    const { gainXp } = useAuth();
    const { theme } = useTheme();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [direction, setDirection] = useState(1);
    const [otherInput, setOtherInput] = useState('');

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
        other_conditions: [],
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

    const handleAddOtherCondition = () => {
        const value = otherInput.trim();
        if (!value) return;
        setFormData(prev => {
            if (prev.other_conditions.some(c => c.toLowerCase() === value.toLowerCase())) return prev;
            return { ...prev, other_conditions: [...prev.other_conditions, value] };
        });
        setOtherInput('');
    };

    const handleRemoveOtherCondition = (value) => {
        setFormData(prev => ({ ...prev, other_conditions: prev.other_conditions.filter(c => c !== value) }));
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
        formData.other_conditions.forEach(cond => {
            if (!mergedMedicalHistory.includes(cond)) mergedMedicalHistory.push(cond);
        });

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
        delete payload.other_conditions;

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
                            <button onClick={nextStep} className="btn-modern !rounded-full w-full !py-5 text-lg font-bold">Initiate Assessment</button>
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
                            <div className="space-y-8 max-h-[45vh] overflow-y-auto pr-4 custom-scrollbar">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Select all applicable conditions</p>
                                {CONDITION_CATEGORIES.map(group => (
                                    <div key={group.category} className="space-y-3">
                                        <div>
                                            <h3 className="text-sm font-bold text-white">{group.category}</h3>
                                            {group.note && <p className="text-[10px] text-slate-500 mt-0.5">{group.note}</p>}
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                            {group.items.map(c => {
                                                const selected = c.type === 'mental'
                                                    ? formData.mental_health_conditions.includes(c.label)
                                                    : formData.medical_history.includes(c.label);
                                                return (
                                                    <button key={c.label} onClick={() => {
                                                        if (c.type === 'mental') handleMentalHealthChange(c.label);
                                                        else handleCheckboxChange(c.label);
                                                    }} className={`p-4 rounded-xl border text-left text-xs font-bold transition-all flex justify-between items-center gap-3 ${selected ? 'bg-white text-black border-white' : 'bg-transparent border-white/5 text-slate-400 hover:border-white/20'}`}>
                                                        <span>{c.label}</span>
                                                        {selected && <CheckCircle size={14} className="shrink-0" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}

                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold text-white">Other</h3>
                                    <p className="text-[10px] text-slate-500 -mt-2">Add any condition not listed above.</p>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={otherInput}
                                            onChange={(e) => setOtherInput(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddOtherCondition(); } }}
                                            placeholder="e.g. Diabetes"
                                            className="input-field-modern !bg-transparent !border-white/10 flex-1"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddOtherCondition}
                                            className="px-4 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-all shrink-0"
                                            aria-label="Add condition"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                    {formData.other_conditions.length > 0 && (
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {formData.other_conditions.map(cond => (
                                                <span key={cond} className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full bg-white text-black text-xs font-bold">
                                                    {cond}
                                                    <button type="button" onClick={() => handleRemoveOtherCondition(cond)} className="hover:opacity-60">
                                                        <X size={12} />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
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
