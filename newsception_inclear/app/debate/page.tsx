'use client';
import { useState, useEffect } from 'react';
import { 
  Room, 
  RoomEvent, 
  RemoteParticipant,
  LocalParticipant,
  Participant,
  Track,
} from 'livekit-client';

export default function DebatePage() {
  const [room, setRoom] = useState<Room | null>(null);
  const [joined, setJoined] = useState(false);
  const [side, setSide] = useState<'A' | 'B' | null>(null);
  const [userId] = useState(() => `Anon-${Math.random().toString(36).slice(2, 8).toUpperCase()}`);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [activeSpeakers, setActiveSpeakers] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Update participant list
  const updateParticipants = (room: Room) => {
    const allParticipants = [
      room.localParticipant,
      ...Array.from(room.remoteParticipants.values())
    ];
    setParticipants(allParticipants);
  };

  // Join room function
  async function joinRoom(chosenSide: 'A' | 'B') {
    setIsConnecting(true);
    setError(null);
    setSide(chosenSide);

    try {
      // Get token from API
      const res = await fetch(
        `/api/livekit-token?user=${userId}-${chosenSide}&room=news-debate`
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black p-4">
      {!joined ? (
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
              🎙️ InClear Debate
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Join anonymously and pick your side
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3 mb-6">
            <button
              onClick={() => joinRoom('A')}
              disabled={isConnecting}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-8 py-4 rounded-2xl shadow-lg transition-all transform hover:scale-105 disabled:scale-100 font-semibold text-lg"
            >
              {isConnecting && side === 'A' ? 'Joining...' : 'Side A 🔵'}
            </button>
            <button
              onClick={() => joinRoom('B')}
              disabled={isConnecting}
              className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-8 py-4 rounded-2xl shadow-lg transition-all transform hover:scale-105 disabled:scale-100 font-semibold text-lg"
            >
              {isConnecting && side === 'B' ? 'Joining...' : 'Side B 🔴'}
            </button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Your ID: {userId}
          </p>
        </div>
      ) : (
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center bg-white dark:bg-gray-800 p-6 rounded-t-3xl shadow-lg">
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              Live Debate — Side {side}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-1">
              You are <span className="font-semibold">{userId}</span>
            </p>
            <div className="flex justify-center gap-6 text-sm">
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                🔵 Side A: {sideCounts.A}
              </span>
              <span className="text-red-600 dark:text-red-400 font-medium">
                🔴 Side B: {sideCounts.B}
              </span>
            </div>
          </div>

          {/* Participants List */}
          <div className="bg-white dark:bg-gray-800 p-6 max-h-96 overflow-y-auto border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Participants ({participants.length})
            </h3>
            <div className="space-y-2">
              {participants.map((participant) => {
                const participantSide = getParticipantSide(participant.identity);
                const isLocal = participant instanceof LocalParticipant;
                const isSpeaking = activeSpeakers.has(participant.identity);
                const isMuted = !participant.isMicrophoneEnabled;

                return (
                  <div
                    key={participant.identity}
                    className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                      isSpeaking
                        ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500'
                        : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                          participantSide === 'A' ? 'bg-blue-500' : 'bg-red-500'
                        }`}
                      >
                        {participantSide}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {participant.identity}
                          {isLocal && (
                            <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                              You
                            </span>
                          )}
                        </div>
                        {isSpeaking && (
                          <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                            🎤 Speaking...
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-xl">
                      {isMuted ? '🔇' : '🎤'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-b-3xl shadow-lg">
            <div className="flex justify-center gap-4">
              <button
                onClick={toggleMic}
                className={`px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                  isMicEnabled
                    ? 'bg-gray-800 hover:bg-gray-700 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                {isMicEnabled ? '🎤 Mute' : '🔇 Unmute'}
              </button>
              <button
                onClick={leaveRoom}
                className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105"
              >
                🚪 Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
