// require('dotenv').config({path: './env'})

import dotenv from 'dotenv'
import connectDB from "./db/index.js";

dotenv.config({           //This is recent concept thus its not in documentation and you have to add experimentation feature on script in package.json
    path: './env'
})


connectDB()









// const app = express();

// (async()=>{
//     try {
//         await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`)
//         app.on("error", (error)=>{
//             console.log("Error while connecting Mongo", error)
//             throw error
//         })

//         app.listen(process.env.PORT, ()=>{
//             console.log(`App is listening at ${process.env.PORT}`)
//         })

//     } catch (error) {
//         console.error("ERROR", error)
//         throw error
//     }
// })()