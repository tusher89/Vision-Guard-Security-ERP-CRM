/**
 * Converts a numeric amount to English words for commercial quotation & invoice documents.
 * Supports both International (Thousands/Millions) and Subcontinental (Lakhs/Crores) formats.
 */

const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];

const tens = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

function convertBelowThousand(n: number): string {
  let str = '';
  if (n >= 100) {
    str += ones[Math.floor(n / 100)] + ' Hundred ';
    n %= 100;
  }
  if (n >= 20) {
    str += tens[Math.floor(n / 10)] + ' ';
    n %= 10;
  }
  if (n > 0) {
    str += ones[n] + ' ';
  }
  return str.trim();
}

export function numberToWords(amount: number, currencyCode: string = 'BDT'): string {
  if (amount === 0) return 'Zero Only';
  if (isNaN(amount)) return '';

  const rounded = Math.round(amount * 100) / 100;
  const integerPart = Math.floor(rounded);
  const decimalPart = Math.round((rounded - integerPart) * 100);

  let currencyUnit = 'Taka';
  let subunit = 'Poisha';

  switch (currencyCode.toUpperCase()) {
    case 'USD':
      currencyUnit = 'Dollars';
      subunit = 'Cents';
      break;
    case 'EUR':
      currencyUnit = 'Euros';
      subunit = 'Cents';
      break;
    case 'GBP':
      currencyUnit = 'Pounds';
      subunit = 'Pence';
      break;
    case 'INR':
      currencyUnit = 'Rupees';
      subunit = 'Paise';
      break;
    case 'AED':
      currencyUnit = 'Dirhams';
      subunit = 'Fils';
      break;
    case 'SAR':
      currencyUnit = 'Riyals';
      subunit = 'Halalas';
      break;
    case 'BDT':
    default:
      currencyUnit = 'Taka';
      subunit = 'Poisha';
      break;
  }

  let words = '';

  // For BDT and INR, South Asian numbering (Lakh, Crore) is widely used and appreciated
  if (currencyCode === 'BDT' || currencyCode === 'INR') {
    let num = integerPart;
    const crore = Math.floor(num / 10000000);
    num %= 10000000;
    const lakh = Math.floor(num / 100000);
    num %= 100000;
    const thousand = Math.floor(num / 1000);
    num %= 1000;
    const remainder = num;

    if (crore > 0) {
      words += convertBelowThousand(crore) + ' Crore ';
    }
    if (lakh > 0) {
      words += convertBelowThousand(lakh) + ' Lakh ';
    }
    if (thousand > 0) {
      words += convertBelowThousand(thousand) + ' Thousand ';
    }
    if (remainder > 0) {
      words += convertBelowThousand(remainder) + ' ';
    }
  } else {
    // International numbering
    let num = integerPart;
    const billion = Math.floor(num / 1000000000);
    num %= 1000000000;
    const million = Math.floor(num / 1000000);
    num %= 1000000;
    const thousand = Math.floor(num / 1000);
    num %= 1000;
    const remainder = num;

    if (billion > 0) {
      words += convertBelowThousand(billion) + ' Billion ';
    }
    if (million > 0) {
      words += convertBelowThousand(million) + ' Million ';
    }
    if (thousand > 0) {
      words += convertBelowThousand(thousand) + ' Thousand ';
    }
    if (remainder > 0) {
      words += convertBelowThousand(remainder) + ' ';
    }
  }

  words = words.trim();
  if (!words) words = 'Zero';

  let result = `${words} ${currencyUnit}`;

  if (decimalPart > 0) {
    const decimalWords = convertBelowThousand(decimalPart);
    result += ` and ${decimalWords} ${subunit}`;
  }

  return `${result} Only`;
}
