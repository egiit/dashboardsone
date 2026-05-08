import axios from "../../config/impinjConn.js"

export const sendPublishedDynamic = async (topic, message) => {
    try {
        await axios.post("/publish-dynamic", {topic, message})

        return {status: true, message: "Successfully published"};
    } catch (err) {
        return {status: false, message: err.message}
    }
}