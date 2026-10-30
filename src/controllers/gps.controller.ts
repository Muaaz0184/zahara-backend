import { Request, Response } from 'express';
import prisma from '../config/db';
import { getIO } from '../sockets/socketHandler';

export const receiveGpsData = async (req: Request, res: Response) => {
  try {
    const { vehicleId, latitude, longitude, speed, fuelPercent } = req.body;

    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        lastLat: parseFloat(latitude),
        lastLng: parseFloat(longitude),
        lastSpeed: parseFloat(speed),
        fuelPercent: parseFloat(fuelPercent),
        lastUpdated: new Date()
      }
    });

    await prisma.gpsLog.create({
      data: {
        vehicleId,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        speed: parseFloat(speed),
        fuelLevel: parseFloat(fuelPercent)
      }
    });

    const io = getIO();
    io.emit(`vehicle-update-${vehicleId}`, {
      vehicleId,
      latitude,
      longitude,
      speed,
      fuelPercent,
      updatedAt: new Date()
    });

    res.status(200).json({ success: true, message: 'GPS data processed' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process GPS telemetry data' });
  }
};

export const getFleetStatus = async (req: Request, res: Response) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: { driver: true }
    });
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch fleet status' });
  }
};