// controllers/user/logoutController.js
export const logout = async (_req, res) => {
  try {
    res.clearCookie('authToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    });

    return res.status(200).json({ message: 'Logout berhasil.' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      message: 'Terjadi kesalahan saat logout.'
    });
  }
};
