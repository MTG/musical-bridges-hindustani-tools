var extraSpaceH = 55;
var extraSpaceW = 0;
var mainSpace = 600;
var tanpura;
var backColor;
var mainColor;

var tanpuraInfo;
var sounds = [];
var soundsList;
var sadjaList = [];
var mic, recorder, recFile;
var currentSound;
var sadja;

var selectMode;
var selectLevel;
var buttonSearchSound;
var buttonPlay;
var buttonSadja;
var buttonRecord;

// Language
var lang_study;
var lang_practice;
var lang_level;
var lang_start;
var lang_play;
var lang_stop;
var lang_retune;
var lang_record;
var lang_recording;
var lang_listen;

function preload () {
  tanpuraInfo = loadJSON("../files/tanpuraInfo.json");
  tanpura = loadImage("../images/tanpura.png");
}

function setup () {
  var canvas = createCanvas(extraSpaceW+mainSpace, extraSpaceH+mainSpace);
  var div = select("#sketch-holder");
  div.style("width: " + width + "px; margin: 10px auto; position: relative;");
  canvas.parent("sketch-holder");

  ellipseMode(RADIUS);
  angleMode(DEGREES);
  imageMode(CENTER);
  textFont("Laila");
  strokeJoin(ROUND);

  mic = new p5.AudioIn();
  recorder = new p5.SoundRecorder();
  recorder.setInput(mic);
  soundFile = new p5.SoundFile();
  sadja = new p5.Oscillator();
  sadja.setType("sawtooth");

  // language
  var lang = select("html").elt.lang;
  print(lang);
  if (lang == "en") {
    lang_study = "Study mode";
    lang_practice = "Practice mode";
    lang_level = "Level";
    lang_start = "Start";
    lang_play = "Play";
    lang_stop = "Stop";
    lang_retune = "Retune";
    lang_record = "Record";
    lang_recording = "Recording...";
    lang_listen = "Listen to yourself!";
  } else if (lang == "es") {
    lang_study = "Modo estudio";
    lang_practice = "Modo práctica";
    lang_level = "Nivel";
    lang_start = "Comienza";
    lang_play = "Toca";
    lang_stop = "Para";
    lang_retune = "Re-afina";
    lang_record = "Graba";
    lang_recording = "Grabando...";
    lang_listen = "¡Escúchate!";
  }

  selectMode = createSelect()
    .size(120, 25)
    .position(15, 15)
    .changed(changeMode)
    .parent("sketch-holder");
  selectMode.option(lang_study, "0");
  selectMode.option(lang_practice, "1");
  selectLevel = createSelect()
    .size(100, 25)
    .position(selectMode.x + selectMode.width + 10, 15)
    .changed(changeLevel)
    .parent("sketch-holder");
  selectLevel.option(lang_level + " 1", "level1");
  selectLevel.option(lang_level + " 2", "level2");
  selectLevel.option(lang_level + " 3", "level3");
  buttonSearchSound = createButton(lang_start)
    .size(75, 25)
    .position(extraSpaceW + 15, extraSpaceH + mainSpace - 40)
    .mouseClicked(soundLoader)
    .parent("sketch-holder");
  buttonPlay = createButton(lang_play)
    .size(75, 25)
    .position(buttonSearchSound.x + buttonSearchSound.width + 15, buttonSearchSound.y)
    .mouseClicked(player)
    .attribute("disabled", "true")
    .parent("sketch-holder");
  buttonSadja = createButton("SA")
    .id("sadja")
    .size(40, 40)
    .position(extraSpaceW + mainSpace/2 - 20, extraSpaceH+mainSpace/2+mainSpace/3.5-20)
    .mousePressed(function () {sadja.start();})
    .style("border-radius", "50%")
    .style("font-family", "Laila")
    .style("font-size", "15px")
    .style("font-weight", "bold")
    // .style("background-color", "rgb(205, 92, 92)")
    // .style("border", "3px solid rgb(120, 0, 0)")
    .attribute("onmouseup", "sadja.stop()")
    .attribute("disabled", "true")
    .parent("sketch-holder");
  buttonRecord = createButton(lang_record)
    .size(150, 25)
    .position(buttonPlay.x + buttonPlay.width + 15, buttonPlay.y)
    .mouseClicked(recordVoice)
    .attribute("disabled", "true")
    .attribute("hidden", "true")
    .parent("sketch-holder");

  backColor = color(205, 92, 92);
  mainColor = color(77, 208, 225);

  background(254, 249, 231);
  noStroke();
  fill(backColor);
  rect(extraSpaceW, extraSpaceH, mainSpace, mainSpace);

  stroke(0, 50);
  strokeWeight(1);
  line(extraSpaceW+15*2, extraSpaceH+15*3+27, width-15*2, extraSpaceH+15*3+27);

  textAlign(CENTER, TOP);
  textStyle(NORMAL);
  textSize(30);
  strokeWeight(5);
  stroke(120, 0, 0);
  // mainColor.setAlpha(255);
  fill(backColor);
  text("Ṣaḍja", extraSpaceW+mainSpace/2, extraSpaceH+15*3);
  textAlign(CENTER, CENTER);
  stroke(0);
  strokeWeight(1);
  textSize(20);
  fill(0, 150);
  text("Tānpūra", extraSpaceW+mainSpace/2, extraSpaceH+15*3+45);

  push()
  translate(extraSpaceW+mainSpace/2, extraSpaceH+mainSpace/2);
  image(tanpura, 0, 10, tanpura.width/2.6, tanpura.height/2.6);
  noFill();
  stroke(120, 0, 0);
  strokeWeight(3);
  ellipse(0, 0, mainSpace/3.5, mainSpace/3.5);
  pop()
}

