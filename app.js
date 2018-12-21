const express= require('express');
const app =express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io').listen(server);

server.listen(process.env.PORT || 80,(err)=>{
    if(err){
        console.log('Error in port config');
    }
    else{
        console.log('Server started .....');
    }
});

app.use(express.static('public'));
var Connected=[];
var users=[];
var  userData={};
var socketIDStore=[];
var Total;
var selectedUser = '';
io.sockets.on('connection',(socket)=>{
    Connected.push(socket);
     Total=Connected.length;
    console.log('New User Connected Now Total User Connected are '+ Total);
    console.log("socketID" ,socket.id);
    socket.on('disconnect',(data)=>{
            Connected.splice(Connected.indexOf(socket),1);
            Total=Connected.length;
            users.splice(users.indexOf(socket),1);               
            socketIDStore= socketIDStore.filter((sockt)=>{     //returns the socket other then the disconnected sockt
                if(sockt.id!=socket.id){
                    return sockt;
                }
            })
            addUser();
            console.log('Connection close Total user now connected '+Total);
    });
    socket.on('send message',(data)=>{
        console.log('msg typed',data);
        console.log('slectedUser sending to ',selectedUser);
        var sender;
        socketIDStore.forEach((userData)=>{
            if(userData.userId==socket.id){
                sender=userData.userName;             //retrive the name of the sender
                console.log('Name of the sender '+sender);
                let currentdate = new Date(); 
                userData.friendList.forEach((SendingTo)=>{
                    if(SendingTo.friendName==selectedUser){    //searching for the friend whom sending msg
                        SendingTo.msgSent.push([data,currentdate.getHours() + ":"  
                        + currentdate.getMinutes() + ":" 
                        + currentdate.getSeconds()]);            //pushing the msgSent in the friend conversation
                        console.log('data pushed in the msg Sent ',SendingTo.msgSent);
                    }
                })
                io.to(userData.userId).emit('new message',{'msg' : data , 'symbol' : 'S'})
            }
        })
        socketIDStore.forEach((userData)=>{
            console.log('selectedUSer',selectedUser);
            if(userData.userName==selectedUser){
                console.log('sender',sender);
                console.log(userData);
                let currentdate = new Date();
                userData.friendList.forEach((ReceivingFrom)=>{
                    console.log('friendName',ReceivingFrom.friendName);
                    if(ReceivingFrom.friendName==sender){            //searching for the friend converstion
                        ReceivingFrom.msgRcd.push([data,currentdate.getHours() + ":"  
                        + currentdate.getMinutes() + ":" 
                        + currentdate.getSeconds()]);                  //pushing the msgRcd in the conversation
                        console.log('data pushed in the msg recd ',ReceivingFrom.msgRcd);
                    }
                })
                // userData.msgRcd.push(data);
                // console.log('username who is receiving',userData.userName);
                // io.to(userData.userId).emit('new message',{ 'msg' : data , 'symbol' : 'R'})
            }
        })
        
    });
    socket.on('userLogin',(data)=>{
        socket.username=data;
        console.log('socketId',socket.id);
        // socketIDStore.push(socket.id);
        users.push(socket.username);
        userData={userName : socket.username, userId : socket.id, friendList : [] }
        socketIDStore.push(userData);                         //socketIdStore contains the userDetails Object
        console.log('userData',userData);
        addUser();
    })
    function addUser(){
        console.log("length",socketIDStore.length);
        for(let j=0;j<socketIDStore.length;j++){
        chatUser = users.filter((uname)=>{
            
           if(uname!=socketIDStore[j].userName){
            let friend ={ friendName : uname , msgSent : [] , msgRcd : [] }
            socketIDStore[j].friendList.push(friend);
            return uname;
           }
        })

        io.to(socketIDStore[j].userId).emit('useradded',chatUser);
        console.log('chatUser',j + " " +chatUser);
        // users.forEach((USERNAME)=>{
        //     console.log('USERNAME',USERNAME);
        //     console.log(userData.userName);
        //     if(USERNAME==userData.userName){
        //         console.log('Removed the socket element');
        //     }
        //     else{
        //         io.sockets.emit('useradded',USERNAME);
        //         console.log('users',USERNAME);
        //     }
        // })
    }
    }
    socket.on('userSelected',(name)=>{
        console.log('userMsg Shown');
        console.log('nME OF THE SOCKET',socket.id);             //socket.id of the socket from where the event is fired
        var data;
        for(let j=0;j<socketIDStore.length;j++){
            if(socketIDStore[j].userName==name){
            selectedUser=socketIDStore[j].userName;}                //selectedUser assign
            socketIDStore[j].friendList.forEach((friend)=>{   //check the friend from friendList
                if(friend.friendName==name){
                let msgRcd = friend.msgRcd;                        //retrive those message which r Rcd from the Friend
                let msgSnt = friend.msgSent; 
                let TotalConv = [...msgRcd , ...msgSnt]  
                console.log('before sorting ',TotalConv);                   //retrive those messafe which r send to the friend
                TotalConv.sort((a,b)=>{return a[1]>b[1]})
                console.log('Total Convere ',TotalConv);
                data={ 'msgRcd' : msgRcd , 'msgSnt' : msgSnt , 'TotalConv' : TotalConv};
            }             
            })
                // console.log('i m inside the idStore');
            }
            console.log('Selected friend '+name +' data emitted ', data);
            io.to(socket.id).emit('content',data);
        })
});
module.exports=io;