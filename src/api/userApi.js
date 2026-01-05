import axios from "axios";

const BaseUrl = import.meta.env.VITE_BACKEND_API;

// ✅ Fetch all users
export const fetchUser = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.get(`${BaseUrl}/api/user/allusers`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

   
    return response.data; // ✅ return only data
  } catch (error) {
    console.error(error.response?.data?.message || error.message);
    throw error;
  }
};

// ✅ Fetch logged-in user profile
export const fetchUserProfile = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.get(`${BaseUrl}/api/user/users`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data; // ✅ return data
  } catch (error) {
    console.error(error.response?.data?.message || error.message);
    throw error;
  }
};

export const updateUserProfile = async (id, formData) => {
  const token = localStorage.getItem("token");

  const response = await axios.put(
    `${BaseUrl}/api/user/update/${id}`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );
  fetchUserProfile();

  return response.data;
};

export const fetchMessages = async ({ selectedUserId, currentUserId, token }) => {
  try {
    if (!selectedUserId || !currentUserId) {
      throw new Error("Missing user IDs");
    }

    const response = await axios.get(
      `${BaseUrl}/api/messages/${selectedUserId}?currentUserId=${currentUserId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Format messages for frontend
    const formattedMessages = response.data.map((msg) => ({
      id: msg._id,
      text: msg.message,
      sender: msg.senderId === currentUserId ? "me" : "them",
      time: new Date(msg.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));

    return formattedMessages;
  } catch (error) {
    console.error("Failed to fetch messages:", error.response?.data || error.message);
    return []; // return empty array on error
  }
};
