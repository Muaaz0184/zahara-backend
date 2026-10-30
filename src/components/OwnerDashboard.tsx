import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { api, socket } from '../services/api';
import { Vehicle, Booking } from '../types';
import { Truck, Fuel, Gauge, Navigation, Activity } from 'lucide-react';

// Fix default Leaflet marker icon issue
const truckIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3202/3202926.png',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

export const OwnerDashboard: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Fetch initial fleet and booking data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const fleetRes = await api.get('/admin/fleet');
        setVehicles(fleetRes.data);
        if (fleetRes.data.length > 0) setSelectedVehicle(fleetRes.data[0]);

        const bookingsRes = await api.get('/admin/bookings');
        setBookings(bookingsRes.data);
      } catch (err) {
        console.error('Error fetching admin data', err);
      }
    };
    fetchData();

    // Listen to real-time GPS telemetry via WebSockets
    vehicles.forEach((v) => {
      socket.on(`vehicle-update-${v.id}`, (data: any) => {
        setVehicles((prev) =>
          prev.map((item) =>
            item.id === data.vehicleId
              ? {
                  ...item,
                  lastLat: data.latitude,
                  lastLng: data.longitude,
                  lastSpeed: data.speed,
                  fuelPercent: data.fuelPercent,
                  lastUpdated: data.updatedAt,
                }
              : item
          )
        );
      });
    });

    return () => {
      vehicles.forEach((v) => socket.off(`vehicle-update-${v.id}`));
    };
  }, []);

  // Center coordinate (Default to Karnataka coordinates: 13.3408, 74.7421)
  const mapCenter: [number, number] = [
    selectedVehicle?.lastLat || 13.3408,
    selectedVehicle?.lastLng || 74.7421,
  ];

  return (
    <div className="space-y-6">
      {/* Fleet Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            onClick={() => setSelectedVehicle(vehicle)}
            className={`p-5 rounded-2xl border-2 transition cursor-pointer ${
              selectedVehicle?.id === vehicle.id
                ? 'border-emerald-600 bg-white shadow-md'
                : 'border-slate-200 bg-slate-50 hover:bg-white'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <Truck className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{vehicle.name}</h3>
                  <p className="text-xs font-mono text-slate-500">{vehicle.regNumber}</p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  vehicle.status === 'AVAILABLE'
                    ? 'bg-green-100 text-green-700'
                    : vehicle.status === 'ON_TRIP'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {vehicle.status}
              </span>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 text-center">
              <div>
                <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-0.5">
                  <Fuel className="w-3.5 h-3.5 text-amber-500" /> Fuel
                </div>
                <p className="font-bold text-slate-800 text-sm">{vehicle.fuelPercent}%</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-0.5">
                  <Gauge className="w-3.5 h-3.5 text-blue-500" /> Speed
                </div>
                <p className="font-bold text-slate-800 text-sm">{vehicle.lastSpeed || 0} km/h</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-0.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-500" /> Driver
                </div>
                <p className="font-bold text-slate-800 text-xs truncate">
                  {vehicle.driver?.name || 'Unassigned'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Live Map Box */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Navigation className="w-4 h-4 text-emerald-600" />
          Live GPS Fleet Tracker
        </h3>
        
        <div className="h-[420px] w-full rounded-xl overflow-hidden border border-slate-200">
          <MapContainer center={mapCenter} zoom={12} className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {vehicles.map((v) => (
              <Marker
                key={v.id}
                position={[v.lastLat || 13.3408, v.lastLng || 74.7421]}
                icon={truckIcon}
              >
                <Popup>
                  <div className="text-sm font-sans p-1">
                    <p className="font-bold text-slate-900">{v.name}</p>
                    <p className="text-xs text-slate-500 font-mono">{v.regNumber}</p>
                    <p className="mt-1 text-xs text-emerald-600 font-semibold">Speed: {v.lastSpeed || 0} km/h</p>
                    <p className="text-xs text-amber-600 font-semibold">Fuel: {v.fuelPercent}%</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};