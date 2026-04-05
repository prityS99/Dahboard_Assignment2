require('dotenv').config

const mongoose = require('mongoose');

const MONGO_URL = process.env.MONGO_URL

const DatabaseConnection = async ()=>{
    try {
        const conn = await mongoose.connect(MONGO_URL);
        if(conn){
            console.log("Database Connected");
            
        }else{
            console.log("Database not connected");
            
        }

    } catch (error) {
        console.log(error);
        
    }
}



module.exports=DatabaseConnection

