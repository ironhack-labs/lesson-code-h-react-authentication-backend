const router = require("express").Router();

router.get("/", (req, res, next) => {
  res.json("You are on the API Route");
});

module.exports = router;
