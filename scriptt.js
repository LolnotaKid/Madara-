let replAnimIds = [];
let animationCount = 4;
let maxMoveNumber = 4;
let soundEntries = [];
let userId = '';
let toolCount = 1;
let maxToolNumber = 1;
let toolEntries = [];
let fireEffectCount = 1;
let maxFireEffectNumber = 1;
let fireEffectEntries = [];

const ADMIN_ID = "GR8HBT";

let userLevel = 1;
let userXP = 0;
const levelRequirements = [0, 50, 80, 150, 200, 350];
let completedTasks = [];
let tasksCompletedToday = 0;

const allPossibleTasks = [
  { id: 0, text: "Create a moveset with all 4 moves filled", xp: 18, check: () => checkAllMovesFilled() },
  { id: 1, text: "Add at least 2 animation replacements", xp: 19, check: () => checkAnimationReplacements(2) },
  { id: 2, text: "Generate a complete moveset code", xp: 45, check: () => false },
  { id: 3, text: "Use 3 different font styles", xp: 25, check: () => checkFontVariety(3) },
  { id: 4, text: "Add VFX to at least 2 moves", xp: 20, check: () => checkVFXCount(2) },
  { id: 5, text: "Add sounds to at least 1 move", xp: 29, check: () => checkSoundCount(1) },
  { id: 6, text: "Use the Sci-Fi font style", xp: 30, check: () => checkFontUsed('SciFi') },
  { id: 7, text: "Replace 3 or more animations", xp: 20, check: () => checkAnimationReplacements(3) },
  { id: 8, text: "Set custom speed for an animation", xp: 10, check: () => checkCustomAnimationSpeed() }
];
let currentTasks = [];
let taskResetInterval;
let taskTimeLeft = 7 * 60;

const redeemCodes = {
  "BURGERNUT": { xp: 500, used: false },
  "NEWUPDATE": { xp: 60, used: false },
  "XPGETTINGFARM": { xp: 90, used: false }
};

const splashText = document.getElementById('splashText');
const splashScreen = document.getElementById('splashScreen');
const mainMenu = document.getElementById('mainMenu');

function initApp() {
  initUserId();
  initGearMenu();
  initRedeemSystem();
  initUserManagement();
  checkForAdminGifts();
  initLevelSystem();
}

function generateUserId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function initUserId() {
  const savedUserId = localStorage.getItem('movesetMakerUserId');
  userId = savedUserId || generateUserId();
  if (!savedUserId) {
    localStorage.setItem('movesetMakerUserId', userId);
  }
  document.getElementById('userIdDisplay').textContent = `UserID - ${userId}`;
}

let isMenuOpen = false;

function initGearMenu() {
  const gearMenu = document.getElementById('gearMenu');
  const menuDropdown = document.getElementById('menuDropdown');
  
  if (userId !== ADMIN_ID) {
    document.getElementById('usersListItem').style.display = 'none';
  }
  
  gearMenu.addEventListener('click', function(e) {
    isMenuOpen = !isMenuOpen;
    menuDropdown.style.display = isMenuOpen ? 'block' : 'none';
    e.stopPropagation();
  });
  
  document.addEventListener('click', function() {
    if (isMenuOpen) {
      isMenuOpen = false;
      menuDropdown.style.display = 'none';
    }
  });

  document.getElementById('redeemListItem').addEventListener('click', function() {
    document.getElementById('redeemModal').style.display = 'block';
    menuDropdown.style.display = 'none';
  });
}

function initRedeemSystem() {
  const savedCodes = localStorage.getItem('usedRedeemCodes');
  if (savedCodes) {
    const usedCodes = JSON.parse(savedCodes);
    for (const code in usedCodes) {
      if (redeemCodes[code]) {
        redeemCodes[code].used = usedCodes[code];
      }
    }
  }

  document.getElementById('redeemBtn').addEventListener('click', redeemCode);
  document.getElementById('modalClose').addEventListener('click', function() {
    document.getElementById('redeemModal').style.display = 'none';
  });
}

function redeemCode() {
  const input = document.getElementById('redeemCodeInput');
  const message = document.getElementById('redeemMessage');
  const code = input.value.trim().toUpperCase();

  if (!message) {
    console.error("Redeem message element not found!");
    return;
  }

  message.textContent = '';
  message.className = 'redeem-message';

  if (!code) {
    message.textContent = 'Please enter a code';
    message.classList.add('redeem-error');
    return;
  }

  if (!redeemCodes[code]) {
    message.textContent = 'Invalid code';
    message.classList.add('redeem-error');
    return;
  }

  if (redeemCodes[code].used) {
    message.textContent = 'Code already used';
    message.classList.add('redeem-error');
    return;
  }

  redeemCodes[code].used = true;
  addXP(redeemCodes[code].xp);
  message.textContent = `Success! +${redeemCodes[code].xp} XP`;
  message.classList.add('redeem-success');

  const usedCodes = {};
  for (const c in redeemCodes) {
    usedCodes[c] = redeemCodes[c].used;
  }
  localStorage.setItem('usedRedeemCodes', JSON.stringify(usedCodes));

  setTimeout(() => {
    input.value = '';
  }, 2000);
}

