const socketIoClient=require("socket.io-client");

const port=process.env.socketTCP_port||3245;
const getFiles={};
const files={};

const socket=socketIoClient(`http://localhost:${port}`);

socket.on("connect",()=>{
	console.log("connected as"+socket.id);
	if(process.argv[2]){
		const path=process.argv[2];
		console.log("get file "+path);
		socket.emit("get-file",path);
	}
});
socket.on("disconnect",()=>console.log("disconnect"));
socket.on("get-file",(path,chunk,cb)=>{
	if(typeof(chunk)=="boolean"&&chunk){
		const file=getFiles[path];
		files[path]=file;
		console.log(path+" length "+file.length);
		delete getFiles[path];
		return;
	}
	if(!getFiles[path]){
		getFiles[path]=[];
	}
	getFiles[path]=[
		...getFiles[path],
		...chunk,
	];
	console.log("add chunk for "+path+" with size "+chunk.length);
	cb(true);
});
