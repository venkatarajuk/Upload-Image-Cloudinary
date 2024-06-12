// server.js
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;
const { Sequelize, DataTypes } = require("sequelize");

// Initialize Express app
const app = express();
app.use(express.json());
app.use(cors());
const PORT = process.env.PORT || 8000;

// Initialize Sequelize
const sequelize = new Sequelize("databasename", "username", "password", {
  host: "localhost",
  dialect: "mysql",
});

// Define Image model
const Image = sequelize.define(
  "Image",
  {
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    publicId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

// Sync Sequelize models with the database
sequelize
  .sync()
  .then(() => {
    console.log("Database synchronized");
  })
  .catch((error) => {
    console.error("Error syncing database:", error);
  });

// Configure Cloudinary
cloudinary.config({
  cloud_name: "cloudname",
  api_key: "cloudkey",
  api_secret: "cloud_Api_secret",
});

// Configure multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//  route for uploading image
app.post("/api/upload", upload.single("image"), async (req, res) => {
  if (req.file) {
    const { buffer } = req.file;
    try {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ resource_type: "auto" }, (error, result) => {
            if (error) {
              console.error("Error uploading to Cloudinary:", error);
              reject(error);
            } else {
              resolve(result);
            }
          })
          .end(buffer);
      });

      const imageUrl = result.secure_url;
      try {
        const createdImage = await Image.create({
          imageUrl,
          publicId: result.public_id,
        });

        return res.json({ imageUrl });
      } catch (dbError) {
        console.error("Error saving image in database:", dbError);
        return res
          .status(500)
          .json({ error: "Error saving image in database" });
      }
    } catch (uploadError) {
      console.error("Error uploading image:", uploadError);
      return res.status(500).json({ error: "Error uploading image" });
    }
  } else {
    return res.status(400).json({ error: "No file found" });
  }
});
//get all images
app.get("/api/images", async (req, res) => {
  try {
    const images = await Image.findAll();
    res.json(images);
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ error: "Error fetching images" });
  }
});
//  route to delete a perticular image
app.delete("/api/delete-images/:id", async (req, res) => {
  const imageId = req.params.id;
  try {
    const image = await Image.findOne({ where: { id: imageId } });
    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }
    const publicId = image.publicId;
    await cloudinary.uploader.destroy(publicId);
    await Image.destroy({ where: { id: imageId } });
    return res.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    return res.status(500).json({ error: "Error deleting image" });
  }
});
//  route to update a perticular image
// app.put("/api/update-image/:id", upload.single("image"), async (req, res) => {
//   const imageId = req.params.id;
//   if (!req.file) {
//     return res.status(400).json({ error: "No file found" });
//   }
//   const newImageUrl = req.file.location; // Assuming you're using AWS S3 and multer-s3
//   try {
//     const updatedImage = await Image.findOne({ where: { id:imageId } });
//     if (!updatedImage) {
//       return res.status(404).json({ error: "Image not found" });
//     }
//     updatedImage.imageUrl = newImageUrl;
//     await updatedImage.save();
//     return res.json({ imageUrl: newImageUrl });
//   } catch (error) {
//     console.error("Error updating image:", error);
//     return res.status(500).json({ error: "Error updating image" });
//   }
// });

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
