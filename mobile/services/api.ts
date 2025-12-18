import { Transaction, AppConfig } from '../types';

export const pushToBackend = async (config: AppConfig, transaction: Transaction) => {
  if (!config.apiUrl || !config.userId || !config.secret) {
    throw new Error("MoneyOS Bridge requires full configuration to sync.");
  }

  try {
    const response = await fetch(`${config.apiUrl}/api/transactions/push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-moneyos-secret': config.secret,
        'x-user-id': config.userId
      },
      body: JSON.stringify({ transaction })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Push operation failed");
    return data;
  } catch (error: any) {
    console.error("Sync Error:", error.message);
    throw error;
  }
};
