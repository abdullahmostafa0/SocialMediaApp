import * as cloudinary from 'cloudinary';
import path from "node:path"
import * as dotenv from "dotenv"
dotenv.config({path:path.resolve("./src/config/.env.dev")})


    // Configuration
    cloudinary.v2.config({
        secure:true,
        cloud_name: process.env.cloud_name,
        api_key: process.env.api_key,
        api_secret: process.env.api_secret // Click 'View API Keys' above to copy your API secret
    });

export default cloudinary.v2
