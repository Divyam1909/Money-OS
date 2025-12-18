# MoneyOS Core API

This is the central nervous system of MoneyOS.

## Architecture: "The Edge Push"
We no longer use a server-side SMS parser. Instead:
1. **The Phone** receives an SMS.
2. **The App (Tasker/Native)** parses the text locally using the logic in `services/smsParser.ts`.
3. **The Phone** pushes the clean transaction JSON to `/api/transactions/push`.

## Setup
1. `npm install`
2. Set Environment Variables:
   - `MONGO_URI`: Your MongoDB connection string.
   - `JWT_SECRET`: Random string for Auth.
   - `SMS_SECRET`: Password shared with your Mobile App.
3. `npm start`

## Mobile Integration
To push data from your phone:
- **URL**: `YOUR_RAILWAY_URL/api/transactions/push`
- **Method**: POST
- **Headers**: 
  - `x-moneyos-secret`: (Your SMS_SECRET)
  - `x-user-id`: (Your User ID)
- **Body**: `{ "transaction": { ...parsedData } }`