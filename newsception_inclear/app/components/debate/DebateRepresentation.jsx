import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Users, Mic, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function DebateRequestButton({ topic, articleId, perspectiveCriteria }) {
  const navigate = useNavigate();
  const [requestCount, setRequestCount] = useState(0);
  const [hasRequested, setHasRequested] = useState(false);
  const [activeRoom, setActiveRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkDebateStatus();
  }, [topic]);

  const checkDebateStatus = async () => {
    try {
      // Check for active room
      const rooms = await base44.entities.DebateRoom.filter(
        { topic, status: "active" },
        '-created_date',
        1
      );

      if (rooms && rooms.length > 0) {
        setActiveRoom(rooms[0]);
        return;
      }

      // Check pending requests
      const requests = await base44.entities.DebateRequest.filter(
        { topic, status: "pending" },
        '-created_date',
        10
      );

      setRequestCount(requests?.length || 0);

      // Check if current user already requested
      const user = await base44.auth.me();
      const userRequest = requests?.find(r => r.user_email === user.email);
      setHasRequested(!!userRequest);

    } catch (error) {
      console.error("Error checking debate status:", error);
    }
  };

  const handleRequestDebate = async () => {
    setIsLoading(true);
    try {
      const user = await base44.auth.me();

      // Create debate request
      await base44.entities.DebateRequest.create({
        topic,
        article_id: articleId,
        user_email: user.email,
        side_preference: "neutral",
        status: "pending"
      });

      setHasRequested(true);
      const newCount = requestCount + 1;
      setRequestCount(newCount);

      // If we hit 5 requests, create the room
      if (newCount >= 5) {
        await createDebateRoom();
      }

    } catch (error) {
      console.error("Error requesting debate:", error);
    }
    setIsLoading(false);
  };

  const createDebateRoom = async () => {
    try {
      const roomName = `debate-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      
      const room = await base44.entities.DebateRoom.create({
        topic,
        article_id: articleId,
        room_name: roomName,
        status: "active",
        started_at: new Date().toISOString(),
        side_a_count: 0,
        side_b_count: 0,
        total_participants: 0
      });

      // Update all pending requests
      const requests = await base44.entities.DebateRequest.filter(
        { topic, status: "pending" },
        '-created_date',
        10
      );

      for (const request of requests || []) {
        await base44.entities.DebateRequest.update(request.id, {
          status: "room_created"
        });
      }

      setActiveRoom(room);
    } catch (error) {
      console.error("Error creating debate room:", error);
    }
  };

  const joinDebateRoom = () => {
    const params = new URLSearchParams({
      room: activeRoom.room_name,
      topic: topic,
      roomId: activeRoom.id,
      perspectiveA: perspectiveCriteria?.perspective_a_label || "Perspective A",
      perspectiveB: perspectiveCriteria?.perspective_b_label || "Perspective B"
    });
    navigate(createPageUrl("Debate") + `?${params.toString()}`);
  };

  if (activeRoom) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-[#1a1a1a] border-2 border-green-500 p-6 rounded-2xl"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
            <Mic className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-serif font-bold text-xl">🎙️ Live Debate Active!</h3>
              <Badge className="bg-green-500 text-white">LIVE</Badge>
            </div>
            <p className="font-serif text-sm text-gray-600 dark:text-gray-400 mb-4">
              Join the live audio debate on this topic. Pick your side and voice your perspective!
            </p>
            <div className="flex items-center gap-4 mb-4 text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="font-serif">
                  {activeRoom.total_participants || 0} participants
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-gray-500">
                  Side A: {activeRoom.side_a_count || 0} • Side B: {activeRoom.side_b_count || 0}
                </span>
              </div>
            </div>
            <Button
              onClick={joinDebateRoom}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-serif"
            >
              <Mic className="w-4 h-4 mr-2" />
              Join Live Debate
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#1a1a1a] border-2 border-[#1a1a1a] dark:border-[#333] p-6 rounded-2xl"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-[#d4af37] flex items-center justify-center flex-shrink-0">
          <MessageCircle className="w-6 h-6 text-[#d4af37]" />
        </div>
        <div className="flex-1">
          <h3 className="font-serif font-bold text-xl mb-2">
            Want to Debate This Live?
          </h3>
          <p className="font-serif text-sm text-gray-600 dark:text-gray-400 mb-4">
            Request a live audio debate room. When 5+ people request, a Twitter Spaces–style debate room will start!
          </p>
          
          <AnimatePresence>
            {requestCount > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(requestCount / 5) * 100}%` }}
                      className="h-full bg-gradient-to-r from-[#d4af37] to-green-500"
                    />
                  </div>
                  <span className="font-serif font-bold text-sm">
                    {requestCount}/5
                  </span>
                </div>
                <p className="font-serif text-xs text-gray-500 mt-2">
                  {5 - requestCount} more {5 - requestCount === 1 ? 'person' : 'people'} needed to start the debate
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            onClick={handleRequestDebate}
            disabled={hasRequested || isLoading}
            className={`w-full ${
              hasRequested
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#d4af37] hover:bg-[#b8860b]"
            } text-black font-serif`}
          >
            {hasRequested ? (
              <>✓ You've Requested</>
            ) : isLoading ? (
              <>Requesting...</>
            ) : (
              <>
                <MessageCircle className="w-4 h-4 mr-2" />
                Request Live Debate
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}