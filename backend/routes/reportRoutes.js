import express from 'express';
import { createReport, deleteReportPost, getReports, getSingleReport, updateReportStatus } from '../controllers/reportController.js';
import userAuth from '../middleware/userauth.js';

const router = express.Router();

// Create a new report
router.post('/create', createReport);

// Get all reports (admin only)
router.get('/:reportId/single-report', getSingleReport);
router.get('/all',userAuth, getReports);

// Update report status (admin only)
router.put('/:reportId/update-status', updateReportStatus);
router.delete('/:reportPostId/delete',deleteReportPost);

export default router;