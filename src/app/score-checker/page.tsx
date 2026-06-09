"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
  Upload, 
  Link2, 
  CheckCircle2, 
  ArrowRight, 
  AlertCircle, 
  Check, 
  X, 
  Share2, 
  CornerDownRight, 
  FileText, 
  HelpCircle,
  Flag,
  RotateCcw
} from "lucide-react";

// Types corresponding to backend schemas
interface BreakdownItem {
  question_id: string;
  student_answer: string | null;
  correct_answer: string | string[];
  status: "correct" | "wrong" | "unattempted";
  marks_awarded: number;
}

interface ScoreResult {
  score: number;
  correct: number;
  wrong: number;
  unattempted: number;
  max_possible: number;
  breakdown: BreakdownItem[];
  warning?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

export default function ScoreCheckerPage() {
  const [currentScreen, setCurrentScreen] = useState<"input" | "results">("input");
  
  // Input Files & URL States
  const [responseFile, setResponseFile] = useState<File | null>(null);
  const [answerKeyFile, setAnswerKeyFile] = useState<File | null>(null);
  const [ntaUrl, setNtaUrl] = useState("");
  const [responsesJson, setResponsesJson] = useState<Record<string, string | null> | null>(null);
  
  // URL Input Tab: "pdf" | "url"
  const [responseType, setResponseType] = useState<"pdf" | "url">("pdf");
  
  // Loading & Progress Steps
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(1);
  const [loadingText, setLoadingText] = useState("");
  
  // Error States
  const [responseError, setResponseError] = useState<string | null>(null);
  const [answerKeyError, setAnswerKeyError] = useState<string | null>(null);
  const [calculateError, setCalculateError] = useState<string | null>(null);
  const [urlFetchLoading, setUrlFetchLoading] = useState(false);

  // Drag over states
  const [dragOverResponse, setDragOverResponse] = useState(false);
  const [dragOverAnswerKey, setDragOverAnswerKey] = useState(false);

  // Result States
  const [resultData, setResultData] = useState<ScoreResult | null>(null);
  const [tableFilter, setTableFilter] = useState<"all" | "correct" | "wrong" | "unattempted">("all");
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [showShareToast, setShowShareToast] = useState(false);

  // Reset all states
  const handleReset = () => {
    setCurrentScreen("input");
    setResponseFile(null);
    setAnswerKeyFile(null);
    setNtaUrl("");
    setResponsesJson(null);
    setResponseType("pdf");
    setResponseError(null);
    setAnswerKeyError(null);
    setCalculateError(null);
    setResultData(null);
    setFlaggedQuestions(new Set());
  };

  // URL paste change handler
  const handleUrlChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setNtaUrl(url);
    setResponseError(null);
    setResponsesJson(null);
    
    if (!url) return;
    
    // Auto-fetch if it looks like a URL
    if (url.startsWith("http://") || url.startsWith("https://")) {
      setUrlFetchLoading(true);
      try {
        const res = await fetch(`${API_BASE}/fetch-url`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url }),
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.detail || "Failed to fetch response sheet from URL.");
        }
        
