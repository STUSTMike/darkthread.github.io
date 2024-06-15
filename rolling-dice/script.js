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
  res.textContent = '轉一轉~~~';
  await Promise.all(cubes.map(c => c.throw()));
  res.textContent = cubes.map(c => c.points).join(' ');
}

function startCountdown() {
  const countdownElement = document.querySelector('.countdown');
  let countdown = 30;

  const interval = setInterval(() => {
    countdownElement.textContent = `倒數計時：${countdown}秒`;
    if (countdown === 0) {
      clearInterval(interval);
      rollDice().then(() => {
        if (userGuess) {
          checkResult();
        } else {
          document.querySelector('.result').textContent = ''; // 清除結果
        }
        setTimeout(startCountdown, 1000); // 等待骰子擲完後再重新開始倒數
      });
    }
    countdown--;
  }, 1000);
}

let userGuess = '';

function handleGuess(event) {
  userGuess = event.target.getAttribute('data-guess');
  document.querySelector('.result').textContent = `你猜的是：${userGuess}`;
  document.querySelectorAll('.guess-button').forEach(button => button.disabled = true);
}

function checkResult() {
  const totalPoints = cubes.map(c => c.points).reduce((a, b) => a + b, 0);
  const resultText = document.querySelector('.result');
  if ((totalPoints > 3 && userGuess === '大') || (totalPoints <= 3 && userGuess === '小')) {
    resultText.textContent = `你猜的是：${userGuess} - 你猜對了!`;
  } else {
    resultText.textContent = `你猜的是：${userGuess} - 你猜錯了!`;
  }
  document.querySelectorAll('.guess-button').forEach(button => button.disabled = false);
  userGuess = ''; // 重置猜測
}

// 綁定猜測按鈕事件
document.querySelectorAll('.guess-button').forEach(button => {
  button.addEventListener('click', handleGuess);
});

// 開始倒數
startCountdown();
