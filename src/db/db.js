const mongoose=require("mongoose");


async function connectDb() {
    try{
        await mongoose.connect(process.env.MONGO_URL)

        console.log("connected to Mongodb")
    }
    catch(err){
        console.log("Error connecting to MongoDB "+err);
        
     
    }
}
module.exports=connectDb;