function initUserManagement() {
  if (userId !== ADMIN_ID) return;

  document.getElementById('usersListItem').addEventListener('click', function() {
    document.getElementById('userModal').style.display = 'block';
    document.getElementById('menuDropdown').style.display = 'none';
  });

  document.getElementById('userModalClose').addEventListener('click', function() {
    document.getElementById('userModal').style.display = 'none';
  });

  document.getElementById('userSubmitBtn').addEventListener('click', function() {
    const targetUserId = document.getElementById('targetUserId').value.trim();
    const level = parseInt(document.getElementById('setUserLevel').value);
    const xp = parseInt(document.getElementById('setUserXP').value);
    const message = document.getElementById('userMessage');

    message.style.display = 'none';

    if (!targetUserId) {
      showUserMessage('Please enter a User ID', 'error');
      return;
    }

    if (isNaN(xp) || xp < 0) {
      showUserMessage('Please enter a valid XP amount', 'error');
      return;
    }

    let allUserData = JSON.parse(localStorage.getItem('allUserData') || '{}');

    if (!allUserData[targetUserId]) {
      allUserData[targetUserId] = {};
    }

    allUserData[targetUserId].level = level;
    allUserData[targetUserId].xp = xp;
    allUserData[targetUserId].givenBy = 'Veux';
    allUserData[targetUserId].timestamp = new Date().toISOString();

    localStorage.setItem('allUserData', JSON.stringify(allUserData));

    showUserMessage(`Successfully updated user ${targetUserId}`, 'success');
    
    document.getElementById('targetUserId').value = '';
    document.getElementById('setUserXP').value = '';
  });
}

function showUserMessage(text, type) {
  const message = document.getElementById('userMessage');
  message.textContent = text;
  message.className = `user-message ${type}-message`;
  message.style.display = 'block';
}

function checkForAdminGifts() {
  if (userId === ADMIN_ID) return;

  const allUserData = JSON.parse(localStorage.getItem('allUserData') || '{}');
  const userData = allUserData[userId];

  if (userData) {
    const oldLevel = userLevel;
    const oldXP = userXP;
    
    userLevel = userData.level;
    userXP = userData.xp;
    
    if (userLevel > oldLevel) {
      for (let i = oldLevel + 1; i <= userLevel; i++) {
        setTimeout(() => {
          showNotification(`U LEVEL UP ${i}\nGiven by - ${userData.givenBy || 'Veux'}`);
        }, i * 500);
      }
    }
    
    if (userXP > oldXP) {
      setTimeout(() => {
        showNotification(`U GOT ${userXP - oldXP} XP\nGiven by - ${userData.givenBy || 'Veux'}`);
      }, 1000);
    }
    
    if (userLevel === 5) {
      setTimeout(() => {
        showNotification(`U ARE LEVEL 5 (MAX)\nGiven by - ${userData.givenBy || 'Veux'}`);
      }, 1500);
    }
    
    saveProgress();
  }
}

function initLevelSystem() {
  const savedData = localStorage.getItem('movesetMakerProgress');
  if (savedData) {
    const data = JSON.parse(savedData);
    const lastLogin = new Date(data.lastLogin || 0);
    const today = new Date();
    
    if (lastLogin.toDateString() !== today.toDateString()) {
      completedTasks = [];
      tasksCompletedToday = 0;
    } else {
      completedTasks = data.completedTasks || [];
      tasksCompletedToday = completedTasks.length;
    }
    
    userLevel = data.level || 1;
    userXP = data.xp || 0;
  }
  updateLevelDisplay();
  setupTaskSystem();
  checkFeatureLocks();
}

function saveProgress() {
  const resetTime = new Date();
  resetTime.setSeconds(resetTime.getSeconds() + taskTimeLeft);

  const data = {
    level: userLevel,
    xp: userXP,
    completedTasks: completedTasks,
    lastLogin: new Date().toISOString(),
    taskResetTime: resetTime.toISOString()
  };
  localStorage.setItem('movesetMakerProgress', JSON.stringify(data));
}

function updateLevelDisplay() {
  document.getElementById('currentLevel').textContent = userLevel;
  document.getElementById('currentXP').textContent = userXP;
  document.getElementById('neededXP').textContent = levelRequirements[userLevel];
  
  const xpPercentage = Math.min(100, (userXP / levelRequirements[userLevel]) * 100);
  document.getElementById('xpProgress').style.width = `${xpPercentage}%`;
  
  checkLevelUp();
}

function checkLevelUp() {
  const oldLevel = userLevel;
  
  while (userLevel < levelRequirements.length - 1 && userXP >= levelRequirements[userLevel]) {
    userLevel++;
  }
  
  if (userLevel > oldLevel) {
    showLevelUp(userLevel);
    checkFeatureLocks();
  }
  
  saveProgress();
}

function showLevelUp(newLevel) {
  const popup = document.getElementById('levelUpPopup');
  document.getElementById('newLevelDisplay').textContent = newLevel;
  
  let unlockMessage = "";
  if (newLevel >= 2) unlockMessage = "YOU HAVE UNLOCKED SOUNDS!";
  if (newLevel >= 3) unlockMessage = "YOU HAVE UNLOCKED ADVANCED EFFECTS!";
  if (newLevel >= 4) unlockMessage = "YOU HAVE UNLOCKED SPECIAL MOVES!";
  if (newLevel >= 5) unlockMessage = "YOU HAVE UNLOCKED ALL FEATURES!";
  
  document.getElementById('unlockMessage').textContent = unlockMessage;
  createConfetti();
  popup.classList.remove('hidden');
}

