import User from "../models/User.js";

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res
      .status(200)
      .json({ user, status: true, msg: "Profile found successfully.." });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: false, msg: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email, preferredLanguage } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ status: false, msg: "User not found" });
    }

    // Kontrollera om e-postadressen redan finns hos en annan användare
    if (email && email !== user.email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: user._id },
      });
      if (existingUser) {
        return res.status(400).json({
          status: false,
          msg: "En användare med denna e-postadress finns redan",
        });
      }
    }

    // Uppdatera användarens information
    if (name) user.name = name;
    if (email) user.email = email;
    if (preferredLanguage) user.preferredLanguage = preferredLanguage;

    const updatedUser = await user.save();
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    res.status(200).json({
      user: userResponse,
      status: true,
      msg: "Profile updated successfully",
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: false, msg: "Internal Server Error" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ status: false, msg: "User not found" });
    }

    // Verifiera nuvarande lösenord
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        status: false,
        msg: "Current password is incorrect",
      });
    }

    // Uppdatera lösenordet
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      status: true,
      msg: "Password updated successfully",
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: false, msg: "Internal Server Error" });
  }
};
