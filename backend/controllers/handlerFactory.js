const catchAsync = require("../utils/catchAsync");
const ErrorHandler = require("../utils/errorResponse");
const UtilFeatures = require("../utils/utilFeatures");
const { objIsEmpty } = require("../utils/checks");
const { deleteSingleFile } = require("../helpers/helpers");


exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new ErrorHandler("Could not find resource", 404));
    }
    res.status(200).json({
      status: "success",
      message: 'Resource deleted successfully',
      data: null,
    });
  });

exports.deleteWithFile = (Model) => catchAsync(async (req, res, next) => {
  const doc = await Model.findById(req.params.id);
  if (!doc) {
    return next(new ErrorHandler("Could not find resource", 404));
  }
  let file = doc.file;

  if (!objIsEmpty(file)) {
    deleteSingleFile(file.fileName, next);
  }

  await Model.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    message: 'Resource deleted successfully',
    data: null,
  });
});

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new ErrorHandler("Could not find resource", 404));
    }

    res.status(200).json({
      status: "success",
      data: doc,
    });
  });

exports.updateWithFile = (Model) => catchAsync(async (req, res, next) => {
  const doc1 = await Model.findById(req.params.id);

  if (!doc1) {
    return next(new ErrorHandler("Could not find resource", 404));
  }

  let file = doc1.file;

  if (!objIsEmpty(req.file) && !objIsEmpty(file)) {
    deleteSingleFile(file.fileName, next);
  }

  const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: doc,
  });
});


exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
   
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: "success",
      data: doc,
    });
  });

exports.getOne = (Model, populateOpts) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOpts) query = query.populate(populateOpts);

    const doc = await query;

    if (!doc) {
      return next(new ErrorHandler("Could not find resource", 404));
    }

    res.status(200).json({
      status: "success",
      data: doc,
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let query = Model.find();
    const features = new UtilFeatures(query, req.query);
    const results = features
      .filter()
      .limitFields()
      .sort()
      .paginate()
      .populateWith();

    const doc = await results.query;

    res.status(200).json({
      status: "success",
      total: doc.length,
      data: doc,
    });
  });
