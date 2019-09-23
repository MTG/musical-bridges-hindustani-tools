//general variables
var talInfo;
var recordingsInfo;
var recordingsList;
var talList = {};
var failedLoading = false;
var mainBoxSide = 600;
var markerW = 0;
var markerH = 60;
var attemptsBox;
var hitsBox;
var scoreBox;
var attempts = 0;
var hits = 0;
var score = 0;
var goalTime;
//tal features
var talName;
var title;
var artist;
var link;
var trackFile;
// var avart;
// var strokeCircles = []; //list of strokeCircles
var talCircles = {};
var currentTal;
var currentAvart;
var currentTime = 0;
var charger;
var clock;
var mpmTxt;
var samList = [];
//style
var radiusBig; //radius of the big circle
var radius1 = 25; //radius of accented matra
var radius2 = 17; //radius of unaccented matra
var backColor;
var mainColor;
var matraColor;
//machanism
var speed;
var tempo;
// var cursorX; //cursor line's x
// var cursorY; //cursor line's y
// var angle = -90; //angle of the cursor
var navCursor;
var navCursorW = 5;
var cursor;
var shade;
var jump;
// var alpha;
// var position = 0;
var paused = true;
//html interaction
var selectMenu;
var button;//sounds
var showTheka;
var showCursor;
var showTal;
var loaded = false;
var margin = 10;
var navBoxH = 60;
var navBoxY;
var navBox;
var talBoxes = [];
var infoLink;
// Sounds
var trackDuration;
var track;
var initLoading;
// Icons
var wave;
var clap;
// var iconSamSize = radius1*1.7;
// var iconSize = radius2*1.7;
var iconDistance = 0.68;
// var icons = [];
// Language
var lang_select;
var lang_load;
var lang_error;
var lang_start;
var lang_pause;
var lang_continue;
var lang_loading;
var lang_attempts;
var lang_hits;
var lang_points;

function preload () {
  recordingsList = loadJSON("../files/talPractice-recordingsList.json");
  recordingsInfo = loadJSON("../files/recordingsInfo.json");
  talInfo = loadJSON("../files/talInfo.json");
  wave = loadImage("../images/wave.svg");
  clap = loadImage("../images/clap.svg");
}

