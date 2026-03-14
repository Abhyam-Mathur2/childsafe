const fs = require('fs');
const content = fs.readFileSync('src/pages/AssessmentPage.jsx', 'utf-8');

let newContent = content;

// 1. Remove inline backgrounds and container styling
newContent = newContent.replace(/<div \s*className="min-h-screen flex justify-center items-center py-20 px-4"[\s\S]*?bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"/m, `<div className="min-h-screen flex justify-center items-center py-20 px-4">
            <motion.div
                layout
                className="w-full max-w-2xl glass-panel !p-0 overflow-hidden"`);

// 2. Buttons selected/unselected states
newContent = newContent.replace(/border-green-600 bg-green-50 text-green-700/g, 'border-emerald-400 bg-emerald-500/30 text-emerald-200 shadow-[0_0_15px_rgba(52,211,153,0.3)]');
newContent = newContent.replace(/border-gray-100 bg-white text-gray-500 hover:border-green-200/g, 'border-white/20 bg-white/5 text-emerald-100 hover:bg-white/10 hover:border-emerald-400');

newContent = newContent.replace(/border-green-600 bg-green-50 text-green-800/g, 'border-emerald-400 bg-emerald-500/30 text-white shadow-[0_0_15px_rgba(52,211,153,0.3)]');
newContent = newContent.replace(/border-gray-100 bg-white text-gray-600 hover:border-green-100/g, 'border-white/20 bg-white/5 text-emerald-50 hover:bg-white/10 hover:border-emerald-400');

newContent = newContent.replace(/border-indigo-600 bg-indigo-50 text-indigo-800/g, 'border-indigo-400 bg-indigo-500/30 text-indigo-200 shadow-[0_0_15px_rgba(129,140,248,0.3)]');
newContent = newContent.replace(/border-gray-100 bg-white text-gray-600 hover:border-indigo-100/g, 'border-white/20 bg-white/5 text-white/80 hover:bg-white/10 hover:border-indigo-400');

newContent = newContent.replace(/border-blue-600 bg-blue-50 text-blue-700/g, 'border-blue-400 bg-blue-500/30 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.3)]');
newContent = newContent.replace(/border-gray-100 bg-white text-gray-500 hover:border-blue-200/g, 'border-white/20 bg-white/5 text-blue-100 hover:bg-white/10 hover:border-blue-400');

// 3. Inputs
newContent = newContent.replace(/bg-gray-50 border border-gray-200/g, 'bg-white/10 border-white/20 text-white placeholder-white/40');
newContent = newContent.replace(/focus:ring-green-500\/20 focus:border-green-500/g, 'focus:ring-emerald-400/30 focus:border-emerald-400');

// 4. Texts
newContent = newContent.replace(/text-gray-900/g, 'text-white text-shadow-sm shimmer-text');
newContent = newContent.replace(/text-gray-500/g, 'text-emerald-100/70');
newContent = newContent.replace(/text-gray-400/g, 'text-white/60');
newContent = newContent.replace(/text-gray-600/g, 'text-emerald-50');
newContent = newContent.replace(/text-gray-700/g, 'text-emerald-100');
newContent = newContent.replace(/text-green-600/g, 'text-emerald-400');

// 5. Special Backgrounds
newContent = newContent.replace(/bg-white/g, 'bg-transparent text-white');
newContent = newContent.replace(/bg-gray-100/g, 'bg-white/10');
newContent = newContent.replace(/bg-blue-50 text-blue-800/g, 'bg-blue-900/40 text-blue-200 border border-blue-400/30');

// Progress Bar
newContent = newContent.replace(/className="h-full bg-green-600"/g, 'className="h-full bg-emerald-500 shadow-[0_0_10px_#34d399]"');

fs.writeFileSync('src/pages/AssessmentPage.jsx', newContent);
