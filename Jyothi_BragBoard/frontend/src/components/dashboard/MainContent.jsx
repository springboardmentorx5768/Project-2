import DashboardContent from "./DashboardContent";
import ShoutOutFeed from "./ShoutOutFeed";
import ShoutOutForm from "./ShoutOutForm";
import MyShoutOuts from "./MyShoutOuts";
import Settings from "./Settings"; 

const MainContent = ({ activeView, user, shoutouts, handleDeleteShout, shoutoutUpdated, handleShoutoutPosted }) => {
  switch (activeView) {
    case "dashboard":
      return <DashboardContent currentUser={user} />;
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
    case "settings":
      return <Settings currentUser={user} />
    default:
      return <div className="text-gray-500">Coming soon...</div>;
  }
};

export default MainContent;
