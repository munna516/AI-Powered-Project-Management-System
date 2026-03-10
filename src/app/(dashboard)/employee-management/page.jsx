"use client";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/dialog";
import { FiPlus, FiEdit2, FiTrash2, FiDownload, FiChevronDown } from "react-icons/fi";
import { XIcon } from "lucide-react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import PageHeader from "@/components/PageHeader/PageHeader";
import Loading from "@/components/Loading/Loading";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";

const tabs = [
  { id: "employee", label: "Employee Management" },
  { id: "team", label: "Team Management" },
];

const initialEmployeeFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  designation: "",
};

const initialTeamFormData = {
  teamName: "",
  teamMembers: [],
};

const getNameParts = (employee = {}) => {
  const user = employee.user || {};
  const rawName = employee.name || user.name || "";

  if (employee.firstName || employee.lastName || user.firstName || user.lastName) {
    return {
      firstName: employee.firstName || user.firstName || "",
      lastName: employee.lastName || user.lastName || "",
    };
  }

  const [firstName = "", ...rest] = rawName.trim().split(" ").filter(Boolean);

  return {
    firstName,
    lastName: rest.join(" "),
  };
};

const normalizeEmployee = (employee, index) => {
  const user = employee?.user || {};
  const { firstName, lastName } = getNameParts(employee);
  const fullName =
    [firstName, lastName].filter(Boolean).join(" ").trim() ||
    employee?.name ||
    user?.name ||
    `Employee ${index + 1}`;

  return {
    id: employee?.id || employee?.employeeId || user?.id || `employee-${index}`,
    firstName,
    lastName,
    name: fullName,
    email: employee?.email || user?.email || "",
    phoneNumber:
      employee?.phoneNumber ||
      employee?.phone ||
      user?.phoneNumber ||
      user?.phone ||
      "",
    designation: employee?.designation || user?.designation || "",
  };
};

const getTeamMemberList = (team = {}) => {
  if (Array.isArray(team.employees)) return team.employees;
  if (Array.isArray(team.members)) return team.members;
  if (Array.isArray(team.teamMembers)) return team.teamMembers;
  return [];
};

const getTeamMemberIds = (team = {}) => {
  if (Array.isArray(team.employeeIds)) return team.employeeIds;
  if (Array.isArray(team.memberIds)) return team.memberIds;
  if (Array.isArray(team.employees)) {
    return team.employees
      .map((employee) => employee?.id || employee?.employeeId || employee?.user?.id)
      .filter(Boolean);
  }
  if (Array.isArray(team.members)) {
    return team.members
      .map((employee) => employee?.id || employee?.employeeId || employee?.user?.id)
      .filter(Boolean);
  }
  return [];
};

async function fetchTeams() {
  const endpoints = [
    "/api/project-manager/team/all",
    "/api/project-manager/team",
    "/api/project-manager/teams/all",
  ];

  let lastError;

  for (const endpoint of endpoints) {
    try {
      return await apiGet(endpoint);
    } catch (error) {
      lastError = error;
      if (error?.status && error.status !== 404) {
        throw error;
      }
    }
  }

  throw lastError || new Error("Failed to load teams.");
}

const normalizeTeam = (team, index, teamMemberOptions) => {
  const memberLookup = new Map(teamMemberOptions.map((member) => [String(member.id), member]));
  const memberIds = getTeamMemberIds(team).map((id) => String(id));
  const rawMembers = getTeamMemberList(team);

  const membersFromPayload = rawMembers
    .map((member, memberIndex) => normalizeEmployee(member, memberIndex))
    .map((member) => ({
      id: String(member.id),
      name: member.name,
      email: member.email,
    }));

  const membersFromIds = memberIds
    .map((id) => memberLookup.get(id))
    .filter(Boolean);

  const teamMembers =
    membersFromPayload.length > 0
      ? membersFromPayload
      : membersFromIds;

  return {
    id: team?.id || team?.teamId || `team-${index}`,
    teamName: team?.name || team?.teamName || `Team ${index + 1}`,
    teamMembers,
    memberIds: teamMembers.map((member) => String(member.id)),
    membersCount:
      teamMembers.length ||
      team?.memberCount ||
      team?.membersCount ||
      team?.members ||
      memberIds.length ||
      0,
  };
};

