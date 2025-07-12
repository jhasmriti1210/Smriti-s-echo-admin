const production = "production";
const development = "development";

// You can change this to 'production' manually or let Vercel set it via NODE_ENV
const mode = process.env.NODE_ENV === production ? production : development;

let base_url = "";

if (mode === development) {
    base_url = "http://localhost:5000"; // Local backend for development
} else {
    base_url = process.env.REACT_APP_BASE_URL || "https://smriti-s-echo-admin.onrender.com"; // Fallback in case env is not set
}

export { base_url };
