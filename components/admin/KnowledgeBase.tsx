"use client";

import { useState } from "react";
import { Upload, FileText, Trash2, Check, X } from "lucide-react";
import clsx from "clsx";

type Document = {
    id: string;
    name: string;
    size: string;
    status: "Active" | "Inactive";
    uploadedAt: string;
};

const INITIAL_DOCS: Document[] = [
    { id: "1", name: "NIST_AI_RMF.pdf", size: "2.4 MB", status: "Active", uploadedAt: "2023-10-15" },
    { id: "2", name: "EU_AI_Act_Final.pdf", size: "5.1 MB", status: "Active", uploadedAt: "2023-11-02" },
    { id: "3", name: "ISO_42001_Draft.pdf", size: "1.8 MB", status: "Inactive", uploadedAt: "2023-09-20" },
];

export function KnowledgeBase() {
    const [documents, setDocuments] = useState<Document[]>(INITIAL_DOCS);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleUpload();
    };

    const handleUpload = () => {
        setIsUploading(true);
        // Simulate upload delay
        setTimeout(() => {
            const newDoc: Document = {
                id: Date.now().toString(),
                name: "New_Compliance_Policy.pdf",
                size: "1.2 MB",
                status: "Active",
                uploadedAt: new Date().toISOString().split("T")[0],
            };
            setDocuments((prev) => [newDoc, ...prev]);
            setIsUploading(false);
        }, 1500);
    };

    const toggleStatus = (id: string) => {
        setDocuments((prev) =>
            prev.map((doc) =>
                doc.id === id
                    ? { ...doc, status: doc.status === "Active" ? "Inactive" : "Active" }
                    : doc
            )
        );
    };

    const deleteDocument = (id: string) => {
        setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    };

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Upload Zone */}
            <div className="lg:col-span-1">
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={clsx(
                        "flex h-full min-h-[300px] flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all",
                        isDragging
                            ? "border-canada-red bg-red-50"
                            : "border-gray-200 bg-gray-50 hover:border-canada-red/50 hover:bg-white"
                    )}
                >
                    <div className="mb-4 rounded-full bg-white p-4 shadow-sm">
                        <Upload className={clsx("h-8 w-8", isDragging ? "text-canada-red" : "text-gray-400")} />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">Upload Documents</h3>
                    <p className="mb-6 text-sm text-gray-500">
                        Drag & drop PDF files here or click to browse.
                    </p>
                    <button
                        onClick={handleUpload}
                        disabled={isUploading}
                        className="rounded-full bg-white px-6 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 transition-all hover:bg-gray-50 hover:shadow-md disabled:opacity-50"
                    >
                        {isUploading ? "Uploading..." : "Browse Files"}
                    </button>
                </div>
            </div>

            {/* File List */}
            <div className="lg:col-span-2">
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-100 px-6 py-4">
                        <h3 className="text-lg font-semibold text-gray-900">Knowledge Base</h3>
                        <p className="text-sm text-gray-500">Manage documents used by the AI for RAG.</p>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {documents.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="rounded-lg bg-red-50 p-2">
                                        <FileText className="h-5 w-5 text-canada-red" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">{doc.name}</h4>
                                        <p className="text-xs text-gray-500">
                                            {doc.size} • Uploaded {doc.uploadedAt}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    {/* Toggle Switch */}
                                    <button
                                        onClick={() => toggleStatus(doc.id)}
                                        className={clsx(
                                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-canada-red focus:ring-offset-2",
                                            doc.status === "Active" ? "bg-canada-red" : "bg-gray-200"
                                        )}
                                    >
                                        <span
                                            className={clsx(
                                                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                                doc.status === "Active" ? "translate-x-6" : "translate-x-1"
                                            )}
                                        />
                                    </button>

                                    <button
                                        onClick={() => deleteDocument(doc.id)}
                                        className="rounded-full p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
