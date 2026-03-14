import re

def update_assessment():
    path = r"d:\new project\frontend\src\pages\AssessmentPage.jsx"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Update the Main Age Section to have Child ages and Toggle functionality
    old_age_section = """                                    <div className="mb-10">
                                        <label className="block text-xs font-bold text-emerald-100/80 uppercase tracking-wider mb-4">Select your age group</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {['13-17', '18-25', '26-35', '36-50', '51-65', '65+'].map((age) => (
                                                <button
                                                    key={age}
                                                    onClick={() => handleOptionSelect('age_range', age)}
                                                    className={`p-4 rounded-xl border-2 font-semibold transition-all flex flex-col items-center gap-2 ${formData.age_range === age
                                                            ? 'border-green-600 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                                                            : 'border-white/20 bg-transparent/5 text-emerald-100/90 hover:bg-transparent/10 hover:border-emerald-400'
                                                        }`}
                                                >
                                                    <Calendar size={20} className={formData.age_range === age ? 'text-emerald-400' : 'text-emerald-100/80'} />
                                                    {age}
                                                </button>
                                            ))}
                                        </div>
                                    </div>"""
                                    
    new_age_section = """                                    <div className="mb-10">
                                        <label className="block text-xs font-bold text-emerald-100/80 uppercase tracking-wider mb-4">Age group of the child</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {['0-2', '3-5', '6-12', '13-17'].map((age) => (
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
                                    </div>"""

    content = content.replace(old_age_section, new_age_section)

    # 2. Remove the Secondary Child Age Section
    secondary_child_section = """
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
    content = content.replace(secondary_child_section, "")

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

update_assessment()
