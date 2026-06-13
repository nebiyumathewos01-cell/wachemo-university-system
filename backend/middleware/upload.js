const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = path.join(__dirname, '../uploads');

    if (file.fieldname === 'photo' || file.fieldname === 'profilePhoto') {
      uploadPath = path.join(uploadPath, 'photos');
    } else {
      uploadPath = path.join(uploadPath, 'documents');
    }

    ensureDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// File filter — allow images and PDFs only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only images (JPEG, PNG) and PDF files are allowed'), false);
  }
};

// Photo-only filter
const photoFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /image\/(jpeg|jpg|png)/.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG and PNG images are allowed for photos'), false);
  }
};

// Application document upload (6 fields)
const uploadApplicationDocs = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 },
}).fields([
  { name: 'studentIdDocument', maxCount: 1 },
  { name: 'nationalIdDocument', maxCount: 1 },
  { name: 'bankProof', maxCount: 1 },
  { name: 'paymentReceipt', maxCount: 1 },
  { name: 'declarationForm', maxCount: 1 },
  { name: 'photo', maxCount: 1 },
]);

// Profile photo upload
const uploadProfilePhoto = multer({
  storage,
  fileFilter: photoFilter,
  limits: { fileSize: 2097152 }, // 2MB
}).single('profilePhoto');

// Middleware wrapper with error handling
const handleUploadApplicationDocs = (req, res, next) => {
  uploadApplicationDocs(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File size exceeds 5MB limit' });
      }
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

const handleUploadProfilePhoto = (req, res, next) => {
  uploadProfilePhoto(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

module.exports = { handleUploadApplicationDocs, handleUploadProfilePhoto };
