'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Room, RoomEvent, Track } from 'livekit-client';
import { motion } from 'framer-motion';
import PollWidget from '../../components/debate/PollWidget';
import SideColumn from '../../components/debate/SideColumn';

export default function AudiencePage() {
  const params = useParams();
  const debateId = params.id;

  const [room, setRoom] = useState(null);
  const [joined, setJoined] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [activeSpeakers, setActiveSpeakers] = useState(new Set());
  const [error, setError] = useState(null);
  const [debateTopic, setDebateTopic] = useState('Loading...');
  const [pollVotes, setPollVotes] = useState({ A: 0, B: 0 });
  const [userVote, setUserVote] = useState(null);
  const [userId] = useState(() => `Viewer-${Math.random().toString(36).slice(2, 8).toUpperCase()}`);

  // Load debate info
  useEffect(() => {
    if (debateId) {
      fetch(`/api/rooms/${debateId}`)
        .then(res => res.json())
        .then(data => {
          if (data.topic) {
            setDebateTopic(data.topic);
          }
        })
        .catch(err => console.error('Error loading debate:', err));
    }
  }, [debateId]);

  // Join as viewer (read-only)
  useEffect(() => {
    if (!debateId) return;

    const joinAsViewer = async () => {
      try {
        // Get token (viewer mode - can subscribe but not publish)
        const res = await fetch(
          `/api/livekit-token?user=${userId}&room=${debateId}`
        );
        
        if (!res.ok) {
          throw new Error('Failed to get access token');
        }

        const { token } = await res.json();

        if (!process.env.NEXT_PUBLIC_LIVEKIT_URL) {
          throw new Error('LiveKit URL not configured');
        }

        // Create and connect to room
        const newRoom = new Room({
          adaptiveStream: true,
          dynacast: true,
        });

        // Set up event listeners
        newRoom.on(RoomEvent.ParticipantConnected, (participant) => {
          console.log(`${participant.identity} joined`);
          updateParticipants(newRoom);
        });

        newRoom.on(RoomEvent.ParticipantDisconnected, (participant) => {
          console.log(`${participant.identity} left`);
          updateParticipants(newRoom);
        });

        newRoom.on(RoomEvent.TrackSubscribed, (track) => {
          if (track.kind === Track.Kind.Audio) {
            const audioElement = track.attach();
            document.body.appendChild(audioElement);
          }
        });

        newRoom.on(RoomEvent.TrackUnsubscribed, (track) => {
          track.detach().forEach(element => element.remove());
        });

        newRoom.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
          const speakerIds = new Set(speakers.map(s => s.identity));
          setActiveSpeakers(speakerIds);
        });

        // Connect to room (viewer mode - no mic)
        await newRoom.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL, token);

        setRoom(newRoom);
        setJoined(true);
        updateParticipants(newRoom);

        // Load poll data
        fetchPoll();
      } catch (err) {
        console.error('Error joining as viewer:', err);
        setError(err instanceof Error ? err.message : 'Failed to join');
      }
    };

    joinAsViewer();

    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [debateId]);

  // Update participant list
  const updateParticipants = (room) => {
    const allParticipants = Array.from(room.remoteParticipants.values());
    setParticipants(allParticipants);
  };

  // Fetch poll data
  const fetchPoll = async () => {
    if (!debateId) return;
    try {
      const res = await fetch(`/api/polls/${debateId}`);
      if (res.ok) {
        const data = await res.json();
        setPollVotes({ A: data.A || 0, B: data.B || 0 });
      }
    } catch (err) {
      console.error('Error fetching poll:', err);
    }
  };

  // Handle vote
  const handleVote = async (voteSide) => {
    if (!debateId || userVote) return;
    try {
      const res = await fetch(`/api/polls/${debateId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ side: voteSide, userId }),
      });
      if (res.ok) {
        const data = await res.json();
        setPollVotes({ A: data.A || 0, B: data.B || 0 });
        setUserVote(voteSide);
      }
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  // Poll for updates
  useEffect(() => {
    if (!debateId || !joined) return;
    const interval = setInterval(() => {
      fetchPoll();
      if (room) {
        updateParticipants(room);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [debateId, joined, room]);

  // Get side from participant identity
  const getParticipantSide = (identity) => {
    if (identity.endsWith('-A')) return 'A';
    if (identity.endsWith('-B')) return 'B';
    return 'Unknown';
  };

  // Organize participants by side
  const organizeParticipants = () => {
    const sideA = [];
    const sideB = [];
    
    participants.forEach(p => {
      const participantSide = getParticipantSide(p.identity);
      const participantData = {
        ...p,
        isSpeaking: activeSpeakers.has(p.identity),
      };
      
      if (participantSide === 'A') {
        sideA.push(participantData);
      } else if (participantSide === 'B') {
        sideB.push(participantData);
      }
    });

    return { sideA, sideB };
  };

  const { sideA, sideB } = organizeParticipants();

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] p-4">
        <div className="text-center p-8 bg-white border-2 border-red-300 rounded">
          <h2 className="text-2xl font-serif font-bold text-red-700 mb-2">
            Error
          </h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] font-serif">
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="bg-white border-b-2 border-[#d4af37] py-4 px-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-serif font-bold text-[#1a1a1a] tracking-wide">
              LIVE DEBATE: {debateTopic}
            </h1>
            <p className="text-sm text-[#666] mt-1">Viewer Mode</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-2 gap-0 overflow-hidden">
          <SideColumn 
            side="A" 
            users={sideA} 
            localUserId={null}
          />
          <SideColumn 
            side="B" 
            users={sideB} 
            localUserId={null}
          />
        </div>

        {/* Poll Widget */}
        <div className="bg-white border-t-2 border-[#e0e0e0] p-6">
          <div className="max-w-4xl mx-auto">
            <PollWidget
              sideAVotes={pollVotes.A}
              sideBVotes={pollVotes.B}
              onVote={handleVote}
              userVote={userVote}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

