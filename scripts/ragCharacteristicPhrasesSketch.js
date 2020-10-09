var extraSpaceH = 45;
var extraSpaceW = 200;
var spaceWidth = 870;
var spaceHeight = 600;
var title_x = 20;
var title_y = 20;
var title_size = 25;
var easing = 0.5;
var backColor;
var backColorTrans;
var frontColor;
var shadeColor;

var recordingsInfo;
var recordingsList;
var ragInfo;
var pitchSpace;
var svaraList = [];
var soundList = {};
var phrasesList = [];
var currentPhrase;
var phraseIndex = 0;
var svaraRadius = 20;
var svaraLine = 20;
// var minHz;
// var maxHz;
var pitchTrack;
// var melodicLine = {};
var phrasesTimestamps = [];
var phraseVerticalNumber = 15;
var phraseH = (spaceHeight - 20) / phraseVerticalNumber;
var phrasesWindowMargin = 15;
var trackFile;
var track;
var trackDuration;
var ragName;
var artist;
var link;

var selectMenu;
var buttonPlay;

var cursorTop;
var cursorBottom;
var cursorY = 0;
var navBoxH = 50;
var navCursor;
var navBox;
var navCursorW = 4;
var samList = [];
var melCursorX;
var melCursorRadius = 6;
var melCursorColor = "white";
var clock;
var mpmTxt;

var talInfo;
var talCursor;
var talX;
var talY;
var talRadius;
var talBoxes = [];
var talList = {};
var talCircles = {};
// var talName = undefined;
// var currentTal = undefined;
// var currentAvart;
var strokeRadius1 = 20;
var strokeRadius2 = 15;
var iconDistance = 0.7;

var failedLoading;
var loaded = false;
var paused = true;
// var charger;
var currentTime = 0;
var jump;
// Language
var lang_select;
var lang_load;
var lang_error;
var lang_start;
var lang_pause;
var lang_continue;
var lang_loading;

var svaras = "SrRgGmMPdDnN";
var svarasDic = {"S": "Sa", "r": "Re", "R": "Re", "g": "Ga", "G": "Ga", "m": "Ma", "M": "Ma", "P": "Pa", "d": "Dha",
                 "D": "Dha", "n": "Ni", "N": "Ni"};
var octave0 = "qwertyuiop";
var octave1 = "asdfghjkl;";
var octave2 = "zxcvbnm,./";

function preload() {
  recordingsList = loadJSON("../files/ragFollowing-pitchLine-recordingsList.json");
  recordingsInfo = loadJSON("../files/recordingsInfo.json");
  ragInfo = loadJSON("../files/ragInfo.json");
  talInfo = loadJSON("../files/talInfo.json");
}

function setup () {
  var canvas = createCanvas(extraSpaceW+spaceWidth, extraSpaceH+spaceHeight);
  var div = select("#sketch-holder");
  div.style("width: " + width + "px; margin: 10px auto; position: relative;");
  canvas.parent("sketch-holder");

  background(254, 249, 231);

  ellipseMode(RADIUS);
  angleMode(DEGREES);
  imageMode(CENTER);
  textFont("Laila");
  strokeJoin(ROUND);
  strokeCap(ROUND);

  backColor = color(240, 128, 128);
  backColorTrans = color(120, 0, 0, 100);
  frontColor = color(120, 0, 0);
  shadeColor = color(120, 0, 0);

  navBox = new CreateNavigationBox();
  navCursor = new CreateNavCursor();

  cursorTop = extraSpaceH + title_y + title_size + 20 + svaraRadius;
  cursorBottom = navBox.y1 - 20 - svaraRadius;
  melCursorX = width - (svaraRadius * 4) - svaraLine - 20;
  svaraLineX1 = extraSpaceW + (svaraRadius * 4) + svaraLine + 10;

  //Language
  var lang = select("html").elt.lang;
  if (lang == "es") {
    lang_load = "Carga el audio";
    lang_select = "Elige";
    lang_error = "Ha habido un problema cargando el audio\nPor favor, vuelve a cargar la página";
    lang_start = "¡Comienza!";
    lang_pause = "Pausa";
    lang_continue = "Sigue";
    lang_loading = "Cargando...";
  } else if (lang == "en") {
    lang_load = "Load the audio";
    lang_select = "Select";
    lang_error = "There was a problem loading the audio\nPlease, reaload the page";
    lang_start = "Start!";
    lang_pause = "Pause";
    lang_continue = "Play";
    lang_loading = "Loading...";
  }

  infoLink = select("#sa-info-link");
  infoLink.position(width - 10 - 45, extraSpaceH + 10);
  selectMenu = createSelect()
    .size(extraSpaceW-20, 25)
    .position(10, 10)
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
  buttonPlay = createButton(lang_load)
    .size(120, 25)
    .position(width - 120 - 10, 10)
    .mouseClicked(player)
    .attribute("disabled", "true")
    .parent("sketch-holder");
}

