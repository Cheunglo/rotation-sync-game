function renderSidebar() {
    // --- MODE A: DESKTOP LANDSCAPE PANEL SIDEBAR ---
    if (!isMobile) {
        const startX = sidebar_start_x;
        ctx.fillStyle = "#1c1c24";
        ctx.fillRect(startX, 0, canvas.width - startX, canvas.height);
        
        ctx.strokeStyle = "#333344";
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(startX, 0); ctx.lineTo(startX, canvas.height); ctx.stroke();

        ctx.textAlign = "left";
        ctx.fillStyle = CONFIG.COLOR_PERFECT;
        ctx.font = "bold 20px Arial";
        ctx.fillText("SYNC PANEL", startX + 25, 45);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 14px Arial";
        ctx.fillText("OBJECTIVE:", startX + 25, 95);
        ctx.fillStyle = "#AAAAAA";
        ctx.font = "13px Arial";
        ctx.fillText("Match your turning ring notch", startX + 25, 120);
        ctx.fillText("with the central spinning Red arrow.", startX + 25, 140);
        ctx.fillText(`Hold sync for ${CONFIG.ALIGNMENT_GOAL_TIME}s to level up.`, startX + 25, 160);

        ctx.fillStyle = CONFIG.COLOR_PERFECT;
        ctx.fillText("★ Lock center inside the cyan", startX + 25, 195);
        ctx.fillText("   zone to SKIP levels entirely!", startX + 25, 215);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 14px Arial";
        ctx.fillText("CONTROLS:", startX + 25, 275);
        ctx.fillStyle = "#AAAAAA";
        ctx.font = "13px Arial";
        ctx.fillText("← / →  or  A / D", startX + 25, 300);
        ctx.fillStyle = "#888888";
        ctx.fillText("Rotate tracking ring outline", startX + 45, 320);
        
        ctx.fillStyle = "#AAAAAA";
        ctx.fillText("↑ / ↓  or  W / S", startX + 25, 355);
        ctx.fillStyle = "#888888";
        ctx.fillText("Increase / decrease rotation speed", startX + 45, 375);

        const currentActiveLimit = Math.max(CONFIG.FAILURE_LIMIT_FLOOR, CONFIG.FAILURE_LIMIT_TIME - (level * CONFIG.FAILURE_DECREASE_PER_LEVEL));
        ctx.fillStyle = "#FF3333";
        ctx.font = "bold 13px Arial";
        ctx.fillText(`CRITICAL ALERT: Losing sync`, startX + 25, 440);
        ctx.fillText(`for ${currentActiveLimit.toFixed(1)}s results in game over.`, startX + 25, 460);
    } 
    // --- MODE B: MOBILE RESPONSIVE FOOTER STACK ---
    else {
        const textY = canvas.height * 0.70;
        ctx.textAlign = "center";
        ctx.fillStyle = "#888888";
        ctx.font = "13px Arial";
        ctx.fillText("Tap Left / Right half of screen to Turn", canvas.width / 2, textY);
        ctx.fillText("Tap lower bottom panel strip to Cycle Speed", canvas.width / 2, textY + 22);
        
        // Draw a light touch delimiter button guide box at base
        ctx.strokeStyle = "#222233";
        ctx.strokeRect(10, canvas.height - 55, canvas.width - 20, 35);
        ctx.fillStyle = "#333344";
        ctx.font = "bold 12px Arial";
        ctx.fillText("TOUCH HERE TO CYCLE SPEED", canvas.width / 2, canvas.height - 33);
    }
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawStars();

    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath(); ctx.arc(center_x, center_y, 5, 0, Math.PI * 2); ctx.fill();

    target.draw();
    player.draw();

    // Progress Bar Ring
    if (alignmentTime > 0) {
        ctx.save();
        ctx.translate(center_x, center_y);
        const progressPercent = Math.min(1.0, alignmentTime / CONFIG.ALIGNMENT_GOAL_TIME);
        const progressAngle = progressPercent * (Math.PI * 2);
        ctx.strokeStyle = isPerfectTracking ? CONFIG.COLOR_PERFECT : CONFIG.COLOR_TRACKING;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(0, 0, CONFIG.RING_RADIUS, -Math.PI / 2, (-Math.PI / 2) + progressAngle);
        ctx.stroke();
        ctx.restore();
    }

    // Standard HUD Overlays
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "18px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Score: " + level, 20, 35);
    
    if (isPerfectTracking) {
        ctx.fillStyle = CONFIG.COLOR_PERFECT;
        ctx.fillText("Streak: " + alignmentTime.toFixed(1) + "s (X2 BONUS!)", 20, 65);
    } else {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText("Streak: " + alignmentTime.toFixed(1) + "s", 20, 65);
    }
    
    if (skipFeedbackTimer > 0) {
        ctx.save();
        ctx.fillStyle = `rgba(0, 255, 255, ${skipFeedbackTimer})`; 
        ctx.font = "bold 25px Arial";
        ctx.textAlign = "center";
        ctx.fillText("LEVEL SKIP! +2", center_x, center_y - 140);
        ctx.restore();
    }
    
    const dynamicFailureLimit = Math.max(CONFIG.FAILURE_LIMIT_FLOOR, CONFIG.FAILURE_LIMIT_TIME - (level * CONFIG.FAILURE_DECREASE_PER_LEVEL));
    ctx.fillStyle = misalignedTime > (dynamicFailureLimit * 0.6) ? "#FF3333" : "#FFFFFF";
    ctx.textAlign = "right";
    ctx.fillText("Danger: " + Math.ceil(dynamicFailureLimit - misalignedTime) + "s", (isMobile ? canvas.width - 20 : sidebar_start_x - 20), 35);
    
    ctx.fillStyle = "#666666";
    ctx.font = "12px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Speed: " + player.speed.toFixed(1), 20, isMobile ? canvas.height - 60 : canvas.height - 20);

    renderSidebar();
}

function renderGameOver() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    ctx.fillRect(0, 0, isMobile ? canvas.width : sidebar_start_x, canvas.height);

    ctx.fillStyle = "#FF3333";
    ctx.font = "40px Arial";
    ctx.textAlign = "center";
    ctx.fillText("SYNC LOST", center_x, center_y - 40);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "20px Arial";
    ctx.fillText("Succeeded Levels: " + level, center_x, center_y + 10);
    
    ctx.fillStyle = CONFIG.GUIDE_LINE_COLOR;
    ctx.font = "16px Arial";
    ctx.fillText(isMobile ? "Tap Screen to Try Again" : "Press SPACEBAR to Retry", center_x, center_y + 60);

    renderSidebar();
}

