// DashboardLayout.jsx
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <Topbar />
        <main className="flex-1 p-6 bg-gray-50">
          {/* This is where nested routes will render */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
