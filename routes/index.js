const { Router } = require("express");
const AppController = require("../controllers/AppController");
const UsersController = require("../controllers/UsersController");
const AuthController = require("../controllers/AuthController");

const router = Router();

router.use((request, response, next) => {
  const paths = ["/connect"];
  if (!paths.includes(request.path)) {
    next();
  } else if (!request.headers.authorization) {
    response.status(401).json({ error: "Unauthorized" }).end();
  } else {
    next();
  }
});

router.use((request, response, next) => {
  const paths = ["/disconnect", "/users/me", "/files"];
  if (!paths.includes(request.path)) {
    next();
  } else if (!request.headers["x-token"]) {
    response.status(401).json({ error: "Unauthorized" }).end();
  } else {
    next();
  }
});

router.get("/status", AppController.getStatus);
router.get("/stats", AppController.getStats);
router.post("/users", UsersController.postNew);
router.get("/users/me", UsersController.getMe);
router.get("/connect", AuthController.getConnect);
router.get("/disconnect", AuthController.getDisconnect);

module.exports = router;
