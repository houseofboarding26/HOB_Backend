Routes -------------- Middlewares -------------- controllers              
                            |                         |
                            |                      Service
                            |                         |
                          Schema                  Repository        

Step 1: Get Google OAuth Credentials
Go to Google Cloud Console
Create a new project (or select existing)
Enable Google+ API
Go to Credentials → Create OAuth 2.0 Client ID
Choose Web application
Add authorized redirect URIs:
http://localhost:3000/api/auth/callback (development)
https://yourdomain.com/api/auth/callback (production)
Copy Client ID and Client Secret

For production, set `GOOGLE_CALLBACK_URL` to the exact HTTPS callback URI registered
with Google, for example `https://yourdomain.com/api/auth/callback`. If this variable
is not set, the backend builds the callback URI from `BASE_URL` and forces HTTPS.

For production browser requests, set `CORS_ORIGINS` to a comma-separated list of
frontend origins, with no paths, for example
`https://houseofboarding.com,https://www.houseofboarding.com,https://hob-frontend-plum.vercel.app`.
`BASE_URL` is also allowed. Redeploy after changing environment variables.


Step 2: Install Dependencies
npm install passport passport-google-oauth20 express-session dotenv
npm install jsonwebtoken bcryptjs


Step 3: Update .env File
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
JWT_SECRET=your-jwt-secret-key
SESSION_SECRET=your-session-secret
NODE_ENV=development