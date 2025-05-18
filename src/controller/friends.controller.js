import User from "../models/user.model.js";


// Add a Friend
export const addFriend = async (req, res) => {
  try {
    const { userId, friendId } = req.body;

    // Check if both users exist
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already friends
    if (user.friends.includes(friendId)) {
      return res.status(400).json({ message: "Already friends" });
    }

    user.friends.push(friendId);
    await user.save();

    res
      .status(200)
      .json({ message: "Friend added successfully", friends: user.friends });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get All Friends
export const getFriends = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).populate(
      "friends",
      "username emailv profilePics firstName lastName"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ friends: user.friends });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
