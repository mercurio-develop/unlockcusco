const fs = require('fs');
const path = require('path');

const ipPath = path.join(__dirname, 'src/features/discovery/components/itinerary-panel.tsx');
let ipContent = fs.readFileSync(ipPath, 'utf8');

// Replace BusinessCard usages
ipContent = ipContent.replace(
  /<BusinessCard business=\{\(activeItinerary\.startAnchor as any\)\.service\} orientation="horizontal" showItineraryAdd=\{false\} showItineraryEnd=\{false\} \/>/g,
  '<BusinessCard business={(activeItinerary.startAnchor as any).service} orientation="horizontal" showItineraryAdd={false} showItineraryEnd={false} dict={dict} />'
);

ipContent = ipContent.replace(
  /<BusinessCard business=\{waypoint\.service\} mapTargetId=\{waypoint\.id\} orientation="horizontal" showItineraryAdd=\{false\} showItineraryEnd=\{false\} \/>/g,
  '<BusinessCard business={waypoint.service} mapTargetId={waypoint.id} orientation="horizontal" showItineraryAdd={false} showItineraryEnd={false} dict={dict} />'
);

ipContent = ipContent.replace(
  /<BusinessCard business=\{\(activeItinerary\.endAnchor as any\)\.service\} orientation="horizontal" showItineraryAdd=\{false\} showItineraryEnd=\{false\} showMap=\{false\} \/>/g,
  '<BusinessCard business={(activeItinerary.endAnchor as any).service} orientation="horizontal" showItineraryAdd={false} showItineraryEnd={false} showMap={false} dict={dict} />'
);

fs.writeFileSync(ipPath, ipContent);
console.log("itinerary-panel.tsx updated");