function setup () {
  var canvas = createCanvas(markerW+mainBoxSide, markerH+mainBoxSide);
  var div = select("#sketch-holder");
  div.style("width: " + width + "px; margin: 10px auto; position: relative;");
  // var divElem = new p5.Element(input.elt);
  // divElem.style
  canvas.parent("sketch-holder");
  ellipseMode(RADIUS);
  angleMode(DEGREES);
  imageMode(CENTER);
  textFont("Laila");
  strokeJoin(ROUND);
  //style
  radiusBig = mainBoxSide * 0.27;
  navBoxY = height-navBoxH-margin;
  backColor = color(185, 239, 162);
  mainColor = color(249, 134, 50);
  matraColor = color(249, 175, 120);

  charger = new CreateCharger();
  cursor = new CreateCursor();
  navBox = new CreateNavigationBox();

  //Language
  var lang = select("html").elt.lang;
  print(lang);
  if (lang == "es") {
    lang_load = "Carga el audio";
    lang_select = "Elige";
    lang_error = "Ha habido un problema cargando el audio\nPor favor, vuelve a cargar la página";
    lang_start = "¡Comienza!";
    lang_pause = "Pausa";
    lang_continue = "Sigue";
    lang_loading = "Cargando...";
    lang_attempts = "Intentos";
    lang_hits = "Aciertos";
    lang_points = "Puntos";
  } else if (lang == "en") {
    lang_load = "Load the audio";
    lang_select = "Select";
    lang_error = "There was a problem loading the audio\nPlease, reaload the page";
    lang_start = "Start!";
    lang_pause = "Pause";
    lang_continue = "Play";
    lang_loading = "Loading...";
    lang_attempts = "Attempts";
    lang_hits = "Hits";
    lang_points = "Points";
  }

  //html interaction
  infoLink = select("#info-link");
  infoLink.position(width-60, markerH+margin*3+37);
  button = createButton(lang_load)
    .size(120, 25)
    .position(width-120-margin, navBoxY-margin/2-25)
    .mousePressed(player)
    .parent("sketch-holder")
    .attribute("disabled", "true");
  var selectW;
  if (markerW > 100) {
    selectW = markerW-margin*2;
  } else {
    selectW = 100;
  }
  selectMenu = createSelect()
    .size(selectW, 20)
    .position(margin, margin)
    .changed(start)
    .parent("sketch-holder");
  selectMenu.option(lang_select);
  var noRec = selectMenu.child();
  noRec[0].setAttribute("selected", "true");
  noRec[0].setAttribute("disabled", "true");
  noRec[0].setAttribute("hidden", "true");
  noRec[0].setAttribute("style", "display: none");
  recordingsList = recordingsList.recordingsList;
  for (var i = 0; i < recordingsList.length; i++) {
    selectMenu.option(recordingsList[i].selectOption, i);
  }
  showTheka = createCheckbox(' ṭhekā (x2)', true)
    .position(markerW+margin, markerH+mainBoxSide*0.2)
    .parent("sketch-holder");
  showCursor = createCheckbox(' cursor (x3)', true)
    .position(markerW+margin, showTheka.position()["y"]+showTheka.height+margin/2)
    .parent("sketch-holder");
  showTal = createCheckbox(' tāl (x3)', true)
    .position(markerW+margin, showCursor.position()["y"]+showCursor.height+margin/2)
    .changed(function() {
      showTheka.checked(showTal.checked());
      if (showTal.checked()) {
        showTheka.removeAttribute("disabled");
      } else {
        showTheka.attribute("disabled", "true");
      }
    })
    .parent("sketch-holder");
  showTheka.attribute("disabled", "true");
  showTheka.attribute("style", "color:rgba(0, 0, 0, 0.4);");
  showCursor.attribute("disabled", "true");
  showCursor.attribute("style", "color:rgba(0, 0, 0, 0.4);");
  showTal.attribute("disabled", "true");
  showTal.attribute("style", "color:rgba(0, 0, 0, 0.4);");
  attemptsBox = new CreateScoreBox(markerH + 150, lang_attempts, color(0), NORMAL);
  hitsBox = new CreateScoreBox(attemptsBox.x + attemptsBox.w + margin*2, lang_hits, color(0), NORMAL);
  scoreBox = new CreateScoreBox(hitsBox.x + hitsBox.w + margin*2, lang_points, mainColor, BOLD); //color(52, 152, 219)
}

