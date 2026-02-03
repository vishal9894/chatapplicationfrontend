import React, { useEffect, useState } from "react";
import { fetchUser, fetchUserProfile } from "../api/userApi";
import { useDispatch, useSelector } from "react-redux";
import {
  setUser,
  selectUser,
  clearSelectedUser,
  setUserProfile,
} from "../redux/features/userSlice";
import { Search, X, Menu, Settings } from "lucide-react";
import ProfileModal from "./ProfileModal";

const Sidebar = () => {
  const dispatch = useDispatch();
  const { user, selectedUser, userProfile } = useSelector(
    (state) => state.user
  );

  const [search, setSearch] = useState("");
  const [isMobileOpen, setIsMobileOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);

  // ---------------- LOAD USERS + PROFILE (AFTER LOGIN / REFRESH) ----------------
  useEffect(() => {
    const loadData = async () => {
      try {
        const users = await fetchUser();
        dispatch(setUser(users));

        const profile = await fetchUserProfile();
        dispatch(setUserProfile(profile));
      } catch (error) {
        console.error("Sidebar load error:", error);
      }
    };

    loadData();
  }, [dispatch]);

  // ---------------- MOBILE VIEW CHECK ----------------
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileOpen(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ---------------- FILTER USERS ----------------
  const filteredUsers = (user || []).filter(
    (u) =>
      u._id !== userProfile?._id &&
      u.name?.toLowerCase().includes(search.toLowerCase())
  );

  // ---------------- SELECT USER ----------------
  const handleUserSelect = (u) => {
    dispatch(selectUser(u));
    localStorage.setItem("selectedUser", JSON.stringify(u));

    if (isMobile) setIsMobileOpen(false);
  };

  const handleClearSelectedUser = () => {
    dispatch(clearSelectedUser());
    localStorage.removeItem("selectedUser");
    if (isMobile) setIsMobileOpen(true);
  };

  return (
    <>
      {/* Mobile Open Button */}
      {isMobile && !isMobileOpen && (
        <div className="md:hidden fixed top-40 left-4 z-30">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 bg-indigo-600 text-white rounded-full shadow-lg"
          >
            <Menu size={24} />
          </button>
        </div>
      )}

      {/* Backdrop */}
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          isMobile
            ? "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300"
            : "relative"
        } 
        ${isMobileOpen ? "translate-x-0 w-72" : "-translate-x-full"} 
        h-screen bg-gray-300 border-r shadow-lg flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold text-indigo-600">
            Chat Application
          </h3>
          {isMobile && (
            <button onClick={() => setIsMobileOpen(false)}>
              <X size={20} />
            </button>
          )}
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-10 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto px-2">
          {filteredUsers.length ? (
            filteredUsers.map((item) => (
              <div
                key={item._id}
                onClick={() => handleUserSelect(item)}
                className={`flex items-center gap-3 px-2 py-3 cursor-pointer rounded-md hover:bg-indigo-50 ${
                  selectedUser?._id === item._id && "bg-gray-100"
                }`}
              >
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white font-bold uppercase">
                      {item.name?.charAt(0)}
                    </div>
                  )}
                </div>

                <p className="font-semibold text-gray-800 truncate">
                  {item.name}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 mt-10">
              No users found
            </p>
          )}
        </div>

        {/* Logged-in User Profile */}
        <div className="p-4 border-t flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              {userProfile?.image ? (
                <img
                  src={userProfile.image}
                  alt={userProfile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white font-bold uppercase">
                  {userProfile?.name?.charAt(0)}
                </div>
              )}
            </div>

            <div>
              <p className="font-medium text-gray-800">
                {userProfile?.name}
              </p>
              <p className="text-sm text-gray-500">Online</p>
            </div>
          </div>

          <button onClick={() => setOpenProfile(true)}>
            <Settings />
          </button>
        </div>
      </div>

      {/* Profile Modal */}
      {openProfile && (
        <ProfileModal
          onClose={() => setOpenProfile(false)}
          user={userProfile}
        />
      )}
    </>
  );
};

export default Sidebar;
