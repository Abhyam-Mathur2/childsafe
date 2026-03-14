import re

def update_assessment_page():
    path = r"d:\new project\frontend\src\pages\AssessmentPage.jsx"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Main Wrapper
    wrapper_old = """<div 
            className="min-h-screen flex justify-center items-center py-20 px-4"
            style={{
                backgroundColor: '#064e3b',
                backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)), url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.83v58.34h-58.34l-.83-.83L54.627 0zM27.314 0l.83.83v29.17h-29.17l-.83-.83L27.314 0zm0 29.171l.83.83v29.17h-29.17l-.83-.83l53.797-53.797z' fill='%23059669' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                backgroundSize: 'cover'
            }}
        >"""
    wrapper_new = """<div className="min-h-screen relative z-10 text-white flex justify-center items-center py-20 px-4">"""
    content = content.replace(wrapper_old, wrapper_new)

    # 2. Card Panel
    content = content.replace(
        'className="w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"',
        'className="w-full max-w-2xl glass-panel !p-0 overflow-hidden"'
    )

    # 3. Texts
    content = content.replace('text-gray-900', 'text-white text-shadow-sm shimmer-text')
    content = content.replace('text-gray-800', 'text-white')
    content = content.replace('text-gray-700', 'text-emerald-100')
    content = content.replace('text-gray-600', 'text-emerald-50')
    content = content.replace('text-gray-500', 'text-emerald-100/70')
    content = content.replace('text-gray-400', 'text-white/60')
    
    # Text headers
    content = content.replace('text-4xl font-extrabold text-white text-shadow-sm shimmer-text mb-6', 'text-4xl font-extrabold text-white mb-6 shimmer-text')
    
    # 4. Progress bar
    content = content.replace('bg-green-600', 'bg-emerald-500 shadow-[0_0_10px_#34d399]')
    content = content.replace('bg-gray-100', 'bg-white/10')

    # 5. Buttons & Borders Selection
    # Default State
    content = content.replace('border-gray-100 bg-white hover:border-green-200', 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-emerald-400')
    content = content.replace('border-gray-100 bg-white text-emerald-100/70 hover:border-green-200', 'border-white/20 bg-white/5 text-emerald-100/70 hover:bg-white/10 hover:border-emerald-400')
    content = content.replace('border-gray-100 bg-white text-emerald-50 hover:border-green-100', 'border-white/20 bg-white/5 text-emerald-50 hover:bg-white/10 hover:border-emerald-400')
    content = content.replace('border-gray-100 bg-white text-emerald-100/70 hover:border-blue-200', 'border-white/20 bg-white/5 text-blue-100/70 hover:bg-white/10 hover:border-blue-400')
    content = content.replace('border-gray-100 bg-white text-emerald-50 hover:border-indigo-100', 'border-white/20 bg-white/5 text-indigo-50 hover:bg-white/10 hover:border-indigo-400')

    # Selected State
    content = content.replace('border-green-600 bg-green-50 text-emerald-100', 'border-emerald-400 bg-emerald-500/30 text-emerald-200 shadow-[0_0_15px_rgba(52,211,153,0.3)]')
    content = content.replace('border-green-600 bg-green-50 text-white', 'border-emerald-400 bg-emerald-500/30 text-white shadow-[0_0_15px_rgba(52,211,153,0.3)]')
    content = content.replace('border-blue-600 bg-blue-50 text-emerald-100', 'border-blue-400 bg-blue-500/30 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.3)]')
    content = content.replace('border-blue-600 bg-blue-50 text-white/60', 'border-blue-400 bg-blue-500/30 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.3)]')
    content = content.replace('border-indigo-600 bg-indigo-50 text-emerald-100', 'border-indigo-400 bg-indigo-500/30 text-indigo-200 shadow-[0_0_15px_rgba(129,140,248,0.3)]')
    
    # 6. Inputs
    content = content.replace('bg-gray-50 border border-gray-200', 'bg-white/10 border-white/20 text-white placeholder-white/40')
    content = content.replace('focus:ring-green-500/20 focus:border-green-500', 'focus:ring-emerald-400/30 focus:border-emerald-400')

    # 7. Button styling
    content = content.replace('text-green-700 hover:text-green-800', 'text-emerald-400 hover:text-emerald-300')
    content = content.replace('bg-green-600 hover:bg-green-700', 'bg-emerald-600 hover:bg-emerald-700')
    content = content.replace('bg-blue-50 text-blue-800', 'bg-white/10 text-white border border-white/20')

    # 8. Border separating sections
    content = content.replace('border-gray-100', 'border-white/10')
    content = content.replace('bg-white', 'bg-transparent')

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

update_assessment_page()
