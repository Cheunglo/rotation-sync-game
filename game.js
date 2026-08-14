// Spacebar listener to catch game over restarts
window.addEventListener("keydown", (e) => {
    if (gameOver && e.key === " ") {
        resetGame();
    }
});

function resetGame() {
    level = 0;
    gameOver = false;
    alignmentTime = 0;
    misalignedTime = 0;
    perfectStreakTimer = 0;
    skipFeedbackTimer = 0;
    isTracking = false;
    isPerfectTracking = false;
    player.angle = 0;
    player.speed = CONFIG.PLAYER_START_SPEED;
    target.angle = Math.PI; 
    target.currentSpeed = CONFIG.TARGET_BASE_SPEED;
    target.changeTimer = 0;
    lastTime = performance.now();
    gameLoop();
}

function gameLoop() {
    const currentTime = performance.now();
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    if (!gameOver) {
        update(deltaTime);
        render();
        requestAnimationFrame(gameLoop);
    } else {
        renderGameOver();
    }
}

function update(deltaTime) {
    target.update(deltaTime);
    const rotationDrift = player.update(deltaTime);

    if (skipFeedbackTimer > 0) {
        skipFeedbackTimer -= deltaTime;
    }

    // Parallax background star rotation loop mechanics
    for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        const cosAngle = Math.cos(-rotationDrift);
        const sinAngle = Math.sin(-rotationDrift);
        const rx = star.x * cosAngle - star.y * sinAngle;
        const ry = star.x * sinAngle + star.y * cosAngle;
        star.x = rx;
        star.y = ry;
    }

    // Measure angular distance differences 
    let angleDifference = Math.abs(player.angle - target.angle);
    if (angleDifference > Math.PI) {
        angleDifference = (Math.PI * 2) - angleDifference;
    }

    // Process synchronization timelines
    if (angleDifference <= CONFIG.ALIGNMENT_THRESHOLD) {
        isTracking = true;
        misalignedTime = 0; 

        if (angleDifference <= CONFIG.PERFECT_THRESHOLD) {
            isPerfectTracking = true;
            alignmentTime += deltaTime * 2.0; 
            perfectStreakTimer += deltaTime; 
        } else {
            isPerfectTracking = false;
            alignmentTime += deltaTime; 
            perfectStreakTimer = 0; 
        }

        if (alignmentTime >= CONFIG.ALIGNMENT_GOAL_TIME) {
            if (perfectStreakTimer >= (CONFIG.ALIGNMENT_GOAL_TIME / 2)) {
                level += 2; 
                skipFeedbackTimer = 1.2; 
            } else {
                level += 1; 
            }
            alignmentTime = 0; 
            perfectStreakTimer = 0;
        }
    } else {
        isTracking = false;
        isPerfectTracking = false;
        perfectStreakTimer = 0; 
        misalignedTime += deltaTime;
        alignmentTime = 0; 

        const dynamicFailureLimit = Math.max(
            CONFIG.FAILURE_LIMIT_FLOOR, 
            CONFIG.FAILURE_LIMIT_TIME - (level * CONFIG.FAILURE_DECREASE_PER_LEVEL)
        );

        if (misalignedTime >= dynamicFailureLimit) {
            gameOver = true;
        }
    }
}

// Ignition link launch command execution
gameLoop();

