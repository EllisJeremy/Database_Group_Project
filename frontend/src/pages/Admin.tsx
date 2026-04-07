import { useEffect, useState } from "react";
import { api } from "../networkUtils";

interface AdminUser {
  id: number;
  email: string;
  name: string;
  is_admin: boolean;
  created_at: string;
}

export default function Admin() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoting, setPromoting] = useState<number | null>(null);

  useEffect(() => {
    api.get<{ success: boolean; users: AdminUser[] }>("/admin/users")
      .then((data) => setUsers(data.users))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleMakeAdmin = async (userId: number) => {
    setPromoting(userId);
    try {
      await api.put(`/admin/users/${userId}/make-admin`, {});
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_admin: true } : u)),
      );
    } catch (e: any) {
      alert(e.message || "Failed to promote user");
    } finally {
      setPromoting(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
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

      {/* Users Table */}
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
                        border: u.is_admin ? "1px solid rgba(79,70,229,0.2)" : "1px solid transparent",
                      }}
                    >
                      {u.is_admin ? "Admin" : "User"}
                    </span>
                  </td>
                  <td style={{ padding: "16px 20px", fontSize: 13, color: "#71717a" }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    {!u.is_admin && (
                      <button
                        onClick={() => handleMakeAdmin(u.id)}
                        disabled={promoting === u.id}
                        style={{
                          padding: "6px 14px",
                          background: promoting === u.id ? "#f4f4f5" : "linear-gradient(135deg, #4f46e5, #7c3aed)",
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
