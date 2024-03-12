const dbClient = require("../utils/db");
const UtilController = require("./UtilController");
const redisClient = require("../utils/redis");
class UsersController {
  static async postNew(request, response) {
    const { email, password } = request.body;
    if (!email || !password) {
      response
        .status(400)
        .json({ error: `Missing ${!email ? "email" : "password"}` })
        .end();
    } else if (await dbClient.userExists(email)) {
      response.status(400).json({ error: "Already exist" }).end();
    } else {
      try {
        const passwordHash = UtilController.SHA1(password);
        const insert = await dbClient.newUser(email, passwordHash);
        const { _id } = insert.ops[0];
        const _email = insert.ops[0].email;
        response.status(201).json({ id: _id, email: _email }).end();
      } catch (err) {
        response.status(400).json({ error: err.message }).end();
      }
    }
  }

  static async getMe(req, res) {
    const token = await redisClient.get(`auth_${req.headers["x-token"]}`);
    if (token) {
      const userId = await redisClient.get(`auth_${req.headers["x-token"]}`);
      const user = await dbClient.filterUser({ _id: userId });

      return res.status(200).json({ id: user._id, email: user.email });
    }
    return res.status(401).json({ error: "Unauthorized" });
  }
}

module.exports = UsersController;
