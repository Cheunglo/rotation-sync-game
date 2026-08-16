const target = {
    angle: 0,
    currentSpeed: CONFIG.TARGET_BASE_SPEED,      
    direction: 1,           
    changeTimer: 0,         
    
    update: function(deltaTime) {
        this.angle += this.currentSpeed * this.direction * deltaTime;
        this.angle = (this.angle + Math.PI * 2) % (Math.PI * 2);

        this.changeTimer -= deltaTime;
        if (this.changeTimer <= 0) {
            this.direction = Math.random() > 0.5 ? 1 : -1;
            const difficultyMultiplier = 1 + (level * CONFIG.LEVEL_DIFFICULTY_STEP); 
            this.currentSpeed = (CONFIG.TARGET_BASE_SPEED + Math.random() * CONFIG.TARGET_SPEED_VARIANCE) * difficultyMultiplier;
            this.changeTimer = 1 + Math.random() * 2; 
        }
    },

    draw: function() {
        ctx.save();
        ctx.translate(center_x, center_y); // Dynamic position
        ctx.rotate(this.angle);
        ctx.fillStyle = CONFIG.TARGET_COLOR; 
        ctx.beginPath();
        ctx.moveTo(0, -CONFIG.TARGET_POINTER_LENGTH);  
        ctx.lineTo(CONFIG.TARGET_POINTER_WIDTH, CONFIG.TARGET_POINTER_WIDTH * 1.6);  
        ctx.lineTo(-CONFIG.TARGET_POINTER_WIDTH, CONFIG.TARGET_POINTER_WIDTH * 1.6); 
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
};

const player = {
    angle: 0,
    speed: CONFIG.PLAYER_START_SPEED,             
    
    update: function(deltaTime) {
        let rotationChange = 0;
        if (keys["ArrowLeft"] || keys["a"]) rotationChange -= this.speed * deltaTime;
        if (keys["ArrowRight"] || keys["d"]) rotationChange += this.speed * deltaTime;

        this.angle += rotationChange;

        if (keys["ArrowUp"] || keys["w"]) this.speed = Math.min(CONFIG.PLAYER_MAX_SPEED, this.speed + CONFIG.PLAYER_SPEED_ACCEL * deltaTime); 
        if (keys["ArrowDown"] || keys["s"]) this.speed = Math.max(CONFIG.PLAYER_MIN_SPEED, this.speed - CONFIG.PLAYER_SPEED_ACCEL * deltaTime); 

        this.angle = (this.angle + Math.PI * 2) % (Math.PI * 2);
        return rotationChange; 
    },
    // --- REPLACE THE PLAYER.DRAW FUNCTION IN ENTITIES.JS ---
    draw: function() {
        let playerColor = CONFIG.COLOR_MISALIGNED; 
        if (isTracking) playerColor = CONFIG.COLOR_TRACKING;
        if (isPerfectTracking) playerColor = CONFIG.COLOR_PERFECT; 

        // Calculate dynamic matching windows for visual rendering sync
        const currentAlignmentThreshold = Math.max(
            CONFIG.ALIGNMENT_THRESHOLD_FLOOR,
            CONFIG.ALIGNMENT_THRESHOLD - (level * CONFIG.THRESHOLD_SHRINK_PER_LEVEL)
        );
        const currentPerfectThreshold = Math.max(
            CONFIG.PERFECT_THRESHOLD_FLOOR,
            CONFIG.PERFECT_THRESHOLD - (level * (CONFIG.THRESHOLD_SHRINK_PER_LEVEL * 0.2))
        );

        const extensionDistance = CONFIG.RING_RADIUS + 10;

        // 1. DRAW TRANSLUCENT SHADING FIELDS (Yellow and Blue Wedges)
        ctx.save();
        ctx.translate(center_x, center_y);
        ctx.rotate(this.angle);

        // Yellow Shading for the Outer Alignment Window
        ctx.fillStyle = "rgba(255, 215, 0, 0.08)"; // Ultra translucent gold/yellow
        ctx.beginPath();
        ctx.moveTo(0, 0);
        // HTML5 canvas angles: -Math.PI/2 shifts zero up. We draw from left boundary to right boundary
        ctx.arc(0, 0, CONFIG.RING_RADIUS, -Math.PI / 2 - currentAlignmentThreshold, -Math.PI / 2 + currentAlignmentThreshold);
        ctx.closePath();
        ctx.fill();

        // Blue Shading for the Inner Perfect Window
        ctx.fillStyle = "rgba(0, 255, 255, 0.12)"; // Translucent cyan/blue
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, CONFIG.RING_RADIUS, -Math.PI / 2 - currentPerfectThreshold, -Math.PI / 2 + currentPerfectThreshold);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // 2. DRAW GOLD/YELLOW DOTTED OUTER BOUNDARIES
        ctx.save();
        ctx.translate(center_x, center_y);
        ctx.rotate(this.angle);
        ctx.strokeStyle = CONFIG.GUIDE_LINE_COLOR; 
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 6]); 

        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(-currentAlignmentThreshold) * extensionDistance, -Math.cos(-currentAlignmentThreshold) * extensionDistance); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(currentAlignmentThreshold) * extensionDistance, -Math.cos(currentAlignmentThreshold) * extensionDistance); ctx.stroke();
        ctx.restore();

        // 3. DRAW BLUE DOTTED PERFECT WINDOW BOUNDARIES
        ctx.save();
        ctx.translate(center_x, center_y);
        ctx.rotate(this.angle);
        ctx.strokeStyle = CONFIG.COLOR_PERFECT; // Cyan/Blue
        ctx.lineWidth = 1.5;
        ctx.setLineDash([2, 4]); // Tighter dot frequency pattern

        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(-currentPerfectThreshold) * extensionDistance, -Math.cos(-currentPerfectThreshold) * extensionDistance); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(currentPerfectThreshold) * extensionDistance, -Math.cos(currentPerfectThreshold) * extensionDistance); ctx.stroke();
        ctx.restore();

        // 4. DRAW STANDARD SOLID MAIN PLAYER TRACKING RING
        ctx.save();
        ctx.translate(center_x, center_y);
        ctx.rotate(this.angle);
        ctx.strokeStyle = playerColor; 
        ctx.lineWidth = 4;
        ctx.setLineDash([]); 
        ctx.beginPath();
        ctx.arc(0, 0, CONFIG.RING_RADIUS, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = playerColor;
        ctx.fillRect(-CONFIG.NOTCH_WIDTH / 2, CONFIG.NOTCH_OFFSET_Y, CONFIG.NOTCH_WIDTH, CONFIG.NOTCH_HEIGHT);
        ctx.restore();
    }
};

const stars = [];
for (let i = 0; i < CONFIG.STAR_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.sqrt(Math.random()) * 400; // General circular cluster
    stars.push({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.3
    });
}

function drawStars() {
    ctx.save();
    ctx.translate(center_x, center_y);
    for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.fillRect(star.x, star.y, star.size, star.size);
    }
    ctx.restore();
}

