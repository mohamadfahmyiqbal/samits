// utils/UserService.js
const userService = {
  login: async (fields) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (fields.nik === 'Rofiq' && fields.password === 'Rofiq') {
          localStorage.setItem('token', 'dummy-token');
          resolve({ status: 200, message: 'Login berhasil!', data: { token: 'dummy-token', nama: 'John Doe', dept: 'IT' } });
        } else {
          resolve({ status: 401, message: 'NIK atau Password salah!' });
        }
      }, 1000);
    });
  },

  findUserByToken: async () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const token = localStorage.getItem('token');
        if (token) {
          resolve({
            status: 200,
            data: {
              nama: 'ROFIQ SUGARA',
              dept: 'IT',
              email: 'john.doe@example.com'
            }
          });
        } else {
          reject(new Error('Token tidak ditemukan'));
        }
      }, 500);
    });
  },

  logout: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.removeItem('token');
        resolve({ status: 200, message: 'Logout berhasil' });
      }, 500);
    });
  }
};

export default userService;
