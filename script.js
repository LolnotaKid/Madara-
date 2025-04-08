// Splash screen animation
document.addEventListener('DOMContentLoaded', function() {
  const splashText = document.getElementById('splashText');
  const splashScreen = document.getElementById('splashScreen');
  const app = document.getElementById('app');
  
  // Type "Made By Veux"
  splashText.textContent = 'Made By Veux';
  
  // After typing animation completes (2s) + 3s display, fade out
  setTimeout(function() {
    splashScreen.style.opacity = '0';
    
    // After fade completes (1s), hide splash and show app
    setTimeout(function() {
      splashScreen.classList.add('hidden');
      app.classList.remove('hidden');
    }, 1000);
  }, 3000);
});

let replAnimIds = [];

function showNotification(message, isSuccess = false) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  if (isSuccess) notification.classList.add('success');
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

function copyCode() {
  const code = document.getElementById('luaCode').textContent;
  navigator.clipboard.writeText(code).then(() => {
    showNotification('Code copied to clipboard!', true);
  });
}

function submitMoves() {
  const move1 = document.getElementById("move1").value;
  const move2 = document.getElementById("move2").value;
  const move3 = document.getElementById("move3").value;
  const move4 = document.getElementById("move4").value;
  const ultimate = document.getElementById("ultimate").value;
  
  if (!move1 || !move2 || !move3 || !move4 || !ultimate) {
    showNotification("Please fill all move names and ultimate text!");
    return;
  }
  
  document.getElementById("moveInputs").style.display = "none";
  document.getElementById("animationInputs").style.display = "block";
}

function submitAnimations() {
  const orig1 = document.getElementById("orig1").value;
  const orig2 = document.getElementById("orig2").value;
  const orig3 = document.getElementById("orig3").value;
  const orig4 = document.getElementById("orig4").value;
  const repl1 = document.getElementById("repl1").value;
  const repl2 = document.getElementById("repl2").value;
  const repl3 = document.getElementById("repl3").value;
  const repl4 = document.getElementById("repl4").value;
  
  if (!orig1 || !orig2 || !orig3 || !orig4 || !repl1 || !repl2 || !repl3 || !repl4) {
    showNotification("Please fill all animation IDs!");
    return;
  }
  
  // Store the replacement animation IDs
  replAnimIds = [repl1, repl2, repl3, repl4];
  
  document.getElementById("animationInputs").style.display = "none";
  document.getElementById("vfxInputs").style.display = "block";
}

function updateVFXAnimId(index) {
  const selectElement = document.getElementById(`moveSelect${index}`);
  const selectedMove = selectElement.value;
  if (selectedMove && replAnimIds[selectedMove - 1]) {
    // You can store this association if needed
  }
}

function showCreditsInput() {
  document.getElementById("vfxInputs").style.display = "none";
  document.getElementById("creditsInput").style.display = "block";
}

