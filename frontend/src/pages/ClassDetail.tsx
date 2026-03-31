import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePostsStore, type Post, type PostGroup } from "../state/usePostsStore";
import { useClassesStore } from "../state/useClassesStore";
import { useGroupsStore } from "../state/useGroupsStore";
import { useAuthStore } from "../state/useAuthStore";

const SKILL_COLORS: Record<string, { bg: string; color: string }> = {
  Python: { bg: "rgba(79,70,229,0.08)", color: "#6d28d9" },
  PostgreSQL: { bg: "rgba(16,185,129,0.08)", color: "#059669" },
  React: { bg: "rgba(59,130,246,0.08)", color: "#2563eb" },
  Java: { bg: "rgba(236,72,153,0.08)", color: "#db2777" },
  Spring: { bg: "rgba(16,185,129,0.08)", color: "#059669" },
  JavaScript: { bg: "rgba(245,158,11,0.08)", color: "#b45309" },
  TypeScript: { bg: "rgba(59,130,246,0.08)", color: "#1d4ed8" },
};

const AVATAR_COLORS = [
  "linear-gradient(135deg, #6366f1, #a855f7)",
  "linear-gradient(135deg, #ec4899, #f43f5e)",
  "linear-gradient(135deg, #10b981, #14b8a6)",
  "linear-gradient(135deg, #f59e0b, #f97316)",
  "linear-gradient(135deg, #3b82f6, #2563eb)",
];

