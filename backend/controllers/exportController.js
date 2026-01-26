const Transaction = require('../models/Transaction');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

// @desc    Export transactions to Excel
// @route   GET /api/export/excel
// @access  Public
const exportExcel = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    
    // Build query
    const query = {};
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (type) query.type = type;

    const transactions = await Transaction.find(query)
      .populate('category', 'name icon')
      .sort({ date: -1 });

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Expense Tracker';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('ທຸລະກຳ', {
      properties: { tabColor: { argb: '22c55e' } }
    });

    // Define columns
    worksheet.columns = [
      { header: 'ວັນທີ', key: 'date', width: 15 },
      { header: 'ປະເພດ', key: 'type', width: 12 },
      { header: 'ໝວດໝູ່', key: 'category', width: 20 },
      { header: 'ຈຳນວນເງິນ', key: 'amount', width: 18 },
      { header: 'ສະກຸນເງິນ', key: 'currency', width: 12 },
      { header: 'ບັນຊີ', key: 'account', width: 15 },
      { header: 'ລາຍລະອຽດ', key: 'description', width: 30 },
      { header: 'ໝາຍເຫດ', key: 'note', width: 30 }
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '22c55e' }
    };
    worksheet.getRow(1).alignment = { horizontal: 'center' };

    // Add data
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((t) => {
      const row = worksheet.addRow({
        date: new Date(t.date).toLocaleDateString('lo-LA'),
        type: t.type === 'income' ? 'ລາຍຮັບ' : 'ລາຍຈ່າຍ',
        category: `${t.category?.icon || ''} ${t.category?.name || 'ບໍ່ລະບຸ'}`,
        amount: t.amount,
        currency: t.currency,
        account: getAccountName(t.account),
        description: t.description || '',
        note: t.note || ''
      });

      // Color rows based on type
      if (t.type === 'income') {
        totalIncome += t.amount;
        row.getCell('amount').font = { color: { argb: '22c55e' } };
      } else {
        totalExpense += t.amount;
        row.getCell('amount').font = { color: { argb: 'ef4444' } };
      }
    });

    // Add summary rows
    worksheet.addRow([]);
    const summaryStartRow = worksheet.rowCount + 1;
    
    worksheet.addRow(['', '', 'ລາຍຮັບລວມ:', totalIncome, '', '', '', '']);
    worksheet.addRow(['', '', 'ລາຍຈ່າຍລວມ:', totalExpense, '', '', '', '']);
    worksheet.addRow(['', '', 'ຍອດຄົງເຫຼືອ:', totalIncome - totalExpense, '', '', '', '']);

    // Style summary
    for (let i = summaryStartRow; i <= worksheet.rowCount; i++) {
      worksheet.getRow(i).font = { bold: true };
    }

    // Format amount column as number
    worksheet.getColumn('amount').numFmt = '#,##0';

    // Set response headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=expense-report-${Date.now()}.xlsx`
    );

    // Write to response
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Export Excel Error:', error);
    res.status(500).json({ message: 'ເກີດຂໍ້ຜິດພາດໃນການສົ່ງອອກ Excel' });
  }
};

// @desc    Export transactions to PDF
// @route   GET /api/export/pdf
// @access  Public
const exportPDF = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;

    // Build query
    const query = {};
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (type) query.type = type;

    const transactions = await Transaction.find(query)
      .populate('category', 'name icon')
      .sort({ date: -1 });

    let totalIncome = 0;
    let totalExpense = 0;
    transactions.forEach(t => {
      if (t.type === 'income') totalIncome += t.amount;
      else totalExpense += t.amount;
    });

    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Register TTF font (ຕ້ອງມີ font TTF ໃນ project folder)
    doc.registerFont('NotoLao', './fonts/NotoSansLao.ttf');
    doc.font('NotoLao'); // ໃຊ້ font ສຳລັບທຸກຂໍ້ຄວາມລາວ

    // Response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=expense-report-${Date.now()}.pdf`
    );

    doc.pipe(res);

    // Title
    doc.fontSize(20).text('ລາຍງານການເງິນ', { align: 'center' });
    doc.fontSize(12).text('Expense Report', { align: 'center' });
    doc.moveDown();

    // Date range
    if (startDate && endDate) {
      doc.fontSize(10).text(`ວັນທີ: ${startDate} - ${endDate}`, { align: 'center' });
    }
    doc.text(`ສ້າງເມື່ອ: ${new Date().toLocaleDateString('lo-LA')}`, { align: 'center' });
    doc.moveDown(2);

    // Summary Box
    doc.rect(50, doc.y, 495, 80).stroke();
    const summaryY = doc.y + 10;
    
    doc.fontSize(12);
    doc.text(`ລາຍຮັບລວມ: ${formatNumber(totalIncome)} LAK`, 70, summaryY);
    doc.text(`ລາຍຈ່າຍລວມ: ${formatNumber(totalExpense)} LAK`, 70, summaryY + 20);
    doc.text(`ຍອດຄົງເຫຼືອ: ${formatNumber(totalIncome - totalExpense)} LAK`, 70, summaryY + 40);

    doc.moveDown(5);

    // Table Header
    const tableTop = doc.y;
    const tableHeaders = ['ວັນທີ', 'ປະເພດ', 'ໝວດໝູ່', 'ຈຳນວນ', 'ບັນຊີ'];
    const colWidths = [80, 70, 120, 100, 80];
    let xPos = 50;

    doc.rect(50, tableTop - 5, 495, 20).fill('#22c55e');
    doc.fillColor('#ffffff').fontSize(10);
    tableHeaders.forEach((header, i) => {
      doc.text(header, xPos + 5, tableTop, { width: colWidths[i] - 10 });
      xPos += colWidths[i];
    });

    // Table rows
    doc.fillColor('#000000');
    let rowY = tableTop + 25;

    transactions.forEach((t, index) => {
      if (rowY > 750) {
        doc.addPage();
        rowY = 50;
      }

      // Alternate row colors
      if (index % 2 === 0) {
        doc.rect(50, rowY - 5, 495, 18).fill('#f8fafc');
        doc.fillColor('#000000');
      }

      xPos = 50;
      const rowData = [
        new Date(t.date).toLocaleDateString('lo-LA'),
        t.type === 'income' ? 'ລາຍຮັບ' : 'ລາຍຈ່າຍ',
        t.category?.name || 'ບໍ່ລະບຸ',
        formatNumber(t.amount),
        getAccountName(t.account)
      ];

      rowData.forEach((data, i) => {
        if (i === 3) doc.fillColor(t.type === 'income' ? '#22c55e' : '#ef4444');
        doc.text(data, xPos + 5, rowY, { width: colWidths[i] - 10 });
        if (i === 3) doc.fillColor('#000000');
        xPos += colWidths[i];
      });

      rowY += 20;
    });

    // Footer
    doc.fontSize(8).text(
      'ສ້າງໂດຍ: ລະບົບບັນທຶກລາຍຮັບ-ລາຍຈ່າຍ',
      50,
      doc.page.height - 50,
      { align: 'center' }
    );

    doc.end();

  } catch (error) {
    console.error('Export PDF Error:', error);
    res.status(500).json({ message: 'ເກີດຂໍ້ຜິດພາດໃນການສົ່ງອອກ PDF' });
  }
};


// Helper functions
const getAccountName = (account) => {
  const accounts = {
    cash: 'ເງິນສົດ',
    bank: 'ທະນາຄານ',
    ewallet: 'E-Wallet'
  };
  return accounts[account] || account;
};

const formatNumber = (num) => {
  return new Intl.NumberFormat('lo-LA').format(num);
};

module.exports = {
  exportExcel,
  exportPDF
};