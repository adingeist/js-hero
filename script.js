const classicImage = document.getElementById('classicImage');
const chaseImage = document.getElementById('chaseImage');
const seaweedImage = document.getElementById('technoImage');

const canvas = document.querySelector('#canvas');
const context = canvas.getContext('2d');
const video = document.getElementById('video');
video.play();

const miss = new Audio('./media/miss.m4a');
let notes = [];

const keysDown = [];

let song;
let score = 0;
let multiplier = 1;
let streak = 0;
let highestStreak = 0;

let time = 0;
let gameStarted = false;

function missNote() {
  score -= 10;
  if (streak > highestStreak) highestStreak = streak;
  streak = 0;
  multiplier = 1;
  miss.play();
}

function hitOrMissNote(col) {
  let noneRemovedYet = true;
  notes = notes.filter((note) => {
    const doNotRemove =
      !noneRemovedYet ||
      note.col !== col ||
      note.y > aKey.y + note.h ||
      note.y < aKey.y - note.h;

    if (!doNotRemove) noneRemovedYet = false;

    return doNotRemove;
  });

  if (noneRemovedYet) {
    missNote();
  } else {
    streak++;
    if (streak > highestStreak) highestStreak = streak;
    score = score + 10 * multiplier;
    if (streak !== 0 && streak % 8 === 0) {
      multiplier++;
    }
  }
}

document.addEventListener('keydown', (event) => {
  if (!keysDown.includes(event.key)) keysDown.push(event.key);

  let tCol = -1;
  if (event.key.toLowerCase() === 's') {
    tCol = 1;
  } else if (event.key.toLowerCase() === 'd') {
    tCol = 2;
  } else if (event.key.toLowerCase() === 'f') {
    tCol = 3;
  } else if (event.key.toLowerCase() === 'a') {
    tCol = 0;
  }

  if (tCol !== -1 && gameStarted) {
    console.log(`{col:${tCol}, time:${time}},`);
    hitOrMissNote(tCol);
  }

  const startGame = () => {
    gameStarted = true;
    let score = 0;
    let multiplier = 1;
    let streak = 0;
    let highestStreak = 0;
  };

  if ((event.key === 'A' || event.key === 'a') && !gameStarted) {
    const music = new Audio('./media/rondo-alla-turca.mp3');
    music.play();
    song = RONDO_ALLA_TURCA;
    startGame();
  } else if ((event.key === 'D' || event.key === 'd') && !gameStarted) {
    const music = new Audio('./media/seaweed.mp3');
    setTimeout(() => {
      music.play();
    }, 1500);
    song = SEAWEED;
    startGame();
  } else if ((event.key === 'S' || event.key === 's') && !gameStarted) {
    const music = new Audio('./media/grass-skirt-chase.mp3');
    music.play();
    song = CHASE_SONG;
    startGame();
  }
});

document.addEventListener('keyup', (event) => {
  keysDown.splice((key) => event.key === key, 1);
});

const columns = [
  {
    key: 'a',
    color: `255,0,0`,
    x: 300,
  },
  {
    key: 's',
    color: `0,255,0`,
    x: 425,
  },
  {
    key: 'd',
    color: `255,255,0`,
    x: 555,
  },
  {
    key: 'f',
    color: `0,0,255`,
    x: 680,
  },
];

class Key {
  x;
  y = 600;
  width = 100;
  height = 30;
  color;

  constructor(column) {
    this.column = columns[column];
    this.color = this.column.color;
    this.x = this.column.x;
    this.key = this.column.key;
  }

  draw() {
    context.fillStyle = keysDown.includes(this.key)
      ? `rgba(${this.color},1)`
      : `rgba(${this.color},0.5)`;
    context.fillRect(this.x, this.y, this.width, this.height);
  }
}

const aKey = new Key(0);
const bKey = new Key(1);
const sKey = new Key(2);
const dKey = new Key(3);

class Note {
  x;
  y = 422;
  w = 15;
  h = 3;
  col;
  missed = false;

  constructor(col) {
    this.col = col;
    if (this.col === 0) {
      this.x = 485;
    } else if (this.col === 1) {
      this.x = 516;
    } else if (this.col === 2) {
      this.x = 550;
    } else {
      this.x = 582;
    }
  }

  move(x, y, w, h) {
    this.x -= this.w / x;
    this.y += this.h / y;
    this.w += this.w / w;
    this.h += this.h / h;
  }

