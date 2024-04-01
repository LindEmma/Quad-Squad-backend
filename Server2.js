const express = require("express");
const { Client } = require("@notionhq/client");
const cors = require("cors");
const port = 8000;
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const authToken = process.env.NOTION_API_KEY;
const projectsID = process.env.NOTION_PROJECT_DATABASE_ID;
const timereportsID = process.env.NOTION_TIMEREPORTS_DATABASE_ID;

app.post("/ActiveProjects", async (req, res) => {
  const { storedUserID } = req.body;
  console.log("User ID sent from front-end:", storedUserID);

  const notion = new Client({ auth: authToken });
  try {
    // Collects all projects connected to logged in users id
    const projectResponse = await notion.databases.query({
      database_id: projectsID,
      filter: {
        property: "👤People",
        relation: {
          contains: storedUserID,
        },
      },
    });

    console.log("Response from Notion API:", projectResponse);
    const projectData = projectResponse.results;

    for (const project of projectData) {
      //collects all timereports connected to user id and correct project id
      const timereportResponse = await notion.databases.query({
        database_id: timereportsID,
        filter: {
          and: [
            {
              property: "Projects",
              relation: {
                contains: project.id,
              },
            },
            {
              property: "Person",
              relation: {
                contains: storedUserID,
              },
            },
          ],
        },
      });

      console.log("tidsrapport:", timereportResponse);
      project.timereports = timereportResponse.results;
    }

    res.json({ results: projectData });
    console.log("Success");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});
app.listen(port, () => {
  console.log(`Server listening on port ${port}!`);
});
