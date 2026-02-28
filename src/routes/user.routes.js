const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/rbac.middleware");


router.get("/profile", authenticate, userController.getProfile);
router.put("/profile", authenticate, userController.updateProfile);

router.get(
  "/users",
  authenticate,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  userController.getAllUsers
);

module.exports = router;