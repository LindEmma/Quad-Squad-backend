const express = require("express");
const cors = require("cors");
const { Client } = require("@notionhq/client");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const databaseTimeReportID = process.env.NOTION_TIMEREPORTS_DATABASE_ID;


const notion = new Client({ auth: "secret_wE9pW5CmFqoJCsy3kyZTdqyVj7MGfDuKHu5ndKHIfwP" });

app.post('/NotionAPIPost', async (req, res) => {
    console.log("hej")
    const { Hours, Note, Date, UserId, ProjectId } = req.body;
    console.log('Received worked hours: ', Hours);
    console.log('Received note: ', Note);
    console.log('Receivd date: ', Date);
    console.log('Receivd poject: ', ProjectId);


    try {
        const response = await notion.pages.create({
            parent: { database_id: databaseTimeReportID },
            properties: {
                Hours: { number: parseInt(Hours, 10) },
                Note: { title: [{ text: { content: Note } }] },
                Date: { date: { start: Date } },
                // Person: { relation: [{ id: UserId  }] }, 
                Projects: { relation: [{ id: ProjectId }] }
            }
        });
        console.log('Sidan har skapats:', response);
        return res.status(200);
    } catch (error) {
        console.error('Fel vid skapande av sida:', error.body);
        return res.status()
    };
});

const PORT3 = process.env.PORT3 || 4003;
app.listen(PORT3, () => {
    console.log(`Server is running on port ${PORT3}`);
});