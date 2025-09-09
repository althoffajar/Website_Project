// ------------------------------------------------Backend-------------------------------------------------------------------
// Import modules
// To Simulate
// the following instal                               : https://nodejs.org/ ; $ npm install -g nodemon

// 1. Run the Server code in Bash                     : $ node Server.js
// 2. Go to browser (e.g Chrome) and type the address : (e.g. http://localhost:3000/MainPage.html)
// 3. To stop                                         : Ctrl + C
// 4. To auto-restart                                 : nodemon Server.js
// 5. remove old db -> rm DB.sqlite

// ------------------------------------------------Backend-------------------------------------------------------------------
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Ensure uploads folder exists
if (!fs.existsSync(path.join(__dirname, "public", "uploads"))) {
  fs.mkdirSync(path.join(__dirname, "public", "uploads"), { recursive: true });
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); // Serve frontend files

const db = new sqlite3.Database("./DB.sqlite", (err) => {
  if (err) console.error(err.message);
  else console.log("✅ Connected to SQLite database.");
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      fullname TEXT,
      email TEXT,
      description TEXT,
      profilePic TEXT
  )`);

  db.run(`INSERT OR IGNORE INTO users (username, password, fullname, email, description, profilePic)
          VALUES (?, ?, ?, ?, ?, ?)`, [
    "admin",
    "12345",
    "Administrator",
    "admin@example.com",
    "Default admin account",
    "/uploads/default.png"
  ]);
});

// multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join("public", "uploads")),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Login (case-insensitive username comparison)
app.post("/Login", (req, res) => {
  const { username, password } = req.body;
  db.get(
    "SELECT * FROM users WHERE LOWER(username) = LOWER(?) AND password = ?",
    [username, password],
    (err, row) => {
      if (err) return res.status(500).json({ success: false, message: "Database error." });
      if (!row) return res.json({ success: false, message: "Invalid credentials." });
      // return the canonical username stored in DB (correct casing)
      return res.json({ success: true, message: "Login successful!", username: row.username });
    }
  );
});

// Register
app.post("/register", (req, res) => {
  const { username, password } = req.body;
  db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, password], function (err) {
    if (err) {
      if (err.message.includes("UNIQUE constraint")) {
        return res.json({ success: false, message: "Username already exists." });
      }
      return res.status(500).json({ success: false, message: "Database error." });
    }
    return res.json({ success: true, message: "Account created successfully!" });
  });
});

// Get profile (case-insensitive)
app.get("/profile/:username", (req, res) => {
  const { username } = req.params;
  db.get(
    "SELECT username, fullname, email, description, profilePic FROM users WHERE LOWER(username) = LOWER(?)",
    [username],
    (err, row) => {
      if (err) return res.status(500).json({ success: false, message: "Database error." });
      if (!row) return res.status(404).json({ success: false, message: "User not found." });
      return res.json(row);
    }
  );
});

// Update profile (case-insensitive)
app.post("/profile/:username", upload.single("profilePic"), (req, res) => {
  const { username } = req.params;
  const { fullname = null, email = null, description = null } = req.body;
  const profilePic = req.file ? "/uploads/" + req.file.filename : null;

  db.run(
    `UPDATE users
     SET fullname = COALESCE(?, fullname), email = COALESCE(?, email),
         description = COALESCE(?, description),
         profilePic = COALESCE(?, profilePic)
     WHERE LOWER(username) = LOWER(?)`,
    [fullname, email, description, profilePic, username],
    function (err) {
      if (err) return res.status(500).json({ success: false, message: "Database error." });
      if (this.changes === 0) return res.status(404).json({ success: false, message: "User not found." });
      return res.json({ success: true, message: "Profile updated successfully." });
    }
  );
});

// Delete account (case-insensitive)
app.delete("/delete/:username", (req, res) => {
  const { username } = req.params;
  db.get("SELECT profilePic FROM users WHERE LOWER(username)=LOWER(?)", [username], (err, row) => {
    if (err) return res.status(500).json({ success: false, message: "Database error." });

    db.run("DELETE FROM users WHERE LOWER(username)=LOWER(?)", [username], function (err2) {
      if (err2) return res.status(500).json({ success: false, message: "Database error." });
      if (this.changes === 0) return res.status(404).json({ success: false, message: "User not found." });

      // optional: delete profilePic file if it exists and not default
      if (row && row.profilePic && !row.profilePic.includes("default.png")) {
        const fp = path.join(__dirname, "public", row.profilePic.replace(/^\//, ""));
        fs.unlink(fp, () => {});
      }

      return res.json({ success: true, message: "Account deleted successfully." });
    });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
