import { NavLink, Outlet } from "react-router-dom";
import { useAuthStore } from "../state/useAuthStore";

const navItems = [
  { to: "/", label: "Classes", icon: "□" },
  { to: "/skills", label: "My Skills", icon: "●" },
];

export default function Layout() {
  const user = useAuthStore((s) => s.user);
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  return (
    <div style={{ display: "flex", height: "100vh", background: "#111118" }}>
      {/* Sidebar */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: 240,
          flexShrink: 0,
          background: "#16161e",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          padding: "28px 16px",
          gap: 32,
          fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px" }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 800, color: "white" }}>T</span>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#f4f4f5" }}>Teammate</span>
        </div>

        {/* Nav */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 8,
                textDecoration: "none",
                background: isActive ? "rgba(127,86,217,0.12)" : "transparent",
                color: isActive ? "#c4b5fd" : "#71717a",
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
              })}
            >
              <span style={{ fontSize: 15, opacity: 0.5 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* User */}
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 12 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px" }}>
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
              <span style={{ fontSize: 11, fontWeight: 700, color: "white" }}>{initials}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#e4e4e7" }}>
                {user?.name ?? "Guest"}
              </span>
              <span style={{ fontSize: 11, color: "#52525b" }}>{user?.email ?? ""}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          background: "#fafafb",
          overflow: "auto",
          padding: "40px 48px",
          fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}
