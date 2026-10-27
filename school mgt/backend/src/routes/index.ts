import { Router } from 'express';
import authRoutes from './auth.routes';
import ownerRoutes from './owner.routes';
import adminRoutes from './admin.routes';
import teacherRoutes from './teacher.routes';
import studentRoutes from './student.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/owner', ownerRoutes);
router.use('/admin', adminRoutes);
router.use('/teacher', teacherRoutes);
router.use('/student', studentRoutes);

export default router;
