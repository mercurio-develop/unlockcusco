const coordsStr = "-71.9389,-13.5350;-71.8778,-13.4475;-71.8483,-13.4217";
fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${coordsStr}?geometries=geojson&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`)
  .then(r => r.json())
  .then(data => console.log(JSON.stringify(data, null, 2)));
