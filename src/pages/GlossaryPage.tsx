import { motion } from "framer-motion";
import {
    BookOpen,
    HelpCircle,
    Info,
    Settings,
    Zap,
    GitMerge,
    Code2,
    Users,
    Calculator,
    Target,
    BrainCircuit,
    Lightbulb,
    Activity
} from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

export default function GlossaryPage() {
    const glossaryItems = [
        {
            category: "Core Metrics & Definitions",
            icon: <Target className="h-5 w-5 text-indigo-500" />,
            items: [
                {
                    term: "AI Code (%)",
                    definition: "The percentage of lines of code (LoC) attributed to AI generation vs. manual human entry. This is determined via the VCS provider's telemetry (e.g., Cursor's 'Copilot' or 'Cursor' attribution).",
                    formula: "(AI Generated LoC / Total LoC) × 100"
                },
                {
                    term: "Manual Code",
                    definition: "Code traditionally typed by engineers without direct AI completion or generation. This serves as the baseline for human-only output.",
                    formula: "Total LoC - AI Generated LoC"
                },
                {
                    term: "AI Merge Rate",
                    definition: "A critical quality metric measuring the percentage of AI-heavy pull requests that are successfully merged into the master branch without rejection or rewrite.",
                    formula: "(Merged AI-Assisted PRs / Total AI-Assisted PRs) × 100"
                },
                {
                    term: "AI Adoption Rate",
                    definition: "The percentage of engineers within a specific squad or organization who have actively used AI coding tools at least once in the current reporting period.",
                    formula: "(Active AI Users / Total Engineering Headcount) × 100"
                },
                {
                    term: "Avg. Tokens / Line",
                    definition: "The average volume of tokens consumed by the AI engine to generate a single accepted line of code. Lower values indicate higher prompt efficiency and better tool utilization.",
                    formula: "Total Tokens Used / AI Generated LoC"
                }
            ]
        },
        {
            category: "Artificial Intelligence Engines",
            icon: <BrainCircuit className="h-5 w-5 text-purple-500" />,
            items: [
                {
                    term: "Cursor IDE",
                    definition: "A specialized IDE fork of VS Code built from the ground up for AI-first programming. It tracks 'Fast' and 'Slow' token usage and provides high-fidelity telemetry on AI contribution.",
                    details: "Associated with the highest efficiency gains in our current dataset."
                },
                {
                    term: "GitHub Copilot",
                    definition: "A cloud-based AI pair programmer that provides autocomplete suggestions. We track its impact primarily through commit-level attribution and IDE extension telemetry.",
                    details: "Standardized across all enterprise repositories."
                },
                {
                    term: "Tokenization",
                    definition: "The fundamental unit of AI processing (roughly 4 characters). We track 'Tokens Used' as a proxy for the volume of AI requests handled by the Large Language Models (LLMs).",
                }
            ]
        },
        {
            category: "Telemetry & Status",
            icon: <Activity className="h-5 w-5 text-emerald-500" />,
            items: [
                {
                    term: "License Idle",
                    definition: "A status indicating that an engineer has a provisioned AI license but has not recorded any significant AI activity in the last 7 days.",
                },
                {
                    term: "Power User",
                    definition: "Engineers consistently exceeding the 75th percentile for both AI Code % and AI Merge Rate.",
                },
                {
                    term: "Velocity Boost",
                    definition: "The estimated percentage increase in delivery speed attributed to AI assistance, calculated by comparing story point completion vs. historical baselines.",
                }
            ]
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-12 max-w-5xl mx-auto pb-20"
        >
            {/* Hero Header */}
            <div className="relative rounded-[3rem] overflow-hidden bg-slate-900 p-12 text-white shadow-2xl">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                    <BookOpen className="h-48 w-48" />
                </div>
                <div className="relative z-10 space-y-4">
                    <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 font-black tracking-widest uppercase">Knowledge Base</Badge>
                    <h1 className="text-5xl font-black tracking-tighter">Glossary of <span className="text-indigo-400">Intelligence</span></h1>
                    <p className="max-w-2xl text-lg text-slate-400 font-medium leading-relaxed">
                        Everything you need to know about the AI Code Intelligence Dashboard. Definitions, formulas, and assumptions explained in plain English to help you navigate the future of engineering.
                    </p>
                </div>
            </div>

            {/* Main Content Sections */}
            <div className="grid gap-12">
                {glossaryItems.map((section, sIdx) => (
                    <div key={sIdx} className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm">
                                {section.icon}
                            </div>
                            <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase">{section.category}</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {section.items.map((item, iIdx) => (
                                <Card key={iIdx} className="rounded-3xl border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden border-l-4 border-l-indigo-500 group">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg font-black tracking-tight group-hover:text-indigo-600 transition-colors">{item.term}</CardTitle>
                                        <CardDescription className="text-slate-500 font-medium">{item.definition}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3 pt-0">
                                        {item.formula && (
                                            <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-100 border-dashed">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                                    <Calculator className="h-3 w-3" /> Formula
                                                </p>
                                                <code className="text-[11px] font-mono font-bold text-indigo-600">
                                                    {item.formula}
                                                </code>
                                            </div>
                                        )}
                                        {item.details && (
                                            <p className="text-xs font-bold text-slate-400 italic flex items-center gap-1.5">
                                                <Info className="h-3 w-3" /> {item.details}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Project Assumptions Accordion */}
            <div className="space-y-6 pt-8">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100 shadow-sm">
                        <Lightbulb className="h-5 w-5 text-amber-500" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Project Assumptions</h2>
                </div>

                <Accordion type="single" collapsible className="w-full space-y-4">
                    <AccordionItem value="item-1" className="border rounded-3xl px-6 bg-white shadow-sm overflow-hidden">
                        <AccordionTrigger className="hover:no-underline font-black text-slate-900 text-lg py-6 tracking-tight">How is 'AI Attribution' determined?</AccordionTrigger>
                        <AccordionContent className="pb-8 text-slate-500 font-medium leading-relaxed">
                            We rely on enterprise-grade telemetry from Cursor and GitHub Copilot. When a developer commits code, the local IDE agents flag lines generated or heavily modified by AI suggestions. These markers are captured by our Git Webhook listener and mapped to the respective engineer's profile.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-2" className="border rounded-3xl px-6 bg-white shadow-sm overflow-hidden">
                        <AccordionTrigger className="hover:no-underline font-black text-slate-900 text-lg py-6 tracking-tight">What defines an 'Active' developer?</AccordionTrigger>
                        <AccordionContent className="pb-8 text-slate-500 font-medium leading-relaxed">
                            An 'Active' developer is defined as any employee with at least one recorded commit in a tracked repository within the last 7 calendar days. Profiles that do not meet this threshold are excluded from real-time leaderboard calculations but remain visible in historical reports.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-3" className="border rounded-3xl px-6 bg-white shadow-sm overflow-hidden">
                        <AccordionTrigger className="hover:no-underline font-black text-slate-900 text-lg py-6 tracking-tight">Are comments and documentation included in LoC?</AccordionTrigger>
                        <AccordionContent className="pb-8 text-slate-500 font-medium leading-relaxed">
                            Yes. All characters committed to the codebase (excluding minified files and node_modules) are processed. AI-generated docstrings and inline comments contribute to the 'AI LoC' metric, as they represent tokens that the developer did not have to write manually.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>

            {/* Footer Info */}
            <div className="mt-16 p-8 rounded-[2rem] bg-indigo-50 border border-indigo-100 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                <div className="h-16 w-16 rounded-[1.25rem] bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xl">
                    <HelpCircle className="h-8 w-8" />
                </div>
                <div>
                    <h4 className="text-lg font-black text-slate-900 tracking-tight mb-1">Still have questions?</h4>
                    <p className="text-slate-500 font-medium">Reach out to the Engineering Excellence team or check the internal documentation for a deeper technical deep-dive into the data pipeline.</p>
                </div>
                <Button className="md:ml-auto h-12 px-8 rounded-xl font-black bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 flex items-center gap-2">
                    Contact Ops <Target className="h-4 w-4" />
                </Button>
            </div>
        </motion.div>
    );
}


