# 🎙️ InClear - Live Audio Debate Setup Guide

A Twitter Spaces-style live audio debate platform built with Next.js and LiveKit.

## ✅ What's Implemented

- ✅ LiveKit token generation API (`/app/api/livekit-token/route.ts`)
- ✅ Full debate room UI (`/app/debate/page.tsx`)
- ✅ Anonymous join with side selection (Side A 🔵 or Side B 🔴)
- ✅ Real-time audio communication
- ✅ Participant list with live updates
- ✅ Active speaker indicators (green highlight when speaking)
- ✅ Mic mute/unmute controls
- ✅ Side counts (how many people on each side)
- ✅ Responsive design with dark mode support

## 🚀 Quick Start

### 1. Get LiveKit Credentials (Free)

1. Go to [livekit.io](https://livekit.io/)
2. Click **"Sign Up"** (free tier available)
3. Create a new project
4. Go to **Settings > Keys**
5. Copy your credentials:
   - API Key
   - API Secret  
   - WebSocket URL (looks like `wss://your-project.livekit.cloud`)

### 2. Configure Environment Variables

Open `.env.local` and replace the placeholder values:

```env
LIVEKIT_API_KEY=APIxxxxxxxxxxxxxxx
LIVEKIT_API_SECRET=your-secret-here
LIVEKIT_URL=wss://your-project.livekit.cloud

NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
```

⚠️ **Important**: The URL must be the same for both `LIVEKIT_URL` and `NEXT_PUBLIC_LIVEKIT_URL`

### 3. Run the Application

```bash
npm run dev
```

### 4. Test the Debate Room

1. Open [http://localhost:3000/debate](http://localhost:3000/debate)
2. **Open a second browser tab** (or incognito window)
3. In first tab: Click **"Side A 🔵"**
4. In second tab: Click **"Side B 🔴"**
5. **Speak** - you should hear yourself in the other tab! 🎉

## 🎯 Features Breakdown

### Join Flow
- Click Side A or Side B
- Auto-assigned anonymous ID (e.g., `Anon-X7K2A9-A`)
- Mic enabled by default

### Participant List
- Shows all active participants
- Color-coded by side (Blue = A, Red = B)
- **Green highlight** when someone is speaking
- Mic status indicator (🎤 or 🔇)
- "You" badge for local participant

### Controls
- **🎤 Mute/Unmute** - Toggle your microphone
- **🚪 Leave** - Disconnect from room

## 🏗️ Project Structure

```
app/
├── api/
│   └── livekit-token/
│       └── route.ts          # JWT token generation
├── debate/
│   └── page.tsx              # Main debate room UI
├── page.tsx                  # Landing page
└── layout.tsx                # Root layout
```

## 🔧 Tech Stack

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **LiveKit** - Real-time audio infrastructure
  - `livekit-client` - Frontend SDK
  - `livekit-server-sdk` - Token generation

## 🧪 Testing Tips

### Multiple Participants
- Use different browsers (Chrome, Firefox, Edge)
- Use incognito/private windows
- Use different devices (phone + laptop)

### Check Active Speakers
- When you speak, your card should turn **green**
- Other participants should see the green highlight too
- Works even when muted (based on mic input level)

### Network Issues?
- Check browser console for errors
- Verify `.env.local` credentials are correct
- Ensure LiveKit project is active at livekit.io
- Try refreshing the page

## 📝 Next Steps (Optional Enhancements)

### 1. Add Article Context
Replace hardcoded room name `'news-debate'` with dynamic article IDs:
```typescript
const room = searchParams.get('article') || 'default-room';
```

### 2. Persistent User Names
Replace anonymous IDs with user authentication or local storage names.

### 3. Room Moderation
Add admin controls to mute participants or close rooms.

### 4. Recording
Enable LiveKit's recording feature to save debates.

### 5. Chat Messages
Add text chat alongside audio using LiveKit's data messages.

### 6. Voting Integration
Connect to your main voting system to auto-create rooms when votes reach a threshold.

## 🐛 Troubleshooting

### "LiveKit credentials not configured"
- Check `.env.local` exists in project root
- Verify variable names match exactly
- Restart dev server after changing `.env.local`

### "Failed to connect to room"
- Verify `NEXT_PUBLIC_LIVEKIT_URL` starts with `wss://`
- Check LiveKit dashboard shows project is active
- Try regenerating API keys

### Can't hear audio
- Check browser permissions for microphone
- Look in browser console for errors
- Verify both participants joined successfully
- Try a different browser

### Audio echo/feedback
- Use headphones
- Don't test with multiple tabs on same device with speakers on

## 📚 Resources

- [LiveKit Docs](https://docs.livekit.io/)
- [Next.js Docs](https://nextjs.org/docs)
- [LiveKit React SDK](https://docs.livekit.io/client-sdk-js/modules/livekit_react.html)

## 🎉 You're All Set!

Your debate room is fully functional. Test it with multiple tabs and enjoy real-time audio debates!
