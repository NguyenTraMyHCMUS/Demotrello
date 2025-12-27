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
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../../../shared/schemas/authSchema.js";
import { toast } from "sonner";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    // console.log(data);

    try {
      const response = await api.post("/auth/register", data);

      if (response.status == 201) {
        toast.success(
          "Registration successful! Please check your email to verify account."
        );
      }
    } catch (error) {
      console.error("Registration error:", error);
      const serverError = error.response?.data;

      if (serverError) {
        // Trường hợp 1: Email đã tồn tại (Backend trả về message: "Email already exists")
        if (serverError.message === "Email already exists") {
          // Gán lỗi trực tiếp vào ô input 'email'
          setError("email", {
            type: "manual",
            message: "Email address is already exists.",
          });
          // Vẫn hiện toast để user chú ý
          toast.error("This email is already exists.");
          return;
        }

        // Trường hợp 2: Lỗi Validation từ Zod backend trả về (nếu frontend check sót)
        if (serverError.errors) {
          // serverError.errors thường là object dạng { email: ["lỗi A"], name: ["lỗi B"] }
          // Bạn có thể loop qua để setError cho từng field nếu muốn
          toast.error("Please check your input fields.");
          return;
        }

        // Trường hợp 3: Lỗi khác có message cụ thể
        toast.error(serverError.message || "Registration failed.");
      } else {
        // Trường hợp 4: Lỗi mạng (Network Error)
        toast.error("Cannot connect to server. Please try again.");
      }
    }
  };

  return (
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
                {...register("email")}
              />

              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                {...register("name")}
              />

              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
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
            disabled={isSubmitting}
          >
            Sign up
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
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
      </CardFooter>
    </Card>
  );
};

export default Register;
