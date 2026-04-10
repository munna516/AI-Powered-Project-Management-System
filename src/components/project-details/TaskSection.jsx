 "use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";

const priorityOptions = ["High", "Medium", "Low"];
const statusOptions = ["In Progress", "Pending", "Completed"];

const priorityValueMap = {
  High: "HIGH",
  Medium: "MEDIUM",
  Low: "LOW",
};

const statusValueMap = {
  "In Progress": "IN_PROGRESS",
  Pending: "PENDING",
  Completed: "COMPLETED",
};

const getPriorityColor = (priority = "") => {
  switch (String(priority).toLowerCase()) {
    case "high":
      return "bg-red-100 text-red-800 border-red-200";
    case "medium":
      return "bg-green-100 text-green-800 border-green-200";
    case "low":
      return "bg-orange-100 text-orange-800 border-orange-200";
    default:
      return "bg-slate-100 text-slate-800 border-slate-200";
  }
};

const getStatusColor = (status = "") => {
  switch (String(status).toLowerCase()) {
    case "completed":
    case "complete":
      return "bg-green-100 text-green-800 border-green-200";
    case "in_progress":
    case "in progress":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    default:
      return "bg-slate-100 text-slate-800 border-slate-200";
  }
};

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

const toTitleCase = (value) => {
  if (!value) return "N/A";
  return String(value)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
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

const normalizeTask = (task, index) => ({
  id: task?.id || index,
  taskName: task?.title || task?.taskName || task?.name || "N/A",
  startDate: formatDate(task?.startDate),
  endDate: formatDate(task?.endDate),
  priority: toTitleCase(task?.priority),
  status: toTitleCase(task?.status),
  rawStartDate: task?.startDate ? String(task.startDate).slice(0, 10) : "",
  rawEndDate: task?.endDate ? String(task.endDate).slice(0, 10) : "",
});

export default function TaskSection({
  projectId,
  createTaskModalOpen,
  setCreateTaskModalOpen,
}) {
  const queryClient = useQueryClient();
  const [taskForm, setTaskForm] = useState({
    taskName: "",
    startDate: "",
    endDate: "",
    priority: "",
    status: "",
  });
  const [editingTaskId, setEditingTaskId] = useState(null);

  const inputBaseClass =
    "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#6051E2]";
  const labelClass = "mb-1.5 block text-sm font-medium text-slate-900";

  const resetTaskForm = () => {
    setTaskForm({
      taskName: "",
      startDate: "",
      endDate: "",
      priority: "",
      status: "",
    });
    setEditingTaskId(null);
  };

  const taskQueryKey = ["project-task-list", projectId];

  const { data, isLoading } = useQuery({
    queryKey: taskQueryKey,
    enabled: Boolean(projectId),
    queryFn: () => apiGet(`/api/project-manager/project-task/project/${projectId}`),
  });

  const tasks = useMemo(
    () => getRawList(data).map((task, index) => normalizeTask(task, index)),
    [data]
  );

  const refreshTasks = async () => {
    await queryClient.invalidateQueries({ queryKey: taskQueryKey });
  };

  const createTaskMutation = useMutation({
    mutationFn: (payload) =>
      apiPost("/api/project-manager/project-task/create-task", payload),
    onSuccess: async () => {
      await refreshTasks();
      setCreateTaskModalOpen(false);
      resetTaskForm();
      toast.success("Task created successfully!");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to create task.");
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, payload }) =>
      apiPatch(`/api/project-manager/project-task/${taskId}`, payload),
    onSuccess: async () => {
      await refreshTasks();
      setCreateTaskModalOpen(false);
      resetTaskForm();
      toast.success("Task updated successfully!");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update task.");
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId) =>
      apiDelete(`/api/project-manager/project-task/${taskId}`),
    onSuccess: async () => {
      await refreshTasks();
      toast.success("Task deleted successfully!");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to delete task.");
    },
  });

  const isSubmitting =
    createTaskMutation.isPending || updateTaskMutation.isPending;

  const handleSubmit = () => {
    const title = taskForm.taskName.trim();

    if (!projectId) {
      toast.error("Project ID not found.");
      return;
    }

    if (
      !title ||
      !taskForm.startDate ||
      !taskForm.endDate ||
      !taskForm.priority ||
      !taskForm.status
    ) {
      toast.error("Please fill in all task fields.");
      return;
    }

    const startDate = toApiDateString(taskForm.startDate);
    const endDate = toApiDateString(taskForm.endDate);

    if (!startDate || !endDate) {
      toast.error("Please provide valid task dates.");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      toast.error("End date cannot be before start date.");
      return;
    }

    const payload = {
      projectId,
      title,
      status: statusValueMap[taskForm.status] || taskForm.status,
      startDate,
      endDate,
      priority: priorityValueMap[taskForm.priority] || taskForm.priority,
    };

    if (editingTaskId) {
      updateTaskMutation.mutate({ taskId: editingTaskId, payload });
      return;
    }

    createTaskMutation.mutate(payload);
  };

  const handleEdit = (task) => {
    setEditingTaskId(task.id);
    setTaskForm({
      taskName: task.taskName === "N/A" ? "" : task.taskName,
      startDate: task.rawStartDate || "",
      endDate: task.rawEndDate || "",
      priority: task.priority === "N/A" ? "" : task.priority,
      status: task.status === "N/A" ? "" : task.status,
    });
    setCreateTaskModalOpen(true);
  };

  const handleDelete = async (taskId) => {
    const result = await Swal.fire({
      title: "Delete task?",
      text: "This task will be removed permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) return;
    deleteTaskMutation.mutate(taskId);
  };

  return (
    <>
      <Dialog
        open={createTaskModalOpen}
        onOpenChange={(open) => {
          setCreateTaskModalOpen(open);
          if (!open) resetTaskForm();
        }}
      >
        <DialogContent className="max-w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-left">
              {editingTaskId ? "Update Task" : "Create Task"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Task Name</label>
              <input
                type="text"
                value={taskForm.taskName}
                onChange={(e) =>
                  setTaskForm((p) => ({ ...p, taskName: e.target.value }))
                }
                placeholder="e.g. User research"
                className={inputBaseClass}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Start Date</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={taskForm.startDate}
                    onChange={(e) =>
                      setTaskForm((p) => ({ ...p, startDate: e.target.value }))
                    }
                    className={`${inputBaseClass} pl-9`}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>End Date</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={taskForm.endDate}
                    onChange={(e) =>
                      setTaskForm((p) => ({ ...p, endDate: e.target.value }))
                    }
                    className={`${inputBaseClass} pl-9`}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Priority Level</label>
                <Select
                  value={taskForm.priority}
                  onValueChange={(v) =>
                    setTaskForm((p) => ({ ...p, priority: v }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className={labelClass}>Current Status</label>
                <Select
                  value={taskForm.status}
                  onValueChange={(v) =>
                    setTaskForm((p) => ({ ...p, status: v }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setCreateTaskModalOpen(false)}
              disabled={isSubmitting}
              className="w-full cursor-pointer sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex w-full cursor-pointer items-center gap-2 bg-[#6051E2] text-white disabled:cursor-not-allowed hover:bg-[#6051E2]/90 sm:w-auto"
            >
              <FiPlus className="h-4 w-4" />
              {isSubmitting
                ? editingTaskId
                  ? "Updating..."
                  : "Creating..."
                : editingTaskId
                  ? "Update Task"
                  : "Create Task"}
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
                  <TableHead className="px-4 py-3 text-left font-semibold text-white">
                    Task Name
                  </TableHead>
                  <TableHead className="px-4 py-3 text-center font-semibold text-white">
                    Start Date
                  </TableHead>
                  <TableHead className="px-4 py-3 text-center font-semibold text-white">
                    End Date
                  </TableHead>
                  <TableHead className="px-4 py-3 text-right font-semibold text-white">
                    Priority
                  </TableHead>
                  <TableHead className="px-4 py-3 text-right font-semibold text-white">
                    Status
                  </TableHead>
                  <TableHead className="px-4 py-3 text-right font-semibold text-white">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-6 text-center text-slate-500">
                      Loading tasks...
                    </TableCell>
                  </TableRow>
                ) : tasks.length > 0 ? (
                  tasks.map((task) => (
                    <TableRow
                      key={task.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <TableCell className="px-4 py-3 text-slate-800">
                        {task.taskName}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center text-slate-800">
                        {task.startDate}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center text-slate-800">
                        {task.endDate}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(
                            task.status
                          )}`}
                        >
                          {task.status}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => handleEdit(task)}
                            className="cursor-pointer text-slate-500 transition-colors hover:text-[#6051E2]"
                            title="Edit task"
                            aria-label="Edit task"
                          >
                            <FiEdit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(task.id)}
                            className="cursor-pointer text-slate-500 transition-colors hover:text-red-600"
                            title="Delete task"
                            aria-label="Delete task"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-6 text-center text-slate-500">
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
