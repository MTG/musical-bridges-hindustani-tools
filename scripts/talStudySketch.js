//general variables
var talInfo;
var talMenu; // = ["tīntāl", "ektāl", "jhaptāl", "rūpak tāl"];
//tal features
var talName;
var avart;
var strokeCircles = []; //list of strokeCircles
//style
var radiusBig; //radius of the big circle
var radius1 = 27; //radius of accented matra
var radius2 = 20; //radius of unaccented matra
var backColor;
var mainColor;
var matraColor;
//machanism
var speed;
var tempo;
// var cursorX; //cursor line's x
// var cursorY; //cursor line's y
// var angle = -90; //angle of the cursor
var cursor;
var shade;
// var alpha;
// var position = 0;
var playing = false;
var timeDiff;
//html interaction
var slider;
var select;
var button;//sounds
var showTheka;
var showCursor;
var showTal;
var loaded = false;
// Sound
var dha;
var dhin;
var ge;
var kat;
var ki;
var na;
var ra;
var ta;
var ti;
var tin;
var tun;
var soundDic = {};
var strokeToPlay = 0;
// Icons
var wave;
var clap;
var iconSamSize = radius1*1.7;
var iconSize = radius2*1.7;
var iconDistance = 0.72;
var icons = [];
// language
var lang_select;
var lang_start;
var lang_stop;

function preload () {
  talInfo = loadJSON("../files/talInfo.json");
  wave = loadImage("../images/wave.svg");
  clap = loadImage("../images/clap.svg");
}

function setup() {
  var canvas = createCanvas(600, 600);
  var div = select("#sketch-holder");
  div.style("width: " + width + "px; margin: 10px auto; position: relative;");
  // var divElem = new p5.Element(input.elt);
  // divElem.style
  canvas.parent("sketch-holder");
  ellipseMode(RADIUS);
  angleMode(DEGREES);
  imageMode(CENTER);
  textFont("Laila");
  //style
  radiusBig = width * (1 / 3);
  backColor = color(185, 239, 162);
  mainColor = color(249, 134, 50);
  matraColor = color(249, 175, 120);
  //language
  var lang = select("html").elt.lang;
  print(lang);
  if (lang == "en") {
    lang_select = "Select a tāl";
    lang_start = "Start!";
    lang_stop = "Stop";
  } else if (lang == "es") {
    lang_select = "Elige un tāl";
    lang_start = "¡Comienza!";
    lang_stop = "Para";
  }
  //html interaction
  slider = createSlider(5, 300)
    .position(10, height-30)
    .size(width-20, 20)
    .changed(updateTempo)
    .parent("sketch-holder");
  select = createSelect()
    .size(100, 25)
    .position(10, 10)
    .changed(start)
    .parent("sketch-holder");
  select.option(lang_select);
  var noTal = select.child();
  // print(noTal[0]);
  noTal[0].setAttribute("selected", "true");
  noTal[0].setAttribute("disabled", "true");
  noTal[0].setAttribute("hidden", "true");
  noTal[0].setAttribute("style", "display: none");
  talMenu = Object.keys(talInfo);
  for (var i = 0; i < talMenu.length; i++) {
    select.option(talInfo[talMenu[i]].nameTrans + " (" + talInfo[talMenu[i]].avart + ")", i);
  }
  showTheka = createCheckbox(' ṭhekā', true)
    .position(10, height*0.1)
    .parent("sketch-holder");
  showCursor = createCheckbox(' cursor', true)
    .position(10, showTheka.position()["y"]+showTheka.height+5)
    .parent("sketch-holder");
  showTal = createCheckbox(' tāl', true)
    .position(10, showCursor.position()["y"]+showCursor.height+5)
    .changed(function() {
      showTheka.checked(showTal.checked());
    })
    .parent("sketch-holder");
  showTheka.attribute("disabled", "true");
  showTheka.attribute("style", "color:rgba(0, 0, 0, 0.4);");
  showCursor.attribute("disabled", "true");
  showCursor.attribute("style", "color:rgba(0, 0, 0, 0.4);");
  showTal.attribute("disabled", "true");
  showTal.attribute("style", "color:rgba(0, 0, 0, 0.4);");
  button = createButton(lang_start)
    .size(90, 25)
    .position(width-100, 10)
    .mousePressed(playTal)
    .parent("sketch-holder")
    .attribute("disabled", "true");
    // .style("position: static;");
  //start tal
  // start();
  // updateTempo();
}

