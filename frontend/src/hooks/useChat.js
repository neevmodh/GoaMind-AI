import { useState } from 'react';
import api from '../api/client';

export default function useChat() {
  const [messages, setMessages] = useState([
    { text: "Hi! I'm GoaMind, your smart travel assistant. Where do you want to go today?", isBot: true }
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (message) => {
    setMessages(prev => [...prev, { text: message, isBot: false }]);
    setLoading(true);
    try {
      const res = await api.post('/chat', { message });
      setMessages(prev => [...prev, { text: res.data.reply, isBot: true }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { text: "Sorry, I couldn't process that request right now.", isBot: true }]);
    } finally {
      setLoading(false);
    }
  };

  return { messages, sendMessage, loading };
}
