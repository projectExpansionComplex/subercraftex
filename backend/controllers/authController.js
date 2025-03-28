const Users = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ErrorResponse = require("../utils/errorResponse");
const nodemailer = require("nodemailer");
const VerificationToken = require("../models/verificationTokenModel");
const ResetToken = require("../models/resetTokenModel");
const ResetToken2 = require("../models/resetTokenModel2");
const { v4: uuidv4 } = require('uuid');
const crypto = require("crypto");
const mongoose = require('mongoose');

// check email validity
const checkEmailValidity = (email) => {
  // don't remember from where i copied this code, but this works.
  let re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

//creating access token
const createAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_JWT_EXPIRE,
  });
};

//generate refresh token
const createRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_JWT_EXPIRE,
  });
};

const generateOTP = () => {
  let otp = "";
  for (let i = 0; i < 6; i++) {
    const randVal = Math.round(Math.random() * 9);
    otp = otp + randVal;
  }
  return otp;
};

const mailTransport = () =>
  nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: process.env.GMAIL_PORT,
    auth: {
      user: process.env.GMAIL_USERNAME,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

const generateEmailTemplate = (code) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset='UTF-8'>
      <meta http-equiv='X-UA-Compatible' content='IE=edge'>
      <style>
        @media only screen and (max-width:620px){
          h1{
            font-size:20px;
            padding:5px;
          }
        }
      </style>
    </head>
    <body>
      <div>
          <div style="max-width:620px; margin:0 auto; font-family:sans-serif; color:#272727;">
            <h1 style="background:#f6f6f6; padding:10px; text-align:center; color:#272727;">
            We are delighted to welcome you to our suberCraftex shop

            </h1>
            <p>Please Verify Your Email To Continue Your Verification code is:</p>
            <p style="width:80px; margin:0 auto; font-weight:bold; text-align:center; background:#f6f6f6; border-radius:5px; font-size:25px;">
              ${code}
            </p>
          </div>
      </div>
    </body>
    </html>
  `;
};
const generateEmailTemplate2 = (code) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset='UTF-8'>
      <meta http-equiv='X-UA-Compatible' content='IE=edge'>
      <style>
        @media only screen and (max-width:620px){
          h1{
            font-size:20px;
            padding:5px;
          }
        }
      </style>
    </head>
    <body>
      <div>
          <div style="max-width:620px; margin:0 auto; font-family:sans-serif; color:#272727;">
            <h1 style="background:#f6f6f6; padding:10px; text-align:center; color:#272727;">
            Response To Your Reset Password Request

            </h1>
            <p>Please enter the code below to reset your password:</p>
            <p style="width:80px; margin:0 auto; font-weight:bold; text-align:center; background:#f6f6f6; border-radius:5px; font-size:25px;">
              ${code}
            </p>
          </div>
      </div>
    </body>
    </html>
  `;
};
const plainEmailTemplate = (heading, message) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset='UTF-8'>
      <meta http-equiv='X-UA-Compatible' content='IE=edge'>
      <style>
        @media only screen and (max-width:620px){
          h1{
            font-size:20px;
            padding:5px;
          }
        }
      </style>
    </head>
    <body>
      <div>
          <div style="max-width:620px; margin:0 auto; font-family:sans-serif; color:#272727;">
            <h1 style="background:#f6f6f6; padding:10px; text-align:center; color:#272727;">
          ${heading}

            </h1>

            <p style=" text-align:center; color:#272727;">
              ${message}
            </p>
          </div>
      </div>
    </body>
    </html>
  `;
};

const generatePasswordResetTemplate = (url) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset='UTF-8'>
      <meta http-equiv='X-UA-Compatible' content='IE=edge'>
      <style>
        @media only screen and (max-width:620px){
          h1{
            font-size:20px;
            padding:5px;
          }
        }
      </style>
    </head>
    <body>
      <div>
          <div style="max-width:620px; margin:0 auto; font-family:sans-serif; color:#272727;">
            <h1 style="background:#f6f6f6; padding:10px; text-align:center; color:#272727;">
          Response To Your Reset Password Request

            </h1>

            <p style=" text-align:center; color:#272727;">
              Please click the link below to reset your password
            </p>
            <div style="text-align: center">
              <a href="${url}" style="font-family:sans-serif; margin:0 auto; padding:20px; text-align:center; background:#e63946; border-radius:5px; font-size:20px 10px; color:#fff; cursor:pointer; text-decoration:none; display:inline-block;">
              Reset Password

              </a>
            </div>
          </div>
      </div>
    </body>
    </html>
  `;
};

