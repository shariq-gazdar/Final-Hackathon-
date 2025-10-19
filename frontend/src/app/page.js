"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

function Page() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push("/dashboard"); // redirect if user exists
      } else {
        router.push("/auth"); // redirect to login/signup if no user
      }
    }
  }, [user, loading, router]);

  // Optional: show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return null; // don't render anything because user will be redirected
}

export default Page;
