import { asyncHandler } from "../utils/asyncHandler"
import  apiResponse  from "../utils/apiResponse"

const healthcheck = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new apiResponse(200, null, "Server is healthy"))
})

export { healthcheck }
