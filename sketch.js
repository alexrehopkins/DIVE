let sides = 6; //start 6
let gamestate = 0;    //0 = start screen, 1 = playing, 2 = dead, 3 = stage changing, 4 = end screen
let layersOnScreen = 10; //default 10
let controls = 0;
let walls = [];
let health = 3;
let stageTime = 0;
let minSize;
let maxSize;
let invincible = 0; //0 = not invincible, 100 = just invincible, anything inbetween is it fading
let animationTimer = 0;
let currentCol;
let stage = 1;
let song;
let heal;
let hurt;
let warp;
let paused = 0;
let moving = 0;
let difficulty = 0;
let bgtimer = 0;

function preload() {
  song = loadSound('sounds/dududu.wav');
  heal = loadSound('sounds/heal.wav');
  hurt = loadSound('sounds/oof.wav');
  warp = loadSound('sounds/warp.wav');
  click = loadSound('sounds/click.wav');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  if (width > height) {
    maxSize = width;
    minSize = height;
  }
  else {
    minSize = width;
    maxSize = height;
  }
  textAlign(CENTER);
  textSize(50);
  stroke(250);
  noFill();
  currentCol = color(250,0,0);
  for(let i = 0; i < layersOnScreen; i++) {
    walls.push(new wall());
    walls[i].construct(i);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (width > height) {
    maxSize = width;
    minSize = height;
  }
  else {
    minSize = width;
    maxSize = height;
  }
}

function draw() {
  if (bgtimer == 10) {
    background(20);
    bgtimer = 0
  }
  bgtimer++;
  background(20,120);
  translate(width/2,height/2);
  if (paused == 0) {
  if (gamestate == 0) {
    startScreen();
    for(let i = 0; i < layersOnScreen; i++) {
      walls[i].make();
    }
  }
  else {
    rotateScreen();
    backgrounds();
    for(let i = 0; i < layersOnScreen; i++) {
      walls[i].make();
    }
    distanceBlur();
    if (gamestate == 1) {
      player();
      if (song.isPlaying() == 0) {
    		song.loop();
    	}
	}
    if (gamestate == 2) {
      loseScreen();
      song.stop();
    }
  }
  if (gamestate == 3) {
  	if (warp.isPlaying() == 0) {
      warp.play();
    }
    background(230-animationTimer);
    push();
    rotate(animationTimer/5);
    noFill();
    stroke(currentCol);
    quad(-2*(250-animationTimer),0,0,-2*(250-animationTimer),2*(250-animationTimer),0,0,2*(250-animationTimer));
    rotate(PI/4);
    quad(-2*(250-animationTimer),0,0,-2*(250-animationTimer),2*(250-animationTimer),0,0,2*(250-animationTimer));
    animationTimer++;
    if (animationTimer > 250) {
      gamestate = 1;
      controls = 0;
      animationTimer = 0;
      stageTime = 0;
      warp.stop();
    }
    pop();
  }
  else {
    animationTimer += 3;
    if (animationTimer > 50) {
      animationTimer = 0;
    }
  }
  }
  pauseButton();
}

function rotateScreen() {
  stageTime += PI/2048;
  rotate(stageTime);
  if (stageTime > 2*PI) {
    stageTime = 0;
  }
}

function distanceBlur() {
  if (sides > 2) {
    push();
    noStroke();
    scale(maxSize/600);
    fill(20,120);
    ellipse(0,0,10,10);
    fill(20,64);
    ellipse(0,0,30,30);
    ellipse(0,0,50,50);
    ellipse(0,0,70,70);
    pop();
  }
  else {
    currentCol = color(0,(50-animationTimer)*5,animationTimer*5);
  }
}


function backgrounds() {
  push();
  stroke(30);
  for (var i = 0; i < sides; i++) {
    rotate(2*PI/sides);
    line(0,0,maxSize*sin(PI/sides),maxSize*cos(PI/sides));
  }
  pop();
}

function startScreen() {
  push();
  scale(minSize/400);
  noFill();
  textSize(50);
  stroke(100);
  strokeWeight(1);
  if (dist(width/2,height/2,mouseX,mouseY) < 100*(minSize/400)) {
    stroke(250,0,0);
    stageTime += PI/64;
    if (warp.isPlaying() == 0) {
      warp.play();
    }
    if (mouseIsPressed) {
      warp.stop();
      if (heal.isPlaying() == 0) {
      	heal.play();
      }
      gamestate = 1;
      difficulty = 0;
      stageTime = 0;
      moving = layersOnScreen*sides;
      sides = 6;
      health = 3;
      currentCol = color(250,0,0); //red
      stage = 1;
      controls = 0;
    }
  }
  else {
  	warp.stop();
  }
  rotate(stageTime);
  quad(-100,0,0,-100,100,0,0,100);
  quad(75,75,75,-75,-75,-75,-75,75);
  rotate(-stageTime);
  if (dist(width/2,(height/2)+130*(minSize/400),mouseX,mouseY) < 30*(minSize/400)) {
    if (mouseIsPressed) {
      if (hurt.isPlaying() == 0) {
      	hurt.play();
      }
      gamestate = 1;
      stageTime = 0;
      difficulty = 1;
      moving = layersOnScreen*sides;
      sides = 6;
      health = 3;
      currentCol = color(250,0,0); //red
      stage = 1;
      controls = 0;
    }
  }
  fill(200);
  text("DIVE",0,17.5);
  noStroke();
  textSize(10);
  text("Use left and right arrow keys or touch left and right \n sides of screen to dodge coloured lines. \n Collect hearts to heal and orbs to progress. \n DIVE created by Alex Hopkins",0,120);
  pop();
}

function player() {
  if (moving > 0) {
     moving--;
  }
  if (moving < 0) {
     moving++;
  }
  push();
  rotate((controls+((-moving)/15))*2*PI/sides);
  translate(0,minSize*0.375);
  scale(maxSize/600);
  stroke(250);
  fill(0);
  if (invincible > 0) {
    invincible--;
    fill(invincible+100,0,0);
  }
  if (difficulty == 1) {
  quad(-5,4,0,6,5,4,0,1);
  quad(-15,20,-10,15,-15,10,-20,15); //engines
  quad(-10,5,-10,15,-15,10,-20,15); //engine wing
  quad(15,20,10,15,15,10,20,15); //engines
  quad(10,5,10,15,15,10,20,15); //engines wing
  quad(-10,15,10,8,10,15,-10,8); //wing
  quad(-5,10,5,10,1,3,-1,3); //seating area
  quad(5,10,-5,10,-7,19,7,19); //back panel
  }
  else {
  quad(-25,13,25,13,-1,1,1,1);
  quad(12,10,-12,10,-5,0,5,0);
  quad(12,10,-12,10,-12,19,12,19);
  }
  noFill();
  noStroke();
  currentCol.setAlpha(animationTimer*2+100);
  if (health > 2) {
    fill(currentCol);
    quad(-7+(-difficulty*8),10,-15+(-difficulty*8),15,(-difficulty*8)+(moving*5-22-animationTimer/2),25+animationTimer/2,-1+(-difficulty*8),15);
    fill(250,100);
    quad(-7+(-difficulty*8),13,-10+(-difficulty*8),15,(-difficulty*8)+(moving*5-5-animationTimer/2),10+animationTimer/2,-6+(-difficulty*8),15);
  }
  noStroke();
  if (health > 1) {
    fill(currentCol);
    quad(7+(difficulty*8),10,15+(difficulty*8),15,(difficulty*8)+(moving*5+22+animationTimer/2),25+animationTimer/2,1+(difficulty*8),15);
    fill(250,100);
    quad(7+(difficulty*8),13,10+(difficulty*8),15,(moving*5+5+animationTimer/2)+(difficulty*8),10+animationTimer/2,6+(difficulty*8),15);
  }
  fill(currentCol);
  quad(0,10,5,15,moving*5,30+animationTimer/2,-5,15);
  fill(250,100);
  quad(0,13,2,15,moving*5,10+animationTimer/2,-2,15);
  stroke(150);
  ellipse(-7+(-difficulty*8),15,5,5); //-15,15 for hard
  ellipse(0,15,5,5); //0,15 for hard
  ellipse(7+(difficulty*8),15,5,5); //15,15 for hard
  currentCol.setAlpha(256);
  if (sides == 2) {
      textSize(10);
      noStroke();
      fill(250);
      if (difficulty == 0) {
        text("Click 'to dodge' on title page to enter hardmode!",0,-5);
      }
      else {
        text("You can do anything you put your mind to!",0,-5);
      }
  }
  pop();
  if (health < 1) {
    gamestate = 2;
    invincible = 500;
  }
}
 
function touchStarted() {
  if (mouseY > height/4 && paused == 0 && moving == 0) {
    if (mouseX < width/2) {
      moving = 15;
      if (controls >= (sides-1)) {
        controls = 0;
      }
      else {
        controls++;
      }
    } 
    else {
      moving = -15;
      if (controls <= 0) {
        controls = sides-1;
      }
      else {
        controls--;
      }
    }
  }
}

function keyPressed() {
  if (paused == 0) {
    if (keyCode === LEFT_ARROW && moving == 0) {
      moving = 15;
      if (controls >= (sides-1)) {
        controls = 0;
      }
      else {
        controls++;
      }
    }
    else if (keyCode === RIGHT_ARROW && moving == 0) {
      moving = -15;
      if (controls <= 0) {
        controls = sides-1;
      }
      else {
        controls--;
      }
    }
  }
}

function pauseButton() {
  push();
  if (gamestate != 0 && paused == 0) {
    rotate(-stageTime);
  }
  translate(-2*width/5,-2*height/5);
  scale(minSize/400);
  if (paused < 50 && paused != 0) {
    stroke(250);
    rect(-20,-20,(100)*paused/50,72);
  }
  if (paused > 50 && paused != 100) {
    stroke(250);
    rect(-20,-20,(100)*(paused-50)/50,72);
  }
  if (paused == 100) {
    if (mouseX > (width/10)-(12*minSize/400) && mouseX < (width/10)+(71*minSize/400) && mouseY > (height/10)-(-20*minSize/400) && mouseY < (height/10)+(44*minSize/400)) {
      stroke(250,0,0);
      if (mouseIsPressed) {
        click.play();
        gamestate = 0;
        paused = 0;
      }
    }
    rect(-12,20,83,24)
    stroke(250);
    rect(-20,-20,100,72)
    noStroke();
    fill(250);
    textSize(20);
    text("Exit",10,39);
  }
  if (paused > 50 && paused < 100) {
    paused++;    
  }
  else if (paused < 50 && paused > 0) {
    paused--;
  }
  stroke(250);
  if (dist(width/10,height/10,mouseX,mouseY) < 20*(minSize/400)) {
    if (mouseIsPressed) {
      if (paused == 0) {
        click.play();
        paused = 51
      }
      else if (paused == 100) {
        paused = 49;
        click.play();
      }
    }
    stroke(250,0,0);
  }
  noFill();
  if (paused > 50) {
    song.pause();
    warp.pause();
    rect(-12,-12,24,24);
    triangle(7.5,0,-5,10,-5,-10);
  }
  else {
    rect(-7.5,-10,5,20);
    rect(2.5,-10,5,20);
  }
  pop();
}

function loseScreen() {
  background(0,1);
  textSize(invincible/10);
  stroke(250);
  noFill();
  push();
  rotate(-stageTime)
  text("YOU LOSE",0,0);
  pop();
  invincible--;
  if (invincible == 0) {
    gamestate = 0;
    
  }
}

function extraLife(x,y,size) {
  push();
  translate(x,y);
  scale(size);
  scale(maxSize/600);
  noStroke();
  fill(250,0,0);
  ellipse(-10,0,20);
  ellipse(10,0,20);
  triangle(-20,0,20,0,0,20);
  fill(250);
  rect(-12.5,-7.5,3,14);
  rect(-17.5,-2.5,14,3);
  pop();
}

function modeChangeOrb(x,y,size) {
  push();
  translate(x,y);
  scale(size);
  scale(maxSize/600);
  noStroke();
  if (stage == 1) {
    fill(0,250,0);
  }
  else if (stage == 2) {
    fill(0,0,250);
  }
  else if (stage == 3) {
    fill(200,200,0);
  }
  else if (stage == 4) {
    fill(200,0,200);
  }
  else if (stage == 5) {
    fill(0,200,200);
  }
  else if (stage == 6) {
    fill(250,0,0);
  }
  if (sides == 2) {
    fill(currentCol);
    if (difficulty == 0) {
        text("YOU WIN!",0,0);
    }
    else {
        text("THANK YOU!",0,0);
    }
  }
  else {
    ellipse(0,0,30);
    fill(250);
    ellipse(0,0,20);
    fill(20);
    ellipse(0,0,10);
  }
  pop();
}

function modeChanger() {
  if (stage == 1) {
    currentCol = color(0,250,0);
    sides = 9;
  }
  else if (stage == 2) {
    currentCol = color(0,0,250);
    sides = 12;
  }
  else if (stage == 3) {
    currentCol = color(200,200,0);
    sides = 5;
  }
  else if (stage == 4) {
    currentCol = color(200,0,200);
    sides = 4;
  }
  else if (stage == 5) {
    currentCol = color(0,200,200);
    sides = 3;
  }
  else if (stage == 6) {
  	currentCol = color(250,0,0);
    sides = 2;
    health = 3;
  }
  stage++;
  controls = 0;
  gamestate = 3;
  animationTimer = 0;
}

class wall{
  construct(timed) {
    this.item = 0;
    this.layer = timed;
    if (this.layer == 0) { //generate an item every 10 layers
      this.item = int(random(0,3)); //0 = nothing, 1 = heart, 2 = 1/8 of key that reduce sides...
    }
    this.ring = [];
    this.visible = 0;
    this.speed = ((1+timed)/layersOnScreen)*600; //600-maxSize
    this.time = ((1+timed)/layersOnScreen)*maxSize;
    for (var i = 0; i < sides; i++) {
      this.ring[i] = int(random(0,2));
    }
    this.ring[int(random(1,sides))] = 0; 
  }
  make() {
    this.time += this.time*0.02;
    this.speed += 600/600; //600-maxSize
    if (gamestate == 3 || gamestate == 0) {
      this.visible = 0;
    }
    if (sides == 2) {
      this.visible = 10;
    }
    if (this.speed > 600) { //600-maxSize
      this.time = 1;
      this.visible++;
      this.speed = 1;
      if (this.layer == 0 && this.visible > 2) { //generate an item every 10 layers
        this.item = int(random(0,3)); //0 = nothing, 1 = heart, 2 = 1/8 of key that reduce sides...
        if (this.visible > 5) {
          this.item = 2;
        }
      }
      for (var i = 0; i < sides; i++) {
        this.ring[i] = int(random(0,3));
        if (difficulty == 1) {
          if (random(0,60) < stage*10) {
            this.ring[i] = 1;
          }
        }  
      }
      this.ring[int(random(1,sides))] = 3;
    }
    push();
    if (this.visible > 0) {
      for (var j = 0; j < sides; j++) {
        if (this.ring[j] == 1) {
          stroke(currentCol);
          if (controls == j && int(this.time*cos(PI/sides)) < int(minSize*0.375+5) && int(this.time*cos(PI/sides)) > int(minSize*0.375-5) && health > 0 && invincible == 0) {
            background(250,0,0,50);
            health--;
            if (hurt.isPlaying() == 0) {
    			hurt.play();
    		}
            invincible = 100;
          }
        }
        else if (this.ring[j] == 3){
          if (this.item == 1) {
            extraLife(0,int(this.time*cos(PI/sides))-15,2*this.time/maxSize);
            if (controls == j && int(this.time*cos(PI/sides)) < int(minSize*0.375+5) && int(this.time*cos(PI/sides)) > int(minSize*0.375-5) && health > 0) {
              this.item = 0;
              if (heal.isPlaying() == 0) {
    			heal.play();
    		  }
              if (health == 3) {
                invincible = 150;
              }
              else {
                health++;
              }
            }
          }
          if (this.item == 2) {
            modeChangeOrb(0,int(this.time*cos(PI/sides))-20,2*this.time/maxSize);
            if (controls == j && int(this.time*cos(PI/sides)) < int(minSize*0.375+5) && int(this.time*cos(PI/sides)) > int(minSize*0.375-5) && health > 0) {
              this.item = 0;
              modeChanger();
            }
          }
          stroke(250);
        }
        else {
          stroke(250);
        }
        line(-this.time*sin(PI/sides),this.time*cos(PI/sides),this.time*sin(PI/sides),this.time*cos(PI/sides));
        rotate(2*PI/sides);
      }
    }
    pop();
  }
}