function draw () {
  background(254, 249, 231);
  fill(backColor);
  rect(markerW, markerH, mainBoxSide, height);

  attemptsBox.display(attempts);
  hitsBox.display(hits);
  scoreBox.display(score);

  stroke(0, 50);
  strokeWeight(1);
  line(markerW+margin*2, markerH+margin*3+27, width-margin*2, markerH+margin*3+27);

  textAlign(CENTER, TOP);
  textStyle(NORMAL);
  textSize(30);
  strokeWeight(5);
  stroke(0);
  mainColor.setAlpha(255);
  fill(mainColor);
  text(title, markerW+mainBoxSide/2, markerH+margin*3);
  textAlign(CENTER, CENTER);
  stroke(0, 150);
  strokeWeight(1);
  textSize(20);
  fill(0, 150);
  text(artist, markerW+mainBoxSide/2, markerH+margin*3+45);

  if (!paused) {
    currentTime = track.currentTime();
    findGoalTime();
  }

  push();
  translate(markerW+mainBoxSide/2, markerH+mainBoxSide/2);

  if (failedLoading) {
    textAlign(CENTER, CENTER);
    textSize(15)
    noStroke()
    fill(0)
    text(lang_error, 0, 0);
  }

  rotate(-90);

  // noStroke();
  // alpha = map((angle+90)%360, 0, 360, 0, 255);
  // mainColor.setAlpha(alpha);
  // fill(mainColor);
  // arc(0, 0, radiusBig, radiusBig, -90, angle%360);

  if (loaded) {
    shade.update();
    if (showCursor.checked()) {
      shade.display();
    }

    noFill();
    strokeWeight(2);
    mainColor.setAlpha(255);
    stroke(mainColor);
    ellipse(0, 0, radiusBig, radiusBig);
    //draw circle per bol
    if (currentTal != undefined && showTal.checked()) {
      var talToDraw = talCircles[currentTal];
      for (var i = 0; i < talToDraw.strokeCircles.length; i++) {
        talToDraw.strokeCircles[i].display();
      }
      if (showTheka.checked()) {
        for (var i = 0; i < talToDraw.strokeCircles.length; i++) {
          talToDraw.strokeCircles[i].displayTheka();
        }
        for (var i = 0; i < talToDraw.icons.length; i++) {
          talToDraw.icons[i].display();
        }
      }
    }

    cursor.update();
    if (showCursor.checked()) {
      cursor.display();
    }
  } else {
    charger.update();
    charger.display();
    cursor.loadingUpdate();
    cursor.display();
  }

  pop();

  navBox.displayBack();

  if (loaded) {
    navCursor.update();
    navCursor.display();
    // for (var i = 0; i < talBoxes.length; i++) {
    //   talBoxes[i].update();
    // }
    clock.display();
  }

  for (var i = 0; i < talBoxes.length; i++) {
    talBoxes[i].display();
  }
  navBox.displayFront();

  textAlign(CENTER, CENTER);
  textSize(25);
  strokeWeight(5);
  stroke(0);
  mainColor.setAlpha(255);
  fill(mainColor);
  textStyle(NORMAL);
  text(talName, markerW+mainBoxSide/2, markerH+mainBoxSide/2);

  textAlign(RIGHT, BOTTOM);
  textSize(12);
  textStyle(NORMAL);
  noStroke();
  fill(50);
  text(mpmTxt, markerW+margin+65, navBoxY-margin/2);
  // text(niceTime(goalTime), width-50, 20);

  // position = updateCursor(position);

  //cursor
  // stroke(mainColor);
  // line(0, 0, cursorX, cursorY);
  // fill("red");
  // noStroke();
  // ellipse(cursorX, cursorY, 5, 5);
}

function start () {
  if (loaded) {
    track.stop();
  }
  loaded = false;
  paused = true;
  currentTime = 0;
  talBoxes = [];
  talCircles = [];
  talName = undefined;
  charger.angle = undefined;
  mpmTxt = undefined;
  currentTal = undefined;
  samList = [];
  samIndex = 0;
  var currentRecording = recordingsInfo[recordingsList[selectMenu.value()].mbid];
  trackDuration = currentRecording.info.duration;
  title = currentRecording.info.title;
  artist = currentRecording.info.artist;
  link = currentRecording.info.link;
  infoLink.attribute("href", link)
    .html("+info");
  trackFile = currentRecording.info.trackFile;
  navCursor = new CreateNavCursor();
  for (var i = 0; i < currentRecording.talList.length; i++) {
    var tal = currentRecording.talList[i];
    talList[tal.tal] = {
      "start": tal.start,
      "end": tal.end,
      "sam": tal.sam
    }
    samList = samList.concat(tal.sam.filter(s => !samList.includes(s)));
    var talBox = new CreateTalCircleBox(tal);
    talBoxes.push(talBox);
    var talCircle = new CreateTalCircle(talBox.tal);
    talCircles[tal.tal] = talCircle;
  }
  currentAvart = new CreateCurrentAvart();
  shade = new CreateShade();
  clock = new CreateClock();
  showTheka.attribute("disabled", "true");
  showTheka.attribute("style", "color:rgba(0, 0, 0, 0.4);");
  showTheka.checked("true");
  showCursor.attribute("disabled", "true");
  showCursor.attribute("style", "color:rgba(0, 0, 0, 0.4);");
  showCursor.checked("true");
  showTal.attribute("disabled", "true");
  showTal.attribute("style", "color:rgba(0, 0, 0, 0.4);");
  showTal.checked("true");
  button.html(lang_load);
  button.removeAttribute("disabled");
}

