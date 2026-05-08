import api from './interceptor';

export const revokePasswordApi = async () => {
    try {
        const res = await api.post('auth/revoke-password');
        return res.data;
    } catch (e) {
        return { message: e };
    }
}
