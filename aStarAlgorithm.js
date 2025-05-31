let playOn = false;
let speed = 1;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function aStarAlgorithm(start, end, columns, rows) {

  if (!playOn) {return}
  
  const startingNode = {index:start, h:blendedHeuristic(start,end,columns,0),h2:euclideanDistanceCalculator(start,end,columns), g:0,i:manhattanDistanceCalculator(start,start,columns),i2:euclideanDistanceCalculator(start,start,columns),parent:null};
  let nodesToExplore = [startingNode];
  let exploredNodes = [];
  let counter = 0;

  let currentNode = nodesToExplore[0];
  let newNode;
  while (currentNode.index !== end) {
    if (!playOn) {return}
    if (nodesToExplore.length === 0) {return}
    const neighborsIndex = [currentNode.index-columns,currentNode.index+1,currentNode.index+columns,currentNode.index-1]
    exploredNodes.push(nodesToExplore.shift());
    colorNodes(`rgb(${220-((40/startingNode.h)*(currentNode.g/startingNode.h)+100)} ${220-((60/startingNode.h)*currentNode.g+70)} 235)`, currentNode.index, columns);
    counter++;
    for (neighborNodeIndex of neighborsIndex) {
      

      if (neighborNodeIndex < 0 || neighborNodeIndex >= columns*rows || ((currentNode.index%columns !== neighborNodeIndex%columns)&&(Math.floor(currentNode.index/columns) !== Math.floor(neighborNodeIndex/columns)))) {continue}

      let stateQuad = squaresStatesArray[Math.floor(neighborNodeIndex/4)];
      let neighborNodeState = (stateQuad & (0b11 << (2*(neighborNodeIndex%4)))) >> (2*(neighborNodeIndex%4));
      
      if (neighborNodeState === 0b11 || exploredNodes.find(n => n.index === neighborNodeIndex)) {continue}
      
      let existingNode = nodesToExplore.find(n => n.index === neighborNodeIndex)
      if (existingNode) {
        if (existingNode.g > currentNode.g+1) {
          existingNode.g = currentNode.g+1;
          existingNode.parent = currentNode;
          nodesToExplore = nodesToExplore.filter(n => n.index !== existingNode.index);
          insertNodeSortedByCost(existingNode,nodesToExplore,start, end, columns, rows,counter);
        }
      } else {
        newNode = {index:neighborNodeIndex, h:blendedHeuristic(neighborNodeIndex,end,columns,0),h2:euclideanDistanceCalculator(neighborNodeIndex,end,columns),g:currentNode.g+1,i:manhattanDistanceCalculator(neighborNodeIndex,start,columns), i2:euclideanDistanceCalculator(neighborNodeIndex,start,columns), parent:currentNode};
        insertNodeSortedByCost(newNode,nodesToExplore,start, end, columns, rows,counter);
        colorNodes(`rgb(${225 - ((40/startingNode.h)*currentNode.h+55)} ${225-((40/startingNode.h)*currentNode.g+43)} 230)`, neighborNodeIndex, columns);
      }
    }
    currentNode = nodesToExplore[0];

    if (!speed) {
      if (counter%2) {
        await delay(0);
      }
    } else {
      await delay(((22*(65/(columns+55)))*1.5)*speed);
    }
    
  }
  let path = traceParentsBack(currentNode)
  
  for (nodeToColor of path) {
    if (!playOn) {return}
    await delay(22*(65/(columns+55)))
    colorNodes(`rgb(${90+((180/path.length)*nodeToColor.g)} ${250-((180/path.length)*nodeToColor.g)} 160)`, nodeToColor.index, columns)
  }
}

function manhattanDistanceCalculator(currentNodeIndex, endNodeIndex, columns) {
  const currentNodeX = currentNodeIndex%columns;
  const currentNodeY = Math.floor(currentNodeIndex/columns);
  const endNodeX = endNodeIndex%columns;
  const endNodeY = Math.floor(endNodeIndex/columns);
  
  return Math.abs(endNodeX-currentNodeX)+Math.abs(endNodeY-currentNodeY)
}

