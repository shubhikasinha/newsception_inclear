import { v4 as uuidv4 } from 'uuid';

// Generate a consistent anonymous ID that will be the same between renders
export const generateAnonId = () => {
  // Use first 6 chars of UUID for shorter, readable IDs
  return `Anon-${uuidv4().substring(0, 6).toUpperCase()}`;
};

// Generate a consistent room ID
export const generateRoomId = (topic: string) => {
  return `debate-${topic.toLowerCase().replace(/\s+/g, '-')}-${uuidv4().substring(0, 6)}`;
};

// Generate a participant session ID
export const generateSessionId = () => {
  return uuidv4();
};