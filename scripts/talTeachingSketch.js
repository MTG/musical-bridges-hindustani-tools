var step;
var talInfo;
var talName;
var talMenu;
var avart;
var strokeCircles = [];
var sam;
var strokePoints = [];
var radiusBig;
var radius1 = 27;
var radius2 = 20;
var backColor;
var mainColor;
var matraColor;
var speed;
var tempo;
var cursor;
var shade;
var playing = false;
var timeDiff;

var slider;
var select;
var playButton;
var forwardButton;
var backButton;
var showTheka;
var showCursor;
var showTal;
var margin = 10;
var loaded = false;

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
var cymbals;
var click;
var soundDic = {};
var strokeList = [];
var strokeToPlay = 0;

var wave;
var clap;
var iconSamSize = radius1*1.7;
var iconSize = radius2*1.7;
var iconDistance = 0.72;
var icons = [];

var lang = 'en'
var labels = {
  en: {
    choose: 'Choose a tāl',
    start: 'Start!',
    stop: 'Stop'
  },
  es: {
    choose: 'Elige un tāl',
    start: '¡Comienza!',
    stop: 'Para'
  }
}

function preload () {
  talInfo = loadJSON("files/talInfo.json");
  wave = loadImage("images/wave.svg");
  clap = loadImage("images/clap.svg");
}

function setup () {
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
  //html interaction
  forwardButton = createButton(" ►")
    .size(30, 25)
    .position(width-25-margin, height-25-margin)
    .mousePressed(forward)
    .attribute("disabled", "true")
    .parent("sketch-holder");
  backButton = createButton("◄")
    .size(30, 25)
    .position(margin, height-25-margin)
    .mousePressed(back)
    .attribute("disabled", "true")
    .parent("sketch-holder");
  slider = createSlider(5, 300)
    .position(margin, forwardButton.position()["y"]-25-margin/2)
    .size(width-margin*2, 20)
    .changed(updateTempo)
    .parent("sketch-holder");
  select = createSelect()
    .size(100, 25)
    .position(margin, margin)
    .changed(start)
    .parent("sketch-holder");
  select.option(labels[lang]['choose']);
  var noTal = select.child();
  // print(noTal[0]);
  noTal[0].setAttribute("selected", "true");
  noTal[0].setAttribute("disabled", "true");
  noTal[0].setAttribute("hidden", "true");
  noTal[0].setAttribute("style", "display: none");
  talMenu = Object.keys(talInfo);
  select.option(talInfo[talMenu[0]].nameTrans + " (" + talInfo[talMenu[0]].avart + ")", 0);
  for (var i = 1; i < talMenu.length; i++) {
    select.option(talInfo[talMenu[i]].nameTrans + " (" + talInfo[talMenu[i]].avart + ")", i);

  }
  showCursor = createCheckbox(' cursor', true)
    .position(margin, height*0.1)
    .parent("sketch-holder");
  showTheka = createCheckbox(' ṭhekā', true)
    .position(margin, showCursor.position()["y"]+showCursor.height+5)
    .parent("sketch-holder");
  showTal = createCheckbox(' tāl', true)
    .position(margin, showTheka.position()["y"]+showTheka.height+5)
    .changed(function() {
      showTheka.checked(showTal.checked());
    })
    .parent("sketch-holder");
  showCursor.attribute("disabled", "true");
  showCursor.attribute("style", "color:rgba(0, 0, 0, 0.4);");
  showTheka.attribute("disabled", "true");
  showTheka.attribute("style", "color:rgba(0, 0, 0, 0.4);");
  showTheka.attribute("hidden", "true");
  showTal.attribute("disabled", "true");
  showTal.attribute("style", "color:rgba(0, 0, 0, 0.4);");
  showTal.attribute("hidden", "true");
  playButton = createButton(labels[lang]['start'])
    .size(90, 25)
    .position(width-90-margin, margin)
    .mousePressed(playTal)
    .parent("sketch-holder")
    .attribute("disabled", "true");
}

