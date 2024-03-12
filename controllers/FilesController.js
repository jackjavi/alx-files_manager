const path = require("path"); // Import the path module
const { v4 } = require("uuid"); // Import UUID generation library
const { contentType } = require("mime-types");
const fs = require("fs").promises; // Import file system promises
const db = require("../utils/db"); // Replace with actual database interaction logic
const redisClient = require("../utils/redis"); // Replace with actual Redis client

class FilesController {
  static async postUpload(request, response) {
    const userId = await redisClient.get(`auth_${request.headers["x-token"]}`);
    if (!userId) {
      return response.status(401).json({ error: "Unauthorized" });
    }

    const { name, type, parentId, isPublic, data } = request.body;

    if (
      !name ||
      !type ||
      !["folder", "file", "image"].includes(type) ||
      (!data && type !== "folder")
    ) {
      return response
        .status(400)
        .send(
          `error: ${
            !name
              ? "Missing name"
              : !type || !["folder", "file", "image"].includes(type)
              ? "Missing type"
              : "Missing data"
          }`
        );
    }

    try {
      let flag = false;
      if (parentId) {
        const folder = await db.filterFiles({ _id: parentId });
        if (!folder) {
          response.status(400).json({ error: "Parent not found" }).end();
          flag = true;
        } else if (folder.type !== "folder") {
          response.status(400).json({ error: "Parent is not a folder" }).end();
          flag = true;
        }
      }
      if (!flag) {
        const newFile = await db.newFile(
          userId,
          name,
          type,
          isPublic,
          parentId,
          data
        );

        if (!newFile) {
          return response.status(500).json({ error: "Internal server error" });
        }

        /*const allowedMimeTypes = ["text/plain", "image/jpeg", "image/png"];
        if (type === "file" || type === "image") {
          const uploadedMimeType = contentType(data);
          if (!allowedMimeTypes.includes(uploadedMimeType)) {
            return response
              .status(400)
              .json({ error: "Invalid file type uploaded" });
          }
        }*/

        // Local File Storage
        if (type === "file" || type === "image") {
          const filePath = generateUniqueFilePath(type); // Replace with logic to generate path
          const decodedData = Buffer.from(data, "base64");

          try {
            await fs.writeFile(filePath, decodedData);
            newFile.localPath = filePath; // Update the file object with the local path
          } catch (err) {
            console.error("Error writing file:", err);
            // Handle potential errors during file writing
          }
        }

        const newFileData = newFile.ops[0];
        console.log(newFileData);

        const responseObj = {
          id: newFileData._id,
          userId: newFileData.userId,
          name: newFileData.name,
          type: newFileData.type,
          isPublic: newFileData.isPublic,
          parentId: newFileData.parentId,
        };

        response.status(200).json(responseObj).end();
      }
    } catch (err) {
      console.error(err);
      response.status(500).json({ error: "Internal server error" });
    }
  }
}

module.exports = FilesController;

function generateUniqueFilePath(type) {
  // 1. Get the environment variable or default path
  const storageFolder = process.env.FOLDER_PATH || "/tmp/files_manager";

  // 2. Ensure the storage folder exists (optional)
  // You can uncomment this block to automatically create the folder if it doesn't exist
  // fs.promises.mkdir(storageFolder, { recursive: true })
  //   .catch(err => console.error("Error creating storage folder:", err));

  // 3. Generate a unique filename with extension based on type
  const extension = type === "file" ? ".txt" : ".png"; // Adjust extensions as needed
  const filename = `${v4()}${extension}`;

  // 4. Combine path and filename
  return path.join(storageFolder, filename);
}
