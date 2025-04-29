import multer from "multer"

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
      cb(null, Math.floor( Math.random() * 1000) + "-" + file.originalname)
    }
  })
  
export const uploadUsingMulter = multer({ storage: storage })
