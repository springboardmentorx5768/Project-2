import { useState } from "react";
import ShoutOutFeed from "./ShoutOutFeed";
import MyShoutOuts from "./MyShoutOuts";

export default function ShoutOutsPage({ currentUser }) {
  const [refresh, setRefresh] = useState(false);

  // Called after editing a shoutout
  const handleShoutoutUpdated = () => setRefresh(!refresh);

  // Delete shoutout handler
  const handleDeleteShout = async (id) => {
    try {
      await ApiService.deleteShoutout(id);
      handleShoutoutUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  // Edit shoutout handler (opens edit form)
  const handleEditShout = (shout) => {
    handleShoutoutUpdated();
  };

  return (
    <div className="space-y-10">
      <ShoutOutFeed currentUser={currentUser} shoutoutUpdated={refresh} />
      <MyShoutOuts
        currentUser={currentUser}
        handleDeleteShout={handleDeleteShout}
        handleEditShout={handleEditShout}
      />
    </div>
  );
}
