"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Brain } from "lucide-react";
import clsx from "clsx";
import ReactMarkdown from "react-markdown";

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
};

export function AdminCopilot() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        setHasStarted(true);
        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: inputValue,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue("");
        setIsTyping(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: userMessage.content }),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch response");
            }

            const data = await response.json();

            let aiText = "Sorry, I couldn't process that response.";
            try {
                aiText = data.outputs[0].outputs[0].results.message.text;
            } catch (e) {
                console.error("Error parsing LangFlow response:", e);
                if (data.result) aiText = data.result;
            }

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: aiText,
            };

            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            console.error("Chat Error:", error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "Sorry, I'm having trouble connecting to the AI agent right now.",
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="relative flex min-h-[500px] flex-col overflow-hidden rounded-3xl bg-gradient-to-b from-white via-red-50/30 to-white shadow-sm border border-gray-100">

            {/* Greeting (Hidden after start) */}
            <AnimatePresence>
                {!hasStarted && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10"
                    >
                        <div className="mb-6 rounded-full bg-gradient-to-br from-canada-red to-red-600 p-4 shadow-lg shadow-red-200">
                            <Sparkles className="h-8 w-8 text-white animate-pulse" />
                        </div>
                        <h2 className="mb-2 text-4xl font-light text-gray-900">
                            Good Morning, Admin.
                        </h2>
                        <h2 className="mb-8 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-canada-red to-red-700">
                            Ready to mitigate risks?
                        </h2>

                        <div className="flex flex-wrap justify-center gap-3">
                            {[
                                "Summarize Risks",
                                "Check ISO Gaps",
                                "Draft Compliance Report",
                                "Analyze New Regulations"
                            ].map((chip) => (
                                <button
                                    key={chip}
                                    onClick={() => {
                                        setInputValue(chip);
                                        // Optional: Auto-send or just populate
                                    }}
                                    className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition-all hover:border-canada-red hover:text-canada-red hover:shadow-md"
                                >
                                    {chip}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Area */}
            <div className={clsx("flex-1 overflow-y-auto p-8 transition-all duration-500", !hasStarted ? "opacity-0 pointer-events-none" : "opacity-100")}>
                <div className="mx-auto flex max-w-3xl flex-col gap-6">
                    {messages.map((msg) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={msg.id}
                            className={clsx(
                                "flex gap-4",
                                msg.role === "user" ? "flex-row-reverse" : "flex-row"
                            )}
                        >
                            <div className={clsx(
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                                msg.role === "user" ? "bg-gray-900" : "bg-gradient-to-br from-canada-red to-red-600"
                            )}>
                                {msg.role === "user" ? <div className="h-2 w-2 rounded-full bg-white" /> : <Sparkles className="h-4 w-4 text-white" />}
                            </div>
                            <div className={clsx(
                                "rounded-2xl px-6 py-4 shadow-sm max-w-[80%]",
                                msg.role === "user" ? "bg-white text-gray-900" : "bg-white/80 backdrop-blur-sm border border-red-50"
                            )}>
                                {msg.role === "assistant" ? (
                                    <ReactMarkdown
                                        components={{
                                            strong: ({ node, ...props }) => <span className="font-bold text-red-700" {...props} />,
                                            ul: ({ node, ...props }) => <ul className="list-disc space-y-1 pl-5" {...props} />,
                                            ol: ({ node, ...props }) => <ol className="list-decimal space-y-1 pl-5" {...props} />,
                                            a: ({ node, ...props }) => <a className="text-blue-600 underline hover:text-red-600" {...props} />,
                                            p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                        }}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>
                                ) : (
                                    msg.content
                                )}
                            </div>
                        </motion.div>
                    ))}
                    {isTyping && (
                        <div className="flex gap-4">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-canada-red to-red-600">
                                <Sparkles className="h-4 w-4 text-white" />
                            </div>
                            <div className="rounded-2xl bg-white/80 px-6 py-4 shadow-sm border border-red-50">
                                <span className="animate-pulse text-gray-400">Thinking...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="p-8 pt-0 z-20">
                <div className="mx-auto max-w-3xl relative">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSend();
                        }}
                        className="relative flex items-center"
                    >
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Ask anything about your AI governance..."
                            className="w-full rounded-full border-0 bg-white py-4 pl-6 pr-14 text-lg shadow-2xl shadow-red-900/5 outline-none ring-1 ring-gray-100 transition-all focus:ring-2 focus:ring-canada-red/20 placeholder:text-gray-400"
                        />
                        <button
                            type="submit"
                            disabled={!inputValue.trim() || isTyping}
                            className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-full bg-canada-red text-white transition-all hover:bg-red-700 disabled:opacity-50 disabled:hover:bg-canada-red"
                        >
                            <Send className="h-5 w-5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
