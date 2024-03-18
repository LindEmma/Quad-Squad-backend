const express = require("express");
const { Client } = require("@notionhq/client");
const cors = require("cors");
const axios = require("axios");
const bodyParser = require("body-parser");
const port = 8000;

const app = express();
app.use(cors());
app.use(express.json());

const authToken = "secret_zwHckMzX7JjtvETKIugWlzTbINQSAUynzDcJxzHxMpV";
const notionDbID = "a00eba2577284abf93bd7f0e5dbc3340";
const NOTION_API_BASE_URL = "https://api.notion.com/v1";

app.post("/ActiveProjects", async (req, res) => {
  try {
    const response = await axios.post(
      `${NOTION_API_BASE_URL}/databases/${notionDbID}/query`,
      req.body,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Notion-Version": "2022-06-28",
        },
        filter: {
          property: "Status",
          select: {
            equals: "Active",
          },
        },
      }
    );

    res.json(response.data);
    console.log("success");
    console.log(response.data);
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log("server listening on port 8000!");
});
