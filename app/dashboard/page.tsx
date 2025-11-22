"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Plane,
  Hotel,
  Users,
  DoorOpen,
  Building,
  LogOut,
  PlaneLanding,
  PlaneTakeoff,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);

  // Simulate loading state for skeleton
  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timeout);
  }, []);

  // LOGOUT
  const handleLogout = async () => {
    try {
      const accessToken = document.cookie
        .split("; ")
        .find((c) => c.startsWith("accessToken="))
        ?.split("=")[1];

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
      });

      document.cookie = "accessToken=; Path=/; Max-Age=0;";
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // CHECK-IN CARDS CONFIG
  const checkInPoints = [
    {
      id: "airport-arrival",
      label: "Airport Arrival",
      icon: PlaneLanding,
      color: "bg-blue-500",
      iconColor: "text-blue-500",
    },
    {
      id: "airport-departure",
      label: "Airport Departure",
      icon: PlaneTakeoff,
      color: "bg-green-500",
      iconColor: "text-green-500",
    },
    {
      id: "hotel",
      label: "Hotel",
      icon: Hotel,
      color: "bg-yellow-500",
      iconColor: "text-yellow-500",
    },
    {
      id: "faculty-hall-session",
      label: "Faculty in Hall Session",
      icon: Users,
      color: "bg-purple-500",
      iconColor: "text-purple-500",
    },
    {
      id: "preview-room",
      label: "Preview Room",
      icon: DoorOpen,
      color: "bg-red-500",
      iconColor: "text-red-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">

        {/* TOP ICONS + LOGOUT */}
        <div className="mb-10 relative">
            {/* ICONS */}
            <div className="flex justify-center gap-3 sm:gap-4 md:gap-6 flex-nowrap overflow-x-auto pb-2">

  {checkInPoints.map((item) => {
    const Icon = item.icon;
    return (
      <Link
        key={item.id}
        href={`/dashboard/check-in/${item.id}`}
        className={`
          flex items-center justify-center rounded-full shadow-lg 
          hover:scale-105 hover:shadow-xl transition-all

          /* MOBILE Size */
          w-14 h-14 

          /* TABLET Size */
          sm:w-16 sm:h-16  

          /* DESKTOP Size */
          md:w-20 md:h-20

          ${item.color}
        `}
      >
        <Icon
          className={`
            text-white

            /* MOBILE Icon Size */
            w-6 h-6

            /* TABLET Icon Size */
            sm:w-8 sm:h-8

            /* DESKTOP Icon Size */
            md:w-10 md:h-10
          `}
        />
      </Link>
    );
  })}

</div>


          {/* LOGOUT BUTTON */}
          <div className="flex md:absolute md:right-0 md:top-0 mt-4 md:mt-0 justify-end">
            <AlertDialog>
              <AlertDialogTrigger>
                <button className="m-4 flex items-center gap-2 bg-red-600 px-4 py-2 rounded-lg text-white shadow hover:bg-red-700 transition">
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will be logged out from your account.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Logout
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gray-200 py-4 px-6 border-b">
            <h1 className="text-xl font-semibold text-center">
              Faculty Check-In Points
            </h1>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

              {loading
                ? [...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-gray-200 rounded-lg h-40 animate-pulse"
                    ></div>
                  ))
                : checkInPoints.map((point) => {
                    const Icon = point.icon;
                    return (
                      <Link
                        href={`/dashboard/check-in/${point.id}`}
                        key={point.id}
                      >
                        <Card
                          className="group cursor-pointer border shadow-sm hover:shadow-2xl transition-all duration-300 hover:border-blue-500 hover:scale-[1.03] rounded-xl"
                        >
                          <CardContent className="p-6 flex flex-col items-center justify-center space-y-3">
                            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center group-hover:bg-blue-50 transition-all">
                              <Icon
                                className={`w-12 h-12 ${point.iconColor}`}
                              />
                            </div>
                            <p className="text-sm font-medium text-gray-800 text-center group-hover:text-blue-600 transition">
                              {point.label}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