function draw () {}

function player () {
  if (buttonPlay.html() == lang_play) {
    currentSound.loop();
    buttonPlay.html(lang_stop);
    if (buttonRecord.html() == lang_record) {
      buttonRecord.removeAttribute("disabled");
    } else {
      buttonRecord.attribute("disabled", "true");
    }
  } else {
    currentSound.stop();
    buttonPlay.html(lang_play);
    if (buttonRecord.html() == lang_record) {
      buttonRecord.attribute("disabled", "true");
    } else {
      buttonRecord.removeAttribute("disabled");
    }
  }
}

function recordVoice () {
  if (buttonRecord.html() == lang_record) {
    buttonSearchSound.attribute("disabled", "true");
    buttonPlay.attribute("disabled", "true");
    buttonSadja.attribute("disabled", "true");
    buttonRecord.html(lang_recording);
    buttonRecord.attribute("disabled", "true");
    recorder.record(soundFile, 5, function () {
      currentSound.stop();
      buttonSearchSound.removeAttribute("disabled");
      buttonPlay.removeAttribute("disabled");
      buttonPlay.html(lang_play);
      buttonSadja.removeAttribute("disabled");
      buttonRecord.html(lang_listen);
      buttonRecord.removeAttribute("disabled");
      mic.stop();
    });
  } else {
    soundFile.play();
    currentSound.loop(0, currentSound.rate(), 0.2);
    buttonSearchSound.attribute("disabled", "true");
    buttonPlay.attribute("disabled", "true");
    buttonRecord.attribute("disabled", "true");
    soundFile.onended(function () {
      currentSound.stop();
      buttonSearchSound.removeAttribute("disabled");
      buttonPlay.removeAttribute("disabled");
      buttonRecord.removeAttribute("disabled");
    });
  }
}

function changeMode () {
  if (selectMode.value() == "0") {
    buttonRecord.attribute("hidden", "true");
    buttonSadja.removeAttribute("disabled");
    retune();
    mic.stop();
  } else {
    buttonRecord.removeAttribute("hidden");
    buttonSadja.attribute("disabled", "true");
    retune();
  }
}

function changeLevel () {
  soundsList = tanpuraInfo.levels[selectLevel.value()];
  retune();
}

function soundLoader () {
  if (sounds.length == 0) {
    var start = millis();
    for (var i = 0; i < tanpuraInfo.soundsLib.length; i++) {
      print(tanpuraInfo.soundsLib[str(i)].fileName);
      sounds[i] = loadSound("../sounds/tanpura/" + tanpuraInfo.soundsLib[str(i)].fileName);
      sadjaList[i] = tanpuraInfo.soundsLib[str(i)].sa;
    }
    var timeLapse = millis() - start;
    print("All sounds loaded in " + str(timeLapse) + " seconds.");
    soundsList = tanpuraInfo.levels[selectLevel.value()];
    retune();
    buttonSearchSound.html(lang_retune);
    buttonPlay.removeAttribute("disabled");
    buttonSadja.removeAttribute("disabled");
  } else {
    retune();
  }
}

function retune () {
  if (currentSound != undefined && currentSound.isPlaying()) {
    currentSound.stop();
    buttonPlay.html(lang_play);
  }
  var index = soundsList[int(random(soundsList.length))];
  currentSound = sounds[index];
  sadja.freq(sadjaList[index]);
  print(index, currentSound, currentSound.duration());
  buttonRecord.html(lang_record);
  buttonRecord.attribute("disabled", "true");
  if (selectMode.value() == "1") {
    mic.start();
    buttonSadja.attribute("disabled", "true");
    soundFile = new p5.SoundFile();
  }
}
