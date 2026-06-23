# iychat — Client

Frontend for **iychat**, a real-time chat application. Built with Next.js (App Router) and Socket.io client.

## Folder structure

```
client/
├── src/
│   ├── app/
│   │   ├── chat/         Main chat page
│   │   ├── login/        Login page
│   │   ├── register/     Registration page
│   │   ├── layout.js      Root layout
│   │   ├── page.js        Home page (redirects based on auth state)
│   │   └── globals.css    Global black & white theme
│   ├── components/
│   │   ├── Sidebar.js        User list
│   │   ├── ChatWindow.js     Message list + input box
│   │   └── MessageBubble.js  Individual message bubble
│   ├── context/
│   │   └── AuthContext.js    Auth state shared across the app
│   └── lib/
│       ├── api.js            Axios instance
│       └── socket.js         Socket.io client instance
├── .env.example
└── package.json
```

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

   | Variable               | Description                              |
   |------------------------|--------------------------------------------|
   | `NEXT_PUBLIC_API_URL`  | URL of your backend server                |

3. Run the dev server:
   ```bash
   npm run dev
   ```

   Open `http://localhost:3000`.

## Design

The UI is intentionally plain: white background, black text and borders. Your own sent messages appear as black bubbles with white text; the other person's messages appear as white bubbles with black text and a black border.

## Deploying to Vercel

1. Push this `client` folder to its own GitHub repository (or as a subfolder, setting Vercel's root directory accordingly).
2. On [Vercel](https://vercel.com), import the repository.
3. Set the environment variable:
   - `NEXT_PUBLIC_API_URL` = your deployed Render backend URL (e.g. `https://your-app.onrender.com`)
4. Deploy. Vercel auto-detects Next.js, so no extra build configuration is needed.
5. Once deployed, go back to your Render backend and set its `CLIENT_URL` environment variable to your new Vercel URL, then redeploy the backend so CORS allows it.
