import { Router } from 'express';
import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet,
} from "../controllers/tweet.controller.js"
import { verifyOwnership } from "../middlewares/ownership.middleware.js";
import { Tweet } from "../models/tweet.model.js";
import {verifyJwt} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJwt); 

router.route("/").post(createTweet);
router.route("/user/:userId").get(getUserTweets);

router
  .route("/:id")
  .patch(verifyOwnership(Tweet), updateTweet)
  .delete(verifyOwnership(Tweet), deleteTweet);

export default router