function euclideanDistanceCalculator(currentNodeIndex, endNodeIndex, columns) {
  const currentNodeX = currentNodeIndex%columns;
  const currentNodeY = Math.floor(currentNodeIndex/columns);
  const endNodeX = endNodeIndex%columns;
  const endNodeY = Math.floor(endNodeIndex/columns);

  return ((endNodeX-currentNodeX)**2 + (endNodeY-currentNodeY)**2)**(1/2)
}

function blendedHeuristic(current, goal, columns, weight = 0.5) {
  const dx = Math.abs((goal % columns) - (current % columns));
  const dy = Math.abs(Math.floor(goal / columns) - Math.floor(current / columns));

  const manhattan = dx + dy;
  const euclidean = Math.sqrt(dx ** 2 + dy ** 2);

  return weight * euclidean + (1 - weight) * manhattan;
}


function edgeBias(nodeIndex, start, end, columns) {
  const x = nodeIndex % columns;
  const y = Math.floor(nodeIndex / columns);
  const sx = start % columns;
  const sy = Math.floor(start / columns);
  const ex = end % columns;
  const ey = Math.floor(end / columns);

  const minX = Math.min(sx, ex);
  const maxX = Math.max(sx, ex);
  const minY = Math.min(sy, ey);
  const maxY = Math.max(sy, ey);

  const distToXEdge = Math.min(Math.abs(x - minX), Math.abs(x - maxX));
  const distToYEdge = Math.min(Math.abs(y - minY), Math.abs(y - maxY));

  return Math.min(distToXEdge, distToYEdge); // Lower is better
}



function insertNodeSortedByCost(node, array, startIndex, endIndex, columns, rows, count = 0) {
  const node_f_cost = node.g + node.h;
  let index = 0;

  for (; index < array.length; index++) {
    const arrayNode = array[index];
    const array_node_f_cost = arrayNode.g + arrayNode.h;

    const nodeBias = edgeBias(node.index, startIndex, endIndex, columns);
    const arrayNodeBias = edgeBias(arrayNode.index, startIndex, endIndex, columns);
    
    if (node_f_cost < array_node_f_cost || (node_f_cost === array_node_f_cost && (node.h2 <= arrayNode.h2))){break}

    //if (node_f_cost < array_node_f_cost || (node_f_cost === array_node_f_cost && (nodeBias < arrayNodeBias))){break}
      
      //(node.h < arrayNode.h || (node.h === arrayNode.h && node.h2 <= arrayNode.h2)))) {break}

    //if (node_f_cost < array_node_f_cost || (node_f_cost === array_node_f_cost &&  {"0":node.h < arrayNode.h, "1":node.h+node.i <= arrayNode.h+arrayNode.i}[count%2])) {break}
  }
  if (index === array.length) {
  array.push(node);
  } else {
    array.splice(index, 0, node);
  }
}

function traceParentsBack(node) {
  let nodeParent = node.parent;
  let path = [];
  while (nodeParent) {
    path.push(nodeParent);
    nodeParent = nodeParent.parent
  }
  return path
}

function colorNodes(color, nodeIndex, columns) {
  if (!playOn) {return}
  if (nodeIndex === startIndex || nodeIndex === endIndex) {return}
  ctx.fillStyle = color;

  let nodeXPosition = nodeIndex%columns;
  let nodeYPosition = Math.floor(nodeIndex/columns)

  ctx.clearRect(horizontalShift+(nodeXPosition*(squareSize+1))-1,verticalShift+(nodeYPosition*(squareSize+1))-1,squareSize+2,squareSize+2);
  ctx.fillRect(horizontalShift+(nodeXPosition*(squareSize+1)),verticalShift+(nodeYPosition*(squareSize+1)),squareSize,squareSize);
}