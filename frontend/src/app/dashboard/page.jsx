"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Activity, Upload, TrendingUp, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

const Dashboard = () => {
  const router = useRouter();
  const { user, logout } = useAuth(); // fetch logged-in user
  const [stats, setStats] = useState([]);

  useEffect(() => {
    // Example: fetch stats from API
    // Replace with your backend call if needed
    setStats([
      {
        title: "Total Reports",
        value: 12,
        icon: FileText,
        color: "text-primary",
        bgColor: "bg-primary/10",
      },
      {
        title: "Recent Vitals",
        value: 8,
        icon: Activity,
        color: "text-secondary",
        bgColor: "bg-secondary/10",
      },
      {
        title: "AI Insights",
        value: 24,
        icon: TrendingUp,
        color: "text-accent",
        bgColor: "bg-accent/10",
      },
    ]);
  }, []);

  const handleLogout = () => {
    logout(); // clear user token/context
    toast.success("Logged out successfully");
    router.push("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-primary/5">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="HealthMate"
              className="w-10 h-10"
              width={500}
              height={500}
            />
            <h1 className="text-xl font-bold">{user?.name || "HealthMate"}</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold mb-6">
          Hi {user?.name || "User"}, Welcome to HealthMate!
        </h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} p-4 rounded-2xl`}>
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card
            className="hover:shadow-lg cursor-pointer"
            onClick={() => router.push("/new-chat")}
          >
            <CardHeader className="flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-xl">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Upload New Report</CardTitle>
                <CardDescription>
                  Upload and analyze medical reports
                </CardDescription>
              </div>
            </CardHeader>
          </Card>

          <Card
            className="hover:shadow-lg cursor-pointer"
            onClick={() => router.push("/reports")}
          >
            <CardHeader className="flex items-center gap-3">
              <div className="bg-secondary/10 p-3 rounded-xl">
                <FileText className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <CardTitle>My Reports</CardTitle>
                <CardDescription>View all your medical reports</CardDescription>
              </div>
            </CardHeader>
          </Card>
          <Card
            className="hover:shadow-lg cursor-pointer"
            onClick={() => router.push("/reports")}
          >
            <CardHeader className="flex items-center gap-3">
              <div className="bg-secondary/10 p-3 rounded-xl">
                <FileText className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <CardTitle>My Vitals</CardTitle>
                <CardDescription>View all your medical reports</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
