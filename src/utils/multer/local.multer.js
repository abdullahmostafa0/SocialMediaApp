import multer from "multer"
import path from "path"
import fs from "fs"
export const fileValidationTypes = {
    image: ['image/jpg', 'image/jpeg', 'image/png', 'image/gif'],
    document: ['application/json', 'application/pdf']
}

export const uploadDiskFile = (customPath = "general", fileValidation = []) => {

    const basePath = `uploads/${customPath}`
    const fullPath = path.resolve(`./src/${basePath}`)

    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, {recursive:true})
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, fullPath)
        },
        filename: (req, file, cb) => {

            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            file.finalPath = basePath + '/' + uniqueSuffix + "_" + file.originalname
            cb(null, uniqueSuffix + "_" + file.originalname)
        }
    })
    function fileFilter(req, file, cb) {
        if (fileValidation.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb("In valid file format", false)
        }

    }
    return multer({ dest: "defaultUpload", fileFilter, storage })
}