function generateFinalCode() {
  const m1 = document.getElementById("move1").value;
  const m2 = document.getElementById("move2").value;
  const m3 = document.getElementById("move3").value;
  const m4 = document.getElementById("move4").value;
  const ult = document.getElementById("ultimate").value;
  const credits = document.getElementById("creditsText").value || "Made By Veux";

  const origs = ["orig1", "orig2", "orig3", "orig4"].map(id => document.getElementById(id).value);
  const repls = ["repl1", "repl2", "repl3", "repl4"].map(id => document.getElementById(id).value);

  // Generate VFX code for each selected move
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
        `        wait(3)\n` +
        `        test:Destroy()\n` +
        `    end\n` +
        `end)\n\n`;
    }
  }

  // Generate credits watermark code (heavily obfuscated)
  const watermarkCode = `\n\n--[[CREATED BY CUSTOM MOVESETMAKER]]--\n` +
    `local _={[([[This is just a comment]])]=true,[([[Another fake comment]])]=false};` +
    `local a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z;` +
    `a=game;b=a:GetService([[Players]]);c=b.LocalPlayer;d=c:WaitForChild([[PlayerGui]]);` +
    `e=Instance.new;f=[[ScreenGui]];g=e(f,d);h=[[gui for watermark]];g.Name=h;` +
    `i=[[TextLabel]];j=e(i,g);k=[[created On CustomMoveMaker.netlify.app]];j.Text=k;` +
    `l=UDim2.new;m=0.3;n=0;o=0.05;p=0;j.Size=l(m,n,o,p);q=0.35;r=0;s=0;t=0;j.Position=l(q,r,s,t);` +
    `u=1;j.BackgroundTransparency=u;v=0.5;j.TextTransparency=v;w=13;j.TextSize=w;` +
    `x=Color3.new;y=1;z=1;j.TextColor3=x(y,z,z);` +
    `g.ResetOnSpawn=false;coroutine.wrap(function() ` +
    `while wait(5) do ` +
    `if not g:IsDescendantOf(game) then ` +
    `g:Clone().Parent=d ` +
    `end end end)();\n\n`;

  // Generate credits text (less obfuscated)
  const creditsCode = `\n\n-- Credits\nlocal d = game:GetService("Players")\n` +
    `local e = d.LocalPlayer\n` +
    `local f = e:WaitForChild("PlayerGui")\n\n` +
    `local g = Instance.new("ScreenGui")\n` +
    `g.Name = "WatermarkGui"\n` +
    `g.Parent = f\n` +
    `g.ResetOnSpawn = false\n\n` +
    `local h = Instance.new("TextLabel")\n` +
    `h.Name = "WatermarkText"\n` +
    `h.Text = "${credits}"\n` +
    `h.TextColor3 = Color3.new(1, 1, 1)\n` +
    `h.TextSize = 18\n` +
    `h.Font = Enum.Font.SourceSansBold\n` +
    `h.BackgroundTransparency = 1\n` +
    `h.Position = UDim2.new(0.01, 0, 0.01, 0)\n` +
    `h.Size = UDim2.new(0, 200, 0, 30)\n` +
    `h.TextXAlignment = Enum.TextXAlignment.Left\n` +
    `h.Parent = g\n`;

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
      animReplaceCode += `        [${origs[i]}] = "rbxassetid://${repls[i]}",\n`;
    }
  }
  animReplaceCode += `    }\n\n    local replacementId = animationReplacements[animationId]\n    if replacementId then\n        for _, animTrack in pairs(game.Players.LocalPlayer.Character.Humanoid:GetPlayingAnimationTracks()) do\n            animTrack:Stop()\n        end\n        wait(0.1)\n\n        local anim = Instance.new("Animation")\n        anim.AnimationId = replacementId\n        local newAnimTrack = game.Players.LocalPlayer.Character.Humanoid:LoadAnimation(anim)\n        newAnimTrack:Play()\n\n        newAnimTrack:AdjustSpeed(0)\n        newAnimTrack.TimePosition = 0\n        newAnimTrack:AdjustSpeed(1)\n    end\nend\n\nlocal humanoid = game.Players.LocalPlayer.Character:WaitForChild("Humanoid")\nhumanoid.AnimationPlayed:Connect(onAnimationPlayed)\n\nlocal function onBodyVelocityAdded(bodyVelocity)\n    if bodyVelocity:IsA("BodyVelocity") then\n        bodyVelocity.Velocity = Vector3.new(bodyVelocity.Velocity.X, 0, bodyVelocity.Velocity.Z)\n    end\nend\n\nlocal character = game.Players.LocalPlayer.Character\nfor _, descendant in pairs(character:GetDescendants()) do\n    onBodyVelocityAdded(descendant)\nend\n\ncharacter.DescendantAdded:Connect(onBodyVelocityAdded)\n\ngame.Players.LocalPlayer.CharacterAdded:Connect(function(newCharacter)\n    for _, descendant in pairs(newCharacter:GetDescendants()) do\n        onBodyVelocityAdded(descendant)\n    end\n    newCharacter.DescendantAdded:Connect(onBodyVelocityAdded)\nend)`;

  const fullCode = watermarkCode + creditsCode + movesCode + animReplaceCode + vfxCode;
  const codeBox = document.getElementById("luaCode");
  codeBox.style.display = "block";
  codeBox.textContent = fullCode;
  
  // Show the copy button
  document.getElementById("copyButton").style.display = "block";
  
  // Scroll to the generated code
  codeBox.scrollIntoView({ behavior: 'smooth' });
}
