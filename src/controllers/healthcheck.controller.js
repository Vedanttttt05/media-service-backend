import { asyncHandler } from "../utils/asyncHandler.js"
import apiError  from "../utils/apiError.js"
import  apiResponse  from "../utils/apiResponse.js"

const healthcheck = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new apiResponse(true, "Server is healthy", null))
})

export { healthcheck }
