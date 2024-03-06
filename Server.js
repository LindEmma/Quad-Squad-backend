const express = require('express');
const cors = require('cors');
const { Client } = require("@notionhq/client");
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const databasePeopleId = process.env.NOTION_PEOPLE_DATABASE_ID;
// const databaseProjectId = process.env.NOTION_PROJECT_DATABASE_ID;
// const databaseTimeReportID = process.env.NOTION_TIMEREPORTS_DATABASE_ID;

const notion =  new Client({auth: process.env.NOTION_API_KEY});

app.post('/submitFormToNotion', async (req, res) => {
    const { employeID, password } = req.body;
    console.log('Received employeID:', employeID);
    console.log('Received password:', password);
    // console.log('Received role:', userRole);
    try {
        const response = await notion.databases.query({
            database_id: databasePeopleId,
        });

        const user = response.results.find(user => {
            const userEmployeID = user.properties.EmployeID.rich_text[0].plain_text;
            const userPassword = user.properties.Password.rich_text[0].plain_text;
            // const userUserRole = user.properties.Role.multi_select[0].name; 
            return userEmployeID === employeID && userPassword === password;
        });

        if (user) {
            console.log('Login success!')
            res.status(200).json(user);
        } else {
            console.log('Login failed: Incorrect employeID or password');
            res.status(401).send("Unauthorized");
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).send("Error");
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});