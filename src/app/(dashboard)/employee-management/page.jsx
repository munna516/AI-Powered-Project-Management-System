"use client";
import { useState, useMemo } from "react";
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
import { FiSearch, FiPlus, FiEdit2, FiTrash2, ChevronDown } from "react-icons/fi";
import { XIcon } from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "@/components/PageHeader/PageHeader";

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

// Initial dummy data for Employee Management
const initialEmployeeData = [
  { id: 1, name: "John Doe", email: "john.doe@example.com", designation: "Senior Developer", phoneNumber: "+62 81313782626", assignedTeam: "1" },
  { id: 2, name: "Jane Smith", email: "jane.smith@example.com", designation: "UI/UX Designer", phoneNumber: "+62 81234567890", assignedTeam: "2" },
  { id: 3, name: "Mike Johnson", email: "mike.johnson@example.com", designation: "Project Manager", phoneNumber: "+62 81112233445", assignedTeam: "3" },
  { id: 4, name: "Sarah Williams", email: "sarah.williams@example.com", designation: "Full Stack Developer", phoneNumber: "+62 81987654321", assignedTeam: "4" },
  { id: 5, name: "David Brown", email: "david.brown@example.com", designation: "Data Analyst", phoneNumber: "+62 81555666777", assignedTeam: "1" },
  { id: 6, name: "Emily Davis", email: "emily.davis@example.com", designation: "Product Designer", phoneNumber: "+62 81888999000", assignedTeam: "2" },
  { id: 7, name: "Chris Wilson", email: "chris.wilson@example.com", designation: "Backend Developer", phoneNumber: "+62 81222333444", assignedTeam: "3" },
  { id: 8, name: "Lisa Anderson", email: "lisa.anderson@example.com", designation: "Team Lead", phoneNumber: "+62 81666777888", assignedTeam: "4" },
];

