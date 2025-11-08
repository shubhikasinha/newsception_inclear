Perfect 🔥 — since you already have **Next.js + Tailwind** ready, I’ll drop you a **ready-to-run LiveKit audio room setup** you can paste directly into your project.

This will give you a **fully functional “Twitter Spaces–style” room** with:

* Anonymous join
* Side selection (A or B)
* Working real-time audio (via LiveKit Cloud)
* Minimal but clean UI

---

## 🧩 Folder Structure Overview

You’ll add:

```
/app
 ├─ /api
 │   └─ /livekit-token/route.ts      → token generator
 ├─ /debate/page.tsx                 → main debate UI
```

---

## ⚙️ 1️⃣ Environment Variables

In your `.env.local` file, add:

```env
LIVEKIT_API_KEY=your_key_here
LIVEKIT_API_SECRET=your_secret_here
LIVEKIT_URL=wss://your-livekit-cloud-url
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-cloud-url
```

> 🧠 Note: `LIVEKIT_URL` is used server-side, `NEXT_PUBLIC_LIVEKIT_URL` is for the frontend.

---

## ⚙️ 2️⃣ API Route — `/app/api/livekit-token/route.ts`

```ts
// app/api/livekit-token/route.ts
import { NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const user = searchParams.get('user') || 'Anonymous';
  const room = searchParams.get('room') || 'default-room';

  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
    { identity: user }
  );

  at.addGrant({ roomJoin: true, room });

  return NextResponse.json({ token: at.toJwt() });
}
```

✅ This endpoint gives a user a **JWT token** to connect to your LiveKit room.

---

## ⚙️ 3️⃣ Debate Room Page — `/app/debate/page.tsx`

```tsx
'use client';
import { useState, useEffect } from 'react';
import { Room, RoomEvent, connect } from 'livekit-client';

export default function DebatePage() {
  const [room, setRoom] = useState<Room | null>(null);
  const [joined, setJoined] = useState(false);
  const [side, setSide] = useState<'A' | 'B' | null>(null);
  const [userId] = useState(() => `Anon-${Math.random().toString(36).slice(2, 6)}`);

  async function joinRoom(chosenSide: 'A' | 'B') {
    setSide(chosenSide);

    const res = await fetch(
      `/api/livekit-token?user=${userId}-${chosenSide}&room=news-debate`
    );
    const { token } = await res.json();

    const newRoom = new Room();
    await connect(process.env.NEXT_PUBLIC_LIVEKIT_URL!, token, { room: newRoom });
    setRoom(newRoom);
    setJoined(true);

    // 🎧 Auto attach other participants' audio
    newRoom.on(RoomEvent.TrackSubscribed, (track) => {
      if (track.kind === 'audio') {
        const el = track.attach();
        document.body.appendChild(el);
      }
    });

    newRoom.on(RoomEvent.ParticipantConnected, (p) =>
      console.log(`${p.identity} joined`)
    );
  }

  async function leaveRoom() {
    room?.disconnect();
    setRoom(null);
    setJoined(false);
    setSide(null);
  }

  async function toggleMic() {
    if (!room) return;
    const enabled = room.localParticipant.isMicrophoneEnabled;
    await room.localParticipant.setMicrophoneEnabled(!enabled);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      {!joined ? (
        <div className="text-center p-6 bg-white rounded-2xl shadow-lg w-96">
          <h1 className="text-2xl font-bold mb-4">🎙️ InClear Debate Test</h1>
          <p className="text-gray-600 mb-6">
            Join anonymously and pick your side:
          </p>
          <div className="flex justify-around">
            <button
              onClick={() => joinRoom('A')}
              className="bg-blue-500 text-white px-6 py-2 rounded-xl shadow hover:bg-blue-600"
            >
              Side A 🔵
            </button>
            <button
              onClick={() => joinRoom('B')}
              className="bg-red-500 text-white px-6 py-2 rounded-xl shadow hover:bg-red-600"
            >
              Side B 🔴
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg w-96">
          <h2 className="text-xl font-semibold mb-2">
            Live Debate — Side {side}
          </h2>
          <p className="text-gray-500 mb-4">You are {userId}</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={toggleMic}
              className="bg-gray-800 text-white px-5 py-2 rounded-xl hover:bg-gray-700"
            >
              🎤 Toggle Mic
            </button>
            <button
              onClick={leaveRoom}
              className="bg-gray-300 text-gray-700 px-5 py-2 rounded-xl hover:bg-gray-400"
            >
              🚪 Leave
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## ⚙️ 4️⃣ Add LiveKit URL to `.env.local` (frontend variable)

```env
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-cloud-url
```

---

## 🚀 5️⃣ Run It

```bash
npm run dev
```

Then open:
👉 [http://localhost:3000/debate](http://localhost:3000/debate)

* Open **two browser tabs**
* Join one as 🔵 “Side A” and one as 🔴 “Side B”
* Speak — you’ll hear live cross-audio 🔊

---

## 🧠 6️⃣ (Optional) Add Some Extra Niceties Later

| Feature                         | How                                               |
| ------------------------------- | ------------------------------------------------- |
| Show participant list           | `room.participants.values()`                      |
| Mute speakers by role           | Use `ParticipantPermission` in token grant        |
| Room name tied to article       | Pass article ID in `room` param                   |
| Auto-create room when votes ≥ 5 | Hook your debate trigger logic to generate tokens |
| Speech indicators               | Listen to `participant.audioLevel` events         |

---

You can test this completely independently of your main app — just plug in your **LiveKit Cloud project URL and API keys**.

---

Would you like me to add **a participant list + active speaker highlight** (so you can visually see who’s talking) next? It makes your testing feel exactly like a Twitter Space.
