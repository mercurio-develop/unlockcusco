import { Business, Transport, TourPackage, Therapist } from "@prisma/client"

export type EntityType = 'BUSINESS' | 'TRANSPORT' | 'PACKAGE' | 'THERAPIST' | 'AGENCY';

/**
 * UniversalService: The polymorphic bridge between Prisma models.
 * Allows UI components and AI tools to handle any entity with the same interface.
 */
export interface UniversalService {
  id: string;
  slug: string;
  type: EntityType;
  name: string;
  description: string;
  tagline?: string;
  imageUrl: string;
  rating?: number;
  reviewsCount?: number;
  whatsapp?: string;
  lat?: number;
  lng?: number;
  locationLabel: string;
  category: string; // e.g., 'Wellness', 'Taxi', 'Dining'
  priceTier?: string; // '$', '874156', '874156$'
  basePriceUsd?: number;
  
  // Specific data for cards/logic without breaking polymorphism
  metadata?: {
    capacity?: number; // for Transport
    vehicleType?: string; // for Transport
    duration?: string; // for Packages
    specialties?: string[]; // for Therapists/Agencies
    isClaimed?: boolean; // for Businesses
  };

  // Original records for deep access
  _raw?: {
    business?: Business;
    transport?: Transport;
    package?: TourPackage;
    therapist?: Therapist;
  };
}

export type EventType = 'EXPERIENCE' | 'TRANSPORT' | 'MEAL' | 'NOTE' | 'STAY';

export interface BaseEvent {
  id: string; 
  type: EventType;
  startTime: string; 
  durationMins?: number;
  lat?: number;
  lng?: number;
  title: string;
  priceUsd?: number;
}

export interface ExperienceEvent extends BaseEvent {
  type: 'EXPERIENCE';
  packageId?: string;
  businessId?: string;
  service?: UniversalService;
}

export interface TransportEvent extends BaseEvent {
  type: 'TRANSPORT';
  method: 'CAR' | 'TRAIN' | 'FLIGHT' | 'WALK';
  from: string;
  fromLat?: number;
  fromLng?: number;
  to: string;
  toLat?: number;
  toLng?: number;
  details?: string;
  transportId?: string;
  service?: UniversalService;
}

export interface MealEvent extends BaseEvent {
  type: 'MEAL';
  businessId?: string;
  service?: UniversalService;
  notes?: string;
}

export interface StayEvent extends BaseEvent {
  type: 'STAY';
  businessId?: string;
  service?: UniversalService;
  checkIn?: string;
  checkOut?: string;
}

export interface NoteEvent extends BaseEvent {
  type: 'NOTE';
  content: string;
}

export type TimelineEvent = ExperienceEvent | TransportEvent | MealEvent | NoteEvent | StayEvent;

export interface TripDay {
  dayNumber: number;
  date: Date;
  title?: string;
  sleepTown?: string;
  startAnchor?: {
    title: string;
    lat?: number;
    lng?: number;
    time: string;
  };
  endAnchor?: {
    title: string;
    lat?: number;
    lng?: number;
    time: string;
  };
  events: TimelineEvent[];
}

export interface UniversalTrip {
  id?: string;
  title: string;
  startDate: Date;
  endDate: Date;
  paxCount: number;
  days: TripDay[];
  status: 'DRAFT' | 'PROPOSED' | 'CONFIRMED';
  shareToken?: string;
  clientNotes?: string;
  internalNotes?: string;
}
