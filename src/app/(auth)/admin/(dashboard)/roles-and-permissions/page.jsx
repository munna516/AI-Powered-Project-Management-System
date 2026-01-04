"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Pencil, Trash2, Plus } from "lucide-react"
import { FiEdit, FiEdit2, FiTrash2 } from "react-icons/fi"
import { FaPlus } from "react-icons/fa"

// Sample permissions data
const initialPermissions = [
    { id: 1, name: "Add Project", description: "Allows creation of new product specifications." },
    { id: 2, name: "Edit Project", description: "Allows editing of existing product specifications." },
    { id: 3, name: "Delete Project", description: "Allows deletion of existing product specifications." },
    { id: 4, name: "View Project", description: "Allows viewing of existing product specifications." },
    { id: 5, name: "Add Task", description: "Allows creation of new task specifications." },
    { id: 6, name: "Edit Task", description: "Allows editing of existing task specifications." },
    { id: 7, name: "Delete Task", description: "Allows deletion of existing task specifications." },
    { id: 8, name: "View Task", description: "Allows viewing of existing task specifications." },
]

// Sample roles data
const initialRoles = [
    { id: 1, name: "Project Manager", description: "Can Manage Assigned Project teams, and tasks" },
]

export default function RolesAndPermissions() {
    const [activeTab, setActiveTab] = useState("roles")
    const [permissions, setPermissions] = useState(initialPermissions)
    const [roles, setRoles] = useState(initialRoles)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isAddRoleDialogOpen, setIsAddRoleDialogOpen] = useState(false)
    const [isAddPermissionDialogOpen, setIsAddPermissionDialogOpen] = useState(false)
    const [isEditRoleDialogOpen, setIsEditRoleDialogOpen] = useState(false)
    const [isAssignPermissionDialogOpen, setIsAssignPermissionDialogOpen] = useState(false)
    const [editingPermission, setEditingPermission] = useState(null)
    const [editingRole, setEditingRole] = useState(null)
    const [assigningRole, setAssigningRole] = useState(null)
    const [editFormData, setEditFormData] = useState({ name: "", description: "" })
    const [editRoleFormData, setEditRoleFormData] = useState({ name: "", description: "" })
    const [addRoleFormData, setAddRoleFormData] = useState({ name: "" })
    const [addPermissionFormData, setAddPermissionFormData] = useState({ name: "", description: "" })
    // Map role IDs to arrays of permission IDs
    const [rolePermissions, setRolePermissions] = useState({})

    const handleEditClick = (permission) => {
        setEditingPermission(permission)
        setEditFormData({
            name: permission.name,
            description: permission.description,
        })
        setIsEditDialogOpen(true)
    }

    const handleSaveEdit = () => {
        if (editingPermission) {
            setPermissions(
                permissions.map((p) =>
                    p.id === editingPermission.id
                        ? { ...p, name: editFormData.name, description: editFormData.description }
                        : p
                )
            )
        }
        setIsEditDialogOpen(false)
        setEditingPermission(null)
        setEditFormData({ name: "", description: "" })
    }

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this permission?")) {
            setPermissions(permissions.filter((p) => p.id !== id))
        }
    }

    const handleAddRole = () => {
        if (addRoleFormData.name.trim()) {
            const newRole = {
                id: roles.length + 1,
                name: addRoleFormData.name.trim(),
                description: "",
            }
            setRoles([...roles, newRole])
            setAddRoleFormData({ name: "" })
            setIsAddRoleDialogOpen(false)
        }
    }

    const handleAddPermission = () => {
        if (addPermissionFormData.name.trim() && addPermissionFormData.description.trim()) {
            const newPermission = {
                id: permissions.length + 1,
                name: addPermissionFormData.name.trim(),
                description: addPermissionFormData.description.trim(),
            }
            setPermissions([...permissions, newPermission])
            setAddPermissionFormData({ name: "", description: "" })
            setIsAddPermissionDialogOpen(false)
        }
    }

    const handleEditRoleClick = (role) => {
        setEditingRole(role)
        setEditRoleFormData({
            name: role.name,
            description: role.description || "",
        })
        setIsEditRoleDialogOpen(true)
    }

    const handleSaveEditRole = () => {
        if (editingRole) {
            setRoles(
                roles.map((r) =>
                    r.id === editingRole.id
                        ? { ...r, name: editRoleFormData.name, description: editRoleFormData.description }
                        : r
                )
            )
        }
        setIsEditRoleDialogOpen(false)
        setEditingRole(null)
        setEditRoleFormData({ name: "", description: "" })
    }

    const handleDeleteRole = (id) => {
        if (confirm("Are you sure you want to delete this role?")) {
            setRoles(roles.filter((r) => r.id !== id))
            // Also remove permissions for this role
            const newRolePermissions = { ...rolePermissions }
            delete newRolePermissions[id]
            setRolePermissions(newRolePermissions)
        }
    }

    const handleAssignPermissionClick = (role) => {
        setAssigningRole(role)
        setIsAssignPermissionDialogOpen(true)
    }

    const handleTogglePermission = (permissionId) => {
        if (!assigningRole) return

        const currentPermissions = rolePermissions[assigningRole.id] || []
        const isAssigned = currentPermissions.includes(permissionId)

        setRolePermissions({
            ...rolePermissions,
            [assigningRole.id]: isAssigned
                ? currentPermissions.filter((id) => id !== permissionId)
                : [...currentPermissions, permissionId],
        })
    }

    const handleSaveAssignPermissions = () => {
        setIsAssignPermissionDialogOpen(false)
        setAssigningRole(null)
    }

    return (
        <TooltipProvider>
            <div className="">
                <div className="">
                    {/* Tabs */}
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex gap-12 border-b border-gray-200">
                            <button
                                onClick={() => setActiveTab("roles")}
                                className={`pb-3 text-base font-medium cursor-pointer transition-colors ${activeTab === "roles"
                                    ? "border-b-2 border-primary text-primary"
                                    : "text-gray-600 hover:text-gray-900"
                                    }`}
                            >
                                Roles
                            </button>
                            <button
                                onClick={() => setActiveTab("permissions")}
                                className={`pb-3 text-base font-medium cursor-pointer transition-colors ${activeTab === "permissions"
                                    ? "border-b-2 border-primary text-primary"
                                    : "text-gray-600 hover:text-gray-900"
                                    }`}
                            >
                                Permissions
                            </button>
                        </div>
                        {activeTab === "roles" && (
                            <Button
                                className="w-full sm:w-auto"
                                variant="primary"
                                onClick={() => setIsAddRoleDialogOpen(true)}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Role
                            </Button>
                        )}
                        {activeTab === "permissions" && (
                            <Button
                                className="w-full sm:w-auto"
                                variant="primary"
                                onClick={() => setIsAddPermissionDialogOpen(true)}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Permission
                            </Button>
                        )}
                    </div>

                    {/* Description */}
                    <p className="mb-6 text-sm text-gray-600">
                        Define what users can see and do within the system.
                    </p>

                    {/* Roles Tab Content */}
                    {activeTab === "roles" && (
                        <div className="space-y-4">
                            {roles.map((role) => (
                                <div key={role.id} className="rounded-lg border border-gray-200 bg-white p-6">
                                    <div className="mb-2 text-xs text-gray-500">Predefined Role</div>
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <h3 className="mb-1 text-xl font-bold text-gray-900">{role.name}</h3>
                                            {role.description && (
                                                <p className="text-sm text-gray-600">
                                                    {role.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-5">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        onClick={() => handleAssignPermissionClick(role)}
                                                        className="cursor-pointer"
                                                    >
                                                        <FaPlus className="h-4 w-4 text-primary hover:text-primary/80 transition-colors" />
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Assign Permission</p>
                                                </TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        onClick={() => handleEditRoleClick(role)}
                                                        className="cursor-pointer"
                                                    >
                                                        <FiEdit2 className="h-4 w-4 text-primary hover:text-primary/80 transition-colors" />
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Edit Role</p>
                                                </TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        onClick={() => handleDeleteRole(role.id)}
                                                        className="cursor-pointer"
                                                    >
                                                        <FiTrash2 className="h-4 w-4 text-red-500 hover:text-red-600 transition-colors" />
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Delete Role</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Permissions Tab Content */}
                    {activeTab === "permissions" && (
                        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-primary">
                                            <TableHead className="h-12 text-white">Number</TableHead>
                                            <TableHead className="text-white">Permission Name</TableHead>
                                            <TableHead className="text-white">Description</TableHead>
                                            <TableHead className="w-24 text-white">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {permissions.map((permission, index) => (
                                            <TableRow key={permission.id} className="hover:bg-gray-50">
                                                <TableCell className="font-medium">{index + 1}</TableCell>
                                                <TableCell className="font-medium">{permission.name}</TableCell>
                                                <TableCell className="text-gray-600">{permission.description}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleEditClick(permission)}
                                                            className="rounded p-1.5 text-primary transition-colors cursor-pointer hover:bg-gray-100 hover:text-primary"
                                                            aria-label="Edit permission"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(permission.id)}
                                                            className="rounded p-1.5 text-gray-600 transition-colors cursor-pointer text-red-500 hover:bg-gray-100 hover:text-red-600"
                                                            aria-label="Delete permission"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}

                    {/* Edit Permission Dialog */}
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Edit Permission</DialogTitle>
                                <DialogDescription>
                                    Update the permission name and description below.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label htmlFor="permission-name" className="text-sm font-medium text-gray-700">
                                        Permission Name
                                    </label>
                                    <Input
                                        id="permission-name"
                                        value={editFormData.name}
                                        onChange={(e) =>
                                            setEditFormData({ ...editFormData, name: e.target.value })
                                        }
                                        placeholder="Enter permission name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label
                                        htmlFor="permission-description"
                                        className="text-sm font-medium text-gray-700"
                                    >
                                        Description
                                    </label>
                                    <Textarea
                                        id="permission-description"
                                        value={editFormData.description}
                                        onChange={(e) =>
                                            setEditFormData({ ...editFormData, description: e.target.value })
                                        }
                                        placeholder="Enter permission description"
                                        rows={4}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsEditDialogOpen(false)
                                        setEditingPermission(null)
                                        setEditFormData({ name: "", description: "" })
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button variant="primary" onClick={handleSaveEdit}>
                                    Save Changes
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Add Role Dialog */}
                    <Dialog open={isAddRoleDialogOpen} onOpenChange={setIsAddRoleDialogOpen}>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Add Role</DialogTitle>
                                <DialogDescription>
                                    Create a new role by entering the role name below.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label htmlFor="role-name" className="text-sm font-medium text-gray-700">
                                        Role Name
                                    </label>
                                    <Input
                                        id="role-name"
                                        value={addRoleFormData.name}
                                        onChange={(e) =>
                                            setAddRoleFormData({ ...addRoleFormData, name: e.target.value })
                                        }
                                        placeholder="Enter role name"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsAddRoleDialogOpen(false)
                                        setAddRoleFormData({ name: "" })
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button variant="primary" onClick={handleAddRole}>
                                    Save
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Add Permission Dialog */}
                    <Dialog open={isAddPermissionDialogOpen} onOpenChange={setIsAddPermissionDialogOpen}>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Add Permission</DialogTitle>
                                <DialogDescription>
                                    Create a new permission by entering the permission name and description below.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label htmlFor="add-permission-name" className="text-sm font-medium text-gray-700">
                                        Permission Name
                                    </label>
                                    <Input
                                        id="add-permission-name"
                                        value={addPermissionFormData.name}
                                        onChange={(e) =>
                                            setAddPermissionFormData({ ...addPermissionFormData, name: e.target.value })
                                        }
                                        placeholder="Enter permission name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label
                                        htmlFor="add-permission-description"
                                        className="text-sm font-medium text-gray-700"
                                    >
                                        Description
                                    </label>
                                    <Textarea
                                        id="add-permission-description"
                                        value={addPermissionFormData.description}
                                        onChange={(e) =>
                                            setAddPermissionFormData({ ...addPermissionFormData, description: e.target.value })
                                        }
                                        placeholder="Enter permission description"
                                        rows={4}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsAddPermissionDialogOpen(false)
                                        setAddPermissionFormData({ name: "", description: "" })
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button variant="primary" onClick={handleAddPermission}>
                                    Save
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Edit Role Dialog */}
                    <Dialog open={isEditRoleDialogOpen} onOpenChange={setIsEditRoleDialogOpen}>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Edit Role</DialogTitle>
                                <DialogDescription>
                                    Update the role name and description below.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label htmlFor="edit-role-name" className="text-sm font-medium text-gray-700">
                                        Role Name
                                    </label>
                                    <Input
                                        id="edit-role-name"
                                        value={editRoleFormData.name}
                                        onChange={(e) =>
                                            setEditRoleFormData({ ...editRoleFormData, name: e.target.value })
                                        }
                                        placeholder="Enter role name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label
                                        htmlFor="edit-role-description"
                                        className="text-sm font-medium text-gray-700"
                                    >
                                        Description
                                    </label>
                                    <Textarea
                                        id="edit-role-description"
                                        value={editRoleFormData.description}
                                        onChange={(e) =>
                                            setEditRoleFormData({ ...editRoleFormData, description: e.target.value })
                                        }
                                        placeholder="Enter role description"
                                        rows={4}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsEditRoleDialogOpen(false)
                                        setEditingRole(null)
                                        setEditRoleFormData({ name: "", description: "" })
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button variant="primary" onClick={handleSaveEditRole}>
                                    Save Changes
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Assign Permissions Dialog */}
                    <Dialog open={isAssignPermissionDialogOpen} onOpenChange={setIsAssignPermissionDialogOpen}>
                        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Assign Permissions</DialogTitle>
                                <DialogDescription>
                                    Select permissions to assign to <strong>{assigningRole?.name}</strong>
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-3">
                                    {permissions.map((permission) => {
                                        const isAssigned = rolePermissions[assigningRole?.id]?.includes(permission.id) || false
                                        return (
                                            <div
                                                key={permission.id}
                                                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-900">{permission.name}</div>
                                                    <div className="text-sm text-gray-600 mt-1">{permission.description}</div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={isAssigned}
                                                        onChange={() => handleTogglePermission(permission.id)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                                </label>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsAssignPermissionDialogOpen(false)
                                        setAssigningRole(null)
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button variant="primary" onClick={handleSaveAssignPermissions}>
                                    Save
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </TooltipProvider>
    )
}
