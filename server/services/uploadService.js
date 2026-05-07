const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.pdf'];
const MAX_SIZE    = 5 * 1024 * 1024; // 5MB

function makeStorage(subfolder) {
    return multer.diskStorage({
        destination: (req, file, cb) => {
            const dir = path.join(__dirname, '..', 'uploads', subfolder);
            fs.mkdirSync(dir, { recursive: true });
            cb(null, dir);
        },
        filename: (req, file, cb) => {
            const ext  = path.extname(file.originalname).toLowerCase();
            const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
            cb(null, name);
        }
    });
}

function fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_EXT.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error(`Only ${ALLOWED_EXT.join(', ')} files are allowed.`));
    }
}

const kycUpload     = multer({ storage: makeStorage('kyc'),      fileFilter, limits: { fileSize: MAX_SIZE } });
const listingUpload = multer({ storage: makeStorage('listings'), fileFilter, limits: { fileSize: MAX_SIZE } });

module.exports = { kycUpload, listingUpload };
