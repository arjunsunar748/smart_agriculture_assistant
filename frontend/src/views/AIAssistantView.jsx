import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';

export default function AIAssistantView() {
  const { district, farmingMethod, language } = useApp();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickQuestions = [
    { text: 'What should I plant now?', label_ne: 'अहिले के लगाउने?' },
    { text: 'Which crop has better market opportunity?', label_ne: 'कुन बालीको बजार अवसर राम्रो छ?' },
    { text: 'How much profit can I expect?', label_ne: 'कति नाफा अनुमान गर्न सकिन्छ?' },
    { text: 'When should I plant tomatoes?', label_ne: 'गोलभेडा कहिले रोप्ने?' },
    { text: 'Which market should I target?', label_ne: 'कुन बजार केन्द्र लक्षित गर्ने?' }
  ];

  useEffect(() => {
    // Initial friendly greeting
    const greeting =
      language === 'ne'
        ? 'नमस्ते! म तपाईंको कृषि सल्लाहकार हुँ। तपाईं बाली, बजार, रोप्ने समयतालिका र नाफाबारे कुनै पनि प्रश्न सोध्न सक्नुहुन्छ।'
        : 'Hello! I am your AI Agriculture Advisor. Ask me anything about off-season crops, market windows, planting schedules, and farm profits.';

    setMessages([
      {
        sender: 'ai',
        text: greeting,
        dataUsed: ['Market data', 'Weather data', 'Crop duration database'],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = {
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.sendAIChat({
        message: query,
        district,
        farming_method: farmingMethod,
        language
      });

      const aiMsg = {
        sender: 'ai',
        text: res.reply,
        dataUsed: ['Market data', 'Weather data', 'Crop data', 'Historical prices'],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('AI chat failed:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text:
            language === 'ne'
              ? 'माफ गर्नुहोस्, सम्पर्क हुन सकेन। कृपया केही समयपछि फेरि प्रयास गर्नुहोस्।'
              : 'Could not connect to the advisory service. Please try again.',
          dataUsed: ['System telemetry'],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4 fade-in" style={{ maxWidth: '850px' }}>
      {/* Header (Section 12) */}
      <div className="text-center mb-3">
        <h1 className="fs-3 fw-bold text-dark mb-1 d-flex align-items-center justify-content-center gap-2">
          <span className="text-success">🌱</span>
          <span>AI Agriculture Assistant</span>
        </h1>
        <p className="text-muted small">
          {language === 'ne'
            ? 'बाली, बजार, रोप्ने तालिका, नाफा र जोखिमबारे आफ्ना प्रश्नहरू सोध्नुहोस्।'
            : 'Ask questions about crops, markets, planting schedules, profit and farming risks.'}
        </p>
      </div>

      {/* Quick Question Buttons */}
      <div className="card agri-card p-3 mb-3 shadow-sm">
        <span className="text-muted text-xs fw-bold text-uppercase d-block mb-2">
          {language === 'ne' ? 'छिटो सोध्ने प्रश्नहरू:' : 'Quick Questions:'}
        </span>
        <div className="d-flex flex-wrap gap-2">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(language === 'ne' ? q.label_ne : q.text)}
              className="quick-prompt-btn"
            >
              <i className="bi bi-chat-dots me-1 text-success"></i>
              <span>{language === 'ne' ? q.label_ne : q.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Interface Window */}
      <div className="chat-window-clean">
        {/* Messages Stream */}
        <div className="chat-message-list">
          {messages.map((msg, i) => (
            <div key={i}>
              {msg.sender === 'user' ? (
                <div className="chat-msg-user">
                  <p className="mb-1">{msg.text}</p>
                  <span className="text-white-50 text-xs d-block text-end">{msg.time}</span>
                </div>
              ) : (
                <div className="chat-msg-ai">
                  <div className="d-flex align-items-center gap-1.5 mb-1 text-success fw-bold text-xs">
                    <span>🌱</span>
                    <span>AI Farm Advisor</span>
                  </div>
                  <p className="mb-2 text-dark small" style={{ whiteSpace: 'pre-line' }}>
                    {msg.text}
                  </p>

                  {/* "Data used" tags below AI responses (Section 12 requirement) */}
                  {msg.dataUsed && (
                    <div className="border-top pt-2 mt-2">
                      <span className="text-muted text-xs d-block mb-1 fw-semibold">
                        Data used:
                      </span>
                      <div className="d-flex flex-wrap">
                        {msg.dataUsed.map((tag, tIdx) => (
                          <span key={tIdx} className="chat-data-used-tag">
                            <i className="bi bi-database-check text-success"></i>
                            <span>{tag}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <span className="text-muted text-xs d-block text-end mt-1">{msg.time}</span>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="chat-msg-ai text-muted small">
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              {language === 'ne' ? 'कालीमाटी बजार र मौसम हिसाब गर्दैछ...' : 'Analyzing farm data and prices...'}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-top bg-light">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="input-group"
          >
            <input
              type="text"
              className="form-control"
              placeholder={language === 'ne' ? 'यहाँ प्रश्न लेख्नुहोस्...' : 'Ask question about crops, planting, profit...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn btn-agri px-4"
            >
              <i className="bi bi-send-fill me-1"></i>
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
