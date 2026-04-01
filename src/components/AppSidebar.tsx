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
  { title: "SWOT Analysis", url: "/swot-analysis", icon: Sparkles },
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
  { title: "SWOT Analysis", url: "/swot-analysis", icon: Sparkles },
  { title: "Glossary", url: "/glossary", icon: BookOpen },
];

// Developer: personal dashboard only
const developerNavItems = [
  { title: "My Dashboard", url: "/dashboard", icon: UserCircle },
  { title: "SWOT Analysis", url: "/swot-analysis", icon: Sparkles },
  { title: "Glossary", url: "/glossary", icon: BookOpen },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const location = useLocation();
  const { currentRole, developerUserId, managerUserId, theme } = useAppStore();
  const isDark = theme === 'dark';

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

  const roleBadgeColor = isDark
    ? currentRole === "Developer"
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      : currentRole === "Manager"
        ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
        : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
    : currentRole === "Developer"
      ? "bg-emerald-100 text-emerald-700 border-emerald-300"
      : currentRole === "Manager"
        ? "bg-blue-100 text-blue-700 border-blue-300"
        : "bg-indigo-100 text-indigo-700 border-indigo-300";

  return (
    <Sidebar
      collapsible="icon"
      className={cn(
        "border-r transition-colors duration-300",
        isDark
          ? "border-white/5 bg-slate-950"
          : "border-indigo-100 bg-gradient-to-b from-indigo-50 via-white to-purple-50"
      )}
    >
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <div className="flex items-center gap-2">
                <div className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center font-black text-white text-lg",
                  "bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/20"
                )}>
                  AI
                </div>
                <div className="flex flex-col">
                  <span className={cn(
                    "text-lg font-black tracking-tighter leading-none",
                    isDark ? "text-white" : "text-indigo-900"
                  )}>CODE</span>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-[0.2em]",
                    isDark ? "text-indigo-400" : "text-indigo-500"
                  )}>INSIGHTS</span>
                </div>
              </div>
            </motion.div>
          )}
          {isCollapsed && (
            <div className={cn(
              "h-8 w-8 rounded-lg flex items-center justify-center font-black text-white text-xs",
              "bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/20"
            )}>
              AI
            </div>
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
                            isDark
                              ? isActive
                                ? "bg-white/10 text-white shadow-sm"
                                : "text-slate-400 hover:bg-white/5 hover:text-white"
                              : isActive
                                ? "bg-indigo-100/80 text-indigo-900 shadow-sm"
                                : "text-slate-500 hover:bg-indigo-50 hover:text-indigo-800"
                          )}
                        >
                          <item.icon className={cn(
                            "h-5 w-5 transition-transform duration-300 group-hover:scale-110",
                            isDark
                              ? isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
                              : isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-500"
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
                              className={cn(
                                "absolute right-2 h-1.5 w-1.5 rounded-full",
                                isDark
                                  ? "bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.6)]"
                                  : "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                              )}
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
        <div className={cn(
          "mt-auto border-t p-4 transition-colors duration-300",
          isDark ? "border-white/5" : "border-indigo-100"
        )}>
          <div className={cn(
            "flex items-center gap-3 rounded-2xl p-3",
            isDark ? "bg-white/5" : "bg-indigo-50/80 border border-indigo-100"
          )}>
            <div className={cn(
              "h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-tr flex items-center justify-center text-white font-bold shadow-sm text-xs",
              roleColor
            )}>
              {personaInfo.initials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className={cn(
                "text-xs font-bold truncate",
                isDark ? "text-white" : "text-indigo-900"
              )}>{personaInfo.name}</span>
              <span className={cn(
                "text-[10px] truncate",
                isDark ? "text-slate-500" : "text-indigo-400"
              )}>{personaInfo.email}</span>
            </div>
            <button className={cn(
              "ml-auto transition-colors",
              isDark ? "text-slate-500 hover:text-white" : "text-slate-400 hover:text-indigo-600"
            )}>
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </Sidebar>
  );
}
