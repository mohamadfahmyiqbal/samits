import * as userService from "../../services/user.service.js";

export const deleteUser = async (req, res) => {
  try {
    const { nik } = req.params;
    await userService.deleteUser(nik);
    res.status(200).json({ message: "User berhasil dihapus." });
  } catch (error) {
    console.error("Delete user error:", error);
    const status = error.statusCode || 500;
    const message = error.message || "Gagal menghapus user.";
    res.status(status).json({ message });
  }
};