        // Extract student responses from the backend ScoreResult response sheet data format
        const extractedResponses: Record<string, string | null> = {};
        if (data.breakdown) {
          data.breakdown.forEach((item: BreakdownItem) => {
            extractedResponses[item.question_id] = item.student_answer;
          });
        }
        setResponsesJson(extractedResponses);
        setResponseError(null);
      } catch (err: unknown) {
        const error = err as Error;
        setResponseError(error.message || "The NTA portal requires you to be logged in. Please download the PDF instead.");
        setResponsesJson(null);
      } finally {
        setUrlFetchLoading(false);
      }
    } else {
      setResponseError("Please enter a valid HTTP/HTTPS NTA response sheet URL.");
    }
  };

  // Drag-and-drop helpers
  const handleDragOver = (e: React.DragEvent, type: "response" | "answer") => {
    e.preventDefault();
    if (type === "response") setDragOverResponse(true);
    else setDragOverAnswerKey(true);
  };

  const handleDragLeave = (type: "response" | "answer") => {
    if (type === "response") setDragOverResponse(false);
    else setDragOverAnswerKey(false);
  };

  const validateAndSetFile = (file: File, type: "response" | "answer") => {
    const isResponse = type === "response";
    const setError = isResponse ? setResponseError : setAnswerKeyError;
    const setFile = isResponse ? setResponseFile : setAnswerKeyFile;

    setError(null);

    // Validate size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError("This file is too large for a standard NTA response sheet. Please upload only the response PDF.");
      return;
    }

    // Validate format (must be PDF)
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      setError("We couldn't read this PDF. Try downloading a fresh copy from the NTA portal.");
      return;
    }

    setFile(file);
  };

  const handleDrop = (e: React.DragEvent, type: "response" | "answer") => {
    e.preventDefault();
    handleDragLeave(type);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0], type);
    }
  };

  const triggerCalculate = async () => {
    setLoading(true);
    setCalculateError(null);
    setLoadingStep(1);
    setLoadingText("Reading your PDFs...");

    // Simulate Step 1 animation
    await new Promise((resolve) => setTimeout(resolve, 800));

    setLoadingStep(2);
    setLoadingText("Matching answers...");

    const formData = new FormData();
    
    // Add response sheet (either file or JSON blob from URL)
    if (responseType === "pdf" && responseFile) {
      formData.append("response_sheet", responseFile);
    } else if (responseType === "url" && responsesJson) {
      const jsonBlob = new Blob([JSON.stringify(responsesJson)], { type: "application/json" });
      formData.append("response_sheet", jsonBlob, "responses.json");
    } else {
      setCalculateError("Missing response sheet details.");
      setLoading(false);
      return;
    }

    // Add answer key
    if (answerKeyFile) {
      formData.append("answer_key", answerKeyFile);
    } else {
      setCalculateError("Missing answer key PDF.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/parse-pdf`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "No question data found. Make sure you're uploading the NTA response sheet, not an admit card or other document.");
      }

      setResultData(data);

      setLoadingStep(3);
      setLoadingText("Done! ✓");

      // Give 600ms to see the completion tick
      await new Promise((resolve) => setTimeout(resolve, 600));
      setCurrentScreen("results");
    } catch (err: unknown) {
      const error = err as Error;
      const msg = error.message || "";
      if (msg.startsWith("response_sheet:")) {
        setResponseError(msg.replace("response_sheet:", "").trim());
      } else if (msg.startsWith("answer_key:")) {
        setAnswerKeyError(msg.replace("answer_key:", "").trim());
      } else {
        setCalculateError(msg || "An error occurred during score calculation. Please verify your files.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Checkbox status trackers
  const isResponseReady = responseType === "pdf" ? !!responseFile : (!!responsesJson && !urlFetchLoading);
  const isAnswerKeyReady = !!answerKeyFile;
  const canCalculate = isResponseReady && isAnswerKeyReady && !loading;

  // Toggle Flag Question
  const toggleFlag = (qid: string) => {
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(qid)) {
        next.delete(qid);
      } else {
        next.add(qid);
      }
      return next;
    });
  };

  // Copy share message to clipboard
  const handleShare = () => {
    if (!resultData) return;
    const shareText = `I scored ${resultData.score} in CUET 2026! Check yours at duseva.com/score-checker`;
    navigator.clipboard.writeText(shareText).then(() => {
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F9FAFB] flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white relative overflow-hidden">
      <Navbar />

      {/* Decorative ambient gradient backdrop */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/5 blur-[120px] mix-blend-screen" />
      </div>

      <main className="flex-1 relative z-10 pt-28 pb-20 px-4 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {currentScreen === "input" ? (
            <motion.div
              key="input-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-10"
            >
              {/* Header */}
              <div className="text-center space-y-4 max-w-2xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
                  CUET Score Calculator
                </h1>
                <p className="text-[#9CA3AF] text-lg font-medium">
                  Upload your NTA response sheet + answer key to instantly see your score
                </p>
              </div>

              {/* Cards Container */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* CARD 1 — Response Sheet */}
                <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 flex flex-col h-full space-y-5 shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-400 text-sm">1</span>
                      Your Response Sheet
                    </h2>
                    {isResponseReady && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                  </div>

                  {/* Tabs */}
                  <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                    <button
                      onClick={() => { setResponseType("pdf"); setResponseError(null); }}
                      className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all ${
                        responseType === "pdf" 
                          ? "bg-[#1C1C1C] text-white shadow-md" 
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Upload PDF
                    </button>
                    <button
                      onClick={() => { setResponseType("url"); setResponseError(null); }}
                      className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all ${
                        responseType === "url" 
                          ? "bg-[#1C1C1C] text-white shadow-md" 
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Paste URL
                    </button>
                  </div>

                  {/* Tab Contents */}
                  <div className="flex-1 flex flex-col justify-center min-h-[180px]">
                    {responseType === "pdf" ? (
                      <div
                        onDragOver={(e) => handleDragOver(e, "response")}
                        onDragLeave={() => handleDragLeave("response")}
                        onDrop={(e) => handleDrop(e, "response")}
                        className={`group relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 ${
                          dragOverResponse 
                            ? "border-indigo-500 bg-indigo-500/5 scale-[1.01]" 
                            : "border-white/10 bg-[#1C1C1C] hover:border-indigo-500/50 hover:scale-[1.01]"
                        }`}
                        onClick={() => document.getElementById("responseFileInput")?.click()}
                      >
                        <input
                          id="responseFileInput"
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              validateAndSetFile(e.target.files[0], "response");
                            }
                          }}
                        />
                        {responseFile ? (
                          <div className="space-y-2">
                            <FileText className="w-10 h-10 text-indigo-400 mx-auto" />
                            <p className="text-sm font-semibold text-white max-w-[200px] truncate mx-auto">
                              {responseFile.name}
                            </p>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">
                              <Check className="w-3.5 h-3.5" /> PDF Loaded
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="p-3 bg-white/5 rounded-full w-12 h-12 flex items-center justify-center mx-auto group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-all">
                              <Upload className="w-6 h-6 text-gray-400 group-hover:text-indigo-400" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">Drag & drop your PDF here</p>
                              <p className="text-xs text-gray-400 mt-1">or click to browse local files</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Paste your NTA response page URL"
                            value={ntaUrl}
                            onChange={handleUrlChange}
                            className="w-full bg-[#1C1C1C] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-500"
                          />
                          {urlFetchLoading && (
                            <div className="absolute right-3 top-3.5 w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                          )}
                        </div>
                        {responsesJson && (
                          <div className="flex items-center gap-2 text-green-400 text-xs font-bold bg-green-500/10 p-2.5 rounded-lg border border-green-500/20">
                            <Check className="w-4 h-4 shrink-0" />
                            <span>Successfully fetched {Object.keys(responsesJson).length} responses!</span>
                          </div>
                        )}
                        <p className="text-xs text-gray-400 flex items-start gap-1.5 leading-relaxed">
                          <Link2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                          <span>Log in to <a href="https://cuet.nta.nic.in" target="_blank" rel="noreferrer" className="text-indigo-400 underline hover:text-indigo-300">cuet.nta.nic.in</a> → View Question Paper → copy the page URL</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Inline Error */}
                  {responseError && (
                    <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3.5 text-red-400 text-xs leading-relaxed animate-shake">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{responseError}</span>
                    </div>
                  )}
                </div>

                {/* CARD 2 — Official Answer Key */}
                <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 flex flex-col h-full space-y-5 shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-400 text-sm">2</span>
                      Official Answer Key
                    </h2>
                    {isAnswerKeyReady && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                  </div>

                  <div className="flex-1 flex flex-col justify-center min-h-[180px]">
                    <div
                      onDragOver={(e) => handleDragOver(e, "answer")}
                      onDragLeave={() => handleDragLeave("answer")}
                      onDrop={(e) => handleDrop(e, "answer")}
                      className={`group relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 ${
                        dragOverAnswerKey 
                          ? "border-indigo-500 bg-indigo-500/5 scale-[1.01]" 
                          : "border-white/10 bg-[#1C1C1C] hover:border-indigo-500/50 hover:scale-[1.01]"
                      }`}
                      onClick={() => document.getElementById("answerKeyFileInput")?.click()}
                    >
                      <input
                        id="answerKeyFileInput"
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            validateAndSetFile(e.target.files[0], "answer");
                          }
                        }}
                      />
                      {answerKeyFile ? (
                        <div className="space-y-2">
                          <FileText className="w-10 h-10 text-indigo-400 mx-auto" />
                          <p className="text-sm font-semibold text-white max-w-[200px] truncate mx-auto">
                            {answerKeyFile.name}
                          </p>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">
                            <Check className="w-3.5 h-3.5" /> PDF Loaded
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="p-3 bg-white/5 rounded-full w-12 h-12 flex items-center justify-center mx-auto group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-all">
                            <Upload className="w-6 h-6 text-gray-400 group-hover:text-indigo-400" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">Drag & drop your PDF here</p>
                            <p className="text-xs text-gray-400 mt-1">or click to browse local files</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 flex items-start gap-1.5 leading-relaxed">
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span>Download from <a href="https://cuet.nta.nic.in" target="_blank" rel="noreferrer" className="text-indigo-400 underline hover:text-indigo-300">cuet.nta.nic.in</a> → Challenge Answer Key section</span>
                  </p>

                  {/* Inline Error */}
                  {answerKeyError && (
                    <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3.5 text-red-400 text-xs leading-relaxed animate-shake">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{answerKeyError}</span>
                    </div>
                  )}
                </div>

                {/* CARD 3 — Ready to Calculate */}
                <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 flex flex-col h-full space-y-6 shadow-[0_8px_30px_rgb(0,0,0,0.3)] justify-between">
                  <div className="space-y-5">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-400 text-sm">3</span>
                        Ready to Calculate
                      </h2>
                    </div>

                    {/* Status Checklist */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-black/20 p-3.5 rounded-xl border border-white/5">
                        <span className="text-sm font-semibold text-gray-300">Response Sheet Details</span>
                        {isResponseReady ? (
                          <span className="flex items-center justify-center w-5 h-5 bg-green-500/10 text-green-500 border border-green-500/25 rounded-full"><Check className="w-3 h-3" /></span>
                        ) : (
                          <span className="w-5 h-5 border-2 border-white/10 rounded-full" />
                        )}
                      </div>

                      <div className="flex items-center justify-between bg-black/20 p-3.5 rounded-xl border border-white/5">
                        <span className="text-sm font-semibold text-gray-300">Answer Key PDF</span>
                        {isAnswerKeyReady ? (
                          <span className="flex items-center justify-center w-5 h-5 bg-green-500/10 text-green-500 border border-green-500/25 rounded-full"><Check className="w-3 h-3" /></span>
                        ) : (
                          <span className="w-5 h-5 border-2 border-white/10 rounded-full" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Calculate Button */}
                    <button
                      onClick={triggerCalculate}
                      disabled={!canCalculate}
                      className={`w-full py-4 rounded-xl font-extrabold text-base flex items-center justify-center gap-2.5 transition-all duration-300 ${
                        canCalculate
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:scale-[1.02]"
                          : "bg-indigo-600/50 opacity-50 text-white/50 cursor-not-allowed"
                      }`}
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>{loadingText}</span>
                        </div>
                      ) : (
                        <>
                          <span>Calculate My Score</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>

                    {/* Step animations inside Card 3 when loading */}
                    {loading && (
                      <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-2 text-xs font-semibold text-gray-400">
                        <div className="flex items-center justify-between">
                          <span>1. Reading files</span>
                          {loadingStep >= 1 ? <span className="text-indigo-400">● In progress</span> : <span>○ Pending</span>}
                        </div>
                        <div className="flex items-center justify-between">
                          <span>2. Matching questions</span>
                          {loadingStep >= 2 ? (loadingStep === 2 ? <span className="text-indigo-400">● Matching</span> : <span className="text-green-500">✓ Done</span>) : <span>○ Pending</span>}
                        </div>
                        <div className="flex items-center justify-between">
                          <span>3. Finalizing score</span>
                          {loadingStep >= 3 ? <span className="text-green-500">✓ Done</span> : <span>○ Pending</span>}
                        </div>
                      </div>
                    )}

                    {/* Inline Error */}
                    {calculateError && (
                      <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3.5 text-red-400 text-xs leading-relaxed animate-shake">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{calculateError}</span>
                      </div>
                    )}
                  </div>

                </div>

              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results-screen"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Reset/Back Button */}
              <button 
                onClick={handleReset}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#9CA3AF] hover:text-white transition-colors bg-white/5 border border-white/5 rounded-xl px-4 py-2 hover:bg-white/10"
              >
                <RotateCcw className="w-4 h-4" /> Start Over
              </button>

              {/* Warning Notice if Mismatches Happened */}
              {resultData?.warning && (
                <div className="flex items-start gap-2.5 bg-yellow-500/10 border border-yellow-500/25 rounded-2xl p-4 text-yellow-400 text-sm leading-relaxed max-w-4xl mx-auto">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{resultData.warning}</span>
                </div>
              )}

              {/* RESULTS TOP HERO */}
              <div className="text-center space-y-6 max-w-xl mx-auto py-6">
                <p className="text-sm uppercase tracking-[0.2em] font-extrabold text-indigo-400">Your Calculated Score</p>
                <div className="space-y-1">
                  <h1 className="text-[7rem] md:text-[8rem] font-black leading-none bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent drop-shadow-[0_0_50px_rgba(99,102,241,0.15)]">
                    {resultData?.score}
                  </h1>
                  <p className="text-gray-400 font-medium text-lg">
                    out of <span className="text-white font-bold">{resultData?.max_possible}</span> possible marks
                  </p>
                </div>

                {/* Stat Pills */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <div className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 font-bold text-sm">
                    <Check className="w-4 h-4" /> {resultData?.correct} Correct
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-sm">
                    <X className="w-4 h-4" /> {resultData?.wrong} Wrong
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-full bg-gray-500/10 border border-gray-500/20 text-gray-400 font-bold text-sm">
                    <span className="w-1.5 h-0.5 bg-gray-400 rounded-full inline-block mr-1" /> {resultData?.unattempted} Not Attempted
                  </div>
                </div>
              </div>

              {/* MIDDLE ACCURACY BAR */}
              <div className="max-w-3xl mx-auto space-y-4 bg-[#141414] border border-white/5 rounded-2xl p-6 shadow-md">
                <h3 className="text-sm font-extrabold text-gray-300 uppercase tracking-wider">Accuracy Breakdown</h3>
                
                {/* Horizontal Segmented Bar */}
                <div className="w-full h-4 rounded-full bg-[#1C1C1C] overflow-hidden flex">
                  {resultData && resultData.max_possible > 0 && (
                    <>
                      <div 
                        style={{ width: `${(resultData.correct / (resultData.breakdown.length || 1)) * 100}%` }} 
                        className="bg-green-500 h-full transition-all duration-500" 
                      />
                      <div 
                        style={{ width: `${(resultData.wrong / (resultData.breakdown.length || 1)) * 100}%` }} 
                        className="bg-red-500 h-full transition-all duration-500" 
                      />
                      <div 
                        style={{ width: `${(resultData.unattempted / (resultData.breakdown.length || 1)) * 100}%` }} 
                        className="bg-gray-500 h-full transition-all duration-500" 
                      />
                    </>
                  )}
                </div>

                {/* Percentage Labels */}
                {resultData && resultData.breakdown.length > 0 && (
                  <div className="grid grid-cols-3 text-center text-xs font-bold text-gray-400">
                    <div>
                      <span className="inline-block w-2.5 h-2.5 bg-green-500 rounded-full mr-1.5 align-middle" />
                      {Math.round((resultData.correct / resultData.breakdown.length) * 100)}% Correct
                    </div>
                    <div>
                      <span className="inline-block w-2.5 h-2.5 bg-red-500 rounded-full mr-1.5 align-middle" />
                      {Math.round((resultData.wrong / resultData.breakdown.length) * 100)}% Wrong
                    </div>
                    <div>
                      <span className="inline-block w-2.5 h-2.5 bg-gray-500 rounded-full mr-1.5 align-middle" />
                      {Math.round((resultData.unattempted / resultData.breakdown.length) * 100)}% Unattempted
                    </div>
                  </div>
                )}
              </div>

              {/* MENTOR CTA CARD */}
              <div className="max-w-3xl mx-auto bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6.5 flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden">
                <div className="space-y-1 relative z-10 text-center md:text-left">
                  <h4 className="text-lg font-extrabold text-white">Want to know which DU college you can get with this score?</h4>
                  <p className="text-indigo-300 font-semibold flex items-center gap-1 justify-center md:justify-start">
                    Talk to a DU senior mentor <ArrowRight className="w-4 h-4" />
                  </p>
                </div>
                <Link
                  href="/"
                  className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-95 transition-all w-full md:w-auto text-center relative z-10 whitespace-nowrap"
                >
                  Book Free Session
                </Link>
              </div>

              {/* FULL BREAKDOWN TABLE */}
              <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden shadow-xl max-w-5xl mx-auto">
                {/* Tabs / Filters */}
                <div className="flex flex-wrap items-center justify-between bg-black/30 border-b border-white/5 px-6 py-4 gap-3">
                  <h3 className="text-base font-extrabold text-white">Question Breakdown</h3>
                  <div className="flex bg-[#1C1C1C] p-1 rounded-xl border border-white/5 overflow-x-auto">
                    {(["all", "correct", "wrong", "unattempted"] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setTableFilter(filter)}
                        className={`px-4.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap ${
                          tableFilter === filter 
                            ? "bg-[#0A0A0A] text-white shadow-md border border-white/5" 
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-xs font-bold text-gray-400 uppercase bg-black/10">
                        <th className="px-6 py-4">#</th>
                        <th className="px-6 py-4">Question ID</th>
                        <th className="px-6 py-4">Your Answer</th>
                        <th className="px-6 py-4">Correct Answer</th>
                        <th className="px-6 py-4 text-center">Result</th>
                        <th className="px-6 py-4 text-center">Challenge</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                      {resultData?.breakdown
                        .filter((item) => {
                          if (tableFilter === "all") return true;
                          return item.status === tableFilter;
                        })
                        .map((item, idx) => {
                          // Define rowbg based on status
                          let rowClass = "bg-[#1C1C1C]/10 text-gray-300";
                          let badgeClass = "bg-gray-500/10 text-gray-400 border border-gray-500/20";
                          let label = "Unattempted";
                          
                          if (item.status === "correct") {
                            rowClass = "bg-[#0A1F0A]/60 text-green-300";
                            badgeClass = "bg-green-500/10 text-green-400 border border-green-500/25";
                            label = "Correct";
                          } else if (item.status === "wrong") {
                            rowClass = "bg-[#1F0A0A]/60 text-red-300";
                            badgeClass = "bg-red-500/10 text-red-400 border border-red-500/25";
                            label = "Wrong";
                          }

                          const displayCorrectAnswer = Array.isArray(item.correct_answer)
                            ? item.correct_answer.join(" / ")
                            : item.correct_answer;

                          return (
                            <tr key={item.question_id} className={`${rowClass} hover:opacity-90 transition-opacity`}>
                              <td className="px-6 py-4.5 font-semibold text-gray-400">{idx + 1}</td>
                              <td className="px-6 py-4.5 font-mono text-sm tracking-tight">{item.question_id}</td>
                              <td className="px-6 py-4.5 font-mono text-sm">
                                {item.student_answer ? (
                                  <span className="flex items-center gap-1.5">
                                    <CornerDownRight className="w-3.5 h-3.5 text-gray-500" />
                                    {item.student_answer}
                                  </span>
                                ) : (
                                  <span className="text-gray-500 italic">No Answer</span>
                                )}
                              </td>
                              <td className="px-6 py-4.5 font-mono text-sm">{displayCorrectAnswer || "N/A"}</td>
                              <td className="px-6 py-4.5 text-center">
                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${badgeClass}`}>
                                  {label}
                                </span>
                              </td>
                              <td className="px-6 py-4.5 text-center">
                                {item.status === "wrong" ? (
                                  <button
                                    onClick={() => toggleFlag(item.question_id)}
                                    className={`p-2 rounded-lg border transition-all ${
                                      flaggedQuestions.has(item.question_id)
                                        ? "bg-indigo-600 border-indigo-500 text-white shadow-md scale-105"
                                        : "bg-black/20 border-white/10 text-gray-400 hover:border-indigo-500/40 hover:text-indigo-400"
                                    }`}
                                    title="Flag Question for Challenge"
                                  >
                                    <Flag className="w-4 h-4 fill-current" />
                                  </button>
                                ) : (
                                  <span className="text-gray-600">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* FOOTER CTA */}
              <div className="max-w-md mx-auto text-center space-y-6 pt-10">
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-white text-[#0A0A0A] font-extrabold rounded-full hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-95 transition-all text-sm"
                >
                  <Share2 className="w-4.5 h-4.5" /> Share My Score
                </button>
                <div className="text-xs text-gray-500 font-medium space-y-1">
                  <p>Built by DU Seniors · duseva.com</p>
                </div>
              </div>

              {/* Sticky bottom drawer (ChallengeQueue) */}
              <AnimatePresence>
                {flaggedQuestions.size > 0 && (
                  <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/90 backdrop-blur border-t border-white/10 px-6 py-5.5 shadow-[0_-10px_35px_rgba(0,0,0,0.5)]"
                  >
                    <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-center sm:text-left">
                        <p className="text-white text-base font-extrabold flex flex-wrap items-center justify-center sm:justify-start gap-2">
                          <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 font-bold border border-indigo-500/25">
                            {flaggedQuestions.size}
                          </span>
                          <span>questions flagged for challenge</span>
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          NTA challenge fee per question: ₹200 · Total fee: <span className="text-white font-bold">₹{flaggedQuestions.size * 200}</span>
                        </p>
                      </div>
                      <a
                        href="https://cuet.nta.nic.in"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(99,102,241,0.2)] active:scale-95 transition-all w-full sm:w-auto"
                      >
                        <span>Open NTA Portal</span>
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Toast for Share confirmation */}
              <AnimatePresence>
                {showShareToast && (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-6 right-6 z-50 bg-[#141414] border border-green-500/20 text-green-400 px-4.5 py-3 rounded-xl shadow-lg flex items-center gap-2 font-bold text-sm"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Score link copied to clipboard!</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
