import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Code2,
  GitMerge,
  Users,
  Trophy,
  Settings,
  Sparkles,
  ChevronRight,
  LogOut,
  User,
  BookOpen,
  Bot,
  Shield,
  UserCircle
} from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { users } from "@/data/dashboard-data";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

// Full admin navigation
const adminNavItems = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
  { title: "Code Breakdown", url: "/code-breakdown", icon: Code2 },
  { title: "AI Tools", url: "/ai-tools", icon: Bot },
  { title: "AI Summary", url: "/ai-summary", icon: Sparkles },
  { title: "Merge Analytics", url: "/merge-analytics", icon: GitMerge },
  { title: "Teams", url: "/teams", icon: Users },
  { title: "Leaderboard", url: "/leaderboard", icon: Trophy, requiresOptIn: true },
  { title: "Glossary", url: "/glossary", icon: BookOpen },
  { title: "Settings", url: "/settings", icon: Settings },
];

// Manager: team-scoped, no individual user browsing or org-wide analytics
const managerNavItems = [
  { title: "Team Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "AI Tools", url: "/ai-tools", icon: Bot },
  { title: "AI Summary", url: "/ai-summary", icon: Sparkles },
  { title: "Glossary", url: "/glossary", icon: BookOpen },
];

// Developer: personal dashboard only
const developerNavItems = [
  { title: "My Dashboard", url: "/dashboard", icon: UserCircle },
  { title: "AI Summary", url: "/ai-summary", icon: Sparkles },
  { title: "Glossary", url: "/glossary", icon: BookOpen },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const location = useLocation();
  const { currentRole, developerUserId, managerUserId } = useAppStore();

  // Choose nav items based on role
  const navItems = currentRole === "Developer"
    ? developerNavItems
    : currentRole === "Manager"
      ? managerNavItems
      : adminNavItems;

  // Persona info for the bottom card
  const devUser = users.find(u => u.id === developerUserId);
  const mgrUser = users.find(u => u.id === managerUserId);

  const personaInfo = currentRole === "Developer"
    ? {
      name: devUser?.name || "Developer",
      email: devUser ? `${devUser.name.toLowerCase().replace(" ", ".")}@techcorp.com` : "developer@techcorp.com",
      initials: devUser?.avatar || "RG",
      role: "Developer"
    }
    : currentRole === "Manager"
      ? {
        name: mgrUser?.name || "Manager",
        email: mgrUser ? `${mgrUser.name.toLowerCase().replace(" ", ".")}@techcorp.com` : "manager@techcorp.com",
        initials: mgrUser?.avatar || "JL",
        role: "Team Lead"
      }
      : { name: "Admin User", email: "admin@techcorp.com", initials: "AM", role: "Admin" };

  const roleColor = currentRole === "Developer"
    ? "from-emerald-500 to-teal-500"
    : currentRole === "Manager"
      ? "from-blue-500 to-cyan-500"
      : "from-indigo-500 to-purple-500";

  const roleBadgeColor = currentRole === "Developer"
    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    : currentRole === "Manager"
      ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
      : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";

  return (
    <Sidebar collapsible="icon" className="border-r border-white/5 bg-slate-950">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 15, scale: 1.1 }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/40"
          >
            <span className="font-black text-white text-sm tracking-tight">SF</span>
          </motion.div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <span className="text-base font-black tracking-tight text-white leading-tight">Snap Finance <span className="text-indigo-400">AI</span></span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Code Platform</span>
            </motion.div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        {/* Role Badge */}
        {!isCollapsed && (
          <div className="px-3 mb-6">
            <Badge className={cn("w-full justify-center py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg border", roleBadgeColor)}>
              {currentRole === "Developer" ? "👤 Developer" : currentRole === "Manager" ? "👥 Manager" : "🛡️ Admin"}
            </Badge>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {navItems
                .filter(item => !('requiresOptIn' in item && item.requiresOptIn) || !useAppStore.getState().strictPrivacyMode)
                .map((item) => {
                  const isActive = location.pathname === item.url ||
                    (item.url === "/teams" && location.pathname.startsWith("/teams")) ||
                    (item.url === "/dashboard" && location.pathname === "/");

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive} className="group relative">
                        <NavLink
                          to={item.url}
                          end={item.url !== "/teams"}
                          className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-6 transition-all duration-300",
                            isActive
                              ? "bg-white/10 text-white shadow-sm"
                              : "text-slate-400 hover:bg-white/5 hover:text-white"
                          )}
                        >
                          <item.icon className={cn(
                            "h-5 w-5 transition-transform duration-300 group-hover:scale-110",
                            isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
                          )} />
                          {!isCollapsed && (
                            <span className={cn(
                              "text-sm font-semibold transition-opacity duration-300",
                              isActive ? "opacity-100" : "opacity-80 group-hover:opacity-100"
                            )}>
                              {item.title}
                            </span>
                          )}

                          {isActive && !isCollapsed && (
                            <motion.div
                              layoutId="active-nav"
                              className="absolute right-2 h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.6)]"
                            />
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {!isCollapsed && (
        <div className="mt-auto border-t border-white/5 p-4">
          <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
            <div className={cn(
              "h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-tr flex items-center justify-center text-white font-bold shadow-sm text-xs",
              roleColor
            )}>
              {personaInfo.initials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-white truncate">{personaInfo.name}</span>
              <span className="text-[10px] text-slate-500 truncate">{personaInfo.email}</span>
            </div>
            <button className="ml-auto text-slate-500 hover:text-white transition-colors">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </Sidebar>
  );
}
