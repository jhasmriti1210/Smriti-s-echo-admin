const production = "production";
const development = "development";
const mode = development;  // You can change this to production when needed
let base_url = "";

if (mode === development) {
    base_url = "http://localhost:5000";  // Your backend's URL in development
} else {
    base_url = "http://localhost:5000";  // You can adjust this for production, if needed
}

export { base_url };
