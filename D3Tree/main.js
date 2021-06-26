fetch('./treedata.json')
    .then(function(resp){
        return resp.json();
    })
    .then(function(data){
        console.log(data)
        runFunction(data);
    });

function runFunction(jsondata)    {

    let rootNode = d3.hierarchy(jsondata, d=>d.children);

    let mouseX = 0;
    let buttonTracker = [];


    var pathLinks = rootNode.links();
    var updatePathLinks;
    var circleLinks = rootNode.descendants();
    var updateCircleLinks;
    var textLinks = rootNode.descendants();
    var updateTextLinks;


    let dim = {
        'width': window.screen.width,
        'height': window.screen.height*7,
        'margin':50
    };

    let svg = d3.select('#chart').append('svg')
                .style('background', 'black')
                .attrs(dim);

    document.querySelector('#chart').classList.add('center');


    let g = svg.append('g')
                .attr('transform', 'translate(140,50)');

    let layout = d3.tree().size([dim.height-50, dim.width-320]);
    
    layout(rootNode);
    //console.log(pathLinks);
     console.log(circleLinks);

    function update(data){


        let group =  g.selectAll('path')
            .data(data, (d,i) => d.target.data.name)
            .join(
            function(enter){
                return enter.append('path')
                            .attrs({
                                'd': d3.linkHorizontal()
                                .x(d => mouseX)
                                 .y(d => d.x),
                             'fill':'none',
                             'stroke':'white'
                            })
            },
            function(update){
                return update;
            },
            function(exit){
         
                    return exit.call(path => path.transition().duration(300).remove()
                                                        .attr('d', d3.linkHorizontal()
                                                                      .x(d => mouseX)
                                                                      .y(d =>d.x)));
            }
        
        
        )
        .call(path => path.transition().duration(1000).attr('d', d3.linkHorizontal()
                .x(d => d.y)
                 .y(d => d.x))
                 .attr("id", function(d,i){return "path"+i}));
        
        
        }
        update(pathLinks); 

    function updateCircles(data){
        g.selectAll('circle')
        .data(data, (d) => d.data.name)
        .join(
            function(enter){
                return enter.append('circle')
                            .attrs({
                                'cx':(d)=> mouseX,
                                'cy':(d) => d.x,
                                'r':12,
                                'fill':(d) => {
                                    return 'red'
                                },
                                'id': (d,i) =>d.data.name,
                                'class':'sel'                           
                            })
            },
            function(update){
                return update;
            },
            function(exit){
    
                return exit.call(path => path.transition().duration(300).remove()
                .attrs({
                    'cx':(d) =>mouseX,
                    'r':(d) => 0
                }));
    
            }
    
    
        )
        .call(circle => circle.transition().duration(1000).attr('cx', (d)=>d.y))
        
        .on('mouseover', function(d){
            d3.select(this)
                    .attrs({
                        'fill':'orange'
                    })
                    .transition().duration(100).attr('r', 16)
        })
        .on('mouseout', function(d){
            d3.select(this)
                .attr('fill', (d)=>{
                    return 'red'
                })
                .transition().duration(100).attr('r', 12)
        })
        .on('click', async function(d){

            let buttonId = d3.select(this)["_groups"][0][0]["attributes"].id.value;
            mouseX = d3.select(this)["_groups"][0][0]["attributes"].cx.value;

            let checkButtonExist = buttonTracker.filter(button =>button.buttonId ==buttonId);

            if(checkButtonExist[0]!=undefined) {
                buttonTracker = buttonTracker.filter(button=>button.buttonId!=buttonId);

                pathLinks = checkButtonExist[0].buttonPathData.concat(pathLinks);
                update(pathLinks);

                //handle circle update
                circleLinks = checkButtonExist[0].buttonCircleData.concat(circleLinks);
                updateCircles(circleLinks);

                //handle text update
                textLinks = checkButtonExist[0].buttonTextData.concat(textLinks);
                updateText(textLinks);
                return;
                
            }
            var valueArray = await processedlinks(d.links());
          

            updatePathLinks = pathLinks.filter(function(item){
                    return !valueArray.includes(item.target.data.name);
            });

            var clickedPathData = pathLinks.filter(function(item){
                return valueArray.includes(item.target.data.name);
            });

            updateCircleLinks = circleLinks.filter(function(item){
                return !valueArray.includes(item.data.name);
            });

            var clickedCircleData = circleLinks.filter(function(item){
                return valueArray.includes(item.data.name);
            });

            updateTextLinks = textLinks.filter(function(item){
                return !valueArray.includes(item.data.name);
            });

            var clickedTextData = textLinks.filter(function(item){
                return valueArray.includes(item.data.name);
            })

            
            buttonTracker.push({
                buttonId:buttonId,
                buttonPathData:clickedPathData,
                buttonCircleData:clickedCircleData,
                buttonTextData:clickedTextData
            })

            update(updatePathLinks);
            updateCircles(updateCircleLinks);
            updateText(updateTextLinks);

            async function processedlinks(dlinks) {
                var valueArray = [];
         
                    return new Promise((resolve, reject)=>{
                          dlinks.forEach(async(element) =>{
                               valueArray.push(element.target.data.name); 
                          });
                          resolve(valueArray);      
                    });
                }

                pathLinks = updatePathLinks;
                circleLinks = updateCircleLinks;
                textLinks = updateTextLinks;

            });
        }                     
                
    updateCircles(circleLinks); 


            
    function updateText(data) {
        g.selectAll('text')
            .data(data, (d)=>d.data.name)
            .join(
                    function(enter){
                        return enter.append('text')
                                    .attrs({
                                        'x':(d) =>mouseX,
                                        'y':(d) =>d.x,
                                        'font-size':0
                                    })
                                    .text((d) =>d.data.name)
                    },
                    function(update){
                        return update;
                    },
                    function(exit){
                        return exit.call(text =>text.transition().duration(300).remove().attrs({
                            'x':(d)=>mouseX,
                            'font-size':0
                        }))
                    }
                )
                .call(text =>text.transition().duration(1000).attrs({
                        'x':(d) =>d.y +20,
                        'font-size':15,
                        'fill':'yellow',                        
                }));
    }
    updateText(textLinks);

}

   