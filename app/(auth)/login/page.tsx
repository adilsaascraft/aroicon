'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Plane,
  GraduationCap,
  Building,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const LoginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  robot: z.boolean().refine(v => v === true, { message: "Please verify you are a human" }),
});

export default function Home() {
  const router = useRouter();
  const [validated, setValidated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "", robot: false }
  });

  // ===========================================================
  // 🎯 LOGIN HANDLER — save accessToken to localStorage
  // ===========================================================
  const onSubmit = async (data: any) => {
    try {
      setValidated(false);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // refreshToken cookie stored automatically
          body: JSON.stringify({
            email: data.email,
            password: data.password
          })
        }
      );

      const result = await res.json();

      if (!res.ok) {
        setError("password", { message: result?.message || "Invalid credentials" });
        return;
      }

      // ================================
      // ⭐ SAVE ACCESS TOKEN (VERY IMPORTANT)
      // ================================
      if (result.accessToken) {
        localStorage.setItem("accessToken", result.accessToken);
      }

      // success animation
      setValidated(true);

      // redirect after validation animation
      setTimeout(() => router.push("/dashboard"), 900);

    } catch (error) {
      setError("password", { message: "Something went wrong. Try again." });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">

        {/* Top icons */}
        <div className="flex justify-center items-center gap-6 mb-12">
          <div className="w-20 h-20 bg-orange-600 rounded-full flex items-center justify-center">
            <Plane className="w-10 h-10 text-white" />
          </div>
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center">
            <Building className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Login card */}
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-8">Admin Login</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Email */}
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="Enter Email" {...register("email")} />
              {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Password"
                  {...register("password")}
                  className="pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}

              <a href="forgot-password" className="text-sm text-orange-600 underline">
                Forgot Password?
              </a>
            </div>

            {/* Checkbox */}
            <div className="flex items-center gap-2">
              <Input type="checkbox" className="w-4 h-4 accent-green-600" {...register("robot")} />
              <Label className="text-sm text-gray-600">I'm not a robot</Label>
            </div>
            {errors.robot && <p className="text-red-600 text-sm">{errors.robot.message}</p>}

            {/* Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className={`w-full text-white flex items-center justify-center gap-2 ${
                validated ? "bg-green-600 hover:bg-green-700" : "bg-orange-600 hover:bg-orange-700"
              }`}
            >
              {validated ? (
                <>
                  <CheckCircle className="w-5 h-5 text-white" /> Validated
                </>
              ) : isSubmitting ? (
                "Logging in..."
              ) : (
                "Login"
              )}
            </Button>

          </form>
        </div>
      </div>
    </div>
  );
}
