
# MoneyOS Backend Services

This folder contains two microservices designed to run on Railway, Render, or any Node.js environment.

## Setup
1. `cd backend`
2. `npm install`
3. Create a `.env` file based on `.env.example`.
4. Run the Main API: `npm run start-main`
5. Run the Parser Service: `npm run start-parser`

## Deployment Suggestions
- **Railway**: Connect your GitHub, set the root directory to `backend`, and use `npm run start-main` as the start command for one service, and create another service for the parser.
- **Environment Variables**: Ensure `MONGO_URI` and `JWT_SECRET` are set in your cloud dashboard.
