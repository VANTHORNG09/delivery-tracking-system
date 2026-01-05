import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';

export const createDelivery = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { parcelId, driverId } = req.body;

    const parcel = await prisma.parcel.findUnique({
      where: { id: parcelId },
      include: { delivery: true },
    });

    if (!parcel) {
      throw new NotFoundError('Parcel not found');
    }

    if (parcel.delivery) {
      throw new BadRequestError('Delivery already exists for this parcel');
    }

    const delivery = await prisma.delivery.create({
      data: {
        parcelId,
        driverId,
        assignedAt: driverId ? new Date() : null,
      },
      include: {
        parcel: {
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            receiver: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    if (driverId) {
      await prisma.trackingEvent.create({
        data: {
          parcelId,
          status: 'IN_TRANSIT',
          description: 'Delivery assigned to driver',
        },
      });

      await prisma.parcel.update({
        where: { id: parcelId },
        data: { status: 'IN_TRANSIT' },
      });
    }

    res.status(201).json({
      status: 'success',
      data: { delivery },
    });
  } catch (error) {
    next(error);
  }
};

export const getDeliveries = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const where: Record<string, unknown> = {};

    if (userRole === 'DRIVER') {
      where.driverId = userId;
    }

    const deliveries = await prisma.delivery.findMany({
      where,
      include: {
        parcel: {
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            receiver: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      status: 'success',
      data: { deliveries, count: deliveries.length },
    });
  } catch (error) {
    next(error);
  }
};

export const getDeliveryById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const delivery = await prisma.delivery.findUnique({
      where: { id },
      include: {
        parcel: {
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            receiver: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            trackingEvents: {
              orderBy: {
                timestamp: 'desc',
              },
            },
          },
        },
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        locations: {
          orderBy: {
            timestamp: 'desc',
          },
          take: 50,
        },
      },
    });

    if (!delivery) {
      throw new NotFoundError('Delivery not found');
    }

    if (
      req.user!.role === 'DRIVER' &&
      delivery.driverId !== req.user!.userId
    ) {
      throw new ForbiddenError('Access denied');
    }

    res.json({
      status: 'success',
      data: { delivery },
    });
  } catch (error) {
    next(error);
  }
};

export const assignDriver = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { driverId } = req.body;

    const delivery = await prisma.delivery.findUnique({
      where: { id },
      include: { parcel: true },
    });

    if (!delivery) {
      throw new NotFoundError('Delivery not found');
    }

    const driver = await prisma.user.findUnique({
      where: { id: driverId },
    });

    if (!driver || driver.role !== 'DRIVER') {
      throw new BadRequestError('Invalid driver ID');
    }

    const updatedDelivery = await prisma.delivery.update({
      where: { id },
      data: {
        driverId,
        assignedAt: new Date(),
      },
      include: {
        parcel: true,
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    await prisma.trackingEvent.create({
      data: {
        parcelId: delivery.parcelId,
        status: 'IN_TRANSIT',
        description: `Delivery assigned to ${driver.firstName} ${driver.lastName}`,
      },
    });

    await prisma.parcel.update({
      where: { id: delivery.parcelId },
      data: { status: 'IN_TRANSIT' },
    });

    res.json({
      status: 'success',
      data: { delivery: updatedDelivery },
    });
  } catch (error) {
    next(error);
  }
};

export const startDelivery = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const delivery = await prisma.delivery.findUnique({
      where: { id },
      include: { parcel: true },
    });

    if (!delivery) {
      throw new NotFoundError('Delivery not found');
    }

    if (delivery.driverId !== req.user!.userId) {
      throw new ForbiddenError('Only assigned driver can start delivery');
    }

    if (delivery.startedAt) {
      throw new BadRequestError('Delivery already started');
    }

    const updatedDelivery = await prisma.delivery.update({
      where: { id },
      data: {
        startedAt: new Date(),
      },
      include: {
        parcel: true,
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    await prisma.trackingEvent.create({
      data: {
        parcelId: delivery.parcelId,
        status: 'OUT_FOR_DELIVERY',
        description: 'Parcel is out for delivery',
      },
    });

    await prisma.parcel.update({
      where: { id: delivery.parcelId },
      data: { status: 'OUT_FOR_DELIVERY' },
    });

    res.json({
      status: 'success',
      data: { delivery: updatedDelivery },
    });
  } catch (error) {
    next(error);
  }
};

export const completeDelivery = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { notes, proofOfDelivery, signature } = req.body;

    const delivery = await prisma.delivery.findUnique({
      where: { id },
      include: { parcel: true },
    });

    if (!delivery) {
      throw new NotFoundError('Delivery not found');
    }

    if (delivery.driverId !== req.user!.userId) {
      throw new ForbiddenError('Only assigned driver can complete delivery');
    }

    if (delivery.completedAt) {
      throw new BadRequestError('Delivery already completed');
    }

    const updatedDelivery = await prisma.delivery.update({
      where: { id },
      data: {
        completedAt: new Date(),
        notes,
        proofOfDelivery,
        signature,
      },
      include: {
        parcel: true,
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    await prisma.trackingEvent.create({
      data: {
        parcelId: delivery.parcelId,
        status: 'DELIVERED',
        description: 'Parcel delivered successfully',
        location: delivery.parcel.deliveryAddress,
      },
    });

    await prisma.parcel.update({
      where: { id: delivery.parcelId },
      data: {
        status: 'DELIVERED',
        deliveryDate: new Date(),
      },
    });

    res.json({
      status: 'success',
      data: { delivery: updatedDelivery },
    });
  } catch (error) {
    next(error);
  }
};

export const updateLocation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { latitude, longitude, accuracy } = req.body;

    const delivery = await prisma.delivery.findUnique({
      where: { id },
    });

    if (!delivery) {
      throw new NotFoundError('Delivery not found');
    }

    if (delivery.driverId !== req.user!.userId) {
      throw new ForbiddenError('Only assigned driver can update location');
    }

    await prisma.location.create({
      data: {
        deliveryId: id,
        latitude,
        longitude,
        accuracy,
      },
    });

    await prisma.delivery.update({
      where: { id },
      data: {
        currentLatitude: latitude,
        currentLongitude: longitude,
      },
    });

    res.json({
      status: 'success',
      message: 'Location updated successfully',
    });
  } catch (error) {
    next(error);
  }
};
