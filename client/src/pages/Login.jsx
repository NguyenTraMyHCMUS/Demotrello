import React from "react";
import api from "@/api/axios.js";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye } from "lucide-react";
import { EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth.js";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../../../shared/schemas/authSchema.js";
import { toast } from "sonner";

const Login = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      if (error === "invalid_state") {
        toast.error("Invalid state parameter. Please try logging in again.");
      } else if (error === "auth_failed") {
        toast.error("Authentication with Google failed. Please try again.");
      }

      //  Xóa param khỏi URL để nhìn cho đẹp (tuỳ chọn)
      if (error) {
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }
    }
  }, [searchParams]);

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    console.log(data);

    try {
      const response = await api.post("/auth/login", data);

      if (response.status == 200) {
        const userData = response.data.user;

        // Update auth context
        login(userData);

        // Navigate to home page
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);

      const serverError = error.response?.data;
      toast.error(
        serverError.message || "Login failed. Please check your credentials."
      );
    }
  };

  return (
    <div>
      <Card className="w-sm">
        <CardHeader className="text-center">
          <CardTitle>
            <h1 className="text-3xl font-semibold">Trello</h1>
          </CardTitle>
          <CardDescription>
            <h2 className="text-md font-medium">Sign up to continue</h2>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  {...register("email")}
                />

                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <div className="w-full max-w-sm space-y-2">
                  <Label htmlFor="password-toggle">Password</Label>
                  <div className="relative">
                    <Input
                      className="bg-background"
                      id="password-toggle"
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      {...register("password")}
                    />

                    {errors.password && (
                      <p className="text-sm text-red-600">
                        {errors.password.message}
                      </p>
                    )}

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
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#0C66E4] hover:bg-[#0C66E4]/90 cursor-pointer"
            >
              Sign in
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button
            variant="link"
            className="w-full flex justify-end text-[#0C66E4] cursor-pointer"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot password?
          </Button>

          <p className="text-center text-sm font-semibold text-muted-foreground">
            Or continue with:
          </p>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              window.location.href = `${
                import.meta.env.VITE_SERVER_URL
              }/api/auth/google`;
            }}
          >
            Google
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              window.location.href = `${
                import.meta.env.VITE_SERVER_URL
              }/api/auth/microsoft`;
            }}
          >
            Microsoft
          </Button>

          <Button
            variant="link"
            className="w-full text-[#0C66E4] cursor-pointer"
            onClick={() => navigate("/register")}
          >
            Create new account
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
