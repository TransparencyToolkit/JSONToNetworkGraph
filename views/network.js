
var width = $(document).width();
var height = $(document).height();
	    var dataset;

	    d3.selection.prototype.putOnTop = function(){
                return this.each(function(){
                     this.parentNode.appendChild(this);
                });
            };
            d3.selection.prototype.putOnTopLinks = function(lline){
                return this.each(function(){
                     this.parentNode.insertBefore(this, lline);
                });
            };
 
            d3.selection.prototype.putUnderneath = function(fnode){
                return this.each(function(){
                      this.parentNode.insertBefore(this, fnode);
                });
            };

	    var zoom = d3.behavior.zoom()
                         .scaleExtent([1, 10])
                         .on("zoom", function(){
                              svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
                         });

	    var svg = d3.select("body")
                        .append("svg")
                        .attr("width", "75%")
                        .attr("height", "93%")
                        .style("padding", "10px")
                        .style("border-radius", "1px")
                        .style("border-color", "#52B7D0")
                        .style("border-style", "solid")
                        .call(zoom);

	    d3.json("network2.json", function(error, data){
	        dataset = data;
                var nodecount = 0;
	        
	        var force = d3.layout.force()
	                             .nodes(data.nodes)
	                             .links(data.links)
                                     .size([width, height])
                                     .linkDistance([200])
                                     .charge([-200])
                                     .start();

                var node_drag = d3.behavior.drag()
                                  .on("dragstart", dragstart)
                                  .on("drag", dragmove)
                                  .on("dragend", dragend);

                function dragstart(d, i){
                    d3.event.sourceEvent.stopPropagation();
                    force.stop();
                }

                function dragmove(d, i){
                    d.px += d3.event.dx;
                    d.py += d3.event.dy;
                    d.x += d3.event.dx;
                    d.y += d3.event.dy;
                    tick();
                }

                function dragend(d, i){
                   d.fixed = true;
                   tick();
                   force.resume();
                }

	        var links = svg.selectAll("line")
                               .data(data.links.filter(function(d){
                                   return d.lowestLinkCount > 0;
                               }))
                               .enter()
                               .append("line")
                               .style("stroke", "#ccc")
                               .style("stroke-width", function(d){
                                   if(d.data.length > 10){
                                     var add = 11;
                                   } else {
                                     var add = d.data.length;
                                   }
                                   return add;
                               });

	        var nodes = svg.selectAll("circle")
                               .data(data.nodes.filter(function(d){
                                   return d.linkcount > 0;
                               }))
                               .enter()
                               .append("circle")
                               .attr("r", function(d){
                                   if(d.data.length > 10){
                                       var add = 11;
                                   } else {
                                       var add = d.data.length;
                                   }
                                   return 5 + add;
                               })
                               .style("fill", function(d){
                                   if(d.type === "company"){
                                       return "#0000CC";
                                   } else {
                                       return "#CC0000";
                                   }
	                       })
                               .style("stroke", "#000000")
                               .style("stroke-width", 3)
                               .attr("id", function(d){
                                   return d.id;
                               })
	                       .call(node_drag);

	                       
	                       nodes.on("mouseover", function(d){
                                   d3.select(this)
                                     .style("stroke", "#E89619")
                                     .putOnTop();
                                   
	                           links.filter(function(e){
                                      if((e.field1 == d.name) || (e.field2 == d.name)){
	                                  d3.select(this)
                                            .style("stroke", "#E89619")
                                            .putOnTopLinks(links[0][links[0].length-1])
                                            .style("stroke-width", function(b){
	                                        if(b.data.length > 10){
                                                   var add = 11;
                                                } else {
                                                   var add = b.data.length;
                                                }
                                                
                                                return add*2;
                                            });
                                         
                                          nodes.filter(function(f){
                                             if((e.field1 == f.name) || (e.field2 == f.name)){
                                                d3.select(this)
                                                  .style("stroke", "#E89619")
                                                  .putOnTop();
                                             }
                                          });
                                          return e;
	                              }
                                   });
	                            
	                           d3.select("#tooltip")
                                     .style("left", d3.event.pageX+"px")
	                             .style("top", d3.event.pageY+"px")
                                     .select("#content")
                                     .text(d.name);

	                           d3.select("#tooltip")
                                     .classed("hidden", false)
                                     .putOnTop();
                               })
                               .on("mouseout", function(d){
                                   d3.select(this)
                                     .style("stroke", "#000000");

	                        links.filter(function(e){
                                    if((e.field1 == d.name) || (e.field2 == d.name)){
                                          d3.select(this)
                                            .style("stroke", "#ccc")
                                            .putUnderneath(links[0][0])
                                            .style("stroke-width", function(b){
                                                if(b.data.length > 10){
                                                   var add = 11;
                                                } else {
                                                   var add = b.data.length;
                                                }

                                                return add;
                                            });
    
                                          nodes.filter(function(f){
                                             if((e.field1 == f.name) || (e.field2 == f.name)){
                                                d3.select(this)
                                                  .style("stroke", "#000000");
                                             }
                                          });
                                          return e;
                                      }
                                   });

	                           d3.select("#tooltip").classed("hidden", true);
	                       })
	                       .on("click", function(d){
                                    var output = "<h2>" + d.name + "</h2>";
	                            for(var z = 0; z < d.data.length; z++){
                                       output = output + genItem(d, z);
                                    }
                                    
	                            d3.select("#info")
                                      .select("#gentext")
                                      .html(output);
                                    checkDuplicate = [];
                               });

                // Generate items to show in sidebar and check for duplicates
                var checkDuplicate = [];
                function genItem(d, z){ 
                   if(d.type == "company"){
                        var title = d.data[z]["name"];
                   } else {
                        var title = d.data[z]["company"];
                   }
                   
                   // Generate HTML for each item
                   var item = "";
                   for(var a in d.data[z]){
                      var label = a + ": ";
                      item = item + label.bold() + d.data[z][a] + "<br />";
                   }

                   if(!deDuplicate(item)){
                      return "<h5>" + title + "</h5>" + item + "<br />";         
                   } else {
                      return "";
                   }
                 }

               // Checks items for duplicates
               function deDuplicate(item){
                   for(var j = 1; j <= checkDuplicate.length; j++){
                      if(checkDuplicate[j] === item){
                         return true;
                      }
                   }
                   checkDuplicate.push(item);
                   return false;
                }
                
                $(document).ready(function(){
	            $("#search").keyup(function(){
                        var searchterm = $(this).val();
                        var output = "";
                        nodes.filter(function(d){
			    for(var z = 0; z < d.data.length; z++){
                               var foundflag = 0;                      
			       for(var a in d.data[z]){
			          if(d.data[z][a]){
                                     if((d.data[z][a].toString()).search(new RegExp(searchterm, "i")) != -1){
				        foundflag = 1;
                                     }
			          }
                               }

                               if(foundflag == 1 && searchterm.length > 2){
                                  if(d["name"].toUpperCase() === searchterm.toUpperCase()){
                                     d3.select(this)
                                       .style("fill", "#00CC00");
                                  } else {
                                     d3.select(this)
                                       .style("fill", "#E89619");
                                  }
                                  output = output + genItem(d, z);              
                               } else {
			          d3.select(this)
                                    .style("fill", function(g){
                                        if(g.type == "company"){      
                                            return  "#0000CC";    
                                        } else {
                                            return "#CC0000"; 
                                        }
                                    });
                               }
		            }
                        });

                       if(output != ("")){
                            d3.select("#info")	
		              .select("#gentext")
                              .html("<h2>" + searchterm + "</h2>" + output);
                            checkDuplicate = [];
                       }              
                    });

                   });
           
                function collide(a){
                    var quadtree = d3.geom.quadtree(nodes);
                    return function(d){
                        if(d.linkcount > 10){
                            var radius = 11;
                        } else {
                            var radius = d.linkcount;
                        }
                        var maxRadius = 11;
			var padding = 1.5;
                        var r = radius + maxRadius + padding;
                        var nx1 = d.x - r,
                            nx2 = d.x + r,
                            ny1 = d.y - r,
                            ny2 = d.y + r;
                        
                        quadtree.visit(function(quad, x1, y1, x2, y2){
                             if(quad.point && (quad.point !== d)){
                                var x = d.x - quad.point.x,
                                    y = d.y - quad.point.y,
                                    l = Math.sqrt(x*x+y*y);
                                          
                                if(quad.point.linkcount > 10){
                                     var quadradius = 11;
                                } else {
                                     var quadradius = quad.point.linkcount;
                                }

                                r = radius + quadradius;

	                        if(l < r){
                                    l = (l-r) / l*a;
                                    d.x -= x *= l;
                                    d.y -= y *= l;
                                    quad.point.x += x;
                                    quad.point.y += y;
                                }
                             }
                             return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
                        });
                    };
                }

	        force.on("tick", tick);
                function tick() {
                   links.attr("x1", function(d) { return d.source.x; })
                        .attr("y1", function(d) { return d.source.y; })
                        .attr("x2", function(d) { return d.target.x; })
                        .attr("y2", function(d) { return d.target.y; });

                   nodes.each(collide(.5))
                        .attr("cx", function(d) { return d.x; })
                        .attr("cy", function(d) { return d.y; });
                }
	    });