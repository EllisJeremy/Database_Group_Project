import { useAuthStore } from "../state/useAuthStore";

export default function Home() {
  const { user } = useAuthStore();
  return (
    <div>
      <p>{user?.email ?? "no account"}</p>
      <button onClick={() => console.log(user)}>log auth</button>
    </div>
  );
}
