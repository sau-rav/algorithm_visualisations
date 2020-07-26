var size, ptr, obstacleSize;
var obstacleMatrix, start, end, visited, queue, visitedMap, dw, dh, flag;
var search, path_found, path_not_found;
var finalPoint, tempPoint, tempLen, tempPath;

function setup() {
  size = 600;
  obstacleSize = 12;
  createCanvas(size, size+70);
  noStroke();
  flag = 0; search = false; path_found = false; path_not_found = false;
  ptr = 0; obstacleMatrix = []; start = []; end = []; visited = []; queue = [];
  dw = [obstacleSize, -obstacleSize, 0, 0];
  dh = [0, 0, obstacleSize, -obstacleSize];
  
  visitedMap = new Array(size/obstacleSize);
  for(let i = 0; i < visitedMap.length; i++) 
    visitedMap[i] = new Array(size/obstacleSize);
  for(let i = 0; i < size/obstacleSize; i++)
    for(let j = 0; j < size/obstacleSize; j++) visitedMap[i][j] = 0;
  
  for(let i = 0; i < size; i += obstacleSize){
    for(let j = 0; j < size; j += obstacleSize){
      var val = random();
      if(val > 0.70){
        obstacleMatrix.push([i, j]);
        visitedMap[i/obstacleSize][j/obstacleSize] = 2;
      }
    }
  }
}

function distToEnd(x, y){
  var dist = abs(end[0]-x)+abs(end[1]-y);
  return dist;
}

class Point{
  constructor(a, b, p, gval, hval){
    this.x = a;
    this.y = b;
    this.gvalue = gval;
    this.hvalue = hval;
    this.value = gval + hval;
    this.path = p;
  }
  appendToPath(val){
    this.path.push(val);
  }
  dispActive(){
    if(!(this.x == end[0] && this.y == end[1])){
      push();
      fill(255, 51, 0); // yellow for actives
      rect(this.x, this.y, obstacleSize, obstacleSize);
      pop();
    }
  }
  dispVisited(){
    if(!(this.x == end[0] && this.y == end[1])){
      push();
      fill(200);
      rect(this.x, this.y, obstacleSize, obstacleSize);
      pop();
    }
  }
  showPath(){
    for(var i = 1; i < this.path.length; i++){
      if(!(this.path[i][0] == end[0] && this.path[i][1] == end[1])){
        push();
        fill(51, 153, 255); // light blue for path
        rect(this.path[i][0], this.path[i][1], obstacleSize, obstacleSize);
        pop();
      }
    }
  }
}

function drawBoard(){
  for(var i = 0; i < obstacleMatrix.length; i++){
    fill(0);
    rect(obstacleMatrix[i][0], obstacleMatrix[i][1], obstacleSize, obstacleSize);
  }
}

function showStartEnd(){
  if(start.length > 0){
    push();
    fill(0, 255, 0);
    rect(start[0], start[1], obstacleSize, obstacleSize);
    pop();
  }
  if(end.length > 0){
    push();
    fill(0, 255, 0);
    rect(end[0], end[1], obstacleSize, obstacleSize);
    pop();
  }
}

function isObstacle(vect){
  for(var i = 0; i < obstacleMatrix.length; i++)
    if(obstacleMatrix[i][0] == vect[0] && obstacleMatrix[i][1] == vect[1]) return true;
  return false;
}

function mouseClicked(){
  if(flag == 0){
    start[0] = mouseX-mouseX%obstacleSize; start[1] = mouseY-mouseY%obstacleSize;
    if(!isObstacle(start) && mouseX >= 0 && mouseX <= size && mouseY >= 0 && mouseY <= size){
      flag += 1;
    }
    else start = [];
  }
  else if(flag == 1){
    end[0] = mouseX-mouseX%obstacleSize; end[1] = mouseY-mouseY%obstacleSize;
    if(!isObstacle(end) && mouseX >= 0 && mouseX <= size && mouseY >= 0 && mouseY <= size){
      flag += 1;
    }
    else end = [];
  }
  else if(flag == 3){
    if(mouseX >= size/2-45 && mouseX <= size/2+45 && mouseY >= size+10 && mouseY < size+35){
      search = true;
      flag = 4;
    }
  }
  else if(flag == 4){
    if(mouseX >= size/2-45 && mouseX <= size/2+45 && mouseY >= size+10 && mouseY < size+35){
      if(!search) setup();
    }
  }
}

