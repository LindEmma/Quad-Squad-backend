const express = require('express');
const { Client } = require('@notionhq/client');
const cors = require('cors');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
require('dotenv').config();

const app = express();
app.use(cors());

const databaseTimeReportID = process.env.NOTION_TIMEREPORTS_DATABASE_ID;

const notion = new Client({ auth: "secret_rjyMzhW412u9tpam3qCpkPbDXUG0z2V2PEluoKnZ1nN" });

app.post('/NotionAPIPost', jsonParser, async (req, res) => {
    const { hours, note } = req.body;
    console.log('Received worked hours: ', hours);
    console.log('Received note: ', note);

    try {
        const response = await notion.pages.create({
            database_id: databaseTimeReportID,
            });

        res.send(response);
        console.log("success");
    } 
    catch (error) {
        console.log(error);
    }
});


const PORT3 = process.env.PORT3 || 6000;
app.listen(PORT3, () => {
    console.log(`Server is running on port ${PORT3}`);
});