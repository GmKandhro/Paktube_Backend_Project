
// using try_catch

// const asyncHandler = (func) => async (req,res,next)=>{
//     try {
//         await func(req,res,next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             message: error.message,
//             success:false
//         })
//     }
// }


// using promises 

const asyncHandler = (func)=>{
        return async (req,res,next)=>{
        try {
                return await Promise.resolve(func(req, res, next))
            } catch (error) {
                return next(error)
            }
    }
}


export {asyncHandler}