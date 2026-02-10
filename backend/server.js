const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
const connectDB = require('./config/db');

const { processRecurringTransactions } = require('./controllers/recurringController');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// ✅ ແກ້ໄຂ CORS - ລຶບ space ແລະ ເພີ່ມ localhost
const allowedOrigins = [
  'https://expense-tracker-eq5e.vercel.app',  // Production (ບໍ່ມີ space)
  'http://localhost:3000',                     // React default
  'http://localhost:5173',                     // Vite default
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: function(origin, callback) {
    // ອະນຸຍາດ requests ທີ່ບໍ່ມີ origin (ເຊັ່ນ: mobile apps, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ແລ່ນທຸກວັນ ເວລາ 00:01
cron.schedule('1 0 * * *', async () => {
  console.log('Processing recurring transactions...');
  try {
    await processRecurringTransactions();
  } catch (err) {
    console.error('Cron job failed:', err.message);
  }
});

// Routes
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes'));
app.use('/api/export', require('./routes/exportRoutes'));
app.use('/api/recurring', require('./routes/recurringRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'ລະບົກບັນທຶກລາຍຮັບ-ລາຍຈ່າຍ API ເຮັດວຽກປົກກະຕິ',
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'ເກີດຂໍ້ຜິດພາດພາຍໃນເຊີບເວີ',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'ບໍ່ພົບ API endpoint ທີ່ຮ້ອງຂໍ'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  🚀 ເຊີບເວີເຊື່ອມຕໍ່ສຳເລັດ
  📍 Port: ${PORT}
  🌍 Environment: ${process.env.NODE_ENV || 'production'}
  🌐 Allowed Origins: ${allowedOrigins.join(', ')}
  `);
});