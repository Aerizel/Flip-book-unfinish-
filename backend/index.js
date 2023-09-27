const express = require('express');
const app = express();
const http = require("http");
const cors = require('cors');
const db = require('./dbConnect');
const { Server } = require("socket.io");
const {readdirSync} = require("fs");
const PORT = 4000;

app.use(cors());
app.use(express.json());

readdirSync("./routes").map((file)=>app.use("/",require("./routes/"+file)))

const server = http.createServer(app);

//Socket io use for create chat room for user to talk each other
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET","POST"],
    },
});

io.on("connection", (socket)=> {
    //console.log(`User Connected : ${socket.id}`);

    socket.on("join_chat", (data)=> {
        socket.join(data);
        //console.log(`Chat room serial : ${data}`);
    });

    //Socket method for report chat
    socket.on("send_message", (data)=> {

        //Insert message into database
        db.execute(
            "INSERT INTO report_chat (reportID,userID,message,send_time) VALUES(?,?,?,?)",
            [data.reportID,data.userID,data.message,data.time],
            function(err, results, fields) {
                if(err) {
                    console.log(err);
                    return
                }
            }
        );

        //Send message to other user that are in the same chat with sender
        socket.to(data.chat_ch).emit("receive_message", data);
    });

    //Socket method for comment in book below
    socket.on("send_book_comment", (data)=> {

        //Insert comment into database
        db.execute(
            "INSERT INTO ebook_comment (bookID,userID,message,send_time) VALUES(?,?,?,?)",
            [data.bookID,data.userID,data.message,data.time],
            function(err, results, fields) {
                if(err) {
                    console.log(err);
                    return
                }
            }
        );
        
        //Send message to other user that are in the same chat with sender
        socket.to(data.comment_ch).emit("receive_book_comment", data);
    });

    socket.on("update_book_comment", (data)=> {       
        //Send message to other user that are in the same chat with sender
        socket.to(data.comment_ch).emit("receive_update_comment", data.message);
    });
    
    socket.on("disconnect", (socket)=> {
        //console.log(`User Disconnect : ${socket.id}`);
    });
});

server.listen(PORT, ()=>{
    console.log(`API is listening on PORT ${PORT}`);
});

module.exports = app;


