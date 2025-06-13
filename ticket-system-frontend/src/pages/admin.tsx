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
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { token } = useAuthStore();

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const fetchUsers = async () => {
    setIsFetching(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
        headers: {
          ...(token && { "Authorization": `Bearer ${token}` })
        },
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || errorData.message || `Failed with status: ${res.status}`);
      }

      const response = await res.json();
      const userData = response.data || [];
      setUsers(userData);
      setFilteredUsers(userData);
    } catch (err) {
      console.error("Error fetching users", err);
      alert(err instanceof Error ? err.message : "Error connecting to server");
    } finally {
      setIsFetching(false);
    }
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user._id);
    setFormData({
      role: user.role,
      skills: user.skills?.join(", ") || "",
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const originalUser = users.find(u => u._id === editingUser);
      if (!originalUser) {
        throw new Error("User not found");
      }

      // Validate role
      if (!["user", "admin", "moderator"].includes(formData.role)) {
        throw new Error("Invalid role selected");
      }

      // Update role if changed
      if (originalUser.role !== formData.role) {
        await updateRole(originalUser._id, formData.role);
      }

      // Update skills if changed
      const originalSkills = originalUser.skills?.join(", ") || "";
      if (originalSkills !== formData.skills) {
        await updateSkills(originalUser._id, formData.skills);
      }

      // Update the user in the local state immediately for UI feedback
      const updatedUsers = users.map(user => {
        if (user._id === editingUser) {
          return {
            ...user,
            role: formData.role as User["role"],
            skills: formData.skills
              .split(",")
              .map(skill => skill.trim())
              .filter(Boolean)
          };
        }
        return user;
      });

      setUsers(updatedUsers);
      setFilteredUsers(
        updatedUsers.filter(user =>
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );

      setEditingUser(null);
      setFormData({ role: "", skills: "" });

      // Success message
      alert("User updated successfully");
    } catch (err: any) {
      alert("Failed to update user: " + (err.message || "Unknown error"));
    } finally {
      setIsSaving(false);
    }
  };

  const updateRole = async (userId: string, role: string) => {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/users/role`,
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

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || data.message || "Failed to update role");
    }

    return true;
  };

  const updateSkills = async (userId: string, skillsString: string) => {
    const skills = skillsString
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/users/skills`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` })
        },
        credentials: "include",
        body: JSON.stringify({
          userId,
          skills
        }),
      }
    );

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || data.message || "Failed to update skills");
    }

    return true;
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredUsers(
      users.filter((user) => user.email.toLowerCase().includes(query))
    );
  };

  const handleCancel = () => {
    setEditingUser(null);
    setFormData({ role: "", skills: "" });
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 sm:px-6 px-3">
      <h1 className="text-2xl font-bold mb-6">Admin Panel - Manage Users</h1>

      <div className="flex justify-between mb-4">
        <input
          type="text"
          className="input input-bordered w-full mr-2"
          placeholder="Search by email"
          value={searchQuery}
          onChange={handleSearch}
        />
        <button
          className="btn btn-outline"
          onClick={fetchUsers}
          disabled={isFetching}
        >
          {isFetching ? "Loading..." : "Refresh"}
        </button>
      </div>

      {isFetching && (
        <div className="text-center p-4">Loading users...</div>
      )}

      {!isFetching && filteredUsers.length === 0 && (
        <div className="text-center p-4">No users found</div>
      )}

      {filteredUsers.map((user) => (
        <div
          key={user._id}
          className="bg-base-100 shadow rounded p-4 mb-4 border"
        >
          <p>
            <strong>Name:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>

          {editingUser === user._id ? (
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
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <p>
                <strong>Current Role:</strong> {user.role}
              </p>
              <p>
                <strong>Skills:</strong>{" "}
                {user.skills && user.skills.length > 0
                  ? user.skills.join(", ")
                  : "N/A"}
              </p>
              <button
                className="btn btn-primary btn-sm mt-2"
                onClick={() => handleEditClick(user)}
              >
                Edit
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default Admin;
