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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FiPlus, FiEdit2, FiTrash2, FiDownload } from "react-icons/fi";
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

// Initial dummy data for Team Management
const initialTeamData = [
  { id: 1, teamName: "Debug Squad", teamLead: "Darrell Steward", members: 5, memberIds: ["1", "2"] },
  { id: 2, teamName: "Byte Analytics", teamLead: "Ronald Richards", members: 5, memberIds: ["3", "4"] },
  { id: 3, teamName: "Theresa Webb", teamLead: "Jerome Bell", members: 9, memberIds: ["5", "6"] },
  { id: 4, teamName: "Digital Dynamos", teamLead: "Darlene Robertson", members: 8, memberIds: ["7", "8"] },
  { id: 5, teamName: "The IT Crowd", teamLead: "Bessie Cooper", members: 88, memberIds: ["9", "10"] },
  { id: 6, teamName: "Cameron Williamson", teamLead: "API Developer", members: 6, memberIds: ["1", "2"] },
  { id: 7, teamName: "Cody Fisher", teamLead: "Savannah Nguyen", members: 6, memberIds: ["3", "4"] },
  { id: 8, teamName: "Kristin Watson", teamLead: "Product Designer", members: 6, memberIds: ["5", "6"] },
];

// Available users for team member selection
const availableUsers = [
  { id: "1", name: "Anik", email: "anik@example.com" },
  { id: "2", name: "John Doe", email: "john.doe@example.com" },
  { id: "3", name: "Jane Smith", email: "jane.smith@example.com" },
  { id: "4", name: "Mike Johnson", email: "mike.johnson@example.com" },
  { id: "5", name: "Sarah Williams", email: "sarah.williams@example.com" },
  { id: "6", name: "David Brown", email: "david.brown@example.com" },
  { id: "7", name: "Emily Davis", email: "emily.davis@example.com" },
  { id: "8", name: "Chris Wilson", email: "chris.wilson@example.com" },
  { id: "9", name: "Lisa Anderson", email: "lisa.anderson@example.com" },
  { id: "10", name: "Robert Taylor", email: "robert.taylor@example.com" },
];

const initialEmployeeFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  designation: "",
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

