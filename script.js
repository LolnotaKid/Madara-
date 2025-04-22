let replAnimIds = [];
let animationCount = 4;
let maxMoveNumber = 4;
let soundEntries = [];

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
  if (newId > maxMoveNumber) {
    maxMoveNumber = newId;
  }
}

function removeAnimation(id) {
  const element = document.getElementById(`animControl${id}`);
  if (element) {
    element.remove();
    if (id === maxMoveNumber) {
      maxMoveNumber = Math.max(4, animationCount - 1);
    }
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
  vfxContainer.insertAdjacentHTML('beforeend', `<button class="btn" onclick="updateSoundSection()">Continue</button>`);
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
          <label>File Name</label>
          <input type="text" id="fileName${i}">
        </div>
      </div>
    `;
    soundContainer.insertAdjacentHTML('beforeend', soundHTML);
  }
  soundContainer.insertAdjacentHTML('beforeend', `<button class="btn" onclick="submitSounds()">Continue</button>`);
  document.getElementById("vfxInputs").style.display = "none";
  document.getElementById("soundsInput").style.display = "block";
}

function submitSounds() {
  soundEntries = [];
  for (let i = 1; i <= maxMoveNumber; i++) {
    const select = document.getElementById(`soundMoveSelect${i}`)?.value;
    const url = document.getElementById(`soundUrl${i}`)?.value;
    const fileName = document.getElementById(`fileName${i}`)?.value;
    
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
  document.getElementById("creditsInput").style.display = "block";
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

    let animReplaceCode = `\n\nlocal function onAnimationPlayed(animationTrack)\n    local animationId = tonumber(animationTrack.Animation.AnimationId:match("%d+"))\n\n    local animationReplacements = {\n`;
    
    animData.forEach(anim => {
      animReplaceCode += `        [${anim.orig}] = {\n` +
        `            id = "rbxassetid://${anim.repl}",\n` +
        `            time = ${anim.time},\n` +
        `            speed = ${anim.speed}\n` +
        `        },\n`;
    });
    
    animReplaceCode += `    }\n\n    local replacement = animationReplacements[animationId]\n    if replacement then\n        for _, animTrack in pairs(game.Players.LocalPlayer.Character.Humanoid:GetPlayingAnimationTracks()) do\n            animTrack:Stop()\n        end\n        wait(0.1)\n\n        local anim = Instance.new("Animation")\n        anim.AnimationId = replacement.id\n        local newAnimTrack = game.Players.LocalPlayer.Character.Humanoid:LoadAnimation(anim)\n        newAnimTrack:Play()\n\n        newAnimTrack:AdjustSpeed(0)\n        newAnimTrack.TimePosition = replacement.time\n        newAnimTrack:AdjustSpeed(replacement.speed)\n    end\nend\n\nlocal humanoid = game.Players.LocalPlayer.Character:WaitForChild("Humanoid")\nhumanoid.AnimationPlayed:Connect(onAnimationPlayed)\n\nlocal function onBodyVelocityAdded(bodyVelocity)\n    if bodyVelocity:IsA("BodyVelocity") then\n        bodyVelocity.Velocity = Vector3.new(bodyVelocity.Velocity.X, 0, bodyVelocity.Velocity.Z)\n    end\nend\n\nlocal character = game.Players.LocalPlayer.Character\nfor _, descendant in pairs(character:GetDescendants()) do\n    onBodyVelocityAdded(descendant)\nend\n\ncharacter.DescendantAdded:Connect(onBodyVelocityAdded)\n\ngame.Players.LocalPlayer.CharacterAdded:Connect(function(newCharacter)\n    for _, descendant in pairs(newCharacter:GetDescendants()) do\n        onBodyVelocityAdded(descendant)\n    end\n    newCharacter.DescendantAdded:Connect(onBodyVelocityAdded)\nend)`;

    const fullCode = watermarkCode + creditsCode + movesCode + animReplaceCode + vfxCode + soundCode;
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

    generating.hide();
  }, 1500);
}

document.addEventListener('DOMContentLoaded', function() {
  const splashText = document.getElementById('splashText');
  const splashScreen = document.getElementById('splashScreen');
  const mainMenu = document.getElementById('mainMenu');
  
  splashText.textContent = 'Made By Veux';
  
  setTimeout(function() {
    splashScreen.style.opacity = '0';
    setTimeout(function() {
      splashScreen.classList.add('hidden');
      mainMenu.classList.remove('hidden');
    }, 1000);
  }, 3000);

  document.getElementById('startBtn').addEventListener('click', function() {
    mainMenu.classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
  });
});
