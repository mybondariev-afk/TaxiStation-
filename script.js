const taxiList = document.getElementById('taxiList');
const classList = document.getElementById('classList');
const userAccount = document.getElementById('userAccount');
const userNameEl = document.getElementById('userName');
const userBalanceEl = document.getElementById('userBalance');
const bookedTaxiEl = document.getElementById('bookedTaxi');
const cancelBookingBtn = document.getElementById('cancelBookingBtn');
const historyEl = document.getElementById('history');
const addTaxiBtn = document.getElementById('addTaxiBtn');

let registeredUser = null;

const classes = [
  {name: 'Standard', price: 10},
  {name: 'Comfort', price: 20},
  {name: 'Business', price: 35},
  {name: 'VIP', price: 50}
];

let taxis = [
  {name: 'Toyota Prius', class: 'Standard', available: true, price: 10},
  {name: 'Honda Accord', class: 'Comfort', available: true, price: 20},
  {name: 'BMW 5', class: 'Business', available: true, price: 35},
  {name: 'Mercedes S-Class', class: 'VIP', available: true, price: 50}
];

// --- Render ---
function renderClasses() {
  classList.innerHTML = '';
  classes.forEach(cls => {
    const div = document.createElement('div');
    div.className = 'class-card';
    if(cls.name === 'VIP') div.classList.add('vip');
    if(cls.price > 40) div.classList.add('expensive');
    div.innerHTML = `<h3>${cls.name}</h3><div class="price">${cls.price} €</div>`;
    classList.appendChild(div);
  });
}

function renderTaxis() {
  taxiList.innerHTML = '';
  taxis.forEach((taxi, index) => {
    const div = document.createElement('div');
    div.className = 'taxi-item';
    if(taxi.class === 'VIP') div.classList.add('vip');
    if(taxi.price > 40) div.classList.add('expensive');

    const btn = document.createElement('button');

    // Перевіряємо бронь користувача
    if(registeredUser && registeredUser.bookedTaxi === index) {
      btn.textContent = 'Booked';
      btn.disabled = true;
    } else {
      btn.textContent = taxi.available ? 'Book' : 'Unavailable';
      btn.disabled = !taxi.available;
      btn.addEventListener('click', () => bookTaxi(index));
    }

    div.textContent = `${taxi.name} - ${taxi.class} (${taxi.price} €) `;
    div.appendChild(btn);
    taxiList.appendChild(div);
  });
}

// --- Random Taxi ---
function addRandomTaxi() {
  const carNames = ['Ford Focus', 'Skoda Octavia', 'Audi A6', 'Lexus LS', 'Volkswagen Passat'];
  const randomCar = carNames[Math.floor(Math.random() * carNames.length)];
  const randomClass = classes[Math.floor(Math.random() * classes.length)];
  taxis.push({name: randomCar, class: randomClass.name, available: true, price: randomClass.price});
  renderTaxis();
}

// --- History ---
function updateHistory(entry) {
  if(historyEl.textContent === 'No records') historyEl.textContent = '';
  const div = document.createElement('div');
  div.textContent = entry;
  historyEl.prepend(div);

  // Зберігаємо історію у LocalStorage
  if(!registeredUser.history) registeredUser.history = [];
  registeredUser.history.unshift(entry);
  saveUser();
}

// --- Book/Cancel ---
function bookTaxi(index) {
  if(!registeredUser) { alert('Please register first.'); return; }
  if(registeredUser.bookedTaxi !== null) { alert('You have already booked a car.'); return; }
  const taxi = taxis[index];
  if(registeredUser.balance < taxi.price) { alert('Not enough balance to book this car.'); return; }

  registeredUser.balance -= taxi.price;
  taxi.available = false;
  registeredUser.bookedTaxi = index;
  userBalanceEl.textContent = registeredUser.balance;
  bookedTaxiEl.textContent = taxi.name;
  cancelBookingBtn.style.display = 'inline-block';
  renderTaxis();
  saveUser();

  let historyEntry = `Booked: ${taxi.name} - ${taxi.class} (${taxi.price} €)`;
  if(taxi.class === 'VIP') {
    const bonus = Math.round(taxi.price * 0.1);
    registeredUser.balance += bonus;
    userBalanceEl.textContent = registeredUser.balance;
    historyEntry += ` | Bonus: +${bonus} €`;
    saveUser();
  }
  updateHistory(historyEntry);
}

function cancelBooking() {
  if(!registeredUser || registeredUser.bookedTaxi === null) { alert("No active booking to cancel."); return; }
  const taxiIndex = registeredUser.bookedTaxi;
  const taxi = taxis[taxiIndex];
  taxi.available = true;
  registeredUser.balance += taxi.price;
  registeredUser.bookedTaxi = null;

  userBalanceEl.textContent = registeredUser.balance;
  bookedTaxiEl.textContent = 'none';
  cancelBookingBtn.style.display = 'none';
  renderTaxis();
  updateHistory(`Cancelled booking: ${taxi.name} - ${taxi.class} (${taxi.price} €)`);
}

// --- LocalStorage ---
function saveUser() {
  localStorage.setItem('user', JSON.stringify(registeredUser));
}

function loadUser() {
  if(localStorage.getItem('user')) {
    registeredUser = JSON.parse(localStorage.getItem('user'));
    userNameEl.textContent = registeredUser.name;
    userBalanceEl.textContent = registeredUser.balance;
    bookedTaxiEl.textContent = registeredUser.bookedTaxi !== null ? taxis[registeredUser.bookedTaxi].name : 'none';
    userAccount.style.display = 'block';
    if(registeredUser.bookedTaxi !== null) cancelBookingBtn.style.display = 'inline-block';

    // Відновлюємо історію
    if(registeredUser.history && registeredUser.history.length > 0) {
      historyEl.textContent = '';
      registeredUser.history.forEach(entry => {
        const div = document.createElement('div');
        div.textContent = entry;
        historyEl.appendChild(div);
      });
    }

    // Оновлюємо доступність авто
    if(registeredUser.bookedTaxi !== null) {
      taxis.forEach((taxi, index) => {
        if(index === registeredUser.bookedTaxi) taxi.available = false;
      });
    }
  }
}

// --- Init ---
document.getElementById('registerForm').addEventListener('submit', e => {
  e.preventDefault();
  registeredUser = { name: e.target.name.value, balance: 500, bookedTaxi: null, history: [] };
  userNameEl.textContent = registeredUser.name;
  userBalanceEl.textContent = registeredUser.balance;
  userAccount.style.display = 'block';
  e.target.parentElement.style.display = 'none';
  updateHistory('User registered. Balance: 500 €');
  saveUser();
});

addTaxiBtn.addEventListener('click', addRandomTaxi);

renderClasses();
renderTaxis();
loadUser();