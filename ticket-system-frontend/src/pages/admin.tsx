import { useEffect, useState } from "react";
import type { User } from "../types";
import { useAuthStore } from "../store";

interface UserFormData {
  role: string;
  skills: string;
}

const Admin = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserFormData>({ role: "", skills: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useAuthStore();

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    try {
      const data = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
        headers: {
          ...(token && { "Authorization": `Bearer ${token}` })
        },
        credentials: "include", // Send cookies for authentication
      });
      const response = await data.json();
      if (data.ok) {
        setUsers(response.data);
        setFilteredUsers(response.data);
      } else {
        console.error(response.error || response.message);
      }
    } catch (err) {
      console.error("Error fetching users", err);
    }
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user.email);
    setFormData({
      role: user.role,
      skills: user.skills?.join(", ") || "",
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // First update role if changed
      const originalUser = users.find(u => u.email === editingUser);
      if (originalUser && originalUser.role !== formData.role) {
        await updateRole(editingUser!, formData.role);
      }

      // Then update skills if changed
      const originalSkills = originalUser?.skills?.join(", ") || "";
      if (originalSkills !== formData.skills) {
        await updateSkills(editingUser!, formData.skills);
      }

      setEditingUser(null);
      setFormData({ role: "", skills: "" });
      fetchUsers();
    } catch (err) {
      console.error("Update failed", err);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (userId: string, role: string) => {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/users/role`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` })
        },
        credentials: "include",
        body: JSON.stringify({
          userId,
          role
        }),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || data.message || "Failed to update role");
    }
    return data;
  };

  const updateSkills = async (email: string, skillsString: string) => {
    const skills = skillsString
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    if (skills.length === 0) return true;

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/users/profile`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` })
        },
        credentials: "include",
        body: JSON.stringify({
          skills
        }),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || data.message || "Failed to update skills");
    }
    return data;
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredUsers(
      users.filter((user) => user.email.toLowerCase().includes(query))
    );
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Admin Panel - Manage Users</h1>
      <input
        type="text"
        className="input input-bordered w-full mb-6"
        placeholder="Search by email"
        value={searchQuery}
        onChange={handleSearch}
      />
      {filteredUsers.map((user) => (
        <div
          key={user._id}
          className="bg-base-100 shadow rounded p-4 mb-4 border"
        >
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Current Role:</strong> {user.role}
          </p>
          <p>
            <strong>Skills:</strong>{" "}
            {user.skills && user.skills.length > 0
              ? user.skills.join(", ")
              : "N/A"}
          </p>

          {editingUser === user.email ? (
            <div className="mt-4 space-y-2">
              <select
                className="select select-bordered w-full"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>

              <input
                type="text"
                placeholder="Comma-separated skills"
                className="input input-bordered w-full"
                value={formData.skills}
                onChange={(e) =>
                  setFormData({ ...formData, skills: e.target.value })
                }
              />

              <div className="flex gap-2">
                <button
                  className="btn btn-success btn-sm"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setEditingUser(null)}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              className="btn btn-primary btn-sm mt-2"
              onClick={() => handleEditClick(user)}
            >
              Edit
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default Admin;
