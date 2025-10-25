const { Server } = require("socket.io");
const cookie = require('cookie');
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const aiService = require('../service/ai.service')
const messagemodel = require("../models/message.model")
const {createMemory,queryMemory}=require('../service/vector.service');
const { chat } = require("@pinecone-database/pinecone/dist/assistant/data/chat");
const { text } = require("express");


function initSocketServer(httpServer) {

  const io = new Server(httpServer, {});

  io.use(async (socket, next) => {
    const cookies = cookie.parse(socket.handshake.headers?.cookie || "");
    console.log("socket connection cookies", cookies.token);

    if (!cookies.token) {

      next(new Error("Authentication error:No token provided"))
    }
    try {
      const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET)
      const user = await userModel.findById(decoded.id)
      socket.user = user
      next();
    } catch (err) {
      next(new Error("Authentication error:Invalid token"));

    }
  })

  io.on("connection", (socket) => {
    socket.on("ai-message", async (messagePayload) => {
      console.log(messagePayload.content);
   
   const message=   await messagemodel.create({
        chat: messagePayload.chat,
        user: socket.user._id,
        content: messagePayload.content,
        role: "user"
      })
     
     const vectors=await aiService.generateVector(messagePayload.content)
     await createMemory({
      vectors:vectors,
      messageID:message.id,
      metadata:{
        chat:messagePayload.chat,
        user:socket.user._id,
        text:response
      }
     })
      const memory=await queryMemory({
       queryVector:vectors,
       limit:3,
       metadata:{}
      })
      console.log(memory);
      

      const chatHistory = (await messagemodel.find({
         chat: messagePayload.chat
         }).sort({ createdAt: -1 }).limit(20).lean()).reverse();


      const response = await aiService.generateResponse(chatHistory.map(item => {
        return {
          role: item.role,
          parts: [{ text: item.content }]
        }
      }));

     const responseMessage= await messagemodel.create({
        chat: messagePayload.chat,
        user: socket.user._id,
        content: response,
        role: "model"
      })
    
      const responseVectors=await aiService.generateVector(response)
      await createMemory({
         vectors:responseVectors,
         messageID:responseMessage._id,
         metadata:{
          chat:messagePayload.chat,
          user:socket.user._id
         }
      })
      socket.emit("ai-response", {
        content: response,
        chat: messagePayload.chat
      })
    })


  });
}

module.exports = initSocketServer;
