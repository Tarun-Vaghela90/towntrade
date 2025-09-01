import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import api from "../Axios/api";
import { Button } from "@/components/ui/button";
import { setCurrentUser } from "../redux/slices/userSlice"; // Redux slice to update user
import { useSocket } from "../components/hooks/socketContext";


export default function ChatDashboard() {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const userId = currentUser?.user?.id;
  const socket =  useSocket();

  const location = useLocation();
  const { receiverId, productId, receiverName, receiverAvatar } = location.state || {};

  const [chatUsers, setChatUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Join user-specific room
  

  const fetchChats = async () => {
    try {
      const res = await api.get("/chats/myChats");
      setChatUsers(res.data.users);

      if (receiverId) {
        let user = res.data.users.find((u) => String(u._id) === String(receiverId));
        if (!user) {
          let productTitle = "Product info";
          if (productId) {
            try {
              const prodRes = await api.get(`/products/${productId}`);
              productTitle = prodRes.data.title;
            } catch {}
          }
          user = {
            _id: receiverId,
            fullName: receiverName || "New User",
            profileImage: receiverAvatar || "https://i.pravatar.cc/150?img=32",
            productTitle,
          };
        }
        selectChat(user);
      } else if (res.data.users.length > 0 && !selectedChat) {
        selectChat(res.data.users[0]);
      }
    } catch (err) {
      console.error("Error fetching chats:", err);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [receiverId]);

  // Real-time messages
  useEffect(() => {
    if (!socket) return;
    const handleReceiveMessage = (data) => {
      const senderId = data.senderUser?._id || data.senderUser;
      const receiverUserId = data.receiverUser?._id || data.receiverUser;

      // Ignore messages from blocked users
      if (currentUser?.user?.blockedUsers?.includes(senderId)) return;

      if (
        selectedChat &&
        ((senderId === selectedChat._id && receiverUserId === userId) ||
          (senderId === userId && receiverUserId === selectedChat._id))
      ) {
        setMessages((prev) => [...prev, data]);
        
      }

      fetchChats();
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => socket.off("receiveMessage", handleReceiveMessage);
  }, [selectedChat, userId, currentUser]);

  const selectChat = async (user) => {
    setSelectedChat(user);
    try {
      const res = await api.get(`/chats/${user._id}`);
      setMessages(res.data.chats || []);
    } catch (err) {
      console.error("Error fetching chat messages:", err);
    }
  };

  // const sendMessage = () => {
  //   if (!newMessage.trim() || !selectedChat) return;

  //   // Block sending if user is blocked
  //   if (currentUser?.user?.blockedUsers?.includes(selectedChat._id)) return;

  //   const messageData = {
  //     senderUser: userId,
  //     receiverUser: selectedChat._id,
  //     message: newMessage,
  //     product: productId || selectedChat.productTitle,
  //   };

  //   socket.emit("sendMessage", messageData);
  //   setMessages((prev) => [...prev, messageData]);
  //   setNewMessage("");
  // };

  // Block / Unblock user
  const sendMessage = () => {
  if (!newMessage.trim() || !selectedChat) return;

  if (currentUser?.user?.blockedUsers?.includes(selectedChat._id)) return;

  const messageData = {
    senderUser: userId,
    receiverUser: selectedChat._id,
    message: newMessage,
    product: productId || selectedChat.productTitle,
  };

  socket.emit("sendMessage", messageData);
  setNewMessage("");
};



  const toggleBlockUser = async () => {
    if (!selectedChat) return;
    const isBlocked = currentUser?.user?.blockedUsers?.includes(selectedChat._id);

    try {
      if (isBlocked) {
        await api.post(`/chats/unblock/${selectedChat._id}`);
      } else {
        await api.post(`/chats/block/${selectedChat._id}`);
      }

      // Update currentUser in Redux directly
      const updatedBlockedUsers = isBlocked
        ? currentUser.user.blockedUsers.filter((id) => id !== selectedChat._id)
        : [...(currentUser.user.blockedUsers || []), selectedChat._id];

      dispatch(
        setCurrentUser({
          ...currentUser,
          user: {
            ...currentUser.user,
            blockedUsers: updatedBlockedUsers,
          },
        })
      );
    } catch (err) {
      console.error("Error blocking/unblocking user:", err);
    }
  };

  return (
    <div className="flex h-[600px] border rounded-md overflow-hidden">
      {/* LEFT PANEL */}
      <div className="w-1/3 border-r overflow-y-auto">
        <h3 className="font-bold p-2">Chats</h3>
        {chatUsers.length === 0 ? (
          <div className="p-4 text-gray-500 text-sm">No chats available.</div>
        ) : (
          chatUsers.map((user) => (
            <div
              key={user._id}
              className={`flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-100 ${
                selectedChat?._id === user._id ? "bg-gray-200" : ""
              }`}
              onClick={() => selectChat(user)}
            >
              <img
                src={user.profileImage || "https://i.pravatar.cc/150?img=32"}
                alt={user.fullName}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <div className="font-semibold">{user.fullName}</div>
                <div className="text-sm text-gray-500">{user.productTitle || "Unknown Product"}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* RIGHT PANEL */}
      <div className="w-2/3 flex flex-col justify-between">
        {selectedChat ? (
          <>
            <div className="p-2 border-b flex justify-between items-center">
              <div>
                <div className="font-bold">{selectedChat.fullName}</div>
                <div className="text-sm text-gray-500">{selectedChat.productTitle || "Product info"}</div>
              </div>
              <Button onClick={toggleBlockUser} className="text-sm">
                {currentUser?.user?.blockedUsers?.includes(selectedChat._id) ? "Unblock" : "Block"}
              </Button>
            </div>

            <div className="flex-1 p-2 overflow-y-auto flex flex-col gap-2 bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-gray-500 text-sm self-center mt-4">
                  No messages yet.
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const senderId = msg.senderUser?._id || msg.senderUser;
                  return (
                    <div
                      key={idx}
                      className={`px-3 py-2 rounded max-w-xs ${
                        senderId === userId ? "self-end bg-green-500 text-white" : "self-start bg-gray-200"
                      }`}
                    >
                      {msg.message}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input or Unblock */}
            <div className="flex p-2 gap-2 border-t">
              {currentUser?.user?.blockedUsers?.includes(selectedChat._id) ? (
                <Button onClick={toggleBlockUser} className="w-full bg-red-500 hover:bg-red-600 text-white">
                  Unblock & Chat
                </Button>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 border rounded-lg px-3 py-2"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  />
                  <Button onClick={sendMessage}>Send</Button>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">Select a chat to view messages</div>
        )}
      </div>
    </div>
  );
}
