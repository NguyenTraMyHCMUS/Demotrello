import React from 'react'
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import api from "@/api/axios.js";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";


const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      toast.error("No reset token provided.");
      navigate("/login");
    }
  }, [token, navigate]);

  const ResetPasswordSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(ResetPasswordSchema),
  });

  const onSubmit = async (data) => {
    console.log(data);
    // Xử lý reset password ở đây
    try {
      const response = await api.post('/auth/reset-password', {
        token: token,
        password: data.password,
      });

      toast.success("Password has been reset successfully!");
      navigate("/login");
    } catch (error) {
      console.error("Reset password failed:", error);
      toast.error("Failed to reset password. Please try again.");
    }
  };

  if (!token) return null;
  
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>
          Enter your new password below to reset your account password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col gap-6">
            <div className="w-full max-w-sm space-y-2">
              <Label htmlFor="password-toggle">Password</Label>
              <div className="relative">
                <Input
                  className="bg-background"
                  id="password-toggle"
                  placeholder="Enter your new password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                />
                <Button
                  className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="w-full max-w-sm space-y-2">
              <Label htmlFor="password-toggle">Confirm Password</Label>
              <div className="relative">
                <Input
                  className="bg-background"
                  id="password-toggle"
                  placeholder="Enter your confirm password"
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                />
                <Button
                  className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>


          <Button
            type="submit"
            className="w-full bg-[#0C66E4] hover:bg-[#0C66E4]/90 cursor-pointer"
          >
            Reset Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default ResetPassword