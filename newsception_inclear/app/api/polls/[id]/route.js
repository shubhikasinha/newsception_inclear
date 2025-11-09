import { NextResponse } from 'next/server';

// In-memory poll storage (replace with database)
const polls = new Map();

export async function GET(req, { params }) {
  try {
    const { id } = params;
    const poll = polls.get(id) || { A: 0, B: 0 };
    return NextResponse.json(poll);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch poll' },
      { status: 500 }
    );
  }
}

export async function POST(req, { params }) {
  try {
    const { id } = params;
    const { side, userId } = await req.json();

    if (!['A', 'B'].includes(side)) {
      return NextResponse.json(
        { error: 'Invalid side' },
        { status: 400 }
      );
    }

    const poll = polls.get(id) || { A: 0, B: 0, voters: new Set() };
    
    // Simple voting (one vote per user)
    if (!poll.voters) poll.voters = new Set();
    if (poll.voters.has(userId)) {
      return NextResponse.json({ error: 'Already voted' }, { status: 400 });
    }

    poll[side]++;
    poll.voters.add(userId);
    polls.set(id, poll);

    return NextResponse.json({ A: poll.A, B: poll.B });
  } catch (error) {
    console.error('Error voting:', error);
    return NextResponse.json(
      { error: 'Failed to vote' },
      { status: 500 }
    );
  }
}