function draw () {
  fill(backColor);
  noStroke();
  rect(0, extraSpaceH, width, height);

  textAlign(LEFT, BOTTOM);
  textStyle(NORMAL);
  textSize(title_size);
  strokeWeight(5);
  stroke(frontColor);
  fill(backColor);
  if (ragName != undefined) {
    var ragW = textWidth(ragName);
  }
  text(ragName, extraSpaceW + title_x, extraSpaceH + title_y + title_size);

  stroke(0, 50);
  strokeWeight(1);
  line(extraSpaceW + 20, extraSpaceH + title_y + title_size + 10, width - 20, extraSpaceH + title_y + title_size + 10);

  stroke(0, 150);
  strokeWeight(1);
  textSize(title_size*0.9);
  fill(0, 150);
  text(" - " + artist, extraSpaceW + title_x + ragW, extraSpaceH + title_y + title_size);

  stroke(frontColor);
  strokeWeight(2);
  noFill();
  rect(phrasesWindowMargin/2, extraSpaceH+10,
       extraSpaceW-phrasesWindowMargin/2, spaceHeight-20, 10);

  for (var i = 0; i < svaraList.length; i++) {
    svaraList[i].displayLines();
  }
  for (var i = 0; i < svaraList.length; i++) {
    svaraList[i].displaySvara();
  }

  navBox.displayBack();

  navCursor.update();
  
  if (loaded) {
    clock.display();

    if (!paused) {
      currentTime = track.currentTime();
    }

    for (var i = 0; i < melCursorX - svaraLineX1; i++) {
      var thisPoint = melCursorX - svaraLineX1 - i;
      var lineX1 = (int(currentTime * 100) - thisPoint) / 100;
      if (samList.includes(lineX1)) {
        stroke(frontColor);
        strokeWeight(1);
        line(svaraLineX1+i, cursorTop-svaraRadius, svaraLineX1+i, cursorBottom);
      }
      var lineX2 = lineX1 + 0.01;
      var lineY1 = map(pitchTrack[lineX1.toFixed(2)], -700, 1900, cursorBottom, cursorTop);
      var lineY2 = map(pitchTrack[lineX2.toFixed(2)], -700, 1900, cursorBottom, cursorTop);
      if (lineY1 <= cursorBottom && lineY1 >= cursorTop && lineY2 <= cursorBottom && lineY2 >= cursorTop) {
        if (phrasesTimestamps.includes(lineX1.toFixed(2))) {
          stroke(255, 0, 0);
          fill(255, 0, 0);
        } else {
          stroke(255);
          fill(255);
        }
        strokeWeight(4);
        line(svaraLineX1+i, lineY1, svaraLineX1+i+1, lineY2);
      }
    }
    var p = pitchTrack[currentTime.toFixed(2)];
    if (p != "s" && p >= -700 && p <= 1900) {
      var targetY = map(p, -700, 1900, cursorBottom, cursorTop);
      cursorY += (targetY - cursorY) * easing;
      stroke(frontColor);
      strokeWeight(1);
      ellipse(melCursorX, cursorY, melCursorRadius, melCursorRadius);
    }
  }

  for (var i = 0; i < talBoxes.length; i++) {
    talBoxes[i].display();
  }

  for (var i = 0; i < phrasesList.length; i++) {
    phrasesList[i].update();
    phrasesList[i].display();
  }

  navCursor.display();

  textAlign(RIGHT, BOTTOM);
  textSize(12);
  textStyle(NORMAL);
  noStroke();
  fill(frontColor);
  text(mpmTxt, extraSpaceW + 10 + 65, navBox.y1 - 5);

  navBox.displayFront();
}

