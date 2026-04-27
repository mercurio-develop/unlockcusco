"use client"

import { useState } from 'react';
import Map, { Marker, Popup } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from 'lucide-react';

type Business = {
  id: string
  name: string
  category: string
  lat: number
  lng: number
  rating: number | null
  reviewsCount: number
  imageUrl: string
  isClaimed: boolean
}

interface ExploreMapProps {
  businesses: Business[]
}

export default function ExploreMap({ businesses }: ExploreMapProps) {
  const [popupInfo, setPopupInfo] = useState<Business | null>(null);

  // Center around Sacred Valley (approximate center of Urubamba/Ollantaytambo/Pisac)
  const initialViewState = {
    longitude: -72.1167, // Urubamba long
    latitude: -13.3047,  // Urubamba lat
    zoom: 10
  };

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!mapboxToken) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-slate-100 text-slate-500 p-6 text-center">
        <MapPin className="w-12 h-12 mb-4 opacity-50" />
        <p className="font-medium">Mapbox token is missing.</p>
        <p className="text-sm mt-2">Add NEXT_PUBLIC_MAPBOX_TOKEN to your .env file to see the map.</p>
      </div>
    )
  }

  return (
    <Map
      initialViewState={initialViewState}
      mapStyle="mapbox://styles/mapbox/outdoors-v12"
      mapboxAccessToken={mapboxToken}
      style={{ width: '100%', height: '100%' }}
    >
      {businesses.map((business) => (
        <Marker
          key={business.id}
          longitude={business.lng}
          latitude={business.lat}
          anchor="bottom"
          onClick={(e: any) => {
            e.originalEvent.stopPropagation();
            setPopupInfo(business);
          }}
        >
          <div className={`cursor-pointer transform hover:scale-110 transition-transform ${business.isClaimed ? 'text-green-600' : 'text-indigo-600'}`}>
            <MapPin className="w-8 h-8 fill-current" />
          </div>
        </Marker>
      ))}

      {popupInfo && (
        <Popup
          anchor="top"
          longitude={popupInfo.lng}
          latitude={popupInfo.lat}
          onClose={() => setPopupInfo(null)}
          className="z-50"
          maxWidth="250px"
          closeButton={true}
          closeOnClick={false}
        >
          <div className="p-1">
            <img 
              src={popupInfo.imageUrl} 
              alt={popupInfo.name} 
              className="w-full h-24 object-cover rounded-md mb-2"
            />
            <h3 className="font-bold text-sm line-clamp-1">{popupInfo.name}</h3>
            <p className="text-xs text-gray-500">{popupInfo.category}</p>
          </div>
        </Popup>
      )}
    </Map>
  );
}