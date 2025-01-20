const router = require("express").Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");

router.post("/register", auth, userController.register);
router.post("/login", userController.login);
router.get("/all", auth, userController.getAllUsers);

module.exports = router;
