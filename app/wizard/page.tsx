"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { ArrowRight, Check, Briefcase, Plus } from "lucide-react";
import clsx from "clsx";

const useCases = [
    { id: "copilot", title: "Microsoft 365 Copilot", description: "Productivity assistant integration." },
    { id: "chatbot", title: "Open LLM Chatbot", description: "Customer-facing generic AI chatbot." },
    { id: "due-diligence", title: "Third-party Due Diligence", description: "Automated vendor risk assessment." },
    { id: "procurement", title: "Procurement Aide", description: "AI for analyzing supplier contracts." },
    { id: "finance", title: "Finance/Expense Monitoring", description: "AI for detecting expense anomalies." },
    { id: "custom", title: "Custom Use Case", description: "Define a new AI system from scratch." },
];

const questions = [
    {
        id: 1,
        title: "AI System Purpose",
        description: "What is the primary function of the AI system you are assessing?",
        placeholder: "e.g., Customer Service Chatbot, Resume Screening...",
    },
    {
        id: 2,
        title: "Data Sensitivity",
        description: "Does the system process any Personally Identifiable Information (PII)?",
        placeholder: "Yes/No, and describe the data...",
    },
    {
        id: 3,
        title: "Decision Impact",
        description: "Does the AI make decisions that significantly affect individuals (e.g., hiring, loans)?",
        placeholder: "Describe the decision-making process...",
    },
];

