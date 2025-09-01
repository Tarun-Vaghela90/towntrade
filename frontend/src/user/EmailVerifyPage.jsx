import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import api from "@/Axios/api";
import { useSelector, useDispatch } from "react-redux";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { setCurrentUser } from "../redux/slices/userSlice"; // adjust path

export default function EmailVerifyPage() {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 🔑 Poll/check user status
  const checkVerification = async () => {
    try {
      const res = await api.get("/users/me"); // fetch updated user
      console.log(res.data) // update Redux state
     if (res.data) {
  dispatch(setCurrentUser(
     {    
      ...currentUser,
      user: 
      
      res.data
     }
    )); // ✅ wrap properly

  if (res.data.emailVerified) {
    navigate("/", { replace: true });
  }
}
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
  };

  useEffect(() => {
    // check once on page load
    checkVerification();

    // optional: auto-poll every 5s until verified
    const interval = setInterval(() => {
      checkVerification();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleResend = async () => {
    try {
      setLoading(true);
      setMessage("");
      await api.post("/auth/send_email_verification", {
        email: currentUser.user.email,
      });
      setMessage("Verification email sent! Please check your inbox.");
    } catch (err) {
      console.error(err);
      setMessage("Failed to resend email. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-center text-xl font-semibold">
            Verify Your Email
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-center text-gray-600">
            Hi{" "}
            <span className="font-medium">
              {currentUser?.user?.fullName}
            </span>
            , we’ve sent a verification link to your email:
          </p>
          <p className="text-center font-semibold text-gray-800">
            {currentUser?.user?.email}
          </p>
          <p className="text-sm text-gray-500 text-center">
            Please check your inbox and click the link to verify.
          </p>

          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleResend}
            disabled={loading}
            className="w-full mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Resend Verification Email"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
