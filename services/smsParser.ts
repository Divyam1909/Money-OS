import { Transaction } from "../types";

// --- CONFIGURATION ---

const IGNORE_KEYWORDS = [
  'otp', 'verification', 'code', 'expire', 'loan', 'offer', 'approve', 
  'request', 'balance', 'outstanding', 'due', 'login'
];

// Expanded Category Map
const CATEGORY_MAP: Record<string, string[]> = {
  'Food & Dining': ['zomato', 'swiggy', 'pizza', 'burger', 'kfc', 'mcdonalds', 'starbucks', 'cafe', 'coffee', 'restaurant', 'dining', 'food', 'bakery', 'blinkit', 'zepto'],
  'Transportation': ['uber', 'ola', 'rapido', 'petrol', 'fuel', 'pump', 'shell', 'indian oil', 'hpcl', 'bpcl', 'metro', 'toll', 'parking', 'fastag'],
  'Entertainment': ['netflix', 'spotify', 'youtube', 'prime', 'hotstar', 'cinema', 'movie', 'bookmyshow', 'pvr', 'inox', 'theatre', 'game', 'steam', 'playstation'],
  'Shopping': ['amazon', 'flipkart', 'myntra', 'ajio', 'zara', 'h&m', 'uniqlo', 'decathlon', 'retail', 'store', 'fashion', 'cloth', 'mall', 'mart', 'supermarket'],
  'Utilities': ['electricity', 'power', 'bescom', 'water', 'gas', 'bill', 'recharge', 'jio', 'airtel', 'vi', 'vodafone', 'bsnl', 'broadband', 'internet', 'wifi'],
  'Health': ['pharmacy', 'medical', 'hospital', 'clinic', 'doctor', 'apollo', '1mg', 'pharmeasy', 'medplus'],
  'Travel': ['irctc', 'rail', 'flight', 'indigo', 'air india', 'makemytrip', 'hotel', 'booking.com', 'airbnb', 'goibibo']
};

// --- UTILITIES ---

const generateHash = (str: string): string => {
  let hash = 0;
  if (str.length === 0) return hash.toString();
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
};

const normalizeText = (text: string): string => {
  return text
    .replace(/[^\w\s.,₹\-@]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

// --- MAIN PARSER (STRICT MODE) ---

export const parseSMS = (sms: { body: string; receivedAt: string; _id: string; from: string }): Transaction | null => {
  const cleanBody = normalizeText(sms.body);
  const lowerBody = cleanBody.toLowerCase();

  // 1. Spam Filter
  if (IGNORE_KEYWORDS.some(k => lowerBody.includes(k))) return null;

  // 2. Amount Extraction (STRICT ONLY)
  // Requires Rs., INR, or ₹ to be present
  const amountRegex = /(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d{1,2})?)/i;
  
  const match = cleanBody.match(amountRegex);
  if (!match) return null; // <--- Rejects "Paid 150"

  const amount = parseFloat(match[1].replace(/,/g, ''));
  if (isNaN(amount) || amount === 0) return null;

  // 3. Type Detection
  let type: 'DEBIT' | 'CREDIT' = 'DEBIT';
  if (lowerBody.includes('credited') || lowerBody.includes('received') || lowerBody.includes('refund')) {
    type = 'CREDIT';
  }

  // 4. Description
  let description = sms.from || "Manual Entry";
  const vpaMatch = cleanBody.match(/(?:vpa|upi|ref)[\s\-:]*([a-zA-Z0-9.\-_]+@[a-zA-Z]+)/i);
  if (vpaMatch) description = `UPI: ${vpaMatch[1]}`;

  // 5. Categorization (Local Fallback)
  let category = type === 'CREDIT' ? "Income" : "Uncategorized";
  if (type === 'DEBIT') {
    for (const [cat, keywords] of Object.entries(CATEGORY_MAP)) {
      if (keywords.some(k => lowerBody.includes(k))) {
        category = cat;
        break;
      }
    }
  }

  // 6. Hash
  const dateStr = new Date(sms.receivedAt).toISOString().split('T')[0];
  const hash = generateHash(`${amount}-${description}-${dateStr}-${sms.from}`);

  return {
    id: hash,
    hash: hash,
    type: type,
    amount: amount,
    category: category,
    description: description,
    date: dateStr,
    firewallDecision: 'ALLOW', 
    firewallReason: 'Manual Parse'
  };
};