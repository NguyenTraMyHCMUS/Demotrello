import React from 'react'
import { Button } from '@/components/ui/button'
import api from '@/api/axios.js'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const ForgotPassword = () => {
  const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    console.log(data);
    try {
      const response = await api.post('/auth/forgot-password', {
        email: data.email,
      });

      toast.success("Password reset email sent successfully! Please check your inbox.");
    }
    catch (error) {
      console.error("Forgot password failed:", error);
      toast.error("Failed to send reset password email. Please try again.");
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Forgot Password</CardTitle>
        <CardDescription>
          Enter your email to reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
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

export default ForgotPassword