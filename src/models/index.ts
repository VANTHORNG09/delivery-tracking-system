import prisma from '../config/database';

export const UserModel = prisma.user;
export const ParcelModel = prisma.parcel;
export const DeliveryModel = prisma.delivery;
export const TrackingEventModel = prisma.trackingEvent;
export const LocationModel = prisma.location;

export default prisma;