export default function EmployeeManagement() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("employee");
  const [searchValue, setSearchValue] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [teamData, setTeamData] = useState(initialTeamData);
  const [formData, setFormData] = useState(initialEmployeeFormData);
  const [employeeErrors, setEmployeeErrors] = useState({});
  const [teamFormData, setTeamFormData] = useState({
    teamName: "",
    teamMembers: [],
    teamLead: "",
  });
  const [memberSearchValue, setMemberSearchValue] = useState("");

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

  // Filter data based on search
  const filteredTeamData = useMemo(() => {
    if (!searchValue.trim()) return teamData;
    const searchLower = searchValue.toLowerCase();
    return teamData.filter(
      (team) =>
        team.teamName.toLowerCase().includes(searchLower) ||
        team.teamLead.toLowerCase().includes(searchLower)
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
      const members = availableUsers.filter((user) =>
        team.memberIds?.includes(user.id)
      );

      setTeamFormData({
        teamName: team.teamName || "",
        teamMembers: members,
        teamLead: availableUsers.find((u) => u.name === team.teamLead)?.id || "",
      });
      setEditingTeamId(id);
      setIsTeamDialogOpen(true);
    }
  };

  const handleDeleteTeam = (id) => {
    setTeamData((prev) => prev.filter((team) => team.id !== id));
    toast.success("Team deleted successfully!");
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
    const teamLeadName = availableUsers.find(
      (u) => u.id === teamFormData.teamLead
    )?.name || "";
    const memberIds = teamFormData.teamMembers.map((m) => m.id);
    const memberCount = teamFormData.teamMembers.length;

    if (editingTeamId) {
      // Update existing team
      setTeamData((prev) =>
        prev.map((team) =>
          team.id === editingTeamId
            ? {
              ...team,
              teamName: teamFormData.teamName,
              teamLead: teamLeadName,
              members: memberCount,
              memberIds,
            }
            : team
        )
      );
      toast.success("Team updated successfully!");
    } else {
      // Create new team
      const newTeam = {
        id: Math.max(...teamData.map((t) => t.id), 0) + 1,
        teamName: teamFormData.teamName,
        teamLead: teamLeadName,
        members: memberCount,
        memberIds,
      };
      setTeamData((prev) => [...prev, newTeam]);
      toast.success("Team created successfully!");
    }

    setTeamFormData({
      teamName: "",
      teamMembers: [],
      teamLead: "",
    });
    setMemberSearchValue("");
    setEditingTeamId(null);
    setIsTeamDialogOpen(false);
  };

  const handleTeamCancel = () => {
    setTeamFormData({
      teamName: "",
      teamMembers: [],
      teamLead: "",
    });
    setMemberSearchValue("");
    setEditingTeamId(null);
    setIsTeamDialogOpen(false);
  };

  const handleAddMember = (userId) => {
    if (!teamFormData.teamMembers.find((m) => m.id === userId)) {
      const user = availableUsers.find((u) => u.id === userId);
      if (user) {
        setTeamFormData((prev) => ({
          ...prev,
          teamMembers: [...prev.teamMembers, user],
        }));
        setMemberSearchValue("");
      }
    }
  };

  const handleRemoveMember = (userId) => {
    setTeamFormData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((m) => m.id !== userId),
    }));
  };

  // Filter available users for team member search
  const filteredAvailableUsers = useMemo(() => {
    if (!memberSearchValue.trim()) return availableUsers;
    const searchLower = memberSearchValue.toLowerCase();
    return availableUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
    );
  }, [memberSearchValue]);

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
            onButtonClick={() => setIsTeamDialogOpen(true)}
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
                        Team Lead
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
                          colSpan={4}
                          className="text-center py-8 text-slate-500"
                        >
                          No teams found
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
                            {team.teamLead}
                          </TableCell>
                          <TableCell className="py-3 px-4 text-slate-800">
                            {team.members}
                          </TableCell>
                          <TableCell className="py-3 px-4">
                            <div className="flex items-center justify-center gap-3">
                              <button
                                onClick={() => handleEditTeam(team.id)}
                                className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                              >
                                <FiEdit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteTeam(team.id)}
                                className="text-red-600 hover:text-red-800 transition-colors cursor-pointer"
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
      <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
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
              </div>

              {/* Team Members */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Team Members
                </label>
                <div className="min-h-[120px] border border-[#6051E2] rounded-md p-3 space-y-2">
                  {/* Selected Members as Chips */}
                  {teamFormData.teamMembers.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {teamFormData.teamMembers.map((member) => (
                        <div
                          key={member.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-[#6051E2] rounded-md text-sm text-slate-800"
                        >
                          <span>{member.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(member.id)}
                            className="ml-1 text-slate-500 hover:text-red-600 transition-colors"
                          >
                            <XIcon className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Search Input */}
                  <Input
                    type="text"
                    value={memberSearchValue}
                    onChange={(e) => setMemberSearchValue(e.target.value)}
                    placeholder="Search users by name or email..."
                    className="border-slate-300"
                  />

                  {/* Search Results Dropdown */}
                  {memberSearchValue.trim() &&
                    filteredAvailableUsers
                      .filter(
                        (user) =>
                          !teamFormData.teamMembers.find(
                            (m) => m.id === user.id
                          )
                      )
                      .length > 0 && (
                      <div className="mt-2 border border-slate-200 rounded-md bg-white shadow-lg max-h-48 overflow-y-auto">
                        {filteredAvailableUsers
                          .filter(
                            (user) =>
                              !teamFormData.teamMembers.find(
                                (m) => m.id === user.id
                              )
                          )
                          .map((user) => (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => handleAddMember(user.id)}
                              className="w-full text-left px-4 py-2 hover:bg-slate-100 transition-colors border-b border-slate-100 last:border-b-0"
                            >
                              <div className="font-medium text-slate-800">
                                {user.name}
                              </div>
                              <div className="text-xs text-slate-500">
                                {user.email}
                              </div>
                            </button>
                          ))}
                      </div>
                    )}
                </div>
              </div>

              {/* Assign Team Lead */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Assign Team Lead
                </label>
                <Select
                  value={teamFormData.teamLead}
                  onValueChange={(value) =>
                    setTeamFormData((prev) => ({ ...prev, teamLead: value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select team lead" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                className="w-full sm:w-auto flex items-center gap-2 cursor-pointer"
              >
                <FiPlus className="h-4 w-4" />
                {editingTeamId ? "Update Team" : "Create New Teams"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
