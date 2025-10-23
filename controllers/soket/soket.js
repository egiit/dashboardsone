
export const setupWebSocket = (io) => {
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

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
        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
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
        res.status(200).json({ success: true, message: "Success send connection" });
    } catch (err) {
        res.status(500).json({status: false, message: err.message || "Failed to connect to socket"})
    }
}