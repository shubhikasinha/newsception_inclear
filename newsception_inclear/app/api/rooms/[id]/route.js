import { NextResponse } from 'next/server';

// In-memory store (replace with database)
const debates = new Map();

export async function GET(req, { params }) {
  try {
    const { id } = params;
    const debate = debates.get(id);

    if (!debate) {
      return NextResponse.json(
        { error: 'Debate not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(debate);
  } catch (error) {
    console.error('Error fetching debate:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debate' },
      { status: 500 }
    );
  }
}

export async function PATCH(req, { params }) {
  try {
    const { id } = params;
    const updates = await req.json();
    const debate = debates.get(id);

    if (!debate) {
      return NextResponse.json(
        { error: 'Debate not found' },
        { status: 404 }
      );
    }

    Object.assign(debate, updates);
    debates.set(id, debate);

    return NextResponse.json(debate);
  } catch (error) {
    console.error('Error updating debate:', error);
    return NextResponse.json(
      { error: 'Failed to update debate' },
      { status: 500 }
    );
  }
}

