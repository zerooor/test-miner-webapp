const mineButton = document.getElementById("mineButton");
const statusDiv = document.getElementById("status");

const tg = window.Telegram.WebApp;
tg.expand();

mineButton.addEventListener("click", () => {
  statusDiv.textContent = "Майнинг начался...";
  mineButton.disabled = true;
  startMining("mining_task_1", 4); // 4 ведущих нуля = сложность
});

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function startMining(taskData, difficulty) {
  const prefix = '0'.repeat(difficulty);
  let nonce = 0;
  let hash = '';

  while (true) {
    const input = taskData + nonce;
    hash = await sha256(input);

    if (hash.startsWith(prefix)) {
      break;
    }

    if (nonce % 1000 === 0) {
      statusDiv.textContent = `Майнинг... nonce: ${nonce}`;
      await new Promise(r => setTimeout(r, 1)); // Не даёт зависать браузеру
    }

    nonce++;
  }

  statusDiv.textContent = `Майнинг завершён!
Nonce: ${nonce}
Hash: ${hash}`;

  mineButton.disabled = false;

  // Отправка результата на сервер
  fetch('http://localhost:3000/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      nonce: nonce,
      hash: hash
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      statusDiv.textContent += "\nСервер подтвердил хэш!";
    } else {
      statusDiv.textContent += "\nОшибка: хэш не прошёл проверку.";
    }
  })
  .catch(err => {
    statusDiv.textContent += `\nОшибка при отправке на сервер: ${err.message}`;
  });
}