 "use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { CheckCircle2, Circle, CalendarIcon } from "lucide-react";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";

const milestoneStatusOptions = ["Upcoming", "Complete"];

const inputBaseClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#6051E2]";
const labelClass = "mb-1.5 block text-sm font-medium text-slate-900";

const formatDateTime = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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

const normalizeMilestone = (milestone, index) => ({
  id: milestone?.id || index,
  phase: milestone?.phase || milestone?.name || `Phase ${index + 1}`,
  title: milestone?.title || "",
  date: formatDateTime(milestone?.date || milestone?.deadline || milestone?.createdAt),
  rawDate: milestone?.date
    ? String(milestone.date).slice(0, 10)
    : milestone?.deadline
      ? String(milestone.deadline).slice(0, 10)
      : "",
  description: milestone?.description || "N/A",
  status:
    String(milestone?.status || "").toLowerCase() === "completed" ||
    String(milestone?.status || "").toLowerCase() === "complete"
      ? "complete"
      : "upcoming",
});

export default function MilestonesSection({ projectId }) {
  const queryClient = useQueryClient();
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false);
  const [editingMilestoneId, setEditingMilestoneId] = useState(null);
  const [milestoneForm, setMilestoneForm] = useState({
    phase: "",
    date: "",
    description: "",
    status: "",
  });

  const resetMilestoneForm = () => {
    setMilestoneForm({
      phase: "",
      date: "",
      description: "",
      status: "",
    });
    setEditingMilestoneId(null);
  };

  const milestoneQueryKey = ["project-milestone-list", projectId];

  const { data, isLoading } = useQuery({
    queryKey: milestoneQueryKey,
    enabled: Boolean(projectId),
    queryFn: () =>
      apiGet(`/api/project-manager/project-milestone/project/${projectId}`),
  });

  const milestones = useMemo(
    () =>
      getRawList(data).map((milestone, index) =>
        normalizeMilestone(milestone, index)
      ),
    [data]
  );

  const refreshMilestones = async () => {
    await queryClient.invalidateQueries({ queryKey: milestoneQueryKey });
  };

  const createMilestoneMutation = useMutation({
    mutationFn: (payload) =>
      apiPost("/api/project-manager/project-milestone/create-milestone", payload),
    onSuccess: async () => {
      await refreshMilestones();
      setMilestoneModalOpen(false);
      resetMilestoneForm();
      toast.success("Milestone created successfully!");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to create milestone.");
    },
  });

  const updateMilestoneMutation = useMutation({
    mutationFn: ({ milestoneId, payload }) =>
      apiPatch(
        `/api/project-manager/project-milestone/project/${milestoneId}`,
        payload
      ),
    onSuccess: async () => {
      await refreshMilestones();
      setMilestoneModalOpen(false);
      resetMilestoneForm();
      toast.success("Milestone updated successfully!");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update milestone.");
    },
  });

  const deleteMilestoneMutation = useMutation({
    mutationFn: (milestoneId) =>
      apiDelete(`/api/project-manager/project-milestone/project/${milestoneId}`),
    onSuccess: async () => {
      await refreshMilestones();
      toast.success("Milestone deleted successfully!");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to delete milestone.");
    },
  });

  const isSubmitting =
    createMilestoneMutation.isPending || updateMilestoneMutation.isPending;

  const handleSubmit = () => {
    if (!projectId) {
      toast.error("Project ID not found.");
      return;
    }

    if (
      !milestoneForm.phase.trim() ||
      !milestoneForm.date ||
      !milestoneForm.description.trim() ||
      !milestoneForm.status
    ) {
      toast.error("Please fill in all milestone fields.");
      return;
    }

    const date = toApiDateString(milestoneForm.date);
    if (!date) {
      toast.error("Please provide a valid milestone date.");
      return;
    }

    const payload = {
      projectId,
      phase: milestoneForm.phase.trim(),
      name: milestoneForm.phase.trim(),
      title: milestoneForm.phase.trim(),
      date,
      description: milestoneForm.description.trim(),
      status: milestoneForm.status === "Complete" ? "COMPLETED" : "UPCOMING",
    };

    if (editingMilestoneId) {
      updateMilestoneMutation.mutate({
        milestoneId: editingMilestoneId,
        payload,
      });
      return;
    }

    createMilestoneMutation.mutate(payload);
  };

  const handleEdit = (milestone) => {
    setEditingMilestoneId(milestone.id);
    setMilestoneForm({
      phase: milestone.phase.replace("Phase: ", "Phase ").trim(),
      date: milestone.rawDate || "",
      description: milestone.description === "N/A" ? "" : milestone.description,
      status: milestone.status === "complete" ? "Complete" : "Upcoming",
    });
    setMilestoneModalOpen(true);
  };

  const handleDelete = async (milestoneId) => {
    const result = await Swal.fire({
      title: "Delete milestone?",
      text: "This milestone will be removed permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) return;
    deleteMilestoneMutation.mutate(milestoneId);
  };

  return (
    <>
      <Dialog
        open={milestoneModalOpen}
        onOpenChange={(open) => {
          setMilestoneModalOpen(open);
          if (!open) resetMilestoneForm();
        }}
      >
        <DialogContent className="max-w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-left">
              {editingMilestoneId ? "Update Milestone" : "Create Milestone"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Phase</label>
              <input
                type="text"
                value={milestoneForm.phase}
                onChange={(e) =>
                  setMilestoneForm((p) => ({ ...p, phase: e.target.value }))
                }
                placeholder="e.g. Phase 1"
                className={inputBaseClass}
              />
            </div>
            <div>
              <label className={labelClass}>Date</label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={milestoneForm.date}
                  onChange={(e) =>
                    setMilestoneForm((p) => ({ ...p, date: e.target.value }))
                  }
                  className={`${inputBaseClass} pl-9`}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                value={milestoneForm.description}
                onChange={(e) =>
                  setMilestoneForm((p) => ({
                    ...p,
                    description: e.target.value,
                  }))
                }
                placeholder="Write milestone description..."
                className={`${inputBaseClass} min-h-[100px] resize-y`}
                rows={4}
              />
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <Select
                value={milestoneForm.status}
                onValueChange={(value) =>
                  setMilestoneForm((p) => ({ ...p, status: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {milestoneStatusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setMilestoneModalOpen(false)}
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
                ? editingMilestoneId
                  ? "Updating..."
                  : "Creating..."
                : editingMilestoneId
                  ? "Update Milestone"
                  : "Create Milestone"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="mb-6 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-slate-900">Milestones</h3>
            <Button
              onClick={() => setMilestoneModalOpen(true)}
              className="flex items-center gap-2 bg-[#6051E2] text-white hover:bg-[#6051E2]/90"
            >
              <FiPlus className="h-4 w-4" />
              Add Milestone
            </Button>
          </div>
          <div className="relative">
            <div className="absolute bottom-0 left-32 top-0 hidden w-0.5 bg-slate-300 md:block"></div>

            <div className="space-y-8">
              {isLoading ? (
                <p className="text-sm text-slate-500">Loading milestones...</p>
              ) : milestones.length > 0 ? (
                milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className="relative flex flex-col items-start md:flex-row"
                  >
                    <div className="w-full flex-shrink-0 text-left md:w-32 md:pr-6 md:text-right">
                      <p className="text-sm font-medium text-slate-700">
                        {milestone.date !== "N/A"
                          ? milestone.date.split(", ")[0]
                          : "N/A"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {milestone.date !== "N/A" && milestone.date.includes(", ")
                          ? milestone.date.split(", ")[1]
                          : "N/A"}
                      </p>
                    </div>

                    <div className="absolute left-32 z-10 hidden -translate-x-1/2 -translate-y-1 transform md:block">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                          milestone.status === "complete"
                            ? "border-green-500 bg-green-500"
                            : "border-orange-400 bg-white"
                        }`}
                      >
                        {milestone.status === "complete" ? (
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        ) : (
                          <Circle className="h-4 w-4 fill-orange-400 text-orange-400" />
                        )}
                      </div>
                    </div>

                    <div className="w-full space-y-2 md:flex-1 md:pl-12">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <p className="text-sm font-medium text-slate-700">
                          {milestone.phase.replace("Phase ", "Phase: ")}
                        </p>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleEdit(milestone)}
                            className="cursor-pointer text-slate-500 transition-colors hover:text-[#6051E2]"
                            title="Edit milestone"
                            aria-label="Edit milestone"
                          >
                            <FiEdit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(milestone.id)}
                            className="cursor-pointer text-slate-500 transition-colors hover:text-red-600"
                            title="Delete milestone"
                            aria-label="Delete milestone"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600">
                        {milestone.description}
                      </p>
                      <Button
                        size="sm"
                        className={`cursor-pointer rounded-full border ${
                          milestone.status === "complete"
                            ? "border-green-300 bg-green-100 text-green-800 hover:bg-green-200"
                            : "border-orange-300 bg-orange-100 text-orange-800 hover:bg-orange-200"
                        }`}
                      >
                        {milestone.status === "complete" ? "Complete" : "Upcoming"}
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">N/A</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
