import { X, Image } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import {useChatStore} from "../store/useChatStore";
import { useState } from "react";
import MediaGallery from "./MediaGallery";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showMediaGallery, setShowMediaGallery] = useState(false);

  return (
    <>
      <div className="p-2.5 border-b border-base-300">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer hover:bg-base-200 p-2 rounded-lg transition-colors"
            onClick={() => setShowMediaGallery(true)}
          >
            {/* Avatar */}
            <div className="avatar">
              <div className="size-10 rounded-full relative">
                <img src={selectedUser.profilePic || "/default.jpg"} alt={selectedUser.fullName} />
              </div>
            </div>

            {/* User info */}
            <div>
              <h3 className="font-medium">{selectedUser.fullName}</h3>
              <p className="text-sm text-base-content/70">
                {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
              </p>
            </div>
          </div>

          {/* Close button */}
          <button onClick={() => setSelectedUser(null)}>
            <X />
          </button>
        </div>
      </div>

      <MediaGallery 
        isOpen={showMediaGallery}
        onClose={() => setShowMediaGallery(false)}
        selectedUser={selectedUser}
      />
    </>
  );
};
export default ChatHeader;
