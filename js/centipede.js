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
    var centipedeSegmentPoints; // Number of points earned for hitting centipede segment
    var centipedeKillPoints; // Number of points earned for killing a centipede
    var obstaclePoints; // Number of points earned for breaking obstacles
    var fleaPoints; // Number of points earned for killing a flea
    var scorpionPoints; // Number of points earned for killing a scorpion
    var spiderPoints; // Number of points earned for killing a spider

    // Input
    var directionalKeyPressed; // Stores a boolean for whether a directional key is pressed
    var shootKeyPressed; // Stores a boolean for whether a directional key is pressed
    var directionalKey; // Stores the directional key that the user has last pressed

    // Levels
    var level; // Stores current level
    var levels; // Data structure that contains enemy and level parameters for each level

    // Color Specs
    var centipedeColor; // String or hex for centipede color
    var shipColor; // String or hex for ship color
    var bulletColor; // String or hex for bullet color
    var obstacleColor; // String or hex for obstacle color
    var fleaColor; // String or hex for flea color
    var scorpionColor; // String or hex for scorpion color
    var spiderColor; // String or hex for spider color

    // Abilities
    var autoFire; // Bool for enabling auto firing

    // Grid size
    var segmentSize; // Number of pixels on canvas for length and width of game segments

    // Collision
    var collisionCoordinates; // Meant to store coordinates of collisions after running checkObjectCollision function
    var obstacleHealth; // Number of hits it takes to deteriorate obstacles

    var startingObstacles; // Starting number of obstacles
    var maxObstacles; // Max number of obstacles that will ever spawn
    var levelObstacles; // Number of obstacles that spawn when beating a level

    // Time
    var time; // Represents the number of seconds from game start
    var fleaSpawnRate; // Number of seconds between flea spawns
    var scorpionSpawnRate; // Number of seconds between scorpion spawns
    var spiderSpawnRate; // Number of seconds between spider spawns
    var spiderMoveCount; // Number of moves the spider makes in the randomly generated direction

    // Intervals
    var timer_s; // Interval that represents a one second timer
    var enemyMovementInterval; // Runs enemy movement interval
    var shipMovementInterval; // Runs ship movement interval
    var bulletMovementInterval; // Runs bullet movement interval
    var autoFireInterval; // Runs the auto fire update interval
    var canvasUpdateInterval; // Runs the canvas update interval

    var enemyMovementDelay; // This is the delay for enemy movement in milliseconds
    var shipMovementDelay; // This is the delay for ship movement in milliseconds
    var bulletMovementDelay; // This is the delay for bullet movement in milliseconds
    var autoFireDelay; // This is the delay for auto fire in milliseconds
    var canvasUpdateDelay; // This is the smallest delay that controls the canvas updates for the game

    // Browser Memory
    const highScores = JSON.parse(localStorage.getItem("CENTIPEDE_HIGH_SCORES")) ?? []; // Stores high scores from local browser storage

    // Canvas Variables
    var canvas = $("#canvas")[0];
    var ctx = canvas.getContext('2d');
    var locationPairs; // Represents valid grid locations on the canvas

    // Spaceship Game Object
    var ship;

    // Centipede Game Object
    var centipedes;

    // Flea Game Object
    var fleas;

    // Scorpion Game Object
    var scorpions;

    // Spider Game Object
    var spiders;

    // Obstacle Game Object
    var obstacles;

    // Bullet Game Object
    var bullets = [];

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
        enemyMovementInterval = setInterval(enemyLoop, enemyMovementDelay);
        shipMovementInterval = setInterval(shipLoop, shipMovementDelay);
        bulletMovementInterval = setInterval(bulletMoveLoop, bulletMovementDelay);

        canvasUpdateDelay = Math.min(enemyMovementDelay, shipMovementDelay, bulletMovementDelay);
        canvasUpdateInterval = setInterval(canvasLoop, canvasUpdateDelay);
    });

    // Key down handler
    $(document).on("keydown", function(e) {
        // If a directional key is not already pressed and the input is directional, this will set direction and enable ship movement
        if (!directionalKeyPressed) {
            if ($.inArray(e.keyCode, [DOWN, UP, LEFT, RIGHT]) != -1) {
                directionalKey = e.keyCode;
                directionalKeyPressed = true;
            }
        }

        // If the shoot key is not already pressed and input is SPACE, this will fire a shot
        if(!shootKeyPressed) {
            if(e.keyCode == SPACE) {
                bullets.push({x:ship[0].x, y:ship[0].y});
                shootKeyPressed = true;

                // If auto fire is enabled, this will start an auto fire interval
                if(autoFire) {
                    autoFireInterval = setInterval(autoFireLoop, autoFireDelay);
                }
            }
        }
    })

    // Key up handler
    $(document).on("keyup", function(e) {
        // If the released input is DOWN, UP, LEFT, or RIGHT, set boolean for key press to false 
        if ($.inArray(e.keyCode, [DOWN, UP, LEFT, RIGHT]) != -1) {
            directionalKeyPressed = false;
        }

        // If the released input is SPACE, set boolean for key press to false
        if (e.keyCode == SPACE) {
            shootKeyPressed = false;

            // If auto fire is enabled, clear the interval
            if(autoFire) {
                clearInterval(autoFireInterval);
            }
        }
    })

    // Function to initialize game variables
    function initializeGameVariables() {
        userScore = 0; 
        centipedeSegmentPoints = 10; 
        centipedeKillPoints = 100; 
        obstaclePoints = 5; 
        fleaPoints = 300; 
        scorpionPoints = 1000; 
        spiderPoints = 600;
        
        directionalKeyPressed = false;
        shootKeyPressed = false;
        directionalKey = DOWN;

        level = 0;
        levels = [
            // Section 1
            {centipedeColor: "limegreen", obstacleColor: "palegreen", fleaColor: "deeppink", scorpionColor: "deeppink", spiderColor: "limegreen", enemyMovementDelay: 100},
            {centipedeColor: "khaki", obstacleColor: "gold", fleaColor: "sandybrown", scorpionColor: "sandybrown", spiderColor: "khaki", enemyMovementDelay: 97},
            {centipedeColor: "mediumturquoise", obstacleColor: "lightcyan", fleaColor: "cyan", scorpionColor: "cyan", spiderColor: "mediumturquoise", enemyMovementDelay: 94},

            // Section 2
            {centipedeColor: "sandybrown", obstacleColor: "peachpuff", fleaColor: "khaki", scorpionColor: "khaki", spiderColor: "sandybrown", enemyMovementDelay: 90},
            {centipedeColor: "cyan", obstacleColor: "lightskyblue", fleaColor: "mediumturquoise", scorpionColor: "mediumturquoise", spiderColor: "cyan", enemyMovementDelay: 87},
            {centipedeColor: "deeppink", obstacleColor: "pink", fleaColor: "limegreen", scorpionColor: "limegreen", spiderColor: "deeppink", enemyMovementDelay: 84},

            // Section 3
            {centipedeColor: "seagreen", obstacleColor: "springgreen", fleaColor: "darkviolet", scorpionColor: "darkviolet", spiderColor: "seagreen", enemyMovementDelay: 80},
            {centipedeColor: "yellow", obstacleColor: "bisque", fleaColor: "chocolate", scorpionColor: "chocolate", spiderColor: "yellow", enemyMovementDelay: 77},
            {centipedeColor: "mediumaquamarine", obstacleColor: "darkturquoise", fleaColor: "skyblue", scorpionColor: "skyblue", spiderColor: "mediumaquamarine", enemyMovementDelay: 74},

            // Section 4
            {centipedeColor: "chocolate", obstacleColor: "tan", fleaColor: "yellow", scorpionColor: "yellow", spiderColor: "chocolate", enemyMovementDelay: 70},
            {centipedeColor: "skyblue", obstacleColor: "aliceblue", fleaColor: "mediumaquamarine", scorpionColor: "mediumaquamarine", spiderColor: "skyblue", enemyMovementDelay: 67},
            {centipedeColor: "darkviolet", obstacleColor: "violet", fleaColor: "seagreen", scorpionColor: "seagreen", spiderColor: "darkviolet", enemyMovementDelay: 64},

            // Section 5
            {centipedeColor: "darkgreen", obstacleColor: "chartreuse", fleaColor: "darkmagenta", scorpionColor: "darkmagenta", spiderColor: "darkgreen", enemyMovementDelay: 60},
            {centipedeColor: "goldenrod", obstacleColor: "lemonchiffon", fleaColor: "sienna", scorpionColor: "sienna", spiderColor: "goldenrod", enemyMovementDelay: 57},
            {centipedeColor: "teal", obstacleColor: "turquoise", fleaColor: "steelblue", scorpionColor: "steelblue", spiderColor: "teal", enemyMovementDelay: 54},

            // Section 6
            {centipedeColor: "sienna", obstacleColor: "peru", fleaColor: "goldenrod", scorpionColor: "goldenrod", spiderColor: "sienna", enemyMovementDelay: 50},
            {centipedeColor: "steelblue", obstacleColor: "powderblue", fleaColor: "teal", scorpionColor: "teal", spiderColor: "steelblue", enemyMovementDelay: 47},
            {centipedeColor: "darkmagenta", obstacleColor: "magenta", fleaColor: "darkgreen", scorpionColor: "darkgreen", spiderColor: "darkmagenta", enemyMovementDelay: 44},

            // Section 7
            {centipedeColor: "black", obstacleColor: "dimgray", fleaColor: "slategray", scorpionColor: "slategray", spiderColor: "black", enemyMovementDelay: 40},
        ];

        centipedeColor = levels[level].centipedeColor;
        shipColor = "red";
        bulletColor = "orange";
        obstacleColor = levels[level].obstacleColor;
        fleaColor = levels[level].fleaColor;
        scorpionColor = levels[level].scorpionColor;
        spiderColor = levels[level].spiderColor;

        autoFire = true;

        segmentSize = 20;

        collisionCoordinates = [];
        obstacleHealth = 5;

        startingObstacles = 50;
        maxObstacles = 200;
        levelObstacles = 20;

        time = 0;
        fleaSpawnRate = 21;
        scorpionSpawnRate = 45;
        spiderSpawnRate = 11;
        spiderMoveCount = 10; // Should be divisible by 2

        enemyMovementDelay = levels[level].enemyMovementDelay;
        shipMovementDelay = 50;
        bulletMovementDelay = 20;
        autoFireDelay = 200;

        locationPairs = [];
        for(let i = 0; i < canvas.width; i+=segmentSize) {
            for(let j = 0; j < canvas.height; j+=segmentSize) {
                locationPairs.push({x:i,y:j});
            }
        }

        ship = [];
        centipedes = [];
        fleas = [];
        scorpions = [];
        spiders = [];
        obstacles = [];

        ship.push({x:400, y:500}, {x:400, y:500+segmentSize}, {x:400+segmentSize, y:500+segmentSize}, {x:400-segmentSize, y:500+segmentSize}); // Spawn ship
        spawnCentipede(10); // Spawn centipede
        for (let i = 0; i < startingObstacles; i++) { // Spawn obstacles
            spawnObstacle();
        }
        addHealthToObjects(obstacles, obstacleHealth); // Add health to all obstacles
    }

    // Timer loop (one second)
    function timerLoop() {
        time++;

        // Spawn Fleas
        if (time % fleaSpawnRate == 0) {
            spawnFlea();
            spawnFlea();
        }

        // Spawn scorpion
        if (time % scorpionSpawnRate == 0) {
            spawnScorpion();
        }

        // Spawn spider
        if (time % spiderSpawnRate == 0) {
            spawnSpider();
        }
    }

    // Enemy movement loop
    function enemyLoop() {
        moveCentipedes();
        moveFleas();
        moveScorpions();
        moveSpiders();
    }

    // Ship movement loop
    function shipLoop() {
        if (directionalKeyPressed) {
            moveShip();
        }
    }

    // Bullet movement loop
    function bulletMoveLoop() {
        moveBullets();
    }

    // Auto fire loop
    function autoFireLoop() {
        bullets.push({x:ship[0].x, y:ship[0].y});
    }

    // Canvas reset loop (based on shortest game interval delay)
    function canvasLoop() {
        clearCanvas();

        if((level+1) % levels.length == 0) { // Fill screen white if on the last level
            fillCanvas("white");
        }

        // Draw game objects
        drawSquaresStroke(ship, shipColor,  "white", segmentSize); // Draw ship
        drawSquaresStroke(bullets, bulletColor, "white", segmentSize); // Draw bullets
        drawObstacles(obstacles, obstacleColor, "white", segmentSize); // Draw obstacles
        centipedes.forEach(centipede =>  {
            drawSquaresStroke(centipede.body, centipedeColor, "white", segmentSize); // Draw each of the centipedes
        });
        drawSquaresStroke(fleas, fleaColor, "white", segmentSize); // Draw fleas
        scorpions.forEach(scorpion => {
            drawSquaresStroke(scorpion.body, scorpionColor, "white", segmentSize); // Draw each of the scorpions
        })
        spiders.forEach(spider => {
            drawSquaresStroke(spider.body, spiderColor, "white", segmentSize); // Draw each of the spiders
        })
    }

    // Function to clear the canvas screen
    function clearCanvas() {
        ctx.clearRect(0,0,canvas.width,canvas.height);
    }

    // Function to fill canvas screen
    function fillCanvas(color) {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
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
    function drawObstacles(list, fillColor, strokeColor, size) {
        ctx.fillStyle = fillColor;
        ctx.strokeStyle = strokeColor;
        $.each(list, function(index, value) {
            ctx.fillRect(value.x, value.y, size, (value.health / obstacleHealth) * segmentSize);
            ctx.strokeRect(value.x, value.y, size, (value.health / obstacleHealth) * segmentSize);
        });
    }

    // Function to spawn a centipede of given length
    function spawnCentipede(length) {
        var body = [];

        var xVal = locationPairs[Math.floor(Math.random() * locationPairs.length)].x; // Randomly generate x-coordinate

        for(var i = 0; i < length; i++) { // Create centipede body
            body.push({x:xVal,y:(0-(i*segmentSize))});
        }

        var dir = Math.floor(Math.random() * 2) == 0 ? LEFT : RIGHT // Randomly generate initial centipede movement direction

        centipedes.push({body:body, direction:dir, collisionDirection:DOWN}); // Create new centipede element inside of centipedes game object
    }

    // Function to spawn a flea
    function spawnFlea() {
        fleas.push({x:locationPairs[Math.floor(Math.random() * locationPairs.length)].x, y:0-segmentSize}); // Randomly generates x location for flea and spawns it at the top of the screen
    }

    // Function to spawn a scorpion
    function spawnScorpion() {
        var xVal = locationPairs[locationPairs.length-1].x; // Set x-coordinate for right side of screen
        var yVal = locationPairs[Math.floor(Math.random() * locationPairs.length)].y; // Randomly gnerate y-coordinate

        // Randomly generate movement direction and spawn scorpion on appropriate side of the screen
        if (Math.floor(Math.random() * 2) == 0) {
            scorpions.push({body: [{x:0-segmentSize, y:yVal}, {x:0-(2*segmentSize), y:yVal}, {x:0-(3*segmentSize), y:yVal}, {x:0-(3*segmentSize), y:yVal-segmentSize}], direction: RIGHT});
        }
        else {
            scorpions.push({body: [{x:xVal+segmentSize, y:yVal}, {x:xVal+(2*segmentSize), y:yVal}, {x:xVal+(3*segmentSize), y:yVal}, {x:xVal+(3*segmentSize), y:yVal-segmentSize}], direction: LEFT});
        }
    }

    // Function to spawn a spider
    function spawnSpider() {
        var xVal = locationPairs[locationPairs.length-1].x; // Set x-coordinate for right side of screen
        var yVal = generateCoordinate(filterScreenSegments("y", (canvas.height*2)/3, (canvas.height*3)/4), "y"); // Randomly generate y-coordinate in bottom region of screen

        // Randomly generate movement direction and spawn spider on appropriate side of the screen
        if (Math.floor(Math.random() * 2) == 0) {
            spiders.push({body: [{x:0-segmentSize, y:yVal}, {x:0-(2*segmentSize), y:yVal}, {x:0-(2*segmentSize), y:yVal-segmentSize}, {x:0-(2*segmentSize), y:yVal+segmentSize}, {x:0-(3*segmentSize), y:yVal}], direction: RIGHT, count: 0, move: 0});
        }
        else {
            spiders.push({body: [{x:xVal+segmentSize, y:yVal}, {x:xVal+(2*segmentSize), y:yVal}, {x:xVal+(2*segmentSize), y:yVal-segmentSize}, {x:xVal+(2*segmentSize), y:yVal+segmentSize}, {x:xVal+(3*segmentSize), y:yVal}], direction: LEFT, count: 0, move: 0});
        }
    }

    // Function to spawn a obstacle
    function spawnObstacle() {
        var filteredLocationPairs = [...locationPairs]; // Cloned location pairs array

        filteredLocationPairs = filterLocations(filteredLocationPairs, obstacles); // Filter out existing obstacle locations

        filteredLocationPairs = filteredLocationPairs.filter(pair => (pair.y < ((2*canvas.height) / 3))); // Filter out bottom third of screen

        var locationIndex = Math.floor(Math.random() * filteredLocationPairs.length); // Randomly generate list index

        obstacles.push({x:filteredLocationPairs[locationIndex].x, y:filteredLocationPairs[locationIndex].y}); // Add coordinate pair to obstacles
    }

    // Function to move the body segments of the centipedes
    function moveCentipedes() {
        // If all centipedes are dead increment level
        if(centipedes.length == 0) {
            incrementLevel();
        }

        // Move back parts of centipede
        centipedes.forEach(centipede => {
            for(var i = centipede.body.length - 1; i > 0; i--) {
                centipede.body[i].x = centipede.body[i-1].x;
                centipede.body[i].y = centipede.body[i-1].y;
            }
        });

        // Check for centipede head collisions
        centipedes.forEach((centipede, index) => {
            // Check for centipede collisions with ship
            if(checkObjectCollisionCentipede(centipede, ship)) {
                gameOver();
                return;
            }

            // Check for centipede collisions with other centipedes
            var centipedeCollision = false;
            centipedes.slice(0, index).concat(centipedes.slice(index+1)).forEach(element => {
                if (checkObjectCollisionCentipede(centipede, element.body)) {
                    centipedeCollision = true;
                }
            });

            // Check for centipede collisions with side boundaries and obstacles
            if (checkElementBoundaryCollision(centipede.body[0], centipede.direction) || checkObjectCollisionCentipede(centipede, obstacles) || centipedeCollision) {
                updateCentipedeDirections(centipede);
                moveElement(centipede.body[0], centipede.collisionDirection);
            }
            else { // If there are no collisions do normal horizontal movement
                moveElement(centipede.body[0], centipede.direction);
            }
        })
    }

    // Function to move fleas
    function moveFleas() {
        // Check for flea collisions with ship
        if(checkObjectCollision(fleas, ship, DOWN)) {
            gameOver();
            return;
        }

        // Check for flea collisions with bullets
        if(checkObjectCollision(fleas, bullets, DOWN)) {
            fleas.forEach((elem, index) => {
                collisionCoordinates.forEach((elem2, index2) => {
                    if(elem.x == elem2.x && elem.y == elem2.y) {
                        fleas.splice(index, 1); // Remove flea game object
                        userScore += fleaPoints; // Increase player score
                        $("#score").text(userScore); // Update score text
                    }
                })
            })
            removeBullets();
            return;
        }

        // Check for flea collisions with bottom screen boundary
        fleas.forEach((elem, index) => {
            if(checkElementBoundaryCollision(elem, DOWN)) {
                fleas.splice(index, 1);
            }
        })

        moveObject(fleas, DOWN);
    }

    // Function to move scorpions
    function moveScorpions() {
        scorpions.forEach((scorpion, index) => {
            // Check for scorpion collisions with ship
            if(checkObjectCollision(scorpion.body, ship, scorpion.direction)) {
                gameOver();
                return;
            }
            // Check for scorpion collisions with side boundaries
            else if(checkElementBoundaryCollision(scorpion.body[scorpion.body.length-1], scorpion.direction)) {
                scorpions.splice(index, 1);
            }
            else {
                moveObject(scorpion.body, scorpion.direction);
            }
        })
    }

    // Function to move spiders
    // (Note that spiders have 3 possible move cycles diagonal, up, or down)
    function moveSpiders() {
        spiders.forEach((spider, index) => {
            // If the spider has completed its movement cycle generate another movement cycle
            if(spider.count >= spiderMoveCount) {
                spider.move = Math.floor(Math.random() * 3);
                spider.count = 0;
            }
            
            // Horizontal movement (for diagonal cycle)
            if(spider.move == 0) {
                // Check for spider collisions with ship
                if(checkObjectCollision(spider.body, ship, spider.direction)) {
                    gameOver();
                    return;
                }
                else if(checkElementBoundaryCollision(spider.body[spider.body.length-1], spider.direction)) {
                    spiders.splice(index, 1);
                }
                moveObject(spider.body, spider.direction);
            }

            // Check for vertical movement
            if((spider.move == 1 && spider.count < spiderMoveCount / 2) || (spider.move != 1 && spider.count >= spiderMoveCount / 2)) {
                // Check for spider collisions with ship
                if(checkObjectCollision(spider.body, ship, DOWN)) {
                    gameOver();
                    return;
                }
                moveObject(spider.body, DOWN);
            }
            else {
                // Check for spider collisions with ship
                if(checkObjectCollision(spider.body, ship, UP)) {
                    gameOver();
                    return;
                }
                moveObject(spider.body, UP);
            }

            spider.count++;
        })
    }

    // Function to move the ship
    function moveShip() {
        // Check for centipede collisions
        centipedes.forEach(centipede => {
            if(checkObjectCollision(ship, centipede.body, directionalKey)) {
                gameOver();
                return;
            }
        });

        // Check for obstacle collisions
        if(checkObjectCollision(ship, obstacles, directionalKey)) {
            return;
        }

        // Check for flea collisions
        if(checkObjectCollision(ship, fleas, directionalKey)) {
            gameOver();
            return;
        }

        // Check for scorpion collisions
        scorpions.forEach(scorpion => {
            if(checkObjectCollision(ship, scorpion.body, directionalKey)) {
                gameOver();
                return;
            }
        })

        // Check that there is not a boundary collision
        if(!checkListBoundaryCollision(ship, directionalKey) && !checkShipBoundary(ship, directionalKey)) {
            moveObject(ship, directionalKey);
        }
    }

    // Function to move the bullets
    function moveBullets() {
        // Check for centipede collisions
        centipedes.forEach((centipede, i) => {
            if(checkObjectCollision(bullets, centipede.body, UP)) {
                centipede.body.forEach((elem, index) => {
                    collisionCoordinates.forEach((elem2, index2) => {
                        // If the centipedes body segment coordinates are equal to the collision coordinates
                        if(elem.x == elem2.x && elem.y == elem2.y) {
                            damageCentipede(i, index);
                        }
                    });
                });
            }

            // If the centipede has a length of 0 after checking collisions delete the element
            if(centipede.body.length == 0) {
                destroyGameObject(centipedes, i, centipedeKillPoints);
            }

            removeBullets(); // Used after function checkObjectCollision with bullets to remove collided bullets
        });

        // Check for obstacle collisions
        if(checkObjectCollision(bullets, obstacles, UP)) {
            obstacles.forEach((elem, index) => {
                collisionCoordinates.forEach((elem2, index2) => {
                    // If the obstacle coordinates are equal to the collision coordinates
                    if(elem.x == elem2.x && elem.y == elem2.y) {
                        if(obstacles[index].health > 1) {
                            obstacles[index].health--; // Damage obstacle
                        }
                        else {
                            destroyGameObject(obstacles, index, obstaclePoints);
                        }
                    }
                })
            })

            removeBullets(); // Used after function checkObjectCollision with bullets to remove collided bullets
        }

        // Check for flea collisions
        if(checkObjectCollision(bullets, fleas, UP)) {
            fleas.forEach((elem, index) => {
                collisionCoordinates.forEach((elem2, index2) => {
                    // If the flea coordinates are equal to the collision coordinates
                    if(elem.x == elem2.x && elem.y == elem2.y) {
                        destroyGameObject(fleas, index, fleaPoints);
                    }
                })
            })

            removeBullets(); // Used after function checkObjectCollision with bullets to remove collided bullets
        }

        // Check for scorpion collisions
        var scorpionCollision = false;
        scorpions.forEach((scorpion, i) => {
            if(checkObjectCollision(bullets, scorpion.body, UP)) {
                scorpion.body.forEach((elem, index) => {
                    collisionCoordinates.forEach((elem2, index2) => {
                        // If the scorpion coordinates are equal to the collision coordinates
                        if(elem.x == elem2.x && elem.y == elem2.y) {
                            scorpionCollision = true;
                        }
                    })
                })

                if(scorpionCollision) {
                    destroyGameObject(scorpions, i, scorpionPoints);
                    scorpionCollision = false;
                }

                removeBullets(); // Used after function checkObjectCollision with bullets to remove collided bullets
            }
        })

        // Check for spider collisions
        var spiderCollision = false;
        spiders.forEach((spider, i) => {
            if(checkObjectCollision(bullets, spider.body, UP)) {
                spider.body.forEach((elem, index) => {
                    collisionCoordinates.forEach((elem2, index2) => {
                        // If the spider coordinates are equal to the collision coordinates
                        if(elem.x == elem2.x && elem.y == elem2.y) {
                            spiderCollision = true;
                        }
                    })
                })

                if(spiderCollision == true) {
                    destroyGameObject(spiders, i, spiderPoints);
                    spiderCollision = false;
                }

                removeBullets(); // Used after function checkObjectCollision with bullets to remove collided bullets
            }
        })

        moveObject(bullets, UP);
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

    // Function to update centipede directions
    function updateCentipedeDirections(centipede) {
        switch(centipede.direction) {
            case RIGHT:
                centipede.direction = LEFT;
                break;
            case LEFT:
                centipede.direction = RIGHT;
                break;
        }
        switch(centipede.collisionDirection) {
            case DOWN:
                if(centipede.body[0].y + segmentSize >= canvas.height) {
                    centipede.collisionDirection = UP;
                }
                break;
            case UP:
                if(centipede.body[0].y <= 0) {
                    centipede.collisionDirection = DOWN;
                }
                break;
        }
    }

    // Function to remove collided bullets (should be used after checking for bullet collisions)
    function removeBullets() {
        removeIndices = [];
        bullets.forEach((bullet, i) => {
            collisionCoordinates.forEach((elem, index) => {
                if (bullet.y == elem.y + segmentSize) {
                    removeIndices.push(i); // Remove collided bullets
                }
            })

            // Remove bullets that are out of bounds
            if (bullet.y < 0) {
                removeIndices.push(i);
            }
        })

        removeIndices.sort((a, b) => b - a); // Sort indices in descending order
        
        removeIndices.forEach(elem => {
            bullets.splice(elem, 1); // Remove each necessary bullet
        })
    }

    // Function to check if centipede head collides with objects in provided list
    function checkObjectCollisionCentipede(centipede, list) {
        var collision = false;

        list.forEach(segment =>  {
            switch(centipede.direction) {
                case RIGHT:
                    if(centipede.body[0].x + segmentSize == segment.x && centipede.body[0].y == segment.y) {
                        collision = true;
                        return;
                    }
                    break;
                case LEFT:
                    if(centipede.body[0].x - segmentSize == segment.x && centipede.body[0].y == segment.y) {
                        collision = true;
                        return;
                    }
                    break;
            }
        });

        return collision;
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

    // Function to check top ship boundary
    function checkShipBoundary(list, dir) {
        var collision = false;

        list.forEach(element => {
            if(dir == UP) {
                if(element.y <= canvas.height / 2) {
                    collision = true;
                }
            }

            if(collision) {
                return collision;
            }
        })

        return collision;
    }


    // Function that adds health to objects in a list
    function addHealthToObjects(list, health) {
        list.forEach(elem => {
            elem.health = health;
        })
    }

    // Function to damage centipede based on the body index that was shot
    function damageCentipede(centipedeIndex, bodyIndex) {
        if (bodyIndex == 0) {
            centipedes[centipedeIndex].body.shift(); // Remove first element of body
        }
        else if (bodyIndex == centipedes[centipedeIndex].body.length - 1) {
            centipedes[centipedeIndex].body.pop(); // Remove last element of body
        }
        else { // Split centipede body
            obstacles.push({x:centipedes[centipedeIndex].body[bodyIndex].x, y:centipedes[centipedeIndex].body[bodyIndex].y, health:5});
            var centipede1 = centipedes[centipedeIndex].body.slice(0, bodyIndex);
            var centipede2 = centipedes[centipedeIndex].body.slice(bodyIndex + 1);
            centipedes[centipedeIndex].body = centipede1;
            centipedes.push({body:centipede2, direction:centipedes[centipedeIndex].direction, collisionDirection: centipedes[centipedeIndex].collisionDirection});
        }

        // Update score
        userScore += centipedeSegmentPoints;
        $("#score").text(userScore);
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
        
        // Change color palette
        centipedeColor = levels[level % levels.length].centipedeColor;
        obstacleColor = levels[level % levels.length].obstacleColor;
        fleaColor = levels[level % levels.length].fleaColor;
        scorpionColor = levels[level % levels.length].scorpionColor;
        spiderColor = levels[level % levels.length].spiderColor;

        // Change enemy movement speeds
        enemyMovementDelay = levels[level % levels.length].enemyMovementDelay;
        clearInterval(enemyMovementInterval);
        enemyMovementInterval = setInterval(enemyLoop, enemyMovementDelay);

        // Spawn centipede and obstacles
        spawnCentipede(10);
        for(let num = 0; num < Math.min(maxObstacles - obstacles.length, levelObstacles); num++) {
            spawnObstacle();
        }
        addHealthToObjects(obstacles, obstacleHealth);

        // Update level text
        $("#level").text(level+1);
    }

    // Function to randomly generate an x or y coordinate from a coordinate list
    function generateCoordinate(coordinateList, dir) {
        var locationIndex = Math.floor(Math.random() * coordinateList.length);

        if(dir == "x") {
            return coordinateList[locationIndex].x
        }
        else if(dir == "y") {
            return coordinateList[locationIndex].y
        }
    }

    // Function to filter out locations taken by objects in the list
    function filterLocations(filteredLocations, filterList) {;
        filterList.forEach(filterItem => {
            filteredLocations = filteredLocations.filter(filterLocation => (filterItem.x !== filterLocation.x) || (filterItem.y !== filterLocation.y))
        })
        
        return filteredLocations;
    }

    // Function to filter out screen segment locations outside of start and stop
    function filterScreenSegments(dir, start, stop) {
        var filteredLocationPairs = [...locationPairs]; // Cloned location pairs array

        if(dir == "x") {
            filteredLocationPairs = filteredLocationPairs.filter(pair => (pair.x >= start && pair.x <= stop));
        }
        else if(dir == "y") {
            filteredLocationPairs = filteredLocationPairs.filter(pair => (pair.y >= start && pair.y <= stop));
        }

        return filteredLocationPairs;
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
        localStorage.setItem("CENTIPEDE_HIGH_SCORES", JSON.stringify(highScores));
    }

    // Function that runs when game is over
    function gameOver() {
        // End game
        clearInterval(enemyMovementInterval);
        clearInterval(shipMovementInterval);
        clearInterval(bulletMovementInterval);
        clearInterval(canvasUpdateInterval);
        clearInterval(timer_s);
        clearInterval(autoFireInterval);

        compareScores();
        
        // Reset user score
        userScore = 0;

        // Show menu displays
        $("#selectionMenu").css("display", "block");
        $("#gameOverScreen").css("display", "block");
        $("#highScores").css("display", "block");
    }
})