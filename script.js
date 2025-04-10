let replAnimIds = [];

function showNotification(message) {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.classList.remove('hidden');
  setTimeout(() => notification.classList.add('hidden'), 3000);
}

function validateInputs(ids) {
  for (const id of ids) {
    const element = document.getElementById(id);
    if (!element.value.trim()) {
      element.focus();
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

function submitAnimations() {
  const required = ['orig1', 'repl1', 'orig2', 'repl2', 'orig3', 'repl3', 'orig4', 'repl4'];
  if (!validateInputs(required)) {
    showNotification('Please complete all animation fields');
    return;
  }
  
  replAnimIds = [
    document.getElementById("repl1").value,
    document.getElementById("repl2").value,
    document.getElementById("repl3").value,
    document.getElementById("repl4").value
  ];
  
  document.getElementById("animationInputs").style.display = "none";
  document.getElementById("vfxInputs").style.display = "block";
}

function showCreditsInput() {
  const required = [];
  for (let i = 1; i <= 4; i++) {
    const select = document.getElementById(`moveSelect${i}`).value;
    const path = document.getElementById(`vfxPath${i}`).value;
    if (select && !path) required.push(`vfxPath${i}`);
  }
  
  if (required.length > 0) {
    showNotification('Please complete VFX paths for selected moves');
    return;
  }
  
  document.getElementById("vfxInputs").style.display = "none";
  document.getElementById("creditsInput").style.display = "block";
}

function generateFinalCode() {
  if (!document.getElementById("creditsText").value.trim()) {
    showNotification('Please enter credits text');
    return;
  }

  const m1 = document.getElementById("move1").value;
  const m2 = document.getElementById("move2").value;
  const m3 = document.getElementById("move3").value;
  const m4 = document.getElementById("move4").value;
  const ult = document.getElementById("ultimate").value;
  const credits = document.getElementById("creditsText").value || "Made By Veux";

  const origs = ["orig1", "orig2", "orig3", "orig4"].map(id => document.getElementById(id).value);
  const repls = ["repl1", "repl2", "repl3", "repl4"].map(id => document.getElementById(id).value);
  const times = ["time1", "time2", "time3", "time4"].map(id => document.getElementById(id).value);
  const speeds = ["speed1", "speed2", "speed3", "speed4"].map(id => document.getElementById(id).value);

  let vfxCode = "";
  const vfxEntries = [];
  
  for (let i = 1; i <= 4; i++) {
    const moveSelect = document.getElementById(`moveSelect${i}`).value;
    const vfxPath = document.getElementById(`vfxPath${i}`).value;
    if (moveSelect && vfxPath && repls[moveSelect - 1]) {
      vfxEntries.push({
        animId: repls[moveSelect - 1],
        path: vfxPath
      });
    }
  }
  
  if (vfxEntries.length > 0) {
    vfxCode = `\n\nlocal Cr = game:GetService("Players")\n` +
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
        `        wait(3)\n` +
        `        test:Destroy()\n` +
        `    end\n` +
        `end)\n\n`;
    }
  }

  const watermarkCode = `--[[CREATED ON CUSTOMMOVEMAKER.NELIFY.APP]]\n\nlocal a=game;local b=a:GetService("Players")\n` +
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
    `-- Button 1\nlocal baseButton1 = hotbarFrame:FindFirstChild("1").Base\nlocal ToolName1 = baseButton1.ToolName\nToolName1.Text = "${m1}"\n\n` +
    `-- Button 2\nlocal baseButton2 = hotbarFrame:FindFirstChild("2").Base\nlocal ToolName2 = baseButton2.ToolName\nToolName2.Text = "${m2}"\n\n` +
    `-- Button 3\nlocal baseButton3 = hotbarFrame:FindFirstChild("3").Base\nlocal ToolName3 = baseButton3.ToolName\nToolName3.Text = "${m3}"\n\n` +
    `-- Button 4\nlocal baseButton4 = hotbarFrame:FindFirstChild("4").Base\nlocal ToolName4 = baseButton4.ToolName\nToolName4.Text = "${m4}"\n\n` +
    `local function waitForGui()\n    local player = game.Players.LocalPlayer\n    local playerGui = player:WaitForChild("PlayerGui")\n    while true do\n        local screenGui = playerGui:FindFirstChild("ScreenGui")\n        if screenGui then\n            local magicHealthFrame = screenGui:FindFirstChild("MagicHealth")\n            if magicHealthFrame then\n                local textLabel = magicHealthFrame:FindFirstChild("TextLabel")\n                if textLabel then\n                    textLabel.Text = "${ult}"\n                    return\n                end\n            end\n        end\n        wait(1)\n    end\nend\n\nwaitForGui()`;

  let animReplaceCode = `\n\nlocal function onAnimationPlayed(animationTrack)\n    local animationId = tonumber(animationTrack.Animation.AnimationId:match("%d+"))\n\n    local animationReplacements = {\n`;
  for (let i = 0; i < 4; i++) {
    if (origs[i] && repls[i]) {
      animReplaceCode += `        [${origs[i]}] = {\n` +
        `            id = "rbxassetid://${repls[i]}",\n` +
        `            time = ${times[i] || 0},\n` +
        `            speed = ${speeds[i] || 1}\n` +
        `        },\n`;
    }
  }
  animReplaceCode += `    }\n\n    local replacement = animationReplacements[animationId]\n    if replacement then\n        for _, animTrack in pairs(game.Players.LocalPlayer.Character.Humanoid:GetPlayingAnimationTracks()) do\n            animTrack:Stop()\n        end\n        wait(0.1)\n\n        local anim = Instance.new("Animation")\n        anim.AnimationId = replacement.id\n        local newAnimTrack = game.Players.LocalPlayer.Character.Humanoid:LoadAnimation(anim)\n        newAnimTrack:Play()\n\n        newAnimTrack:AdjustSpeed(0)\n        newAnimTrack.TimePosition = replacement.time\n        newAnimTrack:AdjustSpeed(replacement.speed)\n    end\nend\n\nlocal humanoid = game.Players.LocalPlayer.Character:WaitForChild("Humanoid")\nhumanoid.AnimationPlayed:Connect(onAnimationPlayed)\n\nlocal function onBodyVelocityAdded(bodyVelocity)\n    if bodyVelocity:IsA("BodyVelocity") then\n        bodyVelocity.Velocity = Vector3.new(bodyVelocity.Velocity.X, 0, bodyVelocity.Velocity.Z)\n    end\nend\n\nlocal character = game.Players.LocalPlayer.Character\nfor _, descendant in pairs(character:GetDescendants()) do\n    onBodyVelocityAdded(descendant)\nend\n\ncharacter.DescendantAdded:Connect(onBodyVelocityAdded)\n\ngame.Players.LocalPlayer.CharacterAdded:Connect(function(newCharacter)\n    for _, descendant in pairs(newCharacter:GetDescendants()) do\n        onBodyVelocityAdded(descendant)\n    end\n    newCharacter.DescendantAdded:Connect(onBodyVelocityAdded)\nend)`;

  const fullCode = watermarkCode + creditsCode + movesCode + animReplaceCode + vfxCode;
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
