import sys

file_path = "src/app/explore/[location]/[category]/page.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

start_marker = "      {/* Grid */}"
end_marker = "      <SeoDirectory />"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    new_content = content[:start_idx] + """      {/* Interactive List */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <InteractiveList locationSlug={location} category={category} initialBusinesses={localBusinesses} />
      </div>
      
""" + content[end_idx:]
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("SUCCESS")
else:
    print("FAILED TO FIND MARKERS")
