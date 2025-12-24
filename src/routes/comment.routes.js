import { Router } from 'express';
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
} from "../controllers/comment.controller.js"
import {verifyJwt} from "../middlewares/auth.middleware.js"
import {verifyOwnership} from "../middlewares/ownership.middleware.js"
import {Comment} from "../models/comment.model.js"


const router = Router();

router.use(verifyJwt); 

router
  .route("/video/:videoId")
  .post(addComment)
  .get(getVideoComments)

router
  .route("/:id")
  .delete(verifyOwnership(Comment, "commentId"), deleteComment)
  .patch(verifyOwnership(Comment, "commentId"), updateComment);

export default router;