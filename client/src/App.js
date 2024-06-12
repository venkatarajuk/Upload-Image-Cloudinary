// App.js
import logo from "./logo.svg";
import "./App.css";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

function App() {
  const inputRef = useRef(null);
  const [image, setImage] = useState(null);
  const [getimages, setGetImages] = useState([]);

  useEffect(() => {
    getAllImages();
  }, []);

  const getAllImages = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/images");
      setGetImages(response.data);
    } catch (error) {
      console.error("Error fetching image URLs:", error);
    }
  };

  const handleImageClick = () => {
    inputRef.current.click();
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const handleSubmit = async () => {
    if (image) {
      try {
        const formData = new FormData();
        formData.append("image", image);
        const res = await axios.post(
          "http://localhost:8000/api/upload",
          formData
        );
        alert("Image uploaded successfully!");
        getAllImages();
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("Error uploading image. Please try again.");
      }
    } else {
      alert("Please select an image to upload.");
    }
  };

  const handleDelete = async (Id) => {
    const confirmDelete = window.confirm("Do you want to delete this image?");
    if (confirmDelete) {
      try {
        const res = await axios.delete(
          `http://localhost:8000/api/delete-images/${Id}`
        );
        alert("Image deleted successfully!");
        getAllImages();
      } catch (error) {
        console.error("Error deleting image:", error);
        alert("Error deleting image. Please try again.");
      }
    }
  };

  const handleUpdate = async (id, updatedImage) => {
    try {
      const formData = new FormData();
      formData.append("image", updatedImage);
      await axios.put(`http://localhost:8000/api/update-image/${id}`, formData);
      alert("Image updated successfully!");
      getAllImages(); // Refresh the image list after update
    } catch (error) {
      console.error("Error updating image:", error);
      alert("Error updating image. Please try again.");
    }
  };

  return (
    <div className="App">
      <div onClick={handleImageClick}>
        {image ? (
          <img src={URL.createObjectURL(image)} alt="logo" className="logo" />
        ) : (
          <img src={logo} alt="logo" className="logo" />
        )}
      </div>
      <input
        type="file"
        ref={inputRef}
        onChange={handleImageChange}
        style={{ display: "none" }}
      />
      <button onClick={handleSubmit}>Upload  Image</button>

      <div className="image-list">
        {getimages.map((image, index) => (
          <div key={index} className="image-item">
            <img
              src={image.imageUrl}
              alt={`image-${index}`}
              className="image-items-images"
            />
            <button onClick={() => handleDelete(image.id)}>Delete</button>
            {/* <button
              onClick={() => {
                const updatedImage = prompt(
                  "Enter the path to the updated image:"
                );
                if (updatedImage) {
                  handleUpdate(image.id, updatedImage);
                }
              }}
            >
              Update
            </button> */}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
