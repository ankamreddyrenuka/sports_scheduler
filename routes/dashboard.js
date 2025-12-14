app.get("/dashboard", (req, res) => {
  res.render("dashboard", { title: "Dashboard" });
});
