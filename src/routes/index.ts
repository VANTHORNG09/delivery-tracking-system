import { Router } from 'express';
import authRoutes from './auth.routes';
import parcelRoutes from './parcel.routes';
import deliveryRoutes from './delivery.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/parcels', parcelRoutes);
router.use('/deliveries', deliveryRoutes);

export default router;
