import { useEffect, useState } from "react";
import { useSkillsStore, type Skill } from "../state/useSkillsStore";

const SKILL_TYPE_LABELS: Record<string, string> = {
  language: "Languages",
  framework_or_library: "Frameworks & Libraries",
  database: "Databases",
  cloud: "Cloud",
  tool: "Tools",
  other: "Other",
};

const TYPE_ORDER = ["language", "framework_or_library", "database", "cloud", "tool", "other"];

const ACTIVE_SKILL_STYLES: Record<
  string,
  { bg: string; border: string; color: string; xColor: string }
> = {
  language: {
    bg: "rgba(79,70,229,0.1)",
    border: "rgba(99,102,241,0.3)",
    color: "#6d28d9",
    xColor: "#a78bfa",
  },
  framework_or_library: {
    bg: "rgba(59,130,246,0.1)",
    border: "rgba(59,130,246,0.3)",
    color: "#1d4ed8",
    xColor: "#60a5fa",
  },
  database: {
    bg: "rgba(16,185,129,0.1)",
    border: "rgba(16,185,129,0.3)",
    color: "#059669",
    xColor: "#34d399",
  },
  cloud: {
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.3)",
    color: "#b45309",
    xColor: "#fbbf24",
  },
  tool: {
    bg: "rgba(236,72,153,0.1)",
    border: "rgba(236,72,153,0.3)",
    color: "#db2777",
    xColor: "#f472b6",
  },
  other: {
    bg: "rgba(107,114,128,0.1)",
    border: "rgba(107,114,128,0.3)",
    color: "#374151",
    xColor: "#9ca3af",
  },
};

const CHECKED_BG: Record<string, string> = {
  language: "#f0eeff",
  framework_or_library: "#dbeafe",
  database: "#d1fae5",
  cloud: "#fef3c7",
  tool: "#fce7f3",
  other: "#f3f4f6",
};

const CHECKED_COLOR: Record<string, string> = {
  language: "#6d28d9",
  framework_or_library: "#1d4ed8",
  database: "#059669",
  cloud: "#b45309",
  tool: "#db2777",
  other: "#374151",
};