function getSkillStyle(skill: string) {
  return SKILL_COLORS[skill] || { bg: "rgba(99,102,241,0.08)", color: "#4f46e5" };
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function ClassDetail() {
  const { id } = useParams<{ id: string }>();
  const classId = Number(id);
  const navigate = useNavigate();
  const { posts, fetchPosts, createPost, updatePost, deletePost } = usePostsStore();
  const { classes, fetchClasses, deleteClass } = useClassesStore();
  const { joinGroup, leaveGroup } = useGroupsStore();
  const user = useAuthStore((s) => s.user);

  const [showCreate, setShowCreate] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [groupName, setGroupName] = useState("");
  const [maxMembers, setMaxMembers] = useState("4");

  const cls = classes.find((c) => c.id === classId);
  const isOwner = user?.id === cls?.creator_id;

  useEffect(() => {
    fetchPosts(classId);
    if (classes.length === 0) fetchClasses();
  }, [classId]);

  const handleCreate = async () => {
    if (!title.trim() || !description.trim() || !groupName.trim()) return;
    try {
      await createPost(classId, title.trim(), description.trim(), groupName.trim(), Number(maxMembers));
      setTitle("");
      setDescription("");
      setGroupName("");
      setMaxMembers("4");
      setShowCreate(false);
    } catch (e: any) {
      alert(e.message || "Failed to create post");
    }
  };

  const handleUpdate = async () => {
    if (!editingPost || !title.trim() || !description.trim()) return;
    try {
      await updatePost(editingPost.id, { title: title.trim(), description: description.trim() });
      setEditingPost(null);
      setTitle("");
      setDescription("");
      await fetchPosts(classId);
    } catch (e: any) {
      alert(e.message || "Failed to update post");
    }
  };

  const openEdit = (post: Post) => {
    setEditingPost(post);
    setTitle(post.title);
    setDescription(post.description);
  };

  const handleDeleteClass = async () => {
    await deleteClass(classId);
    navigate("/");
  };

  const handleGroupAction = async (group: PostGroup, action: "join" | "leave") => {
    try {
      if (action === "join") await joinGroup(group.id);
      else await leaveGroup(group.id);
      await fetchPosts(classId);
    } catch (e: any) {
      alert(e.message || `Failed to ${action} group`);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          onClick={() => navigate("/")}
          style={{ fontSize: 13, fontWeight: 500, color: "#7c3aed", cursor: "pointer" }}
        >
          Classes
        </span>
        <span style={{ fontSize: 13, color: "#a1a1aa" }}>/</span>
        <span style={{ fontSize: 13, fontWeight: 500, color: "#52525b" }}>
          {cls?.name ?? "Loading..."}
        </span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 48,
              height: 48,
              background: "linear-gradient(135deg, #4f46e5, #6366f1)",
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 20, fontWeight: 700, color: "white" }}>
              {cls?.name?.charAt(0) ?? "?"}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontFamily: '"Instrument Serif", serif', fontSize: 32, color: "#111118" }}>
              {cls?.name ?? "Loading..."}
            </span>
            <span style={{ fontSize: 13, color: "#71717a" }}>
              Section {cls?.section} &middot; {posts.length} posts
              {isOwner ? " · Created by you" : cls ? ` · Created by ${cls.creator_name}` : ""}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => {
              setShowCreate(true);
              setEditingPost(null);
              setTitle("");
              setDescription("");
              setGroupName("");
              setMaxMembers("4");
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              height: 40,
              padding: "0 20px",
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
            <span style={{ fontSize: 18, fontWeight: 300 }}>+</span>
            New Post
          </button>
          {isOwner && (
            <button
              onClick={handleDeleteClass}
              style={{
                height: 40,
                padding: "0 16px",
                background: "#fef2f2",
                border: "1.5px solid #fecaca",
                borderRadius: 10,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                color: "#dc2626",
                fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
              }}
            >
              Delete Class
            </button>
          )}
        </div>
      </div>

      {/* Posts */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            isAuthor={user?.id === post.author_id}
            userId={user?.id}
            onEdit={() => openEdit(post)}
            onDelete={() => deletePost(post.id)}
            onGroupAction={handleGroupAction}
          />
        ))}
        {posts.length === 0 && (
          <div style={{ color: "#a1a1aa", fontSize: 14, padding: 20 }}>
            No posts yet. Be the first to post!
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreate || editingPost) && (
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
            setEditingPost(null);
          }}
        >
          <div
            style={{
              width: 540,
              background: "white",
              borderRadius: 16,
              padding: 36,
              display: "flex",
              flexDirection: "column",
              gap: 28,
              boxShadow: "0 24px 80px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: "#111118" }}>
                  {editingPost ? "Edit Post" : "Create Group Ad"}
                </span>
                <span style={{ fontSize: 13, color: "#71717a" }}>
                  {cls?.name} &middot; Section {cls?.section}
                </span>
              </div>
              <button
                onClick={() => {
                  setShowCreate(false);
                  setEditingPost(null);
                }}
                style={{
                  width: 32,
                  height: 32,
                  background: "#f4f4f5",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 16,
                  color: "#71717a",
                }}
              >
                &times;
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#27272a" }}>Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Looking for a frontend developer"
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
                <label style={{ fontSize: 13, fontWeight: 600, color: "#27272a" }}>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your project, what skills you need, etc."
                  style={{
                    height: 100,
                    background: "#fafafb",
                    border: "1.5px solid #e4e4e7",
                    borderRadius: 10,
                    padding: "14px 16px",
                    fontSize: 14,
                    fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </div>

              {/* Group fields — only shown on create, not edit */}
              {!editingPost && (
                <>
                  <div style={{ height: 1, background: "#f4f4f5" }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#111118" }}>Your Group</span>
                    <span style={{ fontSize: 12, color: "#71717a" }}>
                      This post is an ad for your group. People can join directly from the post.
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: "#27272a" }}>Group Name</label>
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
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, width: 120 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: "#27272a" }}>Max Members</label>
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
                </>
              )}
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
                  setEditingPost(null);
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
                onClick={editingPost ? handleUpdate : handleCreate}
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
                {editingPost ? "Save Changes" : "Post & Create Group"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PostCard({
  post,
  isAuthor,
  userId,
  onEdit,
  onDelete,
  onGroupAction,
}: {
  post: Post;
  isAuthor: boolean;
  userId?: number;
  onEdit: () => void;
  onDelete: () => void;
  onGroupAction: (group: PostGroup, action: "join" | "leave") => void;
}) {
  const knownSkills = ["Python", "PostgreSQL", "React", "Java", "Spring", "JavaScript", "TypeScript", "Go", "Rust", "Docker", "Express", "Django", "Next.js", "Vue", "Angular", "MongoDB", "MySQL", "Redis", "AWS", "Firebase"];
  const mentionedSkills = knownSkills.filter(
    (s) =>
      post.title.toLowerCase().includes(s.toLowerCase()) ||
      post.description.toLowerCase().includes(s.toLowerCase()),
  );

  const group = post.group;
  const isMember = group?.members?.some((m) => m.account_id === userId);
  const isGroupOwner = group?.created_by === userId;
  const isFull = group ? group.members.length >= group.max_members : false;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        background: "white",
        borderRadius: 14,
        padding: 28,
        gap: 18,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02)",
      }}
    >
      {/* Post content */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, paddingRight: 20 }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: "#111118" }}>{post.title}</span>
          <span style={{ fontSize: 14, color: "#52525b", lineHeight: 1.6 }}>{post.description}</span>
        </div>
        {isAuthor && (
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <button
              onClick={onEdit}
              style={{
                padding: "6px 14px",
                background: "#f4f4f5",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                color: "#52525b",
                fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
              }}
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              style={{
                padding: "6px 14px",
                background: "#fef2f2",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                color: "#dc2626",
                fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Skill tags */}
      {mentionedSkills.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {mentionedSkills.map((skill) => {
            const s = getSkillStyle(skill);
            return (
              <span
                key={skill}
                style={{
                  padding: "4px 12px",
                  background: s.bg,
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  color: s.color,
                }}
              >
                {skill}
              </span>
            );
          })}
        </div>
      )}

      {/* Inline group */}
      {group && (
        <div
          style={{
            background: "#fafafb",
            border: "1.5px solid #e4e4e7",
            borderRadius: 12,
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 700, color: "white" }}>
                  {group.group_name.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#111118" }}>{group.group_name}</span>
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: isFull ? "#dc2626" : "#16a34a",
                background: isFull ? "#fef2f2" : "#f0fdf4",
                padding: "3px 10px",
                borderRadius: 20,
              }}
            >
              {group.members.length} / {group.max_members} {isFull ? "· Full" : "· Open"}
            </span>
          </div>

          {/* Members */}
          {group.members.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {group.members.map((member, idx) => (
                <div
                  key={member.account_id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "4px 10px",
                    background: "white",
                    borderRadius: 20,
                    border: "1px solid #e4e4e7",
                  }}
                >
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      background: AVATAR_COLORS[idx % AVATAR_COLORS.length],
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ fontSize: 7, fontWeight: 700, color: "white" }}>
                      {member.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "#3f3f46" }}>{member.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* Join/Leave */}
          {!isGroupOwner && (
            isMember ? (
              <button
                onClick={() => onGroupAction(group, "leave")}
                style={{
                  alignSelf: "flex-start",
                  padding: "8px 18px",
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
                onClick={() => !isFull && onGroupAction(group, "join")}
                disabled={isFull}
                style={{
                  alignSelf: "flex-start",
                  padding: "8px 18px",
                  background: isFull ? "#f4f4f5" : "linear-gradient(135deg, #4f46e5, #7c3aed)",
                  border: "none",
                  borderRadius: 8,
                  cursor: isFull ? "default" : "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  color: isFull ? "#a1a1aa" : "white",
                  fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
                }}
              >
                {isFull ? "Group Full" : "Join Group"}
              </button>
            )
          )}
          {isGroupOwner && (
            <span style={{ fontSize: 12, color: "#7c3aed", fontWeight: 500 }}>You own this group</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          paddingTop: 4,
          borderTop: "1px solid #f4f4f5",
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            background: "linear-gradient(135deg, #6366f1, #a855f7)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 9, fontWeight: 700, color: "white" }}>
            {(post.author_name || "?").slice(0, 2).toUpperCase()}
          </span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#27272a" }}>
          {post.author_name || "Unknown"}
        </span>
        <span style={{ fontSize: 12, color: "#a1a1aa" }}>&middot; {timeAgo(post.created_at)}</span>
      </div>
    </div>
  );
}
