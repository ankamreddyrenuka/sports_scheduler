import express from "express";
import path from "path";
import session from "express-session";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 3000;

// Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "sportscheduler_secretkey",
    resave: false,
    saveUninitialized: true,
  })
);

// Mock users (for demo)
const users = [
  { email: "admin@sport.com", password: "admin123", role: "admin" },
  { email: "user@sport.com", password: "user123", role: "user" },
];

// Middleware for authentication
function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.redirect("/auth/login");
}

// Middleware for admin-only routes
function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === "admin") return next();
  res.status(403).send("Access Denied — Admins Only ❌");
}

// Routes
app.get("/", (req, res) => res.render("index"));

app.get("/auth/login", (req, res) => res.render("login", { error: null }));

app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find(
    (u) => u.email === email && u.password === password
  );
  if (!user) return res.render("login", { error: "Invalid credentials" });

  req.session.user = user;
  res.redirect("/dashboard");
});

app.get("/auth/register", (req, res) => res.render("register"));

app.post("/auth/register", (req, res) => {
  // For now, just simulate registration
  const { email, password } = req.body;
  users.push({ email, password, role: "user" });
  res.redirect("/auth/login");
});

app.get("/dashboard", isAuthenticated, (req, res) =>
  res.render("dashboard", { user: req.session.user })
);

app.get("/teams", isAuthenticated, (req, res) =>
  res.render("teams", { user: req.session.user })
);

app.get("/events", isAuthenticated, (req, res) =>
  res.render("events", { user: req.session.user })
);

app.get("/events/add", isAdmin, (req, res) =>
  res.render("addEvent", { user: req.session.user })
);

app.post("/events/add", isAdmin, (req, res) => {
  // Add event logic placeholder
  res.send(`<h2>✅ Event "${req.body.title}" added successfully!</h2>`);
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
