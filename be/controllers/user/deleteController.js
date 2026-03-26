import * as userService from '../../services/user.service.js';

export const deleteUser = async (req, res) => {
  try {
    const { nik } = req.params;
    await userService.deleteUser(nik);
    res.status(200).json({ message: 'User berhasil dihapus.' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Gagal menghapus user.' });
  }
};
