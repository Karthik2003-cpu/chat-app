import { useState, useEffect } from "react";
import {useChatStore} from "../store/useChatStore";
import { X, Image as ImageIcon, Video, Music, FileText } from "lucide-react";

const MediaGallery = ({ isOpen, onClose, selectedUser }) => {
  const { messages } = useChatStore();
  const [mediaItems, setMediaItems] = useState([]);

  useEffect(() => {
    if (messages && selectedUser) {
      const media = messages.filter(msg => msg.fileUrl).map(msg => ({
        ...msg,
        type: msg.fileType,
        url: msg.fileUrl,
        name: msg.fileName,
        date: new Date(msg.createdAt).toLocaleDateString()
      }));
      setMediaItems(media);
    }
  }, [messages, selectedUser]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Media Gallery</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {mediaItems.length === 0 ? (
            <div className="text-center text-base-content/70 py-8">
              No media shared yet
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {mediaItems.map((item, index) => (
                <div key={index} className="relative group">
                  {item.type === "image" && (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="block">
                      <div className="aspect-square rounded-lg overflow-hidden bg-base-200">
                        <img
                          src={item.url}
                          alt="Shared image"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.date}
                      </div>
                    </a>
                  )}
                  {item.type === "video" && (
                    <div className="aspect-square rounded-lg overflow-hidden bg-base-200 relative">
                      <video
                        src={item.url}
                        className="w-full h-full object-cover"
                        controls
                      />
                      <div className="absolute top-2 left-2 bg-black/50 rounded-full p-1">
                        <Video className="w-4 h-4 text-white" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.date}
                      </div>
                    </div>
                  )}
                  {item.type === "audio" && (
                    <div className="aspect-square rounded-lg overflow-hidden bg-base-200 p-4 flex flex-col items-center justify-center">
                      <Music className="w-8 h-8 text-primary mb-2" />
                      <audio src={item.url} controls className="w-full" />
                      <div className="text-xs mt-2 text-center truncate w-full">
                        {item.name || "Audio file"}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.date}
                      </div>
                    </div>
                  )}
                  {item.type === "file" && (
                    <a
                      href={item.url}
                      download={item.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block aspect-square rounded-lg overflow-hidden bg-base-200 p-4 flex flex-col items-center justify-center"
                    >
                      <FileText className="w-8 h-8 text-primary mb-2" />
                      <div className="text-xs text-center truncate w-full">
                        {item.name || "File"}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.date}
                      </div>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaGallery; 