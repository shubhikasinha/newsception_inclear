'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Room, 
  RoomEvent, 
  RemoteParticipant,
  LocalParticipant,
  Participant,
  Track,
} from 'livekit-client';
import { ArrowLeft, Radio, Volume2 } from 'lucide-react';
import Link from 'next/link';
import DebateRequestPanel from '../components/debate/DebateRequestPanel';

export default function DebatePage() {
  const [room, setRoom] = useState<Room | null>(null);
  const [joined, setJoined] = useState(false);
  const [currentTopic, setCurrentTopic] = useState('');
  const [side, setSide] = useState<'A' | 'B' | null>(null);
  const [userId] = useState(() => `Anon-${Math.random().toString(36).slice(2, 8).toUpperCase()}`);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [activeSpeakers, setActiveSpeakers] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showVoting, setShowVoting] = useState(true);

  // Update participant list
  const updateParticipants = (room: Room) => {
    const allParticipants = [
      room.localParticipant,
      ...Array.from(room.remoteParticipants.values())
    ];
    setParticipants(allParticipants);
  };

  // Join room function
  async function joinRoom(roomId: string, topic: string, chosenSide: 'A' | 'B') {
    if (!roomId || !topic) {
      setError('Invalid room ID or topic');
      return;
    }
    setIsConnecting(true);
    setError(null);
    setSide(chosenSide);
    setCurrentTopic(topic);
    setShowVoting(false);    try {
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

      // Set up event listeners before connecting
      newRoom.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
        console.log(`${participant.identity} joined`);
        updateParticipants(newRoom);
      });

      newRoom.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
        console.log(`${participant.identity} left`);
        updateParticipants(newRoom);
      });

      // Handle incoming audio tracks
      newRoom.on(RoomEvent.TrackSubscribed, (track) => {
        if (track.kind === Track.Kind.Audio) {
          const audioElement = track.attach();
          document.body.appendChild(audioElement);
        }
      });

      newRoom.on(RoomEvent.TrackUnsubscribed, (track) => {
        track.detach().forEach(element => element.remove());
      });

      // Active speaker detection
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
    } catch (err) {
      console.error('Error joining room:', err);
      setError(err instanceof Error ? err.message : 'Failed to join room');
      setIsConnecting(false);
      setSide(null);
      setShowVoting(true);
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
    setShowVoting(true);
    setCurrentTopic('');
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [room]);

  // Get side from participant identity
  const getParticipantSide = (identity: string): 'A' | 'B' | 'Unknown' => {
    if (identity.endsWith('-A')) return 'A';
    if (identity.endsWith('-B')) return 'B';
    return 'Unknown';
  };

  // Count participants by side
  const getSideCounts = () => {
    const counts = { A: 0, B: 0 };
    participants.forEach(p => {
      const participantSide = getParticipantSide(p.identity);
      if (participantSide === 'A') counts.A++;
      if (participantSide === 'B') counts.B++;
    });
    return counts;
  };

  const sideCounts = getSideCounts();

  const handleJoinDebate = (roomId: string, topic: string) => {
    // Show side selection
    setCurrentTopic(topic);
    setShowVoting(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#d4af37] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#b8860b] flex items-center justify-center">
              <Radio className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-serif text-3xl font-bold text-gray-900 dark:text-white">
                Live Debates
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Twitter Spaces-style discussions on trending topics
              </p>
            </div>
          </div>
        </div>

        {/* Voting Panel or Debate Room */}
        <AnimatePresence mode="wait">
          {showVoting && !joined ? (
            <motion.div
              key="voting"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <DebateRequestPanel onJoinDebate={handleJoinDebate} />
            </motion.div>
          ) : !joined && currentTopic ? (
            <motion.div
              key="side-selection"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="neomorphic p-8 rounded-xl text-center"
            >
              <h2 className="font-serif text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {currentTopic}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Choose your side to join the debate
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => joinRoom('news-debate', currentTopic, 'A')}
                  disabled={isConnecting}
                  className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg disabled:opacity-50 transition-all"
                >
                  <div className="text-4xl mb-3">🔵</div>
                  <h3 className="font-bold text-lg mb-2">Side A - Supporting</h3>
                  <p className="text-sm opacity-90">Join those in favor</p>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => joinRoom('news-debate', currentTopic, 'B')}
                  disabled={isConnecting}
                  className="p-6 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl shadow-lg disabled:opacity-50 transition-all"
                >
                  <div className="text-4xl mb-3">🔴</div>
                  <h3 className="font-bold text-lg mb-2">Side B - Critical</h3>
                  <p className="text-sm opacity-90">Join those opposed</p>
                </motion.button>
              </div>

              <button
                onClick={() => {
                  setShowVoting(true);
                  setCurrentTopic('');
                }}
                className="mt-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                ← Back to debates
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="debate-room"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Active Debate Room */}
              <div className="neomorphic rounded-xl overflow-hidden">
                {/* Room Header */}
                <div className="bg-gradient-to-r from-[#d4af37] to-[#b8860b] p-6 text-white">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      <Radio className="w-4 h-4 animate-pulse" />
                      <span className="text-sm font-medium">LIVE</span>
                    </div>
                    <span className="text-sm opacity-90">{participants.length} participants</span>
                  </div>
                  <h2 className="font-serif text-2xl font-bold mb-2">{currentTopic}</h2>
                  <p className="opacity-90">
                    You are <span className="font-semibold">{userId}</span> on Side {side}
                  </p>
                </div>

                {/* Side Counts */}
                <div className="grid grid-cols-2 gap-px bg-gray-200 dark:bg-gray-700">
                  <div className="bg-white dark:bg-gray-800 p-4 text-center">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {sideCounts.A}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">🔵 Side A</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 text-center">
                    <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                      {sideCounts.B}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">🔴 Side B</div>
                  </div>
                </div>

                {/* Participants List */}
                <div className="bg-white dark:bg-gray-800 p-6 max-h-96 overflow-y-auto">
                  <h3 className="flex items-center gap-2 text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    <Volume2 className="w-5 h-5 text-[#d4af37]" />
                    Active Speakers
                  </h3>
                  <div className="space-y-2">
                    {participants.map((participant) => {
                      const participantSide = getParticipantSide(participant.identity);
                      const isLocal = participant instanceof LocalParticipant;
                      const isSpeaking = activeSpeakers.has(participant.identity);
                      const isMuted = !participant.isMicrophoneEnabled;

                      return (
                        <motion.div
                          key={participant.identity}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                            isSpeaking
                              ? 'bg-green-100 dark:bg-green-900/30 ring-2 ring-green-500'
                              : 'bg-gray-50 dark:bg-gray-700/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                                participantSide === 'A' ? 'bg-blue-500' : 'bg-red-500'
                              }`}
                            >
                              {participantSide}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {participant.identity.replace('-A', '').replace('-B', '')}
                                {isLocal && (
                                  <span className="ml-2 text-xs bg-[#d4af37] text-white px-2 py-1 rounded-full">
                                    You
                                  </span>
                                )}
                              </div>
                              {isSpeaking && (
                                <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium mt-1">
                                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                  Speaking...
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-2xl">
                            {isMuted ? '🔇' : '🎤'}                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Controls */}
                <div className="bg-white dark:bg-gray-800 p-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-center gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={toggleMic}
                      className={`px-8 py-4 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                        isMicEnabled
                          ? 'bg-gray-800 hover:bg-gray-700 text-white'
                          : 'bg-red-500 hover:bg-red-600 text-white'
                      }`}
                    >
                      {isMicEnabled ? '🎤 Mute' : '🔇 Unmute'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={leaveRoom}
                      className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-white px-8 py-4 rounded-xl font-semibold transition-all"
                    >
                      🚪 Leave Debate
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