function CreateTalCircle (tal) {
  this.strokeCircles = [];
  this.icons = [];
  this.avart;

  var tal = talInfo[tal];
  this.avart = tal.avart;
  var tempoInit = tal.tempoInit;
  var theka = tal.theka;
  for (var i = 0; i < theka.length; i++) {
    var stroke = theka[i];
    var matra = stroke.matra;
    var vibhag; //tali or khali
    if (int(stroke.vibhag) > 0) {
      vibhag = "tali";
    } else {
      vibhag = "khali";
    }
    var circleType;
    if (i == 0) {
      circleType = "sam";
      var icon = new CreateIcon(matra, vibhag, radius1*1.2*1.5, this.avart);
      this.icons.push(icon);
    } else if ((stroke.vibhag % 1) < 0.101) {
      circleType = 1;
      var icon = new CreateIcon(matra, vibhag, radius1*1.5, this.avart);
      this.icons.push(icon);
    } else if ((stroke.vibhag * 10 % 1) == 0) {
      circleType = 2;
    } else {
      circleType = 3;
    }
    var bol = stroke.bol;
    var strokeCircle = new CreateStrokeCircle(matra, vibhag, circleType, bol, this.avart);
    this.strokeCircles.push(strokeCircle);
  }
}

function CreateStrokeCircle (matra, vibhag, circleType, bol, avart) {
  this.bol = bol;
  var increment = 1;
  this.strokeWeight = 2;
  this.txtW = 0;

  if (circleType == "sam") {
    if (vibhag == "tali") {
      this.col = mainColor;
    } else {
      this.col = backColor;
    }
  } else if (vibhag == "tali") {
    this.col = matraColor;
  } else if (vibhag == "khali") {
    this.col = backColor;
  }

  if (circleType == "sam") {
    this.radius = radius1 * 1.2;
    this.txtSize = radius1 * 0.7;
    this.txtStyle = BOLD;
    this.bol = this.bol.toUpperCase();
  } else if (circleType == 1) {
    this.radius = radius1;
    this.txtSize = radius1 * 0.75;
    this.txtStyle = BOLD;
  } else if (circleType == 2){
    this.radius = radius2;
    this.txtSize = radius2 * 0.75;
    this.txtStyle = BOLD;
  } else {
    this.radius = radius2;
    this.txtSize = radius2 * 0.75;
    this.col = color(0, 0);
    this.txtStyle = NORMAL;
    this.strokeWeight = 0;
    this.txtW = 1;
    increment = 1.05;
  }

  this.circleAngle = map(matra, 0, avart, 0, 360);
  this.x = radiusBig * increment * cos(this.circleAngle);
  this.y = radiusBig * increment * sin(this.circleAngle);

  this.display = function () {
    push();
    translate(this.x, this.y);
    stroke(mainColor);
    strokeWeight(this.strokeWeight);
    fill(this.col);
    ellipse(0, 0, this.radius, this.radius);
    pop();
  }

  this.displayTheka = function () {
    push();
    translate(this.x, this.y);
    textAlign(CENTER, CENTER);
    stroke(backColor);
    strokeWeight(this.txtW);
    fill(0);
    textSize(this.txtSize);
    textStyle(this.txtStyle);
    rotate(90);
    text(this.bol, 0, 0);
    pop();
  }
}

