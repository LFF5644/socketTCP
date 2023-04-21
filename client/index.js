#!/usr/bin/env node
const socketIoClient=require("socket.io-client");
const fs=require("fs");

//const port=process.env.socketTCP_port||3245;
//const host=process.env.socketTCP_host||"127.0.0.1";
const files=new Map();
const sockets=new Map();

function getFile(id,path){return new Promise((resolve,reject)=>{
	const socket=sockets.get(id);
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
			resolve(data);
		});
	})
	
}
function writeFile(id,path,buffer){
	const socket=sockets.get(id);
	return new Promise((resolve,reject)=>{
		socket.emit("writeFile",path,buffer,data=>{
			const {success,error}=data;
			//if(error) reject(error);
			resolve(success?true:false);
		});
	});
}
function mkdir(id,path){
	const socket=sockets.get(id);
	return new Promise((resolve)=>{
		socket.emit("mkdir",path,data=>{
			const {success}=data;
			resolve(success?true:false);
		});
	});
}
function removeFile(id,path){
	const socket=sockets.get(id);
	return new Promise((resolve,reject)=>{
		socket.emit("removeFile",path,data=>{
			const {success,error}=data;
			//if(error) reject(error); 
			resolve(success?true:false);
		});
	});
}
function createClient(host="127.0.0.1",port=3245){
	const socket=socketIoClient(`http://${host}:${port}`);
	const id=Date.now();
	sockets.set(id,socket);
	console.log(`connecting to ${host} with port ${port}`);
	socket.on("connect",()=>{
		console.log(`connected to "${host}:${port}" as "${socket.id}"`);
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
		connect: ()=>socket.connect(),
		disconnect: ()=>socket.disconnect(),
		getFile: path=>getFile(id,path),
		listFiles: (path,types)=>listFiles(id,path,types),
		mkdir: path=>mkdir(id,path),
		removeFile: path=>removeFile(id,path),
		writeFile: (path,buffer)=>writeFile(id,path,buffer),
	};
}

module.exports={
	createClient,
};
