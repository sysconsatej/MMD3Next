import api from './interceptor';

export const revokePasswordApi = async ({ emailId }) => {
    try {
        const res = await api.post('auth/revoke-password', { emailId });
        return res.data;
    } catch (e) {
        return { message: e };
    }
}
