import Navbar from "../components/Navbar";
import "../styles/Home.scss";
import { useState } from "react";

export default function Home() {
  const [active, setActive] = useState("createPost");

  const menuItems = [
    { key: "createPost", label: "Create Post" },
    { key: "shout", label: "Shout to Employee" },
    { key: "timeline", label: "Write on Timeline" },
    { key: "myAchievements", label: "My Achievements" },
    { key: "notifications", label: "Notifications" },
    { key: "teamBoard", label: "Team Board" },
    { key: "profile", label: "Profile Settings" },
  ];

  return (
    <>
      <Navbar />
      <div className="home-container">
        <aside className="sidebar">
          <ul>
            {menuItems.map((item) => (
              <li
                key={item.key}
                className={active === item.key ? "active" : ""}
                onClick={() => setActive(item.key)}
              >
                {item.label}
              </li>
            ))}
          </ul>
        </aside>

        <main className="content">
          {active === "createPost" && <h2>Create a new post</h2>}
          {active === "shout" && <h2>Send a shout to an employee</h2>}
          {active === "timeline" && <h2>Write on your timeline</h2>}
          {active === "myAchievements" && <h2>My Achievements</h2>}
          {active === "notifications" && <h2>Notifications</h2>}
          {active === "teamBoard" && <h2>Team Board</h2>}
          {active === "profile" && <h2>Profile Settings</h2>}
        </main>
      </div>
    </>
  );
}
