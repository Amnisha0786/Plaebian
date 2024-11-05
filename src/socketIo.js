import { SOCKET_URL } from "config";
import { updateDetails } from "redux/sharedSlices/user";
import io from "socket.io-client";

const socketIo = (userId, dispatch) => {
  const socket = io(SOCKET_URL, 
    {
    path: "/api/socket.io",
  }
  );

  socket.connect();

  socket.on("connect", () => {
    console.log("connection successful");
    socket.emit("join", { id: userId });
  });
  socket.on("disconnect", (error) => {
    console.log("disconnect: ", error);
  });
  socket.on("connect_error", (error) => {
    console.log("connect error: ", error);
  });
  socket.on("error", (error) => {
    console.log("socket error: ", error);
  });
  socket.on("reconnect_attempt", () => {
    console.log("reconnect_attempt");
  });
  socket.on("powerIncrease", ({ data }) => {
    dispatch(updateDetails({ power: data?.data }));
  });
  socket.on("powerDecrease", ({ data }) => {
    dispatch(updateDetails({ power: data?.data }));
  });
};
export default socketIo;
