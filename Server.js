// ------------------------------------------------Backend-------------------------------------------------------------------
// Import modules
// To Simulate
// the following instal                               : https://nodejs.org/ ; $ npm install -g nodemon

// 1. Run the Server code in Bash                     : $ node Server.js
// 2. Go to browser (e.g Chrome) and type the address : (e.g. http://localhost:3000/MainPage.html)
// 3. To stop                                         : Ctrl + C
// 4. To auto-restart                                 : nodemon Server.js
// 5. remove old db -> rm DB.sqlite


const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const path = require("path");

// Create express app
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); // Serve frontend files

// Connect to SQLite database (or create if doesn't exist)
const db = new sqlite3.Database("./DB.sqlite", (err) => {
  if (err) console.error(err.message);
  else console.log("✅ Connected to SQLite database.");
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
  )`);

  db.run(`ALTER TABLE users ADD COLUMN fullname TEXT`, (err) => {
    if (err) console.log("ℹ️ fullname already exists");});
  db.run(`ALTER TABLE users ADD COLUMN email TEXT`, (err) => {
    if (err) console.log("ℹ️ email already exists");});
  db.run(`ALTER TABLE users ADD COLUMN description TEXT`, (err) => {
    if (err) console.log("ℹ️ description already exists");});
  db.run(`ALTER TABLE users ADD COLUMN profilePic TEXT`, (err) => {
    if (err) console.log("ℹ️ profilePic already exists");
});

  db.run(`INSERT OR IGNORE INTO users (username, password, fullname, email, description, profilePic) 
          VALUES (?, ?, ?, ?, ?, ?)`, [
    "admin",
    "12345",
    "Administrator",
    "admin@example.com",
    "Default admin account",
    "default.png"
  ]);
});

/*
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
  )`);

  db.run(`INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)`, [
    "admin",
    "12345",
  ]);
});*/


// API route: login
app.post("/Login", (req, res) => {
  const { username, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE username = ? AND password = ?",
    [username, password],
    (err, row) => {
      if (err) {
        res.status(500).json({ success: false, message: "Database error." });
      } else if (row) {
        res.json({ success: true, message: "Login successful!" });
      } else {
        res.json({ success: false, message: "Invalid credentials." });
      }
    }
  );
});

// API route: register
app.post("/register", (req, res) => {
  const { username, password } = req.body;

  db.run(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, password],
    function (err) {
      if (err) {
        if (err.message.includes("UNIQUE constraint")) {
          res.json({ success: false, message: "Username already exists." });
        } else {
          console.error("❌ DB error:", err.message);
          res.status(500).json({ success: false, message: "Database error." });
        }
      } else {
        res.json({ success: true, message: "Account created successfully!" });
      }
    }
  );
});

const multer = require("multer");

//API Router : My Account Page
// Configure file upload (profile pictures go into /public/uploads)
const storage = multer.diskStorage({ 
  destination: (req, file, cb) => cb(null, "public/uploads"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Get profile
app.get("/profile/:username", (req, res) => {
  const { username } = req.params;
  db.get(
    "SELECT username, fullname, email, description, profilePic FROM users WHERE username = ?",
    [username],
    (err, row) => {
      if (err) {
        res.status(500).json({ success: false, message: "Database error." });
      } else {
        res.json(row || {});
      }
    }
  );
});

// Update profile
app.post("/profile/:username", upload.single("profilePic"), (req, res) => {
  const { username } = req.params;
  const { fullname, email, description } = req.body;
  const profilePic = req.file ? "/uploads/" + req.file.filename : null;

  db.run(
    `UPDATE users 
     SET fullname = ?, email = ?, description = ?, 
         profilePic = COALESCE(?, profilePic) 
     WHERE username = ?`,
    [fullname, email, description, profilePic, username],
    function (err) {
      if (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Database error." });
      } else {
        res.json({ success: true, message: "Profile updated successfully!" });
      }
    }
  );
});


// Delete account
app.delete("/delete/:username", (req, res) => {
  const { username } = req.params;

  db.run("DELETE FROM users WHERE username = ?", [username], function(err) {
    if (err) {
      console.error("❌ DB error:", err.message);
      res.status(500).json({ success: false, message: "Database error." });
    } else if (this.changes === 0) {
      res.json({ success: false, message: "User not found." });
    } else {
      res.json({ success: true, message: "Account deleted successfully." });
    }
  });
});



// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
