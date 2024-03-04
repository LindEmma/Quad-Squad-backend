const express = require('express');
const cors = require('cors');
const { Client } = require("@notionhq/client");
require('dotenv').config();

const app = express();

app.use(cors());
// key and id from env file
const databasePeopleId = process.env.NOTION_PEOPLE_DATABASE_ID;
const databaseProjectId = process.env.NOTION_PROJECT_DATABASE_ID;
const databaseTimeReportID = process.env.NOTION_TIMEREPORTS_DATABASE_ID;

const notion =  new Client({auth: process.env.NOTION_API_KEY});

app.get('/people',async (req,res)=>{
    try {
        const response = await notion.databases.query({
            database_id: databasePeopleId
        });

        res.json(response.results);
    } catch (error) {
        console.log('Error ',error);
    }
});
app.get('/project', async (req,res)=>{
    try {
        const response = await notion.databases.query({
            database_id: databaseProjectId
        });
        res.json(response.results)
    } catch (error) {
        console.log('Error', error)
    }
});
app.get('/timereports', async (req,res)=>{
    try {
        const response = await notion.databases.query({
            database_id: databaseTimeReportID
        });
        res.json(response.results)
    } catch (error) {
        console.log('Error', error)
    }
})
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});