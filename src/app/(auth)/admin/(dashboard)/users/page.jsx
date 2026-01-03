"use client";

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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Search, Plus, X } from "lucide-react";
import { useState } from "react";

// Initial Dummy data
const initialUsers = [
  {
    name: "Floyd Miles",
    email: "el.vance@example.com",
    role: "Project Manager",
    projects: ["Project Phoenix", "Quantum Leap"],
    status: "Active",
  },
  {
    name: "Brooklyn Simmons",
    email: "el.vance@example.com",
    role: "Project Manager",
    projects: ["Titan", "Apollo"],
    status: "Active",
  },
  {
    name: "Emily Johnson",
    email: "em.johnson@example.com",
    role: "Project Manager",
    projects: ["Nebula"],
    status: "Active",
  },
  // ... keeping the list reasonably sized for the demo, adding a few more from original
  {
    name: "Robert Fox",
    email: "el.vance@example.com",
    role: "Developer",
    projects: ["Genesis", "Exodus"],
    status: "Active",
  },
  {
    name: "Jacob Jones",
    email: "el.vance@example.com",
    role: "Designer",
    projects: ["Alpha", "Omega"],
    status: "Active",
  },
  {
    name: "Samantha Green",
    email: "samantha.green@example.com",
    role: "QA",
    projects: ["Skyline"],
    status: "Inactive",
  },
];

export default function UsersPage() {
  const [users, setUsers] = useState(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form States
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newProjects, setNewProjects] = useState([]);
  const [newProjectInput, setNewProjectInput] = useState("");
  const [isNewUserActive, setIsNewUserActive] = useState(true);
  const [isAddingProject, setIsAddingProject] = useState(false);

  // Filter logic
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handlers
  const handleAddProject = () => {
    if (newProjectInput.trim()) {
      setNewProjects([...newProjects, newProjectInput.trim()]);
      setNewProjectInput("");
      setIsAddingProject(false);
    }
  };

  const handleRemoveProject = (indexToRemove) => {
    setNewProjects(newProjects.filter((_, index) => index !== indexToRemove));
  };

  const handleAddUser = () => {
    if (!newName || !newEmail) return; // Basic validation

    const newUser = {
      name: newName,
      email: newEmail,
      role: newRole || "Project Manager",
      projects: newProjects,
      status: isNewUserActive ? "Active" : "Inactive",
    };

    setUsers([newUser, ...users]); // Add to top
    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setNewName("");
    setNewEmail("");
    setNewRole("");
    setNewProjects([]);
    setNewProjectInput("");
    setIsNewUserActive(true);
    setIsAddingProject(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">User List</h1>
        <p className="text-slate-500 text-sm">
          Overview of your projects and team performance
        </p>
      </div>

      {/* Action Bar (Search + Add Button) */}
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

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
                onClick={resetForm} 
                className="w-full sm:w-auto bg-[#6051E2] hover:bg-[#4a3db8] text-white gap-2 px-6 py-5 cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent 
            className="sm:max-w-[550px] bg-[#EEF2FF] border-none p-0 overflow-hidden text-slate-900" 
            showCloseButton={false}
          >
            <div className="p-6 sm:p-8 space-y-6">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900">
                  User Profile
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-5">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 block">
                    Name
                  </label>
                  <Input
                    placeholder="User Name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-white border-none py-2.5 h-11 text-slate-700"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 block">
                    Email
                  </label>
                  <Input
                    placeholder="user@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="bg-white border-none py-2.5 h-11 text-slate-700"
                  />
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 block">
                    Role
                  </label>
                  <Input
                    placeholder="Project Manager"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="bg-white border-none py-2.5 h-11 text-slate-700"
                  />
                </div>

                {/* Assign Projects */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 block">
                    Assign Projects
                  </label>
                  <div className="bg-white rounded-md min-h-11 px-3 py-2 flex flex-wrap items-center gap-2">
                    {newProjects.map((proj, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 bg-slate-100/80 text-xs font-medium text-slate-500 px-2 py-1 rounded">
                        {proj}
                        <X 
                          className="w-3 h-3 cursor-pointer hover:text-red-500" 
                          onClick={() => handleRemoveProject(idx)}
                        />
                      </span>
                    ))}
                    
                    {isAddingProject ? (
                        <div className="flex items-center gap-1">
                            <Input
                                autoFocus
                                value={newProjectInput}
                                onChange={(e) => setNewProjectInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if(e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddProject();
                                    }
                                    if(e.key === 'Escape') {
                                        setIsAddingProject(false);
                                    }
                                }}
                                onBlur={handleAddProject}
                                className="h-7 w-32 px-1 py-0 text-sm border-slate-200"
                            />
                        </div>
                    ) : (
                        <button 
                            type="button"
                            onClick={() => setIsAddingProject(true)}
                            className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-600 text-sm font-medium px-1"
                        >
                        <Plus className="w-4 h-4" />
                        Add Project
                        </button>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 block">
                    Status
                  </label>
                  <div className="bg-white rounded-md h-12 px-4 flex items-center justify-between">
                    <span className={`font-medium text-sm ${isNewUserActive ? 'text-[#3b82f6]' : 'text-slate-400'}`}>
                        {isNewUserActive ? "Active" : "Inactive"}
                    </span>
                    <button 
                      type="button"
                      onClick={() => setIsNewUserActive(!isNewUserActive)}
                      className={`relative w-8 h-4 rounded-full transition-colors ${
                        isNewUserActive ? "bg-[#3b82f6]" : "bg-slate-300"
                      }`}
                    >
                       <span 
                         className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${
                             isNewUserActive ? "left-0.5 translate-x-4" : "left-0.5"
                         }`} 
                       />
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 pt-2">
                <DialogClose asChild>
                  <Button variant="ghost" className="text-slate-900 font-semibold hover:bg-slate-200/50">
                    Cancel
                  </Button>
                </DialogClose>
                <Button 
                    onClick={handleAddUser}
                    className="bg-[#6051E2] hover:bg-[#4a3db8] text-white px-8 font-medium"
                >
                  add
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800">
          Project Manager User List
        </h2>

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader className="bg-[#6051E2] hover:bg-[#6051E2]">
              <TableRow className="hover:bg-[#6051E2] border-none">
                <TableHead className="text-white font-semibold h-12 w-[25%] pl-6">
                  Name
                </TableHead>
                <TableHead className="text-white font-semibold h-12 w-[30%]">
                  Email
                </TableHead>
                <TableHead className="text-white font-semibold h-12 w-[25%]">
                  Assigned Projects
                </TableHead>
                <TableHead className="text-white font-semibold h-12 w-[20%]">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <TableRow
                      key={index}
                      className="hover:bg-slate-50 border-slate-100"
                    >
                      <TableCell className="font-medium text-slate-700 pl-6 py-4">
                        {user.name}
                      </TableCell>
                      <TableCell className="text-slate-500 py-4">
                        {user.email}
                      </TableCell>
                      <TableCell className="text-slate-500 py-4">
                        {Array.isArray(user.projects) 
                            ? `${user.projects.length} Projects` 
                            : user.projects}
                      </TableCell>
                      <TableCell className="font-medium py-4">
                        <span className={user.status === "Active" ? "text-green-500 bg-green-100 px-2 py-1 rounded-full" : "text-red-500 bg-red-100 px-2 py-1 rounded-full"}>
                            {user.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                  <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                          No users found matching "{searchQuery}"
                      </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}