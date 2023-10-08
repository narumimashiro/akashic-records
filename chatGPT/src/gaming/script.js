/*　ヘッダー */
document.addEventListener("DOMContentLoaded", function() {
  animateCircles();
});

function animateCircles() {
  const circles = document.querySelectorAll('.circle');

  circles.forEach((circle, index) => {
      circle.style.animationDelay = `${index * 0.1}s`;
  });
}

/* ナビゲーション */
document.addEventListener("DOMContentLoaded", function () {
  const navItems = document.querySelectorAll("nav ul li a");

  navItems.forEach(item => {
    item.innerHTML = item.textContent
      .split("")
      .map((char, idx) => `<span style="transition-delay: ${idx * 50}ms">${char}</span>`)
      .join("");
  });
});

function addGradientAnimationToAllH2() {
  const h2Elements = document.querySelectorAll('h2');

  function changeBackgroundColor(element) {
      const gradientColors = [
          '#ff6b81', '#ff8b8b', '#ff9c8b', '#ffb38b', '#ffcb8b', '#ffe68b',
          '#f0ffb3', '#d9ffb3', '#b3ffb3', '#8bffcb', '#8bffe6', '#8bffff',
          '#8be6ff', '#8bc3ff', '#8ba1ff', '#8b7aff', '#a08bff', '#c38bff',
          '#e68bff', '#ff8be6'
      ]; // グラデーションの色
      let currentColor = 0;

      function updateBackgroundColor() {
          element.style.background = `linear-gradient(to right, ${gradientColors[currentColor]}, ${gradientColors[(currentColor + 1) % gradientColors.length]})`;
          currentColor = (currentColor + 1) % gradientColors.length;
      }

      setInterval(updateBackgroundColor, 100); // 更新間隔を短く（ミリ秒）
  }

  h2Elements.forEach((element) => {
      changeBackgroundColor(element);
  });
}

addGradientAnimationToAllH2();

document.addEventListener("DOMContentLoaded", function() {
  const colors = ["#FF5733", "#C70039", "#900C3F", "#FFC300", "#00A8E8"];
  const animatedHeadings = document.querySelectorAll("h3.color-animated");

  function getRandomColor() {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  }

  function applyRandomColor(element) {
    const randomColor = getRandomColor();
    element.style.color = randomColor;
  }

  function startColorAnimation() {
    animatedHeadings.forEach(heading => {
      applyRandomColor(heading);
      setInterval(() => applyRandomColor(heading), 1000);
    });
  }

  startColorAnimation();
});

document.addEventListener("DOMContentLoaded", function() {
  const codeElements = document.querySelectorAll("pre > code.modal-trigger");
  const modal = document.getElementById("modal");
  const modalCode = document.getElementById("modal-code");

  codeElements.forEach(code => {
    code.classList.add("pre-clicked");
    code.addEventListener("click", function() {
      const codeText = code.textContent;
      modalCode.textContent = codeText;
      modal.style.display = "block";
    });
  });

  window.closeModal = function() {
    modal.style.display = "none";
  };
});

const explodeTriggers = document.querySelectorAll('.explode-trigger');
const explosion = document.getElementById('explosion');

explodeTriggers.forEach(explodeTrigger => {
  explodeTrigger.addEventListener('click', (event) => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    explosion.style.left = `${centerX - explosion.offsetWidth / 2}px`;
    explosion.style.top = `${centerY - explosion.offsetHeight / 2}px`;
    explosion.style.display = 'block';
    explosion.addEventListener('animationend', () => {
      explosion.style.display = 'none';
    });
  });
});