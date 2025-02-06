import {readFile} from "node:fs/promises";
import {randomUUID} from "node:crypto";

const IMAGE_SERVER_BASE_URL = process.env.IMAGE_SERVER_BASE_URL;

async function getToken() {
    const username = process.env.USERNAME;
    const password = process.env.PASSWORD;

    const loginRes = await fetch(`${IMAGE_SERVER_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username,
            password,
        }),
    });

    if (!loginRes.ok) {
        throw new Error('could not login');
    }

    const loginData = await loginRes.json();

    return loginData.accessToken;
}


const token = await getToken();

const imagesResponse = await fetch(`${IMAGE_SERVER_BASE_URL}/admin/images`, {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`,
    },
});

if (!imagesResponse.ok) {
    throw new Error(`could not get images: ${imagesResponse.status}`);
}

const images = await imagesResponse.json()

console.log(JSON.stringify(images, null, 2));