const generatePasswordResetTemplateSuccess = (heading, message) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset='UTF-8'>
      <meta http-equiv='X-UA-Compatible' content='IE=edge'>
      <style>
        @media only screen and (max-width:620px){
          h1{
            font-size:20px;
            padding:5px;
          }
        }
      </style>
    </head>
    <body>
      <div>
          <div style="max-width:620px; margin:0 auto; font-family:sans-serif; color:#272727;">
            <h1 style="background:#f6f6f6; padding:10px; text-align:center; color:#272727;">
          ${heading}

            </h1>

            <p style=" text-align:center; color:#272727;">
              ${message}
            </p>

          </div>
      </div>
    </body>
    </html>
  `;
};

const createRandomBytes = () =>
  new Promise((resolve, reject) => {
    crypto.randomBytes(30, (err, buff) => {
      if (err) reject(err);
      const token = buff.toString("hex");
      resolve(token);
    });
  });

const authCtrl = {
  register: async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { username, email, password, user_type, first_name, last_name, profile_picture_url, bio, location, specialties, years_experience, portfolio_link, company_name, company_size, industry } = req.body;
      
      // Validate inputs (similar to your previous validation logic)
      if (!email || !password || !first_name || !last_name) {
        return res.status(409).json({ msg: "Please provide all required fields!" });
      }

       // Check if the email is already registered
       const existingUser = await Users.findOne({ email: email.toLowerCase() });
       if (existingUser) {
        return res.status(409).json({ message: 'User already exists' });
         return next(new ErrorResponse("User already exists", 409));  // User already exists
       }

// Check if the email is valid
      let newEmail = email.toLowerCase().trim(); // Trim spaces
      if (checkEmailValidity(newEmail) === false) {
        res.status(409).json({ message: "Invalid data entry." });
        return next(new ErrorResponse("Invalid data entry.", 409));
      }
      // Check if the password is valid

      if (password.length < 6) {
        res
          .status(409)
          .json({
            success: true,
            message: "password must be atleast 6 characters",
          });
        return next(
          new ErrorResponse("password must be atleast 6 characters", 409)
        );
      }

      //encripting the Password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
     
      

      // Create a new user (with additional fields)
      const uid = uuidv4();
      const newUser = new Users({
        uid,
        email: email.toLowerCase(),
        password: hashedPassword,
        user_type,
        first_name,
        last_name,
        profile_picture_url,
        bio,
        location,
        specialties: specialties ? JSON.stringify(specialties) : [],
        years_experience,
        portfolio_link,
        company_name,
        company_size,
        industry,
        created_at: Date.now(),
        updated_at: Date.now(),
      });

      const OTP = generateOTP();
      //encripting the OTP
      const salt2 = await bcrypt.genSalt(10);
      const OTPHash = await bcrypt.hash(OTP, salt2);


      const verificationToken = new VerificationToken({
              owner: newUser._id,
              token: OTPHash,
            });

      //creating access token
      const access_token = createAccessToken({ id: newUser._id });
      // creating refresh token
      const refresh_token = createRefreshToken({ id: newUser._id });
      

    
     
      // //save verification token
      // await verificationToken.save();
      // //saving the user
      // await newUser.save();

       // Save user and token in a transaction
    await newUser.save({ session });
    await verificationToken.save({ session });

     // Commit the transaction
     await session.commitTransaction();
     session.endSession();

      //sending mail
      mailTransport().sendMail({
        form: "info@subercraftex.com",
        to: newUser.email,
        subject: "Verify your email account",
        html: generateEmailTemplate(OTP),
      });

      res.clearCookie("refreshtoken", { path: "/api/refresh_token" });

      res.cookie("refreshtoken", refresh_token, {
        httpOnly: true,
        path: "/api/refresh_token",
        maxAge: 30 * 24 * 60 * 60 * 1000, //30days
      });
      // Return success response
      res.status(201).json({
        message: "User created successfully",
        access_token,
        refresh_token,
        user: {
          ...newUser._doc,
          password: "",
        },
      });
    } catch (err) {
      // return res.status(500).json({ message: err.message });
      // Rollback the transaction on error
    await session.abortTransaction();
    session.endSession();
    console.error('Error creating user:', err);
    res.status(500).json({ message: err.message });
    }
  },
  verifyEmail: async (req, res, next) => {
    const { userId, otp } = req.body;

    if (!userId || !otp.trim()) {
      res.status(400).json({ msg: "Invalid Request, missing parameters" });
      return next(
        new ErrorResponse("Invalid Request, missing parameters", 400)
      );
    }

    const user = await Users.findById(userId);

    if (!user) {
      res.status(400).json({ msg: "Sorry user not found" });
      return next(new ErrorResponse("Sorry user not found", 400));
    }
    if (user.verified) {
      res.status(400).json({ msg: "This account is already verified" });
      return next(new ErrorResponse("This account is already verified", 400));
    }

    const v_token = await VerificationToken.findOne({ owner: userId });

    if (!v_token) {
      res.status(400).json({ msg: "Sorry user not found2" });
      return next(new ErrorResponse("Sorry user not found2", 400));
    }

    const isMatch = await bcrypt.compare(otp, v_token.token);
    // console.log(v_token.token, otp)

    if (!isMatch) {
      res
        .status(400)
        .json({ success: true, msg: "Please provide a valid token" });
      return next(new ErrorResponse("Please provide a valid token", 400));
    }

    user.verified = true;
    await VerificationToken.findByIdAndDelete(v_token._id);
    await user.save();

    mailTransport().sendMail({
      form: "suberCraftexVerification@suberCraftex.com",
      to: user.email,
      subject: "Welcome Email",
      html: plainEmailTemplate(
        "Email Verified Successfully",
        "Thanks for connecting with suberCraftex"
      ),
    });

    res.json({
      success: true,
      message: "your email is verified.",
      user: { name: user.name, email: user.email, id: user._id },
    });

    //comparing the token
  },
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
     
      
      // Validate email presence
    if (!email) {
      return res.status(400).json({ success: false, message: "Please provide an email" });
    }

    
    let loginEmail = email.toLowerCase().trim();
    

    // Validate email format
    if (!checkEmailValidity(loginEmail)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

       // Check if user exists
    const user = await Users.findOne({ email: loginEmail }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid login credentials" });
    }

     // Validate password presence
    if (!password) {
      return res.status(400).json({ success: false, message: "Please provide a password" });
    }

       // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid login credentials" });
    }

        // Create access and refresh tokens
        const access_token = createAccessToken({ id: user._id });
        const refresh_token = createRefreshToken({ id: user._id });
    
        // Clear and set refresh token cookie
    res.clearCookie("refreshtoken", { path: "/api/refresh_token" });
    res.cookie("refreshtoken", refresh_token, {
      httpOnly: true,
      path: "/api/refresh_token",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

      // Send success response
    return res.status(200).json({
      success: true,
      access_token,
      refresh_token,
      user: {
        ...user._doc,
        password: undefined, // Don't send password in response
      },
    });
    } catch (error) {
      next(error); // Pass error to global error handler
    }
  },

  logout: async (req, res, next) => {
    
    try {
      res.clearCookie("refreshtoken", { path: "/api/refresh_token" });
      return res.json({ message: "Logged out!" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  generateAccessToken: async (req, res, next) => {
    try {
      const rf_token = req.cookies.refreshtoken;
      if (!rf_token) {
        res.status(400).json({ success: true, msg: "please login now" });
        return next(new ErrorResponse("please login now", 400));
      }

      //verify if the token is valid
      jwt.verify(
        rf_token,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, result) => {
          if (err) {
            res.status(400).json({ success: true, msg: "please login now" });
            return next(new ErrorResponse("please login now", 400));
          }
          const user = await Users.findById(result.id);
          if (!user) {
            res.status(400).json({ success: true, msg: "User not found" });
            return next(new ErrorResponse("User not found", 400));
          }

          const access_token = createAccessToken({ id: result.id });

          res.json({
            access_token,
            user,
          });
        }
      );
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  generateAccessToken2: async (req, res, next) => {
    try {
      const rf_token = req.body.refreshtoken;
      if (!rf_token) {
        res.status(400).json({ success: true, msg: "please login now" });
        return next(new ErrorResponse("please login now", 400));
      }

      //verify if the token is valid
      jwt.verify(
        rf_token,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, result) => {
          if (err) {
            res.status(400).json({ success: true, msg: "please login now" });
            return next(new ErrorResponse("please login now", 400));
          }
          const user = await Users.findById(result.id);
          if (!user) {
            res.status(400).json({ success: true, msg: "User not found" });
            return next(new ErrorResponse("User not found", 400));
          }

          const access_token = createAccessToken({ id: result.id });

          res.json({
            access_token,
            user,
          });
        }
      );
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  forgotpassword: async (req, res, next) => {
    try {
      const { email } = req.body;
      let fogortEmail = email.toLowerCase()

      if (checkEmailValidity(fogortEmail) === false) {
        res.status(400).json({ msg: "This email is invalid" });
        return next(new ErrorResponse("This email is invalid", 400));
      }

      const user = await Users.findOne({ email:fogortEmail });

      if (!user) {
        res.status(400).json({ msg: "Email could not be sent" });
        return next(new ErrorResponse("Email could not be sent", 400));
      }

      const token = await ResetToken.findOne({ owner: user._id });

      if (token) {
        res
          .status(400)
          .json({ msg: "only one hour you can request another token" });
        return next(
          new ErrorResponse("only one hour you can request another token", 400)
        );
      }

      const randomBytes = await createRandomBytes();
      //encripting the randomBytes
      const salt = await bcrypt.genSalt(10);
      const randomBytesHash = await bcrypt.hash(randomBytes, salt);

      const resetToken = new ResetToken({
        owner: user._id,
        token: randomBytesHash,
      });
      await resetToken.save();

      mailTransport().sendMail({
        form: "suberDesignSecurity@suberDesigntasting.com",
        to: user.email,
        subject: "Password Reset",
        html: generatePasswordResetTemplate(
          `${process.env.HOME_URL}/reset-password?token=${randomBytes}&id=${user._id}`
        ),
      });

      res
        .status(200)
        .json({
          success: true,
          msg: "Password reset link is sent to your email.",
        });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  forgotpassword2: async (req, res, next) => {
    try {
      const { email } = req.body;
      let fogortEmail2 = email.toLowerCase()

      if (checkEmailValidity(fogortEmail2) === false) {
        res.status(400).json({ msg: "This email is invalid" });
        return next(new ErrorResponse("This email is invalid", 400));
      }

      const user = await Users.findOne({ email:fogortEmail2 });

      if (!user) {
        res.status(400).json({ msg: "Email could not be sent" });
        return next(new ErrorResponse("Email could not be sent", 400));
      }

      const token = await ResetToken2.findOne({ owner: user._id });

      if (token) {
        res
          .status(400)
          .json({ msg: "only one hour you can request another token" });
        return next(
          new ErrorResponse("only one hour you can request another token", 400)
        );
      }
      const OTP = generateOTP();
      //encripting the OTP
      const salt2 = await bcrypt.genSalt(10);
      const OTPHash = await bcrypt.hash(OTP, salt2);

      const resetToken = new ResetToken2({ owner: user._id, token: OTPHash });
      await resetToken.save();

      mailTransport().sendMail({
        form: "suberDesignSecurity@suberdesign.com",
        to: user.email,
        subject: "Password Reset",
        html: generateEmailTemplate2(OTP),
      });

      res
        .status(200)
        .json({
          success: true,
          msg: "Password reset code is sent to your email.",
        });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  resendEmail: async (req, res, next) => {
    try {
      const { email, userId } = req.body;
      let resendEmail = email.toLowerCase()

      if (checkEmailValidity(resendEmail) === false) {
        res.status(400).json({ msg: "This email is invalid" });
        return next(new ErrorResponse("This email is invalid", 400));
      }

      const user = await Users.findOne({ email:resendEmail });

      if (!user) {
        res.status(400).json({ msg: "Email could not be sent" });
        return next(new ErrorResponse("Email could not be sent", 400));
      }

      const v_token = await VerificationToken.findOne({ owner: userId });

      if (v_token) {
        await VerificationToken.findByIdAndDelete(v_token._id);
      }
      const OTP = generateOTP();
      //encripting the OTP
      const salt2 = await bcrypt.genSalt(10);
      const OTPHash = await bcrypt.hash(OTP, salt2);
      const verificationToken = new VerificationToken({
        owner: user._id,
        token: OTPHash,
      });

      //save verification token
      await verificationToken.save();
      //sending mail
      mailTransport().sendMail({
        form: "suberCraftexVerification@suberCraftex.com",
        to: user.email,
        subject: "Verify your email account(new code)",
        html: generateEmailTemplate(OTP),
      });

      res.json({
        msg: "Email resend Code Success!",
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  resetpassword: async (req, res, next) => {
    try {
      const { password } = req.body;

      if (!password) {
        res.status(406).json({ msg: "Please input new password" });
        return next(new ErrorResponse("Please input new password", 406));
      }

      const user = await Users.findById(req.user._id).select("+password");

      if (!user) {
        res.status(401).json({ msg: "User not found" });
        return next(new ErrorResponse("User not found", 401));
      }

      const isSamePassword = await bcrypt.compare(password, user.password);

      if (isSamePassword) {
        res.status(402).json({ msg: "New Password must be different" });
        return next(new ErrorResponse("New Password must be different", 402));
      }

      if (password.trim().length < 6 || password.trim().length > 20) {
        res
          .status(403)
          .json({ msg: "Password mustbe at least 6 to 20 characters" });
        return next(
          new ErrorResponse("Password mustbe at least 6 to 20 characters", 403)
        );
      }
      // encript passwords
      //encripting the Password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password.trim(), salt);

      user.password = passwordHash;
      await user.save();
      const resetToken = await ResetToken.findOneAndRemove({ owner: user._id });

      mailTransport().sendMail({
        form: "suberCraftexSecurity@suberCraftex.com",
        to: user.email,
        subject: "Password Reset Successfully",
        html: generatePasswordResetTemplateSuccess(
          "Password Reset Successfully",
          "Now you can login with new password"
        ),
      });
      res.status(201).json({
        success: true,
        msg: "Password Reset Success",
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  resetpassword2: async (req, res, next) => {
    try {
      const { password, otp, email } = req.body;
      let resetEmail = email.toLowerCase()

      if (!password || !otp.trim() || !email) {
        res.status(400).json({ msg: "Invalid Request, missing parameters" });
        return next(
          new ErrorResponse("Invalid Request, missing parameters", 400)
        );
      }

      if (checkEmailValidity(resetEmail) === false) {
        res.status(400).json({ msg: "This email is invalid" });
        return next(new ErrorResponse("This email is invalid", 400));
      }

      const user = await Users.findOne({ email:resetEmail }).select("+password");

      if (!user) {
        res.status(400).json({ msg: "User not found" });
        return next(new ErrorResponse("User not found", 400));
      }

      const v_token = await ResetToken2.findOne({ owner: user._id });
      if (!v_token) {
        res.status(400).json({ msg: "Sorry user not found2" });
        return next(new ErrorResponse("Sorry user not found2", 400));
      }
      const isMatch = await bcrypt.compare(otp, v_token.token);

      if (!isMatch) {
        res
          .status(400)
          .json({ success: true, msg: "Please provide a valid code" });
        return next(new ErrorResponse("Please provide a valid code", 400));
      }

      const isSamePassword = await bcrypt.compare(password, user.password);

      if (isSamePassword) {
        res.status(400).json({ msg: "New Password must be different" });
        return next(new ErrorResponse("New Password must be different", 400));
      }

      if (password.trim().length < 6 || password.trim().length > 20) {
        res
          .status(400)
          .json({ msg: "Password mustbe at least 6 to 20 characters" });
        return next(
          new ErrorResponse("Password mustbe at least 6 to 20 characters", 400)
        );
      }
      // encript passwords
      //encripting the Password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password.trim(), salt);

      user.password = passwordHash;
      await user.save();
      const resetToken = await ResetToken2.findOneAndRemove({
        owner: user._id,
      });

      mailTransport().sendMail({
        form: "suberCraftexSecurity@suberCraftex.com",
        to: user.email,
        subject: "Password Reset Successfully",
        html: generatePasswordResetTemplateSuccess(
          "Password Reset Successfully",
          "Now you can login with new password"
        ),
      });
      res.status(201).json({
        success: true,
        msg: "Password Reset Success",
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  verifyOTP: async (req, res, next) => {
    try {
      const { otp, email } = req.body;
      let verifyEmail = email.toLowerCase()
      if (!otp.trim() || !email) {
        res.status(400).json({ msg: "Invalid Request, missing parameters" });
        return next(
          new ErrorResponse("Invalid Request, missing parameters", 400)
        );
      }

      if (checkEmailValidity(verifyEmail) === false) {
        res.status(400).json({ msg: "This email is invalid" });
        return next(new ErrorResponse("This email is invalid", 400));
      }

      const user = await Users.findOne({ email:verifyEmail }).select("+password");

      if (!user) {
        res.status(400).json({ msg: "User not found" });
        return next(new ErrorResponse("User not found", 400));
      }

      const v_token = await ResetToken2.findOne({ owner: user._id });
      if (!v_token) {
        res.status(400).json({ msg: "OTP code Invalid" });
        return next(new ErrorResponse("OTP code Invalid", 400));
      }
      const isMatch = await bcrypt.compare(otp, v_token.token);

      if (!isMatch) {
        res
          .status(400)
          .json({ success: true, msg: "Please provide a valid code" });
        return next(new ErrorResponse("Please provide a valid code", 400));
      }

      res.status(201).json({
        success: true,
        msg: "Otp valid",
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = authCtrl;
