const router = require("express").Router();
const { auth, authorize } = require("../middleware/authMiddlerware");
const categoryController = require("../controllers/categoryController");
const fileUpload = require("../helpers/filehelper");
const helpers = require("../helpers/helpers");

router.get('/category', categoryController.getAllCategories);

router
  .route("/category/:id")
  .get(categoryController.getCategoryById);

router.use(auth);
//production routes

router
  .route("/category")
 
  .post(
    authorize('admin', 'superadmin'),
    fileUpload.uploadSingleImage, 
    categoryController.setUserId,
    helpers.setFile,
    categoryController.createCategory);
  
    router.get("/search-cat", categoryController.searchCategory);



router
  .route("/category/:id")
  .patch( authorize('admin', 'superadmin'),
  fileUpload.uploadSingleImage, 
    helpers.setFile,
    categoryController.updateCategory)
  .delete(authorize('admin', 'superadmin'),categoryController.deleteCategory);

  router.patch("/category/:id/image", authorize('admin', 'superadmin'),categoryController.deleteCategoryImage);


module.exports = router;
