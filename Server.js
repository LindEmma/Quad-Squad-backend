const express = require("express");
const cors = require("cors");
const { Client } = require("@notionhq/client");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const databasePeopleId = process.env.NOTION_PEOPLE_DATABASE_ID;
const notionKey = process.env.NOTION_API_KEY;

const notion = new Client({ auth: notionKey });

let loggedInUser = null;

//Post request to recieve employeid and password from form
app.post("/submitFormToNotion", async (req, res) => {
  const { employeID, password } = req.body;
  console.log("Received employeID:", employeID);
  console.log("Received password:", password);

  try {
    const response = await notion.databases.query({
      database_id: databasePeopleId,
    });
    const user = response.results.find((user) => {
      const userID = user.id;
      const userEmployeID = user.properties.EmployeID?.rich_text[0]?.plain_text;
      const userPassword = user.properties.Password?.rich_text[0]?.plain_text;
      return userEmployeID === employeID && userPassword === password && userID;
    });

    if (user) {
      loggedInUser = {
        userName: user.properties.Name.title[0].plain_text,
        userRole: user.properties.Role.multi_select.map((role) => role.name),
        userId: user.id,
      };

      console.log("Login success!");
      res.status(200).json({ message: "Login success!" });
    } else {
      console.log("Login failed: Incorrect employeID or password");
      res.status(401).send("Unauthorized");
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send("Error");
  }
});
app.get("/usernameAndRole", async (req, res) => {
  try {
    if (loggedInUser) {
      console.log("User info retrieved:", loggedInUser);
      res.status(200).json(loggedInUser);
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send("Error");
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
