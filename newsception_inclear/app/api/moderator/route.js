import { NextResponse } from 'next/server';

// AI Moderator logic
// Uses OpenAI if available, otherwise falls back to rule-based moderation
export async function POST(req) {
  try {
    const { transcript, participantId, roomId, speakingTime, violations, topic } = await req.json();

    const actions = {
      action: 'allow',
      message: null,
      mute: false,
      warning: false,
    };

    // Check for interruptions (multiple people speaking)
    if (violations?.interruptions > 2) {
      actions.action = 'warn';
      actions.warning = true;
      actions.message = `${participantId}, please wait for your turn. Interruptions are not allowed.`;
      return NextResponse.json(actions);
    }

    // Check speaking time (max 2 minutes per turn)
    if (speakingTime > 120) {
      actions.action = 'mute';
      actions.mute = true;
      actions.message = `${participantId}, your time is up. Please yield the floor.`;
      return NextResponse.json(actions);
    }

    // Use OpenAI for content moderation if API key is available
    if (process.env.OPENAI_API_KEY && transcript) {
      try {
        const moderationResponse = await fetch('https://api.openai.com/v1/moderations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({ input: transcript }),
        });

        if (moderationResponse.ok) {
          const moderationData = await moderationResponse.json();
          const flagged = moderationData.results[0]?.flagged;

          if (flagged) {
            actions.action = 'mute';
            actions.mute = true;
            actions.warning = true;
            actions.message = `${participantId}, your comment violates our community guidelines. You have been muted.`;
            return NextResponse.json(actions);
          }
        }
      } catch (openaiError) {
        console.error('OpenAI moderation error:', openaiError);
        // Fall through to rule-based moderation
      }
    }

    // Fallback: Simple keyword check for toxic content
    const toxicKeywords = ['hate', 'stupid', 'idiot', 'shut up', 'fool'];
    const lowerTranscript = transcript?.toLowerCase() || '';
    if (toxicKeywords.some(keyword => lowerTranscript.includes(keyword))) {
      actions.action = 'warn';
      actions.warning = true;
      actions.message = `${participantId}, please maintain respectful discourse.`;
    }

    // Check for off-topic (simple keyword matching - could be enhanced with AI)
    if (topic && transcript) {
      const topicKeywords = topic.toLowerCase().split(' ');
      const transcriptLower = transcript.toLowerCase();
      const relevanceScore = topicKeywords.filter(kw => transcriptLower.includes(kw)).length;
      
      if (transcript.length > 50 && relevanceScore === 0) {
        actions.action = 'warn';
        actions.warning = true;
        actions.message = `${participantId}, please stay on topic: ${topic}`;
      }
    }

    return NextResponse.json(actions);
  } catch (error) {
    console.error('Error in moderator:', error);
    return NextResponse.json(
      { error: 'Moderator error' },
      { status: 500 }
    );
  }
}

