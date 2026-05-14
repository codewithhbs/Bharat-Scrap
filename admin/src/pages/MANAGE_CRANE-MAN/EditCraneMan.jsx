import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";
import toast from "react-hot-toast";
import { useUserHook } from "../../hooks/useUserHook";

export default function EditCraneMan() {
  const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [userDetailsLoading, setUserDetailsLoading] = useState(true);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        role: "user",
        isBlocked: false,
        bankDetails: {
            accountNumber: "",
            ifscCode: "",
            bankName: "",
            accountHolderName: "",
        },
        upiDetails: {
            upiId: "",
        },
    });

    useEffect(() => {
        const handleFetchUser = async () => {
            try {
                setUserDetailsLoading(true);
                const res = await api.get(`/admin/users/${id}`);
                const userData = res.data.data;

                if (userData) {
                    setForm({
                        name: userData.name || "",
                        email: userData.email || "",
                        phone: userData.phone || "",
                        address: userData.address || "",
                        role: userData.role || "user",
                        isBlocked: userData.isBlocked || false,
                        bankDetails: {
                            accountNumber: userData.bankDetails?.accountNumber || "",
                            ifscCode: userData.bankDetails?.ifscCode || "",
                            bankName: userData.bankDetails?.bankName || "",
                            accountHolderName: userData.bankDetails?.accountHolderName || "",
                        },
                        upiDetails: {
                            upiId: userData.upiDetails?.upiId || "",
                        },
                    });
                    setUser(userData);
                    setUserDetailsLoading(false);
                } else {
                    toast.error("User not found");
                    navigate("/crane-men");
                }
            } catch (error) {
                console.error("Error fetching user details:", error);
                toast.error("Failed to fetch user details");
                navigate("/crane-men");
            } finally {
                setUserDetailsLoading(false);
            }
        // if (user) {
        //     setForm({
        //         name: user.name || "",
        //         email: user.email || "",
        //         phone: user.phone || "",
        //         address: user.address || "",
        //         role: user.role || "user",
        //         isBlocked: user.isBlocked || false,
        //         bankDetails: {
        //             accountNumber: user.bankDetails?.accountNumber || "",
        //             ifscCode: user.bankDetails?.ifscCode || "",
        //             bankName: user.bankDetails?.bankName || "",
        //             accountHolderName: user.bankDetails?.accountHolderName || "",
        //         },
        //         upiDetails: {
        //             upiId: user.upiDetails?.upiId || "",
        //         },
        //     });
        // }
        };
        handleFetchUser();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleNestedChange = (section, field, value) => {
        setForm((prev) => ({
            ...prev,
            [section]: { ...prev[section], [field]: value },
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await api.put(`/admin/users/${id}`, form);
            toast.success("User updated successfully");
            navigate(`/view-crane-man/${id}`);
        } catch (err) {
            console.error(err);
            toast.error("Update failed");
        } finally {
            setLoading(false);
        }
    };

    const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white placeholder:text-gray-400 focus:outline-none focus:border-gray-400 transition";
    const labelCls = "block text-xs font-medium text-gray-500 mb-1";
    const sectionCls = "bg-white border border-gray-200 rounded-xl p-5";

    if (userDetailsLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-800 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-16">

            {/* Top Bar */}
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <button onClick={() => navigate("/crane-men")} className="hover:text-gray-800 transition">Crane Men</button>
                    <span>/</span>
                    <button onClick={() => navigate(`/view-crane-man/${id}`)} className="hover:text-gray-800 transition">{form.name || "Crane Man"}</button>
                    <span>/</span>
                    <span className="text-gray-800 font-medium">Edit</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => navigate(`/view-crane-man/${id}`)}
                        className="text-sm px-4 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="text-sm px-4 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition disabled:opacity-50"
                    >
                        {loading ? "Saving..." : "Save changes"}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-6 pt-6 space-y-4">

                {/* Page Title */}
                <div className="mb-2">
                    <h1 className="text-lg font-medium text-gray-900">Edit Crane Man</h1>
                    <p className="text-sm text-gray-400 mt-0.5">Update profile information and details</p>
                </div>

                {/* Basic Info */}
                <div className={sectionCls}>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Basic Info</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Full name</label>
                            <input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Email address</label>
                            <input name="email" value={form.email} onChange={handleChange} placeholder="john@example.com" className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Phone</label>
                            <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 9999999999" className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Address</label>
                            <input name="address" value={form.address} onChange={handleChange} placeholder="123 Main St, City" className={inputCls} />
                        </div>
                    </div>
                </div>

                {/* Account Settings */}
                <div className={sectionCls}>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Account Settings</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Role</label>
                            <select name="role" value={form.role} onChange={handleChange} className={inputCls}>
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                                <option value="craneMan">Crane Man</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-3 pt-5">
                            <input
                                type="checkbox"
                                id="isBlocked"
                                name="isBlocked"
                                checked={form.isBlocked}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-gray-300 accent-gray-900"
                            />
                            <label htmlFor="isBlocked" className="text-sm text-gray-600">Block this user</label>
                        </div>
                    </div>
                </div>

                {/* Bottom Submit */}
                <div className="flex justify-end gap-2 pt-2 pb-8">
                    <button
                        type="button"
                        onClick={() => navigate(`/view-user/${id}`)}
                        className="text-sm px-5 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="text-sm px-5 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition disabled:opacity-50"
                    >
                        {loading ? "Saving..." : "Save changes"}
                    </button>
                </div>

            </form>
        </div>
    );
};
