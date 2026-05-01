export type EventType = 'EXPERIENCE' | 'TRANSPORT' | 'MEAL' | 'NOTE';

export interface BaseEvent {
  id: string; // unique generated ID for dragging/deleting
  type: EventType;
  startTime: string; // e.g., "10:00"
}

export interface ExperienceEvent extends BaseEvent {
  type: 'EXPERIENCE';
  packageId: string;
  title: string; // cached title for display
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
  details?: string; // flight number, driver name
}

export interface MealEvent extends BaseEvent {
  type: 'MEAL';
  name: string; // Restaurant name or type of meal
  location?: string;
  locationLat?: number;
  locationLng?: number;
  notes?: string;
}

export interface NoteEvent extends BaseEvent {
  type: 'NOTE';
  content: string; // Free text markdown/string
}

export type TimelineEvent = ExperienceEvent | TransportEvent | MealEvent | NoteEvent;

export type DraftDay = {
  dayNumber: number;
  date: string;
  startAnchor: {
    title: string;
    locationStr: string;
    lat?: number;
    lng?: number;
    time: string;
  };
  endAnchor: {
    title: string;
    locationStr: string;
    lat?: number;
    lng?: number;
    time: string;
  };
  guideNotes: string;
  events: TimelineEvent[]; // Replaces packageIds
};

export type DraftPax = {
  name: string;
  email: string;
  phone: string;
};

export type DraftTrip = {
  title: string;
  startDate: string;
  endDate: string;
  paxCount: number;
  days: DraftDay[];
  leadPax: DraftPax;
  clientNotes: string;
  internalNotes: string;
};
