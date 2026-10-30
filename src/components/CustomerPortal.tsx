import React, { useState } from 'react';
import axios from 'axios';
import { Package, Search, Truck, CheckCircle2 } from 'lucide-react';

interface VehicleInfo {
  name: string;
  regNumber: string;
}

interface ShipmentData {
  trackingCode: string;
  pickupAddress: string;
  dropAddress: string;
  cargoWeightTon: number;
  goodsType: string;
  status: string;
  vehicle?: VehicleInfo | null;
}

export const CustomerPortal: React.FC = () => {
  const [pickup, setPickup] = useState<string>('');
  const [drop, setDrop] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [goodsType, setGoodsType] = useState<string>('');
  const [selectedTruck, setSelectedTruck] = useState<'3T' | '13T'>('3T');
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState<boolean>(false);

  const [trackingCode, setTrackingCode] = useState<string>('');
  const [trackedShipment, setTrackedShipment] = useState<ShipmentData | null>(null);
  const [trackLoading, setTrackLoading] = useState<boolean>(false);
  const [trackError, setTrackError] = useState<string>('');

  const handleBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBookingLoading(true);
    try {
      const res = await axios.post('http://127.0.0.1:5000/api/bookings', {
        pickupAddress: pickup,
        dropAddress: drop,
        cargoWeightTon: parseFloat(weight) || 1.0,
        goodsType: `${goodsType} (${selectedTruck === '3T' ? 'Tata Intra' : 'Eicher Canter'})`,
      });
      setCreatedCode(res.data?.booking?.trackingCode || 'ZRL-BOOKED');
      setPickup('');
      setDrop('');
      setWeight('');
      setGoodsType('');
    } catch {
      alert('Failed to place booking. Please ensure the backend is running on port 5000.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleTrack = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!trackingCode.trim()) return;
    setTrackLoading(true);
    setTrackError('');
    try {
      const res = await axios.get(`http://127.0.0.1:5000/api/bookings/track/${trackingCode.trim().toUpperCase()}`);
      setTrackedShipment(res.data);
    } catch {
      setTrackError('Shipment not found. Please check your tracking code.');
      setTrackedShipment(null);
    } finally {
      setTrackLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Shipment Tracker */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Search className="w-5 h-5 text-emerald-600" />
          Track Your Consignment
        </h2>
        <p className="text-sm text-slate-500 mb-4">Enter your tracking code (e.g., ZRL-10482)</p>

        <form onSubmit={handleTrack} className="flex gap-2">
          <input
            type="text"
            placeholder="Enter Tracking ID..."
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono uppercase text-sm"
          />
          <button
            type="submit"
            disabled={trackLoading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-50 text-sm"
          >
            {trackLoading ? 'Tracking...' : 'Track'}
          </button>
        </form>

        {trackError && <p className="text-red-500 text-sm mt-3">{trackError}</p>}

        {trackedShipment && (
          <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-mono font-bold text-emerald-700 text-lg">
                {trackedShipment.trackingCode}
              </span>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full uppercase">
                {trackedShipment.status}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
              <div>
                <p className="text-xs text-slate-400">Route</p>
                <p className="font-medium">{trackedShipment.pickupAddress} ➔ {trackedShipment.dropAddress}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Assigned Vehicle</p>
                <p className="font-medium">
                  {trackedShipment.vehicle?.name || 'Assigning vehicle...'}
                  {trackedShipment.vehicle?.regNumber ? ` (${trackedShipment.vehicle.regNumber})` : ''}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Booking Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-base font-bold text-slate-900">Choose Fleet Capacity</h3>

          <div
            onClick={() => setSelectedTruck('3T')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition ${
              selectedTruck === '3T'
                ? 'border-emerald-600 bg-emerald-50/40 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Truck className="w-8 h-8 text-emerald-600" />
                <div>
                  <h4 className="font-bold text-slate-800">Tata Intra Goods</h4>
                  <p className="text-xs text-slate-500">Light & Medium Freight</p>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-900">Max 3T</span>
            </div>
          </div>

          <div
            onClick={() => setSelectedTruck('13T')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition ${
              selectedTruck === '13T'
                ? 'border-emerald-600 bg-emerald-50/40 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Truck className="w-8 h-8 text-emerald-600" />
                <div>
                  <h4 className="font-bold text-slate-800">Eicher 6-Wheeler</h4>
                  <p className="text-xs text-slate-500">Heavy Industrial Cargo</p>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-900">12.5 - 13T</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            Book Freight Transportation
          </h3>

          {createdCode ? (
            <div className="text-center py-8 space-y-4">
              <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
              <h4 className="text-xl font-bold text-slate-900">Booking Confirmed!</h4>
              <p className="text-slate-600 text-sm">
                Your consignment code is: <strong className="font-mono text-emerald-700 text-lg">{createdCode}</strong>
              </p>
              <button
                onClick={() => setCreatedCode(null)}
                className="mt-4 px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800"
              >
                Book Another Shipment
              </button>
            </div>
          ) : (
            <form onSubmit={handleBooking} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Pickup Location</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Bangalore Hub"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Delivery Destination</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Mangalore Port"
                    value={drop}
                    onChange={(e) => setDrop(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Estimated Weight (Tons)</label>
                  <input
                    required
                    type="number"
                    step="0.1"
                    max={selectedTruck === '3T' ? '3.0' : '13.0'}
                    placeholder={selectedTruck === '3T' ? 'Max 3.0' : 'Max 13.0'}
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Type of Goods</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Steel, Tiles, FMCG"
                    value={goodsType}
                    onChange={(e) => setGoodsType(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={bookingLoading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition shadow-md disabled:opacity-50 text-sm"
              >
                {bookingLoading ? 'Processing Request...' : 'Confirm Freight Booking'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};