import decode_token from "../utils/index";

const storeReducer = (state, action) => {
    const { type, payload } = action;

    if (type === "login_success") {
        const userInfo = decode_token(payload.token); // Decode token and extract user info
        state.token = payload.token;
        state.userInfo = userInfo;

        // Ensure the role is included
        if (userInfo && userInfo.role) {
            state.role = userInfo.role; // Save role in state
        }
    }

    if (type === "logout") {
        state.token = "";
        state.userInfo = null;
        state.role = null; // Reset role during logout
    }

    return state;
};

export default storeReducer;
