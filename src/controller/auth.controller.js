import bcrypt from "bcryptjs";
import multer from "multer";



import { generateToken } from "../lib/util.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { firstName, lastName, othername, email, password } = req.body;

  try {
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6)
      return res.json({ error: "password must be at least 6 characters long" });

    // const duplicate = User.findOne({email})
    // if(duplicate) return res.status(400).json({ message: 'email already exists' });
    const duplicate = await User.findOne({ email }); // Add 'await' here
    if (duplicate) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // create new user
    const newUser = new User({
      firstName,
      lastName,
      othername,
      email,
      password: hashedPassword,
    });
    if (newUser) {
      newUser.save();
      // generate token
      generateToken(newUser._id, res);

      res
        .status(201)
        .json({
          message: "user created successfully",
          token: generateToken(newUser._id, res),
        });
      // res.json({ message: 'user created successfully' });
    }
  } catch (error) {
    console.log("signup controller error", error.message);
    res.status(500).json({ message: "Internal Server error" });
  }
  // check if user already exists
};
export const login = async (req, res) => {

  const { email, password } = req.body;

  try {

    if (!email || !password) return res.status(400).json({ message: "All fields are required" });

    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    generateToken(user._id, res);
    res.status(200).json({
      _id: user._id,
      fullName: `${user.firstName}, ${user.lastName}`,
      email: user.email,
      profilePic: user.profilePics,
    });
  } catch (error) {
    console.log(error.message)
  }
};
export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server error" });
  }
};

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "Internal Server error" });
    }
};

export const uploadProfilePic = async (req, res) => {

try {
  if (!req.file) {
    console.log("❌ No file received");
    return res.status(400).json({ message: "No file uploaded" });
  }

  console.log("📂 Received File:", req.file);
  console.log("👤 Authenticated User:", req.user);

  const user = await User.findById(req.user._id);
  if (!user) {
    console.log("User not found");
    return res.status(404).json({ message: "User not found" });
  }

  //  Delete previous profile picture (if exists)
  if (user.profilePics && user.profilePics.length > 0) {
    try {
      const oldPublicId = user.profilePics[0].split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(oldPublicId);
      console.log(" Deleted previous profile picture:", oldPublicId);
    } catch (deleteError) {
      console.error("❌Error deleting old image from Cloudinary:", deleteError.message);
    }
  }

  //  Upload new image to Cloudinary
  const uploadResult = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: "profile_pics" },
      (error, result) => {
        if (error) {
          console.error(" Cloudinary Upload Error:", error);
          reject(error);
        } else {
          console.log("Cloudinary Upload Successful:", result.secure_url);
          resolve(result);
        }
      }
    ).end(req.file.buffer);
  });

  //  Update user profile picture in database
  user.profilePics = uploadResult.secure_url; // Store only the URL
  await user.save();

  console.log("✅ Updated User:", user);

  // ✅ Send success response
  res.status(200).json({
    message: "Profile picture uploaded successfully",
    profilePics: uploadResult.secure_url,
    user: user.toObject({ getters: true }),
  });

} catch (error) {
  console.error("❌ Error:", error.message);
  res.status(500).json({ message: "Internal Server Error" });
}
}

export const deletProfilePic = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    if (user.profilePics && user.profilePics.length > 0) {
      try {
        const oldPublicId = user.profilePics[0].split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(oldPublicId);
        console.log(" Deleted previous profile picture:", oldPublicId);
      } catch (deleteError) {
        console.error("❌Error deleting old image from Cloudinary:", deleteError.message);
      }
    }

     //  Update user profile picture in database
  user.profilePics = ''; 
  await user.save();

  console.log("✅ Updated User:", user);

  // ✅ Send success response
  res.status(200).json({
    message: "Profile picture deleted successfully",
    user: user.toObject({ getters: true }),
  });

    
  } catch (error) {
    
  }
}