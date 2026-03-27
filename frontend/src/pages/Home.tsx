import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../state/useAuthStore";

export default function Home() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div>
      <p>{user?.email ?? "no account"}</p>
      <button onClick={() => console.log(user)}>log auth</button>
      <button onClick={() => navigate("/account")}>account</button>
      <button onClick={async () => await logout()}>logout</button>
    </div>
  );
}
