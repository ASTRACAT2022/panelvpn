import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Server,
  Users,
  Settings,
  Activity,
  Shield,
} from "lucide-react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      color: "text-sky-500",
    },
    {
      label: "Nodes",
      icon: Server,
      href: "/nodes",
      color: "text-violet-500",
    },
    {
      label: "Users",
      icon: Users,
      href: "/users",
      color: "text-pink-700",
    },
    {
      label: "Monitoring",
      icon: Activity,
      href: "/monitoring",
      color: "text-orange-700",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
    },
  ];

  return (
    <div className={cn("space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white", className)}>
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <Shield className="h-8 w-8 mr-4" />
          <h1 className="text-2xl font-bold">PanelVPN</h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition"
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
