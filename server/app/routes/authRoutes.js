const express = require('express')
const authController = require('../controllers/authController')
const authCheck = require('../middleware/auth')
const upload = require('../middleware/upload')
const router = express.Router()



router.post("/register", upload.single('profileImage'),authController.register)
router.post("/verify", authController.verify)
router.post("/login", authController.login)
router.get("/dashboard",authCheck, authController.dashboard)
router.get("/users",authCheck, authController.dashboard)


module.exports = router