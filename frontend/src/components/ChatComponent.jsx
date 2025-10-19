"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import API from "@/lib/api"; // axios instance pointing to your backend
import Markdown from "react-markdown";

export default function ChatComponent() {
  const { user } = useAuth();
  const [reportName, setReportName] = useState("");
  const [nameSet, setNameSet] = useState(false);
  const [file, setFile] = useState(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef();

  // Load past chats for this user & report
  useEffect(() => {
    if (!user || !nameSet) return;

    const loadChats = async () => {
      try {
        const res = await API.get(
          `/chat/history/${user.id}?report=${reportName}`
        );
        // Map DB chats to frontend messages
        const mappedMessages = res.data.flatMap((c) => [
          { role: "user", content: c.message },
          { role: "ai", content: c.response },
        ]);
        setMessages(mappedMessages);
      } catch (err) {
        console.error("Error loading chat history:", err);
      }
    };

    loadChats();
  }, [user, nameSet, reportName]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if ((!input && !file) || !user) return;

    setLoading(true);

    const userMessage = {
      role: "user",
      content: input || `Uploaded file: ${file?.name}`,
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      // Always use FormData to unify backend expectations
      const formData = new FormData();
      formData.append("userId", user.id);
      formData.append("reportName", reportName);
      if (input) formData.append("prompt", input);
      if (file) formData.append("file", file);

      // Send to Gemini AI
      const { data } = await API.post("/gemini-analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const aiMessage = { role: "ai", content: data.response };
      setMessages((prev) => [...prev, aiMessage]);

      // Save chat to DB
      await API.post("/chat/save", {
        userId: user.id,
        reportName,
        message: input || `Uploaded file: ${file?.name}`,
        response: data.response,
      });

      setFile(null);
      setInput("");
    } catch (err) {
      console.error("AI request failed:", err.response || err);
      alert("Failed to get AI response. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  // UI before chat name is set
  if (!nameSet) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <input
          className="p-2 border rounded mb-4"
          placeholder="Enter report/chat name"
          value={reportName}
          onChange={(e) => setReportName(e.target.value)}
        />
        <button
          type="button"
          className="px-4 py-2 bg-primary text-white rounded"
          onClick={() => reportName.trim() && setNameSet(true)}
        >
          Start Chat
        </button>
      </div>
    );
  }

  // Chat UI
  return (
    <div className="flex flex-col h-[80vh] max-w-2xl mx-auto p-4 border rounded-lg bg-white shadow">
      <div className="flex-1 overflow-y-auto mb-4 space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded max-w-[80%] ${
              msg.role === "user"
                ? "bg-primary/20 self-end"
                : "bg-gray-200 self-start"
            }`}
          >
            <Markdown>{msg.content}</Markdown>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="flex flex-col gap-2">
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={(e) => setFile(e.target.files[0])}
          className="border p-2 rounded"
        />
        <input
          className="flex-1 p-2 border rounded"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={loading}
          className="px-4 py-2 bg-primary text-white rounded"
        >
          {loading ? "Analyzing..." : "Analyze & Send"}
        </button>
      </div>
    </div>
  );
}
