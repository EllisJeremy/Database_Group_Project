import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../state/useAuthStore";
import { getUserSkills } from "../networkUtils";

export default function Home() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div>
      <p>{user?.email ?? "no account"}</p>
      <button onClick={() => console.log(user)}>log auth</button>
      <button onClick={() => navigate("/account")}>go to account page</button>
      <button onClick={async () => await logout()}>logout</button>
      <button
        onClick={async () => {
          const skills = await getUserSkills();
          console.log(skills);
        }}
      >
        getUserSkills
      </button>
    </div>
  );
}