function closeLevelUp() {
  const popup = document.getElementById('levelUpPopup');
  popup.classList.add('hidden');
  
  const confettiElements = document.querySelectorAll('.confetti');
  confettiElements.forEach(confetti => confetti.remove());
}

function createConfetti() {
  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
  const container = document.querySelector('.level-up-container');
  
  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.width = Math.random() * 10 + 5 + 'px';
    confetti.style.height = Math.random() * 10 + 5 + 'px';
    confetti.style.animation = `confetti-fall ${Math.random() * 3 + 2}s linear forwards`;
    container.appendChild(confetti);
  }
}

function addXP(amount) {
  if (amount <= 0) return;
  
  userXP += amount;
  updateLevelDisplay();
  showNotification(`+${amount} XP Earned!`);
}

function setupTaskSystem() {
  const savedData = localStorage.getItem('movesetMakerProgress');
  if (savedData) {
    const data = JSON.parse(savedData);
    completedTasks = data.completedTasks || [];
    
    if (data.taskResetTime) {
      const now = new Date();
      const resetTime = new Date(data.taskResetTime);
      const timeLeft = Math.max(0, Math.floor((resetTime - now) / 1000));
      
      if (timeLeft > 0) {
        taskTimeLeft = timeLeft;
      } else {
        resetTasks();
        return;
      }
    }
  }
  
  if (currentTasks.length === 0) {
    currentTasks = getRandomTasks(3);
    currentTasks.push(allPossibleTasks.find(task => task.id === 2));
  }
  
  renderTasks();
  startTaskTimer();
}