// Available teams for dropdown
const availableTeams = [
  { id: "1", name: "Debug Squad" },
  { id: "2", name: "Byte Analytics" },
  { id: "3", name: "Digital Dynamos" },
  { id: "4", name: "The IT Crowd" },
  { id: "5", name: "Stack Masters" },
  { id: "6", name: "Network Ninjas" },
  { id: "7", name: "Tech Nova" },
  { id: "8", name: "Pixel Pulse" },
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

// Country codes for phone number
const countryCodes = [
  { code: "+62", country: "Indonesia" },
  { code: "+1", country: "USA" },
  { code: "+44", country: "UK" },
  { code: "+91", country: "India" },
  { code: "+86", country: "China" },
];

export default function EmployeeManagement() {
  const [activeTab, setActiveTab] = useState("employee");
  const [searchValue, setSearchValue] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [employeeData, setEmployeeData] = useState(initialEmployeeData);
  const [teamData, setTeamData] = useState(initialTeamData);
  const [selectedCountryCode, setSelectedCountryCode] = useState("+62");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    assignedTeam: "",
    designation: "",
    phoneNumber: "",
  });
  const [teamFormData, setTeamFormData] = useState({
    teamName: "",
    teamMembers: [],
    teamLead: "",
  });
  const [memberSearchValue, setMemberSearchValue] = useState("");

  // Filter data based on search
  const filteredTeamData = useMemo(() => {
    if (!searchValue.trim()) return teamData;
    const searchLower = searchValue.toLowerCase();
    return teamData.filter(
      (team) =>
        team.teamName.toLowerCase().includes(searchLower) ||
        team.teamLead.toLowerCase().includes(searchLower)
    );
  }, [searchValue]);

  const filteredEmployeeData = useMemo(() => {
    if (!searchValue.trim()) return employeeData;
    const searchLower = searchValue.toLowerCase();
    return employeeData.filter(
      (employee) =>
        employee.name.toLowerCase().includes(searchLower) ||
        employee.email.toLowerCase().includes(searchLower) ||
        employee.designation?.toLowerCase().includes(searchLower) ||
        employee.assignedTeam?.toLowerCase().includes(searchLower) ||
        employee.phoneNumber?.toLowerCase().includes(searchLower)
    );
  }, [searchValue]);

  const handleEdit = (id, type) => {
    if (type === "employee") {
      const employee = employeeData.find((emp) => emp.id === id);
      if (employee) {
        // Parse name into first and last name
        const nameParts = employee.name.split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        // Parse phone number (remove country code if present)
        const phoneNumber = employee.phoneNumber.replace(/^\+\d+\s*/, "");
        const countryCode = employee.phoneNumber.match(/^\+\d+/)?.[0] || "+62";

        setFormData({
          firstName,
          lastName,
          email: employee.email,
          assignedTeam: employee.assignedTeam || "",
          designation: employee.designation || "",
          phoneNumber,
        });
        setSelectedCountryCode(countryCode);
        setEditingEmployeeId(id);
        setIsDialogOpen(true);
      }
    } else if (type === "team") {
      const team = teamData.find((t) => t.id === id);
      if (team) {
        // Get team members from memberIds
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
    }
  };

  const handleDelete = (id, type) => {
    if (type === "employee") {
      setEmployeeData((prev) => prev.filter((emp) => emp.id !== id));
      toast.success("Employee deleted successfully!");
    } else if (type === "team") {
      setTeamData((prev) => prev.filter((team) => team.id !== id));
      toast.success("Team deleted successfully!");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fullPhoneNumber = `${selectedCountryCode} ${formData.phoneNumber}`;
    const fullName = `${formData.firstName} ${formData.lastName}`.trim();
    const assignedTeamName = availableTeams.find(
      (team) => team.id === formData.assignedTeam
    )?.name || "";

    if (editingEmployeeId) {
      // Update existing employee
      setEmployeeData((prev) =>
        prev.map((emp) =>
          emp.id === editingEmployeeId
            ? {
              ...emp,
              name: fullName,
              email: formData.email,
              designation: formData.designation,
              phoneNumber: fullPhoneNumber,
              assignedTeam: formData.assignedTeam,
            }
            : emp
        )
      );
      toast.success("Employee updated successfully!");
    } else {
      // Create new employee
      const newEmployee = {
        id: Math.max(...employeeData.map((e) => e.id), 0) + 1,
        name: fullName,
        email: formData.email,
        designation: formData.designation,
        phoneNumber: fullPhoneNumber,
        assignedTeam: formData.assignedTeam,
      };
      setEmployeeData((prev) => [...prev, newEmployee]);
      toast.success("Employee created successfully!");
    }

    // Reset form and close dialog
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      assignedTeam: "",
      designation: "",
      phoneNumber: "",
    });
    setSelectedCountryCode("+62");
    setEditingEmployeeId(null);
    setIsDialogOpen(false);
  };

  const handleCancel = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      assignedTeam: "",
      designation: "",
      phoneNumber: "",
    });
    setSelectedCountryCode("+62");
    setEditingEmployeeId(null);
    setIsDialogOpen(false);
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
            onButtonClick={() => setIsDialogOpen(true)}
            buttonIcon={<FiPlus className="h-4 w-4" />}
          />

          {/* Employee Table */}
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
                      <TableHead className="py-3 px-4 text-white font-semibold">
                        Assigned Team
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
                          colSpan={6}
                          className="text-center py-8 text-slate-500"
                        >
                          No employees found
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
                            {employee.email}
                          </TableCell>
                          <TableCell className="py-3 px-4 text-slate-800">
                            {employee.designation}
                          </TableCell>
                          <TableCell className="py-3 px-4 text-slate-800">
                            {employee.phoneNumber}
                          </TableCell>
                          <TableCell className="py-3 px-4 text-slate-800">
                            {availableTeams.find((t) => t.id === employee.assignedTeam)?.name || employee.assignedTeam}
                          </TableCell>
                          <TableCell className="py-3 px-4">
                            <div className="flex items-center justify-center gap-3">
                              <button
                                onClick={() =>
                                  handleEdit(employee.id, "employee")
                                }
                                className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                              >
                                <FiEdit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() =>
                                  handleDelete(employee.id, "employee")
                                }
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
                                onClick={() => handleEdit(team.id, "team")}
                                className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                              >
                                <FiEdit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() =>
                                  handleDelete(team.id, "team")
                                }
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
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Fast Name
                  </label>
                  <Input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                    required
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Last Name
                  </label>
                  <Input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                    required
                  />
                </div>

                {/* Email Address */}
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
                    required
                  />
                </div>

                {/* Assigned Team */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Assigned Team
                  </label>
                  <Select
                    value={formData.assignedTeam}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, assignedTeam: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTeams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Designation */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Designation
                  </label>
                  <Input
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    placeholder="Enter designation"
                    required
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Phone Number
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="81313782626"
                      className="flex-1"
                      required
                    />
                  </div>
                </div>
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
                className="w-full sm:w-auto flex items-center gap-2 cursor-pointer"
              >
                <FiPlus className="h-4 w-4" />
                {editingEmployeeId ? "Update" : "Add"}
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
