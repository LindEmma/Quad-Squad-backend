const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const { Client } = require("@notionhq/client");
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT4 = process.env.PORT4 || 5000;
const notion = new Client({ auth: process.env.NOTION_INTEGRATION_KEY});
const peopleDatabase = process.env.NOTION_PEOPLE_DATABASE_ID;

// Endpoint för att utbyta auktoriseringskoden mot en åtkomsttoken
app.post('/get-token', async (req, res) => {
try {
    const { code } = req.body;
        if (!code) {
            return res.status(400).send('Authorization code is missing');
        }
        
        // Konfigurationsvariabler
        const clientId = process.env.OAUTH_CLIENT_ID;
        const clientSecret = process.env.OAUTH_CLIENT_SECRET;
        const redirectUri = process.env.OAUTH_REDIRECT_URI;
        // Kod för att koda om klient-ID och hemlighet till base64
        const encoded = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

        // Begäran till Notions OAuth-token-API för att utbyta auktoriseringskoden mot en åtkomsttoken
        const response = await fetch("https://api.notion.com/v1/oauth/token", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Basic ${encoded}`,
            },
            body: JSON.stringify({
                grant_type: "authorization_code",
                code: code,
                redirect_uri: redirectUri,
            }),
        });
        
        // Hämta token-data från svarskroppen
        const tokenData = await response.json();
        console.log(tokenData);

        const userEmail = tokenData?.owner?.user?.person?.email;
        const userName = tokenData.owner.user.name;
        console.log(tokenData.owner.user);
        const databaseResponse = await notion.databases.query({
            database_id: peopleDatabase,
            filter: {
                        property: "Email",
                        email: {
                            contains: userEmail
                        }
                    },
            
        });
        if (databaseResponse.results.length > 0) {
            const oauthUserRole = databaseResponse.results[0].properties.Role.multi_select.map(role => role.name);
            // E-postadressen finns i databasen, tillåt åtkomst
            console.log('Email exists in the database');
            // Skicka lämpligt svar till klienten
            return res.status(200).json({ userEmail, userName,oauthUserRole });
        } else {
            // E-postadressen finns inte i databasen, neka åtkomst
            console.log('Email does not exist in the database');
            // Skicka lämpligt svar till klienten
            return res.status(403).send('Access denied');
        }
          
        
    } catch (error) {
        console.error('Error exchanging code for token:', error);
        return res.status(500).send('Failed to exchange authorization code for token');
    }
});



// Starta servern
app.listen(PORT4, () => {
    console.log(`Server is running on port ${PORT4}`);
});