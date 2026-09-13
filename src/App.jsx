import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [messages, setMessages] = useState([
    { text: "Hi there! I'm your Tech Support Bot. How can I help you today?", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Speech-to-Text Voice Recognition Handler
  const handleVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages = [...messages, { text: input, sender: "user" }];
    setMessages(newMessages);
    const userQuery = input;
    setInput("");

    try {
      const response = await fetch("https://codealpha-faq-chatbot-5ug4.onrender.com/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userQuery })
      });
      
      const data = await response.json();
      setMessages([...newMessages, { text: data.response, sender: "bot" }]);
    } catch (error) {
      setMessages([...newMessages, { text: "Error: Could not reach the Python server. Make sure app.py is running.", sender: "bot" }]);
    }
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h2>Tech Support AI</h2>
      </header>
      
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`message-wrapper ${msg.sender}`}>
            <div className={`message-bubble ${msg.sender}`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="input-area" onSubmit={sendMessage}>
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder={isListening ? "Listening to your voice..." : "Ask a question..."} 
        />

        {/* Voice Input Mic Button */}
        <button
          type="button"
          onClick={handleVoiceInput}
          title={isListening ? "Stop listening" : "Click to speak"}
          style={{
            background: isListening ? "#ef4444" : "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "8px 12px",
            cursor: "pointer",
            fontSize: "16px",
            marginRight: "4px"
          }}
        >
          {isListening ? "⏹" : "🎤"}
        </button>

        <button type="submit">Send</button>
      </form>
    </div>
  )
}

export default App

