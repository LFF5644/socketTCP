const socketTpcClient=require("./index");
const fs=require("fs");

const client=socketTpcClient.createClient();
client.getFile(
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
