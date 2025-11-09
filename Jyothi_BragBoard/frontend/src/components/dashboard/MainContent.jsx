import ShoutOutFeed from "../shoutout/ShoutOutFeed";
import ShoutOutForm from "../shoutout/ShoutOutForm";
import MyShoutOuts from "../shoutout/MyShoutOuts";
import AdminDashboard from "../admin/AdminDashboard";
import Reports from "../admin/Reports";
import Settings from "./Settings"; 
import Achievements from "./Achievements"; 
import Leaderboard from "./Leaderboard"; 

const MainContent = ({ activeView, user, shoutouts, handleDeleteShout, shoutoutUpdated, handleShoutoutPosted }) => {
  switch (activeView) {
    case "feed":
      return (
        <ShoutOutFeed
          currentUser={user}
          shoutouts={shoutouts}
          handleDeleteShout={handleDeleteShout}
          shoutoutUpdated={shoutoutUpdated} 
        />
      );
    case "create":
      return <ShoutOutForm 
                currentUser={user}
                onShoutoutPosted={handleShoutoutPosted}
             />;
    case "my-shoutouts":
      return (
        <MyShoutOuts
          currentUser={user}
          shoutouts={shoutouts}
          handleDeleteShout={handleDeleteShout}
        />
      );

    case "leaderboard":
        return <Leaderboard />;
    case "achievements":
          return <Achievements />;
    case "admin-dashboard":
        return <AdminDashboard />; 
    case "reports":
        return <Reports />;
    case "settings":
      return <Settings currentUser={user} />

    
        
    default:
      return <div className="text-gray-500">Coming soon...</div>;
  }
};

export default MainContent;
