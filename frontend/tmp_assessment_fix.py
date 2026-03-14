import re

def fix():
    path = r"d:\new project\frontend\src\pages\AssessmentPage.jsx"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # Make the card explicitly green
    content = content.replace(
        'className="w-full max-w-2xl glass-panel !p-0 overflow-hidden"',
        'className="w-full max-w-2xl bg-[#093520]/80 backdrop-blur-2xl border border-emerald-500/30 rounded-3xl !p-0 overflow-hidden shadow-[0_0_40px_rgba(4,120,87,0.4)] text-white"'
    )

    # Replace any leftover green- classes
    content = re.sub(r'bg-green-50\b', 'bg-emerald-500/20 border border-emerald-500/30', content)
    content = re.sub(r'text-green-600\b', 'text-emerald-400', content)
    content = re.sub(r'text-green-700\b', 'text-emerald-300', content)

    # Some texts might be hard to read on green #093520 if they are 'text-white/60'
    content = content.replace('text-white/60', 'text-emerald-100/80')
    content = content.replace('text-emerald-100/70', 'text-emerald-100/90')
    content = content.replace('bg-white/5', 'bg-emerald-900/40')
    content = content.replace('hover:bg-white/10', 'hover:bg-emerald-800/60')

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

fix()
