import { readFile, appendFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";

const IMAGE_SERVER_BASE_URL = process.env.IMAGE_SERVER_BASE_URL;
const OAUTH_TOKEN_URL = process.env.OAUTH_TOKEN_URL;

async function getToken() {
    const username = process.env.USERNAME;
    const password = process.env.PASSWORD;
    const client_id = process.env.OAUTH_CLIENT_ID;
    const client_secret = process.env.OAUTH_CLIENT_SECRET;

    const urlSearchParams = new URLSearchParams({
        username,
        password,
        grant_type: 'password',
        client_id,
        client_secret,
    });

    const loginRes = await fetch(`${OAUTH_TOKEN_URL}`, {
        method: 'POST',
        body: urlSearchParams,
    });

    if (!loginRes.ok) {
        console.error(loginRes.status, await loginRes.text());
        throw new Error('could not login');
    }

    const loginData = await loginRes.json();

    return loginData.access_token;
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