function CreateScoreBox (x, title, col, style) {
  this.x = x;
  this.h = 20;
  this.y = margin+this.h;
  this.w = 50;
  this.title = title;
  this.col = col;
  this.style = style;
  this.display = function(txt) {
    textAlign(CENTER, TOP);
    fill(0);
    noStroke();
    textStyle(this.style);
    textSize(this.h * 0.75);
    text(this.title, this.x+(this.w/2), margin);
    textAlign(RIGHT, TOP);
    fill(255);
    stroke(150);
    strokeWeight(1);
    rect(this.x, this.y, this.w, this.h);
    fill(this.col);
    noStroke();
    text(txt, this.x+this.w-3, this.y+this.h * 0.2);
  }
}

function CreateNavigationBox () {
  this.x1 = margin;
  this.x2 = width - margin;
  this.y1 = height - navBoxH - margin;
  this.y2 = height - margin;
  this.w = this.x2 - this.x1;

  this.displayBack = function () {
    fill(0, 50);
    noStroke();
    rect(margin, navBox.y1, this.w, navBoxH);
    for (var i = 0; i < samList.length; i++) {
      stroke(255);
      strokeWeight(1);
      var samX = map(samList[i], 0, trackDuration, this.x1+navCursorW/2, this.x2-navCursorW/2);
      line(samX, this.y1, samX, this.y2);
    }
  }

  this.displayFront = function () {
    stroke(0, 150);
    strokeWeight(2);
    line(this.x1+1, navBox.y1, this.x2, navBox.y1);
    line(this.x2, navBox.y1, this.x2, navBox.y2);
    strokeWeight(1);
    line(this.x1, navBox.y1, this.x1, navBox.y2);
    line(this.x1, navBox.y2, this.x2, navBox.y2);
  }

  this.clicked = function () {
    if (mouseX > this.x1 && mouseX < this.x2 && mouseY > this.y1 && mouseY < this.y2) {
      jump = map(mouseX, this.x1, this.x2, 0, trackDuration);
      if (paused) {
        currentTime = jump;
      } else {
        track.jump(jump);
        jump = undefined;
      }
    }
    // if (mouseX > this.x1 && mouseX < this.x2 && mouseY > this.y1 && mouseY < this.y2) {
    //   jump = map(mouseX, this.x1, this.x2, 0, trackDuration);
    //   if (paused) {
    //     currentTime = jump;
    //     findClosestSam(false);
    //   } else {
    //     paused = true;
    //     print(currentTime);
    //     currentTime = jump;
    //     print(currentTime);
    //     track.pause();
    //     print(track.currentTime());
    //     findClosestSam(true);
    //   }
    // }
  }
}

function CreateNavCursor () {
  this.x = navBox.x1 + navCursorW/2;

  this.update = function () {
    this.x = map(currentTime, 0, trackDuration, navBox.x1 + navCursorW/2, navBox.x2 - navCursorW/2);
    var noTal = true;
    for (var i = 0; i < talBoxes.length; i++) {
      var talBox = talBoxes[i];
      if (this.x > talBox.x1 && this.x < talBox.x2) {
        talBox.on();
        currentTal = talBox.talIndex;
        talName = talBox.fullName;
        noTal = false;
      } else {
        talBox.off();
      }
    }
    if (noTal) {
      currentTal = undefined;
      talName = undefined;
    }
    if (navBox.x2 - navCursorW/2 - this.x < 0.01) {
      button.html(lang_start);
      track.stop();
      paused = true;
      currentTime = 0;
    }
  }
  this.display = function () {
    stroke(mainColor);
    strokeWeight(navCursorW);
    line(this.x, navBox.y1+navCursorW/2, this.x, navBox.y2-navCursorW/2);
  }
}

