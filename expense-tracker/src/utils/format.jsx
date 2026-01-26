import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';

// Format ເງິນ
export const formatCurrency = (amount, currency = 'LAK') => {
  const formats = {
    LAK: { locale: 'lo-LA', symbol: '₭', decimals: 0 },
    THB: { locale: 'th-TH', symbol: '฿', decimals: 2 },
    USD: { locale: 'en-US', symbol: '$', decimals: 2 },
  };

  const config = formats[currency] || formats.LAK;
  
  return new Intl.NumberFormat(config.locale, {
    style: 'decimal',
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  }).format(amount) + ' ' + config.symbol;
};

// Format ວັນທີ
export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
};

// Format ວັນທີເປັນພາສາລາວ
export const formatDateLao = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (isToday(dateObj)) return 'ມື້ນີ້';
  if (isYesterday(dateObj)) return 'ມື້ວານ';
  
  const months = [
    'ມັງກອນ', 'ກຸມພາ', 'ມີນາ', 'ເມສາ', 'ພຶດສະພາ', 'ມິຖຸນາ',
    'ກໍລະກົດ', 'ສິງຫາ', 'ກັນຍາ', 'ຕຸລາ', 'ພະຈິກ', 'ທັນວາ'
  ];
  
  const day = dateObj.getDate();
  const month = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  
  return `${day} ${month} ${year}`;
};

// Format ເວລາຜ່ານມາ
export const formatTimeAgo = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

// Format ເລກ
export const formatNumber = (num) => {
  return new Intl.NumberFormat('lo-LA').format(num);
};

// ຊື່ບັນຊີ
export const getAccountName = (account) => {
  const accounts = {
    cash: 'ເງິນສົດ',
    bank: 'ທະນາຄານ',
    ewallet: 'E-Wallet'
  };
  return accounts[account] || account;
};

// ຊື່ສະກຸນເງິນ
export const getCurrencyName = (currency) => {
  const currencies = {
    LAK: 'ກີບ',
    THB: 'ບາດ',
    USD: 'ໂດລາ'
  };
  return currencies[currency] || currency;
};

// ຊື່ເດືອນ
export const getMonthName = (month) => {
  const months = [
    'ມັງກອນ', 'ກຸມພາ', 'ມີນາ', 'ເມສາ', 'ພຶດສະພາ', 'ມິຖຸນາ',
    'ກໍລະກົດ', 'ສິງຫາ', 'ກັນຍາ', 'ຕຸລາ', 'ພະຈິກ', 'ທັນວາ'
  ];
  return months[month - 1] || '';
};