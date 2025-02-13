const asyncHandler = (requestHandler)=> {
    return (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next)).catch((error)=> next(error))
    }
}

// const asyncHandler = (requestHandler) => (req, res, next) => {
//     Promise.resolve(requestHandler(req, res, next)).catch(next);
// };                                                                    // this is corrected version without curly brackets 


export {asyncHandler}

// const asyncHandler = (fn) => async (req, res, next)=> {      //this is try-catch method 
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }