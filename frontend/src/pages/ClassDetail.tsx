import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePostsStore, type Post } from "../state/usePostsStore";
import { useClassesStore } from "../state/useClassesStore";
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
  const user = useAuthStore((s) => s.user);

  const [showCreate, setShowCreate] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const cls = classes.find((c) => c.id === classId);
  const isOwner = user?.id === cls?.creator_id;

  useEffect(() => {
    fetchPosts(classId);
    if (classes.length === 0) fetchClasses();
  }, [classId]);

  const handleCreate = async () => {
    if (!title.trim() || !description.trim()) return;
    try {
      await createPost(classId, title.trim(), description.trim());
      setTitle("");
      setDescription("");
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
            onEdit={() => openEdit(post)}
            onDelete={() => deletePost(post.id)}
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
                  {editingPost ? "Edit Post" : "Create New Post"}
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
                  placeholder="e.g. Looking for frontend developer"
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
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your project, what skills you need, and how many teammates you're looking for..."
                  style={{
                    height: 120,
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
                {editingPost ? "Save Changes" : "Create Post"}
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
  onEdit,
  onDelete,
}: {
  post: Post;
  isAuthor: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  // Extract skill-like words from description (simple heuristic)
  const knownSkills = ["Python", "PostgreSQL", "React", "Java", "Spring", "JavaScript", "TypeScript", "Go", "Rust", "Docker", "Express", "Django", "Next.js", "Vue", "Angular", "MongoDB", "MySQL", "Redis", "AWS", "Firebase"];
  const mentionedSkills = knownSkills.filter(
    (s) =>
      post.title.toLowerCase().includes(s.toLowerCase()) ||
      post.description.toLowerCase().includes(s.toLowerCase())
  );

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

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          paddingTop: 14,
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
