import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Bell } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  User,
  Bookmark,
  PackageCheck,
  ShoppingCart,
  LogOut,
  MessageSquare,
} from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import Profile from "../../user/Profile";
import ProductModal from "../../products/ProductModal";
import { useDispatch, useSelector } from "react-redux";
import { setSearchTerm } from "../../redux/slices/searchSlice";
import { debounce } from "lodash";

import { clearCurrentUser, setCurrentUser } from "../../redux/slices/userSlice";
import { X } from "lucide-react";
import { AlertConfirm } from "../../common/AlertConfirm";
import api from "../../Axios/api";
import io from "socket.io-client";
import { useSocket } from "../../components/hooks/socketContext";

export default function Topbar() {
  const [socketNotifications, setSocketNotifications] = useState([]);

  const [notifications, setNotifications] = useState([]);
  const socket =  useSocket();
  // Check if user is logged in
  const [search, setSearch] = useState("");
  const { currentUser } = useSelector((state) => state.user);
  const token =
    currentUser?.token || localStorage.getItem("Token") || undefined;
  const isLoggedIn = Boolean(token);
  const BASE_URL = "http://localhost:5000/";

  const dispatch = useDispatch();
  const navigate = useNavigate();




useEffect(() => {
  if (!socket) return;

  const handleNotification = (data) => {
    // Add to temporary notifications
    setSocketNotifications(prev => [data, ...prev]);
  };

  socket.on("notification", handleNotification);

  return () => socket.off("notification", handleNotification);
}, [socket]);

const allNotifications = [...socketNotifications, ...notifications];






  const accountStatus = currentUser?.user?.accountStatus || "active";
  const logout = () => {
    dispatch(clearCurrentUser());
    localStorage.removeItem("Token");
    navigate("/");
  };


  const debouncedUpdateSearch = useMemo(
    () =>
      debounce((value) => {
        dispatch(setSearchTerm(value)); // send the value to your Redux store
      }, 500), // 500ms debounce delay
    [dispatch]
  );

  const handleChange = (e) => {
    setSearch(e.target.value);
    debouncedUpdateSearch(e.target.value);
  };
  // For notifications
// useEffect(() => {
//   if (!token) return;

//   const fetchNotifications = async () => {
//     try {
//       const res = await api.get("/notification");
//       setNotifications(res.data || []);
//     } catch (err) {
//       if (err.response?.status === 401) {
//         console.warn("⛔ Unauthorized, logging out user...");
//         dispatch(clearCurrentUser());
//         localStorage.removeItem("Token");
//         navigate("/login"); // redirect to login
//       } else {
//         console.error("Failed to fetch notifications:", err.message);
//       }
//     }
//   };

//   fetchNotifications();
// }, [token, dispatch, navigate]);


useEffect(() => {
  if (!token) return;

  const fetchNotifications = async () => {
    console.log("notification api called")
    try {
      const res = await api.get("/notification");
      setNotifications(res.data || []);
      console.log("notification data :",  res.data)
      // Clear temporary socket notifications
      setSocketNotifications([]);
        } catch (err) {
      if (err.response?.status === 401) {
        console.warn("⛔ Unauthorized, logging out user...");
        dispatch(clearCurrentUser());
        localStorage.removeItem("Token");
        navigate("/login"); // redirect to login
      } else {
        console.error("Failed to fetch notifications:", err.message);
      }
    }
  };

  fetchNotifications();
}, [token]);

  useEffect(() => {
    return () => {
      debouncedUpdateSearch.cancel();
    };
  }, [debouncedUpdateSearch]);

  const upgradePremium = async () => {
    try {
      const res = await api.put("/users/premium");

      // Update redux with updated user
      dispatch(
        setCurrentUser({
          ...currentUser, // keep everything
          user: {
            ...currentUser.user, // keep nested user fields
            role: "premium", // only update role
          },
        })
      );
    } catch (err) {
      console.error("Upgrade failed:", err.message);
    }
  };

  return (
    <div className="w-full border-b shadow-sm bg-white">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <div className="text-xl font-bold text-green-600">TownTrade</div>

       

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          {isLoggedIn ? (
            <>
              

          {/* Notification */}
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline" size="icon" className="relative">
      <Bell className="h-5 w-5" />
      {/* Badge for unread notifications */}
      {allNotifications.filter((n) => !n.isRead).length > 0 && (
        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
          {allNotifications.filter((n) => !n.isRead).length}
        </span>
      )}
    </Button>
  </PopoverTrigger>

  <PopoverContent className="w-80 p-4">
    <div className="flex justify-between items-center mb-2">
      <h3 className="font-bold">Notifications</h3>
      {allNotifications.some((n) => !n.isRead) && (
        <button
          className="text-sm text-blue-500 hover:underline"
          onClick={async () => {
            try {
              await api.put("/notification/markallread"); // your API endpoint
              // Update local state: mark API notifications as read
              setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
              // Clear temporary socket notifications (considered read after API fetch)
              setSocketNotifications([]);
            } catch (err) {
              console.error("Failed to mark all as read:", err.message);
            }
          }}
        >
          Mark all as read
        </button>
      )}
    </div>

    {allNotifications.length === 0 ? (
      <p className="text-sm text-gray-500">No notifications</p>
    ) : (
      <ul className="space-y-2 max-h-96 overflow-y-auto">
        {allNotifications.map((noti, index) => (
          <li
            key={noti._id || index} // use index if _id doesn't exist (socket data)
            className={`p-2 border rounded cursor-pointer hover:bg-gray-100 ${
              !noti.isRead ? "bg-gray-100" : ""
            }`}
            onClick={() => {
              // Optionally: mark this notification as read locally
              if (!noti.isRead && noti._id) {
                setNotifications((prev) =>
                  prev.map((n) =>
                    n._id === noti._id ? { ...n, isRead: true } : n
                  )
                );
              }
              navigate(noti.link || "#");
            }}
          >
            <p className="font-semibold">{noti.title}</p>
            <p className="text-sm text-gray-600">{noti.body}</p>
            {noti.timestamp && (
              <p className="text-xs text-gray-400 mt-1">
                {new Date(noti.timestamp).toLocaleString()}
              </p>
            )}
          </li>
        ))}
      </ul>
    )}
  </PopoverContent>
</Popover>




             

              {/* Account Dropdown */}
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={
                              BASE_URL + currentUser?.user?.profileImage ||
                              "https://i.pravatar.cc/40"
                            }
                            alt={currentUser?.user?.fullName || "User"}
                          />
                          <AvatarFallback>
                            {currentUser?.user?.fullName
                              ? currentUser.user.fullName
                                  .charAt(0)
                                  .toUpperCase()
                              : "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span>
                          {currentUser?.user?.fullName || "Demo User"}
                        </span>
                      </div>
                    </NavigationMenuTrigger>

                    {/* Increased width and centered content */}
                    <NavigationMenuContent className="p-4 min-w-[178px]  ">
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2">
                          {/* <User className="w-5 h-5" />  */}
                          <Profile buttonDesign="w-38" />
                        </li>
                        

                        
                        <li className="flex items-center gap-2">
                          <MessageSquare className="w-5 h-5" />
                          <Link to="/chatdashboard">Chats</Link>
                        </li>
                        {currentUser?.user?.role === "admin" && (
                          <li className="flex items-center gap-2">
                            <Link to="/products">Website</Link>
                          </li>
                        )}
                        <li className="flex items-center gap-2">
                          <LogOut className="w-5 h-5" />
                          <NavigationMenuLink
                            href="/logout"
                            onClick={(e) => {
                              e.preventDefault();
                              logout();
                            }}
                          >
                            Logout
                          </NavigationMenuLink>
                        </li>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="outline" asChild>
                <Link to="/">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col gap-6 mt-6">
                {/* Search */}
               

                {isLoggedIn ? (
                  <>
                    <div className="flex flex-col gap-4 mt-4 border-t pt-4">
                      

                     

                      {/* Account Links */}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={
                                BASE_URL + currentUser?.user?.profileImage ||
                                "https://i.pravatar.cc/40"
                              }
                              alt={currentUser?.user?.fullName || "User"}
                            />
                            <AvatarFallback>
                              {currentUser?.user?.fullName
                                ? currentUser.user.fullName
                                    .charAt(0)
                                    .toUpperCase()
                                : "U"}
                            </AvatarFallback>
                          </Avatar>
                          <span>
                            {currentUser?.user?.fullName || "Demo User"}
                          </span>
                        </div>

                        <Profile buttonDesign="w-38" />

                        <Link
                          to="/collection"
                          className="text-gray-700 flex items-center gap-2"
                        >
                          <Bookmark className="w-5 h-5" /> Saved Items
                        </Link>
                        {currentUser?.user?.role === "admin" && (
                          <Link to="/products">website</Link>
                        )}
                        

                        <Link
                          to="/chatdashboard"
                          className="text-gray-700 flex items-center gap-2"
                        >
                          <MessageSquare className="w-5 h-5" /> Chats
                        </Link>

                        <button
                          onClick={logout}
                          className="text-gray-700 flex items-center gap-2"
                        >
                          <LogOut className="w-5 h-5" /> Logout
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-3 mt-4 border-t pt-4">
                    <Button variant="outline" asChild>
                      <Link to="/">Login</Link>
                    </Button>
                    <Button asChild>
                      <Link to="/signup">Sign Up</Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}
