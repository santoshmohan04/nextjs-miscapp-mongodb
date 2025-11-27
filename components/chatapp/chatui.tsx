"use client";

import { useState, useRef } from "react";
import styles from "./chatui.module.css";

export default function ChatUI() {
  const BOT_MSGS = [
    "Hi, how are you?",
    "Ohh... I can't understand what you're trying to say!",
    "I like to play games...",
    "Sorry if my answers are not relevant 😅",
    "I feel sleepy 😴",
  ];

  const BOT_IMG =
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Logo_wikibot.svg/400px-Logo_wikibot.svg.png";
  const PERSON_IMG = "https://www.svgrepo.com/show/192244/man-user.svg";

  const BOT_NAME = "BOT";
  const PERSON_NAME = "User";

  const [messages, setMessages] = useState<
    {
      name: string;
      img: string;
      side: "left" | "right";
      text: string;
      time: string;
    }[]
  >([]);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const chatRef = useRef<HTMLDivElement | null>(null);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputRef.current) return;

    const msgText = inputRef.current.value.trim();
    if (!msgText) return;

    appendMessage(PERSON_NAME, PERSON_IMG, "right", msgText);
    inputRef.current.value = "";

    botResponse();
  };

  const appendMessage = (
    name: string,
    img: string,
    side: "left" | "right",
    text: string
  ) => {
    const time = formatTime(new Date());

    setMessages((prev) => [...prev, { name, img, side, text, time }]);

    // scroll to bottom
    setTimeout(() => {
      if (chatRef.current)
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, 100);
  };

  const botResponse = () => {
    const randomIndex = Math.floor(Math.random() * BOT_MSGS.length);
    const msgText = BOT_MSGS[randomIndex];
    const delay = msgText.split(" ").length * 200;

    setTimeout(() => {
      appendMessage(BOT_NAME, BOT_IMG, "left", msgText);
    }, delay);
  };

  const formatTime = (date: Date) => {
    const h = String(date.getHours()).padStart(2, "0");
    const m = String(date.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  };

  return (
    <section className={styles.msger}>
      <header className={styles.msgerHeader}>
        <div className={styles.msgerHeaderTitle}>SimpleChat</div>
        <div className={styles.msgerHeaderOptions}>⚙️</div>
      </header>

      <main className={styles.msgerChat} ref={chatRef}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`${styles.msg} ${
              msg.side === "left" ? styles.leftMsg : styles.rightMsg
            }`}
          >
            <div
              className={styles.msgImg}
              style={{ backgroundImage: `url(${msg.img})` }}
            ></div>

            <div className={styles.msgBubble}>
              <div className={styles.msgInfo}>
                <div className={styles.msgInfoName}>{msg.name}</div>
                <div className={styles.msgInfoTime}>{msg.time}</div>
              </div>
              <div className={styles.msgText}>{msg.text}</div>
            </div>
          </div>
        ))}
      </main>

      <form className={styles.msgerInputArea} onSubmit={handleSend}>
        <input
          type="text"
          ref={inputRef}
          className={styles.msgerInput}
          placeholder="Enter your message..."
        />
        <button type="submit" className={styles.msgerSendBtn}>
          Send
        </button>
      </form>
    </section>
  );
}