  draw() {
    context.fillStyle = `rgba(${columns[this.col].color},1)`;
    if (this.missed) {
      context.fillStyle = 'rgba(50,50,50,1)';
    }
    context.fillRect(this.x, this.y, this.w, this.h);

    context.strokeStyle = 'white';
    context.lineWidth = this.h / 5;
    context.strokeRect(this.x, this.y, this.w, this.h);

    // CHANGE GAME
    if (this.col === 0) {
      this.move(48, 12, 118, 100);
    } else if (this.col === 1) {
      this.move(101, 12, 118, 100);
    } else if (this.col === 2) {
      this.move(-1000, 12, 118, 100);
    } else {
      this.move(-93, 12, 118, 100);
    }

    if (this.y > aKey.y + aKey.height && !this.missed) {
      this.missed = true;
      missNote();
    }
  }
}

function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  aKey.draw();
  bKey.draw();
  sKey.draw();
  dKey.draw();

  context.fillStyle = 'rgba(0,0,0,0.5)';
  context.fillRect(0, 0, 320, 140);

  context.fillStyle = 'white';
  context.font = '30px Arial';
  context.textAlign = 'left';
  context.fillText(`Score:`, 10, 35);
  context.fillText(`${score}`, 120, 35);
  context.font = '20px Arial';
  context.fillText(`Streak:`, 10, 70);
  context.fillText(`${streak}`, 120, 70);
  context.fillText(`Highest Streak:`, 10, 105);
  context.fillText(`${highestStreak}`, 180, 105);

  context.beginPath();
  context.arc(canvas.width / 2, 680, 38, 0, 2 * Math.PI, false);
  context.fillStyle = 'rgba(255,255,255,0.3)';
  context.fill();
  context.lineWidth = 4;
  context.strokeStyle = '#fff';
  context.stroke();

  context.beginPath();
  context.moveTo(canvas.width / 2, 680);
  context.arc(canvas.width / 2, 680, 38, 0, (Math.PI * (streak % 8)) / 4);
  context.lineTo(canvas.width / 2, 680);
  context.fillStyle = 'rgba(0,255,255,0.8)';
  context.fill();

  context.fillStyle = 'rgba(255,255,255,1)';
  context.font = '20px Arial';
  context.textAlign = 'center';
  context.fillText(`x${multiplier}`, canvas.width / 2, 685);

  notes.forEach((note) => {
    note.draw();
  });

  if (!gameStarted) {
    context.fillStyle = 'rgba(0,0,0,0.5)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = '#fff';
    context.font = '70px Arial';
    context.textAlign = 'center';
    context.fillText(`JSHero`, canvas.width / 2, 200);
    context.font = '30px Arial';
    context.textAlign = 'center';
    context.fillText(`an HTML5 Game by Adin Geist`, canvas.width / 2, 250);
    context.font = '22px Arial';
    context.textAlign = 'center';

    const col1 = (canvas.width / 4) * 1;
    const col2 = (canvas.width / 4) * 2;
    const col3 = (canvas.width / 4) * 3;

    context.fillText(`Rondo Alla Turca`, col1, 470);
    context.fillText(`Grass Skirt Chase`, col2, 470);
    context.fillText(`Seaweed`, col3, 470);

    context.font = '16px Arial';

    context.fillText(`Mozart`, col1, 500);
    context.fillText(`Spongebob Squarepants`, col2, 500);
    context.fillText(`Composers: Sage Guyton & Jeremy Wakefield`, col2, 520);
    context.fillText(`Spongebob SquarePants`, col3, 500);
    context.fillText(`Composer: Steve Belfer`, col3, 520);

    context.fillText(`press 'A'`, col1, 550);
    context.fillText(`press 'S'`, col2, 550);
    context.fillText(`press 'D'`, col3, 550);

    const s = 150;
    context.drawImage(classicImage, col1 - s / 2, 280, s, s);
    context.drawImage(chaseImage, col2 - s / 2, 280, s, s);
    context.drawImage(seaweedImage, col3 - s / 2, 280, s, s);

    context.fillText(
      `HOW TO PLAY: Hit notes as they strike your color bar by pressing the ASDF keys`,
      canvas.width / 2,
      580
    );
  }

  notes = notes.filter((note) => note.y < canvas.height + note.h);
}

