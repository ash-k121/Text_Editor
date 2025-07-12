


const io = require("socket.io")(3000, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    }
});

io.on("connection", socket => {
    console.log("connected");

    socket.on("send-changes", (value) => {
        console.log("Received changes:", value);
    });

    socket.on('insert-text', ({ text, path, offset }) => {
        console.log("Inserting text:", text, "at path:", path, "offset:", offset);
         socket.broadcast.emit('receive-changes', {
            text: text,
            path: path,
            offset: offset
        });
        
  
    });
   
    // socket.on("disconnect", () => {
    //     console.log("User disconnected");
    // });
    
});


