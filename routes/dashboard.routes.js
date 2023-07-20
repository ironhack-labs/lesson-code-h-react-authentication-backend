const router = require("express").Router();

router.get("/", (req, res, next) => {
  res.json("Welcome to the Dashboard, all route calls are based off api-address/api/*. In the future we will implement a UI interface for our backend - an admin dashboard. - Stephen, Andy, Devin");
});

module.exports = router;