function startProcess(){
  flag = 3;
  queue.push(new Point(start[0], start[1], [[start[0], start[1]]], 0, 0));
}

function showVisitedAndActive(){
  for(let i = 1; i < visited.length; i++){
    visited[i].dispVisited();
  }
  for(let i = 0; i < queue.length; i++){
    queue[i].dispActive(); 
  }
}

function dispStart(){
  push();
  fill(200);
  rect(size/2-45, size + 10, 90, 25); fill(0); textSize(20);
  text("Start", size/2-27, size+27);
  pop();
}

function presentInQueue(score, width, height){
  var lenQ = queue.length;
  for(var i = 0; i < lenQ; i++){
    if(queue[i].x == width && queue[i].y == height){
      if(queue[i].gvalue > score) queue[i].gvalue = score;
      return true;
    }
  }
  return false;
}

function removeFromQueue(idx){
  queue.splice(idx, 1);
}

function draw() {
  background(255);
  drawBoard();
  showStartEnd();
  if(path_found){
    finalPoint.showPath();
    push();
    fill(200);
    rect(size/2-45, size + 10, 90, 25); fill(0); textSize(20);
    text("Reset", size/2-27, size+27);
    pop();
    //console.log(flag);
  }
  else if(path_not_found){
    push();
    fill(200);
    rect(size/2-45, size + 10, 90, 25); fill(0); textSize(20);
    text("Reset", size/2-27, size+27);
    text("Path not found", size/2-70, size+50);
    pop();
  }
  else if(search){
    if(queue.length == 0){
      path_not_found = true;
      search = false;
    }
    else{
      queue.sort(function(a, b){
        return b.value-a.value;
      });
      var lowestIdx = queue.length-1;
      /*for(let i = 0; i < queue.length; i++){
        if(queue[i].value < queue[lowestIdx].value)
          lowestIdx = i;
      }*/
      if(queue[lowestIdx].x == end[0] && queue[lowestIdx].y == end[1]){
        finalPoint = new Point(queue[lowestIdx].x, queue[lowestIdx].y, queue[lowestIdx].path.slice(), queue[lowestIdx].gvalue, queue[lowestIdx].hvalue);
        path_found = true;
        search = false;
      }
      else{
        tempPoint = new Point(queue[lowestIdx].x, queue[lowestIdx].y, queue[lowestIdx].path.slice(), queue[lowestIdx].gvalue, queue[lowestIdx].hvalue); 
        visited.push(new Point(queue[lowestIdx].x, queue[lowestIdx].y, [], 0, 0));
        visitedMap[tempPoint.x/obstacleSize][tempPoint.y/obstacleSize] = 1;
        //removeFromQueue(lowestIdx);
        queue.pop();
        for(var i = 0; i < 4; i++){
          var width = tempPoint.x+dw[i];
          var height = tempPoint.y+dh[i];
          if(width >= 0 && width < size && height >= 0 && height < size && visitedMap[width/obstacleSize][height/obstacleSize] == 0){
            tempPath = tempPoint.path.slice();
            tempPath.push([width, height]);
            
            var gScore = tempPoint.gvalue+obstacleSize;
            if(!presentInQueue(gScore, width, height)){
              queue.push(new Point(width, height, tempPath, gScore, distToEnd(width, height)));
            } 
          }
          showVisitedAndActive();
          tempPoint.showPath();
        }
      }
    }
  }
  if(flag == 0){
    push();
    fill(0); textSize(20);
    text("Choose starting point", size/2-100, size+27);
    pop();
  }
  if(flag == 1){
    push();
    fill(0); textSize(20);
    text("Choose end point", size/2-80, size+27);
    pop();
  }
  if(flag == 2){
    startProcess();
  }
  if(flag == 3){
    dispStart();
  }
}
