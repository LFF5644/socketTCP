#!/usr/bin/env node
const socketIoClient=require("socket.io-client");
const fs=require("fs");

const port=process.env.socketTCP_port||3245;
const files=new Map();

const socket=socketIoClient(`http://localhost:${port}`);

socket.on("connect",()=>{
	console.log("connected as "+socket.id);
	if(process.argv[2]){
		const path=process.argv[2];
		const output=process.argv[3]||"file.bin";
		console.log("get file "+path);
		socket.emit("get-file",path,data=>{
			files.set(data.id,{
				buffer: new Uint8Array(data.size),
				file: data.file,
				finished: false,
				id: data.id,
				output,
				path,
				size: data.size,
			});
		});
	}
});
socket.on("disconnect",()=>console.log("disconnect"));
socket.on("get-file",(id,startIndex,chunk,cb)=>{
	const entry=files.get(id);
	if(!entry||entry.finished){
		console.log(!entry?`file with id "${id}" not found`:`file ${entry.path} wurde schon abgeschlossen`);
		return;
	}
	if(typeof(startIndex)=="boolean"&&startIndex){
		console.log(`\nDatei empfangen! wird nun unter "${entry.output}" gespeichert Größe beträgt ${entry.size} Bytes`);
		entry.finished=true;
		files.set(id,entry);
		fs.writeFileSync(entry.output,Buffer.from(entry.buffer));
		return;
	}

	for(let index=0; index<chunk.length+1; index++){
		entry.buffer[startIndex+index]=chunk[index];
	}

	files.set(id,entry);
	process.stdout.write(`${entry.file} Add Chunk: ${String(startIndex).padStart(String(entry.size).length,"0")}-${String(startIndex+chunk.length).padStart(String(entry.size).length,"0")} Chunk Address, ${String(startIndex).padStart(String(entry.size).length,"0")}/${entry.size} Bytes, ${chunk.length} Chunk Größe Bytes\r`);
	cb(true);
});