setInterval(() => {
  draw();

  if (gameStarted) {
    let moreNotes = false;
    song.forEach((note) => {
      if (note.time - 2500 === time) {
        notes.push(new Note(note.col));
      }

      if (note.time + 5000 > time) {
        moreNotes = true;
      }
    });
    time += 10;

    if (!moreNotes) {
      gameStarted = false;
    }
  }
}, 10);

const RONDO_ALLA_TURCA = [
  { col: 0, time: 2110 },
  { col: 1, time: 2190 },
  { col: 2, time: 2360 },
  { col: 3, time: 2490 },
  { col: 2, time: 2610 },
  { col: 3, time: 2720 },
  { col: 2, time: 2800 },
  { col: 1, time: 3160 },
  { col: 2, time: 3280 },
  { col: 3, time: 3390 },
  { col: 2, time: 3490 },
  { col: 3, time: 3600 },
  { col: 2, time: 3700 },
  { col: 0, time: 4180 },
  { col: 1, time: 4230 },
  { col: 2, time: 4350 },
  { col: 3, time: 4420 },
  { col: 2, time: 4560 },
  { col: 3, time: 4690 },
  { col: 2, time: 4760 },
  { col: 3, time: 4890 },
  { col: 2, time: 4950 },
  { col: 3, time: 5110 },
  { col: 2, time: 5190 },
  { col: 3, time: 5360 },
  { col: 2, time: 5440 },
  { col: 3, time: 5580 },
  { col: 2, time: 5650 },
  { col: 3, time: 6030 },
  { col: 3, time: 6210 },
  { col: 2, time: 6300 },
  { col: 1, time: 6520 },
  { col: 2, time: 6530 },
  { col: 3, time: 6810 },
  { col: 2, time: 7000 },
  { col: 3, time: 7210 },
  { col: 1, time: 7450 },
  { col: 2, time: 7460 },
  { col: 2, time: 7730 },
  { col: 3, time: 7900 },
  { col: 3, time: 8090 },
  { col: 1, time: 8320 },
  { col: 2, time: 8350 },
  { col: 3, time: 8570 },
  { col: 2, time: 8810 },
  { col: 2, time: 9000 },
  { col: 0, time: 9240 },
  { col: 0, time: 9790 },
  { col: 1, time: 9900 },
  { col: 2, time: 10050 },
  { col: 3, time: 10190 },
  { col: 1, time: 10690 },
  { col: 2, time: 10800 },
  { col: 3, time: 10930 },
  { col: 2, time: 11100 },
  { col: 1, time: 11660 },
  { col: 2, time: 11760 },
  { col: 3, time: 11860 },
  { col: 2, time: 11990 },
  { col: 3, time: 12130 },
  { col: 2, time: 12220 },
  { col: 3, time: 12340 },
  { col: 2, time: 12450 },
  { col: 3, time: 12600 },
  { col: 2, time: 12690 },
  { col: 3, time: 12850 },
  { col: 2, time: 13090 },
  { col: 1, time: 13470 },
  { col: 2, time: 13490 },
  { col: 3, time: 13710 },
  { col: 2, time: 13940 },
  { col: 2, time: 14120 },
  { col: 1, time: 14210 },
  { col: 3, time: 14480 },
  { col: 1, time: 14830 },
  { col: 2, time: 14840 },
  { col: 3, time: 15110 },
  { col: 3, time: 15290 },
  { col: 3, time: 15510 },
  { col: 1, time: 15740 },
  { col: 2, time: 15790 },
  { col: 3, time: 16010 },
  { col: 0, time: 16210 },
  { col: 3, time: 16280 },
  { col: 3, time: 16490 },
  { col: 1, time: 16700 },
  { col: 2, time: 16720 },
  { col: 0, time: 17270 },
  { col: 1, time: 17410 },
  { col: 2, time: 17710 },
  { col: 1, time: 17730 },
  { col: 2, time: 17890 },
  { col: 3, time: 18140 },
  { col: 2, time: 18190 },
  { col: 3, time: 18330 },
  { col: 2, time: 18420 },
  { col: 3, time: 18530 },
  { col: 2, time: 18600 },
  { col: 0, time: 19120 },
  { col: 1, time: 19310 },
  { col: 2, time: 19590 },
  { col: 2, time: 19790 },
  { col: 3, time: 20010 },
  { col: 2, time: 20120 },
  { col: 3, time: 20240 },
  { col: 2, time: 20330 },
  { col: 3, time: 20420 },
  { col: 2, time: 20490 },
  { col: 1, time: 21040 },
  { col: 1, time: 21210 },
  { col: 1, time: 21440 },
  { col: 2, time: 21550 },
  { col: 2, time: 21720 },
  { col: 1, time: 21940 },
  { col: 2, time: 22060 },
  { col: 1, time: 22150 },
  { col: 2, time: 22240 },
  { col: 1, time: 22360 },
  { col: 1, time: 22900 },
  { col: 1, time: 23100 },
  { col: 1, time: 23340 },
  { col: 1, time: 23550 },
  { col: 1, time: 23850 },
  { col: 0, time: 23900 },
  { col: 1, time: 24000 },
  { col: 0, time: 24140 },
  { col: 1, time: 24230 },
  { col: 0, time: 24310 },
  { col: 1, time: 24800 },
  { col: 1, time: 25000 },
  { col: 0, time: 25250 },
  { col: 1, time: 25350 },
  { col: 2, time: 25730 },
  { col: 3, time: 25830 },
  { col: 1, time: 26010 },
  { col: 2, time: 26130 },
  { col: 3, time: 26200 },
  { col: 2, time: 26740 },
  { col: 1, time: 26780 },
  { col: 2, time: 26980 },
  { col: 3, time: 27020 },
  { col: 3, time: 27210 },
  { col: 2, time: 27300 },
  { col: 3, time: 27430 },
  { col: 2, time: 27530 },
  { col: 3, time: 27660 },
  { col: 2, time: 27760 },
  { col: 3, time: 27900 },
  { col: 2, time: 28010 },
  { col: 1, time: 28550 },
  { col: 2, time: 28820 },
  { col: 3, time: 29000 },
  { col: 1, time: 29230 },
  { col: 2, time: 29270 },
  { col: 3, time: 29500 },
  { col: 0, time: 29700 },
  { col: 1, time: 29960 },
  { col: 2, time: 29970 },
  { col: 3, time: 30190 },
  { col: 0, time: 30390 },
  { col: 2, time: 30440 },
  { col: 2, time: 30700 },
  { col: 1, time: 30920 },
  { col: 3, time: 30950 },
  { col: 2, time: 31210 },
  { col: 1, time: 31480 },
  { col: 3, time: 31500 },
  { col: 2, time: 31650 },
  { col: 3, time: 31750 },
  { col: 2, time: 31860 },
  { col: 3, time: 31890 },
  { col: 2, time: 32720 },
  { col: 1, time: 32900 },
  { col: 2, time: 32950 },
  { col: 3, time: 32960 },
  { col: 3, time: 33170 },
  { col: 1, time: 33470 },
  { col: 3, time: 33480 },
  { col: 3, time: 33660 },
  { col: 3, time: 33890 },
  { col: 1, time: 34350 },
  { col: 2, time: 34370 },
  { col: 3, time: 34580 },
  { col: 1, time: 34820 },
  { col: 2, time: 34870 },
  { col: 0, time: 35290 },
  { col: 3, time: 35310 },
  { col: 2, time: 35510 },
  { col: 1, time: 35710 },
  { col: 2, time: 35750 },
  { col: 3, time: 36190 },
  { col: 3, time: 36380 },
  { col: 0, time: 36670 },
  { col: 2, time: 36680 },
  { col: 3, time: 37150 },
  { col: 3, time: 37340 },
  { col: 1, time: 37530 },
  { col: 2, time: 37560 },
  { col: 0, time: 38010 },
  { col: 3, time: 38030 },
  { col: 3, time: 38230 },
  { col: 1, time: 38520 },
  { col: 2, time: 38540 },
  { col: 3, time: 38730 },
  { col: 0, time: 38970 },
  { col: 3, time: 39000 },
  { col: 2, time: 39210 },
  { col: 1, time: 39440 },
  { col: 3, time: 39460 },
  { col: 2, time: 40010 },
  { col: 0, time: 40030 },
  { col: 3, time: 40130 },
  { col: 3, time: 40360 },
  { col: 2, time: 40380 },
  { col: 1, time: 40780 },
  { col: 3, time: 40810 },
  { col: 3, time: 41010 },
  { col: 0, time: 41270 },
  { col: 2, time: 41290 },
  { col: 1, time: 41750 },
  { col: 3, time: 41810 },
  { col: 3, time: 41950 },
  { col: 0, time: 42290 },
  { col: 2, time: 42300 },
  { col: 3, time: 42470 },
  { col: 3, time: 42700 },
  { col: 1, time: 42740 },
  { col: 3, time: 42940 },
  { col: 3, time: 43360 },
  { col: 1, time: 43580 },
  { col: 2, time: 43610 },
  { col: 2, time: 43850 },
  { col: 0, time: 44090 },
  { col: 3, time: 44110 },
  { col: 3, time: 44570 },
  { col: 1, time: 44590 },
  { col: 3, time: 44790 },
  { col: 2, time: 45030 },
  { col: 3, time: 45460 },
  { col: 1, time: 45480 },
  { col: 3, time: 45690 },
  { col: 2, time: 45930 },
  { col: 1, time: 45940 },
];

const CHASE_SONG = [
  { col: 0, time: 4500 },
  { col: 1, time: 4860 },
  { col: 2, time: 5210 },
  { col: 3, time: 5600 },
  { col: 2, time: 6010 },
  { col: 1, time: 6180 },
  { col: 0, time: 6340 },
  { col: 1, time: 6500 },
  { col: 2, time: 6700 },
  { col: 3, time: 7160 },
  { col: 2, time: 7380 },
  { col: 1, time: 7780 },
  { col: 2, time: 7960 },
  { col: 3, time: 8130 },
  { col: 2, time: 8530 },
  { col: 1, time: 8790 },
  { col: 2, time: 8980 },
  { col: 3, time: 9310 },
  { col: 2, time: 9690 },
  { col: 1, time: 10020 },
  { col: 0, time: 10220 },
  { col: 0, time: 10470 },
  { col: 1, time: 10820 },
  { col: 2, time: 11200 },
  { col: 3, time: 11570 },
  { col: 2, time: 11970 },
  { col: 1, time: 12160 },
  { col: 0, time: 12370 },
  { col: 1, time: 12560 },
  { col: 2, time: 12740 },
  { col: 2, time: 13260 },
  { col: 3, time: 13470 },
  { col: 3, time: 13790 },
  { col: 3, time: 14100 },
  { col: 2, time: 14250 },
  { col: 3, time: 14440 },
  { col: 3, time: 14840 },
  { col: 2, time: 15050 },
  { col: 1, time: 15390 },
  { col: 2, time: 15620 },
  { col: 3, time: 15820 },
  { col: 2, time: 16210 },
  { col: 1, time: 16650 },
  { col: 0, time: 17340 },
  { col: 1, time: 18210 },
  { col: 2, time: 18300 },
  { col: 3, time: 18300 },
  { col: 3, time: 18770 },
  { col: 3, time: 18970 },
  { col: 3, time: 19420 },
  { col: 2, time: 19690 },
  { col: 1, time: 20060 },
  { col: 1, time: 20520 },
  { col: 2, time: 20850 },
  { col: 3, time: 21190 },
  { col: 3, time: 21380 },
  { col: 2, time: 21600 },
  { col: 2, time: 21710 },
  { col: 3, time: 21870 },
  { col: 3, time: 22600 },
  { col: 2, time: 23020 },
  { col: 1, time: 23230 },
  { col: 2, time: 23420 },
  { col: 1, time: 23840 },
  { col: 2, time: 24240 },
  { col: 3, time: 24410 },
  { col: 3, time: 24630 },
  { col: 3, time: 24820 },
  { col: 2, time: 25050 },
  { col: 1, time: 25060 },
  { col: 0, time: 25460 },
  { col: 1, time: 25470 },
  { col: 0, time: 25830 },
  { col: 2, time: 25840 },
  { col: 1, time: 26240 },
  { col: 3, time: 26250 },
  { col: 2, time: 26700 },
  { col: 0, time: 26700 },
  { col: 3, time: 27060 },
  { col: 0, time: 27130 },
  { col: 0, time: 27460 },
  { col: 3, time: 27500 },
  { col: 3, time: 27970 },
];

