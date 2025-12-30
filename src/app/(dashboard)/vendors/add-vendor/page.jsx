"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FiUpload, FiX, FiFile, FiImage } from "react-icons/fi";
import toast from "react-hot-toast";

export default function AddVendor() {
    const router = useRouter();
    const photoInputRef = useRef(null);
    const documentInputRef = useRef(null);
    const slaInputRef = useRef(null);

    const [formData, setFormData] = useState({
        vendorName: "",
        designation: "",
        email: "",
        phoneNumber: "",
        numberOfProjects: "",
        contactPerson: "",
        contactRole: "",
        contactEmail: "",
        contactPhone: "",
        contactProjects: "",
        contactDesignation: "",
    });

    const [errors, setErrors] = useState({});
    const [photo, setPhoto] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [slaFiles, setSlaFiles] = useState([]);
    const [isDraggingDocuments, setIsDraggingDocuments] = useState(false);
    const [isDraggingSla, setIsDraggingSla] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhoto({
                name: file.name,
                size: (file.size / 1024).toFixed(2) + " KB",
                preview: URL.createObjectURL(file),
            });
            if (errors.photo) {
                setErrors((prev) => ({ ...prev, photo: "" }));
            }
        }
    };

    const handleDocumentUpload = (e) => {
        const files = Array.from(e.target.files);
        const newDocs = files.map((file) => ({
            name: file.name,
            size: (file.size / 1024 / 1024).toFixed(2) + " MB",
        }));
        setDocuments((prev) => [...prev, ...newDocs]);
        if (errors.documents) {
            setErrors((prev) => ({ ...prev, documents: "" }));
        }
    };

    const handleSlaUpload = (e) => {
        const files = Array.from(e.target.files);
        const newFiles = files.map((file) => ({
            name: file.name,
            size: (file.size / 1024 / 1024).toFixed(2) + " MB",
        }));
        setSlaFiles((prev) => [...prev, ...newFiles]);
        if (errors.slaFiles) {
            setErrors((prev) => ({ ...prev, slaFiles: "" }));
        }
    };

    const removePhoto = () => {
        setPhoto(null);
        if (photoInputRef.current) {
            photoInputRef.current.value = "";
        }
    };

    const removeDocument = (index) => {
        setDocuments((prev) => prev.filter((_, i) => i !== index));
    };

    const removeSlaFile = (index) => {
        setSlaFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleDragOver = (e, type) => {
        e.preventDefault();
        e.stopPropagation();
        if (type === "documents") {
            setIsDraggingDocuments(true);
        } else if (type === "sla") {
            setIsDraggingSla(true);
        }
    };

    const handleDragLeave = (e, type) => {
        e.preventDefault();
        e.stopPropagation();
        if (type === "documents") {
            setIsDraggingDocuments(false);
        } else if (type === "sla") {
            setIsDraggingSla(false);
        }
    };

    const handleDocumentDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingDocuments(false);
        const files = Array.from(e.dataTransfer.files);
        const newDocs = files.map((file) => ({
            name: file.name,
            size: (file.size / 1024 / 1024).toFixed(2) + " MB",
        }));
        setDocuments((prev) => [...prev, ...newDocs]);
        if (errors.documents) {
            setErrors((prev) => ({ ...prev, documents: "" }));
        }
    };

    const handleSlaDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingSla(false);
        const files = Array.from(e.dataTransfer.files);
        const newFiles = files.map((file) => ({
            name: file.name,
            size: (file.size / 1024 / 1024).toFixed(2) + " MB",
        }));
        setSlaFiles((prev) => [...prev, ...newFiles]);
        if (errors.slaFiles) {
            setErrors((prev) => ({ ...prev, slaFiles: "" }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Vendor Information
        if (!formData.vendorName.trim()) {
            newErrors.vendorName = "Vendor name is required";
        }
        if (!formData.designation.trim()) {
            newErrors.designation = "Designation is required";
        }
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Please enter a valid email";
        }
        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = "Phone number is required";
        }
        if (!formData.numberOfProjects.trim()) {
            newErrors.numberOfProjects = "Number of projects is required";
        }
        if (!photo) {
            newErrors.photo = "Photo is required";
        }

        // Key Point of Contact
        if (!formData.contactPerson.trim()) {
            newErrors.contactPerson = "Contact person is required";
        }
        if (!formData.contactRole.trim()) {
            newErrors.contactRole = "Role is required";
        }
        if (!formData.contactEmail.trim()) {
            newErrors.contactEmail = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
            newErrors.contactEmail = "Please enter a valid email";
        }
        if (!formData.contactPhone.trim()) {
            newErrors.contactPhone = "Phone number is required";
        }
        if (!formData.contactProjects.trim()) {
            newErrors.contactProjects = "Number of projects is required";
        }
        if (!formData.contactDesignation.trim()) {
            newErrors.contactDesignation = "Designation is required";
        }

        // File uploads
        if (documents.length === 0) {
            newErrors.documents = "Please upload at least one document";
        }
        if (slaFiles.length === 0) {
            newErrors.slaFiles = "Please upload at least one SLA file";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            console.log("Form submitted:", { ...formData, photo, documents, slaFiles });
            toast.success("Vendor added successfully!");
            router.push("/vendors");
        } else {
            toast.error("Please fill in all required fields");
        }
    };

    const handleCancel = () => {
        router.push("/vendors");
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Add new vendor</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Enter vendor details to add them to your records. AI powered insights for all your projects
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Vendor Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Vendor Name */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                            Vendor name <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="text"
                            name="vendorName"
                            value={formData.vendorName}
                            onChange={handleInputChange}
                            placeholder="Enter vendor official's name"
                            className={`bg-white placeholder:text-slate-400 ${errors.vendorName ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        />
                        {errors.vendorName && (
                            <p className="text-xs text-red-500">{errors.vendorName}</p>
                        )}
                    </div>

                    {/* Designation */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                            Designation <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="text"
                            name="designation"
                            value={formData.designation}
                            onChange={handleInputChange}
                            placeholder="e.g. Lead Developer"
                            className={`bg-slate-50 placeholder:text-slate-400 ${errors.designation ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        />
                        {errors.designation && (
                            <p className="text-xs text-red-500">{errors.designation}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="example@gmail.com"
                            className={`bg-white placeholder:text-slate-400 ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        />
                        {errors.email && (
                            <p className="text-xs text-red-500">{errors.email}</p>
                        )}
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                            Phone Number <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            placeholder="Enter phone number"
                            className={`bg-slate-50 placeholder:text-slate-400 ${errors.phoneNumber ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        />
                        {errors.phoneNumber && (
                            <p className="text-xs text-red-500">{errors.phoneNumber}</p>
                        )}
                    </div>

                    {/* Number of Projects */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                            Number of projects <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="text"
                            name="numberOfProjects"
                            value={formData.numberOfProjects}
                            onChange={handleInputChange}
                            placeholder="03"
                            className={`bg-white placeholder:text-slate-400 ${errors.numberOfProjects ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        />
                        {errors.numberOfProjects && (
                            <p className="text-xs text-red-500">{errors.numberOfProjects}</p>
                        )}
                    </div>

                    {/* Upload Photo */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                            Upload photo <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="file"
                            ref={photoInputRef}
                            onChange={handlePhotoUpload}
                            accept="image/*"
                            className="hidden"
                        />
                        {photo ? (
                            <div className="h-[38px] border border-primary rounded-md flex items-center justify-between px-3 bg-white">
                                <div className="flex items-center gap-2 text-sm text-slate-600 truncate">
                                    <FiImage className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                    <span className="truncate">{photo.name}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={removePhoto}
                                    className="text-slate-400 hover:text-red-500 transition"
                                >
                                    <FiX className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <div
                                onClick={() => photoInputRef.current?.click()}
                                className={`h-[38px] border border-dashed rounded-md flex items-center justify-end px-3 bg-white cursor-pointer hover:bg-slate-50 transition ${errors.photo ? "border-red-500" : "border-primary"}`}
                            >
                                <FiUpload className="h-5 w-5 text-slate-400" />
                            </div>
                        )}
                        {errors.photo && (
                            <p className="text-xs text-red-500">{errors.photo}</p>
                        )}
                    </div>
                </div>

                {/* Key Point of Contact */}
                <div className="space-y-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            Key Point of Contact
                        </h2>
                        <p className="text-sm text-slate-500">
                            Main person to contact for all vendor-related communication.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Contact Person */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                                Contact Person <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="contactPerson"
                                value={formData.contactPerson}
                                onChange={handleInputChange}
                                placeholder="manager"
                                className={`bg-white placeholder:text-slate-400 ${errors.contactPerson ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                            />
                            {errors.contactPerson && (
                                <p className="text-xs text-red-500">{errors.contactPerson}</p>
                            )}
                        </div>

                        {/* Role */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                                Role <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="contactRole"
                                value={formData.contactRole}
                                onChange={handleInputChange}
                                placeholder="Project Manager"
                                className={`bg-slate-50 placeholder:text-slate-400 ${errors.contactRole ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                            />
                            {errors.contactRole && (
                                <p className="text-xs text-red-500">{errors.contactRole}</p>
                            )}
                        </div>

                        {/* Contact Email */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="email"
                                name="contactEmail"
                                value={formData.contactEmail}
                                onChange={handleInputChange}
                                placeholder="example@gmail.com"
                                className={`bg-white placeholder:text-slate-400 ${errors.contactEmail ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                            />
                            {errors.contactEmail && (
                                <p className="text-xs text-red-500">{errors.contactEmail}</p>
                            )}
                        </div>

                        {/* Contact Phone Number */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                                Phone Number <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="tel"
                                name="contactPhone"
                                value={formData.contactPhone}
                                onChange={handleInputChange}
                                placeholder="0101376826"
                                className={`bg-slate-50 placeholder:text-slate-400 ${errors.contactPhone ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                            />
                            {errors.contactPhone && (
                                <p className="text-xs text-red-500">{errors.contactPhone}</p>
                            )}
                        </div>

                        {/* Contact Number of Projects */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                                Number of projects <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="contactProjects"
                                value={formData.contactProjects}
                                onChange={handleInputChange}
                                placeholder="03"
                                className={`bg-white placeholder:text-slate-400 ${errors.contactProjects ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                            />
                            {errors.contactProjects && (
                                <p className="text-xs text-red-500">{errors.contactProjects}</p>
                            )}
                        </div>

                        {/* Contact Designation */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                                Designation <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="contactDesignation"
                                value={formData.contactDesignation}
                                onChange={handleInputChange}
                                placeholder="e.g. Lead Developer"
                                className={`bg-slate-50 placeholder:text-slate-400 ${errors.contactDesignation ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                            />
                            {errors.contactDesignation && (
                                <p className="text-xs text-red-500">{errors.contactDesignation}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Upload Meeting or Document */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Upload meeting or Document <span className="text-red-500">*</span>
                    </h2>
                    <input
                        type="file"
                        ref={documentInputRef}
                        onChange={handleDocumentUpload}
                        multiple
                        className="hidden"
                    />
                    <Card
                        className={`border-2 border-dashed bg-slate-50 cursor-pointer hover:bg-slate-100 transition ${errors.documents
                            ? "border-red-500"
                            : isDraggingDocuments
                                ? "border-primary"
                                : "border-slate-300"
                            }`}
                        onClick={() => documentInputRef.current?.click()}
                        onDragOver={(e) => handleDragOver(e, "documents")}
                        onDragLeave={(e) => handleDragLeave(e, "documents")}
                        onDrop={handleDocumentDrop}
                    >
                        <CardContent className="p-8">
                            <div className="flex flex-col items-center justify-center text-center space-y-2">
                                <FiUpload className="h-8 w-8 text-slate-400" />
                                <p className="text-sm text-slate-600">
                                    <span className="text-primary font-medium">click to upload</span> or drag & drop
                                </p>
                                <p className="text-xs text-slate-400">
                                    Max 50 MB files are allowed
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    {errors.documents && (
                        <p className="text-xs text-red-500">{errors.documents}</p>
                    )}
                    {documents.length > 0 && (
                        <div className="space-y-2">
                            {documents.map((doc, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-md"
                                >
                                    <div className="flex items-center gap-3">
                                        <FiFile className="h-5 w-5 text-slate-400" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-700">{doc.name}</p>
                                            <p className="text-xs text-slate-400">{doc.size}</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeDocument(index)}
                                        className="text-slate-400 hover:text-red-500 transition"
                                    >
                                        <FiX className="h-5 w-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Upload Service Level Agreements */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Upload service level agreements <span className="text-red-500">*</span>
                    </h2>
                    <input
                        type="file"
                        ref={slaInputRef}
                        onChange={handleSlaUpload}
                        multiple
                        className="hidden"
                    />
                    <Card
                        className={`border-2 border-dashed bg-slate-50 cursor-pointer hover:bg-slate-100 transition ${errors.slaFiles
                            ? "border-red-500"
                            : isDraggingSla
                                ? "border-primary"
                                : "border-slate-300"
                            }`}
                        onClick={() => slaInputRef.current?.click()}
                        onDragOver={(e) => handleDragOver(e, "sla")}
                        onDragLeave={(e) => handleDragLeave(e, "sla")}
                        onDrop={handleSlaDrop}
                    >
                        <CardContent className="p-8">
                            <div className="flex flex-col items-center justify-center text-center space-y-2">
                                <FiUpload className="h-8 w-8 text-slate-400" />
                                <p className="text-sm text-slate-600">
                                    <span className="text-primary font-medium">click to upload</span> or drag & drop
                                </p>
                                <p className="text-xs text-slate-400">
                                    Max 100 MB files are allowed
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    {errors.slaFiles && (
                        <p className="text-xs text-red-500">{errors.slaFiles}</p>
                    )}
                    {slaFiles.length > 0 && (
                        <div className="space-y-2">
                            {slaFiles.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-md"
                                >
                                    <div className="flex items-center gap-3">
                                        <FiFile className="h-5 w-5 text-slate-400" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-700">{file.name}</p>
                                            <p className="text-xs text-slate-400">{file.size}</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeSlaFile(index)}
                                        className="text-slate-400 hover:text-red-500 transition"
                                    >
                                        <FiX className="h-5 w-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
                    <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={handleCancel}
                        className="cursor-pointer"
                    >
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary" size="lg">
                        Add vendor
                    </Button>
                </div>
            </form>
        </div>
    );
}
