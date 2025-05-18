import Agent from "../models/agent.model.js";
import Property from "../models/property.model.js";
import User from "../models/user.model.js";

export const getAgent = async (req, res) => {
  try {
    const { agentId } = req.params;
    // console.log(agentId)
    const agent = await User.findById(agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }
    return res.status(200).json(agent);
  } catch (error) {
    console.error(error.message);
    throw new Error("Error fetching agent");
    res.status(404).json({ message: "agent not found" });
  }
};

export const getAgentProperties = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the agent by ID
    const agent = await User.findById(id);
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    // Find all properties associated with the agent
    const properties = await Property.find({ agent: id });

    res.status(200).json({
      success: true,
      agent: {
        id: agent._id,
        firstName: agent.firstName,
        lastName: agent.lastName,
        email: agent.email,
        profilePics: agent.profilePics,
      },
      properties,
    });
  } catch (error) {
    console.error("Error fetching agent properties:", error.message);
    res.status(500).json({ message: "Internal Server error" });
  }
};

export const registerAgent = async (req, res) => {
  const {
    fullName,
    email,
    phone,
    bankCode,
    accountNumber,
    accountName,
    userId,
  } = req.body;

  try {
    if (
      (!fullName,
      !email,
      !phone,
      !bankCode,
      !accountNumber,
      !accountName,
      !userId)
    ) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === 'agent') {
      return res.status(500).json({ message: "You Are Already An Agent"})
    }

     await User.findByIdAndUpdate(
      userId,
      { role: 'agent' },
      { new: true }
    );



    const newAgent = new Agent({
      agentId: userId,
      fullName,
      email,
      phone,
      bankCode,
      accountNumber,
      accountName,
    });

    await newAgent.save();
    res.status(200).json({ message: "Agent Created Successfully" });
  } catch (error) {
    console.log("error registering agent", error.message);
    res.status(500).json({ message: "Error Registering Agent" });
  }
};

export const getAgentDetails = async (req, res) => {
  try {
    const { agentId } = req.params;

    // Find the agent by ID
    const agent = await Agent.findOne({ agentId: agentId });
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    res.status(200).json({
      agent
    });
  } catch (error) {
    console.error("Error fetching agent details:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};