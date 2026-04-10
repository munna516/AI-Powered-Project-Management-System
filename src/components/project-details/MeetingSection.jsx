"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { FiEdit2, FiEye, FiPlus, FiTrash2 } from "react-icons/fi";
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
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";

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

const getRawList = (response) =>
  Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response?.data?.data)
      ? response.data.data
      : [];

const normalizeMeeting = (meeting, index) => ({
  id: meeting?.id || index,
  date: formatDate(meeting?.meetingDate || meeting?.createdAt),
  link: meeting?.videoPlayUrl || meeting?.meetingUrl || "N/A",
  platform: meeting?.platform || "Zoom",
});

export default function MeetingSection({
  projectId,
  uploadMeetingModalOpen,
  setUploadMeetingModalOpen,
}) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [meetingForm, setMeetingForm] = useState({
    videoPlayUrl: "",
    file: null,
  });
  const [editingMeetingId, setEditingMeetingId] = useState(null);

  const inputBaseClass =
    "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#6051E2]";
  const labelClass = "mb-1.5 block text-sm font-medium text-slate-900";

  const resetMeetingForm = () => {
    setMeetingForm({ videoPlayUrl: "", file: null });
    setEditingMeetingId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const meetingQueryKey = ["project-meeting-list", projectId];

  const { data, isLoading } = useQuery({
    queryKey: meetingQueryKey,
    enabled: Boolean(projectId),
    queryFn: () =>
      apiGet(`/api/project-manager/project-meeting/project/${projectId}`),
  });

  const meetings = useMemo(
    () => getRawList(data).map((meeting, index) => normalizeMeeting(meeting, index)),
    [data]
  );

  const refreshMeetings = async () => {
    await queryClient.invalidateQueries({ queryKey: meetingQueryKey });
  };

  const createMeetingMutation = useMutation({
    mutationFn: (payload) =>
      apiPost("/api/project-manager/project-meeting/create-meeting", payload),
    onSuccess: async () => {
      await refreshMeetings();
      setUploadMeetingModalOpen(false);
      resetMeetingForm();
      toast.success("Meeting created successfully!");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to create meeting.");
    },
  });

  const updateMeetingMutation = useMutation({
    mutationFn: (payload) =>
      apiPatch(`/api/project-manager/project-meeting/project/${projectId}`, payload),
    onSuccess: async () => {
      await refreshMeetings();
      setUploadMeetingModalOpen(false);
      resetMeetingForm();
      toast.success("Meeting updated successfully!");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update meeting.");
    },
  });

  const deleteMeetingMutation = useMutation({
    mutationFn: (meetingId) =>
      apiDelete(
        `/api/project-manager/project-meeting/${meetingId}`
      ),
    onSuccess: async () => {
      await refreshMeetings();
      toast.success("Meeting deleted successfully!");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to delete meeting.");
    },
  });

  const isSubmitting =
    createMeetingMutation.isPending || updateMeetingMutation.isPending;

  const handleSubmit = () => {
    if (!projectId) {
      toast.error("Project ID not found.");
      return;
    }

    if (!editingMeetingId && !meetingForm.file) {
      toast.error("Please select a file.");
      return;
    }

    const payload = new FormData();
    payload.append("projectId", projectId);
    if (meetingForm.videoPlayUrl.trim()) {
      payload.append("meetingUrl", meetingForm.videoPlayUrl.trim());
      payload.append("videoPlayUrl", meetingForm.videoPlayUrl.trim());
    }

    if (meetingForm.file) {
      payload.append("transcript", meetingForm.file);
    }

    if (editingMeetingId) {
      payload.append("meetingId", editingMeetingId);
      updateMeetingMutation.mutate(payload);
      return;
    }

    createMeetingMutation.mutate(payload);
  };

  const handleEdit = (meeting) => {
    setEditingMeetingId(meeting.id);
    setMeetingForm({
      videoPlayUrl: meeting.link === "N/A" ? "" : meeting.link,
      file: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setUploadMeetingModalOpen(true);
  };

  const handleDelete = async (meetingId) => {
    const result = await Swal.fire({
      title: "Delete meeting?",
      text: "This meeting will be removed permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) return;
    deleteMeetingMutation.mutate(meetingId);
  };

  return (
    <>
      <Dialog
        open={uploadMeetingModalOpen}
        onOpenChange={(open) => {
          setUploadMeetingModalOpen(open);
          if (!open) resetMeetingForm();
        }}
      >
        <DialogContent className="max-w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-left">
              {editingMeetingId ? "Update Meeting" : "Upload Meeting"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Select Transcript File</label>
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) =>
                  setMeetingForm((p) => ({
                    ...p,
                    file: e.target.files?.[0] || null,
                  }))
                }
                className={inputBaseClass}
              />
            </div>
            <div>
              <label className={labelClass}>Video Play URL</label>
              <input
                type="url"
                value={meetingForm.videoPlayUrl}
                onChange={(e) =>
                  setMeetingForm((p) => ({
                    ...p,
                    videoPlayUrl: e.target.value,
                  }))
                }
                placeholder="e.g. Paste the link"
                className={inputBaseClass}
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setUploadMeetingModalOpen(false)}
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
                ? editingMeetingId
                  ? "Updating..."
                  : "Uploading..."
                : editingMeetingId
                  ? "Update Meeting"
                  : "Upload Meeting"}
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
                    Platform
                  </TableHead>
                  <TableHead className="px-4 py-3 font-semibold text-white">
                    Meeting recordings link
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
                      Loading meetings...
                    </TableCell>
                  </TableRow>
                ) : meetings.length > 0 ? (
                  meetings.map((meeting) => (
                    <TableRow
                      key={meeting.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <TableCell className="px-4 py-3 text-slate-800">
                        {meeting.date}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-slate-800">
                        {meeting.platform}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-slate-800">
                        <Link
                          href={meeting.link}
                          target="_blank"
                          className="cursor-pointer text-blue-600 hover:underline"
                        >
                          Click to view
                        </Link>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/projects/project-details/${projectId}/meeting-summary?meetingId=${meeting.id}`}
                            className="cursor-pointer text-slate-500 transition-colors hover:text-blue-600"
                            title="View meeting summary"
                            aria-label="View meeting summary"
                          >
                            <FiEye className="h-4 w-4" />
                          </Link>
                          {/* <button
                            type="button"
                            onClick={() => handleEdit(meeting)}
                            className="cursor-pointer text-slate-500 transition-colors hover:text-[#6051E2]"
                            title="Edit meeting"
                            aria-label="Edit meeting"
                          >
                            <FiEdit2 className="h-4 w-4" />
                          </button> */}
                          <button
                            type="button"
                            onClick={() => handleDelete(meeting.id)}
                            className="cursor-pointer text-slate-500 transition-colors hover:text-red-600"
                            title="Delete meeting"
                            aria-label="Delete meeting"
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