function draw() {
  background(backColor);
  translate(width/2, height/2);
  tempo = slider.value();
  fill(0);
  noStroke();
  textAlign(LEFT, BASELINE);
  textSize(12);
  text(str(tempo)+" mpm", -width/2+10, height/2-30); //tempo box

  push();
  rotate(-90);

  if (playing) {
    shade.update();
    if (showCursor.checked()) {
      shade.display();
    }
  }

  noFill();
  strokeWeight(2);
  mainColor.setAlpha(255);
  stroke(mainColor);
  ellipse(0, 0, radiusBig, radiusBig);
  //draw circle per bol
  if (showTal.checked()) {
    for (var i = 0; i < strokeCircles.length; i++) {
      strokeCircles[i].display();
    }
    if (showTheka.checked()) {
      for (var i = 0; i < strokeCircles.length; i++) {
        strokeCircles[i].displayTheka();
      }
      for (var i = 0; i < icons.length; i++) {
        icons[i].display();
      }
    }
  }

  if (playing) {
    cursor.update();
    if (showCursor.checked()) {
      cursor.display();
    }
    strokePlayer(cursor.angle);
  }
  pop();

  textAlign(CENTER, CENTER);
  textSize(30);
  strokeWeight(5);
  stroke(0);
  fill(mainColor);
  text(talName, 0, 0);

  // position = updateCursor(position);

  //cursor
  // stroke(mainColor);
  // line(0, 0, cursorX, cursorY);
  // fill("red");
  // noStroke();
  // ellipse(cursorX, cursorY, 5, 5);
}

function start() {
  //restart values
  strokeCircles = [];
  icons = [];
  // strokePlayPoints = [];
  cursorX = 0;
  cursorY = -radiusBig;
  var angle = 0;
  button.html(lang_start);
  if (button.attribute("disabled")) {
    button.removeAttribute("disabled");
  }
  playing = false;

  var tal = talInfo[talMenu[select.value()]];
  talName = tal.name + "\n" + tal.nameTrans;
  avart = tal.avart;
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
      var icon = new CreateIcon(matra, vibhag, radius1*1.2*1.5);
      icons.push(icon);
    } else if ((stroke["vibhag"] % 1) < 0.101) {
      circleType = 1;
      var icon = new CreateIcon(matra, vibhag, radius1*1.5);
      icons.push(icon);
    } else if ((stroke["vibhag"] * 10 % 1) == 0) {
      circleType = 2;
    } else {
      circleType = 3;
    }
    var bol = stroke["bol"];
    var strokeCircle = new CreateStrokeCircle(matra, vibhag, circleType, bol);
    strokeCircles[i] = strokeCircle;
  }
  slider.value(tempoInit);
  showTheka.removeAttribute("disabled");
  showTheka.attribute("style", "color:rgba(0, 0, 0, 0.6);");
  showTheka.checked("true");
  showCursor.attribute("disabled", "true");
  showCursor.attribute("style", "color:rgba(0, 0, 0, 0.4);");
  showCursor.checked("true");
  showTal.attribute("disabled", "true");
  showTal.attribute("style", "color:rgba(0, 0, 0, 0.4);");
  showTal.checked("true");
  updateTempo();
}

function CreateStrokeCircle (matra, vibhag, circleType, bol) {
  this.bol = bol;
  this.sound = soundDic[this.bol]
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
    this.volume = 1;
  } else if (circleType == 1) {
    this.radius = radius1;
    this.txtSize = radius1 * 0.75;
    this.txtStyle = BOLD;
    this.volume = 1;
  } else if (circleType == 2){
    this.radius = radius2;
    this.txtSize = radius2 * 0.75;
    this.txtStyle = BOLD;
    this.volume = 0.5;
  } else {
    this.radius = radius2;
    this.txtSize = radius2 * 0.75;
    this.col = color(0, 0);
    this.txtStyle = NORMAL;
    this.strokeWeight = 0;
    this.txtW = 2;
    increment = 1.05;
    this.volume = 0.5;
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

  this.clicked = function () {
    var x = -mouseY+height/2;
    var y = mouseX-width/2;
    var d = dist(this.x, this.y, x, y);
    if (d < this.radius) {
      if (this.bol.toLowerCase() == "traka") {
        soundDic["traka"].play(); // the key "traka" contains the sound "tra"
        soundDic[""].play(startTime=0.2); // the key "" contains the sound "ka"
      } else {
        soundDic[this.bol.toLowerCase()].play();
      }
    }
  }
}

function CreateCursor () {
  this.x = 0;
  this.y = -radiusBig;
  this.angle = 0;
  this.position = 0;
  this.update = function () {
    var position = millis() - timeDiff;
    var increase = position - this.position;
    this.angle += (360 * increase) / speed;
    if (this.angle > 360) {
      this.angle -= 360;
    }
    this.x = radiusBig * cos(this.angle);
    this.y = radiusBig * sin(this.angle);
    this.position = position;
  }
  this.display = function () {
    fill("red");
    stroke(50);
    strokeWeight(1);
    ellipse(this.x, this.y, 5, 5)
  }
}

