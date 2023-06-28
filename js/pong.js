// Initialization Function
$(function() {
    // Key Definitions
    const LEFT = 37;
    const UP = 38;
    const RIGHT = 39;
    const DOWN = 40;

    // User Variables //

    // Points
    var userScore; // Stores the users game score

    // Input
    var directionalKeyPressed; // Stores a boolean for whether a directional key is pressed
    var directionalKey; // Stores the directional key that the user has last pressed

    // Color Specs
    var paddleColor; // String or hex for paddle color
    var ballColor; // String or hex for ball color

    // Grid size
    var segmentSize; // Number of pixels on canvas for length and width of game segments

    // Collision
    var collisionCoordinates; // Meant to store coordinates of collisions after running checkObjectCollision function

    var ballMovementDelayMinimum; // Minimum delay between ball movement

    // Intervals
    var paddleMovementInterval; // Runs paddle movement interval
    var ballMovementInterval; // Runs ball movement interval
    var canvasUpdateInterval; // Runs the canvas update interval

    var paddleMovementDelay; // This is the delay for paddle movement in milliseconds
    var ballMovementDelay; // This is the delay for ball movement in milliseconds
    var canvasUpdateDelay; // This is the smallest delay that controls the canvas updates for the game

    // Browser Memory
    const highScores = JSON.parse(localStorage.getItem("PONG_HIGH_SCORES")) ?? []; // Stores high scores from local browser storage

    // Canvas Variables
    var canvas = $("#canvas")[0];
    var ctx = canvas.getContext('2d');
    var locationPairs; // Represents valid grid locations on the canvas

    // Paddle Game Object
    var paddle;

    // Ball Game Object
    var ball;

    // Play Button Handler
    $("#playButton").on("click", function() {
        // Hide menu displays
        $("#selectionMenu").css("display", "none");
        $("#gameOverScreen").css("display", "none");
        $("#highScores").css("display", "none");

        initializeGameVariables();

        // Reset sub display
        $("#score").text(userScore);
        $("#game-text").css("display", "block");

        // Start game
        paddleMovementInterval = setInterval(paddleLoop, paddleMovementDelay);
        ballMovementInterval = setInterval(ballLoop, ballMovementDelay)

        canvasUpdateDelay = Math.min(paddleMovementDelay, ballMovementDelay);
        canvasUpdateInterval = setInterval(canvasLoop, canvasUpdateDelay);
    });

    // Key down handler
    $(document).on("keydown", function(e) {
        // If a directional key is not already pressed and the input is directional, this will set direction and enable paddle movement
        if (!directionalKeyPressed) {
            if ($.inArray(e.keyCode, [LEFT, RIGHT]) != -1) {
                directionalKey = e.keyCode;
                directionalKeyPressed = true;
            }
        }
    })

    // Key up handler
    $(document).on("keyup", function(e) {
        // If the released input is LEFT, or RIGHT, set boolean for key press to false 
        if ($.inArray(e.keyCode, [LEFT, RIGHT]) != -1) {
            directionalKeyPressed = false;
        }
    })

    // Function to initialize game variables
    function initializeGameVariables() {
        userScore = 0; 
        
        directionalKeyPressed = false;
        directionalKey = RIGHT;

        paddleColor = "maroon";
        ballColor = "white";

        segmentSize = 20;

        collisionCoordinates = [];

        ballMovementDelayMinimum = 50;

        paddleMovementDelay = 50;
        ballMovementDelay = 100;

        locationPairs = [];
        for(let i = 0; i < canvas.width; i+=segmentSize) {
            for(let j = 0; j < canvas.height; j+=segmentSize) {
                locationPairs.push({x:i,y:j});
            }
        }

        paddle = [];
        ball = [];

        paddle.push({x:400, y:580}, {x:400+segmentSize, y:580}, {x:400-segmentSize, y:580}); // Spawn paddle
        ball.push({x:400, y:200, state:"UP_RIGHT"}); // Spawn ball
    }

    // Paddle movement loop
    function paddleLoop() {
        if (directionalKeyPressed) {
            movePaddle();
        }
    }

    // Ball movement loop
    function ballLoop() {
        moveBall();
    }

    // Canvas reset loop (based on shortest game interval delay)
    function canvasLoop() {
        clearCanvas();

        // Draw game objects
        drawSquaresStroke(paddle, paddleColor,  "white", segmentSize); // Draw paddle
        drawSquaresStroke(ball, ballColor, "white", segmentSize); // Draw ball
    }

    // Function to clear the canvas screen
    function clearCanvas() {
        ctx.clearRect(0,0,canvas.width,canvas.height);
    }

    /* Function to draw squares with a stroke outline from an array 
    list: [{x:xVal, y:yVal},...]) 
    fillColor: "color" OR fillColor: "#000000" 
    strokeColor: "color" OR strokeColor: "#000000"
    size: val */
    function drawSquaresStroke(list, fillColor, strokeColor, size) {
        ctx.fillStyle = fillColor;
        ctx.strokeStyle = strokeColor;
        $.each(list, function(index, value) {
            ctx.fillRect(value.x, value.y, size, size);
            ctx.strokeRect(value.x, value.y, size, size);
        });
    }

    // Function to move the paddle
    function movePaddle() {
        // Check that there is not a boundary collision
        if(!checkListBoundaryCollision(paddle, directionalKey)) {
            moveObject(paddle, directionalKey);
        }
    }

    // Function to move the ball
    function moveBall() {
        updateBallState();

        switch(ball[0].state) {
            case "UP_LEFT":
                moveObject(ball, UP);
                moveObject(ball, LEFT);
                break;
            case "UP_RIGHT":
                moveObject(ball, UP);
                moveObject(ball, RIGHT);
                break;
            case "DOWN_LEFT":
                moveObject(ball, DOWN);
                moveObject(ball, LEFT);
                break;
            case "DOWN_RIGHT":
                moveObject(ball, DOWN);
                moveObject(ball, RIGHT);
                break;
        }

        if(ball[0].y > canvas.height) {
            gameOver();
        }
    }

    // Function to move a game object in direction provided
    function moveObject(obj, dir) {
        obj.forEach(elem => {
            moveElement(elem, dir);
        });
    }

    // Function to move one element in direction provided
    function moveElement(elem, dir) {
        switch(dir) {
            case UP:
                elem.y -= segmentSize;
                break;
            case DOWN:
                elem.y += segmentSize;
                break;
            case LEFT:
                elem.x -= segmentSize;
                break;
            case RIGHT:
                elem.x += segmentSize;
                break;
        }
    }

    // Function to update the state of the ball
    function updateBallState() {
        switch(ball[0].state) {
            case "UP_LEFT":
                if(ball[0].x == 0 && ball[0].y != 0) {
                    ball[0].state = "UP_RIGHT";
                }
                else if(ball[0].x == 0 && ball[0].y == 0) {
                    ball[0].state = "DOWN_RIGHT";
                }
                else if(ball[0].x != 0 && ball[0].y == 0) {
                    ball[0].state = "DOWN_LEFT";
                }
                break;
            case "UP_RIGHT":
                if(ball[0].x == canvas.width-segmentSize && ball[0].y != 0) {
                    ball[0].state = "UP_LEFT";
                }
                else if(ball[0].x == canvas.width-segmentSize && ball[0].y == 0) {
                    ball[0].state = "DOWN_LEFT";
                }
                else if(ball[0].x != canvas.width-segmentSize && ball[0].y == 0) {
                    ball[0].state = "DOWN_RIGHT";
                }
                break;
            case "DOWN_LEFT":
                if(ball[0].x == 0 && (ball[0].y < canvas.height-(2*segmentSize) || (ball[0].y == canvas.height-(2*segmentSize) && paddle[0].x > 2*segmentSize))) {
                    ball[0].state = "DOWN_RIGHT";
                }
                else if(ball[0].y == canvas.height-(2*segmentSize) && ((ball[0].x == paddle[0].x + (2*segmentSize)) || (ball[0].x == 0 && paddle[0].x < 3*segmentSize))) {
                    ball[0].state = "UP_RIGHT";
                    updateScore();
                }
                else if(ball[0].y == canvas.height-(2*segmentSize) && (ball[0].x - segmentSize == paddle[0].x || ball[0].x == paddle[0].x)) {
                    ball[0].state = "UP_LEFT";
                    updateScore();
                }
                break;
            case "DOWN_RIGHT":
                if (ball[0].x == canvas.width - segmentSize && (ball[0].y < canvas.height-(2*segmentSize) || (ball[0].y == canvas.height-(2*segmentSize) && paddle[0].x < canvas.width-(3*segmentSize)))) {
                    ball[0].state = "DOWN_LEFT";
                }
                else if (ball[0].y == canvas.height-(2*segmentSize) && ((ball[0].x + (2*segmentSize) == paddle[0].x) || (ball[0].x == canvas.width - segmentSize && paddleX > canvas.width-(4*segmentSize)))) {
                    ball[0].state = "UP_LEFT";
                    updateScore();
                }
                else if (ball[0].y == canvas.height-(2*segmentSize) && (ball[0].x + segmentSize == paddle[0].x || ball[0].x == paddle[0].x)) {
                    ball[0].state = "UP_RIGHT";
                    updateScore();
                }
                break;
        }
    }

    // Function that checks to see if any moving object in list has collided with the boundaries
    function checkListBoundaryCollision(list, dir) {
        var collision = false;

        list.forEach(element => {
            if(checkElementBoundaryCollision(element, dir)) {
                collision = true;
            }
        })

        return collision;
    }

    // Function to see if element has collided with boundary
    function checkElementBoundaryCollision(element, dir) {
        switch(dir) {
            case RIGHT:
                if(element.x + segmentSize >= canvas.width) {
                    return true;
                }
                break;
            case LEFT:
                if(element.x <= 0) {
                    return true;
                }
                break;
            case DOWN:
                if(element.y + segmentSize >= canvas.height) {
                    return true;
                }
                break;
            case UP:
                if(element.y <= 0) {
                    return true;
                }
                break;
        }
        return false;
    }

    // Function to increment score and ball speed
    function updateScore() {
        userScore++;
        $("#score").text(userScore);

        if(ballMovementDelay > ballMovementDelayMinimum) {
            ballMovementDelay--;
            clearInterval(ballMovementInterval);
            ballMovementInterval = setInterval(ballLoop, ballMovementDelay);
        }
    }

    // Function to compare user score with high scores
    function compareScores() {
        if(highScores.length < 5) {
            highScores.push(userScore);
            highScores.sort(function(a,b) {
                return b-a;
            })
        }
        else {
            for(var i = 0; i < 5; i++) {
                if(userScore > highScores[i] && highScores.length == 5) {
                    highScores.pop();
                    highScores.splice(i, 0, userScore);
                    break;
                }
            }
        }

        // Update high score values on screen
        $("#score1").html(highScores[0]);
        $("#score2").html(highScores[1]);
        $("#score3").html(highScores[2]);
        $("#score4").html(highScores[3]);
        $("#score5").html(highScores[4]);

        // Update browser memory
        localStorage.setItem("PONG_HIGH_SCORES", JSON.stringify(highScores));
    }

    // Function that runs when game is over
    function gameOver() {
        // End game
        clearInterval(paddleMovementInterval);
        clearInterval(ballMovementInterval);
        clearInterval(canvasUpdateInterval);

        compareScores();
        
        // Reset user score
        userScore = 0;

        // Show menu displays
        $("#selectionMenu").css("display", "block");
        $("#gameOverScreen").css("display", "block");
        $("#highScores").css("display", "block");
    }
})