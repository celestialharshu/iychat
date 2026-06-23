# iychat — Server

Backend for **iychat**, a real-time chat application. Built with Node.js, Express, MongoDB (Mongoose), and Socket.io.

## Folder structure

```
server/
├── src/
│   ├── config/         MongoDB connection setup
│   ├── controllers/    Request handlers (auth, users, messages)
│   ├── middleware/      JWT auth middleware
│   ├── models/          Mongoose schemas (User, Message)
│   ├── routes/          Express route definitions
│   ├── socket/          Socket.io event handlers
│   ├── utils/           Helper functions (JWT token generation)
│   ├── app.js           Express app configuration
│   └── server.js        Entry point — starts HTTP + Socket.io server
├── .env.example
├── package.json
└── render.yaml
```

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your own values:
   ```bash
   cp .env.example .env
   ```

   | Variable      | Description                                      |
   |---------------|---------------------------------------------------|
   | `PORT`        | Port the server runs on (default `5000`)          |
   | `MONGO_URI`   | Your MongoDB Atlas connection string              |
   | `JWT_SECRET`  | Any long, random string used to sign auth tokens   |
   | `CLIENT_URL`  | URL of the frontend (for CORS)                     |
   | `NODE_ENV`    | `development` or `production`                      |

3. Run the dev server:
   ```bash
   npm run dev
   ```

   The API will be running at `http://localhost:5000`.

## API overview

| Method | Endpoint              | Description                          |
|--------|------------------------|---------------------------------------|
| POST   | `/api/auth/register`   | Create a new account                  |
| POST   | `/api/auth/login`      | Log in                                |
| POST   | `/api/auth/logout`     | Log out                               |
| GET    | `/api/auth/me`         | Get current logged-in user            |
| GET    | `/api/users`           | List all other users                  |
| GET    | `/api/users/:id`       | Get a single user                     |
| GET    | `/api/messages/:userId`| Get conversation history with a user  |
| POST   | `/api/messages/:userId`| Send a message to a user              |

Real-time events (Socket.io): `user_online`, `send_message`, `receive_message`, `typing`, `stop_typing`, `online_users`.

## Deploying to Render

1. Push this `server` folder to its own GitHub repository (or as a subfolder of a repo, setting Render's root directory accordingly).
2. On [Render](https://render.com), create a new **Web Service** and connect your repo.
3. Settings:
   - **Build command:** `npm install`
   - **Start command:** `npm start`
4. Add the environment variables from `.env.example` under the Render dashboard's "Environment" tab. Set `CLIENT_URL` to your deployed Vercel frontend URL.
5. Deploy. Render will give you a public URL like `https://your-app.onrender.com` — use this as `NEXT_PUBLIC_API_URL` in the client.
