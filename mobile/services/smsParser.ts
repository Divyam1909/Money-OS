import { Transaction, TransactionType } from '../types';

const IGNORE_KEYWORDS = ['otp', 'verification', 'code', 'expire', 'loan', 'offer', 'login', 'balance'];

const CATEGORY_MAP: Record<string, string[]> = {
  'Food & Dining': ['zomato', 'swiggy', 'pizza', 'starbucks', 'restaurant', 'mcdonalds', 'kfc', 'cafe'],
  'Transportation': ['uber', 'ola', 'rapido', 'fuel', 'petrol', 'shell', 'hpcl', 'bpcl'],
  'Shopping': ['amazon', 'flipkart', 'myntra', 'retail', 'ajio', 'zara', 'h&m'],
  'Utilities': ['jio', 'airtel', 'bill', 'recharge', 'electricity', 'water', 'gas'],
};

const generateHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
};

export const parseIncomingSms = (body: string, sender: string): Transaction | null => {
  const lowerBody = body.toLowerCase();

  // 1. Filter out non-financial noise
  if (IGNORE_KEYWORDS.some(k => lowerBody.includes(k))) return null;

  // 2. Detect Transactional intent
  const isTransactional = lowerBody.includes("rs.") || 
                          lowerBody.includes("inr") || 
                          lowerBody.includes("₹") ||
                          lowerBody.includes("debited") ||
                          lowerBody.includes("credited") ||
                          lowerBody.includes("paid") ||
                          lowerBody.includes("spent");

  if (!isTransactional) return null;

  // 3. Amount Extraction
  const amountRegex = /(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d{1,2})?)/i;
  const match = body.match(amountRegex);
  if (!match) return null;

  const amount = parseFloat(match[1].replace(/,/g, ''));
  if (isNaN(amount) || amount === 0) return null;

  // 4. Type Detection
  let type: TransactionType = 'DEBIT';
  if (lowerBody.includes('credited') || lowerBody.includes('received') || lowerBody.includes('refund')) {
    type = 'CREDIT';
  }

  // 5. Description & Category
  let description = sender || "SMS Transaction";
  let category = type === 'CREDIT' ? "Income" : "Uncategorized";

  if (type === 'DEBIT') {
    for (const [cat, keywords] of Object.entries(CATEGORY_MAP)) {
      if (keywords.some(k => lowerBody.includes(k))) {
        category = cat;
        break;
      }
    }
  }

  const dateStr = new Date().toISOString().split('T')[0];
  const hash = generateHash(`${amount}-${description}-${dateStr}`);

  return {
    id: hash,
    hash: hash,
    type,
    amount,
    category,
    description,
    date: dateStr,
    firewallDecision: 'ALLOW',
    firewallReason: 'Edge Processed'
  };
};
