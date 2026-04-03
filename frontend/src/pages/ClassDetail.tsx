import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePostsStore, type Post } from "../state/usePostsStore";
import { useClassesStore } from "../state/useClassesStore";
import { useSkillsStore } from "../state/useSkillsStore";
import { useAuthStore } from "../state/useAuthStore";

const AVATAR_COLORS = [
  "linear-gradient(135deg, #6366f1, #a855f7)",
  "linear-gradient(135deg, #ec4899, #f43f5e)",
  "linear-gradient(135deg, #10b981, #14b8a6)",
  "linear-gradient(135deg, #f59e0b, #f97316)",
  "linear-gradient(135deg, #3b82f6, #2563eb)",
];

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
  const {
    posts,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    joinGroup,
    leaveGroup,
    acceptMember,
    removeMember,
  } = usePostsStore();
  const { classes, fetchClasses, deleteClass } = useClassesStore();
  const { userSkills, fetchUserSkills } = useSkillsStore();
  const user = useAuthStore((s) => s.user);

  const [showCreate, setShowCreate] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [groupName, setGroupName] = useState("");
  const [maxMembers, setMaxMembers] = useState("4");

  const cls = classes.find((c) => c.id === classId);
  const isOwner = user?.id === cls?.creator_id;
  const userSkillIds = new Set(userSkills.map((s) => s.id));

  useEffect(() => {
    fetchPosts(classId);
    fetchUserSkills();
    if (classes.length === 0) fetchClasses();
  }, [classId]);

  const handleCreate = async () => {
    if (!title.trim() || !description.trim() || !groupName.trim()) return;
    try {
      await createPost(
        classId,
        title.trim(),
        description.trim(),
        groupName.trim(),
        Number(maxMembers),
      );
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

  const handleGroupAction = async (postId: number, action: "join" | "leave") => {
    try {
      if (action === "join") await joinGroup(postId);
      else await leaveGroup(postId);
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
            <span
              style={{ fontFamily: '"Instrument Serif", serif', fontSize: 32, color: "#111118" }}
            >
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
            userSkillIds={userSkillIds}
            onEdit={() => openEdit(post)}
            onDelete={() => deletePost(post.id)}
            onGroupAction={handleGroupAction}
            onAccept={(accountId) => acceptMember(post.id, accountId)}
            onRemove={(accountId) => removeMember(post.id, accountId)}
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
                <label style={{ fontSize: 13, fontWeight: 600, color: "#27272a" }}>
                  Description
                </label>
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
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#111118" }}>
                      Your Group
                    </span>
                    <span style={{ fontSize: 12, color: "#71717a" }}>
                      This post is an ad for your group. People can join directly from the post.
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
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
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, width: 120 }}>
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
  userSkillIds,
  onEdit,
  onDelete,
  onGroupAction,
  onAccept,
  onRemove,
}: {
  post: Post;
  isAuthor: boolean;
  userId?: number;
  userSkillIds: Set<number>;
  onEdit: () => void;
  onDelete: () => void;
  onGroupAction: (postId: number, action: "join" | "leave") => void;
  onAccept: (accountId: number) => void;
  onRemove: (accountId: number) => void;
}) {
  const group = post.group;
  const myMembership = group?.members?.find((m) => m.account_id === userId);
  const isMember = !!myMembership;
  const isPending = myMembership?.is_pending ?? false;
  const isGroupOwner = group?.created_by === userId;
  const confirmedCount = group?.members.filter((m) => !m.is_pending).length ?? 0;
  const isFull = group ? confirmedCount >= group.max_members : false;
  const matchScore = post.skill_match_score ?? 0;

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
        <div
          style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, paddingRight: 20 }}
        >
          <span style={{ fontSize: 17, fontWeight: 700, color: "#111118" }}>{post.title}</span>
          <span style={{ fontSize: 14, color: "#52525b", lineHeight: 1.6 }}>
            {post.description}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 22,
                height: 22,
                background: "linear-gradient(135deg, #6366f1, #a855f7)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: 8, fontWeight: 700, color: "white" }}>
                {(post.author_name || "?").slice(0, 2).toUpperCase()}
              </span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#27272a" }}>
              {post.author_name || "Unknown"}
            </span>
            <span style={{ fontSize: 12, color: "#a1a1aa" }}>&middot; {timeAgo(post.created_at)}</span>
          </div>
          {isAuthor && (
          <div style={{ display: "flex", gap: 6 }}>
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
      </div>

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
            gap: 14,
          }}
        >
          {/* Group header */}
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
              <span style={{ fontSize: 14, fontWeight: 700, color: "#111118" }}>
                {group.group_name}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {matchScore > 0 && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#7c3aed",
                    background: "rgba(124,58,237,0.08)",
                    border: "1px solid rgba(124,58,237,0.2)",
                    padding: "3px 10px",
                    borderRadius: 20,
                  }}
                >
                  {matchScore} skill {matchScore === 1 ? "match" : "matches"}
                </span>
              )}
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
          </div>

          {/* Members with skills */}
          {group.members.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {group.members.map((member, idx) => (
                <div key={member.account_id} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        background: AVATAR_COLORS[idx % AVATAR_COLORS.length],
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        opacity: member.is_pending ? 0.5 : 1,
                      }}
                    >
                      <span style={{ fontSize: 7, fontWeight: 700, color: "white" }}>
                        {member.name.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: member.is_pending ? "#a1a1aa" : "#27272a" }}>
                      {member.name}
                    </span>
                    {member.is_pending && (
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#f59e0b", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", padding: "1px 7px", borderRadius: 10 }}>
                        Pending
                      </span>
                    )}
                    {isGroupOwner && member.account_id !== userId && (
                      <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
                        {member.is_pending && (
                          <button
                            onClick={() => onAccept(member.account_id)}
                            style={{ padding: "2px 10px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#16a34a", fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
                          >
                            Accept
                          </button>
                        )}
                        <button
                          onClick={() => onRemove(member.account_id)}
                          style={{ padding: "2px 10px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#dc2626", fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
                        >
                          {member.is_pending ? "Reject" : "Remove"}
                        </button>
                      </div>
                    )}
                  </div>
                  {member.skills.length > 0 && (
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", paddingLeft: 26 }}>
                      {member.skills.map((skill) => {
                        const isMatch = userSkillIds.has(skill.id) && member.account_id !== userId;
                        return (
                          <span
                            key={skill.id}
                            style={{
                              padding: "2px 8px",
                              borderRadius: 12,
                              fontSize: 11,
                              fontWeight: 600,
                              background: isMatch ? "rgba(79,70,229,0.1)" : "#f4f4f5",
                              color: isMatch ? "#4f46e5" : "#71717a",
                              border: isMatch ? "1px solid rgba(79,70,229,0.3)" : "1px solid transparent",
                            }}
                          >
                            {skill.name}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Join/Leave */}
          {!isGroupOwner && (
            isMember ? (
              <button
                onClick={() => onGroupAction(post.id, "leave")}
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
                {isPending ? "Cancel Request" : "Leave Group"}
              </button>
            ) : (
              <button
                onClick={() => !isFull && onGroupAction(post.id, "join")}
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
            <span style={{ fontSize: 12, color: "#7c3aed", fontWeight: 500 }}>
              You own this group
            </span>
          )}
        </div>
      )}

    </div>
  );
}
