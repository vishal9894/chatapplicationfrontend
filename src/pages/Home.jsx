import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { Send, Phone, Video } from "lucide-react";
import { io } from "socket.io-client";
import { fetchMessages } from "../api/userApi";
import { setLastMessage, selectUser } from "../redux/features/userSlice";

const SOCKET_URL = import.meta.env.VITE_BACKEND_API;
const socket = io(SOCKET_URL, { autoConnect: false });

const Home = () => {
  const dispatch = useDispatch();
  const { selectedUser: reduxSelectedUser, userProfile } = useSelector(
    (state) => state.user
  );

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);

  const userId = userProfile?._id || currentUser?._id;
  const token = localStorage.getItem("token");

  // Load selected user
  useEffect(() => {
    const savedUser = localStorage.getItem("selectedUser");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (!selectedUser || selectedUser._id !== user._id) {
        setSelectedUser(user);
        dispatch(selectUser(user));
      }
    } else if (reduxSelectedUser) {
      if (!selectedUser || selectedUser._id !== reduxSelectedUser._id) {
        setSelectedUser(reduxSelectedUser);
        localStorage.setItem("selectedUser", JSON.stringify(reduxSelectedUser));
      }
    }
  }, [reduxSelectedUser, selectedUser, dispatch]);

  // Fetch messages from DB
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedUser?._id || !userId) return;

      const msgs = await fetchMessages({
        selectedUserId: selectedUser._id,
        currentUserId: userId,
        token,
      });

      setMessages(msgs || []);
      if (msgs?.length) dispatch(setLastMessage(msgs[msgs.length - 1]));
    };
    loadMessages();
  }, [selectedUser, userId, token, dispatch]);

  // Socket connection
  useEffect(() => {
    if (!userId) return;

    socket.connect();
    socket.emit("join", userId);

    // Online users list
    socket.on("onlineUsers", (users) => setOnlineUsers(users));

    // Receive messages
    socket.on("receiveMessage", (data) => {
      if (!messages.find((msg) => msg.id === data._id)) {
        if (data.senderId === selectedUser._id || data.receiverId === userId) {
          setMessages((prev) => [
            ...prev,
            {
              id: data._id,
              text: data.message,
              sender: data.senderId === userId ? "me" : "them",
              time: new Date(data.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ]);
        }
      }
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("onlineUsers");
      socket.disconnect();
    };
  }, [userId, selectedUser?._id, messages]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !userId || !selectedUser?._id) return;

    const tempMessage = {
      id: Date.now(),
      text: message,
      sender: "me",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, tempMessage]);

    socket.emit("sendMessage", {
      senderId: userId,
      receiverId: selectedUser._id,
      message,
    });

    setMessage("");
  };

  if (!selectedUser) {
    return (
      <div className="flex flex-col w-full items-center justify-center h-screen bg-gray-200 text-gray-600 gap-4">
        <IoChatboxEllipsesOutline className="text-8xl animate-bounce" />
        <h1 className="text-4xl font-bold">Chat for Windows</h1>
        <p>Select a user to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-screen bg-gray-100">
      {/* HEADER */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            {selectedUser?.image ? (
              <img src={selectedUser.image} alt={selectedUser.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white font-bold uppercase">
                {selectedUser?.name?.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h2 className="font-semibold">{selectedUser.name}</h2>
            <p className="text-xs" style={{ color: onlineUsers.includes(selectedUser._id) ? "green" : "red" }}>
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
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
            <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
              <div className={`px-4 py-2 flex items-center gap-1 rounded-lg max-w-xs ${msg.sender === "me" ? "bg-gray-500 text-white rounded-br-none" : "bg-white border rounded-bl-none"}`}>
                <p>{msg.text}</p>
                <p className="text-xs text-right opacity-70">{msg.time}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* INPUT */}
      <form onSubmit={handleSendMessage} className="bg-white border-t p-3 flex items-center lg:pl-12 gap-2">
        <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message..." className="flex-1 border rounded-full px-4 py-2 focus:outline-none" />
        <button type="submit" className="bg-indigo-600 text-white p-2 rounded-full">
          <Send />
        </button>
      </form>
    </div>
  );
};

export default Home;
