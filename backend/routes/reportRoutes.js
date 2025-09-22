import express from 'express';
import { createReport, getReports, updateReportStatus } from '../controllers/reportController.js';

const router = express.Router();

// Create a new report
router.post('/create', createReport);

// Get all reports (admin only)
router.get('/all', getReports);

// Update report status (admin only)
router.put('/update-status', updateReportStatus);

export default router;