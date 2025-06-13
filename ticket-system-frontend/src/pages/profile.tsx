import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuthStore } from "../store";
import type { User } from "../types";

interface ProfileForm {
  name: string;
  skills: string;
}

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser, token, setAuth } = useAuthStore();
  const navigate = useNavigate();
  
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState<ProfileForm>({ name: "", skills: "" });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        // If no ID provided or ID matches current user, use current user data
        if (!id || (currentUser && id === currentUser._id)) {
          if (currentUser) {
            setUser(currentUser);
            setForm({
              name: currentUser.name || "",
              skills: currentUser.skills?.join(", ") || ""
            });
          }
          setLoading(false);
          return;
        }

        // Otherwise fetch the user profile
        const res = await fetch(`${import.meta.env.VITE_API_URL}/users/profile/${id}`, {
          headers: {
            ...(token && { "Authorization": `Bearer ${token}` })
          },
          credentials: "include"
        });

        if (!res.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const data = await res.json();
        if (data.success && data.data) {
          setUser(data.data);
          setForm({
            name: data.data.name || "",
            skills: data.data.skills?.join(", ") || ""
          });
        } else {
          throw new Error(data.message || "Failed to fetch user profile");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [id, currentUser, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError("");

    try {
      const skills = form.skills
        .split(",")
        .map(skill => skill.trim())
        .filter(Boolean);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` })
        },
        credentials: "include",
        body: JSON.stringify({
          name: form.name,
          skills
        })
      });

      const data = await res.json();

      if (res.ok) {
        // Update the local user state
        if (user) {
          const updatedUser = {
            ...user,
            name: form.name,
            skills
          };
          setUser(updatedUser);
          
          // If this is the current user, update the auth store
          if (currentUser && user._id === currentUser._id) {
            setAuth({
              ...currentUser,
              name: form.name,
              skills
            }, token);
          }
        }
        
        alert("Profile updated successfully!");
      } else {
        throw new Error(data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading profile...</div>;
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-red-100 rounded-lg">
        <h2 className="text-xl font-bold text-red-700 mb-2">Error</h2>
        <p className="text-red-700">{error}</p>
        <button 
          className="mt-4 btn btn-primary" 
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center p-8">
        <p>User not found</p>
        <button 
          className="mt-4 btn btn-primary" 
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
    );
  }

  const isOwnProfile = currentUser && user._id === currentUser._id;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        {isOwnProfile ? "My Profile" : `${user.name}'s Profile`}
      </h1>

      <div className="card bg-base-200 shadow-xl p-6">
        <div className="mb-4">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          {user.createdAt && (
            <p><strong>Member since:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
          )}
        </div>

        {isOwnProfile ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="input input-bordered w-full"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block mb-2">Skills (comma separated)</label>
              <textarea
                name="skills"
                value={form.skills}
                onChange={handleChange}
                className="textarea textarea-bordered w-full"
                placeholder="React, Node.js, MongoDB"
              ></textarea>
            </div>

            {error && (
              <div className="text-red-500">{error}</div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={updating}
              >
                {updating ? "Updating..." : "Update Profile"}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <h3 className="font-semibold mt-4">Skills</h3>
            {user.skills && user.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {user.skills.map((skill, index) => (
                  <span key={index} className="badge badge-primary">{skill}</span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 mt-2">No skills listed</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;