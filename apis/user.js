import axios from 'axios';
const url = process.env.NEXT_PUBLIC_BACKEND_URL;

// Function to get all user roles
export const getRoles = async () => {
    try {
        const response = await axios.get(`${url}/api/vi/user/role`);
        return response.data;
    } catch (error) {
        console.error('Error fetching roles:', error);
        throw error;
    }
};

// Function to get all users
export const getAllUsers = async () => {
    try {
        const response = await axios.get(`${url}/api/vi/user/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};