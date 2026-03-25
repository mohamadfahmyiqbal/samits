
// middleware/validator.middleware.js
// Asumsi: Library Joi sudah terinstal (npm install joi)
import Joi from 'joi'; 

/**
 * Fungsi pembungkus (wrapper) untuk validasi skema.
 * @param {Joi.Schema} schema - Skema Joi untuk validasi
 * @param {string} source - Sumber data untuk validasi ('body', 'query', atau 'params')
 */
const validatorMiddleware = (schema, source = 'body') => (req, res, next) => {
    let data;

    switch (source) {
        case 'body':
            data = req.body;
            break;
        case 'query':
            data = req.query;
            break;
        case 'params':
            data = req.params;
            break;
        default:
            return res.status(500).json({ message: 'Kesalahan server: Sumber validasi tidak valid.' });
    }

    const { error } = schema.validate(data, {
        abortEarly: false, // Melaporkan semua error validasi
        allowUnknown: true // Mengizinkan kunci yang tidak didefinisikan dalam skema
    });

    if (error) {
        // Bentuk pesan error yang mudah dibaca
        const errorMessages = error.details.map(detail => detail.message);
        
        return res.status(400).json({ 
            message: 'Validasi input gagal.',
            errors: errorMessages
        });
    }

    // Jika validasi sukses, lanjutkan ke fungsi handler berikutnya
    next();
};

export default validatorMiddleware;


// --- Contoh Penggunaan di File Rute (misalnya user.routes.js) ---
/*
import Joi from 'joi';
import validator from '../middleware/validator.middleware.js';

const loginSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required()
});

router.post('/login', validator(loginSchema, 'body'), userController.login);
*/