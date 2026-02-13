import axios from "../../config/telegramConn.js";

export const sendTelegramNotification = async (message, channelId) => {
    if (!channelId || !message) return false;
    try {
        await axios.post('/sendMessage', {
            "chat_id": channelId,
            "text": message,
            "parse_mode": "HTML"
        })

        return true;
    } catch (err) {
        console.log(err.response.data.message || err.message)
        return false
    }
}