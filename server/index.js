#!/usr/bin/env node
const socketIo=require("socket.io");
const directoryTools=require("directoryTools");
const fs=require("fs");

const port=Number(process.env.socketTCP_port)||process.argv[2]||3245;
const sendBytesPerChunk=Number(
	process.env.socketTCP_chunkSize||
	process.argv[3]||
	1024*1024
);

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
	socket.on("get-file",(async (path,callback)=>{
		const file=path.split("/").pop();
		let buffer;
		try{
			buffer=await readFile(path);
		}
		catch(e){
			callback({
				error: true,
				file,
				path,
			});
			return;
		}

		// array buffer: [99, 111, 110, 115, 111, 108, ...]
		// buffer: <Buffer 63 6f 6e 73 6f ...>
		// array buffer supports .map and other functions

		const fileSize=buffer.length;
		let sendId;
		{
			const pathHex=Buffer.from(path,"utf-8").toString("hex");
			const time=Date.now();
			sendId=`${pathHex}_${fileSize}_${time}`;
		}
		callback({
			file,
			id: sendId,
			path,
			size: fileSize,
		});
		const startTime=Date.now();
		console.log(`sending file "${path}" size ${fileSize} bytes to client "${socket.id}"...`);
		for(let index=0; index<fileSize+sendBytesPerChunk; index+=sendBytesPerChunk){
			if(index>fileSize){
				break;
			}

			let end=index+sendBytesPerChunk;
			if(index+sendBytesPerChunk>fileSize){
				end=fileSize;
			}

			const chunk=buffer.slice(index,end);
			await new Promise(resolve=>{ // send chunk to client
				socket.emit("get-file",sendId,index,chunk,resolve);
			});
		}
		socket.emit("get-file",sendId,true,null);
		const endTime=Date.now();
		const timeSec=Math.round(((endTime-startTime)/1000)*200)/200;
		console.log(`Datei: "${path}" with size ${fileSize} Bytes. Wurde übertragen in ${timeSec} Sekunden, ${Math.round(timeSec/60*100)/100} Minuten`);
	}));
	socket.on("listFiles",(path,types,callback)=>{
		const files=directoryTools.getFiles(path);
		const useTypes=(
			types&&
			typeof(types)==="object"&&
			types.length>0
		);
		callback(useTypes? directoryTools.filterFiles(files,types): files);
	});
	socket.on("writeFile",(path,buffer,callback)=>{
		directoryTools.makeDirectoriesInPath(path)
		fs.writeFile(path,buffer,(error)=>{
			if(error) callback({error});
			else callback({success: true});
		});
	});
	socket.on("mkdir",(path,callback)=>{
		fs.mkdir(path,(error)=>{
			if(error) callback({error});
			else callback({success: true});
		});
	});
	socket.on("mkdirs",(path,callback)=>{
		callback({
			success: directoryTools.makeDirectoriesInPath(path),
		});
	});
	socket.on("removeFile",(path,callback)=>{
		fs.unlink(path,(error)=>{
			if(error) callback({error});
			else callback({success: true});
		});
	});
});

console.log(`Socket Server ist Online auf Port ${port}!\nChunk Größe beträgt ${sendBytesPerChunk} Bytes!\n`);
