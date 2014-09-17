// https://www.health.ny.gov/health_care/medicaid/redesign/dsrip_performance_data/
// Generic Dashboar with real-time analytics of DSRIP data sources
// we'll use this exercise to advance the analytics environment

openHealth.getScript(["https://cdnjs.cloudflare.com/ajax/libs/d3/3.4.11/d3.min.js","https://www.google.com/jsapi","https://square.github.io/crossfilter/crossfilter.v1.min.js","https://dc-js.github.io/dc.js/js/dc.js"],function(){ // after satisfying d3 dependency

dsrip=(function(){
    var y={ // dsrip object returned at the end
        dt:{},
    }
    //prepare stout
    var println = openHealth.log;
    var divLog = openHealth.createLog(); // creates div for html printout
    var divD3 = document.createElement('div');divD3.id="openHealthD3";
    var divStat = document.createElement('div');divStat.id="openHealthStat";
    document.getElementById("openHealth").appendChild(divD3);
    document.getElementById("openHealth").appendChild(divStat);
    println('<h4 style="color:blue">DSRIP dashboard<h4>');
    println("Let's query all [SODA](http://dev.socrata.com/consumers/getting-started.html) data sources listed by [DSRIP](https://www.health.ny.gov/health_care/medicaid/redesign/dsrip_performance_data/) and see what we get.");
    //list DSRIP data sources
    var D = Object.getOwnPropertyNames(openHealth.sodaData);
    var j=0;
    for(var i=D.length-1;i>=0;i--){
        if(!D[i].match('DSRIP')){
            D.splice(i,1);
        } else {
            var Lid = String.fromCharCode(65+j);
            println('<button style="color:navy" onclick="dsrip.dataButton(this)">'+Lid+'</button> ['+D[i]+']('+openHealth.sodaData[D[i]]+')');
            y.dt[Lid]={
                title:D[i],
                url:openHealth.sodaData[D[i]],
                selected:false
            }
            j++;
        }
    }
    
    y.dataButton=function(bt){
        var dt = dsrip.dt[bt.textContent];
        if(dt.bt){dt.bt = bt}; // button just pressed
        if(!dt.selected){dt.selected=true}else{dt.selected=false} // switch
        if(dt.selected){ // data selected for processing?
            bt.style.color="red";
            bt.style.backgroundColor="yellow";
            var fun = function (x){
                dt.attr=Object.getOwnPropertyNames(x[0]); // attributes
                dsrip.dtSelected=bt.textContent;
                dsrip.updateDash(); // update D3 forced graph dashboad
                dsrip.updateStat(); // update statistical analysis
            }
            openHealth.soda2(dt.url,{limit:1},fun)
        } else {
            bt.style.color="green"
            bt.style.backgroundColor="CCFF99";
            dsrip.updateDash();
        }
    }
    
    y.updateDash=function(){
        document.getElementById("openHealthD3").innerHTML=""; // reset
        //document.getElementById("openHealthD3").parentElement.removeChild(document.getElementById("openHealthD3"))
        //var divD3 = document.createElement('div');divD3.id="openHealthD3";document.getElementById("openHealth").appendChild(divD3);
        //var dt = dsrip.dt[id];
        //if(!dsrip.graph){dsrip.graph={nodes:[],links:[]}} 
        dsrip.graph={nodes:[],links:[]};
        var getNodeInd = function(nodeName){
            var ind = dsrip.graph.nodes.length; // new node
            dsrip.graph.nodes.map(function(n,i){
                if(n.name==nodeName){ind=i}
            })
            return ind;
        }
        // screen all sources
        for(var id in dsrip.dt){ 
            var dt = dsrip.dt[id];
            if(dsrip.dt[id].selected){    
                var i0 = getNodeInd(id)
                dsrip.graph.nodes[i0]={name:id,group:1,r:20,Lx:-6,Ly:0,Lcolor:"yellow",Lsize:20};
                // add attributes and links
                for(var j = 0 ; j<dt.attr.length ; j++ ){
                    var i = getNodeInd(dt.attr[j]);
                    dsrip.graph.nodes[i]={name:dt.attr[j],group:2,r:5,Lx:7,Ly:0,Lcolor:"black",Lsize:12}
                    dsrip.graph.links.push({"source":i0,"target":i,"value":1})
                }
            }
        }
        
        
        var graph=dsrip.graph;
        4
        var width = 960,height = 700;
        var color = d3.scale.category20();
        var force = d3.layout.force()
            .charge(-120)
            .linkDistance(100)
            .size([width, height]);
        var svg = d3.select(document.getElementById("openHealthD3")).append("svg")
            .attr("width", width)
            .attr("height", height)
            
        force
            .nodes(graph.nodes)
            .links(graph.links)
            .start();
    
    
        var link = svg.selectAll(".link")
          .data(graph.links)
          .enter().append("line")
          .attr("class", "link")
          .style("stroke-width", function(d) { return Math.sqrt(d.value); });
      
      // Create the groups under svg
        var gnodes = svg.selectAll('g.gnode')
          .data(graph.nodes)
          .enter()
            .append('g')
            .classed('gnode', true);

      // Add one circle in each group
        var node = gnodes.append("circle")
          .attr("class", "node")
          .attr("r", function(d) { return d.r})
          .style("fill", function(d) { return color(d.group); })
          .call(force.drag);

      // Append the labels to each group
        var labels = gnodes.append("text")
          .attr("x", function(d) { return d.Lx; })
          .attr("dy", ".35em")
          .text(function(d) { return d.name; })
          .attr("fill",function(d) { return d.Lcolor; })
          .attr("font-size", function(d) { return d.Lsize });

        force.on("tick", function() {
          // Update the links
          link.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

          // Translate the groups
          gnodes.attr("transform", function(d) { 
            return 'translate(' + [d.x, d.y] + ')'; 
          });    
        });
        
        jQuery('.node').css('stroke','navy')
        jQuery('.node').css('stroke-width','1.5px')
        jQuery('.link').css('stroke','#999')
        jQuery('.link').css('stroke','.6')
        
        
  
        4
    }
    
    y.updateStat=function(){
        console.log('updateStat of "'+dsrip.dtSelected+'"');
        var dt = dsrip.dt[dsrip.dtSelected];
		dt.ind=dsrip.dtSelected;
        //openHealth.soda2(dt.url,{limit:1},fun)
        var div = document.getElementById("openHealthStat");
        div.innerHTML='<h4>Stats, Navigating '+dsrip.dtSelected+':</h4><span style="color:green"><b>'+dt.title+'</b></span><br>(note: for now analysis sampling only up to 10,000 patients at a time; should everybody always be counted or is resampling good enough?)<table id=statsTable></table>';
        var fun = function(x){
			var dti=dt;
			var cf = crossfilter(dti.docs); // crossfilter started
            // layoit statsTable
			var n = Math.ceil(Math.sqrt(dti.attr.length));
			var tb = document.getElementById('statsTable');
			var tbody = document.createElement('tbody');
			tb.appendChild(tbody);
			for(var i=0;i<n;i++){
				var tr = document.createElement('tr');
				tbody.appendChild(tr);
				for(var j=0;j<n;j++){
					var ij=i*n+j;
					var att = dti.attr[ij];
					var td = document.createElement('td');
					tr.appendChild(td);
					if(ij<dti.attr.length){
						//td.textContent=ij+':('+i+','+j+'):'+dti.attr[ij];
						td.innerHTML='<p style="color:navy">'+dti.ind+'.'+(ij+1)+':'+dti.attr[ij]+'</p>';
						td.id='statsTable_'+(ij+1);
						if(att.match('year')){ // plot a pie chard
							var plotDiv = document.createElement('div');
							plotDiv.id='plotDiv_'+att
							plotDiv.textContent=plotDiv.id;						
							td.appendChild(plotDiv);
							// bake the pie
							var pieYear = dc.pieChart('#'+plotDiv.id);
							var yearDim = cf.dimension(function (d){
									return d[att]
								});
							var yearGroup = yearDim.group();
							
							pieYear
								.width(250)
								.height(220)
								.radius(100)
								.innerRadius(30)
								.dimension(yearDim)
								.group(yearGroup)
								.title(function(d){return d[att]});
							
							
							4
						}
					}
					
				}
			}
			dc.renderAll();
			
        }
        if(!dt.docs){
            openHealth.soda2(dt.url,{'limit':10000},function(x){
                dt.tab = openHealth.docs2tab(x)
                dt.docs = openHealth.tab2docs(dt.tab)
                fun(x);
            })
        } else { fun()}
        
            
        
        
        
    }
    
    return y
})();

});