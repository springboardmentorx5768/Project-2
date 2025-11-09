import { 
  LayoutDashboard, 
  Megaphone, 
  Award, 
  Target, 
  Settings, 
  ChevronLeft, 
  Shield, 
  Trophy, 
  Users, 
  TrendingUp,
  Calendar,
  BookMarked,
  Bell
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const baseMenuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Shout-outs", url: "/shout-outs", icon: Megaphone },
  { title: "Leaderboard", url: "/leaderboard", icon: Trophy },
  { title: "Team Directory", url: "/team", icon: Users },
  { title: "Achievements", url: "/achievements", icon: Award },
  { title: "Goals", url: "/goals", icon: Target },
  { title: "Activity Feed", url: "/activity", icon: TrendingUp },
  { title: "My Bookmarks", url: "/bookmarks", icon: BookMarked },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Settings", url: "/settings", icon: Settings },
];

const adminMenuItem = { title: "Admin", url: "/admin", icon: Shield };

interface AppSidebarProps {
  user: any;
}

export function AppSidebar({ user }: AppSidebarProps) {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { isAdmin } = useAdminCheck();

  const menuItems = isAdmin 
    ? [...baseMenuItems.slice(0, -1), adminMenuItem, baseMenuItems[baseMenuItems.length - 1]]
    : baseMenuItems;

  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";
  };

  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "bg-primary/10 text-primary font-medium hover:bg-primary/15"
      : "hover:bg-muted/50";

  return (
    <Sidebar collapsible="icon" className={isCollapsed ? "w-14" : "w-60"}>
      <SidebarHeader className="border-b border-border p-4">
        {!isCollapsed && user && (
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 bg-gradient-primary">
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
          </div>
        )}
        {isCollapsed && user && (
          <Avatar className="w-8 h-8 bg-gradient-primary mx-auto">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel>Navigation</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavClass}>
                      <item.icon className={isCollapsed ? "mx-auto" : "mr-2 h-4 w-4"} />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="mt-auto border-t border-border p-2">
        <Button
          variant="ghost"
          size={isCollapsed ? "icon" : "sm"}
          onClick={toggleSidebar}
          className="w-full"
        >
          <ChevronLeft className={`h-4 w-4 transition-transform ${isCollapsed ? "rotate-180" : ""}`} />
          {!isCollapsed && <span className="ml-2">Collapse</span>}
        </Button>
      </div>
    </Sidebar>
  );
}
