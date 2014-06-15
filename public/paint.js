var paintModule = (function() {


      var width = window.innerWidth, height = 700, userName = null;

      var x = d3.scale.linear()
                .domain([0, width])
                .range([0, width]);

      var y = d3.scale.linear()
                .domain([0, height])
                .range([height, 0]);


      var container = d3.select('#container')
                        .style({
                          "background-color": "#eee",
                          "width" : width + "px",
                          "height" : height + "px"
                        });

      var svg = container
                  .append("svg")
                  .attr({
                      width: width,
                      height: height,
                      enabled: false
                    });

      svg.append('svg:defs').append('svg:marker')
          .attr('id', 'end-arrow')
          .attr('viewBox', '0 -5 10 10')
          .attr('refX', 6)
          .attr('markerWidth', 3)
          .attr('markerHeight', 3)
          .attr('orient', 'auto')
        .append('svg:path')
          .attr('d', 'M0,-5L10,0L0,5')
          .attr('fill', '#000');
       
      svg.append('svg:defs').append('svg:marker')
          .attr('id', 'start-arrow')
          .attr('viewBox', '0 -5 10 10')
          .attr('refX', 4)
          .attr('markerWidth', 3)
          .attr('markerHeight', 3)
          .attr('orient', 'auto')
        .append('svg:path')
          .attr('d', 'M10,-5L0,0L10,5')
          .attr('fill', '#000');

      var groups = {};

      var paths_data = [];

      var mousedown_path = null;

      var drag_line = null;

      var mousedown = false;
      var mousedown_node = {};

      function resetDragLine(){
          if(drag_line)
            drag_line.remove();

          drag_line = svg.append('svg:path')
          .attr('class', 'link dragline hidden')
          .attr('d', 'M0,0L0,0');      
      }

      function addUser(user){
          userName = user.userName;
          paths_data.push(user);
          console.log(paths_data);
      }

      function addNewUser(user){
          paths_data.push(user);

          renderGroups();
      }

      function init(data){
          paths_data = data;

          resetDragLine();
          renderGroups();       
      }

      function filterBy(value){

          if(value === 'all'){
              groups.style("display", "initial");
          }else{
              groups.style("display", function(d,i) { return d.userName === value ? "initial" : "none"; })
          }

      }

      function renderGroups(){

        groups = svg.selectAll("g")
                        .data(paths_data);

        // ENTER GROUPS
        groups = groups.enter()
                      .append("g")
                      .style("stroke", function(d,i){ return d.color; })
                      .attr("id", function(d) { return "group-" + d.userName; });

          renderPaths();
      }

      function renderPaths(){

        groups = svg.selectAll("g")
                      .data(paths_data);

                  // ENTER PATHS
        groups.selectAll("path")
                      .data(function(d,i,j){ return d.path})
                      .enter()
                      .append("path")
                      .attr('class', 'link')
                      .style('stroke-width', function(d,i){ return 1 + 'px'; })
                      .attr("d", function(d,i) { return d; }); 
      }

      function addLine(data){

          paths_data.forEach(function(element, i){
              if(element.userName === data.userName){
                element.path.push(data.data);
              }
          })

          renderGroups();

      }

      function registerEvents(sendToServer){

          d3.select("#clear").on('click', function(){
              paths_data = [];
               groups.data(paths_data).exit().remove();

               sendToServer({ type : "remove", data : {} });
          });

          svg.on('mousedown', function(){

              if(!mousedown_path){

                  mousedown = true;

                  // Extract the click location\    
                  var point = d3.mouse(this)
                  , p = {x: point[0], y: point[1] };

                  mousedown_node.x = p.x;
                  mousedown_node.y = p.y;

                drag_line
                  .style('marker-end', 'url(#end-arrow)')
                  .style('stroke', "#000")
                  .classed('hidden', false)
                  .attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + mousedown_node.x + ',' + mousedown_node.y);
            }
          })


          svg.on('mousemove', function(){

              if(!mousedown) { return; }

              if(!mousedown_path){          
                var point = d3.mouse(this)
                , p = {x: point[0], y: point[1] };


                drag_line.attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);
              }
          })

          // NEW LINE
          svg.on('mouseup', function(){

            if(!mousedown_path){
              mousedown = false;

              var suc = false;

              paths_data.forEach(function(element,i){

                  if(element.userName == userName){
                      console.log(element);
                      element.path.push(drag_line.attr("d"));
                      suc = true;
                  }
              });

              // New Path
              sendToServer({ type: "line", userName: userName, data : drag_line.attr("d") });
                
              resetDragLine();
              renderGroups();
            }
            else{
              mousedown_path = false;          
            }
          })
      }

      return {
        init: init,
        registerEvents: registerEvents,
        addUser : addUser,
        filterBy: filterBy,
        addNewUser : addNewUser,
        addLine : addLine
      };

  })();
