import re

with open('src/features/pro-builder/components/BuilderWorkspace.tsx', 'r') as f:
    content = f.read()

# Add props to BuilderWorkspace
content = re.sub(
    r'export function BuilderWorkspace\(\) \{',
    r'export function BuilderWorkspace({ selectedId, onSelectEvent }: { selectedId: string | null, onSelectEvent: (id: string) => void }) {',
    content
)

# Remove auto arrange header button
content = re.sub(
    r'<div className="mb-10 flex justify-between items-start pt-10 pl-6">\s*<div>\s*<h2 className="text-4xl font-serif font-bold text-slate-900 mb-1">Day \{activeDay\.dayNumber\}</h2>\s*<p className="text-slate-500 text-lg">\{activeDay\.date\.toLocaleDateString\(undefined, \{ weekday: \'long\', month: \'long\', day: \'numeric\' \}\)\}</p>\s*</div>\s*<button \n\s*onClick=\{handleAutoCalculate\}\n\s*className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition-colors"\n\s*>\n\s*<Sparkles className="w-4 h-4 text-amber-300" /> Auto-Arrange Time\n\s*</button>\s*</div>',
    r'''<div className="mb-10 flex justify-between items-start pt-10 pl-6">
            <div>
              <h2 className="text-4xl font-serif font-bold text-slate-900 mb-1">Day {activeDay.dayNumber}</h2>
              <p className="text-slate-500 text-lg">{activeDay.date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>''',
    content
)

# Make start anchor clickable
content = re.sub(
    r'<div className="relative group">\s*<div className="absolute -left-\[37px\] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-slate-900 z-20 flex items-center justify-center">\s*<div className="w-1 h-1 rounded-full bg-slate-900" />\s*</div>\s*<div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow transition-shadow">',
    r'''<div 
              className="relative group cursor-pointer"
              onClick={() => onSelectEvent('itin-start')}
            >
              <div className={`absolute -left-[37px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 z-20 flex items-center justify-center transition-colors ${selectedId === 'itin-start' ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-900 group-hover:bg-slate-100'}`}>
                <div className={`w-1 h-1 rounded-full ${selectedId === 'itin-start' ? 'bg-white' : 'bg-slate-900'}`} />
              </div>
              <div className={`bg-white border rounded-3xl p-5 transition-shadow ${selectedId === 'itin-start' ? 'border-slate-300 shadow-md ring-1 ring-slate-900/5' : 'border-slate-100 shadow-sm hover:shadow'}`}>''',
    content
)

# Make event block clickable
content = re.sub(
    r'<div key=\{evt\.id\} className="relative group animate-in fade-in slide-in-from-bottom-2">\s*<div className="absolute -left-\[37px\] top-8 w-4 h-4 rounded-full bg-white border-2 border-slate-200 z-20 flex items-center justify-center">\s*<div className="w-1 h-1 rounded-full bg-slate-200" />\s*</div>\s*<div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative">',
    r'''<div 
                key={evt.id} 
                className="relative group animate-in fade-in slide-in-from-bottom-2 cursor-pointer"
                onClick={() => onSelectEvent(evt.id)}
              >
                <div className={`absolute -left-[37px] top-8 w-4 h-4 rounded-full border-2 z-20 flex items-center justify-center transition-colors ${selectedId === evt.id ? 'bg-slate-400 border-slate-400' : 'bg-white border-slate-200'}`}>
                  <div className={`w-1 h-1 rounded-full ${selectedId === evt.id ? 'bg-white' : 'bg-slate-200'}`} />
                </div>
                
                <div className={`bg-white border rounded-3xl p-6 transition-shadow relative ${selectedId === evt.id ? 'border-slate-300 shadow-md ring-1 ring-slate-900/5' : 'border-slate-100 shadow-sm hover:shadow-md'}`}>''',
    content
)

# Add end anchor before day complete toggle
content = re.sub(
    r'</div>\s*\{\/\* DAY COMPLETE TOGGLE \*/\}',
    r'''</div>
            
            {/* END ANCHOR */}
            <div className="relative pt-6">
              <div 
                className="relative group cursor-pointer"
                onClick={() => onSelectEvent('itin-arrival')}
              >
                <div className={`absolute -left-[37px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 z-20 flex items-center justify-center transition-colors ${selectedId === 'itin-arrival' ? 'bg-rose-600 border-rose-600' : 'bg-white border-rose-600 group-hover:bg-rose-50'}`}>
                  <div className={`w-1 h-1 rounded-full ${selectedId === 'itin-arrival' ? 'bg-white' : 'bg-rose-600'}`} />
                </div>
                <div className={`bg-white border rounded-3xl p-5 transition-shadow ${selectedId === 'itin-arrival' ? 'border-rose-200 shadow-md ring-1 ring-rose-600/5' : 'border-slate-100 shadow-sm hover:shadow'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.2em] block">End of Day</span>
                    <input 
                      type="time" 
                      value={activeDay.endAnchor?.time || "18:00"} 
                      onChange={(e) => updateDay(activeDay.dayNumber, { endAnchor: { ...activeDay.endAnchor, time: e.target.value }})}
                      className="text-sm font-mono text-slate-900 font-bold bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl hover:bg-slate-100 focus:bg-white focus:border-slate-300 outline-none cursor-pointer transition-all [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <LocationAutocomplete 
                        placeholder="e.g. Hotel Monasterio, Cusco"
                        value={activeDay.endAnchor?.title || ""}
                        onChange={(val) => updateDay(activeDay.dayNumber, { endAnchor: { ...activeDay.endAnchor, title: val }})}
                        className="w-full p-2 bg-transparent border-b border-slate-200 text-base outline-none focus:border-slate-900 font-semibold text-slate-900 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* DAY COMPLETE TOGGLE */}''',
    content
)

with open('src/features/pro-builder/components/BuilderWorkspace.tsx', 'w') as f:
    f.write(content)