function start () {
  if (loaded) {
    track.stop();
  }
  paused = true;
  loaded = false;
  currentTime = 0;
  jump = undefined;
  talBoxes = [];
  talList = [];
  // talName = undefined;
  samList = [];
  // currentTal = undefined;
  mpmTxt = undefined;
  currentPhrase = undefined;
  // melodicLine = {}
  phrasesTimestamps = [];
  svaraList = [];
  soundList = {};
  phrasesList = [];

  var currentRecording = recordingsInfo[recordingsList[selectMenu.value()].mbid];
  trackFile = currentRecording.info.trackFile;
  var rag = ragInfo[currentRecording.rag.rag];
  var sa = currentRecording.rag.sa;
  var intonation = currentRecording.rag.intonation;
  ragName = rag.name + " " + rag.nameTrans;
  artist = currentRecording.info.artist;
  link = currentRecording.info.link;
  infoLink.attribute("href", link)
    .html("+info");
  trackDuration = currentRecording.info.duration;
  pitchSpace = rag.pitchSpace;
  var key;
  var keyIndex = 0;
  for (var i = 0; i < pitchSpace.length; i++) {
    var svaraName = pitchSpace[i];
    var svaraIndex = svaras.search(svaraName);
    if (svaraIndex >= 5) {
      var cents = svaraIndex * 100 - 1200;
      var peak = intonation[svaraName+"0"];
      if (peak != undefined) {
        key = octave0[keyIndex];
        createSound(cents, sa, key);
        keyIndex++
      } else {
        key = "";
      }
      var svara = new CreateSvara(svaraName, cents, rag.vadi, rag.samvadi, key);
      svaraList.push(svara);
    }
  }
  var keyIndex = 0;
  for (var i = 0; i < pitchSpace.length; i++) {
    var svaraName = pitchSpace[i];
    var cents = svaras.search(svaraName) * 100;
    var peak = intonation[svaraName+"1"];
    if (peak != undefined) {
      key = octave1[keyIndex];
      createSound(cents, sa, key);
      keyIndex++
    } else {
      key = "";
    }
    var svara = new CreateSvara(svaraName, cents, rag.vadi, rag.samvadi, key);
    svaraList.push(svara);
  }
  var keyIndex = 0;
  for (var i = 0; i < pitchSpace.length; i++) {
    var svaraName = pitchSpace[i];
    var svaraIndex = svaras.search(svaraName);
    if (svaraIndex <= 7) {
      var cents = svaraIndex * 100 + 1200;
      var peak = intonation[svaraName+"2"];
      if (peak != undefined) {
        key = octave2[keyIndex];
        createSound(cents, sa, key);
        keyIndex++
      } else {
        key = "";
      }
      var svara = new CreateSvara(svaraName, cents, rag.vadi, rag.samvadi, key);
      svaraList.push(svara);
    }
  }
  phrases = currentRecording.rag.phrases;
  var labels = Object.keys(phrases);
  if (labels.length > 0) {
    for (var i = 0; i < labels.length; i++) {
      var phrase = new CreatePhrase(phrases[labels[i]], labels[i], i, labels.length);
      phrasesList.push(phrase);
    }
  }

  pitchTrack = loadJSON('../files/pitchTracks/'+recordingsList[selectMenu.value()].mbid+'_pitchTrack.json');

  for (var i = 0; i < currentRecording.talList.length; i++) {
    var tal = currentRecording.talList[i];
    talList[tal.tal] = {
      "start": tal.start,
      "end": tal.end,
      "sam": tal.sam
    }
    samList = samList.concat(tal.sam);
    var talBox = new CreateTalBox(tal);
    talBoxes.push(talBox);
  }

  clock = new CreateClock;

  buttonPlay.html(lang_load);
  buttonPlay.removeAttribute("disabled");
}

