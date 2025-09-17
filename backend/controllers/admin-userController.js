import userModel from "../models/userModel.js";
// Get all users with role 'user'
export const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find({ role: "user" }).select("-password -verifyOtp -resetOtp");
    res.status(200).json({ success: true, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deactivateUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await userModel.findByIdAndDelete(userId);

    res.status(200).json({ success: true, message: "User account deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const blockUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Toggle block status
    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({
      success: true,
      message: user.isBlocked ? "User has been blocked" : "User has been unblocked",
      isBlocked: user.isBlocked
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};