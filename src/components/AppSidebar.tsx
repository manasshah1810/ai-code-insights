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
  BookOpen
} from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
  { title: "Code Breakdown", url: "/code-breakdown", icon: Code2 },
  { title: "Merge Analytics", url: "/merge-analytics", icon: GitMerge },
  { title: "Teams", url: "/teams", icon: Users },
  { title: "Leaderboard", url: "/leaderboard", icon: Trophy, requiresOptIn: true },
  { title: "Glossary", url: "/glossary", icon: BookOpen },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-slate-200 bg-white/50 backdrop-blur-xl">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 15, scale: 1.1 }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--ai-primary)] shadow-lg shadow-indigo-200"
          >
            <Sparkles className="h-5 w-5 text-white" />
          </motion.div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <span className="text-base font-black tracking-tight text-slate-900">CodeIQ</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">Analytics Pro</span>
            </motion.div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {navItems
                .filter(item => !item.requiresOptIn || !useAppStore.getState().strictPrivacyMode)
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
                              ? "bg-indigo-50 text-indigo-700 shadow-sm"
                              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                          )}
                        >
                          <item.icon className={cn(
                            "h-5 w-5 transition-transform duration-300 group-hover:scale-110",
                            isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
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
                              className="absolute right-2 h-1.5 w-1.5 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.6)]"
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
        <div className="mt-auto border-t border-slate-100 p-4">
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-sm">
              AM
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-900 truncate">Admin User</span>
              <span className="text-[10px] text-slate-500 truncate">admin@techcorp.com</span>
            </div>
            <button className="ml-auto text-slate-400 hover:text-slate-600 transition-colors">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </Sidebar>
  );
}