function draw () {
  background(backColor);
  tempo = slider.value();
  fill(0);
  noStroke();
  textAlign(LEFT, BOTTOM);
  textSize(12);
  text(str(tempo)+" mpm", margin, slider.position()["y"]-margin/2);

  translate(width/2, forwardButton.position()["y"]/2  );

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

  if (step < 3) {
    strokePoints[0].display2();
  }

  if (step == 1) {
    for (var i = 1; i < strokePoints.length; i++) {
      strokePoints[i].display1();
    }
  }

  if (step == 2) {
    for (var i = 1; i < strokePoints.length; i++) {
      strokePoints[i].display2();
    }
  }

  //draw circle per bol
  if (showTal.checked() && step >= 3) {
    for (var i = 0; i < strokeCircles.length; i++) {
      strokeCircles[i].display();
    }
    if (step >= 4) {
      for (var i = 0; i < icons.length; i++) {
        icons[i].display();
      }
    }
    if (showTheka.checked() && step == 5) {
      for (var i = 0; i < strokeCircles.length; i++) {
        strokeCircles[i].displayTheka();
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

  if (step != 0) {
    textAlign(CENTER, CENTER);
    textSize(30);
    strokeWeight(5);
    stroke(0);
    fill(mainColor);
    text(talName, 0, 0);
  }
}

function start () {
  //restart values
  strokeCircles = [];
  strokePoints = [];
  icons = [];
  cursorX = 0;
  cursorY = -radiusBig;
  var angle = 0;
  playButton.html(labels[lang]['start']);
  if (playButton.attribute("disabled")) {
    playButton.removeAttribute("disabled");
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
    // if (strokeCircle.circleAngle < 0) {
    //   strokePlayPoints[i] = 360 + strokeCircle.circleAngle;
    // } else {
    //   strokePlayPoints[i] = strokeCircle.circleAngle;
    // }
  }
  step = 0;
  forwardButton.removeAttribute("disabled");
  backButton.attribute("disabled", "true");
  slider.value(tempoInit);
  showCursor.attribute("disabled", "true");
  showCursor.attribute("style", "color:rgba(0, 0, 0, 0.4);");
  showCursor.checked("true");
  showTheka.removeAttribute("disabled");
  showTheka.attribute("style", "color:rgba(0, 0, 0, 0.6);");
  showTheka.checked("true");
  showTheka.attribute("hidden", "true");
  showTal.attribute("disabled", "true");
  showTal.attribute("style", "color:rgba(0, 0, 0, 0.4);");
  showTal.checked("true");
  showTal.attribute("hidden", "true");
  updateTempo();
}

function forward () {
  if (step == 0) {
    backButton.removeAttribute("disabled");
  }
  if (step < 5) {
    step ++;
  }
  if (step == 5) {
    forwardButton.attribute("disabled", "true");
    showTheka.removeAttribute("hidden");
    showTal.removeAttribute("hidden");
  }
  if (playing) {
    playing = false;
    playButton.html(labels[lang]['start']);
  }
}

function back () {
  if (step == 5) {
    forwardButton.removeAttribute("disabled");
    showTheka.attribute("hidden", "true");
    showTal.attribute("hidden", "true");
  }
  if (step > 0) {
    step --;
  }
  if (step == 0) {
    backButton.attribute("disabled", "true");
  }
  if (playing) {
    playing = false;
    playButton.html(labels[lang]['start']);
  }
}

function CreateStrokeCircle (matra, vibhag, circleType, bol) {
  this.bol = bol;
  this.sound = soundDic[this.bol]
  var increment = 1;
  this.strokeWeight = 2;
  this.txtW = 0;
  this.angle = map(matra, 0, avart, 0, 360);

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
    var strokePoint = new CreateStrokePoint(radius1*1.2-radius2, radius1*1.2-radius2, 6, this.angle, cymbals, 1);
    strokePoints.push(strokePoint);
  } else if (circleType == 1) {
    this.radius = radius1;
    this.txtSize = radius1 * 0.75;
    this.txtStyle = BOLD;
    this.volume = 1;
    var strokePoint = new CreateStrokePoint(0, radius1-radius2, 3, this.angle, click, 0.8);
    strokePoints.push(strokePoint);
  } else if (circleType == 2){
    this.radius = radius2;
    this.txtSize = radius2 * 0.75;
    this.txtStyle = BOLD;
    this.volume = 0.5;
    var strokePoint = new CreateStrokePoint(0, 0, 0, this.angle, click, 0.3);
    strokePoints.push(strokePoint);
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

  this.x = radiusBig * increment * cos(this.angle);
  this.y = radiusBig * increment * sin(this.angle);

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
    if (step == 5) {
      var x = -mouseY+forwardButton.position()["y"]/2;
      var y = mouseX-width/2;
      var d = dist(this.x, this.y, x, y);
      if (d < this.radius) {
        soundDic[this.bol.toLowerCase()].play();
      }
    }
  }
}

function CreateStrokePoint (sam, increment, extraWeight, angle, sound, volume) {
  this.angle = angle;
  this.sound = sound;
  this.volume = volume;
  this.x10 = (radiusBig - radius2 - sam) * cos(this.angle);
  this.x11 = (radiusBig + radius2 + sam) * cos(this.angle);
  this.x20 = (radiusBig - radius2 - increment) * cos(this.angle);
  this.x21 = (radiusBig + radius2 + increment) * cos(this.angle);
  this.y10 = (radiusBig - radius2 - sam) * sin(this.angle);
  this.y11 = (radiusBig + radius2 - sam) * sin(this.angle);
  this.y20 = (radiusBig - radius2 - increment) * sin(this.angle);
  this.y21 = (radiusBig + radius2 + increment) * sin(this.angle);
  this.weight1 = 2;
  this.weight2 = 2 + extraWeight;
  this.display1 = function () {
    stroke(50);
    strokeWeight(this.weight1);
    line(this.x10, this.y10, this.x11, this.y11);
  }
  this.display2 = function () {
    stroke(50);
    strokeWeight(this.weight2);
    line(this.x20, this.y20, this.x21, this.y21);
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
  var checkPoint = strokeList[strokeToPlay].angle;
  var sound = strokeList[strokeToPlay].sound;
  if (checkPoint == 0) {
    if (angle < strokeList[strokeList.length-1].angle) {
      sound.setVolume(strokeList[strokeToPlay].volume);
      sound.play();
      strokeToPlay++;
    }
  } else {
    if (angle >= checkPoint) {
      if (step == 0) {
        sound.setVolume(0);
      } else if (step == 1) {
        sound.setVolume(0.3);
      } else {
        sound.setVolume(strokeList[strokeToPlay].volume);
      }
      sound.play();
      strokeToPlay++;
    }
  }
  if (strokeToPlay == strokeList.length) {
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
    playButton.html(labels[lang]['stop']);
    if (step < 5) {
      strokeList = strokePoints;
    } else {
      strokeList = strokeCircles;
    }
    strokeToPlay = 0;
    strokePlayer(0);
    showCursor.removeAttribute("disabled");
    showCursor.attribute("style", "color:rgba(0, 0, 0, 0.6);");
    showTal.removeAttribute("disabled");
    showTal.attribute("style", "color:rgba(0, 0, 0, 0.6);");
  } else {
    playing = false;
    playButton.html(labels[lang]['start']);
    showCursor.attribute("disabled", "true");
    showCursor.attribute("style", "color:rgba(0, 0, 0, 0.4);");
    showTal.attribute("disabled", "true");
    showTal.attribute("style", "color:rgba(0, 0, 0, 0.4);");
  }
}

function mouseClicked() {
  if (loaded == false) {
    var init = millis();
    dha = loadSound("sounds/tablaStrokes/dha.mp3");
    soundDic["dha"] = dha;
    dhin = loadSound("sounds/tablaStrokes/dhin.mp3");
    soundDic["dhin"] = dhin;
    ge = loadSound("sounds/tablaStrokes/ga.mp3");
    soundDic["ge"] = ge;
    kat = loadSound("sounds/tablaStrokes/kat.mp3");
    soundDic["kat"] = kat;
    ki = loadSound("sounds/tablaStrokes/ka.mp3");
    soundDic["ki"] = ki;
    na = loadSound("sounds/tablaStrokes/na.mp3");
    soundDic["na"] = na;
    ra = loadSound("sounds/tablaStrokes/re.mp3");
    soundDic["ra"] = ra;
    ta = loadSound("sounds/tablaStrokes/na.mp3");
    soundDic["ta"] = ta;
    ti = loadSound("sounds/tablaStrokes/te.mp3");
    soundDic["te"] = ti;
    soundDic["ti"] = ti;
    tin = loadSound("sounds/tablaStrokes/tin.mp3");
    soundDic["tin"] = tin;
    tun = loadSound("sounds/tablaStrokes/tun.mp3");
    soundDic["tun"] = tun;
    cymbals = loadSound("sounds/cymbals.mp3");
    click = loadSound("sounds/click.mp3");
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

function keyPressed() {
  console.log(key);
  if (key == "ArrowRight") {
    forward();
  } else if (key == "ArrowLeft") {
    back();
  } else if (key == " ") {
    playTal();
  }
}
