import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/app-store";
import { chatEngine, generateId, type ChatMessage } from "@/lib/chat-engine";
import { cn } from "@/lib/utils";
import {
    MessageCircle, X, Send, Bot, User, Sparkles,
    Compass, BarChart3, Lightbulb, ShieldAlert,
    Loader2, Trash2, ChevronDown
} from "lucide-react";

const CATEGORY_CONFIG = {
    navigation: { icon: Compass, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200", label: "Navigation" },
    data: { icon: BarChart3, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200", label: "Data" },
    domain: { icon: Lightbulb, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200", label: "Insight" },
    "out-of-scope": { icon: ShieldAlert, color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-200", label: "Out of Scope" },
};

const ROLE_SUGGESTIONS: Record<string, string[]> = {
    Admin: [
        "What's the overall AI code percentage?",
        "Which team has the highest AI adoption?",
        "Where do I find merge analytics?",
        "Show me AI tools breakdown",
        "What is the manual code percentage?",
    ],
    Manager: [
        "How is my team performing?",
        "Who are my top engineers?",
        "What AI tools does my team use?",
        "What's our team merge rate?",
        "Where can I see team repos?",
    ],
    Developer: [
        "What are my stats?",
        "What's my AI code percentage?",
        "How many commits do I have?",
        "Where do I find the glossary?",
        "What does merge rate mean?",
    ],
};

function formatMarkdown(text: string): string {
    // Simple markdown formatting: bold, inline code, line breaks
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`(.*?)`/g, '<code class="px-1 py-0.5 bg-slate-100 rounded text-[11px] font-mono">$1</code>')
        .replace(/\n/g, '<br/>');
}

export function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { currentRole, developerUserId, managerUserId, managerTeamId } = useAppStore();

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Reset chat when role changes
    useEffect(() => {
        setMessages([]);
        setShowSuggestions(true);
        chatEngine.clearSummary();
    }, [currentRole]);

    const sendMessage = async (text?: string) => {
        const messageText = text || input.trim();
        if (!messageText || isLoading) return;

        const userMessage: ChatMessage = {
            id: generateId(),
            role: "user",
            content: messageText,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);
        setShowSuggestions(false);

        try {
            const userId = currentRole === "Developer" ? developerUserId : currentRole === "Manager" ? managerUserId : undefined;
            const teamId = currentRole === "Manager" ? managerTeamId : undefined;

            const response = await chatEngine.sendMessage(
                messageText,
                currentRole,
                userId,
                teamId,
                messages
            );

            setMessages(prev => [...prev, response]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, {
                id: generateId(),
                role: "assistant",
                content: "Sorry, I encountered an error. Please make sure the remote server is running.",
                timestamp: new Date(),
                category: "domain",
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const clearChat = () => {
        setMessages([]);
        setShowSuggestions(true);
        chatEngine.clearSummary();
    };

    const roleConfig = {
        Admin: { color: "from-indigo-500 to-purple-600", badge: "🛡️ Admin", borderColor: "border-indigo-200", accentColor: "indigo" },
        Manager: { color: "from-blue-500 to-cyan-600", badge: "👥 Manager", borderColor: "border-blue-200", accentColor: "blue" },
        Developer: { color: "from-emerald-500 to-teal-600", badge: "👤 Developer", borderColor: "border-emerald-200", accentColor: "emerald" },
    };

    const config = roleConfig[currentRole] || roleConfig.Admin;
    const suggestions = ROLE_SUGGESTIONS[currentRole] || ROLE_SUGGESTIONS.Admin;

    return (
        <>
            {/* Floating Chat Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1, boxShadow: "0 20px 40px rgba(99,102,241,0.3)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpen(true)}
                        className={cn(
                            "fixed bottom-8 right-8 z-[100] h-16 w-16 rounded-2xl bg-gradient-to-br shadow-2xl",
                            "flex items-center justify-center text-white transition-all",
                            config.color
                        )}
                    >
                        <MessageCircle className="h-7 w-7" />
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.9 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-8 right-8 z-[100] w-[420px] h-[640px] rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className={cn("px-6 py-4 bg-gradient-to-r text-white relative overflow-hidden", config.color)}>
                            <div className="absolute -top-10 -right-10 h-24 w-24 bg-white/10 rounded-full blur-xl" />
                            <div className="relative z-10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                        <Bot className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black tracking-tight">AI Code Insights Assistant</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-bold uppercase tracking-widest opacity-80">{config.badge} Mode</span>
                                            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={clearChat}
                                        className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                        title="Clear chat"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {/* Welcome Message */}
                            {messages.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4"
                                >
                                    <div className="flex gap-3">
                                        <div className={cn("h-8 w-8 rounded-lg flex-shrink-0 flex items-center justify-center bg-gradient-to-br text-white text-xs", config.color)}>
                                            <Sparkles className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 p-4 rounded-2xl rounded-tl-md bg-slate-50 border border-slate-100">
                                            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                                                Hi! I'm <strong>AI Code Insights Assistant</strong>. I can help you with:
                                            </p>
                                            <div className="mt-3 space-y-2">
                                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                                    <Compass className="h-3.5 w-3.5 text-blue-500" />
                                                    <span><strong>Navigate</strong> — "Where do I find X?"</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                                    <BarChart3 className="h-3.5 w-3.5 text-emerald-500" />
                                                    <span><strong>Data</strong> — "What's the AI code %?"</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                                    <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                                                    <span><strong>Concepts</strong> — "What does merge rate mean?"</span>
                                                </div>
                                            </div>
                                            {currentRole !== "Admin" && (
                                                <p className="mt-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                    🔒 {currentRole === "Developer" ? "You can only ask about your own data" : "You can only ask about your team's data"}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Suggestion Chips */}
                                    {showSuggestions && (
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Try asking:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {suggestions.map((s, i) => (
                                                    <motion.button
                                                        key={i}
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: i * 0.05 }}
                                                        onClick={() => sendMessage(s)}
                                                        className="text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-slate-100 transition-all active:scale-95"
                                                    >
                                                        {s}
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* Message Bubbles */}
                            {messages.map((message, idx) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className={cn("flex gap-3", message.role === "user" ? "flex-row-reverse" : "")}
                                >
                                    {/* Avatar */}
                                    {message.role === "user" ? (
                                        <div className={cn("h-8 w-8 rounded-lg flex-shrink-0 flex items-center justify-center bg-gradient-to-br text-white text-xs font-bold", config.color)}>
                                            <User className="h-4 w-4" />
                                        </div>
                                    ) : (
                                        <div className="h-8 w-8 rounded-lg flex-shrink-0 flex items-center justify-center bg-slate-900 text-white text-xs">
                                            <Bot className="h-4 w-4" />
                                        </div>
                                    )}

                                    {/* Bubble */}
                                    <div className={cn(
                                        "max-w-[80%] p-3.5 rounded-2xl",
                                        message.role === "user"
                                            ? `bg-gradient-to-br ${config.color} text-white rounded-tr-md`
                                            : "bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-tl-md"
                                    )}>
                                        {/* Category Badge */}
                                        {message.role === "assistant" && message.category && (
                                            <div className="mb-2">
                                                {(() => {
                                                    const cat = CATEGORY_CONFIG[message.category];
                                                    const Icon = cat.icon;
                                                    return (
                                                        <span className={cn("inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border", cat.bg, cat.color, cat.border)}>
                                                            <Icon className="h-3 w-3" />
                                                            {cat.label}
                                                        </span>
                                                    );
                                                })()}
                                            </div>
                                        )}
                                        <div
                                            className={cn(
                                                "text-sm leading-relaxed font-medium",
                                                message.role === "user" ? "text-white" : "text-slate-700 dark:text-slate-300"
                                            )}
                                            dangerouslySetInnerHTML={{ __html: formatMarkdown(message.content) }}
                                        />
                                        <p className={cn(
                                            "text-[9px] mt-2 font-bold",
                                            message.role === "user" ? "text-white/50" : "text-slate-300"
                                        )}>
                                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Loading Indicator */}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex gap-3"
                                >
                                    <div className="h-8 w-8 rounded-lg flex-shrink-0 flex items-center justify-center bg-slate-900 text-white">
                                        <Bot className="h-4 w-4" />
                                    </div>
                                    <div className="p-4 rounded-2xl rounded-tl-md bg-slate-50 border border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                                            <span className="text-xs text-slate-400 font-bold">Thinking...</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-slate-100 bg-white/80 backdrop-blur-sm">
                            <div className="flex items-center gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={`Ask about ${currentRole === "Developer" ? "your metrics" : currentRole === "Manager" ? "your team" : "the organization"}...`}
                                    disabled={isLoading}
                                    className="flex-1 h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all disabled:opacity-50"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => sendMessage()}
                                    disabled={!input.trim() || isLoading}
                                    className={cn(
                                        "h-11 w-11 rounded-xl flex items-center justify-center text-white transition-all shadow-lg",
                                        input.trim() && !isLoading
                                            ? `bg-gradient-to-br ${config.color} hover:shadow-xl`
                                            : "bg-slate-200 text-slate-400 shadow-none cursor-not-allowed"
                                    )}
                                >
                                    <Send className="h-4 w-4" />
                                </motion.button>
                            </div>
                            <p className="text-[9px] text-slate-400 font-medium text-center mt-2">
                                Powered by <strong>Remote API</strong> — Remote AI inference
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
