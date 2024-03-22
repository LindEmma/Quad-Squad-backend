const express = require("express");
const { Client } = require("@notionhq/client");
const cors = require("cors");
const port = 8000;

const app = express();
app.use(cors());
app.use(express.json());

const authToken = "secret_wE9pW5CmFqoJCsy3kyZTdqyVj7MGfDuKHu5ndKHIfwP";
const notionDbID = "a00eba2577284abf93bd7f0e5dbc3340";

app.post("/ActiveProjects", async (req, res) => {
  const { storedUserID } = req.body;
  console.log('User ID sent from front-end:', storedUserID);
  
  const notion = new Client({ auth: authToken });
  try {
    // Hämta alla projekt från Notion-databasen och filtrera baserat på användar-ID
    const response = await notion.databases.query({
      database_id: notionDbID,
      filter: {
        property: "👤People",
        relation: {
          contains: storedUserID
        }
      }
    });

    res.json(response);
    console.log(response);
    console.log("Success");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}!`);
});