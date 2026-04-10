"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { FiEdit2, FiEye, FiPlus, FiTrash2 } from "react-icons/fi";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";

const formatDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const toApiDateString = (value) => {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
};

const getRawList = (response) =>
  Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response?.data?.data)
      ? response.data.data
      : [];

const normalizeDocument = (doc, index) => ({
  id: doc?.id || index,
  name: doc?.fileName || doc?.title || "N/A",
  date: formatDate(doc?.setDate || doc?.createdAt),
  rawDate: doc?.setDate
    ? String(doc.setDate).slice(0, 10)
    : doc?.createdAt
      ? String(doc.createdAt).slice(0, 10)
      : "",
  url: doc?.fileUrl || doc?.filePath || "N/A",
  summary: doc?.aiDocumentSummary || doc?.summary || "",
});

export default function DocumentSection({
  projectId,
  uploadDocumentModalOpen,
  setUploadDocumentModalOpen,
}) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [documentForm, setDocumentForm] = useState({
    date: "",
    file: null,
  });
  const [editingDocumentId, setEditingDocumentId] = useState(null);

  const inputBaseClass =
    "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#6051E2]";
  const labelClass = "mb-1.5 block text-sm font-medium text-slate-900";

  const resetDocumentForm = () => {
    setDocumentForm({ date: "", file: null });
    setEditingDocumentId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const documentQueryKey = ["project-document-list", projectId];

  const { data, isLoading } = useQuery({
    queryKey: documentQueryKey,
    enabled: Boolean(projectId),
    queryFn: () =>
      apiGet(`/api/project-manager/project-document/documents/project/${projectId}`),
  });

  const documents = useMemo(
    () => getRawList(data).map((doc, index) => normalizeDocument(doc, index)),
    [data]
  );

  const refreshDocuments = async () => {
    await queryClient.invalidateQueries({ queryKey: documentQueryKey });
  };

  const createDocumentMutation = useMutation({
    mutationFn: (payload) =>
      apiPost("/api/project-manager/project-document/upload-document", payload),
    onSuccess: async () => {
      await refreshDocuments();
      setUploadDocumentModalOpen(false);
      resetDocumentForm();
      toast.success("Document created successfully!");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to create document.");
    },
  });

  const updateDocumentMutation = useMutation({
    mutationFn: ({ documentId, payload }) =>
      apiPut(
        `/api/project-manager/project-document/documents/project/${documentId}`,
        payload
      ),
    onSuccess: async () => {
      await refreshDocuments();
      setUploadDocumentModalOpen(false);
      resetDocumentForm();
      toast.success("Document updated successfully!");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update document.");
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: (documentId) =>
      apiDelete(
        `/api/project-manager/project-document/documents/project/${documentId}`
      ),
    onSuccess: async () => {
      await refreshDocuments();
      toast.success("Document deleted successfully!");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to delete document.");
    },
  });

  const isSubmitting =
    createDocumentMutation.isPending || updateDocumentMutation.isPending;

  const handleSubmit = () => {
    if (!projectId) {
      toast.error("Project ID not found.");
      return;
    }

    if (!documentForm.date) {
      toast.error("Please select a date.");
      return;
    }

    const setDate = toApiDateString(documentForm.date);

    if (!setDate) {
      toast.error("Please provide a valid document date.");
      return;
    }

    if (!editingDocumentId && !documentForm.file) {
      toast.error("Please select a document file.");
      return;
    }

    const payload = new FormData();
    payload.append("projectId", projectId);
    payload.append("setDate", setDate);

    if (documentForm.file) {
      payload.append("document", documentForm.file);
    }

    if (editingDocumentId) {
      payload.append("documentId", editingDocumentId);
      updateDocumentMutation.mutate({ documentId: editingDocumentId, payload });
      return;
    }

    createDocumentMutation.mutate(payload);
  };

  const handleEdit = (doc) => {
    setEditingDocumentId(doc.id);
    setDocumentForm({
      date: doc.rawDate || "",
      file: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setUploadDocumentModalOpen(true);
  };

  const handleDelete = async (documentId) => {
    const result = await Swal.fire({
      title: "Delete document?",
      text: "This document will be removed permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) return;
    deleteDocumentMutation.mutate(documentId);
  };

  return (
    <>
      <Dialog
        open={uploadDocumentModalOpen}
        onOpenChange={(open) => {
          setUploadDocumentModalOpen(open);
          if (!open) resetDocumentForm();
        }}
      >
        <DialogContent className="max-w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-left">
              {editingDocumentId ? "Update Document" : "Upload Document"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Set Date</label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={documentForm.date}
                  onChange={(e) =>
                    setDocumentForm((p) => ({ ...p, date: e.target.value }))
                  }
                  className={`${inputBaseClass} pl-9`}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Upload Document</label>
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) =>
                  setDocumentForm((p) => ({
                    ...p,
                    file: e.target.files?.[0] || null,
                  }))
                }
                className={inputBaseClass}
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setUploadDocumentModalOpen(false)}
              disabled={isSubmitting}
              className="w-full cursor-pointer sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex w-full cursor-pointer items-center gap-2 bg-[#6051E2] text-white hover:bg-[#6051E2]/90 disabled:cursor-not-allowed sm:w-auto"
            >
              <FiPlus className="h-4 w-4" />
              {isSubmitting
                ? editingDocumentId
                  ? "Updating..."
                  : "Uploading..."
                : editingDocumentId
                  ? "Update Document"
                  : "Upload Document"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#6051E2]">
                <TableRow className="border-b-0 hover:bg-[#6051E2]">
                  <TableHead className="px-4 py-3 font-semibold text-white">
                    Date
                  </TableHead>
                  <TableHead className="px-4 py-3 font-semibold text-white">
                    Document Name
                  </TableHead>
                  <TableHead className="px-4 py-3 font-semibold text-white">
                    Document Url
                  </TableHead>
                  <TableHead className="px-4 py-3 text-right font-semibold text-white">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-6 text-center text-slate-500">
                      Loading documents...
                    </TableCell>
                  </TableRow>
                ) : documents.length > 0 ? (
                  documents.map((doc) => (
                    <TableRow
                      key={doc.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <TableCell className="px-4 py-3 text-slate-800">
                        {doc.date}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-slate-800">
                        {doc.name}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-slate-800">
                        <Link
                          href={doc.url}
                          target="_blank"
                          className="cursor-pointer text-blue-600 hover:underline"
                        >
                          Click to view
                        </Link>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/projects/project-details/${projectId}/document-summary?documentId=${doc.id}`}
                            className="cursor-pointer text-slate-500 transition-colors hover:text-blue-600"
                            title="View document summary"
                            aria-label="View document summary"
                          >
                            <FiEye className="h-4 w-4" />
                          </Link>
                          {/* <button
                            type="button"
                            onClick={() => handleEdit(doc)}
                            className="cursor-pointer text-slate-500 transition-colors hover:text-[#6051E2]"
                            title="Edit document"
                            aria-label="Edit document"
                          >
                            <FiEdit2 className="h-4 w-4" />
                          </button> */}
                          <button
                            type="button"
                            onClick={() => handleDelete(doc.id)}
                            className="cursor-pointer text-slate-500 transition-colors hover:text-red-600"
                            title="Delete document"
                            aria-label="Delete document"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="py-6 text-center text-slate-500">
                      N/A
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
