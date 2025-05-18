import Conversation from "../models/conversation.model.js";
import Property from "../models/property.model.js";
import Message from "../models/message.model.js";
import mongoose, { Types } from "mongoose";
import { getRecieverSocketId, io } from "../lib/socket.js";

// Get all conversations for current user
export const getUserConversations = async (req, res) => {
  // console.log("User ID:", req.user._id); // Debugging line
  try {
    const convos = await Conversation.find({
      participants: req.user._id,
    })
      .populate("participants", "firstName lastName profilePics")
      .sort({ updatedAt: -1 });

    const formatted = await Promise.all(
      convos.map(async (c) => {
        const other = c.participants.find(
          (p) => p._id.toString() !== req.user._id.toString()
        );

        const property = await Property.findById(c.property);
        if (!property) {
          throw new Error("Property not found.");
        }

        return {
          _id: c._id,
          participantId: other?._id || null,
          participantName: other
            ? `${other.firstName} ${other.lastName}`
            : "Unknown",
          property: property,
          profilePic: other?.profilePics || null,
          lastMessage: c.lastMessage,
          updatedAt: c.updatedAt,
        };
      })
    );

    // console.log('passed')
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all messages in a specific conversation
export const getConversationMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversation: req.params.id,
    })
      .populate("sender", "firstName lastName ")
      .sort("createdAt");

    const formatted = messages.map((msg) => ({
      _id: msg._id,
      content: msg.content,
      senderName: `${msg.sender.firstName} ${msg.sender.lastName}`,
      isOwn: msg.sender._id.toString() === req.user._id.toString(),
      timestamp: msg.createdAt,
      type: msg.type,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, propertyId, content, type } = req.body;

    // Validate input
    if (!senderId || !receiverId || !type) {
      return res
        .status(400)
        .json({ error: "Sender, receiver, and type are required" });
    }

    // Check if the conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
      property: propertyId,
    });

    // If no conversation exists, create a new one
    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, receiverId],
        property: propertyId,
        lastMessage: content,
      });
      await conversation.save();
    }

    // Create the new message
    const message = new Message({
      conversation: conversation._id,
      sender: senderId,
      content: content,
      type: type,
    });

    await message.save();

    // Update lastMessage in the conversation
    conversation.lastMessage = content;
    await conversation.save();

    // Emit the new message to the receiver
    const receiverSocketId = getRecieverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", {
        _id: message._id,
        content: message.content,
        conversationId: conversation._id,
        sender: senderId,
        timestamp: message.createdAt,
        type: message.type
      });
    }

    // Emit updated conversations to both participants
    const updateConversationsForUser = async (userId) => {
      const convos = await Conversation.find({
        participants: userId,
      })
        .populate("participants", "firstName lastName profilePics")
        .sort({ updatedAt: -1 });

      const formattedConversations = await Promise.all(
        convos.map(async (c) => {
          const other = c.participants.find(
            (p) => p._id.toString() !== userId.toString()
          );

          const property = await Property.findById(c.property);
          return {
            _id: c._id,
            participantId: other?._id || null,
            participantName: other
              ? `${other.firstName} ${other.lastName}`
              : "Unknown",
            property: property,
            profilePic: other?.profilePics || null,
            lastMessage: c.lastMessage,
            updatedAt: c.updatedAt,
          };
        })
      );


      const userSocketId = getRecieverSocketId(userId);
      if (userSocketId) {
            console.log(`Emitting conversationsUpdated to user ${userId}`);
        io.to(userSocketId).emit(

          "conversationsUpdated",
          formattedConversations
        );
      }
    };

    await updateConversationsForUser(senderId);
    await updateConversationsForUser(receiverId);

    return res.status(201).json({
      _id: message._id,
      content: message.content,
      isOwn: message.sender._id.toString() === req.user._id.toString(),
      timestamp: message.createdAt,
      type: message.type,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const createConversation = async (req, res) => {
  try {
    const { propertyId } = req.body;
    const recipientId = req.params.id;
    const senderId = req.user._id;

    if (!recipientId || !propertyId) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found." });
    }

    // Check if a conversation already exists between users for this property
    let existing = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] },
      property: propertyId,
    });

    if (existing) {
      return res.status(200).json({
        message: "Conversation already exists.",
        conversation: existing,
      });
    }

    // If no conversation, create one
    const newConvo = await Conversation.create({
      participants: [senderId, recipientId],
      property: propertyId,
    });

    res
      .status(201)
      .json({ message: "Conversation created.", conversation: newConvo });
  } catch (err) {
    console.error("createConversation error:", err);
    res.status(500).json({ message: err.message || "Something went wrong." });
  }
};
