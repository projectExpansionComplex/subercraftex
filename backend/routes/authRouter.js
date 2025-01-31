const router = require('express').Router()
const authCtrl = require('../controllers/authController')
const {isResetTokenValid} = require('../middleware/authMiddlerware')


router.post('/register', authCtrl.register)

router.post('/login', authCtrl.login)

router.post('/logout', authCtrl.logout)

router.post('/refresh_token', authCtrl.generateAccessToken)
router.post('/refresh_token_app', authCtrl.generateAccessToken2)

router.post('/verify-email', authCtrl.verifyEmail)
router.post('/resend-email', authCtrl.resendEmail)
router.post('/verify-otp', authCtrl.verifyOTP)
//forgot via link
router.post('/forgotpassword', authCtrl.forgotpassword)
//forgot via otp
router.post('/forgotpassword2', authCtrl.forgotpassword2)
// reset via link
router.post('/reset-password', isResetTokenValid, authCtrl.resetpassword)
// reset via otp
router.post('/reset-password2',  authCtrl.resetpassword2)




module.exports = router
