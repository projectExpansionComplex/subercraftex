const multer = require("multer");
const sharp = require("sharp");
const ErrorResponse = require("../utils/errorResponse");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
    );
  },
});

const filefilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(
      new ErrorResponse("Not an Image! Please upload only images", 400),
      false
    );
  }
};

const multerStorage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  fileFilter: filefilter,
});

exports.uploadAny = multer({
  storage: storage,
  fileFilter: filefilter,
});

const uploadWithResize = multer({
  storage: multerStorage,
  fileFilter: filefilter,
});

exports.uploadSingleImage = upload.single("file");

exports.uploadMultipleImage = upload.array('files');

exports.uploadUserImage = uploadWithResize.single("file");

exports.uploadImageWithResize = uploadWithResize.single("file");

exports.resizeUserPhoto = (req, res, next) => {
    if (!req.file) return next();
  
    req.file.filename = `user-avatar-${req.user.id}-${Date.now()}.jpeg`;
    sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`public/uploads/${req.file.filename}`);
  
    next();
};


exports.resizePhoto = (req, res, next) => {
  if (!req.file) return next();
  
  req.file.filename = new Date().toISOString().replace(/:/g, "-") + "-" + req.file.originalname;
  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/uploads/${req.file.filename}`);

  next();
};




