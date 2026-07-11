import {UserConnectionHistory, UserHistoryRoute} from "../../models/user-activity/UserActivity.mod.js";
import UsersMod from "../../models/setup/users.mod.js";

export const setupWebSocket = (io) => {
    io.on("connection", async (socket) => {
        const userId = socket.handshake.auth?.userId
        const appType = socket.handshake.auth?.appType
        socket.userId = userId;

        if (userId) {
            try {
                await UsersMod.update({IS_ONLINE: true, LAST_ONLINE_AT: new Date(), SOCKET_KEY: socket.id}, {where: {USER_ID: userId}})
                await UserConnectionHistory.create({
                    USER_ID: userId,
                    SOCKET_KEY: socket.id,
                    APP_TYPE: appType,
                    ACTION_TYPE: "CONNECTED",
                    CREATED_AT: new Date()
                });
            } catch (err) {
                console.error("Gagal simpan log connection (CONNECTED):", err);
            }
        }

        socket.on("dashboard_machine", (data) => {
            io.emit("dashboard_machine", {
                TYPE: data.TYPE,
                VALUE: data.VALUE
            });
        });

        socket.on("dashboard_machine", (data) => {
            io.emit("dashboard_machine", {
                TYPE: data.TYPE,
                VALUE: data.VALUE
            });
        });


        socket.on("new_render", (data) => {
            io.emit("new_render", data);
        });

        socket.on("history_route", async (data) => {
            try {
                await UserHistoryRoute.create({
                    USER_ID: socket.userId,
                    NAME: data?.NAME,
                    PATH_URL: data?.PATH_URL,
                    CREATED_AT: new Date()
                });
            } catch (err) {
                console.error("Gagal simpan log history route:", err);
            }
        });


        socket.on("disconnect", async () => {
            console.log("User disconnected:", socket.id);
            if (socket.userId) {
                try {
                    await UsersMod.update({IS_ONLINE: false, LAST_ONLINE_AT: new Date(), SOCKET_KEY: ''}, {where: {USER_ID: userId}})
                    await UserConnectionHistory.create({
                        USER_ID: socket.userId,
                        ACTION_TYPE: "DISCONNECT",
                        CREATED_AT: new Date()
                    });
                } catch (err) {
                    console.error("Gagal simpan log connection (DISCONNECT):", err);
                }
            }
        });
    });
};


export const sendConnectionSocket = (req, res) => {
    const { event, data } = req.body;
  if (!event || !data) {
    return res.status(400).json({ error: 'event dan data diperlukan' });
  }
    try {
        req.io.emit(event, data);
        return res.status(200).json({ success: true, message: "Success send connection" });
    } catch (err) {
        return  res.status(500).json({status: false, message: err.message || "Failed to connect to socket"})
    }
}