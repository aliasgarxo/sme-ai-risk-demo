"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { isValidTextarea, isValidShortText, TEXTAREA_ERROR_MSG } from "@/lib/validation";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Briefcase,
  Plus,
  Loader2,
  AlertCircle,
} from "lucide-react";
import clsx from "clsx";
import { useRouter } from "next/navigation";

const USE_CASES = [
  { id: "copilot", title: "Microsoft 365 Copilot", description: "Productivity assistant integration." },
  { id: "chatbot", title: "Open LLM Chatbot", description: "Customer-facing generic AI chatbot." },
  { id: "due-diligence", title: "Third-party Due Diligence", description: "Automated vendor risk assessment." },
  { id: "procurement", title: "Procurement Aide", description: "AI for analysing supplier contracts." },
  { id: "finance", title: "Finance / Expense Monitoring", description: "AI for detecting expense anomalies." },
  { id: "custom", title: "Custom Use Case", description: "Define a new AI system from scratch." },
];

interface Question {
  id: string;
  field: string;
  title: string;
  description: string;
  placeholder: string;
  hint?: string;
}

const QUESTIONS: Question[] = [
  {
    id: "q1",
    field: "purpose",
    title: "AI System Purpose",
    description: "What is the primary function of the AI system you are assessing?",
    placeholder: "e.g., Automatically screen job applications and rank candidates for HR review.",
    hint: "Be specific — include what the AI does, not just the tool name.",
  },
  {
    id: "q2",
    field: "dataSensitivity",
    title: "Data Sensitivity",
    description: "What type of data does the AI system process? Does it handle Personally Identifiable Information (PII), financial records, or health data?",
    placeholder: "e.g., Yes — employee names, salaries, and performance scores (PII + financial data).",
    hint: "Include data categories (public, personal, sensitive, special category) and approximate volume if known.",
  },
  {
    id: "q3",
    field: "decisionImpact",
    title: "Decision Impact",
    description: "Does the AI make or significantly influence decisions that affect individuals, contracts, or finances? What happens as a result of its outputs?",
    placeholder: "e.g., Candidate scores influence which applicants are interviewed. A score below 60 automatically rejects the application.",
    hint: "High-impact decisions include hiring, loans, health recommendations, pricing, or contract awards.",
  },
  {
    id: "q4",
    field: "humanOversight",
    title: "Human Oversight",
    description: "How much human review or control exists over the AI's outputs? Can humans override or challenge the AI's decisions?",
    placeholder: "e.g., HR manager reviews the top 10 ranked candidates but does not see the full ranked list or scores.",
    hint: "Describe the actual process — not the intended policy. Who reviews, when, and what authority do they have?",
  },
  {
    id: "q5",
    field: "transparency",
    title: "Transparency & Disclosure",
    description: "Are users, customers, or employees informed that AI is being used? Is the system's decision logic documented and explainable?",
    placeholder: "e.g., Candidates are not told AI screens applications. The model is a third-party black box — vendor provides no explanation for scores.",
    hint: "Consider both external disclosure (to those affected) and internal documentation (for staff operating the system).",
  },
  {
    id: "q6",
    field: "errorConsequence",
    title: "Consequence of Errors",
    description: "What happens if the AI makes a wrong decision? What is the worst-case impact of a system error or failure?",
    placeholder: "e.g., A qualified candidate could be wrongly rejected. A vendor could be paid incorrectly. Reputational and legal risk to the company.",
    hint: "Think about financial loss, legal liability, harm to individuals, reputational damage, and operational disruption.",
  },
  {
    id: "q7",
    field: "thirdPartySharing",
    title: "Third-Party & Data Sharing",
    description: "Is data shared with external vendors, cloud platforms, or third-party AI providers? Where is data stored and processed?",
    placeholder: "e.g., Data is uploaded to a US-based SaaS platform. The vendor's sub-processors are not disclosed.",
    hint: "List the key external parties, data residency (Canada, US, EU), and whether a data processing agreement (DPA) exists.",
  },
  {
    id: "q8",
    field: "geographicScope",
    title: "Geographic Scope & Compliance Context",
    description: "Where does your organisation operate, and which privacy or AI regulations apply to this use case?",
    placeholder: "e.g., Canadian SME with customers in Ontario. Subject to PIPEDA and Ontario's municipal procurement rules.",
    hint: "Include relevant laws: PIPEDA, Quebec Law 25, EU AI Act (if exporting to EU), GDPR, sector-specific rules.",
  },
];

