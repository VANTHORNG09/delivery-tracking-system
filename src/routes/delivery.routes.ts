import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createDelivery,
  getDeliveries,
  getDeliveryById,
  assignDriver,
  startDelivery,
  completeDelivery,
  updateLocation,
} from '../controllers/delivery.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  [
    body('parcelId').isUUID().withMessage('Valid parcel ID is required'),
    body('driverId').optional().isUUID().withMessage('Valid driver ID is required'),
    validateRequest,
  ],
  createDelivery
);

router.get('/', authenticate, getDeliveries);

router.get(
  '/:id',
  authenticate,
  [param('id').isUUID().withMessage('Invalid delivery ID'), validateRequest],
  getDeliveryById
);

router.patch(
  '/:id/assign',
  authenticate,
  authorize('ADMIN'),
  [
    param('id').isUUID().withMessage('Invalid delivery ID'),
    body('driverId').isUUID().withMessage('Valid driver ID is required'),
    validateRequest,
  ],
  assignDriver
);

router.patch(
  '/:id/start',
  authenticate,
  authorize('DRIVER'),
  [param('id').isUUID().withMessage('Invalid delivery ID'), validateRequest],
  startDelivery
);

router.patch(
  '/:id/complete',
  authenticate,
  authorize('DRIVER'),
  [
    param('id').isUUID().withMessage('Invalid delivery ID'),
    body('notes').optional().isString(),
    body('proofOfDelivery').optional().isString(),
    body('signature').optional().isString(),
    validateRequest,
  ],
  completeDelivery
);

router.post(
  '/:id/location',
  authenticate,
  authorize('DRIVER'),
  [
    param('id').isUUID().withMessage('Invalid delivery ID'),
    body('latitude')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Valid latitude is required'),
    body('longitude')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Valid longitude is required'),
    body('accuracy').optional().isFloat({ min: 0 }),
    validateRequest,
  ],
  updateLocation
);

export default router;
