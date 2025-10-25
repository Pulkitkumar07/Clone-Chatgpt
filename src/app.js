const express=require("express");
const cookieParser=require('cookie-parser')
const authRoutes=require("./routes/auth.routes")
const chatRoutes=require('./routes/chat.routes')

/* Using middleware */
const app=express();
app.use(express.json());
app.use(cookieParser());

/* Using Routes */
app.use('/api/auth',authRoutes)
app.use('/api/chat',chatRoutes)

module.exports=app;