export default function EmployeeManagement() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("employee");
  const [searchValue, setSearchValue] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [formData, setFormData] = useState(initialEmployeeFormData);
  const [employeeErrors, setEmployeeErrors] = useState({});
  const [teamFormData, setTeamFormData] = useState(initialTeamFormData);
  const [teamErrors, setTeamErrors] = useState({});
  const [memberSearchValue, setMemberSearchValue] = useState("");
  const [isMemberDropdownOpen, setIsMemberDropdownOpen] = useState(false);

  const {
    data: employeesResponse,
    isLoading: isEmployeesLoading,
    isError: isEmployeesError,
    error: employeesError,
    refetch: refetchEmployees,
  } = useQuery({
    queryKey: ["employees"],
    queryFn: () => apiGet("/api/project-manager/employees/all"),
  });

  const createEmployeeMutation = useMutation({
    mutationFn: (payload) => apiPost("/api/project-manager/employees/create", payload),
    onSuccess: async (response) => {
      toast.success(response?.message || "Employee created successfully!");
      await queryClient.invalidateQueries({ queryKey: ["employees"] });
      handleEmployeeDialogChange(false);
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to create employee.");
    },
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: ({ id, payload }) =>
      apiPatch(`/api/project-manager/employees/${id}`, payload),
    onSuccess: async (response) => {
      toast.success(response?.message || "Employee updated successfully!");
      await queryClient.invalidateQueries({ queryKey: ["employees"] });
      handleEmployeeDialogChange(false);
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update employee.");
    },
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: (id) => apiDelete(`/api/project-manager/employees/${id}`),
    onSuccess: async (response) => {
      toast.success(response?.message || "Employee deleted successfully!");
      await queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to delete employee.");
    },
  });

  const employeeData = useMemo(() => {
    const rawEmployees = Array.isArray(employeesResponse?.data)
      ? employeesResponse.data
      : Array.isArray(employeesResponse?.data?.data)
      ? employeesResponse.data.data
      : [];

    return rawEmployees.map((employee, index) => normalizeEmployee(employee, index));
  }, [employeesResponse]);

  const teamMemberOptions = useMemo(
    () =>
      employeeData.map((employee) => ({
        id: String(employee.id),
        name: employee.name,
        email: employee.email,
      })),
    [employeeData]
  );

  const {
    data: teamsResponse,
    isLoading: isTeamsLoading,
    isError: isTeamsError,
    error: teamsError,
    refetch: refetchTeams,
  } = useQuery({
    queryKey: ["teams"],
    queryFn: fetchTeams,
  });

  const createTeamMutation = useMutation({
    mutationFn: (payload) => apiPost("/api/project-manager/team/create", payload),
    onSuccess: async (response) => {
      toast.success(response?.message || "Team created successfully!");
      await queryClient.invalidateQueries({ queryKey: ["teams"] });
      handleTeamDialogChange(false);
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to create team.");
    },
  });

  const updateTeamMutation = useMutation({
    mutationFn: ({ id, payload }) => apiPatch(`/api/project-manager/team/${id}`, payload),
    onSuccess: async (response) => {
      toast.success(response?.message || "Team updated successfully!");
      await queryClient.invalidateQueries({ queryKey: ["teams"] });
      handleTeamDialogChange(false);
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update team.");
    },
  });

  const deleteTeamMutation = useMutation({
    mutationFn: (id) => apiDelete(`/api/project-manager/team/${id}`),
    onSuccess: async (response) => {
      toast.success(response?.message || "Team deleted successfully!");
      await queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to delete team.");
    },
  });

  const teamData = useMemo(() => {
    const rawTeams = Array.isArray(teamsResponse?.data)
      ? teamsResponse.data
      : Array.isArray(teamsResponse?.data?.data)
      ? teamsResponse.data.data
      : [];

    return rawTeams.map((team, index) => normalizeTeam(team, index, teamMemberOptions));
  }, [teamsResponse, teamMemberOptions]);

  // Filter data based on search
  const filteredTeamData = useMemo(() => {
    if (!searchValue.trim()) return teamData;
    const searchLower = searchValue.toLowerCase();
    return teamData.filter(
      (team) =>
        team.teamName.toLowerCase().includes(searchLower) ||
        team.teamMembers.some((member) =>
          member.name.toLowerCase().includes(searchLower)
        )
    );
  }, [searchValue, teamData]);

  const filteredEmployeeData = useMemo(() => {
    if (!searchValue.trim()) return employeeData;
    const searchLower = searchValue.toLowerCase();
    return employeeData.filter(
      (employee) =>
        employee.name.toLowerCase().includes(searchLower) ||
        employee.email.toLowerCase().includes(searchLower) ||
        employee.designation?.toLowerCase().includes(searchLower) ||
        employee.phoneNumber?.toLowerCase().includes(searchLower)
    );
  }, [searchValue, employeeData]);

  const resetEmployeeForm = () => {
    setFormData(initialEmployeeFormData);
    setEmployeeErrors({});
    setEditingEmployeeId(null);
  };

  const handleEmployeeDialogChange = (open) => {
    setIsDialogOpen(open);
    if (!open) {
      resetEmployeeForm();
    }
  };

  const handleOpenCreateEmployee = () => {
    resetEmployeeForm();
    setIsDialogOpen(true);
  };

  const handleEditEmployee = (employee) => {
    setFormData({
      firstName: employee.firstName || "",
      lastName: employee.lastName || "",
      email: employee.email || "",
      phoneNumber: employee.phoneNumber || "",
      designation: employee.designation || "",
    });
    setEmployeeErrors({});
    setEditingEmployeeId(employee.id);
    setIsDialogOpen(true);
  };

  const handleEditTeam = (id) => {
    const team = teamData.find((t) => t.id === id);
    if (team) {
      setTeamFormData({
        teamName: team.teamName || "",
        teamMembers: team.teamMembers || [],
      });
      setTeamErrors({});
      setMemberSearchValue("");
      setIsMemberDropdownOpen(false);
      setEditingTeamId(id);
      setIsTeamDialogOpen(true);
    }
  };

  const resetTeamForm = () => {
    setTeamFormData(initialTeamFormData);
    setTeamErrors({});
    setMemberSearchValue("");
    setIsMemberDropdownOpen(false);
    setEditingTeamId(null);
  };

  const handleTeamDialogChange = (open) => {
    setIsTeamDialogOpen(open);
    if (!open) {
      resetTeamForm();
    }
  };

  const handleOpenCreateTeam = () => {
    resetTeamForm();
    setIsTeamDialogOpen(true);
  };

  const handleDeleteTeam = async (id) => {
    const result = await Swal.fire({
      title: "Delete team?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6051E2",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;
    deleteTeamMutation.mutate(id);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (employeeErrors[name]) {
      setEmployeeErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateEmployeeForm = () => {
    const errors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email";
    }

    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required";
    }

    if (!formData.designation.trim()) {
      errors.designation = "Designation is required";
    }

    setEmployeeErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateEmployeeForm()) {
      toast.error("Please fill in all required fields correctly.");
      return;
    }

    const payload = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      designation: formData.designation.trim(),
    };

    if (editingEmployeeId) {
      updateEmployeeMutation.mutate({ id: editingEmployeeId, payload });
    } else {
      createEmployeeMutation.mutate(payload);
    }
  };

  const handleCancel = () => {
    handleEmployeeDialogChange(false);
  };

  const handleDeleteEmployee = async (employeeId) => {
    const result = await Swal.fire({
      title: "Delete employee?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6051E2",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;
    deleteEmployeeMutation.mutate(employeeId);
  };

  // Team dialog handlers
  const handleTeamSubmit = (e) => {
    e.preventDefault();

    const nextErrors = {};

    if (!teamFormData.teamName.trim()) {
      nextErrors.teamName = "Team name is required";
    }

    if (teamFormData.teamMembers.length === 0) {
      nextErrors.teamMembers = "Please select at least one team member";
    }

    setTeamErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fill in all required team fields.");
      return;
    }

    const payload = {
      name: teamFormData.teamName.trim(),
      employeeIds: teamFormData.teamMembers.map((member) => String(member.id)),
    };

    if (editingTeamId) {
      updateTeamMutation.mutate({ id: editingTeamId, payload });
    } else {
      createTeamMutation.mutate(payload);
    }
  };

  const handleTeamCancel = () => {
    handleTeamDialogChange(false);
  };

  const handleAddMember = (member) => {
    const memberId = String(member.id);
    if (!teamFormData.teamMembers.find((selected) => String(selected.id) === memberId)) {
      setTeamFormData((prev) => ({
        ...prev,
        teamMembers: [...prev.teamMembers, member],
      }));
      setMemberSearchValue("");
      setTeamErrors((prev) => ({ ...prev, teamMembers: "" }));
    }
  };

  const handleRemoveMember = (userId) => {
    setTeamFormData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((m) => String(m.id) !== String(userId)),
    }));
  };

  const filteredAvailableUsers = useMemo(() => {
    const selectedIds = new Set(
      teamFormData.teamMembers.map((member) => String(member.id))
    );
    const searchLower = memberSearchValue.toLowerCase();
    return teamMemberOptions.filter(
      (user) =>
        !selectedIds.has(String(user.id)) &&
        (!memberSearchValue.trim() ||
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower))
    );
  }, [memberSearchValue, teamFormData.teamMembers, teamMemberOptions]);

  // Export handlers - just show toast
  const handleExportEmployees = () => {
    toast.success("Employee data exported successfully!");
  };

  const handleExportTeams = () => {
    toast.success("Team data exported successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-3 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSearchValue(""); // Reset search when switching tabs
            }}
            className={`px-4 py-2 text-base font-medium transition-colors cursor-pointer border-b-2 ${activeTab === tab.id
              ? "text-[#6051E2] border-[#6051E2]"
              : "text-slate-600 border-transparent hover:text-[#6051E2] hover:border-[#6051E2]/50"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Employee Management Tab */}
      {activeTab === "employee" && (
        <div className="space-y-6">
          {/* Header */}

          <PageHeader
            title="Employee Management"
            description="Manage your employees"
            searchPlaceholder="search"
            searchValue={searchValue}
            onSearchChange={(e) => setSearchValue(e.target.value)}
            buttonLabel="Create New Employee"
            onButtonClick={handleOpenCreateEmployee}
            buttonIcon={<FiPlus className="h-4 w-4" />}
          />

          {/* Export Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleExportEmployees}
              className="bg-[#6051E2] hover:bg-[#4a3db8] text-white px-4 py-2 h-9 sm:h-10 text-sm font-medium cursor-pointer flex items-center gap-2"
            >
              <FiDownload className="h-4 w-4" />
              Export
            </Button>
          </div>

          {/* Employee Table */}
          {isEmployeesLoading ? (
            <Loading />
          ) : isEmployeesError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
              <p className="text-sm text-red-600">
                {employeesError?.message || "Failed to load employees."}
              </p>
              <Button
                type="button"
                onClick={() => refetchEmployees()}
                className="mt-4 bg-[#6051E2] hover:bg-[#4a3db8] text-white cursor-pointer"
              >
                Retry
              </Button>
            </div>
          ) : (
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-[#6051E2]">
                      <TableRow className="border-b-0 hover:bg-[#6051E2]">
                        <TableHead className="py-3 px-4 text-white font-semibold">
                          Name
                        </TableHead>
                        <TableHead className="py-3 px-4 text-white font-semibold">
                          Email
                        </TableHead>
                        <TableHead className="py-3 px-4 text-white font-semibold">
                          Designation
                        </TableHead>
                        <TableHead className="py-3 px-4 text-white font-semibold">
                          Phone Number
                        </TableHead>
                        <TableHead className="py-3 px-4 text-white font-semibold text-center">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEmployeeData.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-8 text-slate-500"
                          >
                            {searchValue.trim()
                              ? `No employees found matching "${searchValue}"`
                              : "No employees found"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredEmployeeData.map((employee) => (
                          <TableRow
                            key={employee.id}
                            className="border-b border-slate-100 hover:bg-slate-50"
                          >
                            <TableCell className="py-3 px-4 text-slate-800">
                              {employee.name}
                            </TableCell>
                            <TableCell className="py-3 px-4 text-slate-800">
                              {employee.email || "-"}
                            </TableCell>
                            <TableCell className="py-3 px-4 text-slate-800">
                              {employee.designation || "-"}
                            </TableCell>
                            <TableCell className="py-3 px-4 text-slate-800">
                              {employee.phoneNumber || "-"}
                            </TableCell>
                            <TableCell className="py-3 px-4">
                              <div className="flex items-center justify-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => handleEditEmployee(employee)}
                                  className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                                >
                                  <FiEdit2 className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteEmployee(employee.id)}
                                  disabled={deleteEmployeeMutation.isPending}
                                  className="text-red-600 hover:text-red-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <FiTrash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Team Management Tab */}
      {activeTab === "team" && (
        <div className="space-y-6">
          <PageHeader
            title="Team Management"
            description="Manage your teams"
            searchPlaceholder="search"
            searchValue={searchValue}
            onSearchChange={(e) => setSearchValue(e.target.value)}
            buttonLabel="Create New Team"
            onButtonClick={handleOpenCreateTeam}
            buttonIcon={<FiPlus className="h-4 w-4" />}
          />

          {/* Export Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleExportTeams}
              className="bg-[#6051E2] hover:bg-[#4a3db8] text-white px-4 py-2 h-9 sm:h-10 text-sm font-medium cursor-pointer flex items-center gap-2"
            >
              <FiDownload className="h-4 w-4" />
              Export
            </Button>
          </div>

          {/* Team Table */}
          {isTeamsLoading ? (
            <Loading />
          ) : isTeamsError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
              <p className="text-sm text-red-600">
                {teamsError?.message || "Failed to load teams."}
              </p>
              <Button
                type="button"
                onClick={() => refetchTeams()}
                className="mt-4 bg-[#6051E2] hover:bg-[#4a3db8] text-white cursor-pointer"
              >
                Retry
              </Button>
            </div>
          ) : (
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                  <Table>
                    <TableHeader className="bg-[#6051E2] sticky top-0 z-10">
                      <TableRow className="border-b-0 hover:bg-[#6051E2]">
                        <TableHead className="py-3 px-4 text-white font-semibold">
                          Team Name
                        </TableHead>
                        <TableHead className="py-3 px-4 text-white font-semibold">
                          Team Members
                        </TableHead>
                        <TableHead className="py-3 px-4 text-white font-semibold text-center">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTeamData.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="text-center py-8 text-slate-500"
                          >
                            {searchValue.trim()
                              ? `No teams found matching "${searchValue}"`
                              : "No teams found"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTeamData.map((team) => (
                          <TableRow
                            key={team.id}
                            className="border-b border-slate-100 hover:bg-slate-50"
                          >
                            <TableCell className="py-3 px-4 text-slate-800">
                              {team.teamName}
                            </TableCell>
                            <TableCell className="py-3 px-4 text-slate-800">
                              {team.membersCount}
                            </TableCell>
                            <TableCell className="py-3 px-4">
                              <div className="flex items-center justify-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => handleEditTeam(team.id)}
                                  className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                                >
                                  <FiEdit2 className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTeam(team.id)}
                                  disabled={deleteTeamMutation.isPending}
                                  className="text-red-600 hover:text-red-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <FiTrash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Add New Employee Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleEmployeeDialogChange}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900">
              {editingEmployeeId ? "Edit Employee" : "Add New Employee"}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600">
              {editingEmployeeId
                ? "Update the employee details below."
                : "Fill in the details to onboard a new team member."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  First Name
                </label>
                <Input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter first name"
                />
                {employeeErrors.firstName && (
                  <p className="text-xs text-red-500">{employeeErrors.firstName}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Last Name
                </label>
                <Input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter last name"
                />
                {employeeErrors.lastName && (
                  <p className="text-xs text-red-500">{employeeErrors.lastName}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Email Address
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                />
                {employeeErrors.email && (
                  <p className="text-xs text-red-500">{employeeErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                />
                {employeeErrors.phoneNumber && (
                  <p className="text-xs text-red-500">{employeeErrors.phoneNumber}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Designation
                </label>
                <Input
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  placeholder="Enter designation"
                />
                {employeeErrors.designation && (
                  <p className="text-xs text-red-500">{employeeErrors.designation}</p>
                )}
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="w-full sm:w-auto cursor-pointer  "
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={
                  createEmployeeMutation.isPending || updateEmployeeMutation.isPending
                }
                className="w-full sm:w-auto flex items-center gap-2 cursor-pointer"
              >
                <FiPlus className="h-4 w-4" />
                {createEmployeeMutation.isPending || updateEmployeeMutation.isPending
                  ? editingEmployeeId
                    ? "Updating..."
                    : "Adding..."
                  : editingEmployeeId
                  ? "Update"
                  : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create New Team Dialog */}
      <Dialog open={isTeamDialogOpen} onOpenChange={handleTeamDialogChange}>
        <DialogContent className="sm:max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900">
              {editingTeamId ? "Edit Team" : "Create New Team"}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600">
              {editingTeamId
                ? "Update team details and assign members."
                : "Configure team details and assign members."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleTeamSubmit}>
            <div className="space-y-4 py-4">
              {/* Team Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Team Name
                </label>
                <Input
                  value={teamFormData.teamName}
                  onChange={(e) =>
                    setTeamFormData((prev) => ({
                      ...prev,
                      teamName: e.target.value,
                    }))
                  }
                  placeholder="e.g. Engineering Squad Alpha"
                  required
                />
                {teamErrors.teamName && (
                  <p className="text-xs text-red-500">{teamErrors.teamName}</p>
                )}
              </div>

              {/* Team Members */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Team Members
                </label>
                {teamFormData.teamMembers.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {teamFormData.teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="inline-flex items-center gap-1 rounded-md bg-green-100 px-3 py-1.5 text-sm text-green-800"
                      >
                        <span>{member.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member.id)}
                          className="ml-1 text-green-700 hover:text-red-600 transition-colors"
                        >
                          <XIcon className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="relative">
                  <Input
                    type="text"
                    value={memberSearchValue}
                    onChange={(e) => {
                      setMemberSearchValue(e.target.value);
                      setIsMemberDropdownOpen(true);
                    }}
                    onFocus={() => setIsMemberDropdownOpen(true)}
                    onBlur={() => {
                      setTimeout(() => setIsMemberDropdownOpen(false), 150);
                    }}
                    placeholder="Search and select team members"
                    className="pr-10"
                  />
                  <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  {isMemberDropdownOpen && (
                    <div className="absolute z-20 mt-2 max-h-56 w-full overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg">
                      {filteredAvailableUsers.length > 0 ? (
                        filteredAvailableUsers.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleAddMember(user)}
                            className="w-full border-b border-slate-100 px-4 py-2 text-left transition-colors hover:bg-slate-100 last:border-b-0"
                          >
                            <div className="font-medium text-slate-800">
                              {user.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {user.email}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-slate-500">
                          No members found
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {teamErrors.teamMembers && (
                  <p className="text-xs text-red-500">{teamErrors.teamMembers}</p>
                )}
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleTeamCancel}
                className="w-full sm:w-auto cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={createTeamMutation.isPending || updateTeamMutation.isPending}
                className="w-full sm:w-auto flex items-center gap-2 cursor-pointer"
              >
                <FiPlus className="h-4 w-4" />
                {createTeamMutation.isPending || updateTeamMutation.isPending
                  ? editingTeamId
                    ? "Updating Team..."
                    : "Creating Team..."
                  : editingTeamId
                  ? "Update Team"
                  : "Create New Team"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
