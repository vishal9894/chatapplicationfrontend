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
  const { user, selectedUser, userProfile ,lastmessage } = useSelector(
    (state) => state.user
  );
  const [search, setSearch] = useState("");
  const [isMobileOpen, setIsMobileOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        const data = await fetchUser();
        dispatch(setUser(data));
      } catch (error) {
        console.error(error);
      }
    };

    const getProfile = async () => {
      try {
        const response = await fetchUserProfile();

        dispatch(setUserProfile(response));
      } catch (error) {
        console.log(error);
      }
    };
    getProfile();
    getUser();
  }, [dispatch ]);

  // Check if mobile view
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

  const users = user || [];

  const filteredUsers = users.filter(
    (u) =>
      u._id !== userProfile?._id && // ❌ remove own profile
      u.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleUserSelect = (user) => {
    dispatch(selectUser(user));
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

 

  const handleClearSelectedUser = () => {
    dispatch(clearSelectedUser());
    if (isMobile) {
      setIsMobileOpen(true);
    }
  };

  

  return (
    <>
      {/* Mobile Header Button - Only shows when sidebar is closed on mobile */}
      {isMobile && !isMobileOpen && (
        <div className="md:hidden fixed top-4 left-4 z-30">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
          >
            <Menu size={24} />
          </button>
        </div>
      )}

      {/* Mobile Backdrop - Only shows when sidebar is open on mobile */}
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
            ? "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out"
            : "relative"
        } 
        ${isMobileOpen ? "translate-x-0 w-72" : "-translate-x-full"} 
        w-96 h-screen bg-gray-300 border-r border-gray-200 shadow-lg flex flex-col md:translate-x-0 md:static`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xl font-bold text-indigo-600">
            Chat Application
          </h3>
          {isMobile && (
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>
          )}
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-gray-700 placeholder-gray-500"
            />
          </div>
        </div>
        {/* User List */}
        <div className="flex-1 overflow-y-auto px-2">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((item) => (
              <div
                key={item._id}
                onClick={() => handleUserSelect(item)}
                className={`flex items-center gap-3 px-2 rounded-md py-3 cursor-pointer transition-all duration-200 hover:bg-indigo-50 border-l-4 ${
                  selectedUser?._id === item._id
                    ? "bg-gray-100 "
                    : "border-transparent hover:border-indigo-200"
                }`}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center font-bold uppercase text-lg">
                    {selectedUser?.image ? (
                      <img
                        src={selectedUser.image}
                        alt={selectedUser.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold uppercase">
                        {selectedUser?.name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-gray-800 truncate">
                      {item?.name}
                    </p>
                  </div>
                  <p> </p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-64 px-4">
              <Search className="text-gray-300 mb-3" size={48} />
              <p className="text-gray-400 font-medium">No users found</p>
              <p className="text-sm text-gray-400 text-center mt-1">
                Try searching with a different name
              </p>
            </div>
          )}
        </div>

        {/* Current User Info */}
        <div className="p-4 border-t flex justify-between items-center border-gray-200 ">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full  flex items-center justify-center">
              {selectedUser?.image ? (
                <img
                  src={selectedUser.image}
                  alt={selectedUser.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold uppercase">
                  {selectedUser?.name?.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <p className="font-medium text-gray-800">{userProfile?.name}</p>
              <p className="text-sm text-gray-500">Online</p>
            </div>
          </div>
          <button onClick={() => setOpenProfile(true)} className=" bg-cover">
            <Settings />
          </button>
        </div>
      </div>
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
