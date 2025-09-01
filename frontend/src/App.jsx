import React, { useEffect } from "react";
import { toast } from "react-toastify";
import { Route, Routes, Navigate, Outlet, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { requestForToken, onMessageListener } from "./firebase";

// User-facing pages
import Products from "./products/Products";
import Login from "./user/Login";
import Signup from "./user/Signup";
import ViewProduct from "./products/ViewProduct";
import UserCollectionsPage from "./Navigation/UserCollectionPage";
import UserSoldProducts from "./products/UserSoldProducts";
import ChatDashboard from "./user/ChatDashboard";
import ProductCompare from "./products/ProductCompare";

// Admin pages + Layout
import DashboardLayout from "./components/layout/DashboardLayout";
import Dashboard from "./pages/admin/Dashboard";
import UserManagement from "./pages/admin/UserMangement";
import AdminProducts from "./pages/admin/product/AdminProducts";
import ReportManagement from "./pages/report/ReportManagement";
import CategoryManagement from "./pages/category/CategoryManagement";

// Layouts
import PublicLayout from "./components/layout/PublicLayout";
import ForgetPassword from "./user/ForgetPassword";
import ResetPassword from "./user/ResetPassword";
import AccountStatusPage from "./user/AccountStatusPage";
import EmailVerifyPage from "./user/EmailVerifyPage";
import jwtDecode from "jwt-decode";
function App() {
  const { currentUser } = useSelector((state) => state.user);
  const token = localStorage.getItem("Token");




  // ✅ helper to check if token expired
  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      if (!decoded.exp) return true;
      return decoded.exp * 1000 < Date.now();
    } catch (error) {
      return true; // invalid token
    }
  };


  useEffect(() => {
    requestForToken();

    onMessageListener((payload) => {
      console.log("from app.jsx", payload);
      // toast.info(`${payload.notification.title}: ${payload.notification.body}`);
    });
  }, []);

  // -----------------------
  // Route Guards
  // -----------------------

  // For logged-in users (both regular and admin)
  const ProtectedRoute = ({ children }) => {
    if (!token || !currentUser) {
      return <Navigate to="/" replace />;
    }

    // Check account status
    const status = currentUser.user?.accountStatus;
    if (status === "deactive" || status === "blocked") {
      return <Navigate to={`/account-status/${status}`} replace />;
    }

    // ✅ Check email verification
    if (!currentUser.user?.emailVerified) {
      return <Navigate to="/emailverification" replace />;
    }

    return children ? children : <Outlet />;
  };

  // Only for admin users
  const AdminRoute = ({ children }) => {
    if (!token || !currentUser || currentUser?.user?.role !== "admin") {
      return <Navigate to="/" replace />;
    }
    return children ? children : <Outlet />;
  };

  function AccountStatusPageWrapper() {
    const { status } = useParams();
    return <AccountStatusPage status={status} />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Routes>
        {/* -------------------- */}
        {/* Public/User routes */}
        {/* -------------------- */}
        <Route element={<PublicLayout />}>
          {/* Login route with email verify check */}
          <Route
            path="/"
            element={
              token && currentUser && !isTokenExpired(token) ? (
                currentUser.user?.emailVerified ? (
                  <Navigate to="/products" replace />
                ) : (
                  <Navigate to="/emailverification" replace />
                )
              ) : (
                <Login />
              )
            }
          />

          {/* Signup route */}
          <Route
            path="/signup"
            element={
              token && currentUser ? (
                currentUser.user?.emailVerified ? (
                  <Navigate to="/products" replace />
                ) : (
                  <Navigate to="/emailverification" replace />
                )
              ) : (
                <Signup />
              )
            }
          />

          <Route path="/forgotpassword" element={<ForgetPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/emailverification" element={<EmailVerifyPage />} />
          <Route
            path="/account-status/:status"
            element={<AccountStatusPageWrapper />}
          />

          {/* Protected user routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ViewProduct />} />
            <Route path="/collection" element={<UserCollectionsPage />} />
            <Route path="/userSoldProducts" element={<UserSoldProducts />} />
            <Route path="/chatdashboard" element={<ChatDashboard />} />
            <Route path="/compare" element={<ProductCompare />} />
          </Route>
        </Route>

        {/* -------------------- */}
        {/* Admin routes */}
        {/* -------------------- */}
        <Route path="/admin" element={<DashboardLayout />}>
          <Route element={<AdminRoute />}>
            <Route index element={<Dashboard />} /> {/* /admin */}
            <Route path="users" element={<UserManagement />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="reports" element={<ReportManagement />} />
            <Route path="category" element={<CategoryManagement />} />
          </Route>
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
