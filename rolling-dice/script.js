const faces = ['front', 'left', 'bottom', 'top', 'right', 'back'];
const oppsiteFaces = {
  front: 'back',
  right: 'left',
  back: 'front',
  left: 'right',
  top: 'bottom',
  bottom: 'top'
};

class DiceCube extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `
      <div class="dice-cube">
        <div class="cube">
          <div class="cube__face cube__face--front"></div>
          <div class="cube__face cube__face--back"></div>
          <div class="cube__face cube__face--right"></div>
          <div class="cube__face cube__face--left"></div>
          <div class="cube__face cube__face--top"></div>
          <div class="cube__face cube__face--bottom"></div>
        </div>  
      </div>
    `;
    this.face = 'front';
    this.prevFace = '';
  }
  get points() {
    return faces.indexOf(this.face) + 1;
  }
  roll(face) {
    let cube = this.querySelector('.cube');
    cube.className = 'cube';
    cube.classList.add(`show-${face}`);
    this.prevFace = this.side;
    this.face = face;
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, 220);
    });
  }
  randomFace() {
    return faces[Math.floor(Math.random() * faces.length)];
  }
  async throw() {
    const times = 20;
    for (let i = 0; i < times; i++) {
      let nextFace;
      do {
        nextFace = this.randomFace();
      } while (nextFace === this.face ||
      nextFace === this.prevFace ||
        nextFace === oppsiteFaces[this.face]
      );
      await this.roll(nextFace);
    }
    await this.roll(this.randomFace());
  }
}
customElements.define('dice-cube', DiceCube);

var cubes = [...document.querySelectorAll('dice-cube')];

async function rollDice() {
  const res = document.querySelector('.points');
  res.textContent = '洗巴辣~~~';
  await Promise.all(cubes.map(c => c.throw()));
  res.textContent = cubes.map(c => c.points).join(' ');
}

// Countdown timer function
function startCountdown(duration) {
  let timer = duration, seconds;
  const countdownElem = document.querySelector('.countdown');

  setInterval(() => {
    seconds = parseInt(timer, 10);

    countdownElem.textContent = seconds;

    if (--timer < 0) {
      timer = duration;
    }
  }, 1000);
}
async function guess(size) {
  const resultElem = document.querySelector('.result');
  const bigButton = document.querySelector('button[data-guess="big"]');
  const smallButton = document.querySelector('button[data-guess="small"]');
  const countdownElem = document.querySelector('.countdown');
  
  // 顯示玩家猜測
  resultElem.textContent = `你猜的是${size}`;

  // 禁用按鈕
  bigButton.disabled = true;
  smallButton.disabled = true;

  // 等待倒數計時器結束
  await new Promise(resolve => {
    const countdownInterval = setInterval(() => {
      let countdown = parseInt(countdownElem.textContent);
      countdown--;
      countdownElem.textContent = countdown;
      if (countdown === 0) {
        clearInterval(countdownInterval);
        resolve();
      }
    }, 1000);
  });

  // 等待擲骰子完成
  await rollDice();

  // 獲取骰子點數
  const points = cubes.reduce((acc, c) => acc + c.points, 0);

  // 判斷猜測結果
  let result;
  if ((size === 'big' && points > 10) || (size === 'small' && points <= 10)) {
    result = '你猜對了！';
  } else {
    result = '你猜錯了！';
  }

  // 顯示結果
  resultElem.textContent = `${result} 點數為${points}`;

  // 啟用按鈕
  bigButton.disabled = false;
  smallButton.disabled = false;
}


// Initial roll
rollDice();
startCountdown(30);

// Roll dice every 30 seconds
setInterval(rollDice, 30000);


