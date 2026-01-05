import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createParcel,
  getParcels,
  getParcelById,
  getParcelByTrackingNumber,
  updateParcelStatus,
  deleteParcel,
} from '../controllers/parcel.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';

const router = Router();

router.post(
  '/',
  authenticate,
  [
    body('description').notEmpty().withMessage('Description is required'),
    body('weight').isFloat({ min: 0 }).withMessage('Weight must be a positive number'),
    body('receiverId').notEmpty().withMessage('Receiver ID is required'),
    body('pickupAddress').notEmpty().withMessage('Pickup address is required'),
    body('deliveryAddress').notEmpty().withMessage('Delivery address is required'),
    body('priority')
      .optional()
      .isIn(['STANDARD', 'EXPRESS', 'SAME_DAY'])
      .withMessage('Invalid priority'),
    validateRequest,
  ],
  createParcel
);

router.get('/', authenticate, getParcels);

router.get(
  '/:id',
  authenticate,
  [param('id').isUUID().withMessage('Invalid parcel ID'), validateRequest],
  getParcelById
);

router.get(
  '/tracking/:trackingNumber',
  authenticate,
  [
    param('trackingNumber').notEmpty().withMessage('Tracking number is required'),
    validateRequest,
  ],
  getParcelByTrackingNumber
);

router.patch(
  '/:id/status',
  authenticate,
  authorize('ADMIN', 'DRIVER'),
  [
    param('id').isUUID().withMessage('Invalid parcel ID'),
    body('status')
      .isIn([
        'PENDING',
        'PICKED_UP',
        'IN_TRANSIT',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'FAILED',
        'CANCELLED',
      ])
      .withMessage('Invalid status'),
    body('description').notEmpty().withMessage('Description is required'),
    validateRequest,
  ],
  updateParcelStatus
);

router.delete(
  '/:id',
  authenticate,
  [param('id').isUUID().withMessage('Invalid parcel ID'), validateRequest],
  deleteParcel
);

export default router;
