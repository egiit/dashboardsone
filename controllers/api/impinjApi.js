import axios from "../../config/impinjConn.js"

export const sendPublishedDynamic = async (topic, tag) => {
    try {
        await axios.post("/publish-dynamic", {topic, tag})

        return {status: true, message: "Successfully published"};
    } catch (err) {
        return {status: false, message: err?.response?.data?.message || err?.message};
    }
}