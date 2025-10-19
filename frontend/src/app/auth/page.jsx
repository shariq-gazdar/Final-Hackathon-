"use client";

import React, { useState } from "react";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // your backend
});

const Auth = () => {
  const router = useRouter();

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  // LOGIN
  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const res = await API.post("/login", {
        email: loginEmail,
        password: loginPassword,
      });
      localStorage.setItem("token", res.data.token);
      toast.success("Login successful!");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  // SIGNUP
  const handleSignup = async () => {
    setIsLoading(true);
    try {
      await API.post("/register", {
        name: signupName,
        email: signupEmail,
        password: signupPassword,
      });
      toast.success("Signup successful! Please login.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Image */}
      <div
        className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative"
        style={{ backgroundImage: "url(/auth/AuthBanner.png)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-secondary/40" />
        <div className="relative z-10 p-12 flex flex-col justify-center text-white">
          <h1 className="text-5xl font-bold mb-4">HealthMate</h1>
          <p className="text-2xl opacity-90">Sehat ka Smart Dost</p>
        </div>
      </div>

      {/* Right side - Forms */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-background to-primary/5">
        <header className="p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="HealthMate" className="w-10 h-10" />
            <span className="font-semibold text-xl lg:hidden">HealthMate</span>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md p-6 shadow-lg">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {/* LOGIN FORM */}
              <TabsContent value="login" className="space-y-4">
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleLogin();
                  }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="your.email@example.com"
                        className="pl-10"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-[#4cb8b2]"
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Login"}{" "}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </form>
              </TabsContent>

              {/* SIGNUP FORM */}
              <TabsContent value="signup" className="space-y-4">
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSignup();
                  }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Ali Khan"
                        className="pl-10"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your.email@example.com"
                        className="pl-10"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating..." : "Create Account"}{" "}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Auth;