function CreateShade () {
  this.x = 0;
  this.y = -radiusBig;
  this.angle = 0;
  this.position = 0;
  this.alpha = 0;
  this.col = mainColor;
  this.update = function () {
    var position = millis() - timeDiff;
    var increase = position - this.position;
    this.angle += (360 * increase) / speed;
    if (this.angle > 360) {
      this.angle -= 360;
    }
    // var alphaAngle = this.angle + 90;
    // if (alphaAngle > 360) {
    //   alphaAngle -= 360;
    // }
    this.alpha = map(this.angle, 0, 360, 0, 255);
    this.x = radiusBig * cos(this.angle);
    this.y = radiusBig * sin(this.angle);
    this.position = position;
  }
  this.display = function () {
    this.col.setAlpha(this.alpha);
    fill(this.col);
    noStroke();
    arc(0, 0, radiusBig, radiusBig, 0, this.angle);
  }
}

function CreateIcon (matra, vibhag, size) {
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

function strokePlayer (angle) {
  var checkPoint = strokeCircles[strokeToPlay].circleAngle;
  var sound = strokeCircles[strokeToPlay].sound;
  if (checkPoint == 0) {
    if (angle < strokeCircles[strokeCircles.length-1].circleAngle) {
      if (sound != undefined) {
        sound.setVolume(strokeCircles[strokeToPlay].volume);
        sound.play();
      }
      strokeToPlay++;
    }
  } else {
    if (angle >= checkPoint) {
      if (sound != undefined) {
        sound.setVolume(strokeCircles[strokeToPlay].volume);
        sound.play();
      }
      strokeToPlay++;
    }
  }
  if (strokeToPlay == strokeCircles.length) {
    strokeToPlay = 0;
  }
}

function updateTempo () {
  tempo = slider.value();
  speed = avart * (60 / tempo) * 1000;
}

function playTal() {
  if (playing == false) {
    timeDiff = millis();
    cursor = new CreateCursor();
    shade = new CreateShade();
    playing = true;
    button.html(lang_stop);
    strokeToPlay = 0;
    strokePlayer(0);
    showCursor.removeAttribute("disabled");
    showCursor.attribute("style", "color:rgba(0, 0, 0, 0.6);");
    showTal.removeAttribute("disabled");
    showTal.attribute("style", "color:rgba(0, 0, 0, 0.6);");
  } else {
    playing = false;
    button.html(lang_start);
    showCursor.attribute("disabled", "true");
    showCursor.attribute("style", "color:rgba(0, 0, 0, 0.4);");
    showTal.attribute("disabled", "true");
    showTal.attribute("style", "color:rgba(0, 0, 0, 0.4);");
  }
}

function mouseClicked() {
  if (loaded == false) {
    var init = millis();
    dha = loadSound("../sounds/tablaStrokes/dha.mp3");
    soundDic["dha"] = dha;
    dhin = loadSound("../sounds/tablaStrokes/dhin.mp3");
    soundDic["dhin"] = dhin;
    ge = loadSound("../sounds/tablaStrokes/ga.mp3");
    soundDic["ge"] = ge;
    kat = loadSound("../sounds/tablaStrokes/kat.mp3");
    soundDic["kat"] = kat;
    ki = loadSound("../sounds/tablaStrokes/ka.mp3");
    soundDic["ki"] = ki;
    soundDic[""] = ki;
    na = loadSound("../sounds/tablaStrokes/na.mp3");
    soundDic["na"] = na;
    ra = loadSound("../sounds/tablaStrokes/re.mp3");
    soundDic["ra"] = ra;
    ta = loadSound("../sounds/tablaStrokes/na.mp3");
    soundDic["ta"] = ta;
    ti = loadSound("../sounds/tablaStrokes/te.mp3");
    soundDic["te"] = ti;
    soundDic["ti"] = ti;
    tin = loadSound("../sounds/tablaStrokes/tin.mp3");
    soundDic["tin"] = tin;
    tun = loadSound("../sounds/tablaStrokes/tun.mp3");
    soundDic["tun"] = tun;
    tra = loadSound("../sounds/tablaStrokes/tra.mp3");
    soundDic["traka"] = tra;
    var end = millis();
    print('Sounds loaded in ' + str(end-init)/1000 + ' seconds.');
    loaded = true;
  }
  if (playing == false) {
    for (var i = 0; i < strokeCircles.length; i++) {
      strokeCircles[i].clicked();
    }
  }
}
