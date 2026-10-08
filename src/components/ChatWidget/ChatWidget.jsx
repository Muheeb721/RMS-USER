import { useEffect, useRef, useState } from 'react';
import { CloseOutlined, MessageOutlined, RobotOutlined, SendOutlined } from '@ant-design/icons';
import './ChatWidget.css';

// Node backend ka chatbot route (React -> Node 5000 -> FastAPI 8000)
const CHAT_API_URL = 'http://localhost:5000/api/chatbot/message';

// Har browser session ke liye ek unique ID (taake conversation history yaad rahe)
const SESSION_ID = 'rms-user-' + Math.random().toString(36).substring(2, 10);

const initialMessages = [
  {
    id: 'welcome',
    sender: 'bot',
    text: 'Hello! I can help with listings, hostels, payments, and platform guidance.',
  },
];

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: SESSION_ID, message: trimmed }),
      });

      if (!response.ok) {
        throw new Error(`Chat request failed with status ${response.status}`);
      }

      const data = await response.json();
      const reply = data?.reply || "I'm sorry, I couldn't generate a response right now.";

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: reply,
        },
      ]);
    } catch (error) {
      console.error('Chatbot request failed:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          sender: 'bot',
          text: 'I am having trouble reaching the assistant right now. Please try again in a moment.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (event) => {
    event.preventDefault();
    handleSend();
  };

  return (
    <>
      <button
        type="button"
        className="chat-widget-toggle"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? <CloseOutlined /> : <MessageOutlined />}
      </button>

      {isOpen && (
        <div className="chat-widget-shell" role="dialog" aria-label="Chat assistant">
          <div className="chat-widget-header">
            <div className="chat-widget-title">
              <RobotOutlined />
              <span>RMS Assistant</span>
            </div>
          </div>

          <div ref={scrollRef} className="chat-widget-messages">
            {messages.map((message) => (
              <div key={message.id} className={`chat-bubble ${message.sender}`}>
                {message.text}
              </div>
            ))}

            {isLoading && <div className="chat-bubble bot typing">Typing...</div>}
          </div>

          <form className="chat-widget-form" onSubmit={onSubmit}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about listings, hostels, or payments..."
              aria-label="Type your message"
            />
            <button type="submit" disabled={isLoading || !input.trim()} aria-label="Send message">
              <SendOutlined />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default ChatWidget;