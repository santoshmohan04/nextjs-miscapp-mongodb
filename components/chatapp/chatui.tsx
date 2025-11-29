"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./chatui.module.css";
import { Card } from "react-bootstrap";
import Button from "react-bootstrap/Button";

const BOT_IMG =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Logo_wikibot.svg/400px-Logo_wikibot.svg.png";

const PERSON_IMG = "https://www.svgrepo.com/show/192244/man-user.svg";

export default function ChatUI() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [botTyping, setBotTyping] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadChatHistory();
  }, []);

  async function loadChatHistory() {
    try {
      const res = await fetch("/api/chat/history");
      const data = await res.json();
      if (Array.isArray(data?.messages) && data.messages.length > 0) {
        setMessages(data.messages);
      } else {
        loadDefaultGreeting();
      }
    } catch (e) {
      loadDefaultGreeting(); // fallback
    }
  }

  function loadDefaultGreeting() {
    const defaultMsgs = [
      {
        sender: "bot",
        text: "👋 Hi there! Welcome to SimpleChat.",
        time: new Date().toLocaleTimeString(),
      },
      {
        sender: "bot",
        text: "How can I assist you today?",
        time: new Date().toLocaleTimeString(),
      },
      {
        sender: "bot",
        type: "options",
        options: [
          "Show my bookmarks",
          "Tell me a recipe",
          "Weather updates",
          "About this website",
        ],
      },
    ];
    setMessages(defaultMsgs);
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, botTyping]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = {
      sender: "user",
      text: input,
      time: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    saveToHistory(userMsg);
    setInput("");

    setBotTyping(true);

    const reply = await handleBotReply(input);

    setBotTyping(false);

    const botMsg = {
      sender: "bot",
      text: reply.message, // ✅ FIXED: always string
      error: reply.error || false,
      retryAction: reply.retryAction || null,
      time: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, botMsg]);
    saveToHistory(botMsg);
  };

  async function handleBotReply(text: string) {
    try {
      // BOOKMARKS
      if (text.toLowerCase().includes("bookmark")) {
        const res = await fetch("/api/bookmarks");

        if (!res.ok) {
          return {
            error: true,
            message: "❌ Unable to fetch bookmarks.",
            retryAction: "bookmarks",
          };
        }

        const data = await res.json();

        if (!data?.data?.length) {
          return { message: "📭 You have no bookmarks yet." };
        }

        return {
          message:
            "📘 Your bookmarks:\n" +
            data.data.map((b: any) => `• ${b.title}`).join("\n"),
        };
      }

      // RECIPE
      if (text.toLowerCase().includes("recipe")) {
        const res = await fetch("/api/recipes/random");

        if (!res.ok) {
          return {
            error: true,
            message: "❌ Unable to fetch a recipe.",
            retryAction: "recipe",
          };
        }

        const data = await res.json();

        return {
          message: `🍽 Random Recipe: ${data.title}\n${data.description}`,
        };
      }

      // WEBSITE INFO
      if (text.includes("About this website")) {
        return {
          message: "ℹ️ Built with Next.js, MongoDB, Redux & Bootstrap!",
        };
      }

      return { message: "🤖 I'm still learning! But I received: " + text };
    } catch {
      return {
        error: true,
        message: "⚠️ Something went wrong.",
        retryAction: "generic",
      };
    }
  }

  async function retryAction(type: string) {
    setBotTyping(true);

    let reply;

    if (type === "bookmarks") reply = await handleBotReply("show bookmarks");
    else if (type === "recipe") reply = await handleBotReply("recipe");
    else reply = { message: "Please try again." };

    setBotTyping(false);

    const botMsg = {
      sender: "bot",
      text: reply.message,
      error: reply.error || false,
      retryAction: reply.retryAction || null,
      time: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, botMsg]);
    saveToHistory(botMsg);
  }

  async function saveToHistory(message: any) {
    await fetch("/api/chat/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
  }

  return (
    <div className={styles.container}>
      <Card className={styles.chatCard}>
        <div className={styles.header}>SimpleChat</div>

        <div className={styles.messagesArea}>
          {messages.map((msg, index) =>
            msg.type === "options" ? (
              <div key={index} className={styles.optionsWrap}>
                {msg.options.map((opt: string, i: number) => (
                  <button
                    key={i}
                    className={styles.optionButton}
                    onClick={() => setInput(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <div
                key={index}
                className={
                  msg.sender === "user" ? styles.userMsg : styles.botMsg
                }
              >
                <img
                  src={msg.sender === "user" ? PERSON_IMG : BOT_IMG}
                  className={styles.avatar}
                />

                <div
                  className={`${styles.msgBubble} ${
                    msg.error ? styles.errorBubble : ""
                  }`}
                >
                  <div className={styles.msgText}>{msg.text}</div>
                  <div className={styles.msgTime}>{msg.time}</div>

                  {/* Retry button */}
                  {msg.retryAction && (
                    <button
                      className={styles.retryButton}
                      onClick={() => retryAction(msg.retryAction)}
                    >
                      🔁 Retry
                    </button>
                  )}
                </div>
              </div>
            )
          )}

          {/* Typing Indicator */}
          {botTyping && (
            <div className={styles.botMsg}>
              <img src={BOT_IMG} className={styles.avatar} />
              <div className={styles.typingBubble}>
                <div className={styles.dot}></div>
                <div className={styles.dot}></div>
                <div className={styles.dot}></div>
              </div>
            </div>
          )}

          <div ref={bottomRef}></div>
        </div>

        <div className={styles.inputArea}>
          <input
            placeholder="Type a message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <Button onClick={sendMessage}>Send</Button>
        </div>
      </Card>
    </div>
  );
}
