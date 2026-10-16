const axios = require('axios');

async function test() {
  try {
    // Attempt to login as Admin
    const loginRes = await axios.post('https://erp-system-backend-cx5w.onrender.com/api/v1/auth/login', {
      email: 'admin@example.com',
      password: 'password'
    });
    
    let token = loginRes.data.token || loginRes.data.result?.token || loginRes.data.accessToken || loginRes.data.result?.accessToken || loginRes.data;
    if (typeof token === 'object') token = token.accessToken || token.token;
    
    console.log("Logged in!");
    const headers = { Authorization: `Bearer ${token}` };

    // 1. Get all roles
    const rolesRes = await axios.get('https://erp-system-backend-cx5w.onrender.com/api/v1/roles/all', { headers });
    console.log("ROLES:");
    console.log(JSON.stringify(rolesRes.data, null, 2));

    // 2. Get screens and permissions
    const screensRes = await axios.get('https://erp-system-backend-cx5w.onrender.com/api/v1/screens/all-with-permissions', { headers });
    console.log("SCREENS:");
    console.log(JSON.stringify(screensRes.data, null, 2));

  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}
test();
