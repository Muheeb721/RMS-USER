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

const defaultResponses = {
  property: 'I found premium options in DHA Lahore, Bahria Town, and Gulberg. You can view them from the listings page.',
  hostel: 'I recommend Skyline Boys Hostel in Canal View and Horizon Girls Hostel in Valencia Town.',
  location: 'Popular Lahore areas include DHA Lahore, Bahria Town, Johar Town, Gulberg, and Model Town.',
  budget: 'I can filter listings by your budget range and bedroom count for the best matches.',
  general: 'RMS can help you browse properties, compare hostels, track dues, and answer FAQs for Lahore rentals.'
};

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

  const handleQuickReply = (text) => {
    setMessages((prev) => [...prev, { id: Date.now(), from: 'user', text }]);
    setIsTyping(true);
    setTimeout(() => {
      let reply = defaultResponses.general;
      if (text.includes('hostel')) reply = defaultResponses.hostel;
      if (text.includes('property')) reply = defaultResponses.property;
      if (text.includes('location')) reply = defaultResponses.location;
      if (text.includes('budget')) reply = defaultResponses.budget;
      setMessages((prev) => [...prev, { id: Date.now() + 1, from: 'bot', text: reply }]);
      setIsTyping(false);
    }, 700);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setMessages((prev) => [...prev, { id: Date.now(), from: 'user', text: trimmed }]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      let reply = defaultResponses.general;
      const lower = trimmed.toLowerCase();
      if (lower.includes('hostel')) reply = defaultResponses.hostel;
      if (lower.includes('property')) reply = defaultResponses.property;
      if (lower.includes('location')) reply = defaultResponses.location;
      if (lower.includes('budget')) reply = defaultResponses.budget;
      if (lower.includes('dues')) reply = 'You can view dues and payment history from the Resident Dues page with overdue alerts.';
      if (lower.includes('contact')) reply = `Reach out to ${propertyData[0].owner} at ${propertyData[0].contact} for assistance.`;
      setMessages((prev) => [...prev, { id: Date.now() + 1, from: 'bot', text: reply }]);
      setIsTyping(false);
    }, 700);
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
