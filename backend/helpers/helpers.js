const fs = require('fs-extra');
const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const uploadsPath = path.join(__dirname, 'public', 'uploads' );

const fileSizeFormatter = (bytes, decimal) => {
  if(bytes === 0){
      return '0 Bytes';
  }
  const dm = decimal || 2;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'YB', 'ZB'];
  const index = Math.floor(Math.log(bytes) / Math.log(1000));
  return parseFloat((bytes / Math.pow(1000, index)).toFixed(dm)) + ' ' + sizes[index];

};

const formatFiles = (reqFiles) => {
  const files = reqFiles.map((file) => ({
    originalName: file.originalname,
    fileName: file.filename,
    fileType: file.mimetype,
    imageUrl: file.path,
    fileSize: fileSizeFormatter(file.size, 2),
  }));
  return files;
};

exports.formatFiles = (reqFiles) => {
  const files = reqFiles.map((file) => ({
    originalName: file.originalname,
    fileName: file.filename,
    fileType: file.mimetype,
    imageUrl: file.path,
    fileSize: fileSizeFormatter(file.size, 2),
  }));
  return files;
};

exports.filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if(allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
}


exports.setFile = (req, res, next) => {
  if (req.file) {
    const file = {
      originalName: req.file.originalname,
      fileName: req.file.filename,
      imageUrl: req.file.path,
      fileType: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    };

    req.body.file = file;
  }
  next();
}

exports.setFileField = (file) => {
  const newFile = {
    originalName: file[0].originalname,
    fileName: file[0].filename,
    imageUrl: file[0].path,
    fileType: file[0].mimetype,
    fileSize: fileSizeFormatter(file[0].size, 2),
  };

 return newFile;
};


exports.setFiles = (req, res, next) => {
  if (req.files) {
    const files = formatFiles(req.files);
    req.body.files = files;
  }
  next();
}


exports.deleteSingleFile = async (fileName, next) => {
  if(fileName) {
    // const filePath = path.join(__basedir, `public/uploads/${fileName}`);
    const filePath = path.join(uploadsPath, fileName);
    // Check if the file exists
    try {
      await fs.remove(filePath);
    } catch (error) {
      next(error);
    }
  }
}
