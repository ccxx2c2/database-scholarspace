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

var exec = require('child_process').exec;
var child = exec('py -3 p2n.py', function (err, stdout, stderr) {
  console.log(stdout);   // 直接查看输出
  console.log(stderr);   // 直接查看输出
}); 
var child2 =  exec('py -3 huatu.py', function (err, stdout, stderr) {
  console.log(stdout);   // 直接查看输出
  console.log(stderr);   // 直接查看输出
}); 
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
                  result = result.recordset;
                  for(var i = 0;i<result.length;i++){
                        await (async(i)=>{
                          return new Promise((resolve,reject) => {
                              db.cypher({
                                    query:`match (s:scholar) where s.sid='${result[i].id}' return s.sinterest,s.sweight,s.sid`,
                              },function(err,result2){
                                if (err)throw err;
                                  result2 = result2[0];
                                  result[i]['sinterest'] = result2['s.sinterest'];
                                  result[i]['sweight'] = result2['s.sweight'];
                                  resolve();
                              });
                          });     
                        })(i);

                    }
                  
                  console.log(result);
                  socket.emit('searchroot',{
                      type:'学者',
                      head:['id','name','organization','number of papers','citation','sinterest','sweight'],
                      result:result,
                  });
                })();


                break;
              case 1:
                mylog(' for 论文');
                //select where ptitle like name
                var result;
                (async ()=>{
                  result = await sql.query(`
                    SELECT TOP 10 pid as id, ptitle, pauthor,pcite,pyear,pjournal,pabstract
                    FROM papers
                    WHERE ptitle LIKE '%${data.name}%'
                    OR pabstract LIKE '%${data.name}%'
                  `);
                  console.log(result)
                  
                  socket.emit('searchroot',{
                      type:'论文',
                      head:['id','title','author','cite','publish year','journal','abstract'],
                      result:result.recordset,
                  });
                })();


                break;
                break;
              case 2:
                mylog(' for 机构');
                socket.emit('searchroot',{
                    err:'未实装！',
                });
                break;
              case 3:
                child2.stdin.write(data.name+'\n');
                child2.stdout.once('data', function (s) {
                  console.log(s);
                  socket.emit('searchroot',{
                    data:'done'
                  });
                });
              
              break;
            }
          break;
          case 1:break;
          case 2:
            mylog('in recommend');
            child.stdin.write(data.name+'\n');
            child.stdin.write(data.num+'\n');
            child.stdout.once('data', function (s) {
              var a;
              a=s.toString();
              console.log(a);//iconv.decode(a, 'gb2312')
              a = JSON.parse(a.replace(/\'/g,'"'));
              console.log(a);
              var result,t;
                (async ()=>{
                  result = [];
                  for(var i = 0; i < a.length; i++){
                    t = await sql.query(`
                      SELECT sid as id, sname as name, sinstitution,spnum,spcite 
                      FROM scholars
                      WHERE sid = ${a[i]};
                    `);
                  result[i] = t.recordset[0];
                  }
                  for(var i = 0;i<result.length;i++){
                        await (async(i)=>{
                          return new Promise((resolve,reject) => {
                              db.cypher({
                                    query:`match (s:scholar) where s.sid='${result[i].id}' return s.sinterest,s.sweight,s.sid`,
                              },function(err,result2){
                                if (err)throw err;
                                  result2 = result2[0];
                                  result[i]['sinterest'] = result2['s.sinterest'];
                                  result[i]['sweight'] = result2['s.sweight'];
                                  resolve();
                              });
                          });     
                        })(i);

                    }
                  
                  console.log(result);
                  socket.emit('searchroot',{
                      type:'学者',
                      head:['id','name','organization','number of papers','citation','sinterest','sweight'],
                      result:result,
                  });
                })();
            });
          break;
        }
    });
    socket.on('idroot',(data)=>{
      console.log('in idroot');
      console.log(data);
      switch(data.type){
        case '学者':
          mylog('for 学者')
          var ret,result,result2;
            (async ()=>{
              result = await sql.query(`
                SELECT sid as id, sname as name, spnum as number_of_papers, sinstitution as organization, spcite as number_of_citation
                FROM scholars
                WHERE sid = ${data.id};
              `);
              result = result.recordset[0];
              result2 = await sql.query(`
                SELECT ptitle as title, sposition as position, p.pid as id
                FROM [paper-author] ps, papers p
                WHERE ps.pid = p.pid
                AND ps.sid =${data.id};
              `);

                    await (async(i)=>{
                      return new Promise((resolve,reject) => {
                          db.cypher({
                                query:`match (s:scholar) where s.sid='${data.id}' return s.sinterest,s.sweight,s.sid`,
                          },function(err,result2){
                            if (err)throw err;
                              result2 = result2[0];
                              result2['s.sinterest'].split(";").forEach((item,index)=>{
                                result['sinterest' + (index+1)] = item;
                              });
                              result['sweight'] = result2['s.sweight'];
                              resolve();
                          });
                      });     
                    })(i);
              for(var i = 1;i<=result2.recordset.length;i++){
                result['paper' + i]={
                  title:result2.recordset[i - 1]['title'],
                  id:result2.recordset[i - 1]['id'],
                };
                result['paper' + i + 'position'] = result2.recordset[i - 1]['position'];
              }

              
              console.log(result);
              socket.emit('idroot',{
                  type:'学者',
                  result:result,
              });
            })();
        break;

        case '论文':
            mylog(' for 论文');
            var result,result2,result3,ret;
                (async ()=>{
                  result = await sql.query(`
                    SELECT pid as id, ptitle as title, pauthor as author,pcite as citation,pyear as publish_year,pjournal as journal,pabstract as abstract
                    FROM papers
                    WHERE pid =  ${data.id};
                  `);
                  console.log(result)
                  result2 = await sql.query(`
                    SELECT keyword 
                    FROM [paper-keyword]
                    WHERE pid =  ${data.id};
                  `);
                  console.log(result2)
                  result3 = await sql.query(`
                    SELECT ptitle as title,p.pid as id
                    FROM [paper-document] pd, papers p
                    WHERE pd.pid = ${data.id}
                    AND pd.documentid = p.pid;
                  `);
                  console.log(result3)
                  ret = result.recordset[0];
                  for(var i = 1;i<=result2.recordset.length;i++){
                    ret['keyword' + i]=result2.recordset[i - 1]['keyword'];
                  }
                  for(var i = 1;i<=result3.recordset.length;i++){
                    ret['citation' + i]=result3.recordset[i - 1];
                  }
                  socket.emit('idroot',{
                      type:'论文',
                      result:ret,
                  });
                })();
        break;
      }
    }
      )
});
