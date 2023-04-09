# Socket IO TCP
Socket Io Sender and Reviver!


## Install
```
sudo apt install nodejs git # install nodejs and git
cd <you programmes path> # you can also go to ~/Desktop
git clone git@github.com:LFF5644/socketTCP.git # download all file form github and paste this files in "./socketTCP"
cd socketTCP/
# start here if you alrady have this repo on you device
npm install # download all required modules in the package.json file
```


#### Tipp
for exit press `STRG + C` (`^C`)


## Start Server
WARNING: erveryone has accses to all you files!
```
cd <path to socketTCP>
cd server/
export socketTCP_port="<port>" # default is "3245"
export socketTCP_chunkSize="<chunk size>" # in bytes, default is "1048576" (1MB), example "1024" (1KB)
node index.js # run server
```


## Start Client
```
cd <path to socketTCP>
cd client/
export socketTCP_host="<server ip>" # server ip, default "localhost"
export socketTCP_get="<file>" # file to get from server, example "~/Desktop/test.txt"
export socketTCP_output="<output file>" # default "outputFile.bin"
node demo.js # run client
```


## Update to newest Version
```
cd <path to socketTCP>
git pull
```
if newest version you get `Already up to date.`!
else look *Example: Update*


### Example: Installation
```
lff@lff-raspberrypi:~$ cd /tmp/
lff@lff-raspberrypi:/tmp$ git clone git@github.com:LFF5644/socketTCP.git
[...]
lff@lff-raspberrypi:/tmp$ cd socketTCP/
lff@lff-raspberrypi:/tmp/socketTCP$ npm install
[...]
lff@lff-raspberrypi:/tmp/socketTCP$
```


### Example: Server
```
lff@lff-raspberrypi:/tmp/socketTCP$ cd server/
lff@lff-raspberrypi:/tmp/socketTCP/server$ export socketTCP_chunkSize="0xff"
lff@lff-raspberrypi:/tmp/socketTCP/server$ node index.js
Socket Server ist Online auf Port 3245!
Chunk Größe beträgt 255 Bytes!

sending file "/home/lff/test.txt" size 41 bytes to client "-CLxZsB7ubnBgf8bAAAD"...
Datei: "/home/lff/test.txt" with size 41 Bytes. Wurde übertragen in 0.09 Sekunden, 0 Minuten
^C
lff@lff-raspberrypi:/tmp/socketTCP/server$
```


### Example: Client
```
lff@LFF-Server:~/bind/myOwnProgrammes/nodejs/socketTCP$ cd client/
lff@LFF-Server:~/bind/myOwnProgrammes/nodejs/socketTCP/client$ export socketTCP_host="192.168.178.55"
lff@LFF-Server:~/bind/myOwnProgrammes/nodejs/socketTCP/client$ export socketTCP_get="/home/lff/test.txt"
lff@LFF-Server:~/bind/myOwnProgrammes/nodejs/socketTCP/client$ export socketTCP_output="helloWorld.txt"
lff@LFF-Server:~/bind/myOwnProgrammes/nodejs/socketTCP/client$ node demo.js
connecting to 192.168.178.55 with port 3245
connected as -CLxZsB7ubnBgf8bAAAD
get file /home/lff/test.txt
test.txt Add Chunk: 00-41 Chunk Address, 00/41 Bytes, 41 Chunk Größe Bytes
Datei empfangen! wird nun unter "helloWorld.txt" gespeichert Größe beträgt 41 Bytes
^C
lff@LFF-Server:~/bind/myOwnProgrammes/nodejs/socketTCP/client$ cat helloWorld.txt 
Hello, World!
Im a test file!

have fun!
lff@LFF-Server:~/bind/myOwnProgrammes/nodejs/socketTCP/client$
```


### Example: Update
```
lff@lff-raspberrypi:/tmp/socketTCP$ git pull
remote: Enumerating objects: 5, done.
remote: Counting objects: 100% (5/5), done.
remote: Compressing objects: 100% (3/3), done.
remote: Total 3 (delta 1), reused 0 (delta 0), pack-reused 0
Unpacking objects: 100% (3/3), 1.64 KiB | 52.00 KiB/s, done.
From github.com:LFF5644/socketTCP
   ec14db4..a96c4c9  master     -> origin/master
Updating ec14db4..a96c4c9
Fast-forward
 README.md | 79 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 79 insertions(+)
lff@lff-raspberrypi:/tmp/socketTCP$
```
