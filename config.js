const CONFIG = {
    ALIGNMENT_GOAL_TIME: 2.0,     
    FAILURE_LIMIT_TIME: 5.0,      
    ALIGNMENT_THRESHOLD: 0.45,    
    PERFECT_THRESHOLD: 0.10,      
    TARGET_BASE_SPEED: 0.4,       
    TARGET_SPEED_VARIANCE: 0.6,   
    LEVEL_DIFFICULTY_STEP: 0.25,  
    PLAYER_START_SPEED: 2.0,      
    PLAYER_MAX_SPEED: 6.0,        
    PLAYER_MIN_SPEED: 0.5,        
    PLAYER_SPEED_ACCEL: 2.0,      
    CENTER_X: 400,                
    CENTER_Y: 300,                
    SIDEBAR_START_X: 800,         
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
    FAILURE_DECREASE_PER_LEVEL: 0.2, // How many seconds the danger timer shrinks per level
    FAILURE_LIMIT_FLOOR: 1.5         // The absolute minimum time floor (in seconds) the game will shrink to
};

// Core Canvas references
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Shared State Variables
let level = 0;              
let gameOver = false;
let lastTime = performance.now();
let alignmentTime = 0;      
let misalignedTime = 0;     
let isTracking = false;           
let isPerfectTracking = false;      
let perfectStreakTimer = 0;   
let skipFeedbackTimer = 0;    

// Keyboard Tracking Checklist
const keys = {};
window.addEventListener("keydown", (e) => keys[e.key] = true);
window.addEventListener("keyup", (e) => keys[e.key] = false);