SEAWEED = [
  { col: 0, time: 1170 },
  { col: 1, time: 1450 },
  { col: 2, time: 1650 },
  { col: 3, time: 1880 },
  { col: 2, time: 2110 },
  { col: 0, time: 3030 },
  { col: 1, time: 3350 },
  { col: 2, time: 3530 },
  { col: 3, time: 3820 },
  { col: 1, time: 4080 },
  { col: 0, time: 4960 },
  { col: 1, time: 5280 },
  { col: 2, time: 5480 },
  { col: 3, time: 5780 },
  { col: 2, time: 6000 },
  { col: 3, time: 6310 },
  { col: 2, time: 6480 },
  { col: 3, time: 6850 },
  { col: 2, time: 6980 },
  { col: 1, time: 7510 },
  { col: 0, time: 8010 },
  { col: 3, time: 8800 },
  { col: 2, time: 9210 },
  { col: 1, time: 9500 },
  { col: 2, time: 9770 },
  { col: 1, time: 9910 },
  { col: 1, time: 10380 },
  { col: 0, time: 10720 },
  { col: 1, time: 11200 },
  { col: 2, time: 11390 },
  { col: 3, time: 11690 },
  { col: 2, time: 11890 },
  { col: 3, time: 12910 },
  { col: 2, time: 13180 },
  { col: 1, time: 13350 },
  { col: 3, time: 13600 },
  { col: 2, time: 13820 },
  { col: 1, time: 14090 },
  { col: 2, time: 14250 },
  { col: 1, time: 14470 },
  { col: 0, time: 14740 },
  { col: 0, time: 16760 },
  { col: 1, time: 17050 },
  { col: 2, time: 17250 },
  { col: 3, time: 17510 },
  { col: 2, time: 17780 },
  { col: 0, time: 18710 },
  { col: 1, time: 19060 },
  { col: 2, time: 19270 },
  { col: 3, time: 19500 },
  { col: 1, time: 19710 },
  { col: 0, time: 20590 },
  { col: 1, time: 20960 },
  { col: 2, time: 21150 },
  { col: 3, time: 21460 },
  { col: 2, time: 21650 },
  { col: 1, time: 22120 },
  { col: 2, time: 22660 },
  { col: 1, time: 22680 },
  { col: 0, time: 23180 },
  { col: 1, time: 23200 },
  { col: 2, time: 23640 },
  { col: 3, time: 23650 },
  { col: 0, time: 24440 },
  { col: 1, time: 24800 },
  { col: 2, time: 25010 },
  { col: 3, time: 25310 },
  { col: 2, time: 25500 },
  { col: 1, time: 26010 },
  { col: 1, time: 26530 },
  { col: 2, time: 26870 },
  { col: 1, time: 27050 },
  { col: 0, time: 27370 },
  { col: 1, time: 27560 },
  { col: 1, time: 28510 },
  { col: 2, time: 28760 },
  { col: 3, time: 28940 },
  { col: 2, time: 29230 },
  { col: 1, time: 29400 },
  { col: 2, time: 29700 },
  { col: 0, time: 29910 },
  { col: 1, time: 30390 },
  { col: 0, time: 32320 },
  { col: 1, time: 32630 },
  { col: 2, time: 32830 },
  { col: 3, time: 33090 },
  { col: 2, time: 33290 },
  { col: 0, time: 34230 },
  { col: 1, time: 34570 },
  { col: 2, time: 34730 },
  { col: 3, time: 35030 },
  { col: 1, time: 35260 },
  { col: 1, time: 35650 },
  { col: 2, time: 36230 },
  { col: 3, time: 36540 },
  { col: 2, time: 36740 },
  { col: 1, time: 37030 },
  { col: 2, time: 37210 },
  { col: 1, time: 37560 },
  { col: 2, time: 38060 },
  { col: 0, time: 38560 },
  { col: 0, time: 39090 },
  { col: 0, time: 39890 },
  { col: 1, time: 40320 },
  { col: 2, time: 40490 },
  { col: 3, time: 40780 },
  { col: 2, time: 40970 },
  { col: 2, time: 41460 },
  { col: 1, time: 41970 },
  { col: 2, time: 42320 },
  { col: 1, time: 42530 },
  { col: 3, time: 42830 },
  { col: 2, time: 43020 },
  { col: 0, time: 43900 },
  { col: 1, time: 44220 },
  { col: 2, time: 44380 },
  { col: 3, time: 44680 },
  { col: 2, time: 44900 },
  { col: 1, time: 45190 },
  { col: 2, time: 45370 },
  { col: 1, time: 45670 },
  { col: 0, time: 45900 },
];
