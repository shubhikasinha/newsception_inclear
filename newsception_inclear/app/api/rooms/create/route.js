import { NextResponse } from 'next/server';
import { RoomServiceClient } from 'livekit-server-sdk';

const livekitHost = process.env.LIVEKIT_URL?.replace('wss://', 'https://') || '';
const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;

// In-memory store for debates (replace with database in production)
const debates = new Map();

export async function POST(req) {
  try {
    const { topic } = await req.json();

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    const roomId = `debate-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    // Create room in LiveKit
    if (apiKey && apiSecret && livekitHost) {
      const roomService = new RoomServiceClient(livekitHost, apiKey, apiSecret);
      await roomService.createRoom({
        name: roomId,
        emptyTimeout: 10 * 60, // 10 minutes
        maxParticipants: 50,
      });
    }

    // Store debate metadata
    const debate = {
      id: roomId,
      topic,
      sideACount: 0,
      sideBCount: 0,
      viewerCount: 0,
      status: 'live',
      createdAt: new Date().toISOString(),
      votes: { A: 0, B: 0 },
      moderatorMessages: [],
    };

    debates.set(roomId, debate);

    return NextResponse.json(debate);
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const allDebates = Array.from(debates.values());
  return NextResponse.json(allDebates);
}

