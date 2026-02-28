const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { authLimiter } = require("../middleware/rateLimiter.middleware");
const { registerValidation, loginValidation } = require("../validators/auth.validator");
const { validate } = require("../middleware/validation.middleware");

router.post("/register", authLimiter, authController.registerUser);
router.post("/login", authLimiter, authController.loginUser);


router.get("/google", authController.initiateGoogle);
router.get("/google/callback", authController.googleCallback);

router.get("/github", authController.initiateGithub);
router.get("/github/callback", authController.githubCallback);

router.post("/refresh", authController.refreshToken);
router.post("/logout", authController.logout);

router.post("/register",authLimiter,registerValidation,validate,authController.registerUser);
router.post("/login",authLimiter,loginValidation,validate,authController.loginUser);


module.exports = router;