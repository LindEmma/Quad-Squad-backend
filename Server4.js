const express = require("express");
const { Client } = require("@notionhq/client");
const cors = require("cors");
const axios = require("axios");
const port = 8001;
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const authToken = "secret_wE9pW5CmFqoJCsy3kyZTdqyVj7MGfDuKHu5ndKHIfwP";
const databasePeopleId = process.env.NOTION_PEOPLE_DATABASE_ID;
const databaseTimeReportsId = process.env.NOTION_TIMEREPORTS_DATABASE_ID;
const databaseProjectsId = process.env.NOTION_PROJECT_DATABASE_ID;
const NOTION_API_BASE_URL = "https://api.notion.com/v1";

app.post("/PersonnelInfo", async (req, res) => {
  try {
    const peopleResponse = await axios.post(
      `${NOTION_API_BASE_URL}/databases/${databasePeopleId}/query`,
      req.body,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Notion-Version": "2022-06-28",
        },
      }
    );

    const personnelData = peopleResponse.data.results;

    for (const person of personnelData) {
      // collects the projects for each separate person
      const projectResponse = await axios.post(
        `${NOTION_API_BASE_URL}/databases/${databaseProjectsId}/query`,
        {
          filter: {
            property: "👤People",
            relation: {
              contains: person.id,
            },
          },
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Notion-Version": "2022-06-28",
          },
        }
      );

      // Adds the time reports to the person-data
      person.projects = projectResponse.data.results;

      for (const project of person.projects) {
        //collects the time reports for each project and person
        const timereportResponse = await axios.post(
          `${NOTION_API_BASE_URL}/databases/${databaseTimeReportsId}/query`,
          {
            filter: {
              and: [
                // Filter time reports related to the current person
                {
                  property: "Person",
                  relation: {
                    contains: person.id,
                  },
                },
                // Filter time reports related to the current project
                {
                  property: "Projects",
                  relation: {
                    contains: project.id,
                  },
                },
              ],
            },
          },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Notion-Version": "2022-06-28",
            },
          }
        );

        //adds time reports to the data
        project.timereport = timereportResponse.data.results;
      }
    }

    res.json({ results: personnelData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log("server listening on port 8001!");
});
