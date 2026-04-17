import { useEffect, useState } from "react";
import { endpoints } from "../networkUtils";
import type { AdminUser } from "../networkUtils";

export default function Admin() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [promoting, setPromoting] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    endpoints
      .getUsers()
      .then((data) => setUsers(data.users))
      .catch((e) => setError(e.message ?? "Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (!confirm(`Are you sure you want to delete ${userName}'s account? This cannot be undone.`)) return;
    setDeleting(userId);
    try {
      await endpoints.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete user");
    } finally {
      setDeleting(null);
    }
  };

  const handleMakeAdmin = async (userId: number) => {
    setPromoting(userId);
    try {
      await endpoints.makeAdmin(userId);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, is_admin: true } : u)));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to promote user");
    } finally {
      setPromoting(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#a1a1aa",
            textTransform: "uppercase",
            letterSpacing: 1.2,
          }}
        >
          Administration
        </span>
        <span
          style={{
            fontFamily: '"Instrument Serif", serif',
            fontSize: 36,
            color: "#111118",
          }}
        >
          User Management
        </span>
      </div>

      <div
        style={{
          background: "white",
          borderRadius: 14,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02)",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div style={{ padding: 32, color: "#a1a1aa", fontSize: 14 }}>Loading users...</div>
        ) : error ? (
          <div style={{ padding: 32, color: "#dc2626", fontSize: 14 }}>{error}</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1.5px solid #f4f4f5" }}>
                {["Name", "Email", "Role", "Joined", "Actions"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "14px 20px",
                      textAlign: "left",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#71717a",
                      textTransform: "uppercase",
                      letterSpacing: 0.8,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, idx) => (
                <tr
                  key={u.id}
                  style={{
                    borderBottom: idx < users.length - 1 ? "1px solid #f4f4f5" : "none",
                  }}
                >
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          background: "linear-gradient(135deg, #6366f1, #a855f7)",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <span style={{ fontSize: 11, fontWeight: 700, color: "white" }}>
                          {u.name.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#111118" }}>
                        {u.name}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "16px 20px", fontSize: 14, color: "#52525b" }}>
                    {u.email}
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 10px",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                        background: u.is_admin ? "rgba(79,70,229,0.08)" : "#f4f4f5",
                        color: u.is_admin ? "#4f46e5" : "#71717a",
                        border: u.is_admin
                          ? "1px solid rgba(79,70,229,0.2)"
                          : "1px solid transparent",
                      }}
                    >
                      {u.is_admin ? "Admin" : "User"}
                    </span>
                  </td>
                  <td style={{ padding: "16px 20px", fontSize: 13, color: "#71717a" }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      {!u.is_admin && (
                        <button
                          onClick={() => handleMakeAdmin(u.id)}
                          disabled={promoting === u.id}
                          style={{
                            padding: "6px 14px",
                            background:
                              promoting === u.id
                                ? "#f4f4f5"
                                : "linear-gradient(135deg, #4f46e5, #7c3aed)",
                            border: "none",
                            borderRadius: 8,
                            cursor: promoting === u.id ? "default" : "pointer",
                            fontSize: 12,
                            fontWeight: 600,
                            color: promoting === u.id ? "#a1a1aa" : "white",
                            fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
                          }}
                        >
                          {promoting === u.id ? "Promoting..." : "Make Admin"}
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        disabled={deleting === u.id}
                        style={{
                          padding: "6px 14px",
                          background: deleting === u.id ? "#f4f4f5" : "rgba(220,38,38,0.08)",
                          border: "1px solid",
                          borderColor: deleting === u.id ? "transparent" : "rgba(220,38,38,0.2)",
                          borderRadius: 8,
                          cursor: deleting === u.id ? "default" : "pointer",
                          fontSize: 12,
                          fontWeight: 600,
                          color: deleting === u.id ? "#a1a1aa" : "#dc2626",
                          fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
                        }}
                      >
                        {deleting === u.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
