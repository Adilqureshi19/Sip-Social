import { Router } from "express";   
import { logoutUser, loginUser, registerUser } from '../controllers/user.controller.js'
import { upload } from '../middlewares/multer.middleware.js'
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(upload.fields([      //middleware injected so we can use it in cookie and it means jaane se pehle ye kaam kerke jasana
    {
        name: "avatar",
        maxCount: 1
    },
    {
        name: "coverImage", 
        maxCount: 1
    }
]) ,registerUser)

router.route("/login").post(loginUser);

//secured route

router.route("/logout").post(verifyJWT, logoutUser)

export default router;