type StepType = "use-case" | "details" | "question" | "processing";

export default function WizardPage() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<number>(0);
  // 0 = use-case, 1 = details, 2–9 = questions, 10 = processing
  const [selectedUseCase, setSelectedUseCase] = useState<string | null>(null);
  const [details, setDetails] = useState({ toolName: "", department: "" });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const totalSteps = 2 + QUESTIONS.length; // 0-9
  const progress = ((currentStep + 1) / (totalSteps + 1)) * 100;

  const currentQuestion = currentStep >= 2 ? QUESTIONS[currentStep - 2] : null;

  const canProceed = (): boolean => {
    if (currentStep === 0) return !!selectedUseCase;
    if (currentStep === 1) return isValidShortText(details.toolName) && isValidShortText(details.department);
    if (currentQuestion) return isValidTextarea(answers[currentQuestion.field] ?? "");
    return false;
  };

  const handleNext = async () => {
    setErrorMsg(null);

    if (currentQuestion && !isValidTextarea(answers[currentQuestion.field] ?? "")) {
      setErrorMsg(TEXTAREA_ERROR_MSG);
      return;
    }

    if (!canProceed()) return;

    if (currentStep < totalSteps - 1) {
      setCurrentStep((p) => p + 1);
      return;
    }

    // Final step — submit
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        useCase: selectedUseCase,
        toolName: details.toolName,
        department: details.department,
        ...answers,
      };

      const res = await fetch("/api/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Assessment failed. Please try again.");
      }

      // Store result in localStorage for results page
      const stored = JSON.parse(localStorage.getItem("assessments") || "[]");
      stored.unshift(data.result);
      localStorage.setItem("assessments", JSON.stringify(stored));
      localStorage.setItem("latestAssessment", JSON.stringify(data.result));

      router.push(`/results?id=${data.result.id}`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((p) => p - 1);
  };

  const stepLabel =
    currentStep === 0
      ? "Select Use Case"
      : currentStep === 1
      ? "System Details"
      : `Question ${currentStep - 1} of ${QUESTIONS.length}`;

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      <Navbar />

      <div className="container mx-auto max-w-3xl px-4 pt-12">
        {/* Progress bar */}
        <div className="mb-10">
          <div className="mb-2 flex justify-between text-sm font-medium text-gray-500">
            <span>{stepLabel}</span>
            <span>{Math.round(progress)}% Completed</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <motion.div
              className="h-full bg-canada-red"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* ── Step 0: Use Case Selection ── */}
          {currentStep === 0 && (
            <motion.div
              key="step-use-case"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="mb-2 text-3xl font-bold text-gray-900">Select a Use Case</h2>
              <p className="mb-6 text-gray-500">
                Choose the category that best describes the AI system you are assessing.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {USE_CASES.map((uc) => (
                  <button
                    key={uc.id}
                    onClick={() => setSelectedUseCase(uc.id)}
                    className={clsx(
                      "flex flex-col items-start rounded-xl border-2 p-6 text-left transition-all hover:shadow-md",
                      selectedUseCase === uc.id
                        ? "border-canada-red bg-red-50 ring-2 ring-canada-red ring-offset-2"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    )}
                  >
                    <div
                      className={clsx(
                        "mb-3 rounded-full p-2",
                        selectedUseCase === uc.id
                          ? "bg-white text-canada-red"
                          : "bg-gray-100 text-gray-600"
                      )}
                    >
                      {uc.id === "custom" ? (
                        <Plus className="h-6 w-6" />
                      ) : (
                        <Briefcase className="h-6 w-6" />
                      )}
                    </div>
                    <h3 className="mb-1 font-bold text-gray-900">{uc.title}</h3>
                    <p className="text-sm text-gray-600">{uc.description}</p>
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
          )}

          {/* ── Step 1: System Details ── */}
          {currentStep === 1 && (
            <motion.div
              key="step-details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl bg-white p-8 shadow-xl"
            >
              <h2 className="mb-2 text-3xl font-bold text-gray-900">System Details</h2>
              <p className="mb-8 text-gray-600">
                Identify the AI tool and where it is used in your organisation.
              </p>
              <div className="space-y-6">
                <div>
                  <label htmlFor="toolName" className="mb-2 block text-sm font-semibold text-gray-700">
                    AI Tool / System Name
                  </label>
                  <input
                    type="text"
                    id="toolName"
                    value={details.toolName}
                    onChange={(e) => setDetails({ ...details, toolName: e.target.value })}
                    placeholder="e.g., ChatGPT Enterprise, GitHub Copilot, HireVue"
                    className="w-full rounded-xl border-2 border-gray-200 px-6 py-4 text-lg outline-none transition-all focus:border-canada-red focus:ring-4 focus:ring-canada-red/10"
                    autoFocus
                  />
                </div>
                <div>
                  <label htmlFor="department" className="mb-2 block text-sm font-semibold text-gray-700">
                    Department / Business Unit
                  </label>
                  <input
                    type="text"
                    id="department"
                    value={details.department}
                    onChange={(e) => setDetails({ ...details, department: e.target.value })}
                    placeholder="e.g., Human Resources, Finance, Customer Service"
                    className="w-full rounded-xl border-2 border-gray-200 px-6 py-4 text-lg outline-none transition-all focus:border-canada-red focus:ring-4 focus:ring-canada-red/10"
                  />
                </div>
              </div>
              <div className="mt-8 flex items-center justify-between">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 rounded-full px-6 py-3 text-gray-600 transition-colors hover:text-gray-900"
                >
                  <ArrowLeft className="h-5 w-5" /> Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className={clsx(
                    "flex items-center gap-2 rounded-full px-8 py-3 text-lg font-bold text-white transition-all",
                    canProceed()
                      ? "bg-canada-red hover:bg-red-700 hover:shadow-lg"
                      : "cursor-not-allowed bg-gray-300"
                  )}
                >
                  Continue <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Steps 2–9: Questions ── */}
          {currentStep >= 2 && currentQuestion && !isSubmitting && (
            <motion.div
              key={`q-${currentQuestion.id}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl bg-white p-8 shadow-xl"
            >
              <div className="mb-6">
                <span className="mb-3 inline-block rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-canada-red">
                  Question {currentStep - 1} of {QUESTIONS.length}
                </span>
                <h2 className="mb-3 text-2xl font-bold text-gray-900">
                  {currentQuestion.title}
                </h2>
                <p className="text-gray-600">{currentQuestion.description}</p>
              </div>

              <textarea
                rows={4}
                value={answers[currentQuestion.field] || ""}
                onChange={(e) =>
                  setAnswers({ ...answers, [currentQuestion.field]: e.target.value })
                }
                placeholder={currentQuestion.placeholder}
                className="w-full resize-none rounded-xl border-2 border-gray-200 px-6 py-4 text-base outline-none transition-all focus:border-canada-red focus:ring-4 focus:ring-canada-red/10"
                autoFocus
              />

              {currentQuestion.hint && (
                <p className="mt-2 text-sm text-gray-400">
                  <span className="font-medium">Tip:</span> {currentQuestion.hint}
                </p>
              )}

              {errorMsg && (
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {errorMsg}
                </div>
              )}

              <div className="mt-8 flex items-center justify-between">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 rounded-full px-6 py-3 text-gray-600 transition-colors hover:text-gray-900"
                >
                  <ArrowLeft className="h-5 w-5" /> Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className={clsx(
                    "flex items-center gap-2 rounded-full px-8 py-3 text-lg font-bold text-white transition-all",
                    canProceed()
                      ? "bg-canada-red hover:bg-red-700 hover:shadow-lg"
                      : "cursor-not-allowed bg-gray-300"
                  )}
                >
                  {currentStep === totalSteps - 1 ? (
                    <>
                      Run Assessment <Check className="h-5 w-5" />
                    </>
                  ) : (
                    <>
                      Save & Continue <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Processing state ── */}
          {isSubmitting && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center rounded-2xl bg-white p-12 text-center shadow-xl"
            >
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
                <Loader2 className="h-10 w-10 animate-spin text-canada-red" />
              </div>
              <h2 className="mb-3 text-2xl font-bold text-gray-900">Running AI Assessment</h2>
              <p className="max-w-md text-gray-500">
                Our agents are analysing your AI system against NIST AI RMF and ISO 42001 standards.
                This usually takes 20–40 seconds.
              </p>
              <div className="mt-8 space-y-2 text-left w-full max-w-sm">
                {[
                  "Orchestrator validating inputs...",
                  "Risk Assessor scoring criteria...",
                  "Controls Advisor generating recommendations...",
                  "Guidance Writer preparing summary...",
                ].map((label, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin text-canada-red" />
                    {label}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
