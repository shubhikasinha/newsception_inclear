import { AccessToken } from 'livekit-server-sdk';
import { logger } from '../utils/logger';

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;

export class LiveKitService {
  async generateToken(roomName: string, participantName: string): Promise<string | null> {
    try {
      if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
        logger.warn('LiveKit credentials not configured');
        return null;
      }

      const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
        identity: participantName,
      });

      at.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
      });

      return await at.toJwt();
    } catch (error) {
      logger.error('Error generating LiveKit token:', error);
      return null;
    }
  }

  isConfigured(): boolean {
    return !!(LIVEKIT_API_KEY && LIVEKIT_API_SECRET);
  }
}

export default new LiveKitService();