function CreateTalCircleBox (tal) {
  if (tal.tal[tal.tal.length-1] == 'l') {
    this.tal = tal.tal;
  } else {
    this.tal = tal.tal.slice(0, tal.tal.length-1);
  }
  this.talIndex = tal.tal;
  this.name = talInfo[this.tal].nameTrans;
  this.fullName = talInfo[this.tal].name + "\n" + this.name;
  this.h = 25;
  this.x1 = map(tal.start, 0, trackDuration, navBox.x1+navCursorW/2, navBox.x2-navCursorW/2);
  this.x2 = map(tal.end, 0, trackDuration, navBox.x1+navCursorW/2, navBox.x2-navCursorW/2);
  this.w = this.x2-this.x1;
  this.boxCol = color(255, 100);
  this.txtCol = color(100);
  this.txtStyle = NORMAL;
  this.txtBorder = 0;
  this.sam = talList[this.talIndex].sam;
  this.currentSamIndex = 0;
  this.off = function () {
    this.boxCol = color(255);
    this.txtCol = color(100);
    this.txtStyle = NORMAL;
    this.txtBorder = 0;
  }
  this.on = function () {
    this.boxCol = mainColor;
    this.txtCol = color(0);
    this.txtStyle = BOLD;
    this.txtBorder = 1;
  }

  this.display = function () {
    this.boxCol.setAlpha(100);
    fill(this.boxCol);
    noStroke();
    rect(this.x1, navBox.y1, this.w, this.h);
    textAlign(LEFT, BOTTOM);
    textSize(this.h * 0.7);
    fill(this.txtCol);
    textStyle(this.txtStyle);
    fill(0);
    mainColor.setAlpha(255);
    stroke(mainColor);
    strokeWeight(this.txtBorder);
    text(this.name, this.x1+2, navBox.y1 + this.h*0.92);
  }
}

function CreateCursor () {
  this.x;
  this.y;

  this.update = function () {
    if (!(currentTime >= currentAvart.start && currentTime <= currentAvart.end)) {
      currentAvart.update();
    }
    this.angle = map(currentTime, currentAvart.start, currentAvart.end, 0, 360);
    this.x = radiusBig * cos(this.angle);
    this.y = radiusBig * sin(this.angle);
  }

  this.loadingUpdate = function () {
    this.x = radiusBig * cos(charger.angle);
    this.y = radiusBig * sin(charger.angle);
  }

  this.display = function () {
    fill("red");
    stroke(50);
    strokeWeight(1);
    ellipse(this.x, this.y, 5, 5)
  }
}

function CreateShade () {
  this.x;
  this.y;
  this.angle;
  this.alpha;
  this.col = mainColor;
  this.update = function () {
    this.angle = map(currentTime, currentAvart.start, currentAvart.end, 0, 360);
    this.alpha = map(this.angle, 0, 360, 0, 255);
    this.x = radiusBig * cos(this.angle);
    this.y = radiusBig * sin(this.angle);
  }
  this.display = function () {
    this.col.setAlpha(this.alpha);
    fill(this.col);
    noStroke();
    arc(0, 0, radiusBig, radiusBig, 0, this.angle);
  }
}

function CreateIcon (matra, vibhag, size, avart) {
  this.circleAngle = map(matra, 0, avart, 0, 360);
  this.x = radiusBig * iconDistance * cos(this.circleAngle);
  this.y = radiusBig * iconDistance * sin(this.circleAngle);
  if (vibhag == "tali") {
    this.img = clap;
  } else if (vibhag == "khali") {
    this.img = wave;
  }

  this.display = function () {
    push();
    translate(this.x, this.y);
    rotate(90);
    image(this.img, 0, 0, size, size);
    pop();
  }
}

function CreateCurrentAvart () {
  this.index;
  this.tal;
  this.sam;
  this.start;
  this.end;
  this.findIndex = function () {
    while (currentTime > this.sam[this.index+1]) {
      this.index++;
    }
    while (currentTime < this.sam[this.index]) {
      this.index--;
    }
  }
  this.update = function () {
    if (currentTal == undefined) {
      this.start = undefined;
      this.end = undefined;
      mpmTxt = undefined;
    } else {
      if (this.tal == currentTal) {
        this.findIndex();
      } else {
        this.tal = currentTal
        this.sam = talList[this.tal].sam;
        this.index = 0;
        this.findIndex();
      }
      this.start = this.sam[this.index];
      this.end = this.sam[this.index+1];
      var mpm = 60 / ((this.end - this.start) / talInfo[currentTal].avart);
      mpmTxt = str(mpm.toFixed(1)) + " mpm"
    }
  }
}

