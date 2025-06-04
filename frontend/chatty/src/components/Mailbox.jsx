import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { Bell } from "lucide-react";

const Mailbox = () => {
  const { socket, authUser } = useAuthStore();
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!authUser) return;

    const fetchRequests = async () => {
      try {
        const res = await axiosInstance.get("/chat-requests");
        setIncomingRequests(res.data);
      } catch (error) {
        console.error("Error fetching chat requests:", error.message);
      }
    };

    fetchRequests();

    if (socket) {
      const handleNewRequest = (request) => {
        setIncomingRequests((prev) => {
          // Check if request already exists
          if (prev.some(req => req._id === request._id)) {
            return prev;
          }
          return [...prev, request];
        });
        toast.success("New chat request received!");
      };

      const handleRequestAccepted = (request) => {
        setIncomingRequests((prev) =>
          prev.filter((req) => req._id !== request.requestId)
        );
        toast.success("Chat request accepted!");
      };

      const handleRequestRejected = (request) => {
        setIncomingRequests((prev) =>
          prev.filter((req) => req._id !== request.requestId)
        );
        toast.error("Chat request was rejected");
      };

      socket.on("newChatRequest", handleNewRequest);
      socket.on("chatRequestAccepted", handleRequestAccepted);
      socket.on("chatRequestRejected", handleRequestRejected);

      return () => {
        socket.off("newChatRequest", handleNewRequest);
        socket.off("chatRequestAccepted", handleRequestAccepted);
        socket.off("chatRequestRejected", handleRequestRejected);
      };
    }
  }, [socket, authUser]);

  const handleAccept = async (requestId) => {
    try {
      await axiosInstance.put(`/chat-requests/${requestId}/accept`);
      setIncomingRequests((prev) =>
        prev.filter((request) => request._id !== requestId)
      );
      toast.success("Chat request accepted!");
    } catch (error) {
      console.error("Error accepting chat request:", error.message);
      toast.error("Failed to accept chat request.");
    }
  };

  const handleReject = async (requestId) => {
    try {
      await axiosInstance.put(`/chat-requests/${requestId}/reject`);
      setIncomingRequests((prev) =>
        prev.filter((request) => request._id !== requestId)
      );
      toast.success("Chat request rejected");
    } catch (error) {
      console.error("Error rejecting chat request:", error.message);
      toast.error("Failed to reject chat request.");
    }
  };

  if (!authUser) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-ghost btn-sm relative"
      >
        <Bell className="size-5" />
        {incomingRequests.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-primary-content text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {incomingRequests.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-base-100 rounded-lg shadow-lg border border-base-300 p-4 z-50">
          <h3 className="font-medium mb-3">Chat Requests</h3>
          {incomingRequests.length === 0 ? (
            <p className="text-sm text-base-content/70">No pending requests</p>
          ) : (
            <div className="space-y-3">
              {incomingRequests.map((request) => (
                <div
                  key={request._id}
                  className="flex items-center justify-between p-2 rounded-lg bg-base-200"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={request.senderId.profilePic || "/default.jpg"}
                      alt={request.senderId.fullName}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-sm">
                        {request.senderId.fullName}
                      </p>
                      <p className="text-xs text-base-content/70">
                        Sent {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(request._id)}
                      className="btn btn-primary btn-xs"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleReject(request._id)}
                      className="btn btn-ghost btn-xs"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Mailbox;