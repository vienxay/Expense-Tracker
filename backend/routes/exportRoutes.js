const express = require('express');
const router = express.Router();
const { exportExcel, exportPDF } = require('../controllers/exportController');

// @route   GET /api/export/excel
router.get('/excel', exportExcel);

// @route   GET /api/export/pdf
router.get('/pdf', exportPDF);

module.exports = router;