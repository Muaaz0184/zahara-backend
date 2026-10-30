import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { pickupAddress, dropAddress, cargoWeightTon, goodsType } = req.body;
    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (parseFloat(cargoWeightTon) > 13.0) {
      return res.status(400).json({ error: 'Weight exceeds maximum fleet limit of 13 Tons' });
    }

    const trackingCode = `ZRL-${Math.floor(10000 + Math.random() * 90000)}`;

    const booking = await prisma.booking.create({
      data: {
        trackingCode,
        customerId,
        pickupAddress,
        dropAddress,
        cargoWeightTon: parseFloat(cargoWeightTon),
        goodsType
      }
    });

    res.status(201).json({ message: 'Booking placed successfully', booking });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create booking' });
  }
};

export const trackShipment = async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.params;
    const booking = await prisma.booking.findUnique({
      where: { trackingCode: code },
      include: {
        vehicle: {
          select: {
            name: true,
            regNumber: true,
            lastLat: true,
            lastLng: true,
            lastSpeed: true
          }
        },
        driver: {
          select: {
            name: true,
            phone: true
          }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Shipment with this tracking code was not found' });
    }

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching shipment details' });
  }
};

export const getAllBookings = async (req: AuthRequest, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: { customer: true, vehicle: true, driver: true },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

export const assignBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId } = req.params;
    const { vehicleId, driverId, totalFare } = req.body;

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        vehicleId,
        driverId,
        totalFare: totalFare ? parseFloat(totalFare) : undefined,
        status: 'ACCEPTED'
      },
      include: { vehicle: true, driver: true }
    });

    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { status: 'ON_TRIP' }
    });

    res.status(200).json({ message: 'Booking assigned successfully', updatedBooking });
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign booking' });
  }
};