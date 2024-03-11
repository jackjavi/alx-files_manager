const { createHash } = require("crypto");

class UtilController {
  static SHA1(str) {
    return createHash("sha1").update(str).digest("hex");
  }
}

module.exports = UtilController;
