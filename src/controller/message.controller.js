import cloudinary from "../lib/cloudinary.js";
import { getRecieverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendNewMessage = async (req, res) => {
  try {
    const { receiver, content, media } = req.body;

    if (!content) return res.status(400).json({ message: "Message Cant Be Empty" });
    if (!receiver) return res.status(400).json({ message: "no existing user" });
    
    console.log(receiver)
    const sender = req.user._id;


    const newMessage = new Message({ sender, receiver, content, media });

    const receiverSocketId = getRecieverSocketId(receiver)
    if(receiverSocketId){
      io.to(receiver).emit("newMessage", newMessage)
    }

    await newMessage.save();

    res
      .status(201)
      .json({ message: "Message sent successfully", data: Message.content });
  } catch (error) {
    console.log("error im message controller");
    res.status(500).json({ message: "Internal Server error",
      error: error.message 
     });
  }
};

export const getMessages = async (req, res) => {
  try {
    const receiverId = req.params.receiverId;
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, reciever: receiverId },
        { sender: receiverId, reciever: req.user._id },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "firstName lastName email") // Populate sender info
      .populate("receiver", "firstName lastName email");

    res.status(200).json(messages);
  } catch (error) {
    console.log("error im message controller");
    res.status(500).json({ message: "Internal Server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    console.log(messageId)
console.log(req.params)
    if (!message) return res.status(404).json({ message: "Message not found" });

    if (message.sender.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You can only delete your own messages" });
    }

    if (message.media.length > 0) {
      for (const mediaUrl of message.media) {
        const publicId = mediaUrl.split("/").slice(-2).join("/").split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }
    }

    await message.deleteOne();
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
