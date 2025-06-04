import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, Settings, User, ArrowLeft } from "lucide-react";
import Mailbox from "./Mailbox";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Show back button only if logged in and on /settings or /profile
  const showBackButton =
    authUser &&
    (location.pathname.startsWith("/settings") ||
      location.pathname.startsWith("/profile"));

  return (
    <header
      className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
    backdrop-blur-lg bg-base-100/80"
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-4">
            {/* Back Button */}
            {showBackButton && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => navigate(-1)}
                title="Go Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold">Chatty</h1>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Mailbox />
            <Link
              to={"/settings"}
              className={`btn btn-sm gap-2 transition-colors`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            {authUser && (
              <>
                <Link to={"/profile"} className={`btn btn-sm gap-2`}>
                  <User className="size-5" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>

                <button className="flex gap-2 items-center" onClick={logout}>
                  <LogOut className="size-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;