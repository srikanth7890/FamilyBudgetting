export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: '﷼' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك' },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: 'د.ب' },
  { code: 'OMR', name: 'Omani Rial', symbol: '﷼' },
  { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.ا' },
  { code: 'LBP', name: 'Lebanese Pound', symbol: 'ل.ل' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'ج.م' },
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫' },
  { code: 'TWD', name: 'Taiwan Dollar', symbol: 'NT$' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨' },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' },
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: '₨' },
  { code: 'NPR', name: 'Nepalese Rupee', symbol: '₨' },
  { code: 'MMK', name: 'Myanmar Kyat', symbol: 'K' },
  { code: 'KHR', name: 'Cambodian Riel', symbol: '៛' },
  { code: 'LAK', name: 'Lao Kip', symbol: '₭' },
  { code: 'BND', name: 'Brunei Dollar', symbol: 'B$' },
  { code: 'FJD', name: 'Fijian Dollar', symbol: 'FJ$' },
  { code: 'PGK', name: 'Papua New Guinea Kina', symbol: 'K' },
  { code: 'SBD', name: 'Solomon Islands Dollar', symbol: 'SI$' },
  { code: 'VUV', name: 'Vanuatu Vatu', symbol: 'Vt' },
  { code: 'WST', name: 'Samoan Tala', symbol: 'WS$' },
  { code: 'TOP', name: 'Tongan Paʻanga', symbol: 'T$' },
  { code: 'XPF', name: 'CFP Franc', symbol: '₣' },
];

export const getCurrencyInfo = (code: string): CurrencyInfo | undefined => {
  return CURRENCIES.find(currency => currency.code === code);
};

export const getCurrencySymbol = (code: string): string => {
  const currency = getCurrencyInfo(code);
  return currency ? currency.symbol : code;
};

export const formatCurrency = (amount: number, currencyCode: string = 'USD'): string => {
  const currency = getCurrencyInfo(currencyCode);
  const symbol = currency ? currency.symbol : currencyCode;
  
  // Handle different decimal places for different currencies
  const decimalPlaces = ['JPY', 'KRW', 'VND', 'IDR', 'PKR', 'LKR', 'NPR', 'MMK', 'KHR', 'LAK'].includes(currencyCode) ? 0 : 2;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(amount).replace(currencyCode, symbol);
};

// Helper function to format currency using user's preferred currency
export const formatCurrencyForUser = (amount: number, userCurrency: string = 'USD'): string => {
  return formatCurrency(amount, userCurrency);
};
