import axios from "axios";
const {API_TELEGRAM, API_TELEGRAM_KEY} = process.env

const telegramAPI = axios.create({
    baseURL: API_TELEGRAM + API_TELEGRAM_KEY,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

export default telegramAPI;