function getRandomTasks(count) {
  const availableTasks = allPossibleTasks.filter(task => task.id !== 2);
  const shuffled = [...availableTasks].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function renderTasks() {
  const tasksContainer = document.querySelector('.daily-tasks');
  const taskItems = tasksContainer.querySelectorAll('.task-item');
  
  taskItems.forEach((taskItem, index) => {
    if (index < currentTasks.length) {
      const task = currentTasks[index];
      const checkbox = taskItem.querySelector('input[type="checkbox"]');
      const label = taskItem.querySelector('label');
      const xpBadge = taskItem.querySelector('.task-xp');
      
      label.textContent = task.text;
      xpBadge.textContent = `+${task.xp} XP`;
      
      checkbox.checked = completedTasks.includes(task.id);
      checkbox.disabled = checkbox.checked;
    }
  });
  
  setInterval(checkActiveTasks, 1000);
}

function startTaskTimer() {
  clearInterval(taskResetInterval);
  
  updateTaskTimerDisplay();
  
  taskResetInterval = setInterval(() => {
    taskTimeLeft--;
    updateTaskTimerDisplay();
    
    if (taskTimeLeft <= 0) {
      resetTasks();
    }
    
    if (taskTimeLeft % 60 === 0) {
      saveProgress();
    }
  }, 1000);
}

function updateTaskTimerDisplay() {
  const minutes = Math.floor(taskTimeLeft / 60);
  const seconds = taskTimeLeft % 60;
  document.getElementById('taskTimer').textContent = 
    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function resetTasks() {
  completedTasks = completedTasks.filter(id => id === 2);
  
  currentTasks = getRandomTasks(3);
  currentTasks.push(allPossibleTasks.find(task => task.id === 2));
  renderTasks();
  
  taskTimeLeft = 7 * 60;
  updateTaskTimerDisplay();
  
  saveProgress();
  
  showNotification('New tasks available!');
}

function checkActiveTasks() {
  currentTasks.forEach(task => {
    if (!completedTasks.includes(task.id)) {
      const isCompleted = task.check();
      if (isCompleted) {
        completedTasks.push(task.id);
        addXP(task.xp);
        saveProgress();
        
        const taskItems = document.querySelectorAll('.task-item');
        taskItems.forEach(item => {
          const label = item.querySelector('label');
          if (label.textContent === task.text) {
            const checkbox = item.querySelector('input[type="checkbox"]');
            checkbox.checked = true;
            checkbox.disabled = true;
          }
        });
      }
    }
  });
}

function checkAllMovesFilled() {
  const move1 = document.getElementById('move1').value.trim();
  const move2 = document.getElementById('move2').value.trim();
  const move3 = document.getElementById('move3').value.trim();
  const move4 = document.getElementById('move4').value.trim();
  return move1 && move2 && move3 && move4;
}

function checkAnimationReplacements(count) {
  const animInputs = document.querySelectorAll('[id^="orig"]');
  let filledCount = 0;
  animInputs.forEach(input => {
    const id = input.id.replace('orig', '');
    if (input.value.trim() && document.getElementById(`repl${id}`).value.trim()) {
      filledCount++;
    }
  });
  return filledCount >= count;
}

function checkFontVariety(count) {
  const fonts = new Set();
  fonts.add(document.getElementById('font1').value);
  fonts.add(document.getElementById('font2').value);
  fonts.add(document.getElementById('font3').value);
  fonts.add(document.getElementById('font4').value);
  fonts.add(document.getElementById('fontUltimate').value);
  return fonts.size >= count;
}

function checkVFXCount(count) {
  let vfxCount = 0;
  for (let i = 1; i <= maxMoveNumber; i++) {
    const moveSelect = document.getElementById(`moveSelect${i}`)?.value;
    const vfxPath = document.getElementById(`vfxPath${i}`)?.value;
    if (moveSelect && vfxPath && replAnimIds[moveSelect - 1]) {
      vfxCount++;
    }
  }
  return vfxCount >= count;
}

function checkSoundCount(count) {
  return soundEntries.length >= count;
}

function checkFontUsed(fontName) {
  return document.getElementById('font1').value === fontName ||
         document.getElementById('font2').value === fontName ||
         document.getElementById('font3').value === fontName ||
         document.getElementById('font4').value === fontName ||
         document.getElementById('fontUltimate').value === fontName;
}

function checkCustomAnimationSpeed() {
  const animInputs = document.querySelectorAll('[id^="speed"]');
  for (const input of animInputs) {
    if (input.value && parseFloat(input.value) !== 1) {
      return true;
    }
  }
  return false;
}

function checkFeatureLocks() {
  const soundsSection = document.getElementById('soundsInput');
  if (userLevel < 2) {
    soundsSection.classList.add('locked-feature');
    soundsSection.setAttribute('data-level', '2');
  } else {
    soundsSection.classList.remove('locked-feature');
  }
  
  checkToolUnlock();
  checkFireEffectUnlock();
}

function checkToolUnlock() {
  const toolsSection = document.getElementById('toolsInput');
  if (userLevel >= 2) {
    toolsSection.classList.remove('locked-feature');
  } else {
    toolsSection.classList.add('locked-feature');
    toolsSection.setAttribute('data-level', '2');
  }
}

function checkFireEffectUnlock() {
  const fireEffectSection = document.getElementById('fireEffectInput');
  if (userLevel >= 4) {
    fireEffectSection.classList.remove('locked-feature');
  } else {
    fireEffectSection.classList.add('locked-feature');
    fireEffectSection.setAttribute('data-level', '4');
  }
}

function showNotification(message) {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.classList.remove('hidden');
  setTimeout(() => notification.classList.add('hidden'), 3000);
}

function validateInputs(ids) {
  for (const id of ids) {
    const element = document.getElementById(id);
    if (!element || !element.value.trim()) {
      if (element) element.focus();
      return false;
    }
  }
  return true;
}

function submitMoves() {
  const required = ['move1', 'move2', 'move3', 'move4', 'ultimate'];
  if (!validateInputs(required)) {
    showNotification('Please complete all fields');
    return;
  }
  document.getElementById("moveInputs").style.display = "none";
  document.getElementById("animationInputs").style.display = "block";
  checkActiveTasks();
}

function addAnimationField() {
  animationCount++;
  const newId = animationCount;
  const animationHTML = `
    <div class="animation-control" id="animControl${newId}">
      <button class="remove-animation" onclick="removeAnimation(${newId})">×</button>
      <div class="input-card">
        <label>Original Animation ID ${newId}</label>
        <input type="text" id="orig${newId}" required>
      </div>
      <div class="animation-settings">
        <div class="setting-group">
          <label>Replacement ID</label>
          <input type="text" id="repl${newId}" required>
        </div>
        <div class="setting-group">
          <label>Start Time</label>
          <input type="number" id="time${newId}" value="0" step="0.1" min="0">
        </div>
        <div class="setting-group">
          <label>Speed</label>
          <input type="number" id="speed${newId}" value="1" step="0.1" min="0.1">
        </div>
      </div>
    </div>
  `;
  document.getElementById('additionalAnimations').insertAdjacentHTML('beforeend', animationHTML);
  if (newId > maxMoveNumber) maxMoveNumber = newId;
}

function removeAnimation(id) {
  const element = document.getElementById(`animControl${id}`);
  if (element) {
    element.remove();
    if (id === maxMoveNumber) maxMoveNumber = Math.max(4, animationCount - 1);
  }
}

function submitAnimations() {
  const allOrig = [];
  const allRepl = [];
  const animationInputs = document.querySelectorAll('[id^="orig"]');
  
  for (const input of animationInputs) {
    const id = input.id.replace('orig', '');
    const origValue = input.value.trim();
    const replValue = document.getElementById(`repl${id}`).value.trim();
    
    if (origValue || replValue) {
      if (!origValue) {
        input.focus();
        showNotification('Please complete original animation ID');
        return;
      }
      if (!replValue) {
        document.getElementById(`repl${id}`).focus();
        showNotification('Please complete replacement animation ID');
        return;
      }
      allOrig.push(`orig${id}`);
      allRepl.push(`repl${id}`);
    }
  }

  if (allOrig.length === 0) {
    showNotification('Please add at least one animation replacement');
    return;
  }
  
  replAnimIds = allRepl.map(id => document.getElementById(id).value);
  updateVFXSection();
  document.getElementById("animationInputs").style.display = "none";
  document.getElementById("vfxInputs").style.display = "block";
  checkActiveTasks();
}

function updateVFXSection() {
  const vfxContainer = document.getElementById("vfxInputs");
  vfxContainer.innerHTML = '';
  
  for (let i = 1; i <= maxMoveNumber; i++) {
    const vfxHTML = `
      <div class="vfx-control">
        <div class="setting-group">
          <label>Pick The Move To Run VFX --></label>
          <select id="moveSelect${i}" ${i <= 4 ? 'required' : ''}>
            <option value="">Select Move</option>
            ${Array.from({length: maxMoveNumber}, (_, j) => 
              `<option value="${j+1}">Move ${j+1}</option>`).join('')}
          </select>
        </div>
        <div class="setting-group">
          <label>VFX Path Here --></label>
          <input type="text" id="vfxPath${i}" ${i <= 4 ? 'required' : ''}>
        </div>
        <div class="setting-group">
          <label>Destroy Time (seconds)</label>
          <input type="number" id="destroyTime${i}" value="3" min="0.1" step="0.1">
        </div>
      </div>
    `;
    vfxContainer.insertAdjacentHTML('beforeend', vfxHTML);
  }
  
  vfxContainer.insertAdjacentHTML('beforeend', 
    `<button class="btn" onclick="updateSoundSection()">Continue</button>`);
}

function updateSoundSection() {
  const soundContainer = document.getElementById("soundsInput");
  soundContainer.innerHTML = '';
  
  for (let i = 1; i <= maxMoveNumber; i++) {
    const soundHTML = `
      <div class="vfx-control">
        <div class="setting-group">
          <label>Pick The Move For Sound --></label>
          <select id="soundMoveSelect${i}">
            <option value="">Select Move</option>
            ${Array.from({length: maxMoveNumber}, (_, j) => 
              `<option value="${j+1}">Move ${j+1}</option>`).join('')}
          </select>
        </div>
        <div class="setting-group">
          <label>GitHub Raw URL</label>
          <input type="text" id="soundUrl${i}">
        </div>
        <div class="setting-group">
          <label>File Name (e.g., sound.mp3)</label>
          <input type="text" id="fileName${i}">
        </div>
      </div>
    `;
    soundContainer.insertAdjacentHTML('beforeend', soundHTML);
  }
  
  soundContainer.insertAdjacentHTML('beforeend', 
    `<button class="btn" onclick="submitSounds()">Continue</button>`);
  
  document.getElementById("vfxInputs").style.display = "none";
  document.getElementById("soundsInput").style.display = "block";
}

function submitSounds() {
  soundEntries = [];
  
  for (let i = 1; i <= maxMoveNumber; i++) {
    const select = document.getElementById(`soundMoveSelect${i}`)?.value;
    const url = document.getElementById(`soundUrl${i}`)?.value.trim();
    const fileName = document.getElementById(`fileName${i}`)?.value.trim();
    
    if (select && url && fileName) {
      soundEntries.push({
        move: select,
        url: url,
        fileName: fileName
      });
    }
    else if (select || url || fileName) {
      showNotification('Please complete all sound fields or leave all empty');
      return;
    }
  }
  
  document.getElementById("soundsInput").style.display = "none";
  
  if (userLevel >= 2) {
    document.getElementById("toolsInput").style.display = "block";
  } else {
    document.getElementById("creditsInput").style.display = "block";
  }
}

function addToolField() {
  toolCount++;
  const newId = toolCount;
  const toolHTML = `
    <div class="tool-control" id="toolControl${newId}">
      <button class="remove-tool" onclick="removeTool(${newId})">×</button>
      
      <div class="input-card">
        <label>TOOL NAME</label>
        <input type="text" id="toolName${newId}" required>
      </div>
      
      <div class="tool-settings">
        <div class="setting-group">
          <label>ACTIVATION TYPE</label>
          <select id="toolType${newId}">
            <option value="equip">Equip</option>
            <option value="active">Active</option>
          </select>
        </div>
      </div>
      
      <div class="setting-group">
        <label>TOOL SCRIPT (Lua code)</label>
        <textarea id="toolScript${newId}" class="tool-script" placeholder="-- Put your Lua script here"></textarea>
      </div>
    </div>
  `;
  document.getElementById('additionalTools').insertAdjacentHTML('beforeend', toolHTML);
  if (newId > maxToolNumber) maxToolNumber = newId;
}

function removeTool(id) {
  const element = document.getElementById(`toolControl${id}`);
  if (element) {
    element.remove();
    if (id === maxToolNumber) maxToolNumber = Math.max(1, toolCount - 1);
  }
}

function submitTools() {
  toolEntries = [];
  
  for (let i = 1; i <= maxToolNumber; i++) {
    const toolControl = document.getElementById(`toolControl${i}`);
    if (toolControl) {
      const name = document.getElementById(`toolName${i}`)?.value.trim();
      const type = document.getElementById(`toolType${i}`)?.value;
      const script = document.getElementById(`toolScript${i}`)?.value.trim();
      
      if (name && type && script) {
        toolEntries.push({
          name: name,
          type: type,
          script: script
        });
      } else if (name || type || script) {
        showNotification('Please complete all tool fields or remove empty ones');
        return;
      }
    }
  }
  
  if (toolEntries.length === 0) {
    showNotification('Please add at least one tool');
    return;
  }
  
  document.getElementById("toolsInput").style.display = "none";
  
  if (userLevel >= 4) {
    document.getElementById("fireEffectInput").style.display = "block";
  } else {
    document.getElementById("creditsInput").style.display = "block";
  }
}

function validateMoveNumber(input) {
  input.value = input.value.replace(/\D/g, '');
  if (input.value) {
    let num = parseInt(input.value);
    if (num < 1) input.value = '1';
    if (num > 15) input.value = '15';
  }
}

function addFireEffectField() {
  fireEffectCount++;
  const newId = fireEffectCount;
  const fireEffectHTML = `
    <div class="fire-effect-control" id="fireEffectControl${newId}">
      <button class="remove-fire-effect" onclick="removeFireEffect(${newId})">×</button>
      
      <div class="input-card">
        <label>MOVE NUMBER (1-15)</label>
        <input type="text" id="fireEffectMove${newId}" class="fire-effect-number" placeholder="Enter move number" oninput="validateMoveNumber(this)">
      </div>
    </div>
  `;
  document.getElementById('additionalFireEffects').insertAdjacentHTML('beforeend', fireEffectHTML);
  if (newId > maxFireEffectNumber) maxFireEffectNumber = newId;
}

function removeFireEffect(id) {
  const element = document.getElementById(`fireEffectControl${id}`);
  if (element) {
    element.remove();
    if (id === maxFireEffectNumber) maxFireEffectNumber = Math.max(1, fireEffectCount - 1);
  }
}

function submitFireEffects() {
  fireEffectEntries = [];
  
  for (let i = 1; i <= maxFireEffectNumber; i++) {
    const element = document.getElementById(`fireEffectMove${i}`);
    if (!element) continue;
    
    const moveNum = element.value.trim();
    
    if (moveNum) {
      const num = parseInt(moveNum);
      if (num >= 1 && num <= 15) {
        fireEffectEntries.push({
          moveNum: num
        });
      } else {
        showNotification('Please enter a number between 1-15 for Fire Effects');
        element.focus();
        return;
      }
    }
  }
  
  document.getElementById("fireEffectInput").style.display = "none";
  document.getElementById("creditsInput").style.display = "block";
}

function generateFinalCode() {
  if (!document.getElementById("creditsText").value.trim()) {
    showNotification('Please enter credits text');
    return;
  }

  const generating = showGeneratingAnimation();
  
  setTimeout(() => {
    const m1 = document.getElementById("move1").value;
    const m2 = document.getElementById("move2").value;
    const m3 = document.getElementById("move3").value;
    const m4 = document.getElementById("move4").value;
    const ult = document.getElementById("ultimate").value;
    const credits = document.getElementById("creditsText").value || "Made By Veux";

    const fonts = [
      document.getElementById("font1").value,
      document.getElementById("font2").value,
      document.getElementById("font3").value,
      document.getElementById("font4").value,
      document.getElementById("fontUltimate").value
    ];

    const animationInputs = document.querySelectorAll('[id^="orig"]');
    const animData = [];
    
    animationInputs.forEach(input => {
      const id = input.id.replace('orig', '');
      const orig = input.value;
      const repl = document.getElementById(`repl${id}`).value;
      const time = document.getElementById(`time${id}`)?.value || 0;
      const speed = document.getElementById(`speed${id}`)?.value || 1;
      
      if (orig && repl) {
        animData.push({ orig, repl, time, speed });
      }
    });

    let vfxCode = "";
    const vfxEntries = [];
    
    for (let i = 1; i <= maxMoveNumber; i++) {
      const moveSelect = document.getElementById(`moveSelect${i}`)?.value;
      const vfxPath = document.getElementById(`vfxPath${i}`)?.value;
      const destroyTime = document.getElementById(`destroyTime${i}`)?.value || 3;
      
      if (moveSelect && vfxPath && replAnimIds[moveSelect - 1]) {
        vfxEntries.push({
          animId: replAnimIds[moveSelect - 1],
          path: vfxPath,
          destroyTime: destroyTime
        });
      }
    }
    
    if (vfxEntries.length > 0) {
      vfxCode = `\n\n-- VFX Code\nlocal Cr = game:GetService("Players")\n` +
        `local Rep = game:GetService("ReplicatedStorage")\n\n` +
        `local lolskider = Cr.LocalPlayer\n` +
        `local dect = lolskider.Character or lolskider.CharacterAdded:Wait()\n` +
        `local human = dect:WaitForChild("Humanoid")\n\n`;
        
      for (const entry of vfxEntries) {
        vfxCode += `human.AnimationPlayed:Connect(function(track)\n` +
          `    if track.Animation.AnimationId == "rbxassetid://${entry.animId}" then\n` +
          `        local Test = ${entry.path}\n` +
          `        local test = Test:Clone()\n` +
          `        test.Parent = dect:WaitForChild("HumanoidRootPart")\n\n` +
          `        for _, child in ipairs(test:GetChildren()) do\n` +
          `            if child:IsA("ParticleEmitter") then\n` +
          `                child:Emit(15)\n` +
          `                child.Enabled = true\n` +
          `            end\n` +
          `        end\n` +
          `        wait(${entry.destroyTime})\n` +
          `        test:Destroy()\n` +
          `    end\n` +
          `end)\n\n`;
      }
    }

    let soundCode = "\n\n-- Sound Code\n";
    soundEntries.forEach(entry => {
      soundCode += `local ${entry.fileName.replace(/[^a-zA-Z]/g, '')}Track = human.AnimationPlayed:Connect(function(track)\n`;
      soundCode += `    if track.Animation.AnimationId == "rbxassetid://${replAnimIds[entry.move-1]}" then\n`;
      soundCode += `        local url = "${entry.url}"\n`;
      soundCode += `        local fileName = "${entry.fileName}"\n\n`;
      soundCode += `        if not isfile(fileName) then\n`;
      soundCode += `            writefile(fileName, game:HttpGet(url))\n`;
      soundCode += `        end\n\n`;
      soundCode += `        local sound = Instance.new("Sound")\n`;
      soundCode += `        sound.SoundId = getcustomasset(fileName)\n`;
      soundCode += `        sound.Volume = 1\n`;
      soundCode += `        sound.Looped = false\n`;
      soundCode += `        sound.Parent = game.Players.LocalPlayer.PlayerGui\n`;
      soundCode += `        sound:Play()\n`;
      soundCode += `    end\n`;
      soundCode += `end)\n\n`;
    });

    const watermarkCode = `\n\nlocal a=game;local b=a:GetService("Players")\n` +
      `local c=b.LocalPlayer;local d=c:WaitForChild("PlayerGui")\n` +
      `local e=Instance.new("ScreenGui",d)e.Name="WatermarkGui"\n` +
      `local f=Instance.new("TextLabel",e)f.Text="created On CustomMoveMaker.netlify.app"\n` +
      `f.Size=UDim2.new(0.3,0,0.05,0)f.Position=UDim2.new(0.35,0,0,0)\n` +
      `f.BackgroundTransparency=1;f.TextTransparency=0.5;f.TextSize=13\n` +
      `f.TextColor3=Color3.new(1,1,1)e.ResetOnSpawn=false\n\n`;

    const creditsCode = `\n\nlocal g=Instance.new("ScreenGui",d)g.Name="CreditsGui"\n` +
      `local h=Instance.new("TextLabel",g)h.Text="${credits}"\n` +
      `h.TextColor3=Color3.new(1,1,1)h.TextSize=18\n` +
      `h.Font=Enum.Font.SourceSansBold;h.BackgroundTransparency=1\n` +
      `h.Position=UDim2.new(0.01,0,0.01,0)h.Size=UDim2.new(0,200,0,30)\n` +
      `h.TextXAlignment=Enum.TextXAlignment.Left;g.ResetOnSpawn=false\n\n`;

    let movesCode = `local player = game.Players.LocalPlayer\n` +
      `local playerGui = player.PlayerGui\n` +
      `local hotbar = playerGui:FindFirstChild("Hotbar")\n` +
      `local backpack = hotbar:FindFirstChild("Backpack")\n` +
      `local hotbarFrame = backpack:FindFirstChild("Hotbar")\n\n` +
      `-- Button 1\nlocal baseButton1 = hotbarFrame:FindFirstChild("1").Base\nlocal ToolName1 = baseButton1.ToolName\n` +
      `ToolName1.Text = "${m1}"\nToolName1.Font = Enum.Font.${fonts[0]}\n\n` +
      `-- Button 2\nlocal baseButton2 = hotbarFrame:FindFirstChild("2").Base\nlocal ToolName2 = baseButton2.ToolName\n` +
      `ToolName2.Text = "${m2}"\nToolName2.Font = Enum.Font.${fonts[1]}\n\n` +
      `-- Button 3\nlocal baseButton3 = hotbarFrame:FindFirstChild("3").Base\nlocal ToolName3 = baseButton3.ToolName\n` +
      `ToolName3.Text = "${m3}"\nToolName3.Font = Enum.Font.${fonts[2]}\n\n` +
      `-- Button 4\nlocal baseButton4 = hotbarFrame:FindFirstChild("4").Base\nlocal ToolName4 = baseButton4.ToolName\n` +
      `ToolName4.Text = "${m4}"\nToolName4.Font = Enum.Font.${fonts[3]}\n\n` +
      `local function waitForGui()\n    local player = game.Players.LocalPlayer\n    local playerGui = player:WaitForChild("PlayerGui")\n    while true do\n        local screenGui = playerGui:FindFirstChild("ScreenGui")\n        if screenGui then\n            local magicHealthFrame = screenGui:FindFirstChild("MagicHealth")\n            if magicHealthFrame then\n                local textLabel = magicHealthFrame:FindFirstChild("TextLabel")\n                if textLabel then\n                    textLabel.Text = "${ult}"\n` +
      `                    textLabel.Font = Enum.Font.${fonts[4]}\n                    return\n                end\n            end\n        end\n        wait(1)\n    end\nend\n\nwaitForGui()`;
      
  let toolsCode = "\n\n-- Tools Code\n";
  if (toolEntries.length > 0) {
    toolEntries.forEach((tool, index) => {
      toolsCode += `-- ${tool.name} (${tool.type})\n`;
      
      if (tool.type === 'equip') {
        toolsCode += `local ${tool.name.replace(/\s+/g, '')}Tool = Instance.new("Tool")\n`;
        toolsCode += `${tool.name.replace(/\s+/g, '')}Tool.Name = "${tool.name}"\n`;
        toolsCode += `${tool.name.replace(/\s+/g, '')}Tool.RequiresHandle = false\n\n`;
        toolsCode += `${tool.name.replace(/\s+/g, '')}Tool.Equipped:Connect(function()\n`;
        toolsCode += `    -- Equip logic\n`;
        toolsCode += tool.script.replace(/^/gm, '    ') + '\n';
        toolsCode += `end)\n\n`;
        toolsCode += `${tool.name.replace(/\s+/g, '')}Tool.Parent = game:GetService("StarterPack")\n\n`;
      } else {
        toolsCode += `local ${tool.name.replace(/\s+/g, '')}Tool = Instance.new("Tool")\n`;
        toolsCode += `${tool.name.replace(/\s+/g, '')}Tool.Name = "${tool.name}"\n`;
        toolsCode += `${tool.name.replace(/\s+/g, '')}Tool.RequiresHandle = false\n\n`;
        toolsCode += `${tool.name.replace(/\s+/g, '')}Tool.Activated:Connect(function()\n`;
        toolsCode += `    -- Activation logic\n`;
        toolsCode += tool.script.replace(/^/gm, '    ') + '\n';
        toolsCode += `end)\n\n`;
        toolsCode += `${tool.name.replace(/\s+/g, '')}Tool.Parent = game:GetService("StarterPack")\n\n`;
      }
    });
  }
  
  let fireEffectCode = "\n\n-- Fire Effects Code\n";
  if (fireEffectEntries.length > 0) {
    fireEffectEntries.forEach((effect, index) => {
      fireEffectCode += `-- Fire Effect for Move ${effect.moveNum}\n`;
      fireEffectCode += `local MoveNum${index} = "${effect.moveNum}"\n`;
      fireEffectCode += `loadstring(game:HttpGet("https://raw.githubusercontent.com/LolnotaKid/Skull-6/refs/heads/main/Protected_2022887253589930.lua.txt"))()\n\n`;
    });
  }

    let animReplaceCode = `\n\nlocal function onAnimationPlayed(animationTrack)\n    local animationId = tonumber(animationTrack.Animation.AnimationId:match("%d+"))\n\n    local animationReplacements = {\n`;
    
    animData.forEach(anim => {
      animReplaceCode += `        [${anim.orig}] = {\n` +
        `            id = "rbxassetid://${anim.repl}",\n` +
        `            time = ${anim.time},\n` +
        `            speed = ${anim.speed}\n` +
        `        },\n`;
    });
    
    animReplaceCode += `    }\n\n    local replacement = animationReplacements[animationId]\n    if replacement then\n        for _, animTrack in pairs(game.Players.LocalPlayer.Character.Humanoid:GetPlayingAnimationTracks()) do\n            animTrack:Stop()\n        end\n        wait(0.1)\n\n        local anim = Instance.new("Animation")\n        anim.AnimationId = replacement.id\n        local newAnimTrack = game.Players.LocalPlayer.Character.Humanoid:LoadAnimation(anim)\n        newAnimTrack:Play()\n\n        newAnimTrack:AdjustSpeed(0)\n        newAnimTrack.TimePosition = replacement.time\n        newAnimTrack:AdjustSpeed(replacement.speed)\n    end\nend\n\nlocal humanoid = game.Players.LocalPlayer.Character:WaitForChild("Humanoid")\nhumanoid.AnimationPlayed:Connect(onAnimationPlayed)\n\nlocal function onBodyVelocityAdded(bodyVelocity)\n    if bodyVelocity:IsA("BodyVelocity") then\n        bodyVelocity.Velocity = Vector3.new(bodyVelocity.Velocity.X, 0, bodyVelocity.Velocity.Z)\n    end\nend\n\nlocal character = game.Players.LocalPlayer.Character\nfor _, descendant in pairs(character:GetDescendants()) do\n    onBodyVelocityAdded(descendant)\nend\n\ncharacter.DescendantAdded:Connect(onBodyVelocityAdded)\n\ngame.Players.LocalPlayer.CharacterAdded:Connect(function(newCharacter)\n    for _, descendant in pairs(newCharacter:GetDescendants()) do\n        onBodyVelocityAdded(descendant)\n    end\n    newCharacter.DescendantAdded:Connect(onBodyVelocityAdded)\nend)`;

    const fullCode = watermarkCode + creditsCode + movesCode + animReplaceCode + vfxCode + soundCode + toolsCode + fireEffectCode;
    const codeBox = document.getElementById("luaCode");
    const codeOutput = document.getElementById("codeOutput");
    
    codeBox.textContent = fullCode;
    codeOutput.style.display = "block";
    codeOutput.scrollIntoView({ behavior: 'smooth' });
    
    document.getElementById('copyBtn').onclick = function() {
      navigator.clipboard.writeText(fullCode).then(() => {
        const btn = document.getElementById('copyBtn');
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy to Clipboard', 2000);
      });
    };

    if (!completedTasks.includes(2)) {
      completedTasks.push(2);
      addXP(25);
      saveProgress();
      
      const taskItems = document.querySelectorAll('.task-item');
      taskItems.forEach(item => {
        const label = item.querySelector('label');
        if (label.textContent === "Generate a complete moveset code") {
          const checkbox = item.querySelector('input[type="checkbox"]');
          checkbox.checked = true;
          checkbox.disabled = true;
        }
      });
    }

    generating.hide();
  }, 1500);
}

function showGeneratingAnimation() {
  const loader = document.getElementById('generatingLoader');
  const dots = document.getElementById('generatingDots');
  loader.style.display = 'flex';
  
  let dotCount = 0;
  const dotInterval = setInterval(() => {
    dotCount = (dotCount + 1) % 4;
    dots.textContent = '.'.repeat(dotCount);
  }, 500);
  
  return {
    hide: () => {
      clearInterval(dotInterval);
      loader.style.display = 'none';
    }
  };
}

function downloadCode() {
  const code = document.getElementById("luaCode").textContent;
  const blob = new Blob([code], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'custom_moveset.lua';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

document.addEventListener('DOMContentLoaded', function() {
  splashText.textContent = 'Made By Veux 🎫';
  
  initUserId();
  initGearMenu();
  initUserManagement();
  checkForAdminGifts();
  
  setTimeout(function() {
    splashScreen.style.opacity = '0';
    setTimeout(function() {
      splashScreen.classList.add('hidden');
      mainMenu.classList.remove('hidden');
      
      initLevelSystem();
    }, 1000);
  }, 3000);

  document.getElementById('startBtn').addEventListener('click', function() {
    mainMenu.classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
  });
});