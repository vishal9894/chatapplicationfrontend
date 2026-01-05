import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { Send, Phone, Video } from "lucide-react";
import { io } from "socket.io-client";
import axios from "axios";
import { fetchMessages } from "../api/userApi";
import { setLastmessage } from "../redux/features/userSlice";

const SOCKET_URL = import.meta.env.VITE_BACKEND_API;

// ✅ Socket OUTSIDE component
const socket = io(SOCKET_URL, { autoConnect: false });

const Home = () => {
  const { selectedUser, userProfile } = useSelector((state) => state.user);
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const dispatch = useDispatch();

  const token = localStorage.getItem("token");

  // ---------------- GET USER ID ----------------
  const getUserId = () => {
    if (userProfile?._id) return userProfile._id;
    if (currentUser?._id) return currentUser._id;
    return null;
  };
  const userId = getUserId();

  // ---------------- FETCH STORED MESSAGES ----------------
  useEffect(() => {
    const getMessages = async () => {
      if (!selectedUser) return;

      const token = localStorage.getItem("token");
      const msgs = await fetchMessages({
        selectedUserId: selectedUser._id,
        currentUserId: userId,
        token,
      });

      setMessages(msgs);
      dispatch(setLastmessage(msgs[msgs.length - 2]))
       
      

      
    };

    getMessages();
  }, [selectedUser, userId , dispatch]);



  // ---------------- SOCKET CONNECT ----------------
  useEffect(() => {
    if (!userId) return;
    socket.connect();
    socket.emit("join", userId);

    socket.on("receiveMessage", (data) => {
      // Only add if message is relevant to current chat
      if (data.senderId === selectedUser?._id || data.receiverId === userId) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: data.message,
            sender: data.senderId === userId ? "me" : "them",
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      }
    });

    return () => {
      socket.off("receiveMessage");
      socket.disconnect();
    };
  }, [userId, selectedUser?._id]);

  // ---------------- CLEAR & FETCH CHAT ON USER CHANGE ----------------
  useEffect(() => {
    setMessages([]);
    fetchMessages();
  }, [selectedUser]);

  // ---------------- AUTO SCROLL ----------------
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ---------------- SEND MESSAGE ----------------
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !userId || !selectedUser?._id) return;

    const newMessage = {
      id: Date.now(),
      text: message,
      sender: "me",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // Show immediately in UI
    setMessages((prev) => [...prev, newMessage]);

    // Emit via Socket
    socket.emit("sendMessage", {
      senderId: userId,
      receiverId: selectedUser._id,
      message,
    });

    // Store message in backend
    try {
      await axios.post(
        `${SOCKET_URL}/api/messages`,
        {
          senderId: userId,
          receiverId: selectedUser._id,
          message,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error("Failed to store message in DB:", error);
    }

    setMessage("");
  };

  // ---------------- EMPTY STATE ----------------
  if (!selectedUser) {
    return (
      <div className="flex flex-col w-full items-center justify-center h-screen bg-gray-200 text-gray-600 gap-4">
        <IoChatboxEllipsesOutline className="text-8xl animate-bounce" />
        <h1 className="text-4xl font-bold">Chat for Windows</h1>
        <p>Select a user to start chatting</p>
      </div>
    );
  }

  // ---------------- UI ----------------
  return (
    <div className="flex flex-col w-full h-screen bg-gray-100">
      {/* HEADER */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            {selectedUser?.image ? (
              <img
                src={selectedUser.image}
                alt={selectedUser.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white font-bold uppercase">
                {selectedUser?.name?.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h2 className="font-semibold">{selectedUser.name}</h2>
            <p className="text-xs text-green-500">Online</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Phone className="cursor-pointer" size={18} />
          <Video className="cursor-pointer" size={18} />
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-5xl mx-auto space-y-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "me" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 flex items-center gap-1 rounded-lg max-w-xs ${
                  msg.sender === "me"
                    ? "bg-gray-500 text-white rounded-br-none"
                    : "bg-white border rounded-bl-none"
                }`}
              >
                <p>{msg.text}</p>
                <p className="text-xs text-right opacity-70">{msg.time}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* INPUT */}
      <form
        onSubmit={handleSendMessage}
        className="bg-white border-t p-3 flex items-center lg:pl-12 gap-2"
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none"
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white p-2 rounded-full"
        >
          <Send />
        </button>
      </form>
    </div>
  );
};

export default Home;
