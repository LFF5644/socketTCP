#!/usr/bin/env node
const socketTpcClient=require("./index");
const fs=require("fs");

const client=socketTpcClient.createClient(
	process.env.socketTCP_host,
	process.env.socketTCP_port,
);

if(
	process.env.socketTCP_getType==="file"||
	!process.env.socketTCP_getType
) client.getFile(
	process.env.socketTCP_get||
	process.argv[2]
)
	.then(entry=>{
		const output=(
			process.env.socketTCP_output||
			process.argv[3]||
			"outputFile.bin"
		);
		console.log(`saving file "${output}" ...`);
		fs.writeFileSync(
			output,
			entry.buffer,
		);
		console.log("saved!");
		client.disconnect();
	})
	.catch(entry=>{
		if(!entry.path||!entry.file){
			throw entry;
		}
		console.log(`cant get file ${entry.path} ${entry.file}`);
		client.disconnect();
	});

else if(process.env.socketTCP_getType==="dir") client.listFiles(
	process.env.socketTCP_get||
	process.env.socketTCP_path||
	"./",
	process.env.socketTCP_types?
	process.env.socketTCP_types
		.split(",")
		.map(item=>item.trim())
	:null
)
	.then(files=>{
		console.log(files);
		console.log(files.join("\n"));
		console.log(files.length,"found!");
		client.disconnect();
	})
	.catch(error=>{
		console.log("server error",error);
		throw error;
	});

else if(process.env.socketTCP_getType==="send"){
	const file=process.env.socketTCP_get;
	const buffer=fs.readFileSync(file);
	const output=process.env.socketTCP_output||"outputFile.bin";

	console.log(`Sending File ${file} with ${buffer.length} Bytes to Server ...`);
	client.writeFile(output,buffer)
		.then(()=>{
			console.log(`File Saved as ${output} on the Server!`);
			client.disconnect();
		})
		.catch(error=>{
			console.log("SERVER ERROR!",error.code);
			client.disconnect();
		});
}