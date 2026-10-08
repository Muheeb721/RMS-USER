import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageOutlined, SendOutlined, CloseOutlined, RobotOutlined } from '@ant-design/icons';
import './chatbot.css';
import { propertyData, hostelData } from '../../data/dummyData';

const suggestedQuestions = [
  'Find rental properties',
  'Recommend hostels',
  'Search by location',
  'Show available properties'
];

// Backend chatbot API ka address
const CHAT_API_URL = 'http://localhost:5000/api/chatbot/message';

// Har browser session ke liye ek unique ID (taake conversation history yaad rahe)
const SESSION_ID = 'rms-user-' + Math.random().toString(36).substring(2, 10);

function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, from: 'bot', text: 'Hello! I am RMS AI. I can help you search listings, recommend hostels, and guide you through the platform.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const container = document.getElementById('chat-log');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, isTyping]);

  // Asal backend ko call karne wala function
  const sendToBackend = async (text) => {
    setMessages((prev) => [...prev, { id: Date.now(), from: 'user', text }]);
    setIsTyping(true);

    try {
      const response = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: SESSION_ID, message: text }),
      });

      if (!response.ok) {
        throw new Error('Server error');
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { id: Date.now() + 1, from: 'bot', text: data.reply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, from: 'bot', text: 'Maaf kijiye, abhi server se connect nahi ho pa raha. Dobara try karein.' },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickReply = (text) => {
    sendToBackend(text);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput('');
    sendToBackend(trimmed);
  };

  const summary = useMemo(() => `${propertyData.length} properties and ${hostelData.length} hostels available in Lahore right now.`, []);

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.95 }}
        className="chat-float"
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? <CloseOutlined /> : <MessageOutlined />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            className="chat-shell"
          >
            <div className="chat-header">
              <div>
                <div className="chat-title"><RobotOutlined /> RMS AI Assistant</div>
                <div className="chat-subtitle">Premium support for Lahore rentals</div>
              </div>
            </div>
            <div id="chat-log" className="chat-log">
              {messages.map((message) => (
                <div key={message.id} className={`chat-message ${message.from}`}>
                  {message.text}
                </div>
              ))}
              {isTyping && <div className="chat-message bot typing">Typing...</div>}
            </div>
            <div className="chat-suggestions">
              {suggestedQuestions.map((question) => (
                <button key={question} onClick={() => handleQuickReply(question)}>{question}</button>
              ))}
            </div>
            <form className="chat-input-row" onSubmit={handleSubmit}>
              <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about listings, hostels, or dues..." />
              <button type="submit"><SendOutlined /></button>
            </form>
            <div className="chat-summary">{summary}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ChatBot;