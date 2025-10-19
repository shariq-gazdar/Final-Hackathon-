"use client";
import { useState, useEffect } from "react";
import API from "@/lib/api"; // axios instance
import { useAuth } from "@/context/AuthContext";

export default function ChatCards() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [fullChat, setFullChat] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all chat reports (for cards)
  useEffect(() => {
    if (!user) return;

    const fetchReports = async () => {
      try {
        // Get all chats for this user
        const { data } = await API.get(`/chat/list/${user.id}`);

        // Map to include latest message preview for card
        const mappedReports = data.map((chat) => ({
          _id: chat._id,
          reportName: chat.reportName,
          latestMessage: chat.message,
          latestResponse: chat.response,
          createdAt: chat.createdAt,
        }));

        setReports(mappedReports);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
      }
    };

    fetchReports();
  }, [user]);

  // Fetch full chat when a card is clicked
  const handleCardClick = async (reportName) => {
    setSelectedReport(reportName);
    setLoading(true);

    try {
      const { data } = await API.get(
        `/chat/history/${user.id}?report=${reportName}`
      );
      setFullChat(data);
    } catch (err) {
      console.error("Failed to fetch full chat:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p>Please log in to see your chats.</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* Report Cards */}
      {!selectedReport && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((report) => (
            <div
              key={report._id}
              onClick={() => handleCardClick(report.reportName)}
              className="p-4 border rounded-lg shadow cursor-pointer hover:bg-gray-50"
            >
              <h3 className="font-bold">{report.reportName}</h3>
              <p className="text-gray-600">
                {report.latestResponse || report.latestMessage || "No preview"}
              </p>
              <small className="text-gray-400">
                {new Date(report.createdAt).toLocaleString()}
              </small>
            </div>
          ))}
        </div>
      )}

      {/* Full Chat View */}
      {selectedReport && (
        <div>
          <button
            onClick={() => setSelectedReport(null)}
            className="px-4 py-2 mb-4 bg-gray-200 rounded"
          >
            ← Back
          </button>
          <h2 className="text-xl font-bold mb-2">{selectedReport}</h2>

          {loading && <p>Loading chat...</p>}

          <div className="flex flex-col gap-2">
            {fullChat.map((chat) => (
              <div key={chat._id}>
                {/* User message */}
                <div className="p-2 rounded max-w-[80%] bg-primary/20 self-end">
                  {chat.message}
                </div>
                {/* AI response */}
                {chat.response && (
                  <div className="p-2 rounded max-w-[80%] bg-gray-200 self-start mt-1">
                    {chat.response}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
