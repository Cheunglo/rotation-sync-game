function renderSidebar() {
    const startX = CONFIG.SIDEBAR_START_X;
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

    // Calculate what the active failure duration limit is right now for this level
    const currentActiveLimit = Math.max(
        CONFIG.FAILURE_LIMIT_FLOOR, 
        CONFIG.FAILURE_LIMIT_TIME - (level * CONFIG.FAILURE_DECREASE_PER_LEVEL)
    );

    ctx.fillStyle = "#FF3333";
    ctx.font = "bold 13px Arial";
    ctx.fillText(`CRITICAL ALERT: Losing sync`, startX + 25, 440);
    
    // Displays the current level's precise threshold (e.g. "for 4.2s results in game over")
    ctx.fillText(`for ${currentActiveLimit.toFixed(1)}s results in game over.`, startX + 25, 460);
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawStars();

    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath(); 
    ctx.arc(CONFIG.CENTER_X, CONFIG.CENTER_Y, 5, 0, Math.PI * 2); 
    ctx.fill();

    target.draw();
    player.draw();

    // ==========================================
    //    NEW SYSTEM: ANIMATED PROGRESS BAR ARC
    // ==========================================
    if (alignmentTime > 0) {
        ctx.save();
        ctx.translate(CONFIG.CENTER_X, CONFIG.CENTER_Y);
        
        // Calculate the percentage of the level completed (0.0 to 1.0)
        const progressPercent = Math.min(1.0, alignmentTime / CONFIG.ALIGNMENT_GOAL_TIME);
        
        // Convert that percentage into a circular radian angle (up to 360 degrees)
        const progressAngle = progressPercent * (Math.PI * 2);
        
        // Match the color to your tracking intensity
        ctx.strokeStyle = isPerfectTracking ? CONFIG.COLOR_PERFECT : CONFIG.COLOR_TRACKING;
        ctx.lineWidth = 8; // Double the thickness of the base player ring
        ctx.setLineDash([]); // Ensure it is a solid line
        
        ctx.beginPath();
        // ctx.arc parameters: (centerX, centerY, radius, startAngle, endAngle)
        // We start at -Math.PI/2 to make the progress bar fill from the 12 o'clock position
        ctx.arc(0, 0, CONFIG.RING_RADIUS, -Math.PI / 2, (-Math.PI / 2) + progressAngle);
        ctx.stroke();
        
        ctx.restore();
    }

    // ==========================================
    //            TEXT DASHBOARD LAYER
    // ==========================================
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "20px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Score (Level): " + level, 20, 30);
    
    if (isPerfectTracking) {
        ctx.fillStyle = CONFIG.COLOR_PERFECT;
        ctx.fillText("Alignment Streak: " + alignmentTime.toFixed(1) + "s / " + CONFIG.ALIGNMENT_GOAL_TIME + "s (CHARGING X2)", 20, 60);
    } else {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText("Alignment Streak: " + alignmentTime.toFixed(1) + "s / " + CONFIG.ALIGNMENT_GOAL_TIME + "s", 20, 60);
    }
    
    if (skipFeedbackTimer > 0) {
        ctx.save();
        ctx.fillStyle = `rgba(0, 255, 255, ${skipFeedbackTimer})`; 
        ctx.font = "bold 30px Arial";
        ctx.textAlign = "center";
        ctx.fillText("LEVEL SKIP! +2", CONFIG.CENTER_X, CONFIG.CENTER_Y - 140);
        ctx.restore();
    }
    
    const dynamicFailureLimit = Math.max(
        CONFIG.FAILURE_LIMIT_FLOOR, 
        CONFIG.FAILURE_LIMIT_TIME - (level * CONFIG.FAILURE_DECREASE_PER_LEVEL)
    );

    if (misalignedTime > (dynamicFailureLimit * 0.6)) {
        ctx.fillStyle = "#FF3333"; 
    } else {
        ctx.fillStyle = "#FFFFFF"; 
    }
    
    const dangerTimeRemaining = Math.ceil(dynamicFailureLimit - misalignedTime);
    ctx.fillText("Danger Timer: " + dangerTimeRemaining + "s", CONFIG.SIDEBAR_START_X - 160, 30);
    
    ctx.fillStyle = "#888888";
    ctx.font = "14px Arial";
    ctx.fillText("Your Turn Speed: " + player.speed.toFixed(1), 20, canvas.height - 20);

    renderSidebar();
}

function renderGameOver() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    ctx.fillRect(0, 0, CONFIG.SIDEBAR_START_X, canvas.height);

    ctx.fillStyle = "#FF3333";
    ctx.font = "50px Arial";
    ctx.textAlign = "center";
    ctx.fillText("SYNC LOST", CONFIG.CENTER_X, CONFIG.CENTER_Y - 40);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "24px Arial";
    ctx.fillText("Succeeded Levels: " + level, CONFIG.CENTER_X, CONFIG.CENTER_Y + 10);
    
    ctx.fillStyle = CONFIG.GUIDE_LINE_COLOR;
    ctx.font = "20px Arial";
    ctx.fillText("Press SPACEBAR to Retry", CONFIG.CENTER_X, CONFIG.CENTER_Y + 60);

    renderSidebar();
}

