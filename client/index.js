#!/usr/bin/env node
const socketIoClient=require("socket.io-client");
const fs=require("fs");

//const port=process.env.socketTCP_port||3245;
//const host=process.env.socketTCP_host||"127.0.0.1";
const files=new Map();
const sockets=new Map();

function getFile(id,path){return new Promise((resolve,reject)=>{
	const socket=sockets.get(id);
	console.log(id);
	socket.emit("get-file",path,data=>{
		console.log(data);
		if(!data.error) files.set(data.id,{
			buffer: new Uint8Array(data.size),
			file: data.file,
			finished: false,
			id: data.id,
			path,
			reject,
			resolve,
			size: data.size,
		});
		if(data.error) reject(data);
	});
})}
function listFiles(id,path,types){
	const socket=sockets.get(id);
	return new Promise((resolve,reject)=>{
		socket.emit("listFiles",path,types,data=>{
			if(data.code==="ok"){
				resolve(data.data);
				return;
			}
			else{
				reject(data.code);
				return;
			}
		});
	})
	
}
function createClient(host="127.0.0.1",port=3245){
	const socket=socketIoClient(`http://${host}:${port}`);
	sockets.set(socket.id,socket);
	console.log(`connecting to ${host} with port ${port}`);
	socket.on("connect",()=>{
		console.log(`connected as ${socket.id}`);
	});
	socket.on("disconnect",()=>console.log("disconnect"));
	socket.on("get-file",(id,startIndex,chunk,cb)=>{
		const entry=files.get(id);
		if(!entry||entry.finished){
			console.log(!entry?`file with id "${id}" not found`:`file ${entry.path} wurde schon abgeschlossen`);
			return;
		}
		if(typeof(startIndex)=="boolean"&&startIndex){
			console.log(`\nDatei empfangen! Größe beträgt ${entry.size} Bytes`);
			entry.resolve({
				buffer: Buffer.from(entry.buffer),
				file: entry.file,
				path: entry.path,
				size: entry.size,
			});
			files.delete(id);
			return;
		}
		else if(typeof(startIndex)=="boolean"&&!startIndex){
			entry.reject({
				file: entry.file,
				path: entry.path,
			});
			files.delete(id);
			return;
		}

		for(let index=0; index<chunk.length; index++){
			entry.buffer[startIndex+index]=chunk[index];
		}

		files.set(id,entry);
		process.stdout.write(`${entry.file} Add Chunk: ${String(startIndex).padStart(String(entry.size).length,"0")}-${String(startIndex+chunk.length).padStart(String(entry.size).length,"0")} Chunk Address, ${String(startIndex).padStart(String(entry.size).length,"0")}/${entry.size} Bytes, ${chunk.length} Chunk Größe Bytes\r`);
		cb(true);
	});
	return{
		getFile: path=>getFile(socket.id,path),
		listFiles: (path,type)=>listFiles(socket.id,path,type),
		disconnect: ()=>socket.disconnect(),
		connect: ()=>socket.connect(),
	};
}

module.exports={
	createClient,
};
