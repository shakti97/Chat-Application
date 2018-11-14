const io=require("../../app.js");
window.addEventListener('load',()=>{
    messages=[];
    var socket=io.connect('http://ad30d22a.ngrok.io/');
    var message=document.getElementById('message');
    var sendBtn=document.getElementById('send');
    var content=document.getElementById('content');

    /* Event Listener */
    socket.on('message',(data)=>{
        if(data.message){
            messages.push(data.message);
        }
        var html='';
        for(var i=0;i<messages.length;i++){
            html+=messages[i] + "<br/>";
            html.classList.add('messageRep');
        }
        content.innerHTML=html;
    });
    sendBtn.onclick=function(){
        var text=message.value;
        console.log('send btn clicked');
        socket.emit={
            message : text
        }
    }
})