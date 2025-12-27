import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "@/api/axios.js"; 
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import useAuth  from "../hooks/useAuth.js";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  // const { login } = useAuth();

  // State quản lý trạng thái
  const [status, setStatus] = useState("loading"); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState("Verifying your email address...");

  // Ref để chặn việc gọi API 2 lần trong React StrictMode (Môi trường Dev)
  const isCalled = useRef(false);

  useEffect(() => {
    // Nếu không có token trên URL -> Báo lỗi
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }

    // Nếu đã gọi API rồi thì không gọi lại nữa
    if (isCalled.current) return;
    isCalled.current = true;

    const verifyAccount = async () => {
      try {
        const response = await api.get(`/auth/verify-email?token=${token}`);

        setStatus("success");
        setMessage("Email verified successfully!");

        // Tự động đăng nhập sau khi xác minh thành công
        const userData = response.data.user;
        // login(userData);

        // Chuyển hướng về trang home sau 1.5 giây
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      } catch (error) {
        console.error("Verification failed:", error);
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "Verification failed. Please try again."
        );
      }
    };

    verifyAccount();
  }, [token, navigate]);

  return (
    <Card className="w-full max-w-md text-center shadow-lg">
      <CardHeader>
        <div className="flex justify-center mb-4">
          {/* ICON DỰA TRÊN TRẠNG THÁI */}
          {status === "loading" && (
            <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
          )}
          {status === "success" && (
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          )}
          {status === "error" && <XCircle className="h-16 w-16 text-red-500" />}
        </div>

        <CardTitle className="text-2xl">
          {status === "loading" && "Verifying..."}
          {status === "success" && "Success!"}
          {status === "error" && "Verification Failed"}
        </CardTitle>

        <CardDescription className="text-base mt-2">{message}</CardDescription>
      </CardHeader>

      <CardContent>
        {/* Nội dung phụ nếu cần */}
        {status === "success" && (
          <p className="text-sm text-muted-foreground">
            Redirecting to home page in a few seconds...
          </p>
        )}
      </CardContent>

      <CardFooter className="flex justify-center">
        {status === "error" && (
          <Button
            onClick={() => navigate("/login")}
            variant="outline"
            className="w-full"
          >
            Back to Login
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default VerifyEmail;
