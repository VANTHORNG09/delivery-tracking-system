import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';
import { ParcelStatus } from '@prisma/client';

export const createParcel = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      description,
      weight,
      dimensions,
      value,
      priority,
      receiverId,
      pickupAddress,
      deliveryAddress,
      estimatedDelivery,
      specialInstructions,
    } = req.body;

    const parcel = await prisma.parcel.create({
      data: {
        description,
        weight,
        dimensions,
        value,
        priority: priority || 'STANDARD',
        senderId: req.user!.userId,
        receiverId,
        pickupAddress,
        deliveryAddress,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
        specialInstructions,
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        receiver: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    await prisma.trackingEvent.create({
      data: {
        parcelId: parcel.id,
        status: 'PENDING',
        description: 'Parcel created and awaiting pickup',
        location: pickupAddress,
      },
    });

    res.status(201).json({
      status: 'success',
      data: { parcel },
    });
  } catch (error) {
    next(error);
  }
};

export const getParcels = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status } = req.query;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    let where: Record<string, unknown> = {};

    if (userRole === 'CUSTOMER') {
      where = {
        OR: [{ senderId: userId }, { receiverId: userId }],
      };
    }

    if (status) {
      where.status = status as ParcelStatus;
    }

    const parcels = await prisma.parcel.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        receiver: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        delivery: {
          include: {
            driver: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      status: 'success',
      data: { parcels, count: parcels.length },
    });
  } catch (error) {
    next(error);
  }
};

export const getParcelById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const parcel = await prisma.parcel.findUnique({
      where: { id },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        receiver: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        delivery: {
          include: {
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
              take: 10,
            },
          },
        },
        trackingEvents: {
          orderBy: {
            timestamp: 'desc',
          },
        },
      },
    });

    if (!parcel) {
      throw new NotFoundError('Parcel not found');
    }

    if (
      req.user!.role === 'CUSTOMER' &&
      parcel.senderId !== req.user!.userId &&
      parcel.receiverId !== req.user!.userId
    ) {
      throw new ForbiddenError('Access denied');
    }

    res.json({
      status: 'success',
      data: { parcel },
    });
  } catch (error) {
    next(error);
  }
};

export const getParcelByTrackingNumber = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { trackingNumber } = req.params;

    const parcel = await prisma.parcel.findUnique({
      where: { trackingNumber },
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
        delivery: {
          include: {
            driver: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
        trackingEvents: {
          orderBy: {
            timestamp: 'desc',
          },
        },
      },
    });

    if (!parcel) {
      throw new NotFoundError('Parcel not found');
    }

    res.json({
      status: 'success',
      data: { parcel },
    });
  } catch (error) {
    next(error);
  }
};

export const updateParcelStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, description, location, latitude, longitude } = req.body;

    const parcel = await prisma.parcel.findUnique({
      where: { id },
    });

    if (!parcel) {
      throw new NotFoundError('Parcel not found');
    }

    const updatedParcel = await prisma.parcel.update({
      where: { id },
      data: {
        status,
        ...(status === 'PICKED_UP' && { pickupDate: new Date() }),
        ...(status === 'DELIVERED' && { deliveryDate: new Date() }),
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        receiver: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    await prisma.trackingEvent.create({
      data: {
        parcelId: id,
        status,
        description,
        location,
        latitude,
        longitude,
      },
    });

    res.json({
      status: 'success',
      data: { parcel: updatedParcel },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteParcel = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const parcel = await prisma.parcel.findUnique({
      where: { id },
    });

    if (!parcel) {
      throw new NotFoundError('Parcel not found');
    }

    if (req.user!.role === 'CUSTOMER' && parcel.senderId !== req.user!.userId) {
      throw new ForbiddenError('Only the sender can delete this parcel');
    }

    if (parcel.status !== 'PENDING') {
      throw new BadRequestError('Only pending parcels can be deleted');
    }

    await prisma.parcel.delete({
      where: { id },
    });

    res.json({
      status: 'success',
      message: 'Parcel deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
