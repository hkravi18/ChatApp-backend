const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const socket = require('socket.io');

require('dotenv').config(); 

mongoose
.connect(process.env.MONGO_DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log("db connection successful");
})
.catch((err) => {
    console.log('Error : ', err.message);
})

const userRoutes =  require('./routes/userRoutes');
const messageRoute =  require('./routes/messagesRoute');

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", userRoutes);
app.use("/api/messages", messageRoute);

const server = app.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${process.env.PORT}`);
});

const io = socket(server, {
    cors: {
        origin: "https://chat-app-zus4.onrender.com",
        credentials: true, 
    }
})

global.onlineUsers = new Map();

io.on("connection", (socket) => {
    global.chatSocket = socket;
    socket.on("add-user", (userId) => {
        onlineUsers.set(userId, socket.id);
    });

    socket.on("send-msg", (data) => {
        const sendUserSocket = onlineUsers.get(data.to);
        if (sendUserSocket) {
            socket.to(sendUserSocket).emit("msg-recieved", data.message);
        }
    });
});
