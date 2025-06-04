import { useEffect, useState } from "react";
import {useChatStore} from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Search, X } from "lucide-react";

const Sidebar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    isUsersLoading,
    getAcceptedUsers,
    acceptedUsers,
  } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    getUsers();
    getAcceptedUsers();
  }, [getUsers, getAcceptedUsers]);

  // Filter out the logged-in user from both lists
  let filteredUsers = (acceptedUsers || []).filter(user => user._id !== authUser?._id);

  if (showOnlineOnly) {
    filteredUsers = filteredUsers.filter((user) => onlineUsers.includes(user._id));
  }

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredUsers = (users || [])
      .filter(user => user._id !== authUser?._id)
      .filter((user) =>
        user?.fullName?.toLowerCase().includes(query)
      );
  }

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="size-6" />
            <span className="font-medium hidden lg:block">Contacts</span>
          </div>
          <button 
            onClick={() => setShowSearch(!showSearch)}
            className="btn btn-ghost btn-sm p-2"
          >
            {showSearch ? <X className="size-5" /> : <Search className="size-5" />}
          </button>
        </div>

        <div className="mt-3 hidden lg:flex flex-col gap-2">
          {/* Search Bar */}
          {showSearch && (
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-sm input-bordered w-full"
              />
            </div>
          )}

          <div className="flex flex-col gap-2 mt-2">
            <label className="cursor-pointer flex items-center gap-2">
              <input
                type="checkbox"
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                className="checkbox checkbox-sm"
              />
              <span className="text-sm">Show online only</span>
            </label>
          </div>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((user) => {
          const isAcceptedUser = acceptedUsers?.some(acceptedUser => acceptedUser._id === user._id);
          return (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`
                w-full p-3 flex items-center gap-3
                hover:bg-base-300 transition-colors
                ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
              `}
            >
              <div className="relative mx-auto lg:mx-0">
                <img
                  src={user.profilePic || "/default.jpg"}
                  alt={user.fullName || "User"}
                  className="size-12 object-cover rounded-full"
                />
                {isAcceptedUser && onlineUsers.includes(user._id) && (
                  <span
                    className="absolute bottom-0 right-0 size-3 bg-green-500 
                    rounded-full ring-2 ring-zinc-900"
                  />
                )}
              </div>

              <div className="hidden lg:block text-left min-w-0">
                <div className="font-medium truncate">{user.fullName || "Unknown User"}</div>
                <div className="text-sm text-zinc-400">
                  {isAcceptedUser && onlineUsers.includes(user._id) ? "Online" : "Offline"}
                </div>
              </div>
            </button>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">
            {searchQuery ? "No users found" : "No contacts available"}
          </div>
        )}
      </div>
    </aside>
  );
};
export default Sidebar;