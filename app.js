require("dotenv/config");
require("./db");
const express = require("express");

const { isAuthenticated } = require("./middleware/jwt.middleware");


const app = express();
require("./config")(app);


// 👇 Start handling routes here

const dashboardRouter = require("./routes/dashboard.routes")
app.use("/", dashboardRouter)

const allRoutes = require("./routes");
app.use("/api", allRoutes);

const projectRouter = require("./routes/project.routes");
app.use("/api", isAuthenticated, projectRouter);

const taskRouter = require("./routes/task.routes");
app.use("/api", isAuthenticated, taskRouter);

const userAuthRouter = require("./routes/userAuth.routes");
app.use("/auth", userAuthRouter);

const therapistAuthRouter = require("./routes/therapistAuth.routes");
app.use("/therapist", therapistAuthRouter);

const therapistRouter = require("./routes/therapist.routes");
app.use("/therapist", isAuthenticated, therapistRouter)

require("./error-handling")(app);

module.exports = app;
