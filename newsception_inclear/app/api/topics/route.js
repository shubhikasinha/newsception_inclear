import { NextResponse } from 'next/server';

// In-memory topics store (replace with database)
const topics = new Map();

export async function GET() {
  const allTopics = Array.from(topics.values())
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 20);
  return NextResponse.json(allTopics);
}

export async function POST(req) {
  try {
    const { topic } = await req.json();

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    const topicId = topic.toLowerCase().replace(/\s+/g, '-');
    const existing = topics.get(topicId) || {
      id: topicId,
      topic,
      votes: 0,
      createdAt: new Date().toISOString(),
    };

    existing.votes++;
    topics.set(topicId, existing);

    return NextResponse.json(existing);
  } catch (error) {
    console.error('Error adding topic:', error);
    return NextResponse.json(
      { error: 'Failed to add topic' },
      { status: 500 }
    );
  }
}

