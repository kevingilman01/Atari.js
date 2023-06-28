// Initialization Function
$(function() {
    // Key Definitions
    const LEFT = 37;
    const UP = 38;
    const RIGHT = 39;
    const DOWN = 40;
    const SPACE = 32;

    // User Variables //

    // Points
    var userScore; // Stores the users game score
    var alien1KillPoints; // Number of points earned for killing a type 1 alien
    var alien2KillPoints; // Number of points earned for killing a type 2 alien
    var alien3KillPoints; // Number of points earned for killing a type 3 alien
    var ufoKillPoints; // Number of points earned for killing UFO

    // Input
    var directionalKeyPressed; // Stores a boolean for whether a directional key is pressed
    var shootKeyPressed; // Stores a boolean for whether a directional key is pressed
    var directionalKey; // Stores the directional key that the user has last pressed

    // Levels
    var level; // Stores current level
    var levels; // Data structure that contains enemy and level parameters for each level

    // Color Specs
    var alien1Color; // String or hex for type 1 alien color
    var alien2Color; // String or hex for type 2 alien color
    var alien3Color; // String or hex for type 3 alien color
    var ufoColor; // String or hex for UFO color
    var shipColor; // String or hex for ship color
    var bulletColor; // String or hex for bullet color
    var alienBulletColor; // String or hex for alien bullet color
    var barrierColor; // String or hex for barrier color

    // Grid size
    var segmentSize; // Number of pixels on canvas for length and width of game segments

    // Collision
    var collisionCoordinates; // Meant to store coordinates of collisions after running checkObjectCollision function
    var barrierHealth; // Number of hits it takes to deteriorate barrier

    // Time
    var time; // Represents the number of seconds from game start
    var ufoSpawnRate; // Number of seconds between UFO spawns
    var alienBulletSpawnRate; // Number of seconds between alien bullet spawns
    var alienMoveCount; // Number of moves the aliens have made horizontally

    var alienMoveDirection; // Horizontal movement direction for aliens

    // Intervals
    var timer_s; // Interval that represents a one second timer
    var alienMovementInterval; // Runs alien movement interval
    var ufoMovementInterval; // Runs UFO movement interval
    var shipMovementInterval; // Runs ship movement interval
    var bulletMovementInterval; // Runs bullet movement interval
    var alienBulletMovementInterval; // Runs alien bullet movement interval
    var canvasUpdateInterval; // Runs the canvas update interval

    var alienMovementDelay; // This is the delay for alien movement in milliseconds
    var ufoMovementDelay; // This is the delay for UFO movement in milliseconds
    var shipMovementDelay; // This is the delay for ship movement in milliseconds
    var bulletMovementDelay; // This is the delay for bullet movement in milliseconds
    var alienBulletMovementDelay; // This is the delay for alien bullet movement in milliseconds
    var canvasUpdateDelay; // This is the smallest delay that controls the canvas updates for the game

    // Browser Memory
    const highScores = JSON.parse(localStorage.getItem("SPACE_INVADERS_HIGH_SCORES")) ?? []; // Stores high scores from local browser storage

    // Canvas Variables
    var canvas = $("#canvas")[0];
    var ctx = canvas.getContext('2d');
    var locationPairs; // Represents valid grid locations on the canvas

    // Spaceship Game Object
    var ship;

    // Alien Game Objects
    var alien1;
    var alien2;
    var alien3;

    // UFO Game Object
    var ufo;

    // Barrier Game Object
    var barriers;

    // Bullet Game Object
    var bullets;

    // Alien Bullet Game Object
    var alienBullets;

    // Play Button Handler
    $("#playButton").on("click", function() {
        // Hide menu displays
        $("#selectionMenu").css("display", "none");
        $("#gameOverScreen").css("display", "none");
        $("#highScores").css("display", "none");

        initializeGameVariables();

        // Reset sub display
        $("#level").text(level+1);
        $("#score").text(userScore);
        $("#game-text").css("display", "block");

        // Start game
        timer_s = setInterval(timerLoop, 1000);
        alienMovementInterval = setInterval(alienLoop, alienMovementDelay);
        ufoMovementInterval = setInterval(ufoLoop, ufoMovementDelay)
        shipMovementInterval = setInterval(shipLoop, shipMovementDelay);
        bulletMovementInterval = setInterval(bulletMoveLoop, bulletMovementDelay);
        alienBulletMovementInterval = setInterval(alienBulletMoveLoop, alienBulletMovementDelay);

        canvasUpdateDelay = Math.min(alienMovementDelay, ufoMovementDelay, shipMovementDelay, bulletMovementDelay, alienBulletMovementDelay);
        canvasUpdateInterval = setInterval(canvasLoop, canvasUpdateDelay);
    });

    // Key down handler
    $(document).on("keydown", function(e) {
        // If a directional key is not already pressed and the input is directional, this will set direction and enable ship movement
        if (!directionalKeyPressed) {
            if ($.inArray(e.keyCode, [LEFT, RIGHT]) != -1) {
                directionalKey = e.keyCode;
                directionalKeyPressed = true;
            }
        }

        // If key input is space and there are no bullets on screen spawn a bullet
        if(e.keyCode == SPACE && bullets.length == 0) {
            shootKeyPressed = true;
        }
        
    })

    // Key up handler
    $(document).on("keyup", function(e) {
        // If the released input is DOWN, UP, LEFT, or RIGHT, set boolean for key press to false 
        if ($.inArray(e.keyCode, [LEFT, RIGHT]) != -1) {
            directionalKeyPressed = false;
        }

        // If the released input is SPACE, set boolean for key press to false
        if (e.keyCode == SPACE) {
            shootKeyPressed = false;
        }
    })

    // Function to initialize game variables
    function initializeGameVariables() {
        userScore = 0; 
        alien1KillPoints = 10;
        alien2KillPoints = 20;
        alien3KillPoints = 40;
        ufoKillPoints = [50, 100, 150, 250, 400, 650, 1050, 1700, 2750, 4450, 7200];
        
        directionalKeyPressed = false;
        shootKeyPressed = false;
        directionalKey = RIGHT;

        level = 0;
        levels = [
            {alienMovementDelay: 1000, ufoMovementDelay: 160}, // Level 1
            {alienMovementDelay: 930, ufoMovementDelay: 150}, // Level 2
            {alienMovementDelay: 860, ufoMovementDelay: 140}, // Level 3
            {alienMovementDelay: 790, ufoMovementDelay: 130}, // Level 4
            {alienMovementDelay: 720, ufoMovementDelay: 120}, // Level 5
            {alienMovementDelay: 650, ufoMovementDelay: 110}, // Level 6
            {alienMovementDelay: 580, ufoMovementDelay: 100}, // Level 7
            {alienMovementDelay: 510, ufoMovementDelay: 90}, // Level 8
            {alienMovementDelay: 440, ufoMovementDelay: 80}, // Level 9
            {alienMovementDelay: 370, ufoMovementDelay: 70}, // Level 10
            {alienMovementDelay: 300, ufoMovementDelay: 60}, // Level 11
        ];

        alien1Color = "dodgerblue";
        alien2Color = "green";
        alien3Color = "mediumvioletred";
        ufoColor = "red";
        shipColor = "mediumseagreen";
        bulletColor = "orange";
        alienBulletColor = "white";
        barrierColor = "maroon";

        segmentSize = 20;

        collisionCoordinates = [];
        barrierHealth = 5;

        time = 0;
        ufoSpawnRate = 45;
        alienBulletSpawnRate = 2;
        alienMoveCount = 0;

        alienMoveDirection = RIGHT;

        alienMovementDelay = levels[level].alienMovementDelay;
        ufoMovementDelay = levels[level].ufoMovementDelay;
        shipMovementDelay = 50;
        bulletMovementDelay = 30;
        alienBulletMovementDelay = 80;

        locationPairs = [];
        for(let i = 0; i < canvas.width; i+=segmentSize) {
            for(let j = 0; j < canvas.height; j+=segmentSize) {
                locationPairs.push({x:i,y:j});
            }
        }

        ship = [];
        alien1 = [];
        alien2 = [];
        alien3 = [];
        ufo = [];
        barriers = [];
        bullets = [];
        alienBullets = [];

        ship.push({x:400, y:580-segmentSize}, {x:400, y:580}, {x:400+segmentSize, y:580}, {x:400-segmentSize, y:580}); // Spawn ship
        spawnAliens();
        spawnBarriers();
        addHealthToObjects(barriers, barrierHealth); // Add health to all barriers
    }

    // Timer loop (one second)
    function timerLoop() {
        time++;

        // Spawn UFO
        if (time % ufoSpawnRate == 0) {
            spawnUFO();
        }

        // Spawn alien bullet
        if (time % alienBulletSpawnRate == 0 && alienMoveCount < 9) {
            spawnAlienBullet();
        }
    }

    // Alien movement loop
    function alienLoop() {
        if(alienMoveDirection == RIGHT && alienMoveCount < 9) {
            moveAliens(RIGHT);
            alienMoveCount++;
        }
        else if (alienMoveDirection == LEFT && alienMoveCount < 9) {
            moveAliens(LEFT);
            alienMoveCount++;
        }
        else {
            alienMoveCount = 0;
            moveAliens(DOWN);
            if(alienMoveDirection == RIGHT) {
                alienMoveDirection = LEFT;
            }
            else {
                alienMoveDirection = RIGHT;
            }
        }
    }

    // UFO movement loop
    function ufoLoop() {
        moveUFOs();
    }

    // Ship movement loop
    function shipLoop() {
        if (directionalKeyPressed) {
            moveShip();
        }
    }

    // Bullet movement loop
    function bulletMoveLoop() {
        if(shootKeyPressed && bullets.length == 0) {
            bullets.push({x:ship[0].x, y:ship[0].y});
        }

        moveBullets();
        removeBullets(bullets, UP);
    }

    // Alien bullet movement loop
    function alienBulletMoveLoop() {
        moveAlienBullets();
        removeBullets(alienBullets, DOWN);
    }

    // Canvas reset loop (based on shortest game interval delay)
    function canvasLoop() {
        clearCanvas();

        // Draw game objects
        drawSquaresStroke(ship, shipColor,  "white", segmentSize); // Draw ship
        drawSquaresStroke(bullets, bulletColor, "white", segmentSize); // Draw bullets
        drawSquaresStroke(alienBullets, alienBulletColor, "white", segmentSize); // Draw alien bullets
        drawBarriers(barriers, barrierColor, "white", segmentSize); // Draw barriers
        ufo.forEach(item => {
            drawSquaresStroke(item.body, ufoColor, "white", segmentSize); // Draw each UFO body
        });
        drawUFOHeads(); // Draw UFO heads
        drawSquaresStroke(alien1, alien1Color, "white", segmentSize); // Draw type 1 aliens
        drawSquaresStroke(alien2, alien2Color, "white", segmentSize); // Draw type 2 aliens
        drawSquaresStroke(alien3, alien3Color, "white", segmentSize); // Draw type 3 aliens
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

    // Function to draw rectangles with a stroke outline
    function drawBarriers(list, fillColor, strokeColor, size) {
        ctx.fillStyle = fillColor;
        ctx.strokeStyle = strokeColor;
        $.each(list, function(index, value) {
            ctx.fillRect(value.x, value.y+((value.top / barrierHealth) * segmentSize), size, (((5-value.top-value.bottom) / barrierHealth)) * segmentSize);
            ctx.strokeRect(value.x, value.y+((value.top / barrierHealth) * segmentSize), size, (((5-value.top-value.bottom) / barrierHealth)) * segmentSize);
        });
    }

    // Function to draw UFO head
    function drawUFOHeads() {
        ctx.fillStyle = ufoColor;
        ctx.strokeStyle = "white";
        $.each(ufo, function(index, value) {
            ctx.fillRect(value.head[0].x, value.head[0].y+(segmentSize/2), segmentSize, segmentSize/2);
            ctx.strokeRect(value.head[0].x, value.head[0].y+(segmentSize/2), segmentSize, segmentSize/2);
        })
    }

    // Function to spawn aliens
    function spawnAliens() {
        for(var i = 0; i < 11; i++) {
            alien1.push({x:100+(i*2*segmentSize),y:(8*segmentSize)}, {x:100+(i*2*segmentSize),y:(10*segmentSize)});
            alien2.push({x:100+(i*2*segmentSize),y:(4*segmentSize)}, {x:100+(i*2*segmentSize),y:(6*segmentSize)});
            alien3.push({x:100+(i*2*segmentSize),y:(2*segmentSize)});
        }
    }

    // Function to spawn a UFO
    function spawnUFO() {
        var xVal = locationPairs[locationPairs.length-1].x; // Set x-coordinate for right side of screen

        // Randomly generate movement direction and spawn UFO on appropriate side of the screen
        if (Math.floor(Math.random() * 2) == 0) {
            ufo.push({head: [{x:0-(2*segmentSize), y:0}], body: [{x:0-segmentSize, y:0+segmentSize}, {x:0-(2*segmentSize), y:0+segmentSize}, {x:0-(3*segmentSize), y:0+segmentSize}], direction: RIGHT});
        }
        else {
            ufo.push({head: [{x:xVal+(2*segmentSize), y:0}], body: [{x:xVal+segmentSize, y:0+segmentSize}, {x:xVal+(2*segmentSize), y:0+segmentSize}, {x:xVal+(3*segmentSize), y:0+segmentSize}], direction: LEFT});
        }
    }

    // Function to spawn alien bullets
    function spawnAlienBullet() {
        var alienType = Math.floor(Math.random() * 3);
        var alienIndex;

        if (alienType == 0 && alien1.length > 0) {
            alienIndex = Math.floor(Math.random() * alien1.length);
            alienBullets.push({x:alien1[alienIndex].x, y:alien1[alienIndex].y+segmentSize});
        }
        else if (alienType == 1 && alien2.length > 0) {
            alienIndex = Math.floor(Math.random() * alien2.length);
            alienBullets.push({x:alien2[alienIndex].x, y:alien2[alienIndex].y+segmentSize});
        }
        else if (alienType == 2 && alien2.length > 0) {
            alienIndex = Math.floor(Math.random() * alien3.length);
            alienBullets.push({x:alien3[alienIndex].x, y:alien3[alienIndex].y+segmentSize});
        }

        if(alienBullets.length > 0) {
            moveElement(alienBullets[alienBullets.length-1], alienMoveDirection);
        }
    }

    // Function to spawn the barriers
    function spawnBarriers() {
        for (var i = 0; i < 4; i++) {
            barriers.push(
                {x:(6*segmentSize)+(8*segmentSize*i), y:580-(5*segmentSize), top:0, bottom:0}, {x:(6*segmentSize)+(8*segmentSize*i), y:580-(6*segmentSize), top:0, bottom:0}, 
                {x:(7*segmentSize)+(8*segmentSize*i), y:580-(6*segmentSize), top:0, bottom:0}, {x:(8*segmentSize)+(8*segmentSize*i), y:580-(6*segmentSize), top:0, bottom:0},
                {x:(9*segmentSize)+(8*segmentSize*i), y:580-(6*segmentSize), top:0, bottom:0}, {x:(9*segmentSize)+(8*segmentSize*i), y:580-(5*segmentSize), top:0, bottom:0}
            );
        }
    }

    // Function to move aliens
    function moveAliens(dir) {
        if(alien1.length == 0 && alien2.length == 0 && alien3.length == 0) {
            incrementLevel();
        }

        alien1.forEach((alien) => {
            if(checkObjectCollision(alien1, ship, dir) || checkListBoundaryCollision(alien1, DOWN)) {
                gameOver();
                return;
            }
        });
        moveObject(alien1, dir);

        alien2.forEach((alien) => {
            if(checkObjectCollision(alien2, ship, dir) || checkListBoundaryCollision(alien2, DOWN)) {
                gameOver();
                return;
            }
        });
        moveObject(alien2, dir);

        alien3.forEach((alien) => {
            if(checkObjectCollision(alien3, ship, dir) || checkListBoundaryCollision(alien3, DOWN)) {
                gameOver();
                return;
            }
        });
        moveObject(alien3, dir);
    }

    // Function to move UFOs
    function moveUFOs() {
        ufo.forEach((item, index) => {
            if(checkElementBoundaryCollision(item.body[item.body.length-1], item.direction)) {
                ufo.splice(index, 1);
            }
            else {
                moveObject(item.body, item.direction);
                moveObject(item.head, item.direction);
            }
        })
    }

    // Function to move the ship
    function moveShip() {
        // Check for alien collisions
        if(checkObjectCollision(ship, alien1, directionalKey) || checkObjectCollision(ship, alien2, directionalKey) || checkObjectCollision(ship, alien3, directionalKey)) {
            gameOver();
            return;
        }

        // Check for alien bullet collisions
        if(checkObjectCollision(ship, alienBullets, directionalKey)) {
            gameOver();
            return;
        }

        // Check that there is not a boundary collision
        if(!checkListBoundaryCollision(ship, directionalKey)) {
            moveObject(ship, directionalKey);
        }
    }

    // Function to move the bullets
    function moveBullets() {
        // Check for barrier collisions
        if(checkObjectCollision(bullets, barriers, UP)) {
            barriers.forEach((elem, index) => {
                collisionCoordinates.forEach((elem2, index2) => {
                    // If the barrier coordinates are equal to the collision coordinates
                    if(elem.x == elem2.x && elem.y == elem2.y) {
                        if(barriers[index].health > 1) {
                            barriers[index].health--; // Damage barrier
                            barriers[index].bottom++; // Hit from bottom
                        }
                        else {
                            destroyGameObject(barriers, index, 0);
                        }
                    }
                })
            })

            removeBullets(bullets, UP); // Used after function checkObjectCollision with bullets to remove collided bullets
        }

        // Check for type 1 alien collisions
        if(checkObjectCollision(bullets, alien1, UP)) {
            alien1.forEach((elem, index) => {
                collisionCoordinates.forEach((elem2, index2) => {
                    if(elem.x == elem2.x && elem.y == elem2.y) {
                        destroyGameObject(alien1, index, alien1KillPoints);
                    }
                })
            })

            removeBullets(bullets, UP);
        }

        // Check for type 2 alien collisions
        if(checkObjectCollision(bullets, alien2, UP)) {
            alien2.forEach((elem, index) => {
                collisionCoordinates.forEach((elem2, index2) => {
                    if(elem.x == elem2.x && elem.y == elem2.y) {
                        destroyGameObject(alien2, index, alien2KillPoints);
                    }
                })
            })

            removeBullets(bullets, UP);
        }

        // Check for type 3 alien collisions
        if(checkObjectCollision(bullets, alien3, UP)) {
            alien3.forEach((elem, index) => {
                collisionCoordinates.forEach((elem2, index2) => {
                    if(elem.x == elem2.x && elem.y == elem2.y) {
                        destroyGameObject(alien3, index, alien3KillPoints);
                    }
                })
            })

            removeBullets(bullets, UP);
        }

        // Check for UFO collisions
        var ufoCollision = false;
        ufo.forEach((item, i) => {
            if(checkObjectCollision(bullets, item.body, UP)) {
                item.body.forEach((elem, index) => {
                    collisionCoordinates.forEach((elem2, index2) => {
                        if(elem.x == elem2.x && elem.y == elem2.y) {
                            ufoCollision = true;
                        }
                    })
                })

                if(ufoCollision) {
                    destroyGameObject(ufo, i, ufoKillPoints[level % ufoKillPoints.length]);
                }
    
                removeBullets(bullets, UP);
            }
        })

        moveObject(bullets, UP);
    }

    // Function to move alien bullets
    function moveAlienBullets() {
        // Check for barrier collisions
        if(checkObjectCollision(alienBullets, barriers, DOWN)) {
            barriers.forEach((elem, index) => {
                collisionCoordinates.forEach((elem2, index2) => {
                    // If the barrier coordinates are equal to the collision coordinates
                    if(elem.x == elem2.x && elem.y == elem2.y) {
                        if(barriers[index].health > 1) {
                            barriers[index].health--; // Damage barrier
                            barriers[index].top++; // Hit from top
                        }
                        else {
                            destroyGameObject(barriers, index, 0);
                        }
                    }
                })
            })

            removeBullets(alienBullets, DOWN); // Used after function checkObjectCollision with bullets to remove collided bullets
        }

        // Check for ship collision
        if(checkObjectCollision(alienBullets, ship, DOWN)) {
            ship.forEach((elem, index) => {
                collisionCoordinates.forEach((elem2, index2) => {
                    // If the barrier coordinates are equal to the collision coordinates
                    if(elem.x == elem2.x && elem.y == elem2.y) {
                        gameOver();
                        return;
                    }
                })
            })

            removeBullets(alienBullets, DOWN); // Used after function checkObjectCollision with bullets to remove collided bullets
        }
        
        moveObject(alienBullets, DOWN);
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

    // Function to remove collided bullets (should be used after checking for bullet collisions)
    function removeBullets(list, dir) {
        removeIndices = [];
        var directionSign = (dir == UP) ? 1 : -1;

        list.forEach((bullet, i) => {
            collisionCoordinates.forEach((elem, index) => {
                if (bullet.y == elem.y + (segmentSize * directionSign)) {
                    removeIndices.push(i); // Remove collided bullets
                }
            })

            // Remove bullets that are out of bounds
            if (bullet.y < 0 || bullet.y > canvas.height) {
                removeIndices.push(i);
            }
        })

        removeIndices.sort((a, b) => b - a); // Sort indices in descending order
        
        removeIndices.forEach(elem => {
            list.splice(elem, 1); // Remove each necessary bullet
        })
    }

    // Function to check if a moving object will collide with another object
    function checkObjectCollision(movingObj, obj, dir) {
        var collision = false;
        collisionCoordinates = [];

        movingObj.forEach(movingObjElem => {
            obj.forEach(objElem => {
                switch(dir) {
                    case RIGHT:
                        if(movingObjElem.x + segmentSize == objElem.x && movingObjElem.y == objElem.y) {
                            collision = true;
                            collisionCoordinates.push({x:objElem.x, y:objElem.y});
                        }
                        break;
                    case LEFT:
                        if(movingObjElem.x - segmentSize == objElem.x && movingObjElem.y == objElem.y) {
                            collision = true;
                            collisionCoordinates.push({x:objElem.x, y:objElem.y});
                        }
                        break;
                    case UP:
                        if(movingObjElem.x == objElem.x && movingObjElem.y - segmentSize == objElem.y) {
                            collision = true;
                            collisionCoordinates.push({x:objElem.x, y:objElem.y});
                        }
                        break;
                    case DOWN:
                        if(movingObjElem.x == objElem.x && movingObjElem.y + segmentSize == objElem.y) {
                            collision = true;
                            collisionCoordinates.push({x:objElem.x, y:objElem.y});
                        }
                        break;
                }
            });
        });

        return collision;
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

    // Function that adds health to objects in a list
    function addHealthToObjects(list, health) {
        list.forEach(elem => {
            elem.health = health;
        })
    }

    // Function to destroy game object at index from list and add points for user
    function destroyGameObject(list, index, points) {
        list.splice(index, 1);
        userScore += points;
        $("#score").text(userScore);
    }

    // Function that increments the level
    function incrementLevel() {
        level++; // Increment level

        // Change enemy movement speeds
        alienMovementDelay = levels[level % levels.length].alienMovementDelay;
        ufoMovementDelay = levels[level % levels.length].ufoMovementDelay;
        clearInterval(alienMovementInterval);
        clearInterval(ufoMovementInterval);
        setTimeout(() => { // Timeout necessary to ensure that alienMoveCount is not updated by a scheduled interval loop even after clearing
            alienMoveCount = 0;
            alienMoveDirection = RIGHT;
            spawnAliens();
            alienMovementInterval = setInterval(alienLoop, alienMovementDelay);
            ufoMovementInterval = setInterval(ufoLoop, ufoMovementDelay);
        }, 1200)

        // Update level text
        $("#level").text(level+1);
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
        localStorage.setItem("SPACE_INVADERS_HIGH_SCORES", JSON.stringify(highScores));
    }

    // Function that runs when game is over
    function gameOver() {
        // End game
        clearInterval(alienMovementInterval);
        clearInterval(ufoMovementInterval);
        clearInterval(shipMovementInterval);
        clearInterval(bulletMovementInterval);
        clearInterval(alienBulletMovementInterval);
        clearInterval(canvasUpdateInterval);
        clearInterval(timer_s);

        compareScores();
        
        // Reset user score
        userScore = 0;

        // Show menu displays
        $("#selectionMenu").css("display", "block");
        $("#gameOverScreen").css("display", "block");
        $("#highScores").css("display", "block");
    }
})