import Property from "../models/property.model.js";
 import cloudinary from "../lib/cloudinary.js"

export const createProperty = async (req, res) => {
  const {
    title,
    description,
    price,
    location,
    type,
    images,
    status,
    tags,
    amenities,
    bathrooms,
    bedrooms,
  } = req.body;

  if (!title || !description || !price || !location || !type || !images)
    return res.status(400).json({ message: "Please fill in all fields" });

  try {
    // console.log(req.user.role);
    if (req.user.role !== "agent")
      return res
        .status(403)
        .json({ message: "You are not authorized to create a property" });

    const newProperty = new Property({
      title,
      description,
      price,
      location,
      status,
      images,
      type,
      tags,
      amenities,
      bedrooms,
      bathrooms,
      agent: req.user._id,
    });

    newProperty.save();
    res.status(200).json({ message: "Property created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server error" });
  }
};
export const getProperties = async (req, res) => {
  try {
    const properties = await Property.find().populate(
      "agent",
      "firstName lastName email"
    );
    res.status(200).json(properties);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server error" });
  }
};

export const getPropertyById = async (req, res) => {
  const { id } = req.params;
  try {
    const property = await Property.findById(id).populate(
      "agent",
      "firstName lastName email"
    );
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.status(200).json(property);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server error" });
  }
};

export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property)
      return res.status(404).json({ message: "Property not found" });
    console.log(property.agent.toString(), req.user._id.toString());
    if (property.agent.toString() !== req.user._id.toString())
      return res
        .status(403)
        .json({ message: "You are not authorized to update this property" });

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate("agent", "firstName lastName email");
    res.status(200).json(updatedProperty);
  } catch (error) {}
};

export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property)
      return res.status(404).json({ message: "Property not found" });

    console.log(property.agent.toString(), req.user._id.toString());
    if (property.agent.toString() !== req.user._id.toString())
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this property" });

    // Delete images from Cloudinary
    const deleteImagePromises = property.images.map((imageUrl) => {
      const parts = imageUrl.split("/");
      const uploadIndex = parts.indexOf("upload");
      if (uploadIndex === -1 || uploadIndex + 1 >= parts.length) {
        console.error("Invalid Cloudinary URL:", imageUrl);
        return Promise.resolve(); // Skip invalid URLs
      }
      const filePath = parts.slice(uploadIndex + 1).join("/");
      const publicId = filePath.split(".")[0]; // Extract public ID
      return cloudinary.uploader.destroy(publicId);
    });

    await Promise.all(deleteImagePromises);

    // Delete property from database
    const deletedProperty = await Property.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Property and associated images deleted successfully",
      deletedProperty: deletedProperty.toObject({ getters: true }),
    });
  } catch (error) {
    console.error("Error deleting property:", error.message);
    res.status(500).json({ message: "Internal Server error" });
  }
};
// delete and update properties

// search params

export const searchProperty = async (req, res) => {
  try {
    let {
      location,
      minPrice,
      maxPrice,
      propertyType,
      bedrooms,
      bathrooms,
      sort,
      page,
      limit,
    } = req.query;



    // 🔹 Build a dynamic filter object
    let filter = {};

    if (location) {
      filter.location = new RegExp(location, "i"); // Case-insensitive search
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (propertyType) filter.type = propertyType;
    if (bedrooms) filter.bedrooms = Number(bedrooms);
    if (bathrooms) filter.bathrooms = Number(bathrooms);

    // 🔹 Sorting logic
    let sortOptions = {};
    if (sort === "price_asc") sortOptions.price = 1;
    else if (sort === "price_desc") sortOptions.price = -1;
    else if (sort === "newest") sortOptions.createdAt = -1;

    // 🔹 Query database with filters, sorting, and pagination
    const properties = await Property.find(filter)
      .sort(sortOptions)
      .populate("agent", "name email");

    // Get total count for pagination
    const total = await Property.countDocuments(filter);

    res.json({
      success: true,
      total,
      totalPages: Math.ceil(total / limit),
      count: properties.length,
      properties,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// export const deleteImage = async (req, res) => {
//     try {
//      const { mediaURL } = req.query;
//       console.log(mediaURL)
//       //delete from db
//       const property = await Property.findById(req.params.id);
//       if (!property) return res.status(404).json({ message: 'Property not found' });
//       property.images = property.images.filter((image) => image.url!== mediaURL);

//       const parts = mediaURL.split("/");

//         // Find the index of "upload" and extract everything after it
//         const uploadIndex = parts.indexOf("upload");
//         if (uploadIndex === -1 || uploadIndex + 1 >= parts.length) {
//             throw new Error("Invalid Cloudinary URL");
//         }
//         const filePath = parts.slice(uploadIndex + 2).join("/");
//         const publicId = filePath.split(".")[0];
//         console.log(publicId)
//         await cloudinary.uploader.destroy(publicId);

//         res.status(200).json({ message: 'Media deleted successfully' });
//     } catch (error) {
//         console.log(error.message)
//         res.status(500).json({ message: 'Internal Server error' });
//     }
//   }
