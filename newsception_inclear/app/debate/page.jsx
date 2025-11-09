'use client';
import { useState, useEffect } from 'react';
import { Room, RoomEvent, RemoteParticipant, LocalParticipant, Track } from 'livekit-client';
import { motion } from 'framer-motion';
import ModeratorBar from '../components/debate/ModeratorBar';
import SideColumn from '../components/debate/SideColumn';
import Timer from '../components/debate/Timer';
import PollWidget from '../components/debate/PollWidget';

export default function DebatePage() {
  const [room, setRoom] = useState(null);
  const [joined, setJoined] = useState(false);
  const [side, setSide] = useState(null);
  const [userId] = useState(() => `Anon-${Math.random().toString(36).slice(2, 8).toUpperCase()}`);
  const [participants, setParticipants] = useState([]);
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [activeSpeakers, setActiveSpeakers] = useState(new Set());
  const [error, setError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [moderatorMessages, setModeratorMessages] = useState([]);
  const [debateTopic, setDebateTopic] = useState('Current Debate Topic');
  const [pollVotes, setPollVotes] = useState({ A: 0, B: 0 });
  const [userVote, setUserVote] = useState(null);
  const [debateId, setDebateId] = useState(null);

  // Update participant list
  const updateParticipants = (room) => {
    const allParticipants = [
      room.localParticipant,
      ...Array.from(room.remoteParticipants.values())
    ];
    setParticipants(allParticipants);
  };

  // Join room function
  async function joinRoom(chosenSide) {
    setIsConnecting(true);
    setError(null);
    setSide(chosenSide);

    try {
      // Get or create debate room
      let roomId = debateId || 'news-debate';
      if (!debateId) {
        const createRes = await fetch('/api/rooms/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: debateTopic }),
        });
        if (createRes.ok) {
          const debate = await createRes.json();
          roomId = debate.id;
          setDebateId(roomId);
          setDebateTopic(debate.topic);
        }
      }

      // Get token from API
      const res = await fetch(
        `/api/livekit-token?user=${userId}-${chosenSide}&room=${roomId}`
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

      // Connect to room
      await newRoom.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL, token);
      
      // Enable microphone by default
      await newRoom.localParticipant.setMicrophoneEnabled(true);
      setIsMicEnabled(true);

      setRoom(newRoom);
      setJoined(true);
      updateParticipants(newRoom);
      setIsConnecting(false);

      // Add welcome message from moderator
      addModeratorMessage('Welcome to the debate. Here are the rules: equal time, no interruptions, no personal attacks.');

      // Load poll data
      if (roomId) {
        fetchPoll(roomId);
      }
    } catch (err) {
      console.error('Error joining room:', err);
      setError(err instanceof Error ? err.message : 'Failed to join room');
      setIsConnecting(false);
      setSide(null);
    }
  }

  // Leave room function
  async function leaveRoom() {
    if (room) {
      room.disconnect();
      setRoom(null);
    }
    setJoined(false);
    setSide(null);
    setParticipants([]);
    setActiveSpeakers(new Set());
    setIsMicEnabled(false);
  }

  // Toggle microphone
  async function toggleMic() {
    if (!room) return;
    try {
      const enabled = room.localParticipant.isMicrophoneEnabled;
      await room.localParticipant.setMicrophoneEnabled(!enabled);
      setIsMicEnabled(!enabled);
    } catch (err) {
      console.error('Error toggling mic:', err);
    }
  }

  // Add moderator message
  const addModeratorMessage = (text) => {
    const message = {
      id: Date.now(),
      text,
      timestamp: new Date().toISOString(),
    };
    setModeratorMessages(prev => [...prev, message]);
  };

  // Fetch poll data
  const fetchPoll = async (roomId) => {
    try {
      const res = await fetch(`/api/polls/${roomId}`);
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
      fetchPoll(debateId);
    }, 3000);
    return () => clearInterval(interval);
  }, [debateId, joined]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [room]);

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

  return (
    <div className="min-h-screen bg-[#fafafa] font-serif">
      {!joined ? (
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div
            className="text-center p-8 bg-white border-2 border-[#e0e0e0] w-full max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-6">
              <h1 className="text-4xl font-bold mb-2 text-[#1a1a1a] tracking-wide">
                IN CLEAR
              </h1>
              <div className="w-24 h-1 bg-[#d4af37] mx-auto mb-4"></div>
              <p className="text-[#666] font-serif">
                Join the debate and make your voice heard
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-3 mb-6">
              <button
                onClick={() => joinRoom('A')}
                disabled={isConnecting}
                className="w-full bg-[#2c3e50] hover:bg-[#1a252f] disabled:bg-gray-300 text-white px-8 py-4 border-2 border-[#1a252f] transition-all font-serif font-semibold text-lg"
              >
                {isConnecting && side === 'A' ? 'Joining...' : 'Join Side A'}
              </button>
              <button
                onClick={() => joinRoom('B')}
                disabled={isConnecting}
                className="w-full bg-[#8b0000] hover:bg-[#6b0000] disabled:bg-gray-300 text-white px-8 py-4 border-2 border-[#6b0000] transition-all font-serif font-semibold text-lg"
              >
                {isConnecting && side === 'B' ? 'Joining...' : 'Join Side B'}
              </button>
            </div>

            <p className="text-xs text-[#999] font-serif">
              Your ID: {userId}
            </p>
          </motion.div>
        </div>
      ) : (
        <div className="flex flex-col h-screen">
          {/* Moderator Bar */}
          <ModeratorBar messages={moderatorMessages} />

          {/* Main Debate Area */}
          <div className="flex-1 grid grid-cols-2 gap-0 overflow-hidden">
            <SideColumn 
              side="A" 
              users={sideA} 
              localUserId={userId + '-A'}
            />
            <SideColumn 
              side="B" 
              users={sideB} 
              localUserId={userId + '-B'}
            />
          </div>

          {/* Bottom Bar */}
          <div className="bg-white border-t-2 border-[#e0e0e0] p-4">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
              <Timer 
                duration={1200} 
                isRunning={true}
                onComplete={() => addModeratorMessage('Time limit reached for this round.')}
              />
              <PollWidget
                sideAVotes={pollVotes.A}
                sideBVotes={pollVotes.B}
                onVote={handleVote}
                userVote={userVote}
              />
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={toggleMic}
                className={`px-6 py-2 font-serif font-semibold transition-all border-2 ${
                  isMicEnabled
                    ? 'bg-[#1a1a1a] hover:bg-[#2c2c2c] text-white border-[#1a1a1a]'
                    : 'bg-red-500 hover:bg-red-600 text-white border-red-500'
                }`}
              >
                {isMicEnabled ? '🎤 Mute' : '🔇 Unmute'}
              </button>
              <button
                onClick={leaveRoom}
                className="px-6 py-2 bg-[#f0f0f0] hover:bg-[#e0e0e0] text-[#1a1a1a] font-serif font-semibold transition-all border-2 border-[#e0e0e0]"
              >
                Leave Debate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

