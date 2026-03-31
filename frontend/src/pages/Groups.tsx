import { useEffect, useState } from "react";
import { useGroupsStore, type Group } from "../state/useGroupsStore";
import { useClassesStore } from "../state/useClassesStore";
import { useAuthStore } from "../state/useAuthStore";

const GROUP_COLORS = [
  "linear-gradient(135deg, #4f46e5, #6366f1)",
  "linear-gradient(135deg, #ec4899, #f43f5e)",
  "linear-gradient(135deg, #f59e0b, #f97316)",
  "linear-gradient(135deg, #10b981, #14b8a6)",
  "linear-gradient(135deg, #6366f1, #a855f7)",
  "linear-gradient(135deg, #3b82f6, #2563eb)",
];

const AVATAR_COLORS = [
  "linear-gradient(135deg, #6366f1, #a855f7)",
  "linear-gradient(135deg, #ec4899, #f43f5e)",
  "linear-gradient(135deg, #10b981, #14b8a6)",
  "linear-gradient(135deg, #f59e0b, #f97316)",
  "linear-gradient(135deg, #3b82f6, #2563eb)",
];

export default function Groups() {
  const { groups, fetchGroups, createGroup, updateGroup, deleteGroup, leaveGroup } =
    useGroupsStore();
  const { classes, fetchClasses } = useClassesStore();
  const user = useAuthStore((s) => s.user);

  const [showCreate, setShowCreate] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [groupName, setGroupName] = useState("");
  const [maxMembers, setMaxMembers] = useState("4");
  const [classId, setClassId] = useState("");

  useEffect(() => {
    fetchGroups();
    if (classes.length === 0) fetchClasses();
  }, []);

  const handleCreate = async () => {
    if (!groupName.trim() || !classId) return;
    try {
      await createGroup(Number(classId), groupName.trim(), Number(maxMembers));
      setGroupName("");
      setMaxMembers("4");
      setClassId("");
      setShowCreate(false);
    } catch (e: any) {
      alert(e.message || "Failed to create group");
    }
  };

  const handleUpdate = async () => {
    if (!editingGroup || !groupName.trim()) return;
    try {
      await updateGroup(editingGroup.id, {
        group_name: groupName.trim(),
        max_members: Number(maxMembers),
      });
      setEditingGroup(null);
      setGroupName("");
      setMaxMembers("4");
    } catch (e: any) {
      alert(e.message || "Failed to update group");
    }
  };

  const openEdit = (group: Group) => {
    setEditingGroup(group);
    setGroupName(group.group_name);
    setMaxMembers(String(group.max_members));
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
            Teams
          </span>
          <span style={{ fontFamily: '"Instrument Serif", serif', fontSize: 36, color: "#111118" }}>
            My Groups
          </span>
        </div>
        <button
          onClick={() => {
            setShowCreate(true);
            setEditingGroup(null);
            setGroupName("");
            setMaxMembers("4");
            setClassId("");
          }}
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
            fontSize: 14,
            fontWeight: 600,
            fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
          }}
        >
          <span style={{ fontSize: 20, fontWeight: 300 }}>+</span>
          Create Group
        </button>
      </div>

      {/* Group Cards */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        {groups.map((group) => {
          const isOwner = user?.id === group.created_by;
          const isMember = group.members?.some((m) => m.account_id === user?.id);
          return (
            <div
              key={group.id}
              style={{
                display: "flex",
                flexDirection: "column",
                width: 400,
                background: "white",
                borderRadius: 14,
                padding: 28,
                gap: 20,
                boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02)",
              }}
            >
              {/* Top */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      background: GROUP_COLORS[group.id % GROUP_COLORS.length],
                      borderRadius: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ fontSize: 16, fontWeight: 700, color: "white" }}>
                      {group.group_name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ fontSize: 17, fontWeight: 700, color: "#111118" }}>
                      {group.group_name}
                    </span>
                    <span style={{ fontSize: 12, color: "#71717a" }}>
                      {group.class_name || "Class"} &middot; Sec {group.class_section || "?"}
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    padding: "5px 14px",
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#16a34a",
                  }}
                >
                  {group.members?.length || 0} / {group.max_members}
                </div>
              </div>

              {/* Members */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#a1a1aa",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Members
                </span>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {(group.members || []).map((member, idx) => (
                    <div
                      key={member.account_id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 12px",
                        background: "#fafafb",
                        borderRadius: 20,
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          background: AVATAR_COLORS[idx % AVATAR_COLORS.length],
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <span style={{ fontSize: 8, fontWeight: 700, color: "white" }}>
                          {member.name.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 500, color: "#3f3f46" }}>
                        {member.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 8 }}>
                {isOwner ? (
                  <>
                    <button
                      onClick={() => openEdit(group)}
                      style={{
                        flex: 1,
                        height: 38,
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
                      Edit
                    </button>
                    <button
                      onClick={() => deleteGroup(group.id)}
                      style={{
                        height: 38,
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
                ) : isMember ? (
                  <button
                    onClick={() => leaveGroup(group.id)}
                    style={{
                      flex: 1,
                      height: 38,
                      background: "#fff7ed",
                      border: "1.5px solid #fed7aa",
                      borderRadius: 8,
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#ea580c",
                      fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
                    }}
                  >
                    Leave Group
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const { joinGroup } = useGroupsStore.getState();
                      joinGroup(group.id);
                    }}
                    style={{
                      flex: 1,
                      height: 38,
                      background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                      border: "none",
                      borderRadius: 8,
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "white",
                      fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
                    }}
                  >
                    Join Group
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {groups.length === 0 && (
          <div style={{ color: "#a1a1aa", fontSize: 14, padding: 20 }}>
            No groups yet. Create one to get started.
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {(showCreate || editingGroup) && (
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
          onClick={() => {
            setShowCreate(false);
            setEditingGroup(null);
          }}
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
            <div style={{ fontSize: 22, fontWeight: 700, color: "#111118" }}>
              {editingGroup ? "Edit Group" : "Create New Group"}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {!editingGroup && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#27272a" }}>Class</label>
                  <select
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
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
                  >
                    <option value="">Select a class...</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} - Section {c.section}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#27272a" }}>
                  Group Name
                </label>
                <input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. DB Heroes"
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
                <label style={{ fontSize: 13, fontWeight: 600, color: "#27272a" }}>
                  Max Members
                </label>
                <input
                  type="number"
                  min="2"
                  max="20"
                  value={maxMembers}
                  onChange={(e) => setMaxMembers(e.target.value)}
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
                onClick={() => {
                  setShowCreate(false);
                  setEditingGroup(null);
                }}
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
                onClick={editingGroup ? handleUpdate : handleCreate}
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
                {editingGroup ? "Save Changes" : "Create Group"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
