import axios from "axios";

export const  IMPINJ_API = process.env.API_IMPINJ

const impinjApi = axios.create({
    baseURL: IMPINJ_API,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

export default impinjApi