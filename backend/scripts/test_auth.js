import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api/users';

async function testAuth() {
    const user = {
        full_name: "Hash Test User",
        email: `hash_test_${Date.now()}@example.com`, // Unique email
        phone_number: `9${Date.now().toString().slice(-9)}`, // Unique phone
        password: "securepassword"
    };

    console.log("--- 1. Testing Registration ---");
    try {
        const regRes = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
        const regData = await regRes.json();
        console.log('Registration Status:', regRes.status);
        console.log('Registration Response:', regData);
    } catch (err) {
        console.error('Registration Error:', err);
        return;
    }

    console.log("\n--- 2. Testing Login (Correct Password) ---");
    try {
        const loginRes = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email, password: user.password })
        });
        const loginData = await loginRes.json();
        console.log('Login Status:', loginRes.status);
        console.log('Login Message:', loginData.message);
        if (loginRes.status === 200) console.log('✅ Login Successful');
        else console.log('❌ Login Failed');
    } catch (err) {
        console.error('Login Error:', err);
    }

    console.log("\n--- 3. Testing Login (Incorrect Password) ---");
    try {
        const loginRes = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email, password: "wrongpassword" })
        });
        const loginData = await loginRes.json();
        console.log('Login Status:', loginRes.status);
        console.log('Login Message:', loginData.message);
        if (loginRes.status === 401) console.log('✅ Correctly Rejected');
        else console.log('❌ Unexpected Result');
    } catch (err) {
        console.error('Login Error:', err);
    }
}

testAuth();
