# Real-time Chat Application

A modern real-time chat application built with Next.js, Socket.io, and Tailwind CSS.

## Features

- Real-time messaging with Socket.io
- User authentication
- Chat rooms
- Typing indicators
- Responsive design (mobile & desktop)
- Dark mode support

## Getting Started

### Prerequisites

- Node.js 18+ or 20+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Create `.env.local` file based on `.env.example`

### Development

You can run the app in two ways:

#### Standard Development Server
```bash
npm run dev
# or
yarn dev
```

This uses the mock socket implementation for local development.

#### Development Server with Real-time Socket Support
```bash
npm run dev:server
# or
yarn dev:server
```

This runs a custom server that handles both Next.js and Socket.io, providing better multi-user real-time communication during development.

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Multi-User Chat Testing

For testing with multiple users:

1. **Development Mode with Mock Socket**:
   - The mock implementation uses localStorage to share data between browser tabs
   - Open the app in multiple tabs or browsers to simulate different users
   - Each browser will need to log in with a different user account

2. **Real Socket.io Server (Recommended for Multi-User Testing)**:
   ```bash
   npm run dev:server
   # or
   yarn dev:server
   ```
   - This runs a real Socket.io server for proper real-time communication
   - Works across different browsers and devices on your local network

> Note: The message "This is a development mock. No real server connection" indicates you're running in mock mode, not with the real Socket.io server.

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework with App Router
- [Socket.io](https://socket.io/) - Real-time communication
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Geist Font](https://vercel.com/font) - Modern font family from Vercel

## Deployment

This application can be deployed on [Vercel](https://vercel.com/), [Netlify](https://www.netlify.com/), or any platform that supports Next.js applications.