function CreateClock () {
  this.clock;
  this.total = niceTime(trackDuration);
  this.now;
  this.display = function() {
    this.now = niceTime(currentTime);
    this.clock = this.now + " / " + this.total;
    textAlign(CENTER, BOTTOM);
    textSize(12);
    textStyle(NORMAL);
    noStroke();
    fill(50);
    text(this.clock, markerW+mainBoxSide/2, navBoxY-margin/2);
  }
}

function CreateCharger () {
  this.angle;
  this.update = function () {
    // if (this.angle == undefined) {
    //   this.angle = 0;
    // } else {
    //   this.angle += 6;
    // }
    this.angle += 1;
  }
  this.display = function () {
    stroke(mainColor);
    strokeWeight(2);
    noFill();
    arc(0, 0, radiusBig, radiusBig, 0, this.angle);
  }
}

function player () {
  if (loaded) {
    if (paused) {
      if (jump == undefined) {
        track.play();
      } else {
        track.play();
        track.jump(jump);
        jump = undefined;
      }
      paused = false;
      button.html(lang_pause);
    } else {
      paused = true;
      currentTime = track.currentTime();
      track.pause();
      button.html(lang_continue);
    }
  } else {
    initLoading = millis();
      button.html(lang_loading);
      button.attribute("disabled", "true");
      selectMenu.attribute("disabled", "true");
    charger.angle = 0;
    track = loadSound("../tracks/" + trackFile, soundLoaded, failedLoad);
  }
}

function soundLoaded () {
  button.html(lang_start);
  button.removeAttribute("disabled");
  selectMenu.removeAttribute("disabled");
  loaded = true;
  showTheka.removeAttribute("disabled");
  showTheka.attribute("style", "color:rgba(0, 0, 0, 0.6);");
  showCursor.removeAttribute("disabled");
  showCursor.attribute("style", "color:rgba(0, 0, 0, 0.6);");
  showTal.removeAttribute("disabled");
  showTal.attribute("style", "color:rgba(0, 0, 0, 0.6);");
  var endLoading = millis();
  print("Track loaded in " + (endLoading-initLoading)/1000 + " seconds");
}

function failedLoad () {
  print("Loading failed");
  failedLoading =true;
  charger.angle = undefined;
}

function findGoalTime () {
  if (currentAvart.start != undefined) {
    if (currentTime-currentAvart.start > currentAvart.end-currentTime) {
      goalTime = currentAvart.end;
    } else {
      goalTime = currentAvart.start;
    }
  } else {
    if (currentTime < samList[0]) {
      goalTime = samList[0];
    } else if (currentTime > samList[samList.length-1]) {
      goalTime = samList[samList.length-1];
    }
  }
}

function grader () {
  var dist = currentTime - goalTime; //samList[goalIndex];
  if (abs(dist) <= 0.1) {
    hits++;
    var points = 1;
    if (!showTheka.checked()) {
      points *= 2;
    }
    if (!showCursor.checked()) {
      points *= 3;
    }
    if (!showTal.checked()) {
      points *= 3;
    }
    score += points;
  }
}

function mousePressed() {

  if (loaded) {
    navBox.clicked();
  }
}

function keyTyped() {
  if (!paused && key.toLowerCase() === "s") {
    attempts++;
    grader();
  }
}

function niceTime (seconds) {
  var niceTime;
  var sec = int(seconds%60);
  var min = int(seconds/60);
  niceTime = str(min).padStart(2, "0") + ":" + str(sec).padStart(2, "0");
  return niceTime
}
