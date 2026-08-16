const CONFIG = {
    ALIGNMENT_GOAL_TIME: 2.0,     
    FAILURE_LIMIT_TIME: 5.0,      
    ALIGNMENT_THRESHOLD: 0.90,    
    PERFECT_THRESHOLD: 0.30,      
    TARGET_BASE_SPEED: 0.4,       
    TARGET_SPEED_VARIANCE: 0.6,   
    LEVEL_DIFFICULTY_STEP: 0.25,  
    PLAYER_START_SPEED: 2.0,      
    PLAYER_MAX_SPEED: 6.0,        
    PLAYER_MIN_SPEED: 0.5,        
    PLAYER_SPEED_ACCEL: 2.0,      
    
    // Geometry dimensions
    RING_RADIUS: 100,             
    NOTCH_WIDTH: 20,              
    NOTCH_HEIGHT: 20,             
    NOTCH_OFFSET_Y: -110,         
    TARGET_POINTER_LENGTH: 60,    
    TARGET_POINTER_WIDTH: 25,     
    STAR_COUNT: 80,               
    GUIDE_LINE_COLOR: "#FFD700",  
    TARGET_COLOR: "#FF3333",      
    COLOR_MISALIGNED: "#FFA500",  
    COLOR_TRACKING: "#00FF00",    
    COLOR_PERFECT: "#00FFFF",

    // Difficulty modifiers
    FAILURE_DECREASE_PER_LEVEL: 0.2, 
    FAILURE_LIMIT_FLOOR: 1.5,   
    THRESHOLD_SHRINK_PER_LEVEL: 0.02, // Narrows the tracking windows per level (in radians)
    ALIGNMENT_THRESHOLD_FLOOR: 0.12,  // Minimum allowed width for the outer window (~7 deg)
    PERFECT_THRESHOLD_FLOOR: 0.03   // Minimum allowed width for the inner window (~1.7 deg)
};

// Core Canvas and global layout sizing variables
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Dynamic layout metrics altered by resize handler
let isMobile = false;
let center_x = 400;
let center_y = 300;
let sidebar_start_x = 800;

function resizeCanvas() {
    isMobile = window.innerWidth < 850;

    if (isMobile) {
        // Use clientHeight instead of innerHeight to avoid mobile browser navigation bar crop shifts
        canvas.width = window.innerWidth;
        canvas.height = document.documentElement.clientHeight;
        
        center_x = canvas.width / 2;
        center_y = canvas.height * 0.38; // Slightly raised to pull it away from the bottom text

        // Shrink the geometry dimensions slightly on mobile so it fits small displays
        CONFIG.RING_RADIUS = 80;             
        CONFIG.NOTCH_OFFSET_Y = -90;         
        CONFIG.TARGET_POINTER_LENGTH = 45;   
    } else {
        canvas.width = 1100;
        canvas.height = 600;
        center_x = 400;
        center_y = 300;
        
        // Restore standard desktop layout scaling dimensions
        CONFIG.RING_RADIUS = 100;             
        CONFIG.NOTCH_OFFSET_Y = -110;         
        CONFIG.TARGET_POINTER_LENGTH = 60;   
        sidebar_start_x = 800;
    }
}

// Run immediately on boot
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Shared State Trackers
let level = 0;              
let gameOver = false;
let lastTime = performance.now();
let alignmentTime = 0;      
let misalignedTime = 0;     
let isTracking = false;           
let isPerfectTracking = false;      
let perfectStreakTimer = 0;   
let skipFeedbackTimer = 0;    

// ==========================================
//          INPUT TRACKING ENGINE
// ==========================================
const keys = {};
window.addEventListener("keydown", (e) => keys[e.key] = true);
window.addEventListener("keyup", (e) => keys[e.key] = false);

// --- TOUCH ZONE INTERFACES FOR MOBILE ---
window.addEventListener("touchstart", (e) => {
    // If the game is over, tapping anywhere on a touch device resets it
    if (gameOver) {
        resetGame();
        return;
    }

    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;

    // Mobile layout divides input actions across screen quadrants
    if (isMobile) {
        if (touchY > window.innerHeight * 0.75) {
            // Tapping the absolute bottom quadrant triggers speed acceleration boost cycling
            player.speed = player.speed >= CONFIG.PLAYER_MAX_SPEED ? CONFIG.PLAYER_MIN_SPEED : player.speed + 1.5;
        } else {
            // Otherwise left half turns left, right half turns right
            if (touchX < window.innerWidth / 2) {
                keys["ArrowLeft"] = true;
            } else {
                keys["ArrowRight"] = true;
            }
        }
    }
});

window.addEventListener("touchend", () => {
    keys["ArrowLeft"] = false;
    keys["ArrowRight"] = false;
});

