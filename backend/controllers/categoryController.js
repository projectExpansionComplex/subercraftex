const Category = require('../models/categoryModel');
const factory = require("./handlerFactory")
const catchAsync = require('../utils/catchAsync');


const isArrayEmpty = (imageArray) => {
  return (Array.isArray(imageArray) && !imageArray.length);
}

exports.setUserId = (req, res, next) => {
  if (!req.body._user) req.body._user = req.user._id;
  next();
};


// Create a new category
exports.createCategory = factory.createOne(Category);

// Get all categories
exports.getAllCategories = factory.getAll(Category);

exports.getCategoryById = factory.getOne(Category, '_parentCategory');
exports.searchCategory = async (req,res) => {
    
  try {
    let superQ = {}

    Object.entries({...req.query}).map((val, i, arr) => {
    superQ[val[0]] = { '$regex': val[1], '$options': 'i' }
})

    const categories = await Category.find( superQ)
    res.json({categories})
  } catch (err) {
    return res.status(500).json({msg:err.message})
  }
}
exports.updateCategory = catchAsync(async (req, res, next) => {
  const wine = await Category.findById(req.params.id);
  if(!wine)  {
    return next(new ErrorResponse("Resource not found ", 404));
  }

  let files = wine.files;
  if (!isArrayEmpty(req.files)) {
    const newFiles = formatFiles(req.files);
    files = [...wine.files, ...newFiles];
  }
  let body = {...req.body};
  body.files = files;
  const updatedCategory = await Category.findByIdAndUpdate(req.params.id, body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: updatedCategory,
  });
});



exports.deleteCategory = catchAsync(async (req, res, next) => {
  const doc = await Category.findById(req.params.id);
  if (!doc) {
    return next(new ErrorResponse("Could not find resource", 404));
  }
  let files = doc.files;

  if (!isArrayEmpty(files)) {
    files.forEach(image => {
      deleteSingleFile(image.fileName, next);
    });
  } 

  await Category.findByIdAndDelete(req.params.id);
  res.status(200).json({
    status: "success",
    message: 'Resource deleted successfully',
    data: null,
  });
});

exports.deleteCategoryImage = catchAsync(async (req, res, next) => {
  const doc = await Category.findById(req.params.id);
  if (!doc) {
    return next(new ErrorResponse("Could not find resource", 404));
  }
  let files = doc.files;

  if (!isArrayEmpty(files)) {
    const file = req.body.file;
    const newImages = files.filter(image => image.fileName !== file.fileName);
    const imageToDelete = files.find(image => image.fileName === file.fileName);
    if(imageToDelete) {
      deleteSingleFile(imageToDelete.fileName, next);
    }

    const body = {
      files: newImages
    };

    await Category.findByIdAndUpdate(req.params.id, body);
    return res.status(200).json({
      status: "success",
      message: 'Resource deleted successfully'
    }); 
  } else {

    return res.status(204).json({
      data: null,
    });

  }

});
// Delete a category by ID
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) return res.status(404).json({ message: 'Category not found' });

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
