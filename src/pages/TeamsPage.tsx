import { teams, users, formatNumber } from "@/data/dashboard-data";
import { useNavigate, useParams } from "react-router-dom";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { DataTable } from "@/components/ui/DataTable";
import {
  Users as UsersIcon,
  Zap,
  GitMerge,
  Trophy,
  FileDown,
  ChevronLeft,
  ArrowRight,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Papa from "papaparse";
import { exportToPdf } from "@/lib/export-pdf";
import { motion } from "framer-motion";

export default function TeamsPage() {
  const navigate = useNavigate();
  const { teamId } = useParams();

  if (teamId) {
    const team = teams.find(t => t.id === teamId);
    if (!team) return <div className="flex items-center justify-center min-h-[400px] text-slate-500 font-bold uppercase tracking-widest">Team not found</div>;

    const teamMembers = users.filter(u => u.teamId === teamId);
    const topPerformer = [...teamMembers].sort((a, b) => b.aiPercent - a.aiPercent)[0];

    const exportCSV = () => {
      const csv = Papa.unparse(teamMembers.map(u => ({
        Name: u.name, Role: u.role, "AI Code %": u.aiPercent, "AI Merge Rate": u.aiMergeRate,
        Commits: u.commits, "Tokens Used": u.tokensUsed, Tool: u.primaryTool, Status: u.status,
      })));
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `${teamId}-team.csv`; a.click();
    };

    const columns = [
      {
        header: "Developer",
        accessorKey: "name",
        cell: (val: string, row: any) => (
          <div
            className="flex items-center gap-3 cursor-pointer group/user"
            onClick={() => navigate(`/users/${row.id}`)}
          >
            <UserAvatar name={val} size="sm" />
            <div>
              <p className="font-bold text-slate-900 group-hover/user:text-indigo-600 transition-colors leading-tight">{val}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{row.role}</p>
            </div>
          </div>
        )
      },
      {
        header: "AI Code %",
        accessorKey: "aiPercent",
        cell: (val: number) => (
          <div className="flex items-center gap-3 min-w-[120px]">
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${val}%` }}
                className="h-full bg-indigo-500"
              />
            </div>
            <span className="font-black font-metric text-indigo-600 w-10 text-right">{val}%</span>
          </div>
        )
      },
      {
        header: "Merge Rate",
        accessorKey: "aiMergeRate",
        cell: (val: number) => (
          <span className="font-bold text-slate-700 font-metric">{val}%</span>
        )
      },
      {
        header: "Commits",
        accessorKey: "commits",
        cell: (val: number) => (
          <span className="font-bold text-slate-600 font-metric">{val}</span>
        )
      },
      {
        header: "Tokens",
        accessorKey: "tokensUsed",
        cell: (val: number) => (
          <span className="font-bold font-metric text-slate-500">{formatNumber(val)}</span>
        )
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: (val: string) => <StatusBadge status={val} size="sm" />
      },
      {
        header: "Date",
        accessorKey: "lastActiveDate",
        cell: (val: string) => <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{val}</span>
      }
    ];

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-8 max-w-7xl mx-auto pb-12"
        id="team-detail-content"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <button
              onClick={() => navigate("/teams")}
              className="group flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <ChevronLeft className="h-3 w-3 group-hover:-translate-x-0.5 transition-transform" />
              All Teams
            </button>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900">{team.name}</h1>
            <p className="text-slate-500 font-medium tracking-tight">Team metrics as of <span className="text-slate-900 font-bold">{team.lastSyncDate}</span> — Tracking engineer breakdown</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => exportToPdf("team-detail-content", `${teamId}-report`)}
              variant="outline"
              className="h-11 rounded-xl font-bold border-slate-200"
            >
              <FileDown className="h-4 w-4 mr-2 text-rose-500" />
              Export PDF
            </Button>
            <Button
              onClick={exportCSV}
              variant="outline"
              className="h-11 rounded-xl font-bold border-slate-200"
            >
              <Download className="h-4 w-4 mr-2 text-indigo-500" />
              CSV Data
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard title="Force Size" value={team.headCount} icon={<UsersIcon className="h-5 w-5" />} suffix=" Engineers" decimals={0} />
          <MetricCard title="Team Adoption" value={(team.aiUsers / team.headCount) * 100} icon={<Zap className="h-5 w-5" />} suffix="%" gradient="ai" />
          <MetricCard title="Merge Success" value={team.aiMergeRate} icon={<GitMerge className="h-5 w-5" />} suffix="%" gradient="success" />
          <MetricCard title="Top Gun" value={topPerformer.aiPercent} icon={<Trophy className="h-5 w-5" />} suffix="%" subtitle={topPerformer.name} gradient="warning" />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-black tracking-tight text-slate-900">Engineer Breakdown</h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{teamMembers.length} ACTIVE DEVELOPERS</span>
          </div>
          <DataTable
            data={teamMembers}
            columns={columns}
            className="shadow-premium"
          />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-7xl mx-auto"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">Engineering <span className="text-indigo-600">Squads</span></h1>
          <p className="text-base text-slate-500 mt-2 font-medium">Team-level AI deployment and efficiency benchmarking</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map(team => (
          <motion.button
            key={team.id}
            whileHover={{ y: -8, boxShadow: 'var(--shadow-xl)' }}
            onClick={() => navigate(`/teams/${team.id}`)}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-left hover:border-indigo-100 transition-all group relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <UsersIcon className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{team.headCount} MEMBERS</span>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{team.name}</h3>
                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{team.primaryTool}</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-400">AI Contribution</span>
                    <span className="text-indigo-600">{team.aiCodePercent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-50 overflow-hidden border border-slate-100 p-0.5">
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${team.aiCodePercent}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 bg-opacity-50">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Merge Rate</p>
                    <p className="text-sm font-black font-metric text-slate-900">{team.aiMergeRate}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Output</p>
                    <p className="text-sm font-black font-metric text-slate-900">{formatNumber(team.aiLoC)} LoC</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center pt-2 text-xs font-bold text-indigo-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                View Squadron Details <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