function CreateNavigationBox () {
  this.x1 = extraSpaceW + 10;
  this.x2 = width - 10;
  this.y1 = height - 10 - navBoxH;
  this.y2 = height - 10;
  this.w = this.x2 - this.x1;

  this.displayBack = function () {
    fill(0, 50);
    noStroke();
    rect(this.x1, this.y1, this.w, navBoxH);
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
    line(this.x1+1, this.y1, this.x2, this.y1);
    line(this.x2, this.y1, this.x2, this.y2);
    strokeWeight(1);
    line(this.x1, this.y1, this.x1, this.y2);
    line(this.x1, this.y2, this.x2, this.y2);
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
  }
}

function CreateNavCursor () {
  this.x = navBox.x1 + navCursorW/2;

  this.update = function () {
    this.x = map(currentTime, 0, trackDuration, navBox.x1+navCursorW/2, navBox.x2-navCursorW/2);
    var noTal = true;
    for (var i = 0; i < talBoxes.length; i++) {
      var talBox = talBoxes[i];
      if (this.x > talBox.x1 && this.x < talBox.x2) {
        talBox.on();
        noTal = false;
      } else {
        talBox.off();
      }
    }

    if (navBox.x2 - navCursorW/2 - this.x < 0.1) {
      buttonPlay.html(lang_start);
      track.stop();
      paused = true;
      currentTime = 0;
      phraseIndex = 0;
    }
  }

  this.display = function () {
    stroke(frontColor);
    strokeWeight(navCursorW);
    line(this.x, navBox.y1+navCursorW/2, this.x, navBox.y2-navCursorW/2);
  }
}

function CreateSvara (svara, cents, vadi, samvadi, key) {
  this.y = map(cents, -700, 1900, cursorBottom, cursorTop);
  this.name = svarasDic[svara];
  this.key = key;
  if (svara == "S") {
    this.col = frontColor;
    this.strokeW = 4;
    this.lineW = 4;
    this.txtCol = backColor;
  } else if (svara == vadi) {
    this.col = backColor;
    this.strokeW = 4;
    this.lineW = 2;
    this.txtCol = frontColor;
  } else if (svara == samvadi) {
    this.col = backColor;
    this.strokeW = 2;
    this.lineW = 2;
    this.txtCol = frontColor;
  } else {
    this.col = color(0, 0);
    this.strokeW = 0;
    this.lineW = 1;
    this.txtCol = frontColor;
  }
  if (svaraList.length == 0) {
    this.position = 0;
  } else if (svaraList[svaraList.length-1].position == 0) {
    this.position = 1;
  } else {
    this.position = 0;
  }

  this.x_adjust = svaraLine + (svaraRadius*2) * this.position;

  this.displayLines = function () {
    stroke(frontColor);
    strokeWeight(this.lineW);
    line(svaraLineX1 - this.x_adjust, this.y, melCursorX + this.x_adjust, this.y);
  }

  this.displaySvara = function () {
    stroke(frontColor);
    strokeWeight(this.strokeW);
    fill(this.col);
    ellipse(melCursorX + this.x_adjust + svaraRadius, this.y, svaraRadius, svaraRadius);
    ellipse(svaraLineX1 - this.x_adjust - svaraRadius, this.y, svaraRadius, svaraRadius);

    textAlign(CENTER, CENTER);
    noStroke();
    textSize(svaraRadius*0.9);//this.radius*0.9);
    textStyle(BOLD);//this.txtStyle);
    fill(this.txtCol);
    text(this.name, melCursorX + this.x_adjust + svaraRadius, this.y+svaraRadius*0.1);
    text(this.name, svaraLineX1 - this.x_adjust - svaraRadius, this.y+svaraRadius*0.1);
    stroke(frontColor);
    strokeWeight(3);
    fill(backColor);
    textSize(svaraRadius*0.7);
    textStyle(NORMAL);
    text(this.key, melCursorX + this.x_adjust + svaraRadius + textWidth(this.name), this.y + (svaraRadius*0.9)/2)
  }
}

