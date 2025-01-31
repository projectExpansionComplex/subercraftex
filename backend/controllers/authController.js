const Users = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ErrorResponse = require("../utils/errorResponse");
const nodemailer = require("nodemailer");
const VerificationToken = require("../models/verificationTokenModel");
const ResetToken = require("../models/resetTokenModel");
const ResetToken2 = require("../models/resetTokenModel2");

const crypto = require("crypto");

// check email validity
const checkEmailValidity = (email) => {
  // don't remember from where i copied this code, but this works.
  let re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  if (re.test(email)) {
    return true;
  } else {
    return false;
  }
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
            We are delighted to welcome you to our suberDesign shop

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
    try {
      const { fullname, username, email, password, gender } = req.body;
     
      //check on the username
      if (!username) {
        res
          .status(400)
          .json({ success: true, msg: "please provide a username" });
        return next(
          new ErrorResponse("please provide a username", 400)
        );
      }

      if (username.length < 3 || username.length > 20) {
        res
          .status(400)
          .json({
            success: true,
            msg: "Name must be 3 to 20 characters long!",
          });
        return next(
          new ErrorResponse("Name must be 3 to 20 characters long!", 400)
        );
      }
       

      //check on email
      if (!email) {
        res.status(400).json({ success: true, msg: "please provide an email" });
        return next(new ErrorResponse("please provide an email", 400));
      }
      let newEmail = email.toLowerCase().replace(/ /g, "")
      if (checkEmailValidity(newEmail) === false) {
        res.status(400).json({ msg: "Invalid email." });
        return next(new ErrorResponse("Invalid email.", 400));
      }
      
      const user_email = await Users.findOne({ email:newEmail });
      
      if (user_email) {
        res.status(400).json({ msg: "This email already exists." });
        return next(new ErrorResponse("This email already exists.", 400));
      }

      //this removes spaces form user name and lowercase all the letters
      let newUserName = username.toLowerCase().replace(/ /g, "");
       
      const user_name = await Users.findOne({ username: newUserName });

      if (user_name) {
        res.status(400).json({ msg: "This user name already exists." });
        return next(new ErrorResponse("This user name already exists.", 400));
      }

      //check on password
      if (!password) {
        res
          .status(400)
          .json({ success: true, msg: "please provide a password" });
        return next(new ErrorResponse("please provide a password", 400));
      }

      if (password.length < 6) {
        res
          .status(400)
          .json({
            success: true,
            msg: "password must be atleast 6 characters",
          });
        return next(
          new ErrorResponse("password must be atleast 6 characters", 400)
        );
      }

      //encripting the Password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
     
      //creating new user
      const newUser = new Users({
        fullname,
        username: newUserName,
        email:newEmail,
        password: passwordHash,
        gender,
      });

      //creating access token
      const access_token = createAccessToken({ id: newUser._id });
      // creating refresh token
      const refresh_token = createRefreshToken({ id: newUser._id });
      res.clearCookie("refreshtoken", { path: "/api/refresh_token" });

      res.cookie("refreshtoken", refresh_token, {
        httpOnly: true,
        path: "/api/refresh_token",
        maxAge: 30 * 24 * 60 * 60 * 1000, //30days
      });

      const OTP = generateOTP();
      //encripting the OTP
      const salt2 = await bcrypt.genSalt(10);
      const OTPHash = await bcrypt.hash(OTP, salt2);

      const verificationToken = new VerificationToken({
        owner: newUser._id,
        token: OTPHash,
      });

      //save verification token
      await verificationToken.save();
      //saving the user
      await newUser.save();
      //sending mail
      mailTransport().sendMail({
        form: "suberDesign@suberdesign.com",
        to: newUser.email,
        subject: "Verify your email account",
        html: generateEmailTemplate(OTP),
      });

      res.status(201).json({
        msg: "Register Success!",
        access_token,
        refresh_token,
        user: {
          ...newUser._doc,
          password: "",
        },
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
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
      form: "suberDesignVerification@suberDesign.com",
      to: user.email,
      subject: "Welcome Email",
      html: plainEmailTemplate(
        "Email Verified Successfully",
        "Thanks for connecting with suberDesign"
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
      let loginEmail = email.toLowerCase()
      //check on email
      if (!email) {
        res.status(400).json({ success: true, msg: "please provide an email" });
        return next(new ErrorResponse("please provide an email", 400));
      }

      if (checkEmailValidity(loginEmail) === false) {
        res.status(400).json({ msg: "Invalid email." });
        return next(new ErrorResponse("Invalid email.", 400));
      }

      const user = await Users.findOne({ email:loginEmail }).select("+password");

      if (!user) {
        res.status(400).json({ msg: "Invalid Login credentials" });
        return next(new ErrorResponse("Invalid Login credentials.", 400));
      }

      //check on password
      if (!password) {
        res
          .status(400)
          .json({ success: true, msg: "Invalid Login credentials" });
        return next(new ErrorResponse("Invalid Login credentials", 400));
      }

      // comparing passwords if they match
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        res
          .status(400)
          .json({ success: true, msg: "Invalid Login credentials" });
        return next(new ErrorResponse("Invalid Login credentials", 400));
      }

      //creating access token
      const access_token = createAccessToken({ id: user._id });
      // creating refresh token
      const refresh_token = createRefreshToken({ id: user._id });

      res.clearCookie("refreshtoken", { path: "/api/refresh_token" });

      res.cookie("refreshtoken", refresh_token, {
        httpOnly: true,
        path: "/api/refresh_token",
        maxAge: 30 * 24 * 60 * 60 * 1000, //30days
      });

      res.status(200).json({
        msg: "Login Success!",
        access_token,
        refresh_token,
        user: {
          ...user._doc,
          password: "",
        },
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  logout: async (req, res, next) => {
    try {
      res.clearCookie("refreshtoken", { path: "/api/refresh_token" });
      return res.json({ msg: "Logged out!" });
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
        form: "suberDesignVerification@suberDesign.com",
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
        form: "suberDesignSecurity@suberDesign.com",
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
        form: "suberDesignSecurity@suberDesign.com",
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
