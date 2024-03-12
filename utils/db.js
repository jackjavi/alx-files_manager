const { MongoClient, ObjectId } = require("mongodb");
const { env } = process;

// eslint-disable-next-line import/prefer-default-export
const DBClient = class DBClients {
  constructor() {
    const host = env.DB_PORT ? env.DB_PORT : "127.0.0.1";
    const port = env.DB_HOST ? env.DB_HOST : 27017;
    const database = env.DB_DATABASE ? env.DB_DATABASE : "files_manager";
    this.myClient = MongoClient(`mongodb://${host}:${port}/${database}`);
    this.myClient.connect();
  }

  isAlive() {
    return this.myClient.isConnected();
  }

  async nbUsers() {
    /* returns number of documents in the collection users */
    const myDB = this.myClient.db();
    const myCollection = myDB.collection("users");
    return myCollection.countDocuments();
  }

  async nbFiles() {
    /* returns number of documents in the collection files */
    const myDB = this.myClient.db();
    const myCollection = myDB.collection("files");
    return myCollection.countDocuments();
  }

  async userExists(email) {
    /* returns true if the user with the given email exists */
    const myDB = this.myClient.db();
    const myCollection = myDB.collection("users");
    return myCollection.findOne({ email });
  }

  async newUser(email, passwordHash) {
    /* creates a new user with the given email and passwordHash */
    const myDB = this.myClient.db();
    const myCollection = myDB.collection("users");
    return myCollection.insertOne({ email, passwordHash });
  }

  async filterUser(filters) {
    const myDB = this.myClient.db();
    const myCollection = myDB.collection("users");
    if ("_id" in filters) {
      // eslint-disable-next-line no-param-reassign
      filters._id = ObjectId(filters._id);
    }
    return myCollection.findOne(filters);
  }

  async filterFiles(filters) {
    const myDB = this.myClient.db();
    const myCollection = myDB.collection("files");
    const idFilters = ["_id", "userId", "parentId"].filter(
      (prop) => prop in filters && filters[prop] !== "0"
    );
    idFilters.forEach((i) => {
      // eslint-disable-next-line no-param-reassign
      filters[i] = ObjectId(filters[i]);
    });
    return myCollection.findOne(filters);
  }

  async newFile(userId, name, type, isPublic = false, parentId = null, data) {
    const myDB = this.myClient.db();
    const myCollection = myDB.collection("files");

    const fileDocument = {
      userId: ObjectId(userId),
      name,
      type,
      isPublic,
      parentId: parentId ? ObjectId(parentId) : null,
      data,
    };

    return myCollection.insertOne(fileDocument);
  }
};

const dbClient = new DBClient();

module.exports = dbClient;
