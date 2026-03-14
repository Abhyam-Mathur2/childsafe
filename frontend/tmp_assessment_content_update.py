import re

def main():
    path = r"d:\new project\frontend\src\pages\AssessmentPage.jsx"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Update formData initial state
    content = content.replace(
        "age_range: '',", 
        "age_range: '',\n        child_age_range: '',"
    )

    # 2. Add child age section below user age section
    child_age_jsx = """
                                    <div className="mb-10">
                                        <label className="block text-xs font-bold text-emerald-100/80 uppercase tracking-wider mb-4">Age group of the child</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {['0-2', '3-5', '6-12', '13-17'].map((age) => (
                                                <button
                                                    key={age}
                                                    onClick={() => handleOptionSelect('child_age_range', age)}
                                                    className={`p-4 rounded-xl border-2 font-semibold transition-all flex flex-col items-center gap-2 ${formData.child_age_range === age
                                                            ? 'border-green-600 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                                                            : 'border-white/20 bg-transparent/5 text-emerald-100/90 hover:bg-transparent/10 hover:border-emerald-400'
                                                        }`}
                                                >
                                                    <Smile size={20} className={formData.child_age_range === age ? 'text-emerald-400' : 'text-emerald-100/80'} />
                                                    {age}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
"""
    # Find the end of age section to insert child age
    content = content.replace(
        "                                        </div>\n                                    </div>\n\n                                    <div className=\"mb-10\">\n                                        <label className=\"block text-xs font-bold text-emerald-100/80 uppercase tracking-wider mb-4\">Your gender</label>",
        "                                        </div>\n                                    </div>\n" + child_age_jsx + "\n                                    <div className=\"mb-10\">\n                                        <label className=\"block text-xs font-bold text-emerald-100/80 uppercase tracking-wider mb-4\">Your gender</label>"
    )

    # 3. Update Medical History
    old_medical = """                                            { id: 'asthma', label: 'Asthma', icon: <Activity /> },
                                            { id: 'copd', label: 'COPD', icon: <Activity /> },
                                            { id: 'heart_disease', label: 'Heart Disease', icon: <Heart /> },
                                            { id: 'diabetes', label: 'Diabetes', icon: <Activity /> },
                                            { id: 'hypertension', label: 'Hypertension', icon: <Activity /> },
                                            { id: 'allergies', label: 'Allergies', icon: <Smile /> },
                                            { id: 'immune_disorder', label: 'Immune Disorder', icon: <ShieldCheck size={20} /> }"""

    new_medical = """                                            { id: 'asthma', label: 'Asthma', icon: <Activity /> },
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
                                            { id: 'premature_birth', label: 'Premature Birth Complications', icon: <Activity /> }"""
    content = content.replace(old_medical, new_medical)

    # 4. Update Mental Health
    old_mental = """                                            { id: 'anxiety', label: 'Anxiety' },
                                            { id: 'adhd', label: 'ADHD' },
                                            { id: 'autism_spectrum', label: 'Autism Spectrum' },
                                            { id: 'depression', label: 'Depression' },
                                            { id: 'ocd', label: 'OCD' },
                                            { id: 'ptsd', label: 'PTSD' },
                                            { id: 'none', label: 'None' }"""

    new_mental = """                                            { id: 'anxiety', label: 'Anxiety' },
                                            { id: 'adhd', label: 'ADHD' },
                                            { id: 'autism_spectrum', label: 'Autism Spectrum' },
                                            { id: 'depression', label: 'Depression' },
                                            { id: 'bipolar', label: 'Bipolar Disorder' },
                                            { id: 'schizophrenia', label: 'Schizophrenia' },
                                            { id: 'ocd', label: 'OCD' },
                                            { id: 'ptsd', label: 'PTSD' },
                                            { id: 'none', label: 'None' }"""
    content = content.replace(old_mental, new_mental)

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

main()
