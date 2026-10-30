import { PrismaClient, VehicleStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Zahara Road Lines database...');

  // 1. Create or update the 2 fleet vehicles
  const eicher = await prisma.vehicle.upsert({
    where: { regNumber: 'KA-01-E-1300' },
    update: {
      name: 'Eicher Canter 6-Wheeler (13T)',
      capacityTons: 13.0,
      fuelPercent: 95.0,
      status: VehicleStatus.AVAILABLE,
    },
    create: {
      regNumber: 'KA-01-E-1300',
      name: 'Eicher Canter 6-Wheeler (13T)',
      capacityTons: 13.0,
      fuelPercent: 95.0,
      status: VehicleStatus.AVAILABLE,
      lastLat: 13.3408,
      lastLng: 74.7421,
      lastSpeed: 45.0,
    },
  });

  const tataIntra = await prisma.vehicle.upsert({
    where: { regNumber: 'KA-01-T-3000' },
    update: {
      name: 'Tata Intra Goods (3T)',
      capacityTons: 3.0,
      fuelPercent: 88.0,
      status: VehicleStatus.AVAILABLE,
    },
    create: {
      regNumber: 'KA-01-T-3000',
      name: 'Tata Intra Goods (3T)',
      capacityTons: 3.0,
      fuelPercent: 88.0,
      status: VehicleStatus.AVAILABLE,
      lastLat: 12.9716,
      lastLng: 77.5946,
      lastSpeed: 0.0,
    },
  });

  // 2. Create or update the 2 drivers assigned to the trucks
  await prisma.driver.upsert({
    where: { phone: '9876543210' },
    update: {
      name: 'Driver 1 (Eicher)',
      licenseNumber: 'DL-KA-2024-001',
      vehicleId: eicher.id,
    },
    create: {
      name: 'Driver 1 (Eicher)',
      phone: '9876543210',
      licenseNumber: 'DL-KA-2024-001',
      vehicleId: eicher.id,
    },
  });

  await prisma.driver.upsert({
    where: { phone: '9876543211' },
    update: {
      name: 'Driver 2 (Tata Intra)',
      licenseNumber: 'DL-KA-2024-002',
      vehicleId: tataIntra.id,
    },
    create: {
      name: 'Driver 2 (Tata Intra)',
      phone: '9876543211',
      licenseNumber: 'DL-KA-2024-002',
      vehicleId: tataIntra.id,
    },
  });

  console.log('Zahara Road Lines fleet & drivers seeded successfully!');
}

async function run() {
  try {
    await main();
  } catch (err) {
    console.error('Error during seeding:', err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

run();