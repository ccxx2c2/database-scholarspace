"use strict";
var express = require('express');
var app = express();

var http = require('http').Server(app);

var fs = require('fs');
var io = require('socket.io')(http);
var sql = require('mssql')
var neo4j = require('neo4j');
var password = require(__dirname + '/password.js');
var db = new neo4j.GraphDatabase(password.neo4j)
sql.connect(password.mssql)

function mylog(mystr){
  console.log(new Date().toLocaleString())
  console.log(mystr);
}

http.listen(8001, () => {
  mylog(' listening on *:8001');
});

app.get('/', function(req, res) {
  mylog(req.hostname);
  mylog(req.protocol);
  res.redirect('/index.html');
});

app.get('/searchroot', function(req, res) {
 

});
app.use(express.static(__dirname + '/public'));

io.on('connection',(socket)=>{
  // connect to server
    console.log(`${new Date().toLocaleString()} a user connected`);
    socket.on('searchroot', (data)=>{
        mylog('in searchroot');
        mylog(data);
        var resjson = {};
        switch(parseInt(data.type)){
          case 0:
            mylog('search ' + data.name);
            switch(parseInt(data.rectype)){
              case 0:
                mylog(' for 学者');
                //select where stitle like name
                //返回 id name org
                var result;
                (async ()=>{
                  result = await sql.query(`
                    SELECT TOP 10  sid as id, sname as name, sinstitution,spnum,spcite 
                    FROM scholars
                    WHERE sname LIKE '%${data.name}%'
                    ORDER BY ABS(LEN('${data.name}')-LEN(sname));
                  `);
                  console.log(result)

                  socket.emit('searchroot',{
                      type:'学者',
                      head:['id','name','organization','number of papers','citation'],
                      result:result.recordset,
                  });
                })();


                break;
              case 1:
                mylog(' for 论文');
                //select where ptitle like name
                var result;
                (async ()=>{
                  result = await sql.query(`
                    SELECT TOP 10 pid as id, ptitle, pauthor,pabstract
                    FROM papers
                    WHERE ptitle LIKE '%${data.name}%'
                    OR pabstract LIKE '%${data.name}%'
                  `);
                  console.log(result)
                  
                  socket.emit('searchroot',{
                      type:'论文',
                      head:['id','title','author','abstract'],
                      result:result.recordset,
                  });
                })();


                break;
                break;
              case 2:
                mylog(' for 机构');
                this.emit('searchroot',{
                    err:'未实装！',
                });
                break;
            }
            break;
        }
        //res.json({a:122222});
    });
    socket.on('idroot',(data)=>{
      console.log('in idroot');
      console.log(data);
      socket.emit('idroot',data);
    }
      )
});