function CreatePhrase (phrase, label, index, total) {
  this.x = phrasesWindowMargin + (extraSpaceW-phrasesWindowMargin)/2 * int(index/phraseVerticalNumber);
  this.h = phraseH * 0.65;
  this.center = extraSpaceH + 10 + phraseH/2 + (phraseH * (index % phraseVerticalNumber));
  this.y = this.center - this.h/2;
  this.w = (extraSpaceW-30)/2;
  this.label = label;
  this.index = index;
  this.fill;
  this.stroke;
  this.strokeWeight;
  this.lfill;
  this.bold;
  this.phraseBoxes = [];
  for (var i = 0; i < phrase.length; i++) {
    var start = phrase[i].s;
    var end = phrase[i].e;
    for(var j = start; j <= end; j+=0.01) {
      phrasesTimestamps.push(j.toFixed(2));
    }
    var phraseBox = new CreatePhraseBox(start, end);
    this.phraseBoxes.push(phraseBox);
  }
  this.selected = false;

  this.update = function () {
    for (var i = 0; i < this.phraseBoxes.length; i++) {
      var s = this.phraseBoxes[i].start;
      var e = this.phraseBoxes[i].end;
      if (currentTime >= s && currentTime <= e) {
        this.fill = color(255, 230);
        this.stroke = frontColor;
        this.strokeWeight = 2;
        this.lfill = frontColor;
        this.bold = true;
        break;
      } else {
        this.fill = color(255, 50);
        if (this.selected) {
          this.stroke = frontColor;
          this.strokeWeight = 2;
        } else {
          this.stroke = color(150);
          this.strokeWeight = 1;
        }
        this.lfill = color(30);
        this.bold = false;
      }
    }
  }

  this.display = function () {
    stroke(this.stroke);
    strokeWeight(this.strokeWeight);
    fill(this.fill);
    rect(this.x, this.y, this.w, this.h, 10, 10, 10, 10);
    textAlign(CENTER, CENTER);
    textStyle(NORMAL);
    if (this.bold) {
      stroke(this.lfill);
      strokeWeight(1);
    } else {
      noStroke();
    }
    textSize(phraseH * 0.35);
    fill(this.lfill);
    text(this.label, this.x+this.w/2, this.center+phraseH*0.1);
    if (this.selected) {
      for (var i = 0; i < this.phraseBoxes.length; i++) {
        this.phraseBoxes[i].display();
      }
    }
  }

  this.clicked = function () {
    if (mouseX > this.x && mouseX < this.x+this.w &&
        mouseY > this.y && mouseY < this.y+this.h) {
      if (this.selected) {
        this.selected = false;
      } else {
        for (var i = 0; i < phrasesList.length; i++) {
          phrasesList[i].selected = false;
        }
        this.selected = true;
      }
    }
  }
}

