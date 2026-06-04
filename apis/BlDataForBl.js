import api from "./interceptor";

export const blDataForDO = async (id, clientId) => {
    try {
        const response = await api.post("blDataForDO", {
            id,
            clientId,
        });

        return response.data;
    } catch (e) {
        console.error("Error fetching job data:", e);
        throw e;
    }
};