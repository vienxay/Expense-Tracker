const mongoose = require('mongoose');

const connectDB = async () => {
    try {
         // ✅ ແກ້ໄຂແລ້ວ: ເອົາ options ອອກ
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ເຊື່ອມຕໍ່ຖານຂໍ້ມູນສຳເລັດ`);
  } catch (error) {
    console.error(`❌ Error: ຖານຂໍ້ມູນບໍ່ສາມາດເຊື່ອມຕໍ່ໄດ້`, error.message);
    process.exit(1);
  }
};

module.exports = connectDB;