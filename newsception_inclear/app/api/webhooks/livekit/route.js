import { NextResponse } from 'next/server';
import { WebhookReceiver } from 'livekit-server-sdk';

const receiver = new WebhookReceiver(
  process.env.LIVEKIT_API_KEY,
  process.env.LIVEKIT_API_SECRET
);

export async function POST(req) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.text();
    const event = receiver.receive(body, authHeader);

    console.log('LiveKit webhook event:', event.event);

    // Handle different event types
    switch (event.event) {
      case 'participant_joined':
        // Update participant count
        await updateParticipantCount(event.room.name, 1);
        break;

      case 'participant_left':
        // Update participant count
        await updateParticipantCount(event.room.name, -1);
        break;

      case 'track_published':
        // Track when someone starts speaking
        if (event.publication.kind === 'audio') {
          // Could trigger moderation check here
          console.log('Audio track published:', event.participant.identity);
        }
        break;

      case 'room_started':
        console.log('Room started:', event.room.name);
        break;

      case 'room_finished':
        console.log('Room finished:', event.room.name);
        // Mark debate as finished
        await markDebateFinished(event.room.name);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Helper functions (in production, use database)
async function updateParticipantCount(roomId, delta) {
  // This would update the debate metadata in the database
  // For now, just log it
  console.log(`Updating participant count for ${roomId}: ${delta}`);
}

async function markDebateFinished(roomId) {
  // This would mark the debate as finished in the database
  console.log(`Marking debate ${roomId} as finished`);
}

