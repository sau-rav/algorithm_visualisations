let size, ptr, obstacleSize;
let obstacleMatrix, start, end, visited, queue, visitedMap, dw, dh, flag;
let search, path_found, path_not_found;

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
      let val = random();
      if(val > 0.70){
        obstacleMatrix.push([i, j]);
        visitedMap[i/obstacleSize][j/obstacleSize] = 2;
      }
    }
  }
}

class Point{
  constructor(a, b, p){
    this.x = a;
    this.y = b;
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
    for(let i = 1; i < this.path.length; i++){
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
  for(let i = 0; i < obstacleMatrix.length; i++){
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
  for(let i = 0; i < obstacleMatrix.length; i++)
    if(obstacleMatrix[i][0] == vect[0] && obstacleMatrix[i][1] == vect[1]) return true;
  return false;
}

function mouseClicked(){
  if(flag == 0){
    start[0] = mouseX-mouseX%obstacleSize; start[1] = mouseY-mouseY%obstacleSize;
    if(!isObstacle(start) && mouseX >= 0 && mouseX <= size && mouseY >= 0 && mouseY <= size){
      flag += 1;
      //console.log("start is " + start[0] + " " + start[1]);
    }
    else start = [];
  }
  else if(flag == 1){
    end[0] = mouseX-mouseX%obstacleSize; end[1] = mouseY-mouseY%obstacleSize;
    if(!isObstacle(end) && mouseX >= 0 && mouseX <= size && mouseY >= 0 && mouseY <= size){
      flag += 1;
      //console.log("end is " + end[0] + " " + end[1]);
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
      //console.log("here");
      setup();
    }
  }
}

function startProcess(){
  flag = 3;
  queue.push(new Point(start[0], start[1], [[start[0], start[1]]]));
  visitedMap[start[0]/obstacleSize][start[1]/obstacleSize] = 1;
  visited.push(new Point(start[0], start[1], []));
}

function showVisitedAndActive(){
  for(let i = 1; i < visited.length; i++){
    visited[i].dispVisited();
  }
  for(let i = max(ptr, 1); i < queue.length; i++){
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

function draw() {
  background(255);
  drawBoard();
  showStartEnd();
  if(path_found){
    queue[ptr].showPath();
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
    if(ptr == queue.length){
      path_not_found = true;
    }
    else if(queue[ptr].x == end[0] && queue[ptr].y == end[1]){
      path_found = true;
    }
    else{
      for(let i = 0; i < 4; i++){
        let width = queue[ptr].x+dw[i];
        let height = queue[ptr].y+dh[i];
        if(width >= 0 && width < size && height >= 0 && height < size && visitedMap[width/obstacleSize][height/obstacleSize] == 0){
          let tempPath = queue[ptr].path.slice();
          tempPath.push([width, height]);
          queue.push(new Point(width, height, tempPath));
          visitedMap[width/obstacleSize][height/obstacleSize] = 1;
          visited.push(new Point(width, height, []));
        }
        showVisitedAndActive();
        queue[ptr].showPath();
      }
      ptr += 1;
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
