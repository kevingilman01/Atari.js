// Initialization Function
$(function() {
    // Key Definitions
    const LEFT = 37;
    const UP = 38;
    const RIGHT = 39;
    const DOWN = 40;

    // User Variables
    var game;
    var userScore; // Stores the game score
    var userInput; // Stores the last user input up until snake movement update
    var tempInput; // Temporarily stores user input until the snake is moved
    var gameInterval; // This is the game framerate interval
    var frameDelay; // Number of points needed to drop framerate (up to certain threshold)
    var gameIntervalThreshold; // This is the max value for the game interval to drop
    var frameDrop; // This is how much the game interval drops when frame delay score is reached
    var obstacleDelay; // Number of points needed to spawn an obstacle
    var snakeColor; // String or hex for snake color
    var foodColor; // String or hex for food color
    var obstacleColor; // String or hex for obstacle color
    var segmentSize; // number of pixels on canvas for length and width of game segments

    // Browser Memory
    const highScores = JSON.parse(localStorage.getItem("SNAKE_HIGH_SCORES")) ?? [];

    // Canvas Variables
    var canvas = $("#canvas")[0];
    var ctx = canvas.getContext('2d');
    var locationPairs;


    // Snake Game Object
    var snake = {
        body: []
    };

    // Food Game Object
    var food = [];

    // Obstacle Game Object
    var obstacles = [];

    // Play Button Handler
    $("#playButton").on("click", function() {
        // Hide menu displays
        $("#selectionMenu").css("display", "none");
        $("#gameOverScreen").css("display", "none");
        $("#highScores").css("display", "none");

        // Set variables
        userScore = 0;
        userInput = DOWN;
        tempInput = DOWN;
        gameInterval = 100;
        frameDelay = 5;
        gameIntervalThreshold = 40;
        frameDrop = 5;
        obstacleDelay = 3;
        snakeColor = "green";
        foodColor = "red";
        obstacleColor = "brown";
        segmentSize = 20;
        locationPairs = [];
        for(let i = 0; i < canvas.width; i+=segmentSize) {
            for(let j = 0; j < canvas.height; j+=segmentSize) {
                locationPairs.push({x:i,y:j});
            }
        }
        snake.body = [];
        snake.body.push({x:500, y:100},{x:500, y:100-segmentSize}, {x:500, y:100-(2*segmentSize)});
        food = [];
        addCoordinatePair(food);
        obstacles = [];
        addCoordinatePair(obstacles);

        // Reset score display
        $("#score").text(userScore);
        $("#game-text").css("display", "block");

        // Start game
        game = setInterval(gameLoop, gameInterval);
    });

    // Main game loop
    function gameLoop() {
        clearCanvas();
        drawSquares(food, foodColor, segmentSize); // Draw food
        drawSquaresStroke(obstacles, obstacleColor, "white", segmentSize); // Draw obstacles
        drawSquaresStroke(snake.body, snakeColor, "white", segmentSize); // Draw snake
        moveSnake();
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

    /* Function to draw squares from an array 
    list: [{x:xVal, y:yVal},...]) 
    fillColor: "color" OR fillColor: "#000000" 
    size: val */
    function drawSquares(list, fillColor, size) {
        ctx.fillStyle = fillColor;
        $.each(list, function(index, value) {
            ctx.fillRect(value.x, value.y, size, size);
        });
    }

    // Function to randomly generate a valid pair of unused coordinates and add it to an array of game objects
    function addCoordinatePair(list) {
        var filteredLocationPairs = [...locationPairs]; // Cloned location pairs array

        // Filter out snake segment locations
        snake.body.forEach(segment =>  {
            filteredLocationPairs = filteredLocationPairs.filter(pair => (pair.x !== segment.x) || (pair.y !== segment.y));
        });

        // Filter out obstacle locations
        obstacles.forEach(segment =>  {
            filteredLocationPairs = filteredLocationPairs.filter(pair => (pair.x !== segment.x) || (pair.y !== segment.y));
        });

        // Filter out food locations
        food.forEach(segment =>  {
            filteredLocationPairs = filteredLocationPairs.filter(pair => (pair.x !== segment.x) || (pair.y !== segment.y));
        });

        // Randomly generate list index
        var locationIndex = Math.floor(Math.random() * filteredLocationPairs.length);

        // Add coordinate pair to array
        list.push({x:filteredLocationPairs[locationIndex].x, y:filteredLocationPairs[locationIndex].y});
    }

    // Function to move the body segments of the snake
    function moveSnake() {
        // Temporary storage of tail location
        var tempX = snake.body[snake.body.length-1].x;
        var tempY = snake.body[snake.body.length-1].y;

        // Set userInput with final output from tempInput before movement executes
        userInput = tempInput;

        // Move back parts of snake
        for(var i = snake.body.length - 1; i > 0; i--) {
            snake.body[i].x = snake.body[i-1].x;
            snake.body[i].y = snake.body[i-1].y;
        }

        // Check for deadly collisions (move head during boundary collision check)
        if (checkBoundaryCollision() || checkObjectCollision(obstacles) || checkObjectCollision(snake.body.slice(1))) {
            gameOver();
        }

        // Check for food collision
        if(checkObjectCollision(food)) {
            // Update score
            userScore++;
            $("#score").text(userScore);

            // Add segment to tail
            snake.body.push({x:tempX, y:tempY});

            // New spawns
            if(userScore % obstacleDelay == 0) {
                addCoordinatePair(obstacles);
            }
            food.pop();
            addCoordinatePair(food);

            // Check for frame delay update
            if (gameInterval > gameIntervalThreshold) {
                if(userScore % frameDelay == 0) {
                    clearInterval(game);
                    gameInterval = Math.max(gameInterval - frameDrop, gameIntervalThreshold);
                    game = setInterval(gameLoop, gameInterval);
                }
            }
        }
    }

    // Function to check snake head collisions with objects in provided array
    function checkObjectCollision(list) {
        var collision = false;

        list.forEach(segment =>  {
            if(snake.body[0].x == segment.x && snake.body[0].y == segment.y) {
                collision = true;
            }
        });

        return collision;
    }

    // Function that checks if snake has collided with boundaries
    function checkBoundaryCollision() {
        var collision = false;

        // Check canvas boundary collisions
        switch(userInput) {
            case DOWN:
                if(snake.body[0].y + segmentSize < canvas.height) {
                    snake.body[0].y += segmentSize;
                }
                else {
                    collision = true;
                }
                break;
            case UP:
                if(snake.body[0].y > 0) {
                    snake.body[0].y -= segmentSize;
                }
                else {
                    collision = true;
                }
                break;
            case RIGHT:
                if(snake.body[0].x + segmentSize < canvas.width) {
                    snake.body[0].x += segmentSize;
                }
                else {
                    collision = true;
                }
                break;
            case LEFT:
                if(snake.body[0].x > 0) {
                    snake.body[0].x -= segmentSize;
                }
                else {
                    collision = true;
                }
                break;
        }
        
        return collision;
    }

    // Function that runs when key is pressed
    $(document).on("keydown", function(e) {
        // If the input is DOWN, UP, LEFT, or RIGHT check if the input is allowed based on current movement
        if ($.inArray(e.keyCode, [DOWN, UP, LEFT, RIGHT]) != -1) {
            tempInput = keyAllowed(e.keyCode);
        }
    })

    // Function that checks if the user input can change or not
    function keyAllowed(tempKey) {
        let key;
        if(tempKey == DOWN) {
            key = (userInput != UP) ? tempKey : userInput;
        }
        else if(tempKey == UP) {
            key = (userInput != DOWN) ? tempKey : userInput;
        }
        else if(tempKey == RIGHT) {
            key = (userInput != LEFT) ? tempKey : userInput;
        }
        else if(tempKey == LEFT) {
            key = (userInput != RIGHT) ? tempKey : userInput;
        }
        return key;
    }

    // Function that runs when game is over
    function gameOver() {
        // End game
        clearInterval(game);

        // Check user score with high scores
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
        
        // Reset user score
        userScore = 0;

        // Update high score values on screen
        $("#score1").html(highScores[0]);
        $("#score2").html(highScores[1]);
        $("#score3").html(highScores[2]);
        $("#score4").html(highScores[3]);
        $("#score5").html(highScores[4]);
        $("#selectionMenu").css("display", "block");
        $("#gameOverScreen").css("display", "block");
        $("#highScores").css("display", "block");

        // Update browser memory
        localStorage.setItem("SNAKE_HIGH_SCORES", JSON.stringify(highScores));
    }
})