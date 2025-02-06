import { readFile, appendFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";

const IMAGE_SERVER_BASE_URL = process.env.IMAGE_SERVER_BASE_URL;

async function getToken() {
    const username = process.env.USERNAME;
    const password = process.env.PASSWORD;

    const loginRes = await fetch(`${IMAGE_SERVER_BASE_URL}/v1/auth/login`, {
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
        console.error(loginRes.status);
        throw new Error('could not login');
    }

    const loginData = await loginRes.json();

    return loginData.accessToken;
}

const urls = (await readFile('./urls.csv', 'utf-8')).split('\n').map(r => r.split(';'));

let i = 1;

// download files
for (let url of urls) {
    try {
        const uploadPath = url[1] || randomUUID();
        console.log(`[${i++}/${urls.length}] upload from url ${url[0]} to path ${uploadPath}`)

        const fileResponse = await fetch(url[0]);

        if (!fileResponse.ok) {
            console.log(fileResponse.status);
            throw new Error('unknown file');
        }

        const rawData = await fileResponse.arrayBuffer();

        const token = await getToken();

        const uploadResponse = await fetch(`${IMAGE_SERVER_BASE_URL}/v1/admin/images/_actions/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Path': uploadPath,
            },
            body: rawData,
        });

        if (!uploadResponse.ok) {
            throw new Error(`could not upload image: ${uploadResponse.status}`);
        }

        const data = await uploadResponse.json();

        await appendFile('uploads.csv', `${url[0]};${uploadPath};${data.id}\n`, {
            flag: 'a',
        });
    } catch (error) {
        console.error(`error while processing ${url}`, {
            error,
        });
        throw error;
    }
}

