import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClassesStore, type Class } from "../state/useClassesStore";
import { useAuthStore } from "../state/useAuthStore";

const CLASS_COLORS = [
  "linear-gradient(135deg, #4f46e5, #6366f1)",
  "linear-gradient(135deg, #ec4899, #f43f5e)",
  "linear-gradient(135deg, #f59e0b, #f97316)",
  "linear-gradient(135deg, #10b981, #14b8a6)",
  "linear-gradient(135deg, #6366f1, #a855f7)",
  "linear-gradient(135deg, #3b82f6, #2563eb)",
];

function getColor(id: number) {
  return CLASS_COLORS[id % CLASS_COLORS.length];
}

export default function Classes() {
  const { classes, fetchClasses, createClass, updateClass, deleteClass } = useClassesStore();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [name, setName] = useState("");
  const [section, setSection] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchClasses();
  }, []);

  const filtered = classes.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.section.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCreate = async () => {
    if (!name.trim() || !section.trim()) return;
    try {
      await createClass(name.trim(), section.trim());
      setName("");
      setSection("");
      setShowCreate(false);
    } catch (e: any) {
      alert(e.message || "Failed to create class");
    }
  };

  const handleUpdate = async () => {
    if (!editingClass || !name.trim() || !section.trim()) return;
    try {
      await updateClass(editingClass.id, { name: name.trim(), section: section.trim() });
      setEditingClass(null);
      setName("");
      setSection("");
    } catch (e: any) {
      alert(e.message || "Failed to update class");
    }
  };

  const openEdit = (cls: Class) => {
    setEditingClass(cls);
    setName(cls.name);
    setSection(cls.section);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
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
            Overview
          </span>
          <span
            style={{
              fontFamily: '"Instrument Serif", serif',
              fontSize: 36,
              color: "#111118",
            }}
          >
            Your Classes
          </span>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            height: 42,
            padding: "0 22px",
            background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            color: "white",
            fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          New Class
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search classes by name or section..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          height: 44,
          background: "white",
          border: "1.5px solid #e4e4e7",
          borderRadius: 10,
          padding: "0 18px",
          fontSize: 14,
          fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
          color: "#111118",
          outline: "none",
          boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
        }}
      />

      {/* Edit Modal */}
      {editingClass && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(17,17,24,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}
          onClick={() => setEditingClass(null)}
        >
          <div
            style={{ width: 480, background: "white", borderRadius: 16, padding: 36, display: "flex", flexDirection: "column", gap: 24, boxShadow: "0 24px 80px rgba(0,0,0,0.2)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 22, fontWeight: 700, color: "#111118" }}>Edit Class</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#27272a" }}>Class Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ height: 48, background: "#fafafb", border: "1.5px solid #e4e4e7", borderRadius: 10, padding: "0 16px", fontSize: 14, fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', outline: "none" }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#27272a" }}>Section</label>
                <input
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  style={{ height: 48, background: "#fafafb", border: "1.5px solid #e4e4e7", borderRadius: 10, padding: "0 16px", fontSize: 14, fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', outline: "none" }}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", paddingTop: 8, borderTop: "1px solid #f4f4f5" }}>
              <button
                onClick={() => setEditingClass(null)}
                style={{ height: 44, padding: "0 24px", background: "#f4f4f5", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#52525b", fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                style={{ height: 44, padding: "0 28px", background: "linear-gradient(135deg, #4f46e5, #7c3aed)", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "white", fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(17,17,24,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
          onClick={() => setShowCreate(false)}
        >
          <div
            style={{
              width: 480,
              background: "white",
              borderRadius: 16,
              padding: 36,
              display: "flex",
              flexDirection: "column",
              gap: 24,
              boxShadow: "0 24px 80px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 22, fontWeight: 700, color: "#111118" }}>Create New Class</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#27272a" }}>
                  Class Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Database Systems"
                  style={{
                    height: 48,
                    background: "#fafafb",
                    border: "1.5px solid #e4e4e7",
                    borderRadius: 10,
                    padding: "0 16px",
                    fontSize: 14,
                    fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
                    outline: "none",
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#27272a" }}>Section</label>
                <input
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  placeholder="e.g. 001"
                  style={{
                    height: 48,
                    background: "#fafafb",
                    border: "1.5px solid #e4e4e7",
                    borderRadius: 10,
                    padding: "0 16px",
                    fontSize: 14,
                    fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
                    outline: "none",
                  }}
                />
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "flex-end",
                paddingTop: 8,
                borderTop: "1px solid #f4f4f5",
              }}
            >
              <button
                onClick={() => setShowCreate(false)}
                style={{
                  height: 44,
                  padding: "0 24px",
                  background: "#f4f4f5",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#52525b",
                  fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                style={{
                  height: 44,
                  padding: "0 28px",
                  background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "white",
                  fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
                }}
              >
                Create Class
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Class Cards */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        {filtered.map((c) => (
          <ClassCard
            key={c.id}
            cls={c}
            isOwner={user?.id === c.creator_id}
            isAdmin={user?.isAdmin ?? false}
            onView={() => navigate(`/class/${c.id}`)}
            onEdit={() => openEdit(c)}
            onDelete={() => deleteClass(c.id)}
          />
        ))}
        {filtered.length === 0 && (
          <div style={{ color: "#a1a1aa", fontSize: 14, padding: 20 }}>
            No classes found. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
}

function ClassCard({
  cls,
  isOwner,
  isAdmin,
  onView,
  onEdit,
  onDelete,
}: {
  cls: Class;
  isOwner: boolean;
  isAdmin: boolean;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: 340,
        background: "white",
        borderRadius: 14,
        padding: 28,
        gap: 20,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div
          style={{
            width: 44,
            height: 44,
            background: getColor(cls.id),
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 18, fontWeight: 700, color: "white" }}>
            {cls.name.charAt(0)}
          </span>
        </div>
        <div
          style={{
            padding: "4px 12px",
            background: "#f0fdf4",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
            color: "#16a34a",
          }}
        >
          {cls.post_count ?? 0} posts
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: "#111118" }}>{cls.name}</span>
        <span style={{ fontSize: 13, color: "#71717a" }}>Section {cls.section}</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 22,
            height: 22,
            background: getColor(cls.creator_id || 0),
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 8, fontWeight: 700, color: "white" }}>
            {(cls.creator_name || "?").slice(0, 2).toUpperCase()}
          </span>
        </div>
        <span style={{ fontSize: 13, color: "#52525b" }}>
          {isOwner ? "Created by you" : `Created by ${cls.creator_name}`}
        </span>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={onView}
          style={{
            flex: 1,
            height: 40,
            border: "1.5px solid #e4e4e7",
            borderRadius: 8,
            background: "white",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
            color: "#27272a",
            fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
          }}
        >
          View Posts
        </button>
        {(isOwner || isAdmin) && (
          <>
            <button
              onClick={onEdit}
              style={{
                height: 40,
                padding: "0 16px",
                background: "#f4f4f5",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                color: "#27272a",
                fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
              }}
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              style={{
                height: 40,
                padding: "0 16px",
                background: "#fef2f2",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                color: "#dc2626",
                fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
              }}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
