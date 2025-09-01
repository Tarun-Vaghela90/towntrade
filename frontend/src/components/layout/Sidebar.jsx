import { Home, Users, Settings, BarChart,ShoppingCart , MessageCircleWarning  } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const navItems = [
  { label: "Dashboard", icon: Home, href: "" },
  { label: "Users", icon: Users, href: "/admin/users" },
  { label: "Products", icon: ShoppingCart, href: "/admin/products" },
  { label: "Reports", icon: MessageCircleWarning, href: "/admin/reports" },
  { label: "Category", icon: Settings, href: "/admin/category" },
];

export default function Sidebar() {
  return (
    <div className="h-screen w-64 bg-white border-r shadow-sm flex flex-col">
      <div className="px-6 py-4 border-b">
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        {navItems.map((item) => (
          <Link key={item.href} to={item.href}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-base",
                "hover:bg-gray-100"
              )}
            >
              <item.icon className="w-5 h-5 mr-2" />
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>
    </div>
  );
}
