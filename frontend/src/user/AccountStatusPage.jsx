import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearCurrentUser } from "../redux/slices/userSlice";
import { useState } from "react";
import { toast } from "react-toastify";
import api from "@/Axios/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function AccountStatusPage({ status }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [openReport, setOpenReport] = useState(false);
  const [reportDescription, setReportDescription] = useState("");

  const logout = () => {
    dispatch(clearCurrentUser());
    localStorage.removeItem("Token");
    navigate("/");
  };

  const sendReport = async () => {
    try {
      await api.post("/reports/", {
        product: null,
        reason: "Account Blocked",
        description: reportDescription,
      });
      toast.success("Report submitted successfully!");
      setOpenReport(false);
      setReportDescription("");
    } catch (error) {
      console.error("Error reporting account:", error);
      toast.error("Failed to submit report.");
    }
  };

  const statusMessages = {
    blocked: "Your account has been blocked. You can report this issue.",
    deactive: "Your account is deactivated. Update your profile to activate it.",
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6 bg-gray-50 p-6">
      <div className="bg-white shadow-md rounded-xl p-8 max-w-md w-full text-center">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
          Account {status.charAt(0).toUpperCase() + status.slice(1)}
        </h1>
        <p className="text-gray-600 mb-6">{statusMessages[status]}</p>

        {status === "deactive" && (
          <p className="text-sm text-gray-500 mb-6">
            Open your profile from the dropdown, update your account status from
            <span className="font-semibold"> Deactive → Active</span>, then log
            out and log in again.
          </p>
        )}

        {status === "blocked" && (
          <>
            <Button
              className="mb-4"
              onClick={() => setOpenReport(true)}
              variant="outline"
            >
              Report Issue
            </Button>

            <Dialog open={openReport} onOpenChange={setOpenReport}>
              <DialogContent className="max-w-md rounded-lg shadow-lg p-6">
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold">
                    Report Account Issue
                  </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 mt-2">
                  <p className="text-gray-700 text-sm">
                    Provide details about why your account was blocked:
                  </p>
                  <Input
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Describe the issue..."
                    className="border-gray-300"
                  />
                </div>
                <DialogFooter className="flex justify-between mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setOpenReport(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={sendReport}>Submit Report</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}

        <Button variant="destructive" onClick={logout} className="mt-4 w-full">
          Log Out
        </Button>
      </div>
    </div>
  );
}
