const { Router } = require("express");
const AppController = require("../controllers/AppController");

const router = Router();

router.get("/status", AppController.getStatus);
router.get("/stats", AppController.getStats);

module.exports = router;
