"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { Search, Plus, Trash2 } from "lucide-react";
import Loading from "@/components/Loading/Loading";
import { apiDelete, apiGet, apiPost } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const initialFormData = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
};

const formatRole = (role) =>
  String(role || "PROJECT_MANAGER")
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  const {
    data: managersResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["project-managers"],
    queryFn: () => apiGet("/api/admin/project-manager/all"),
  });

  const createManagerMutation = useMutation({
    mutationFn: (payload) => apiPost("/api/admin/project-manager/create", payload),
    onSuccess: async (response) => {
      toast.success(
        response?.message || "Project manager created successfully."
      );
      await queryClient.invalidateQueries({ queryKey: ["project-managers"] });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (mutationError) => {
      toast.error(
        mutationError?.message || "Failed to create project manager."
      );
    },
  });

  const deleteManagerMutation = useMutation({
    mutationFn: (managerId) => apiDelete(`/api/admin/project-manager/${managerId}`),
    onSuccess: async (response) => {
      toast.success(
        response?.message || "Project manager deleted successfully."
      );
      await queryClient.invalidateQueries({ queryKey: ["project-managers"] });
    },
    onError: (mutationError) => {
      toast.error(
        mutationError?.message || "Failed to delete project manager."
      );
    },
  });

  const managerList = useMemo(() => {
    const rawManagers = Array.isArray(managersResponse?.data)
      ? managersResponse.data
      : Array.isArray(managersResponse?.data?.data)
      ? managersResponse.data.data
      : [];

    return rawManagers.map((manager, index) => {
      const user = manager?.user || {};
      const firstName = manager?.firstName || user?.firstName || "";
      const lastName = manager?.lastName || user?.lastName || "";
      const fullName =
        [firstName, lastName].filter(Boolean).join(" ").trim() ||
        user?.name ||
        `Project Manager ${index + 1}`;

      return {
        id: manager?.id || user?.id || `${fullName}-${index}`,
        name: fullName,
        email: user?.email || manager?.email || "-",
        role: formatRole(user?.role || manager?.role),
        status: manager?.deletedAt
          ? "Inactive"
          : user?.isVerified === false
          ? "Pending"
          : "Active",
      };
    });
  }, [managersResponse]);

  const filteredManagers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return managerList;

    return managerList.filter((manager) =>
      [manager.name, manager.email, manager.role, manager.status].some((value) =>
        String(value).toLowerCase().includes(query)
      )
    );
  }, [managerList, searchQuery]);

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
  };

  const handleDialogChange = (open) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.firstName.trim()) {
      nextErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      nextErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      nextErrors.email = "Please enter a valid email";
    }

    if (!formData.password.trim()) {
      nextErrors.password = "Password is required";
    } else if (formData.password.trim().length < 6) {
      nextErrors.password = "Password must be at least 6 characters";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly.");
      return;
    }

    createManagerMutation.mutate({
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      password: formData.password,
    });
  };

  const handleDeleteManager = async (managerId) => {
    const result = await Swal.fire({
      title: "Delete manager?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6051E2",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;
    deleteManagerMutation.mutate(managerId);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Project Managers List
          </h1>
          <p className="text-slate-500 text-sm">
            Overview of all project managers.
          </p>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-600">
            {error?.message || "Failed to load project managers."}
          </p>
          <Button
            type="button"
            onClick={() => refetch()}
            className="mt-4 bg-[#6051E2] hover:bg-[#4a3db8] text-white cursor-pointer"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Project Managers List
        </h1>
        <p className="text-slate-500 text-sm">
          Overview of all project managers.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-xl">
          <Input
            type="text"
            placeholder="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-4 pr-10 py-5 w-full bg-white border-slate-200 rounded-md shadow-sm focus-visible:ring-primary"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button
              type="button"
              onClick={resetForm}
              className="w-full sm:w-auto bg-[#6051E2] hover:bg-[#4a3db8] text-white gap-2 px-6 py-5 cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              Add Manager
            </Button>
          </DialogTrigger>

          <DialogContent
            className="sm:max-w-[550px] bg-[#EEF2FF] border-none p-0 overflow-hidden text-slate-900"
            showCloseButton={false}
          >
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900">
                  Manager Profile
                </DialogTitle>
                <DialogDescription className="text-slate-600">
                  Add a new project manager using first name, last name, email,
                  and password.
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 block">
                    First Name
                  </label>
                  <Input
                    name="firstName"
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="bg-white border-none py-2.5 h-11 text-slate-700"
                  />
                  {errors.firstName && (
                    <p className="text-xs text-red-500">{errors.firstName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 block">
                    Last Name
                  </label>
                  <Input
                    name="lastName"
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="bg-white border-none py-2.5 h-11 text-slate-700"
                  />
                  {errors.lastName && (
                    <p className="text-xs text-red-500">{errors.lastName}</p>
                  )}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700 block">
                    Email
                  </label>
                  <Input
                    type="email"
                    name="email"
                    placeholder="manager@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="bg-white border-none py-2.5 h-11 text-slate-700"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700 block">
                    Password
                  </label>
                  <Input
                    type="password"
                    name="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="bg-white border-none py-2.5 h-11 text-slate-700"
                  />
                  {errors.password && (
                    <p className="text-xs text-red-500">{errors.password}</p>
                  )}
                </div>
              </div>

              <DialogFooter className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleDialogChange(false)}
                  className="text-slate-900 font-semibold hover:bg-slate-200/50 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createManagerMutation.isPending}
                  className="bg-[#6051E2] hover:bg-[#4a3db8] text-white px-8 font-medium cursor-pointer"
                >
                  {createManagerMutation.isPending ? "Adding..." : "Add"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-[#6051E2] hover:bg-[#6051E2]">
            <TableRow className="hover:bg-[#6051E2] border-none">
              <TableHead className="text-white font-semibold h-12 w-[30%] pl-6">
                Name
              </TableHead>
              <TableHead className="text-white font-semibold h-12 w-[35%]">
                Email
              </TableHead>
              <TableHead className="text-white font-semibold h-12 w-[20%]">
                Role
              </TableHead>
              <TableHead className="text-white font-semibold h-12 w-[15%]">
                Status
              </TableHead>
              <TableHead className="text-white font-semibold h-12 w-[10%] text-center">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredManagers.length > 0 ? (
              filteredManagers.map((manager) => (
                <TableRow
                  key={manager.id}
                  className="hover:bg-slate-50 border-slate-100"
                >
                  <TableCell className="font-medium text-slate-700 pl-6 py-4">
                    {manager.name}
                  </TableCell>
                  <TableCell className="text-slate-500 py-4">
                    {manager.email}
                  </TableCell>
                  <TableCell className="text-slate-500 py-4">
                    {manager.role}
                  </TableCell>
                  <TableCell className="font-medium py-4">
                    <span
                      className={
                        manager.status === "Active"
                          ? "text-green-600 bg-green-100 px-2 py-1 rounded-full"
                          : manager.status === "Pending"
                          ? "text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full"
                          : "text-red-500 bg-red-100 px-2 py-1 rounded-full"
                      }
                    >
                      {manager.status}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleDeleteManager(manager.id)}
                      disabled={deleteManagerMutation.isPending}
                      className="text-red-500 hover:text-red-600 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-4 w-4 inline" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  {searchQuery.trim()
                    ? `No project managers found matching "${searchQuery}"`
                    : "No project managers found"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}