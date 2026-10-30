export interface Vehicle {
  id: string;
  regNumber: string;
  name: string;
  capacityTons: number;
  status: 'AVAILABLE' | 'ON_TRIP' | 'MAINTENANCE';
  fuelPercent: number;
  lastLat: number | null;
  lastLng: number | null;
  lastSpeed: number | null;
  lastUpdated?: string;
  driver?: {
    name: string;
    phone: string;
  };
}

export interface Booking {
  id: string;
  trackingCode: string;
  pickupAddress: string;
  dropAddress: string;
  cargoWeightTon: number;
  goodsType: string;
  status: 'PENDING' | 'ACCEPTED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  totalFare?: number;
  createdAt?: string;
  vehicle?: {
    name: string;
    regNumber: string;
    lastLat: number | null;
    lastLng: number | null;
    lastSpeed: number | null;
  } | null;
  driver?: {
    name: string;
    phone: string;
  } | null;
}