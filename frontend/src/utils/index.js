import { jwtDecode } from "jwt-decode";

const decode_token = (token) => {
    if (token) {
        try {
            const decoded_token = jwtDecode(token); // Decode the token

            const exp = new Date(decoded_token.exp * 1000); // Expiration time in milliseconds
            if (new Date() > exp) {
                // If the token has expired
                localStorage.removeItem('poetryToken'); // Remove the expired token
                return ""; // Return empty string to indicate expired token
            } else {
                return decoded_token; // Return decoded token with user info
            }
        } catch (error) {
            return ""; // If there's an error decoding the token, return empty string
        }
    } else {
        return ""; // If there's no token, return empty string
    }
};

export default decode_token;