function CreatePhraseBox (start, end) {
  this.start = start;
  this.end = end;
  this.x1 = map(this.start, 0, trackDuration,
                navBox.x1+navCursorW/2, navBox.x2-navCursorW/2);
  this.x2 = map(this.end, 0, trackDuration,
                navBox.x1+navCursorW/2, navBox.x2-navCursorW/2);
  this.w = this.x2 - this.x1;
  this.y1 = navBox.y1 + navBoxH / 2 + 2;
  this.y2 = navBox.y2 - 1;
  this.h = this.y2 - this.y1;

  this.display = function () {
    stroke(255, 0, 0);
    strokeWeight(3);
    fill(255, 230);
    rect(this.x1, this.y1, this.w, this.h);
  }
}

function createSound (cents, sa, key) {
  this.pitch = sa * (2 ** (cents/1200.));
  this.osc = new p5.Oscillator();
  this.osc.setType("sawtooth");
  this.osc.freq(this.pitch);
  soundList[key] = this.osc;
}

function CreateTalBox (tal) {
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
  this.txtBorder = 0;
  this.txtCol = color(75);
  this.txtStyle = NORMAL;
  this.currentSamIndex = 0;

  this.off = function () {
    this.boxCol = color(255, 100);
    this.txtCol = color(75);
    this.txtBorder = 0;
    this.txtStyle = NORMAL;
  }

  this.on = function () {
    this.boxCol = backColorTrans;
    this.txtCol = color(255);
    this.txtBorder = 2;
    this.txtStyle = NORMAL;
  }

  this.display = function () {
    fill(this.boxCol);
    noStroke();
    rect(this.x1, navBox.y1, this.w, this.h);
    textAlign(LEFT, BOTTOM);
    textSize(this.h * 0.7);
    fill(this.txtCol);
    textStyle(this.txtStyle);
    stroke(0);
    strokeWeight(this.txtBorder);
    text(this.name, this.x1+2, navBox.y1 + this.h*0.92);
  }
}

function CreateClock () {
  this.clock;
  this.total = niceTime(trackDuration);
  this.now;
  this.display = function () {
    this.now = niceTime(currentTime);
    this.clock = this.now + " / " + this.total;
    textAlign(CENTER, BOTTOM);
    textSize(12);
    textStyle(NORMAL);
    noStroke();
    fill(frontColor);
    text(this.clock, extraSpaceW + spaceWidth/2, navBox.y1 - 5);
  }
}

function player () {
  if (loaded) {
    if (paused) {
      paused = false;
      if (jump == undefined) {
        track.play();
      } else {
        track.play();
        track.jump(jump);
        jump = undefined;
      }
      buttonPlay.html(lang_pause);
    } else {
      paused = true;
      currentTime = track.currentTime();
      track.pause();
      buttonPlay.html(lang_continue);
    }
  } else {
    initLoading = millis();
    buttonPlay.html(lang_loading);
    buttonPlay.attribute("disabled", "true");
    selectMenu.attribute("disabled", "true");
    track = loadSound("../tracks/" + trackFile, soundLoaded, failedLoad);
  }
}

function soundLoaded () {
  buttonPlay.html(lang_start);
  buttonPlay.removeAttribute("disabled");
  selectMenu.removeAttribute("disabled");
  loaded = true;
  var endLoading = millis();
  print("Track loaded in " + (endLoading-initLoading)/1000 + " seconds");
}

function failedLoad () {
  print("Loading failed");
  failedLoading = true;
}

function mouseClicked () {
  if (loaded) {
    navBox.clicked();
  }
  for (var i = 0; i < phrasesList.length; i++) {
    phrasesList[i].clicked();
  }
}

function keyPressed () {
  soundList[key.toLowerCase()].start();
}

function keyReleased () {
  soundList[key.toLowerCase()].stop();
}

function niceTime (seconds) {
  var niceTime;
  var sec = int(seconds%60);
  var min = int(seconds/60);
  niceTime = str(min).padStart(2, "0") + ":" + str(sec).padStart(2, "0");
  return niceTime
}
