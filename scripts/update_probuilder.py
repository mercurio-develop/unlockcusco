import re

with open('src/features/pro-builder/components/ProBuilderMain.tsx', 'r') as f:
    content = f.read()

# 1. Hide Budget Summary
content = re.sub(
    r'\{/\* Budget Summary \*/\}.*?<button\n\s*onClick=\{\(\) => setViewState\(\'checkout\'\)\}',
    r'''<button
                  onClick={() => setViewState('checkout')}''',
    content,
    flags=re.DOTALL
)

# 2. Remove AnimatePresence and isHeaderCollapsed
content = re.sub(
    r'\s*const \[isHeaderCollapsed, setIsHeaderCollapsed\] = useState\(false\)',
    r'',
    content
)

content = re.sub(
    r'\s*<button \n\s*onClick=\{\(\) => setIsHeaderCollapsed\(!isHeaderCollapsed\)\}\n\s*className="p\.1\.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"\n\s*title=\{isHeaderCollapsed \? "Expand Details" : "Collapse Details"\}\n\s*>\n\s*\{isHeaderCollapsed \? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />\}\n\s*</button>',
    r'',
    content
)

content = re.sub(
    r'\s*<AnimatePresence>.*?</AnimatePresence>',
    r'',
    content,
    flags=re.DOTALL
)

# 3. Add selectedId and update mapEntities
content = re.sub(
    r'const \[isSidebarCollapsed, setIsSidebarCollapsed\] = useState\(false\)',
    r'const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)\n  const [selectedId, setSelectedId] = useState<string | null>(null)',
    content
)

map_entities_str = r'''  const mapEvents = currentTrip ? currentTrip.days.filter(d => d.isComplete || d.dayNumber === activeDayNumber).flatMap(d => d.events) : [];
  const mapEntities = mapEvents.map(e => {
    let evtLat = e.lat;
    let evtLng = e.lng;
    if (e.type === 'TRANSPORT') {
      evtLat = (e as any).fromLat;
      evtLng = (e as any).fromLng;
    } else if (e.type === 'MEAL') {
      evtLat = (e as any).locationLat || e.lat;
      evtLng = (e as any).locationLng || e.lng;
    }

    return {
      id: e.id,
      name: e.title,
      lat: evtLat,
      lng: evtLng,
      category: e.type
    };
  }).filter(e => e.lat != null && e.lng != null);

  // Add anchors to map entities so they can be clicked/flown to
  if (activeDay) {
    if (activeDay.startAnchor?.lat && activeDay.startAnchor?.lng) {
      mapEntities.push({ id: 'itin-start', name: activeDay.startAnchor.title, lat: activeDay.startAnchor.lat, lng: activeDay.startAnchor.lng, category: 'NOTE' });
    }
    if (activeDay.endAnchor?.lat && activeDay.endAnchor?.lng) {
      mapEntities.push({ id: 'itin-arrival', name: activeDay.endAnchor.title, lat: activeDay.endAnchor.lat, lng: activeDay.endAnchor.lng, category: 'NOTE' });
    }
  }'''

content = re.sub(
    r'const mapEntities = activeDay\?\.events\.map\(.*?\}\)\) \|\| \[\]',
    map_entities_str,
    content,
    flags=re.DOTALL
)

# 4. Update Timeline Events
content = re.sub(
    r'<div key=\{e\.id\} className="relative flex items-center justify-between group pl-8">\s*<div className="absolute left-\[9px\] w-2 h-2 rounded-full bg-slate-300 z-10 group-hover:bg-slate-900 transition-colors ring-4 ring-white" />\s*<span className="text-slate-700 text-\[15px\] font-medium truncate pr-4">\{e\.title\}</span>\s*<span className="text-slate-400 text-xs font-bold font-mono shrink-0">\{e\.startTime\}</span>\s*</div>',
    r'''<button key={e.id} onClick={() => setSelectedId(e.id)} className="relative flex items-center justify-between group pl-8 hover:bg-slate-50 py-1 -ml-2 rounded-lg transition-colors cursor-pointer w-full text-left">
                                  <div className={`absolute left-[17px] w-2 h-2 rounded-full z-10 transition-colors ring-4 ring-white ${selectedId === e.id ? 'bg-slate-900' : 'bg-slate-300 group-hover:bg-slate-500'}`} />
                                  <span className={`text-[15px] font-medium truncate pr-4 ${selectedId === e.id ? 'text-slate-900' : 'text-slate-700'}`}>{e.title}</span>
                                  <span className="text-slate-400 text-xs font-bold font-mono shrink-0">{e.startTime}</span>
                                </button>''',
    content
)

# 5. Pass selectedId
content = re.sub(
    r'<ExploreMap businesses=\{mapEntities as any\} selectedId=\{null\} onSelectBusiness=\{\(\) => \{\}\} />',
    r'<ExploreMap businesses={mapEntities as any} selectedId={selectedId} onSelectBusiness={setSelectedId} />',
    content
)

content = re.sub(
    r'<BuilderWorkspace />',
    r'<BuilderWorkspace selectedId={selectedId} onSelectEvent={setSelectedId} />',
    content
)

with open('src/features/pro-builder/components/ProBuilderMain.tsx', 'w') as f:
    f.write(content)
