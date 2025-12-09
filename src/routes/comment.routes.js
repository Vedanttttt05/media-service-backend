import { Router } from 'express';
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
} from "../controllers/comment.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {verifyOwnership} from "../middlewares/ownership.middleware.js"
import {Comment} from "../models/comment.model.js"


const router = Router();

router.use(verifyJWT); 


router
  .route("/c/:commentId")
  .delete(verifyOwnership(Comment, "commentId"), deleteComment)
  .patch(verifyOwnership(Comment, "commentId"), updateComment);

export default router;