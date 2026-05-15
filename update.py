import sys

business_path = "src/app/business/[slug]/page.tsx"
with open(business_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add import
if "import { ScrollCarousel }" not in content:
    content = content.replace(
        "import { SafeImageWrapper } from \"@/components/ui/safe-image\"",
        "import { SafeImageWrapper } from \"@/components/ui/safe-image\"\nimport { ScrollCarousel } from \"@/components/ui/scroll-carousel\""
    )

# 2. Replace wrappers
old_grid = """<div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">"""
new_grid = """<ScrollCarousel>"""

# Replace opening tags
content = content.replace(old_grid, new_grid)

# Replace closing tags for those grids
# The first carousel ends right before </div></div>  {/* Other Experiences */}
# Wait, it's safer to just replace them directly in the blocks

nearby_block_old = """          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {nearby.map(b => (
              <Link
                key={b.id}
                href={`/business/${b.slug}`}
                className="snap-start shrink-0 w-64 group bg-white hover:bg-slate-50 shadow-sm hover:shadow-md border border-slate-200 rounded-2xl p-4 transition-all"
              >
                {b.imageUrl && (
                  <SafeImageWrapper
                    src={b.imageUrl}
                    alt={b.name}
                    wrapperClassName="relative w-full aspect-video rounded-xl overflow-hidden mb-3"
                    imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-1">{b.category}</p>
                <p className="text-sm font-semibold text-slate-900 leading-tight line-clamp-2">{b.name}</p>
                {b.rating && (
                  <p className="text-xs text-slate-500 mt-1">★ {b.rating.toFixed(1)}</p>
                )}
              </Link>
            ))}
          </div>"""

nearby_block_new = """          <ScrollCarousel>
            {nearby.map(b => (
              <Link
                key={b.id}
                href={`/business/${b.slug}`}
                className="snap-start shrink-0 w-64 group bg-white hover:bg-slate-50 shadow-sm hover:shadow-md border border-slate-200 rounded-2xl p-4 transition-all"
                draggable={false}
              >
                {b.imageUrl && (
                  <SafeImageWrapper
                    src={b.imageUrl}
                    alt={b.name}
                    wrapperClassName="relative w-full aspect-video rounded-xl overflow-hidden mb-3 pointer-events-none"
                    imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-1 pointer-events-none">{b.category}</p>
                <p className="text-sm font-semibold text-slate-900 leading-tight line-clamp-2 pointer-events-none">{b.name}</p>
                {b.rating && (
                  <p className="text-xs text-slate-500 mt-1 pointer-events-none">★ {b.rating.toFixed(1)}</p>
                )}
              </Link>
            ))}
          </ScrollCarousel>"""

other_block_old = """          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {otherExperiences.map(b => (
              <Link
                key={b.id}
                href={`/business/${b.slug}`}
                className="snap-start shrink-0 w-64 group bg-white hover:bg-slate-50 shadow-sm hover:shadow-md border border-slate-200 rounded-2xl p-4 transition-all"
              >
                {b.imageUrl && (
                  <SafeImageWrapper
                    src={b.imageUrl}
                    alt={b.name}
                    wrapperClassName="relative w-full aspect-video rounded-xl overflow-hidden mb-3"
                    imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-1">{b.category}</p>
                <p className="text-sm font-semibold text-slate-900 leading-tight line-clamp-2">{b.name}</p>
                {b.rating && (
                  <p className="text-xs text-slate-500 mt-1">★ {b.rating.toFixed(1)}</p>
                )}
              </Link>
            ))}
          </div>"""

other_block_new = """          <ScrollCarousel>
            {otherExperiences.map(b => (
              <Link
                key={b.id}
                href={`/business/${b.slug}`}
                className="snap-start shrink-0 w-64 group bg-white hover:bg-slate-50 shadow-sm hover:shadow-md border border-slate-200 rounded-2xl p-4 transition-all"
                draggable={false}
              >
                {b.imageUrl && (
                  <SafeImageWrapper
                    src={b.imageUrl}
                    alt={b.name}
                    wrapperClassName="relative w-full aspect-video rounded-xl overflow-hidden mb-3 pointer-events-none"
                    imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-1 pointer-events-none">{b.category}</p>
                <p className="text-sm font-semibold text-slate-900 leading-tight line-clamp-2 pointer-events-none">{b.name}</p>
                {b.rating && (
                  <p className="text-xs text-slate-500 mt-1 pointer-events-none">★ {b.rating.toFixed(1)}</p>
                )}
              </Link>
            ))}
          </ScrollCarousel>"""


content = content.replace(nearby_block_old, nearby_block_new)
content = content.replace(other_block_old, other_block_new)

with open(business_path, "w", encoding="utf-8") as f:
    f.write(content)

print("SUCCESS")
