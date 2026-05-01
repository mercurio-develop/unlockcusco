export type DraftDay = {
  dayNumber: number;
  date: string;
  startAnchor: {
    title: string;
    locationStr: string;
    time: string;
  };
  endAnchor: {
    title: string;
    locationStr: string;
    time: string;
  };
  guideNotes: string;
  packageIds: string[]; // Selected TourPackages for this day
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
