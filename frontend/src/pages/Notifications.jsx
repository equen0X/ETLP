import { useEffect, useState } from "react";
import API from "../services/api";

function Notifications() {

  const [
    notifications,
    setNotifications
  ] = useState([]);

  useEffect(() => {

    fetchNotifications();

  }, []);

  const fetchNotifications =
    async () => {

      try {

        const res =
          await API.get(
            "/notifications"
          );

        setNotifications(
          res.data.notifications
        );

      } catch (error) {

        console.log(error);

      }
    };

  return (
    <div className="container mt-5">

      <h2>
        Notifications
      </h2>

      {notifications.map((item) => (

        <div
          key={item.id}
          className="alert alert-info"
        >

          {item.message}

        </div>

      ))}

    </div>
  );
}

export default Notifications;