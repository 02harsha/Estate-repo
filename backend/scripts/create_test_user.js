import fetch from 'node-fetch';

async function registerUser() {
    const url = 'http://localhost:3000/api/users/register';
    const user = {
        full_name: "Test User",
        email: "test@example.com",
        phone_number: "1234567890",
        password: "password123"
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });

        const data = await response.json();
        console.log('Response:', data);
    } catch (error) {
        console.error('Error:', error);
    }
}

registerUser();
