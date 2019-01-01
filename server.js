<!doctype html>
<html lang='zh-CN'>
<head>
	<meta charset='utf-8'/>
	<title></title>
	<link href="/bootstrap.min.css" rel="stylesheet">
	<style>
		.jumbotron{
			text-align: center;
			background-image: url(./index.svg);
			color:#ffffff;
		}
		.onetext{
			width:500px;
		}
		.twotext{
			width:250px;
		}
		.form-inline .input-group> .form-control{
			width:auto;
		}
		.vizs {
            width: 550px;
            height: 400px;
            border: 1px solid lightgray;
            font: 22pt arial;
        }
        .modal-dialog{
        	width:1200px;
        }
        .center{
        	display: block;
			margin-left: auto;
			margin-right: auto;
        }
	</style>
</head>
<body>
	<nav class="navbar navbar-default">
		  <div class="container-fluid">
		    <!-- Brand and toggle get grouped for better mobile display -->
		    <div class="navbar-header">
		      <a class="navbar-brand" href="#">ScholarSpace</a>
		    </div>

   		 <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1"> 
   		<ul class="nav navbar-nav navbar-right">
        <li><a href="#">中国人民大学</a></li>
      </ul>
    </div><!-- /.navbar-collapse -->
  </div><!-- /.container-fluid -->
</nav>
<div id="app">
	<div class="jumbotron masthead">
		<div class="container">
	<h1>ScholarSpace Demo</h1>
	<p>...</p>
	<p>
		<div class="form-inline" >
		  <div class="form-group">
		  	<div class="btn-group" role="group">
			    <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
			      {{types[typepoint]}}
			      <span class="caret"></span>
			    </button>
			    <ul class="dropdown-menu">
			      <li v-for='(type,index) in types' v-if='index !== typepoint'><a href="#" v-on:click="typepoint=index">{{type}}</a></li>
			    </ul>
			  </div>
		    <div class="input-group">
		      <input type="text" class="form-control" id="input1" v-bind:placeholder="entities[entitiespoint] + '名称'" style="width:500px" v-if="typepoint===0" v-model="message1">
		      <input type="text" class="form-control" id="input2" :placeholder="typepoint === 1?'学者名称1':'个人用户名'" style="width:250px"  v-if="typepoint !== 0" v-model="message2">
		      <input type="text" class="form-control" id="input3" :placeholder="typepoint === 1?'学者名称2':'待发表关键词'" style="width:250px"  v-if="typepoint !== 0" v-model="message3">
		    </div>
		   <div class="btn-group" role="group" v-if="typepoint===0">
			    <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
			      {{entities[entitiespoint]}}
			      <span class="caret"></span>
			    </button>
			    <ul class="dropdown-menu">
			      <li v-for='(entity,index) in entities' v-if='index !== entitiespoint'><a href="#" v-on:click="entitiespoint=index">{{entity}}</a></li>
			    </ul>
			  </div>
		   <div class="btn-group" role="group" v-if="typepoint===2">
			    <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
			      {{options[recommendpoint]}}
			      <span class="caret"></span>
			    </button>
			    <ul class="dropdown-menu">
			      <li v-for='(entity,index) in options' v-if='index !== recommendpoint'><a href="#" v-on:click="recommendpoint=index">{{entity}}</a></li>
			    </ul>
			  </div>
		  </div>
		  <button type="button" class="btn btn-primary" @click="searchsubmit()" id='searchbutton'>
		  Search
		</button>
		</div>
</p>

</div>
	</div>
<div id="searchres" v-if="tabledata !== {}" class="container">
	<table class="table">
		<tr>
			<th v-for="head in tabledata.head" v-if="head!='id'">{{head}}</th>
		</tr>
		<tr v-for="item in tabledata.result">
			<td v-for="(value,key) in item" v-if="key!='id'">
				<a href="#" @click="idsubmit(tabledata.type,item.id)" v-if="key=='ptitle' || key=='name'" data-toggle="modal" data-target="#paperModal">{{value}}</a>
				<template v-if="key != 'ptitle' && key!='name'">{{value}}</template></td>
		</tr>
	</table>
</div>
<div class="container">
		<div id="viz0" class="vizs center" :style="typepoint==1?'':'display:none;'"></div>
</div>
<div class="modal fade" id="paperModal" tabindex="-1" role="dialog" >
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title">{{modaldata.title == undefined ? modaldata.name : modaldata.title}}</h4>
      </div>
      <div class="modal-body">

<div class="row">
	<div :class="type=='学者'?'col-md-6':'col-md-12'">
        <table class="table">
			<tr v-for = "(item,key) in modaldata">
				<th>{{key}}</th>
				<td v-if="typeof(item)!=='object' || item===null|| item['title'] === undefined">{{item}}</td>
				<td v-else><a href="#" @click="idsubmit('论文',item.id)">{{item.title}}</a></td>
			</tr>
		</table>
	</div>
	<div :class="type=='学者'?'col-md-6':'col-md-1'" :style="type=='学者'?'':'display:none;'">
		<div id="viz1" class="vizs"></div>
		<div id="viz2" class="vizs"></div>
	</div>
