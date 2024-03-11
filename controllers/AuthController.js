const { v4 } = require("uuid");
const dbClient = require("../utils/db");
const redisClient = require("../utils/redis");
const UtilController = require("./UtilController");
const { Buffer } = require("buffer");

class AuthController {
  static async getConnect(request, response) {
    try {
      const encodeAuthPair = request.headers.authorization.split(" ")[1];
      const decodeAuthPair = Buffer.from(encodeAuthPair, "base64")
        .toString()
        .split(":");
      const _email = decodeAuthPair[0];
      const pwd = UtilController.SHA1(decodeAuthPair[1]);
      const user = await dbClient.filterUser({ email: _email });
      if (user.passwordHash !== pwd) {
        response.status(401).json({ error: "Unauthorized" }).end();
      } else {
        const _token = v4();
        await redisClient.set(`auth_${_token}`, user._id.toString(), 86400);
        response.status(200).json({ token: _token }).end();
      }
    } catch (e) {
      response.status(401).json({ error: "Unauthorized" }).end();
    }
  }

  static async getDisconnect(request, response) {
    const { token } = request;
    await redisClient.del(token);
    response.status(204).end();
  }
}

module.exports = AuthController;
