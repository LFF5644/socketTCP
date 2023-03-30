const socketIo=require("socket.io");
const fs=require("fs");

const port=process.env.socketTCP_port||3245;
const sendBytesPerChunk=0xff;

function readFile(path){return new Promise((async (resolve,reject)=>{
	fs.readFile(path,(error,buffer)=>{
		if(error) reject(error);
		resolve(buffer);
	});
}))}

const io=socketIo(port,{
	cors:{
		origin:"*",
	},
});

io.on("connection",socket=>{
	socket.on("get-file",(async path=>{
		let buffer;
		try{
			buffer=await readFile(path);
		}
		catch(e){
			/*cb({
				type: "error",
				code: e,
				consoleError: `file '${path}' can't read`,
			});*/
		};
		/*cb({
			type: "ok",
			consoleLog: `file '${path}' was read length is ${buffer.length} Bytes`,
		});*/

		const realBuffer=buffer;
		buffer=JSON.parse(JSON.stringify(buffer)).data;	// make it to array buffer
		// array buffer: [99, 111, 110, 115, 111, 108, ...]
		// buffer: <Buffer 63 6f 6e 73 6f ...>
		// array buffer supports .map and other functions

		const fileSize=buffer.length-1;
		for(let index=0; index<fileSize+sendBytesPerChunk; index+=sendBytesPerChunk){
			if(index>fileSize){
				break;
			}

			let end=index+sendBytesPerChunk;
			if(index+sendBytesPerChunk>fileSize){
				end=fileSize;
			}

			const chunk=buffer.filter((byte,i)=>i>=index&&i<=end)
			
			await new Promise(resolve=>{ // send chunk to client
				socket.emit("get-file",path,chunk,resolve);
			});
			//socket.emit("get-file",path,chunk,()=>console.log("chunk sended"));
			//console.log(chunk);
		}
		socket.emit("get-file",path,true);
	}));
});