import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import API from "../services/api";
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ShoppingBag,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { toast } from "react-toastify";

const Chatbot = () => {
  const { user, token } = useAuth();
  const { addToCart } = useCart();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: `Namaste! 🙏 I am your **Chai Assistant**. How can I help you today? Ask me for tea recommendations, pairings, ingredients, or active offers!`,
      suggestions: [
        "Recommend something strong ☕",
        "What snacks go well with tea? 🍔",
        "Today's active offers 🎟️",
        "Matka Kulhad Chai details"
      ]
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const msg = (textToSend || input).trim();
    if (!msg) return;

    const userMessageObj = {
      id: Date.now(),
      sender: "user",
      text: msg
    };

    setMessages((prev) => [...prev, userMessageObj]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const res = await API.post("/chatbot/message", {
        message: msg,
        context: {
          userName: user?.name,
          userEmail: user?.email,
          role: user?.role
        }
      });

      const reply = res.data?.data || {
        text: "I am always here to assist you with delicious Chai and snacks!",
        suggestions: ["Show Masala Chai", "Bun Maska", "Active Offers"]
      };

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: reply.text,
          suggestions: reply.suggestions || [],
          products: reply.products || []
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: "I am having a moment, but our hot Masala Chai is always ready! Try asking about our bestsellers or snacks.",
          suggestions: ["Show Bestsellers", "Chai Menu", "Active Offers"]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ☕ Floating Action Button */}
      <button
        className="chatbot-fab"
        onClick={() => setIsOpen(!isOpen)}
        title="Chat with Chai Assistant"
      >
        {isOpen ? <X size={26} /> : <MessageCircle size={28} />}
        {!isOpen && (
          <span
            className="position-absolute top-0 end-0 bg-danger border border-light rounded-circle"
            style={{ width: "12px", height: "12px" }}
          ></span>
        )}
      </button>

      {/* 💬 Chatbot Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="d-flex align-items-center gap-2">
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Bot size={20} />
              </div>
              <div>
                <h6 className="mb-0 fw-bold text-white d-flex align-items-center gap-1">
                  Chai Assistant <Sparkles size={14} className="text-warning" />
                </h6>
                <span style={{ fontSize: "0.72rem", color: "#FDE68A" }}>
                  ● Online • Ask anything about our menu
                </span>
              </div>
            </div>

            <button
              className="btn btn-sm btn-link text-white p-0"
              onClick={() => setIsOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Body */}
          <div className="chatbot-messages">
            {messages.map((m) => (
              <div key={m.id} className="d-flex flex-column">
                <div
                  className={`chat-bubble ${m.sender === "bot" ? "bot" : "user"}`}
                >
                  <p
                    className="mb-0"
                    style={{ whiteSpace: "pre-line" }}
                    dangerouslySetInnerHTML={{
                      __html: m.text
                        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                    }}
                  />
                </div>

                {/* ☕ Suggested Product Cards inside Chat */}
                {m.products && m.products.length > 0 && (
                  <div className="mt-2 d-flex flex-column gap-2">
                    {m.products.map((p) => (
                      <div
                        key={p._id || p.productId}
                        className="p-2 border rounded-3 bg-white d-flex align-items-center justify-content-between shadow-sm"
                        style={{ fontSize: "0.82rem" }}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={p.imageUrl || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800"}
                            alt={p.p_name}
                            style={{ width: "38px", height: "38px", borderRadius: "8px", objectFit: "cover" }}
                          />
                          <div>
                            <span className="fw-bold d-block text-truncate" style={{ maxWidth: "150px" }}>
                              {p.p_name}
                            </span>
                            <span className="text-success fw-bold">₹{p.price}</span>
                          </div>
                        </div>

                        <button
                          className="btn btn-sm btn-chai-primary py-1 px-2"
                          style={{ fontSize: "0.75rem" }}
                          onClick={() => {
                            addToCart(p, 1);
                          }}
                        >
                          <ShoppingBag size={12} className="me-1" /> Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* 💡 Suggestion Chips */}
                {m.suggestions && m.suggestions.length > 0 && (
                  <div className="d-flex flex-wrap gap-1 mt-2 mb-1">
                    {m.suggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        className="suggestion-chip"
                        onClick={() => handleSendMessage(sug)}
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="chat-bubble bot d-flex align-items-center gap-2 py-2">
                <span className="spinner-grow spinner-grow-sm text-warning" role="status"></span>
                <span className="small text-muted">Chai Assistant is brewing a reply...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-2 border-top bg-white d-flex gap-2 align-items-center">
            <input
              type="text"
              className="form-control form-control-sm border-0 bg-light"
              placeholder="Ask about teas, snacks, offers..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              style={{ borderRadius: "var(--radius-full)", padding: "8px 14px", fontSize: "0.88rem" }}
            />

            <button
              className="btn btn-chai-primary py-1 px-3 d-flex align-items-center justify-content-center"
              style={{ borderRadius: "var(--radius-full)", height: "36px" }}
              onClick={() => handleSendMessage()}
              disabled={loading || !input.trim()}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