export default function Skills() {
  const {
    allSkills,
    userSkills,
    fetchAllSkills,
    fetchUserSkills,
    addSkills,
    removeSkills,
    createSkill,
  } = useSkillsStore();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("language");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleCreateSkill = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      await createSkill(newName.trim().toLowerCase(), newType);
      setNewName("");
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Failed to create skill");
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    fetchAllSkills();
    fetchUserSkills();
  }, []);

  const userSkillIds = new Set(userSkills.map((s) => s.id));

  const grouped = TYPE_ORDER.reduce(
    (acc, type) => {
      const skills = allSkills.filter(
        (s) =>
          s.type === type &&
          s.name.toLowerCase().includes(search.toLowerCase()) &&
          (filter === "all" || s.type === filter),
      );
      if (skills.length > 0) acc[type] = skills;
      return acc;
    },
    {} as Record<string, Skill[]>,
  );

  const toggleSkill = async (skill: Skill) => {
    if (userSkillIds.has(skill.id)) {
      await removeSkills([skill.id]);
    } else {
      await addSkills([skill.id]);
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
          Profile
        </span>
        <span style={{ fontFamily: '"Instrument Serif", serif', fontSize: 36, color: "#111118" }}>
          My Skills
        </span>
        <span style={{ fontSize: 14, color: "#71717a" }}>
          Your skills power the matchmaking engine &mdash; keep them up to date
        </span>
      </div>

      {/* Active Skills */}
      <div
        style={{
          background: "white",
          borderRadius: 14,
          padding: 28,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#111118" }}>Active Skills</span>
          <span style={{ fontSize: 13, color: "#a1a1aa" }}>{userSkills.length} selected</span>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {userSkills.length === 0 && (
            <span style={{ fontSize: 13, color: "#a1a1aa" }}>
              No skills selected. Add some below.
            </span>
          )}
          {userSkills.map((skill) => {
            const s = ACTIVE_SKILL_STYLES[skill.type] || ACTIVE_SKILL_STYLES.other;
            return (
              <div
                key={skill.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 16px",
                  background: s.bg,
                  border: `1.5px solid ${s.border}`,
                  borderRadius: 24,
                  cursor: "pointer",
                }}
                onClick={() => removeSkills([skill.id])}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: s.color }}>{skill.name}</span>
                <span style={{ fontSize: 15, color: s.xColor }}>&times;</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add New Skill to Library */}
      <div
        style={{
          background: "white",
          borderRadius: 14,
          padding: 28,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#111118" }}>Add a New Skill</span>
          <span style={{ fontSize: 13, color: "#71717a" }}>
            Don't see your skill in the list? Add it to the library.
          </span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            type="text"
            placeholder="Skill name (e.g. Pascal)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateSkill()}
            style={{
              flex: 1,
              height: 44,
              background: "#fafafb",
              border: "1.5px solid #e4e4e7",
              borderRadius: 10,
              padding: "0 16px",
              fontSize: 14,
              fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
              outline: "none",
            }}
          />
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            style={{
              height: 44,
              background: "#fafafb",
              border: "1.5px solid #e4e4e7",
              borderRadius: 10,
              padding: "0 12px",
              fontSize: 14,
              fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
              color: "#111118",
              outline: "none",
              cursor: "pointer",
            }}
          >
            {TYPE_ORDER.map((type) => (
              <option key={type} value={type}>
                {SKILL_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
          <button
            onClick={handleCreateSkill}
            disabled={creating || !newName.trim()}
            style={{
              height: 44,
              padding: "0 20px",
              background:
                creating || !newName.trim()
                  ? "#f4f4f5"
                  : "linear-gradient(135deg, #4f46e5, #7c3aed)",
              border: "none",
              borderRadius: 10,
              cursor: creating || !newName.trim() ? "default" : "pointer",
              fontSize: 14,
              fontWeight: 600,
              color: creating || !newName.trim() ? "#a1a1aa" : "white",
              fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
            }}
          >
            {creating ? "Adding..." : "Add Skill"}
          </button>
        </div>
        {createError && <span style={{ fontSize: 13, color: "#dc2626" }}>{"Duplicate skill"}</span>}
      </div>

      {/* Browse & Add */}
      <div
        style={{
          background: "white",
          borderRadius: 14,
          padding: 28,
          display: "flex",
          flexDirection: "column",
          gap: 20,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02)",
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 700, color: "#111118" }}>Browse & Add Skills</span>

        <div style={{ display: "flex", gap: 10 }}>
          <input
            type="text"
            placeholder="Search all skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              height: 44,
              background: "#fafafb",
              border: "1.5px solid #e4e4e7",
              borderRadius: 10,
              padding: "0 16px",
              fontSize: 14,
              fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
              outline: "none",
            }}
          />
          <div style={{ display: "flex", gap: 6 }}>
            {["all", ...TYPE_ORDER.slice(0, 4)].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                style={{
                  height: 44,
                  padding: "0 16px",
                  background: filter === type ? "#111118" : "#f4f4f5",
                  color: filter === type ? "white" : "#52525b",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: filter === type ? 600 : 500,
                  fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
                }}
              >
                {type === "all" ? "All" : SKILL_TYPE_LABELS[type] || type}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {Object.entries(grouped).map(([type, skills]) => (
            <div key={type} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#a1a1aa",
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                }}
              >
                {SKILL_TYPE_LABELS[type] || type}
              </span>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {skills.map((skill) => {
                  const isActive = userSkillIds.has(skill.id);
                  return (
                    <button
                      key={skill.id}
                      onClick={() => toggleSkill(skill)}
                      style={{
                        padding: "8px 16px",
                        background: isActive ? CHECKED_BG[skill.type] || "#f3f4f6" : "#f4f4f5",
                        borderRadius: 20,
                        border: "none",
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 500,
                        color: isActive ? CHECKED_COLOR[skill.type] || "#374151" : "#3f3f46",
                        opacity: isActive ? 0.6 : 1,
                        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
                      }}
                    >
                      {skill.name}
                      {isActive ? " \u2713" : ""}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