</div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" data-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>
<div class="container">
<div class="alert alert-info alert-dismissible" role="alert" v-if="unclick">
  <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
  你是否要找：<template v-for="item in frequency">
  		<br/><a href="#" class="alert-link" @click="clickfrequency(item.name)">{{item.name}}</a>
	</template>
</div>
</div>
	</div>
	<script src="/jquery.min.js"></script>
	<script type="text/javascript" src="/bootstrap.js"></script>
    <script src="/socket.io/socket.io.js"></script>
	<script src="vue.js"></script>
	<script src="/vue-resource.js"></script>
<script src="/vue-router.js"></script>
<script src="/neovis.js"></script>
<script>
	var app;
	var socket = io();
	app = new Vue({
		el:'#app',
		data:{
			foo2:'aaa',
			typepoint:0,
			types:['信息查询','学者间关系','寻求推荐'],
			entitiespoint:0,
			entities:['学者','论文','机构','关键词'],
			recommendpoint:0,
			options:['学者','论文关键词','机构'],
			message1:'',
			message2:'',
			message3:'',
			tabledata:{},
			modaldata:{},
			type:'',
			unclick:true,
			frequency:[{
						id:231369,
						name:'Ronald L. Rivest'
					},{
						id:804905,
						name:'David E. Goldberg'
					},{
						id:1104146,
						name:'David E. Culler'
					},{
						id:591690,
						name:'Donald E. Knuth'
					},{
						id:502770,
						name:'John Hopcroft'}],
		},
		methods:{
			clickfrequency:function(name){
				$('.jumbotron').attr('style','padding-top:0px;height:200px;');
				this.unclick=false;
				this.typepoint = 0;
				this.message1 = name;
				this.searchsubmit();
			},
			searchsubmit:function(){
				$('.jumbotron').attr('style','padding-top:0px;height:200px;');
				this.unclick=false;
				var query;
				console.log(this.typepoint);
				if(this.typepoint == 0){
								socket.emit('searchroot',{
									type:this.typepoint,
									name:this.message1,
									rectype:this.entitiespoint
								});}
				if(this.typepoint == 1){

			        var config = {
			            container_id: "viz0",
			            server_url: "bolt://192.168.43.196:7687",
			            server_user: "neo4j",
			            server_password: "123456",
			            labels: {
			                "scholar": {
			                    "caption": "sname",
			                    "size": "sweight",
			                    "community": "fid"
			                }
			            },
			            relationships: {
			                "cooperate": {
			                    "thickness": "weight",
			                    "caption": false
			                }
			            },
			            initial_cypher: `match (start:scholar{sname:'${this.message2}'}),(end:scholar{sname:'${this.message3}'}),
										p=shortestpath((start)-[:cooperate*..10]-(end))
										return p
										`
			        };
			        viz = new NeoVis.default(config);
			        viz.render();
			        console.log(viz);
			        this.tabledata = {};
				}
				if(this.typepoint == 2){
								socket.emit('searchroot',{
									type:this.typepoint,
									name:this.message2,
									num:this.message3
								});

				}
			},
			idsubmit:function(mytype,myid){
				socket.emit('idroot',{
					type:mytype,
					id:myid
				});
			}


		}
	});
socket.on('searchroot',(data)=>{
	app.tabledata = data;
});
socket.on('idroot',(data)=>{
	app.modaldata = data.result;
	app.type=data.type;
	if(data.type =="学者"){
        var config = {
            container_id: "viz1",
            server_url: "bolt://192.168.43.196:7687",
            server_user: "neo4j",
            server_password: "123456",
            labels: {
                "scholar": {
                    "caption": "sname",
                    "size": "sweight",
                    "community": "fid"
                }
            },
            relationships: {
                "cooperate": {
                    "thickness": "weight",
                    "caption": false
                }
            },
            initial_cypher: `match (s1:scholar{sid:'${app.modaldata.id}'})-[r1:cooperate]-(s2:scholar)-[r2:cooperate]-(s3:scholar) return s1,s2,s3,r1,r2`
        };
        viz = new NeoVis.default(config);
        viz.render();
        console.log(viz);
        config.initial_cypher=`match(s1:scholar{sid:'${app.modaldata.id}'})-[r1:work_in]-(p:school)-[r2:work_in]-(s2:scholar) return s1,r1,p,r2,s2`;
        config.labels={
                "scholar": {
                    "caption": "sname",
                    "size": "sweight",
                    "community": "fid"
                },
                "school": {
                    "caption": "scname",
                }
        };
        config.relationships={
                "work_in": {
                    "thickness": "weight",
                    "caption": false
                }

        }
        config.container_id= "viz2",
        viz = new NeoVis.default(config);
        viz.render();
        console.log(viz);
	}
})
$("body").on('keyup',function(event){
        if(event.keyCode === 13){
        	$('#searchbutton').click();
            return;
        }

});

</script>
</body>
</html>
