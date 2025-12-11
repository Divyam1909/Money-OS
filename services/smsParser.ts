
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

/**
 * Generates a simple hash from string to deduplicate SMS
 */
const generateHash = (str: string): string => {
  let hash = 0;
  if (str.length === 0) return hash.toString();
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
};

/**
 * Normalizes text: removes special chars, extra spaces, lowercases
 */
const normalizeText = (text: string): string => {
  return text
    .replace(/[^\w\s.,₹\-@]/gi, ' ') // Keep only essential chars
    .replace(/\s+/g, ' ')
    .trim();
};

// --- MAIN PARSER ---

export const parseSMS = (sms: { body: string; receivedAt: string; _id: string; from: string }): Transaction | null => {
  const originalBody = sms.body;
  const cleanBody = normalizeText(originalBody);
  const lowerBody = cleanBody.toLowerCase();

  // 1. 🛡️ Spam Filter
  if (IGNORE_KEYWORDS.some(k => lowerBody.includes(k))) return null;

  // 2. 💰 Amount Extraction
  // Priority 1: Look for "Rs. X" or "INR X" or "₹X" specifically
  // Handles 1,200.50 and 1200
  const amountRegex = /(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d{1,2})?)/i;
  const keywordAmountRegex = /(?:debited|credited|paid|spent|sent|received)\s+(?:by|of)?\s*(?:rs\.?|inr|₹)?\s*([\d,]+(?:\.\d{1,2})?)/i;
  
  let amountMatch = cleanBody.match(amountRegex) || cleanBody.match(keywordAmountRegex);
  
  if (!amountMatch) return null;

  let amountStr = amountMatch[1].replace(/,/g, ''); // Remove commas
  const amount = parseFloat(amountStr);

  if (isNaN(amount) || amount === 0) return null;

  // 3. 💳 Determine Type (Debit vs Credit)
  let type: 'DEBIT' | 'CREDIT' = 'DEBIT'; // Default
  
  if (
    lowerBody.includes('credited') || 
    lowerBody.includes('received') || 
    lowerBody.includes('refund') || 
    lowerBody.includes('reversed') ||
    lowerBody.includes('deposited')
  ) {
    type = 'CREDIT';
  }

  // 4. 🏪 Merchant / Description Extraction (Chain of Responsibility)
  let description = "Unknown Transaction";

  // Pattern A: VPA/UPI (High confidence)
  const vpaMatch = cleanBody.match(/(?:vpa|upi|ref)[\s\-:]*([a-zA-Z0-9.\-_]+@[a-zA-Z]+)/i);
  
  // Pattern B: At/To/Info (Medium confidence)
  const merchantMatch = cleanBody.match(/(?:at|to|info|msg)\s+([a-zA-Z0-9\s&]+?)(?:\s+(?:on|ref|txn|is)|$)/i);
  
  if (vpaMatch) {
    description = `UPI: ${vpaMatch[1]}`;
  } else if (merchantMatch) {
    description = merchantMatch[1].trim();
  } else {
    // Fallback: Use sender ID
    description = sms.from || "Bank Transaction";
  }

  // Cleanup description
  description = description.substring(0, 30).trim(); // Truncate

  // 5. 🏷️ Categorization
  let category = "Uncategorized";
  
  if (type === 'CREDIT') {
    category = "Income";
  } else {
    // Check keywords
    for (const [cat, keywords] of Object.entries(CATEGORY_MAP)) {
      if (keywords.some(k => lowerBody.includes(k) || description.toLowerCase().includes(k))) {
        category = cat;
        break;
      }
    }
    // Fallback heuristic for large UPI
    if (category === "Uncategorized" && description.includes("UPI") && amount > 5000) {
        category = "Transfer/Rent";
    }
  }

  // 6. 🆔 Deduplication Hash
  // Hash combined of: Amount + Description + Date (YYYY-MM-DD) + Sender
  const dateStr = new Date(sms.receivedAt).toISOString().split('T')[0];
  const hashString = `${amount}-${description}-${dateStr}-${sms.from}`;
  const hash = generateHash(hashString);

  return {
    id: hash, // Use hash as ID for frontend key
    hash: hash,
    type: type,
    amount: amount,
    category: category,
    description: description,
    date: dateStr,
    firewallDecision: 'ALLOW', 
    firewallReason: 'Imported from SMS'
  };
};
