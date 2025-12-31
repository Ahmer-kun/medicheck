// test-login.js
import fetch from 'node-fetch';

async function getToken() {
  const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: 'manufacturer1',  // or your test manufacturer username
      password: 'password123'
    })
  });

  const result = await loginResponse.json();
  console.log('Login Result:', {
    success: result.success,
    token: result.token ? '✅ Received' : '❌ None',
    user: result.user
  });

  return result.token;
}

getToken();