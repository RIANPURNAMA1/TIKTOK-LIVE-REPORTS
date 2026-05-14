"use client";

import { useState, useEffect } from "react";
import { Settings, UserPlus, Shield, ShieldOff, Trash2, Save, X, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useSidebar } from "@/lib/sidebar-context";

interface User {
  id: number;
  username: string;
  nama: string;
  role: "admin" | "user";
  created_at: string;
}

export default function PengaturanPage() {
  const { collapsed } = useSidebar();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ username: "", password: "", nama: "", role: "user" });
  const [addLoading, setAddLoading] = useState(false);

  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ nama: "", role: "user", password: "" });
  const [editLoading, setEditLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const json = await res.json();
      if (json.success) setUsers(json.data);
      else setError(json.error);
    } catch {
      setError("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setError("");
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setShowAdd(false);
      setAddForm({ username: "", password: "", nama: "", role: "user" });
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menambah user");
    } finally {
      setAddLoading(false);
    }
  };

  const handleEdit = async (id: number) => {
    setEditLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setEditId(null);
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengupdate user");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id: number, username: string) => {
    if (!confirm(`Hapus user "${username}"?`)) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setSuccess("User berhasil dihapus");
      setTimeout(() => setSuccess(""), 3000);
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus user");
    }
  };

  const startEdit = (u: User) => {
    setEditId(u.id);
    setEditForm({ nama: u.nama, role: u.role, password: "" });
  };

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-[#F0F2F5]">
        <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
        <Header onMenuToggle={() => setMobileOpen((p) => !p)} />
        <main className={`flex-1 transition-all duration-300 ${collapsed ? "lg:pl-16" : "lg:pl-64"}`}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pt-[72px] lg:pt-[72px]">
            {/* Header */}
            <div className="bg-white border border-gray-200 rounded-sm p-5 mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-[#1c1e21] flex items-center gap-2">
                  <Settings size={24} className="text-[#0866FF]" />
                  Pengaturan
                </h1>
                <p className="text-[13px] text-[#65676b] mt-0.5">Kelola pengguna dan role akses sistem</p>
              </div>
              <button
                onClick={() => setShowAdd(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#0866FF] hover:bg-[#0759df] rounded-sm transition-colors"
              >
                <UserPlus size={16} />
                Tambah User
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-sm text-sm text-red-600 flex items-start gap-2">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-sm text-sm text-emerald-700 flex items-center gap-2">
                <CheckCircle size={16} />
                {success}
              </div>
            )}

            {/* Add User Modal */}
            {showAdd && (
              <div className="fixed inset-0 z-50 bg-black/20 flex items-center justify-center p-4">
                <div className="bg-white rounded-sm shadow-lg w-full max-w-md">
                  <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="font-bold text-[#1c1e21]">Tambah User Baru</h3>
                    <button onClick={() => setShowAdd(false)} className="p-1 hover:bg-gray-100 rounded-full"><X size={18} /></button>
                  </div>
                  <form onSubmit={handleAdd} className="p-5 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#65676b] mb-1">Username</label>
                      <input
                        type="text" required
                        value={addForm.username}
                        onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-sm outline-none focus:bg-white focus:border-[#0866FF]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#65676b] mb-1">Password</label>
                      <input
                        type="password" required
                        value={addForm.password}
                        onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-sm outline-none focus:bg-white focus:border-[#0866FF]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#65676b] mb-1">Nama</label>
                      <input
                        type="text" required
                        value={addForm.nama}
                        onChange={(e) => setAddForm({ ...addForm, nama: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-sm outline-none focus:bg-white focus:border-[#0866FF]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#65676b] mb-1">Role</label>
                      <select
                        value={addForm.role}
                        onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-sm outline-none focus:bg-white focus:border-[#0866FF]"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button type="submit" disabled={addLoading} className="flex-1 py-2 bg-[#0866FF] hover:bg-[#0759df] text-white font-bold rounded-sm text-sm flex items-center justify-center gap-2">
                        {addLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        Simpan
                      </button>
                      <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#1c1e21] font-bold rounded-sm text-sm">Batal</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Users Table */}
            <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 bg-[#f5f6f7]">
                <h3 className="text-sm font-bold text-[#1c1e21] uppercase tracking-wider">
                  Daftar Pengguna ({users.length})
                </h3>
              </div>

              {loading ? (
                <div className="p-10 text-center">
                  <Loader2 size={24} className="animate-spin text-[#0866FF] mx-auto" />
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <div key={u.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50">
                      {editId === u.id ? (
                        /* Edit Mode */
                        <div className="flex-1 flex items-center gap-3">
                          <div className="flex-1 grid grid-cols-3 gap-3">
                            <input
                              value={editForm.nama}
                              onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
                              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-sm text-sm outline-none focus:border-[#0866FF]"
                              placeholder="Nama"
                            />
                            <select
                              value={editForm.role}
                              onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-sm text-sm outline-none focus:border-[#0866FF]"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                            <input
                              type="password"
                              value={editForm.password}
                              onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-sm text-sm outline-none focus:border-[#0866FF]"
                              placeholder="Password baru (opsional)"
                            />
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => handleEdit(u.id)} disabled={editLoading} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-full">
                              {editLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            </button>
                            <button onClick={() => setEditId(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-full">
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* View Mode */
                        <>
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold ${u.role === "admin" ? "bg-amber-500" : "bg-[#0866FF]"}`}>
                              {u.nama.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#1c1e21]">{u.nama}</p>
                              <p className="text-xs text-[#65676b]">@{u.username}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-[11px] font-bold uppercase ${u.role === "admin" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"}`}>
                              {u.role === "admin" ? <Shield size={12} /> : <ShieldOff size={12} />}
                              {u.role}
                            </span>
                            <button onClick={() => startEdit(u)} className="p-1.5 text-[#0866FF] hover:bg-blue-50 rounded-full transition-colors" title="Edit">
                              <Save size={14} />
                            </button>
                            <button onClick={() => handleDelete(u.id, u.nama)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Hapus">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
