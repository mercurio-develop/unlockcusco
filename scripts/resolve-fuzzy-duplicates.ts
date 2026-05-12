import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("=== Resolving Fuzzy Duplicates ===")

  // Extracted from fuzzy analysis output:
  const idsToDelete = [
    // OLLANTAYTAMBO
    '9519531c-0612-4b34-b66d-91d1ab4ba6df', // El Albergue Restaurant (keep El Albergue which has 512 reviews)
    '35ec336b-72b3-4ce1-9808-1eb0bdfc57cc', // Koricancha (keep Restaurant Bar cafe Koricancha 321 reviews)
    '9f78b4ad-04e0-4871-accb-8c1c35d376a3', // Las Qolqas EcoResort (221 reviews, keep the one with 223)
    'cmp1tzb8200boml2imvmkx04j', // Pinkuylluna Archaeological Site Trailhead (10 revs, keep site 777 revs)
    'cmp1tt5j300b2ml2iropwibzq', // Archaeological Site of Ollantaytambo (keep Ollantaytambo Archaeological Site)
    'cmp1rthrf005kml2ih716mbax', // ATV Tour Cusco to Maras, Moray & Salt Mines | Peru ATV Tour (1 rev, keep other 1 rev)

    // PISAC
    'cmp1rbw6x0048ml2iaq9eupux', // La Ruta - Pisac Gourmet Restaurant (keep La Ruta - Gourmet Restaurant Pisac)

    // CUSCO
    'cmp1ph4lv0002ml2i5bvfl3hv', // il Olivo Italian-Peruvian Restaurant
    'cmp1pm3bd000aml2iamwa4ezc', // ISKAY, Art Boutique, CHACON HUARI
    'cmp1t30qw009dml2i920wx3s2', // Art Gallery Virgen de Guadalupe
    'cmp1rmhvy004zml2irsp6cv62', // Cusco Massages - Muña Ancestral Spa
    '44fce090-7e3d-4594-b751-0694b0b82dd5', // Namaste Valley Spa (2 revs, keep Namaste Massages Spa Cusco 742)
    'cmp1oz1y40011mllqxvkajb4a', // Totemiq|Art Workshop Gallery in
    'cmp1qh2y0002gml2i21c917is', // Rainbow Mountain ATV Tours (3 revs, keep 68 revs)
    '6c720372-e259-4185-b793-dd7c00ea215d', // Travel Free Cusco – Cusco Travel Agency (5 revs, keep Free Tour 308 revs)
    'cmp1ptg880013ml2iotdzo3ig', // Yoga Cultural Center Jñanakanda Cusco 2
    'cmp1uhls000ddml2icyu12zgd', // Jñanakanda Yoga Cultural Center Cusco
    '0dece09a-c1bc-4e8e-a04d-4866652bafef', // Machu Picchu Tours (50 revs, keep Machu Picchu Travel 134)
    '9f8e5429-42f8-437a-862f-23eef6a57352', // Treks in (8 revs, keep Peru Treks 96)
    'cmp1udozy00d0ml2i0z5etojl', // Coanqui Art Gallery
    'cmp1ot9kc000tmllq6ewg5ntm', // Coanqui Art Gallery Museum
    'ce46399e-a96c-4f32-b077-e630faffc4eb', // Adventure Peru Tours (17 revs, keep Adventure Cusco Tours 122)
    '59237493-fbbf-4942-812e-240f405ca136', // Cusco Peru Adventure (13 revs)
    'c6cfe72f-4501-4ef9-87d9-db1b5953b8fa', // Luxury Expeditions & Travel (6 revs, keep Luxury Peru Expeditions 10)
    'cmp1qhm7d002kml2illkttd6s', // Travel Agency in Cusco - Atv Cusco Adventures on wheels
    'cmp1qxsx50021ml5xjkbj06l9', // Cusco Travel Agency - ATV Cusco Adventures on Wheels
    '7dc7f7ac-2f4a-4bda-a7c3-6f57eb245ddb', // ATV CUSCO Adventures (36 revs, keep ATV Cusco Adventure 3 revs -> actually delete the 3 revs one below)
    'cmp1qhr0w002lml2in38mrnun', // ATV Cusco Adventure
    'cmp1rtofk005mml2iyxz7q16l', // Cusco ATV Tours | ATV Cusco Adventure
    'cmp1tccfs00a5ml2i9y2ajm21', // Cusco ATV Adventure Tours
    'cmp1qhvd4002mml2imhqh7nre', // Quad Bike Peru - ATV Tour
    '910a16fd-8d52-40fa-a60a-dbd8bf5b6c67', // Quad Bike Cusco Agency (14 revs, keep Cusco Quad Bikes 28 revs)
    'cmp1qxhpa003eml2ix4xr2lyu', // Ruins of Qhalispuqyo
    'cmp1q5en30023ml2i3whiwrf3', // Healing Tree Center | Ayahuasca & San Pedro retreats (keep Ayaterra Center)

    // CALCA
    '783ca547-5c92-43d9-9624-c4436d71e550', // Yoga Mandala
    'cmp1pq5t7000pml2iw2h1ulo6', // Archaeological Site of Urco

    // URUBAMBA
    'c65e78e1-01d4-4371-a901-cde484799fd2', // Tunupa Restaurant
    '1d47258d-44ef-48af-ba78-f643d19f254e', // Esencia
    '610f562a-100c-470e-83ee-9e86a046634a', // Tambo del Inka, a Luxury Collection Resort & Spa
    'bffba93d-6957-4970-a816-5d8a8bc4890f', // Hawa Restaurant
    '13e3c3d8-08b5-4cb2-af46-406b846688fd', // Sumaq Maki Massage & Saunas
    'cmp1s1qgu0069ml2i4obzkrwj', // Piedra Wasi Ecolodge
    'cmp1s47o1006hml2im8qc52gh', // Native Peruvian Restaurant - Sacred Valley of the Incas Urubamba Cusco
    'cmp1sd1f8007dml2ipkv6smzl', // Sacred Valley Vertigo

    // MACHU-PICCHU
    'cmp1qto2c001mml5xix48x55x', // Samay Massage Center by Zen Thay Spa
    'cmp1qcs340009ml5xqi5kbakn', // Mistura Machu Picchu
    'cmp1qx7kw003bml2iqs7xikph', // Sacred Rock of Machu Picchu
    'cmp1qui5q0033ml2i9y0zo2ey', // Ayahuasca Grill Restaurant
    'cmp1qpk9k0014ml5xjg3b4lbh', // Pedestrian Path to Machu Picchu
    'cmp1qnqin0012ml5x9lz5h288', // Machu Picchu Town Statue
    'cmp1qu8os001sml5x2hq1axmj', // Bamboo Spa Machu Picchu Cusco
    'cmp1qxq85003gml2iyxbabg7r', // National Archaeological Park of Machu Picchu
    'cmp1qu1m3001qml5xh8aiqcz8', // Magic Hands Spa Machupicchu Cusco

    // YUCAY
    '91362fd3-2fe3-417b-9185-26a1b920c877', // El Verde Retreat Space –
    'cmp1sdjwq007jml2inmp2tbb1', // Yucay Museum of Living Culture

    // MARAS
    '5be330c8-b7de-4650-95ec-622ad411f817', // ATV Quad Bike
    'cmp1qh7e0002hml2iisa0lfaf', // Cusco Maras Quad Bikes
    'cmp1uovmq00e1ml2i8x5hhfyb', // ATV Tours Moray - Maras, Sacred Valley Adventure

    // CHINCHERO
    'cmp1u2e5q00bzml2i4z62z82q', // Chinchero Boutique Hotel
    'cmp1sfpav007sml2iycttd7sy'  // Inca Path Chinchero - Urquillos
  ]

  const result = await prisma.business.deleteMany({
    where: {
      id: { in: idsToDelete }
    }
  })

  console.log(`\n=== Done. Purged ${result.count} fuzzy duplicates. ===`)
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