export default function WizardPage() {
    const [currentStep, setCurrentStep] = useState(0); // 0 = Use Case, 1 = Details, 2+ = Questions
    const [selectedUseCase, setSelectedUseCase] = useState<string | null>(null);
    const [details, setDetails] = useState({ toolName: "", department: "" });
    const [answers, setAnswers] = useState<Record<number, string>>({});

    // Total steps = 1 (Selection) + 1 (Details) + questions
    const totalSteps = 2 + questions.length;
    const progress = ((currentStep + 1) / totalSteps) * 100;

    const handleUseCaseSelect = (id: string) => {
        setSelectedUseCase(id);
    };

    const handleNext = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep((prev) => prev + 1);
        } else {
            // Submit logic here (mock)
            window.location.href = "/results";
        }
    };

    const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDetails({ ...details, [e.target.name]: e.target.value });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Adjust index: Step 0=Selection, Step 1=Details, Step 2=Question 0
        setAnswers({ ...answers, [currentStep - 2]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-zinc-50 pb-20">
            <Navbar />

            <div className="container mx-auto max-w-3xl px-4 pt-12">
                {/* Stepper */}
                <div className="mb-12">
                    <div className="mb-2 flex justify-between text-sm font-medium text-gray-500">
                        <span>Step {currentStep + 1} of {totalSteps}</span>
                        <span>{Math.round(progress)}% Completed</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <motion.div
                            className="h-full bg-canada-red"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                        />
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {currentStep === 0 ? (
                        /* Step 0: Use Case Selection */
                        <motion.div
                            key="step0"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className="mb-6 text-3xl font-bold text-gray-900">Select a Use Case</h2>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {useCases.map((useCase) => (
                                    <button
                                        key={useCase.id}
                                        onClick={() => handleUseCaseSelect(useCase.id)}
                                        className={clsx(
                                            "flex flex-col items-start rounded-xl border-2 p-6 text-left transition-all hover:shadow-md",
                                            selectedUseCase === useCase.id
                                                ? "border-canada-red bg-red-50 ring-2 ring-canada-red ring-offset-2"
                                                : "border-gray-200 bg-white hover:border-gray-300"
                                        )}
                                    >
                                        <div className={clsx("mb-3 rounded-full p-2", selectedUseCase === useCase.id ? "bg-white text-canada-red" : "bg-gray-100 text-gray-600")}>
                                            {useCase.id === 'custom' ? <Plus className="h-6 w-6" /> : <Briefcase className="h-6 w-6" />}
                                        </div>
                                        <h3 className="mb-1 font-bold text-gray-900">{useCase.title}</h3>
                                        <p className="text-sm text-gray-600">{useCase.description}</p>
                                    </button>
                                ))}
                            </div>
                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={handleNext}
                                    disabled={!selectedUseCase}
                                    className={clsx(
                                        "flex items-center gap-2 rounded-full px-8 py-3 text-lg font-bold text-white transition-all",
                                        selectedUseCase
                                            ? "bg-canada-red hover:bg-red-700 hover:shadow-lg"
                                            : "cursor-not-allowed bg-gray-300"
                                    )}
                                >
                                    Continue <ArrowRight className="h-5 w-5" />
                                </button>
                            </div>
                        </motion.div>
                    ) : currentStep === 1 ? (
                        /* Step 1: Details */
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="rounded-2xl bg-white p-8 shadow-xl"
                        >
                            <h2 className="mb-4 text-3xl font-bold text-gray-900">System Details</h2>
                            <p className="mb-8 text-lg text-gray-600">Tell us a bit more about the AI tool.</p>

                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="toolName" className="mb-2 block text-sm font-medium text-gray-700">AI Tool Name</label>
                                    <input
                                        type="text"
                                        name="toolName"
                                        id="toolName"
                                        value={details.toolName}
                                        onChange={handleDetailsChange}
                                        placeholder="e.g. ChatGPT Enterprise"
                                        className="w-full rounded-xl border-2 border-gray-200 px-6 py-4 text-lg outline-none transition-all focus:border-canada-red focus:ring-4 focus:ring-canada-red/10"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label htmlFor="department" className="mb-2 block text-sm font-medium text-gray-700">Department</label>
                                    <input
                                        type="text"
                                        name="department"
                                        id="department"
                                        value={details.department}
                                        onChange={handleDetailsChange}
                                        placeholder="e.g. Marketing"
                                        className="w-full rounded-xl border-2 border-gray-200 px-6 py-4 text-lg outline-none transition-all focus:border-canada-red focus:ring-4 focus:ring-canada-red/10"
                                    />
                                </div>
                            </div>

                            <div className="mt-8 flex items-center justify-end">
                                <button
                                    onClick={handleNext}
                                    disabled={!details.toolName || !details.department}
                                    className={clsx(
                                        "flex items-center gap-2 rounded-full px-8 py-3 text-lg font-bold text-white transition-all",
                                        details.toolName && details.department
                                            ? "bg-canada-red hover:bg-red-700 hover:shadow-lg"
                                            : "cursor-not-allowed bg-gray-300"
                                    )}
                                >
                                    Continue <ArrowRight className="h-5 w-5" />
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        /* Steps 2+: Questions */
                        <motion.div
                            key="questions"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="rounded-2xl bg-white p-8 shadow-xl"
                        >
                            <h2 className="mb-4 text-3xl font-bold text-gray-900">
                                {questions[currentStep - 2].title}
                            </h2>
                            <p className="mb-8 text-lg text-gray-600">
                                {questions[currentStep - 2].description}
                            </p>

                            <div className="mb-8">
                                <label className="sr-only" htmlFor="answer">
                                    Your Answer
                                </label>
                                <input
                                    type="text"
                                    id="answer"
                                    value={answers[currentStep - 2] || ""}
                                    onChange={handleInputChange}
                                    placeholder={questions[currentStep - 2].placeholder}
                                    className="w-full rounded-xl border-2 border-gray-200 px-6 py-4 text-lg outline-none transition-all focus:border-canada-red focus:ring-4 focus:ring-canada-red/10"
                                    autoFocus
                                />
                            </div>

                            <div className="flex items-center justify-end">
                                <button
                                    onClick={handleNext}
                                    disabled={!answers[currentStep - 2]}
                                    className={clsx(
                                        "flex items-center gap-2 rounded-full px-8 py-3 text-lg font-bold text-white transition-all",
                                        answers[currentStep - 2]
                                            ? "bg-canada-red hover:bg-red-700 hover:shadow-lg"
                                            : "cursor-not-allowed bg-gray-300"
                                    )}
                                >
                                    {currentStep === totalSteps - 1 ? "Calculate Risk" : "Save & Continue"}
                                    {currentStep === totalSteps - 1 ? (
                                        <Check className="h-5 w-5" />
                                    ) : (
                                        <ArrowRight className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
