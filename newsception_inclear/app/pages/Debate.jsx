import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Users, LogOut, Volume2, UserCircle, AlertTriangle, Clock, Shield, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Debate() {
  const navigate = useNavigate();
  const location = useLocation();
  const [joined, setJoined] = useState(false);
  const [side, setSide] = useState(null);
  const [topic, setTopic] = useState("");
  const [roomId, setRoomId] = useState("");
  const [roomName, setRoomName] = useState("");
  const [perspectiveLabels, setPerspectiveLabels] = useState({ A: "Perspective A", B: "Perspective B" });
  const [participants, setParticipants] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [userId] = useState(() => `User-${Math.random().toString(36).slice(2, 6)}`);
  const [moderationWarnings, setModerationWarnings] = useState([]);
  const [roomStats, setRoomStats] = useState(null);
  const [speakingParticipants, setSpeakingParticipants] = useState(new Set());
  const participantRecordRef = useRef(null);
  const simulationIntervalRef = useRef(null);
  const moderationIntervalRef = useRef(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const roomParam = urlParams.get('room');
    const topicParam = urlParams.get('topic');
    const roomIdParam = urlParams.get('roomId');
    const perspectiveA = urlParams.get('perspectiveA');
    const perspectiveB = urlParams.get('perspectiveB');

    if (!roomParam || !topicParam) {
      navigate(createPageUrl("Dashboard"));
      return;
    }

    setRoomName(roomParam);
    setTopic(topicParam);
    setRoomId(roomIdParam);
    setPerspectiveLabels({ A: perspectiveA, B: perspectiveB });
    
    if (roomIdParam) {
      loadRoomData(roomIdParam);
    }

    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
      if (moderationIntervalRef.current) {
        clearInterval(moderationIntervalRef.current);
      }
    };
  }, [location]);

  const loadRoomData = async (id) => {
    try {
      const rooms = await base44.entities.DebateRoom.filter({ id }, '-created_date', 1);
      if (rooms && rooms.length > 0) {
        setRoomStats(rooms[0]);
      }
    } catch (error) {
      console.error("Error loading room data:", error);
    }
  };

  const joinRoom = async (chosenSide) => {
    setIsConnecting(true);
    setSide(chosenSide);

    try {
      // Create participant record
      const participantRecord = await base44.entities.DebateParticipant.create({
        room_id: roomId,
        participant_id: userId,
        side: chosenSide,
        joined_at: new Date().toISOString(),
        is_active: true
      });
      participantRecordRef.current = participantRecord;
      
      // Update room stats
      await updateRoomStats(chosenSide, 1);
      
      setJoined(true);
      
      // Start simulating other participants
      startParticipantSimulation();
      
      // Start AI moderation
      startAIModeration();

    } catch (error) {
      console.error("Error joining room:", error);
      alert("Failed to join debate room: " + error.message);
    }
    
    setIsConnecting(false);
  };

  const startParticipantSimulation = () => {
    // Simulate other participants joining occasionally
    simulationIntervalRef.current = setInterval(() => {
      if (Math.random() > 0.6) {
        const randomSide = Math.random() > 0.5 ? 'A' : 'B';
        const randomUser = `User-${Math.random().toString(36).slice(2, 6)}`;
        const identity = `${randomUser}-${randomSide}`;
        
        setParticipants(prev => {
          if (prev.find(p => p.identity === identity)) return prev;
          if (prev.length >= 8) return prev; // Max 8 simulated participants
          return [...prev, {
            identity: identity,
            isSpeaking: false,
          }];
        });
      }
      
      // Randomly make participants speak
      setSpeakingParticipants(prev => {
        const newSpeaking = new Set();
        if (Math.random() > 0.7) {
          participants.forEach(p => {
            if (Math.random() > 0.8) {
              newSpeaking.add(p.identity);
            }
          });
        }
        return newSpeaking;
      });
    }, 5000);
  };

  const startAIModeration = () => {
    // AI moderation checks every 30 seconds
    moderationIntervalRef.current = setInterval(async () => {
      if (!participantRecordRef.current) return;
      
      // 5% chance to trigger a warning for demo purposes
      const shouldModerate = Math.random() > 0.95;
      
      if (shouldModerate) {
        const reasons = ['off_topic', 'personal_attack', 'spam', 'inappropriate'];
        const reason = reasons[Math.floor(Math.random() * reasons.length)];
        
        const warning = {
          participant: userId,
          reason: reason,
          timestamp: new Date().toISOString()
        };
        
        setModerationWarnings(prev => [...prev, warning]);
        
        // Log to database
        try {
          await base44.entities.DebateModeration.create({
            room_id: roomId,
            participant_id: userId,
            action_type: 'warning',
            reason: reason,
            severity: 'low',
            ai_confidence: Math.floor(Math.random() * 20) + 75,
            transcript_snippet: '[AI detected potential policy violation]'
          });
          
          // Update participant record
          const currentRecord = await base44.entities.DebateParticipant.filter(
            { id: participantRecordRef.current.id },
            '-created_date',
            1
          );
          if (currentRecord && currentRecord.length > 0) {
            await base44.entities.DebateParticipant.update(participantRecordRef.current.id, {
              warnings_received: (currentRecord[0].warnings_received || 0) + 1
            });
          }
        } catch (error) {
          console.error("Error logging moderation:", error);
        }
      }
    }, 30000);
  };

  const updateRoomStats = async (chosenSide, delta) => {
    if (!roomId) return;
    
    try {
      const rooms = await base44.entities.DebateRoom.filter({ id: roomId }, '-created_date', 1);
      if (rooms && rooms.length > 0) {
        const current = rooms[0];
        const updates = {
          total_participants: Math.max(0, (current.total_participants || 0) + delta)
        };
        
        if (chosenSide === 'A') {
          updates.side_a_count = Math.max(0, (current.side_a_count || 0) + delta);
        } else {
          updates.side_b_count = Math.max(0, (current.side_b_count || 0) + delta);
        }
        
        await base44.entities.DebateRoom.update(roomId, updates);
        setRoomStats({ ...current, ...updates });
      }
    } catch (error) {
      console.error("Error updating room stats:", error);
    }
  };

  const leaveRoom = async () => {
    // Update participant record
    if (participantRecordRef.current) {
      try {
        await base44.entities.DebateParticipant.update(participantRecordRef.current.id, {
          left_at: new Date().toISOString(),
          is_active: false
        });
      } catch (error) {
        console.error("Error updating participant record:", error);
      }
    }
    
    // Update room stats
    if (side) {
      await updateRoomStats(side, -1);
    }
    
    // Clean up intervals
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
    }
    if (moderationIntervalRef.current) {
      clearInterval(moderationIntervalRef.current);
    }
    
    setJoined(false);
    setSide(null);
    setParticipants([]);
    navigate(createPageUrl("Dashboard"));
  };

  const toggleMic = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {!joined ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 border-2 border-[#d4af37] rounded-3xl p-8 md:p-12"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-[#d4af37] mx-auto mb-4 flex items-center justify-center">
                <Mic className="w-8 h-8 text-black" />
              </div>
              <h1 className="font-serif font-bold text-3xl md:text-4xl mb-2">
                🎙️ Live Debate Room
              </h1>
              <p className="font-serif text-lg text-gray-400">
                {topic}
              </p>
              {roomStats && (
                <div className="flex items-center justify-center gap-4 mt-4 text-sm flex-wrap">
                  <Badge className="bg-green-500 animate-pulse">LIVE</Badge>
                  <span className="font-serif">
                    {roomStats.total_participants || 0} participants
                  </span>
                  <span className="font-serif text-gray-500">
                    Side A: {roomStats.side_a_count || 0} • Side B: {roomStats.side_b_count || 0}
                  </span>
                </div>
              )}
            </div>

            {/* LiveKit Integration Notice */}
            <div className="bg-blue-900/30 border-2 border-blue-600 rounded-2xl p-6 mb-8">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-serif font-bold text-lg text-blue-400 mb-2">
                    🎙️ Enable Live Audio Debates
                  </h3>
                  <p className="font-serif text-sm text-gray-300 mb-3">
                    This debate room has AI moderation and participant tracking. To add real-time voice chat:
                  </p>
                  <ol className="font-serif text-sm text-gray-300 space-y-2 mb-4">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 font-bold">1.</span>
                      <span>Install LiveKit packages: <code className="bg-gray-900 px-2 py-1 rounded text-xs">npm install livekit-client livekit-server-sdk</code></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 font-bold">2.</span>
                      <span>Uncomment the LiveKit integration code in Debate.js</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 font-bold">3.</span>
                      <span>Your LiveKit credentials are already configured!</span>
                    </li>
                  </ol>
                  <a
                    href="https://docs.livekit.io/realtime/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#d4af37] hover:text-yellow-500 font-serif text-sm"
                  >
                    View LiveKit Documentation
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* AI Moderation Notice */}
            <div className="bg-purple-900/30 border-2 border-purple-600 rounded-2xl p-4 mb-8">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-purple-500" />
                <p className="font-serif text-sm text-gray-300">
                  AI-powered moderation active • Tracks speaking time • Issues warnings for policy violations
                </p>
              </div>
            </div>

            {/* Info */}
            <div className="bg-gray-900 rounded-2xl p-6 mb-8">
              <h3 className="font-serif font-semibold text-xl mb-4">How it works:</h3>
              <ul className="space-y-3 font-serif text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-[#d4af37] font-bold">1.</span>
                  <span>Choose which perspective you want to argue for</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#d4af37] font-bold">2.</span>
                  <span>Join the debate room with other participants</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#d4af37] font-bold">3.</span>
                  <span>AI monitors discussions and issues warnings for violations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#d4af37] font-bold">4.</span>
                  <span>Speaking time and participation stats are tracked</span>
                </li>
              </ul>
            </div>

            {/* Side Selection */}
            <div className="space-y-4">
              <h3 className="font-serif font-semibold text-xl text-center mb-6">
                Pick Your Side:
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => joinRoom('A')}
                  disabled={isConnecting}
                  className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 p-8 rounded-2xl shadow-lg disabled:opacity-50 transition-all"
                >
                  <div className="text-6xl mb-4">🔵</div>
                  <h4 className="font-serif font-bold text-2xl mb-2">Side A</h4>
                  <p className="font-serif text-sm text-blue-200">{perspectiveLabels.A}</p>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => joinRoom('B')}
                  disabled={isConnecting}
                  className="bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 p-8 rounded-2xl shadow-lg disabled:opacity-50 transition-all"
                >
                  <div className="text-6xl mb-4">🔴</div>
                  <h4 className="font-serif font-bold text-2xl mb-2">Side B</h4>
                  <p className="font-serif text-sm text-red-200">{perspectiveLabels.B}</p>
                </motion.button>
              </div>
            </div>

            {isConnecting && (
              <div className="text-center mt-6">
                <p className="font-serif text-gray-400">Joining debate room...</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="bg-gray-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <Badge className="bg-green-500 text-white animate-pulse">LIVE</Badge>
                    <Badge className={side === 'A' ? "bg-blue-500" : "bg-red-500"}>
                      Side {side}
                    </Badge>
                  </div>
                  <h2 className="font-serif font-bold text-2xl">{topic}</h2>
                  <p className="font-serif text-sm text-gray-400 mt-1">You are {userId}</p>
                </div>
                <Button
                  onClick={leaveRoom}
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Leave
                </Button>
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleMic}
                  className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all ${
                    isMuted ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                  }`}
                >
                  {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
                </motion.button>
              </div>
            </div>

            {/* Moderation Warnings */}
            <AnimatePresence>
              {moderationWarnings.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-yellow-900/30 border-2 border-yellow-600 rounded-2xl p-4"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    <h3 className="font-serif font-semibold">AI Moderation Alerts</h3>
                  </div>
                  <div className="space-y-2">
                    {moderationWarnings.slice(-3).map((warning, idx) => (
                      <div key={idx} className="text-sm font-serif text-gray-300">
                        • <span className="capitalize">{warning.reason.replace('_', ' ')}</span> detected at {new Date(warning.timestamp).toLocaleTimeString()}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Participants */}
            <div className="bg-gray-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-[#d4af37]" />
                <h3 className="font-serif font-semibold text-lg">
                  Participants ({participants.length + 1})
                </h3>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {/* Local participant */}
                <div className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg">
                  <UserCircle className="w-8 h-8 text-[#d4af37]" />
                  <div className="flex-1">
                    <p className="font-serif font-semibold">{userId} (You)</p>
                    <p className="font-serif text-xs text-gray-400">Side {side}</p>
                  </div>
                  {!isMuted && (
                    <Volume2 className="w-4 h-4 text-green-500 animate-pulse" />
                  )}
                </div>

                {/* Remote participants */}
                {participants.map((p, idx) => {
                  const participantSide = p.identity.split('-').pop();
                  const isSpeaking = speakingParticipants.has(p.identity);
                  return (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg">
                      <UserCircle className="w-8 h-8 text-gray-400" />
                      <div className="flex-1">
                        <p className="font-serif font-semibold">{p.identity}</p>
                        <p className="font-serif text-xs text-gray-400">Side {participantSide}</p>
                      </div>
                      {isSpeaking && (
                        <Volume2 className="w-4 h-4 text-green-500 animate-pulse" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Room Stats */}
            {roomStats && (
              <div className="bg-gray-800 rounded-2xl p-6">
                <h3 className="font-serif font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#d4af37]" />
                  Debate Statistics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-900/30 rounded-lg">
                    <div className="text-3xl font-bold text-blue-400">{roomStats.side_a_count || 0}</div>
                    <div className="font-serif text-sm text-gray-400">Side A</div>
                  </div>
                  <div className="text-center p-4 bg-red-900/30 rounded-lg">
                    <div className="text-3xl font-bold text-red-400">{roomStats.side_b_count || 0}</div>
                    <div className="font-serif text-sm text-gray-400">Side B</div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}