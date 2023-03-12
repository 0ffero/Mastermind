"use strict"
let Board = class {
    constructor() {
        this.scene = vars.getScene();
        this.cC = consts.canvas;
        this.currentPlayer = null; // initialised in initPlayers

        this.singlePlayer = vars.App.singlePlayer;

        this.init();
    }

    init() {
        this.state = 'setting';

        // states are
        // setting: before the game starts the players have to set the code for the other player
        // playing: both players have set their codes and the game is running
        // win: one of the players have won
        this.states = ['playing','win'];

        this.containers = { buttons: null, singlePlayerPopup: null, solution: null, warning: null, win: null };

        let cC = this.cC;
        let scene = this.scene;

        let texture = 'boardAndPieces';

        this.table = scene.add.image(cC.cX+15, cC.cY, texture,'board');

        this.initSolutions();

        this.initButtons(scene, texture);

        // generate the win container
        this.initWinScreen(scene,cC);

        // same for the warning screen
        this.initWarningScreen(scene, cC);

        if (this.singlePlayer) {
            this.containers.solution = scene.add.container().setDepth(consts.depths.singlePlayerSetter);
            this.initSinglePlayerPopup(scene,cC);
            let delay = this.singlePlayerHideBoard2();
            scene.tweens.addCounter({
                from: 0, to: 1, duration: delay,
                onComplete: ()=> {
                    this.initPlayers();
                    this.generateRandomSolution();
                }
            });
        } else {
            this.initPlayers();
            this.initSetCodeText(scene,cC);
        };

    }

    initButtons(scene, texture) {
        let c = this.containers;
        let bC = c.buttons = scene.add.container();
        bC.setDepth(consts.depths.buttons);
        bC.y = 505;

        this.buttons = { check: null, clear: null };
        ['clear','check'].forEach((_bName, _i)=> {
            let button = scene.add.image(0, 190*_i, texture, `button${_bName.capitalise()}`).setName(`button_${_bName}`).setOrigin(0).setInteractive();
            this.buttons[_bName] = button;
            bC.add(button);
        });
        this.showButtons(false, 'ALL');
    }

    initPlayers() {
        this.players = { 1: null, 2: null };

        let pS = !this.singlePlayer ? [1,2] : [1]; // the default
        pS.forEach((_pID)=> {
            this.players[_pID] = new Player(_pID);
        });

        this.winRequired = false;
        this.currentPlayer = 1;
    }

    initSetCodeText(scene,cC) {
        let text = `Player 1.\nSet the code for your opponent.`;
        let font = vars.fonts.large;
        let sCT = this.setCodeText = scene.add.text(cC.width*0.25, cC.height*0.35, text, font).setOrigin(0.5).setAlpha(0);

        sCT.show = (_show=true)=> {
            let alpha = _show ? 1 : 0;
            scene.tweens.add({ targets: sCT, alpha: alpha, duration: 500,
                onComplete: ()=> {
                    if (alpha) return;
                    sCT.setPosition(cC.width*0.25, sCT.y);
                    let rText = text;
                    sCT.setText(rText);
                } 
            });
        };

        sCT.moveToP2Position =()=> {
            let rText = text.replace('1','2');
            sCT.setText(rText);
            scene.tweens.add({ targets: sCT, x: cC.width*0.75, duration: 500, ease: 'Quad.easeInOut' })
        };
    }

    initSinglePlayerPopup(scene, cC) {
        let sPP = this.containers.singlePlayerPopup = scene.add.container();
        sPP.setDepth(consts.depths.singlePlayerPopup).setAlpha(0);

        let blackbg = scene.add.image(cC.cX, cC.cY, 'pixelwhite').setTint(consts.canvas.colour).setScale(cC.width, cC.height).setAlpha(0.5).setInteractive();
        sPP.add(blackbg);

        let warning = scene.add.image(cC.cX, cC.height*0.5, 'ui', 'generatingCode');
        sPP.add(warning);
        sPP.x-=cC.cX/2;

        sPP.show = ()=> {
            scene.tweens.add({
                targets: sPP, alpha: 1, duration: 500, hold: 1500, yoyo: true,
                onComplete: ()=> {
                    // start the game (allow interaction etc)
                    this.nextState();
                    // show the first position
                    this.players[1].showNextSet();
                    vars.input.enabled = true;
                }
            });
        };
    }

    initSolutions() {
        this.solutions = { 1: [], 2: [] };
    }

    initWarningScreen(scene, cC) {
        let wC = this.containers.warning = scene.add.container();
        wC.setDepth(consts.depths.warningContainer).setAlpha(0);

        let blackbg = scene.add.image(cC.cX, cC.cY, 'pixelblack').setScale(cC.width, cC.height).setAlpha(0.7).setInteractive();
        wC.add(blackbg);

        let warning = scene.add.image(cC.cX, cC.height*0.5, 'ui', 'warning');
        wC.add(warning);

        let okButton = scene.add.image(cC.cX, cC.height*0.725, 'ui', 'okButton').setName('button_closeWarning').setAlpha(0).setInteractive();
        wC.add(okButton);

        wC.show = ()=> {
            scene.tweens.add({
                targets: wC, alpha: 1, duration: 750,
                onComplete: ()=> {
                    scene.tweens.add({
                        targets: okButton, alpha: 1, duration: 500
                    });
                }
            });
        };

        wC.hide = ()=> {
            okButton.setAlpha(0);
            scene.tweens.add({ targets: wC, alpha: 0, duration: 500 });
        };
    }

    initWinScreen(scene, cC) {
        let wC = this.containers.win = scene.add.container();
        wC.setDepth(consts.depths.winContainer).setAlpha(0);

        let blackbg = scene.add.image(cC.cX, cC.cY, 'pixelblack').setScale(cC.width, cC.height).setAlpha(0.7).setInteractive();
        wC.add(blackbg);

        let bg = scene.add.image(cC.cX, cC.height*0.4, 'ui', 'winBG');
        wC.add(bg);
        this.winScreenImages = [];
        [1,2,3,4].forEach((_pwin)=> {
            let frame = _pwin===3 ? 'draw' : _pwin===4 ? 'singlePlayerLose' : `p${_pwin}win`;
            let y = _pwin===4 ? cC.height*0.3 : cC.height*0.4;
            let pwin = scene.add.image(cC.cX, y, 'ui', frame).setVisible(false);
            this.winScreenImages.push(pwin);
            wC.add(pwin);
        });

        let newGameButton = this.newGameButton = scene.add.image(cC.cX, cC.height*0.8, 'ui', 'newGame').setName('button_newGame').setAlpha(0).setInteractive();
        wC.add(newGameButton);


        this.singlePlayer && (wC.x-=cC.cX/2);
    }

    addToSolution(_int) {
        let p = this.currentPlayer;
        let sol = this.solutions[p];
        sol.push(_int);

        if (sol.length!==4) return sol.length-1;

        // this player has added all numbers to the solution
        // get next player
        this.nextPlayer();

        if (this.currentPlayer===1) { // both players have set the solutions
            this.solutions = { 1: this.solutions[2], 2: this.solutions[1] }; // swap the solutions around
            this.nextState(); // update the state to playing
        };

        this.state==='playing' ? this.setCodeText.show(false) : this.setCodeText.moveToP2Position();

        return sol.length-1;
    }

    checkGuess() {
        vars.DEBUG && console.log(`%cChecking Guess`, 'font-weight: bold; color: green');

        // hide the buttons
        this.showButtons(false, 'ALL');

        let board = vars.App.Board;

        let pClass = vars.App.getCurrentPlayer();
        let pID = pClass.id;
        let guess = pClass.guessArray[pClass.positionVisible];

        let solution = board.solutions[pID];

        
        let inPlace=0;
        let counter = 0;
        // first, check for marbles in the right position
        let guessCopy = [...guess];
        let solutionCopy = [...solution];
        while(guessCopy.length) {
            let g = guessCopy.shift();
            let sol = solution[counter];
            if (g===sol) {
                inPlace++;
                // nullify the position
                solutionCopy[counter] = null;
                guess[counter]=null;
            };
            counter++;
        };
        vars.DEBUG && console.log(`inPlace: ${inPlace}`,`\nGuess`,guess, `\nSolution COPY`,solutionCopy);
        
        if (inPlace===4) { // this player has found a solution
            pClass.winMessage.show(); // show the win message
            if (pID===1) { // if this is player one, player two still has a shot, but they must crack the combination on their next attempt
                if (!this.singlePlayer) {
                    this.setWinRequired();
                    vars.DEBUG && console.log(`PLAYER 1 FOUND THEIR SOLUTION\n    Player 2 MUST find the solution this attempt!`);
                    this.nextPlayer();
                    return;
                };

                // show win message
                this.updateWinScreen(1);
                this.showWinScreen();
                return;
            };
            
            // player 2 has found the combination!
            let winImage;
            if (this.winRequired) { // draw! both player 1 and 2 completed on the same move
                vars.DEBUG && console.log(`GAME HAS ENDED IN A DRAW!`);
                winImage = 3;
            } else { // player 2 wins!
                winImage = 2;
            };

            this.updateWinScreen(winImage);
            this.showWinScreen();
            return;
        };

        if (this.winRequired) { // player 2 NEEDED a win, which they failed to do. PLAYER 1 wins
            this.updateWinScreen(1);
            this.showWinScreen();
            return;
        };
        
        // check for "in solution but in the wrong position"
        let outOfPlace=0;
        while (guess.length) {
            let g = guess.shift();
            if (g===null) continue;
            
            let selIndex = solutionCopy.findIndex(m=>m===g);
            selIndex>-1 && (outOfPlace++,solutionCopy[selIndex]=null); // found the guess in the solution
        };
        
        vars.DEBUG && console.log(`outOfPlace: ${outOfPlace}`, `\nSolution COPY`,solutionCopy);
        let sol = { inPlace: inPlace, outOfPlace: outOfPlace };
        this.generatePegs(pClass, sol);

        if ((pClass.positionVisible===10 && this.singlePlayer) || (pClass.positionVisible===10 && pClass.id===2)) {
            this.lose();
        };
        
        // after checking the guess, get the next player
        this.nextPlayer();
    }

    clearGuess() {
        let pClass = vars.App.getCurrentPlayer();

        // empty out the guess array
        let vis = pClass.positionVisible;
        pClass.guessArray[vis] = [];

        // destroy all the guess marbles
        this.players[pClass.id].guessContainers[vis].removeAll(true)

        // hide the clear button (and the check button if its visible)
        this.showButtons(false,'ALL');

    }

    destroyPlayers() {
        // back up the player scores
        this.scores = [];
        let players = !this.singlePlayer ? [1,2] : [1];
        players.forEach((_p)=> {
            this.scores.push(this.players[_p].wins);
            this.players[_p].destroy(); // destroy the player
            this.players[_p]=null;
        });
    }

    // after checking the solution, this places the pegs on the solution section of the board
    generatePegs(_pClass,_sol) {
        let scene = this.scene;
        let correctPosition = _sol.inPlace;
        let wrongPosition = _sol.outOfPlace;

        let vis = _pClass.positionVisible;

        let set = _pClass.setters[vis];
        let xy = set.getBottomLeft();

        let container = _pClass.pinContainers[vis];

        let delta = { x: 30, y: 30 };
        let counter = 0;

        // marbles in the CORRECT position
        for (let p=0; p<correctPosition; p++) {
            let xPos = counter%2*delta.x;
            let yPos = (counter/2|0)*delta.y;

            vars.DEBUG && console.log(`%cCorrect Position Pin xy: ${xPos},${yPos}`, 'color: green; font-weight: bold');

            let pin = scene.add.image(xPos,yPos,'boardAndPieces', 'rightColourRightPosition').setOrigin(0);
            pin.inPlace = true;
            container.add(pin);

            counter++;
        };

        // marbles in the WRONG position
        for (let p=0; p<wrongPosition; p++) {
            let xPos = counter%2*delta.x;
            let yPos = (counter/2|0)*delta.y;

            vars.DEBUG && console.log(`%cIncorrect Position Pin xy: ${xPos},${yPos}`, 'color: orange; font-weight: bold');

            let pin = scene.add.image(xPos,yPos,'boardAndPieces', 'rightColourWrongPosition').setOrigin(0);
            pin.inPlace = false;
            container.add(pin);

            counter++;
        };

        // move the container into position
        container.setPosition(xy.x+6, xy.y-122);

        // show the next setter
        _pClass.showNextSet();
    }

    generateRandomSolution() {
        // show pop up saying we're generating the random solution
        this.containers.singlePlayerPopup.show();
        
        // generate random solution
        let sol = [];
        for (let i=0; i<4; i++) {
            sol.push(getRandom(0,5));
        };

        vars.DEBUG && console.log('Solution:',sol);
        this.solutions[1] = sol;
    }

    generateSolution() {
        let colours = consts.marbleColours;
        let scene = this.scene;
        let cC = this.cC;
        // add "setter"
        let c = this.containers.solution;
        let setter = scene.add.image(cC.width*0.25, cC.height*0.55, 'boardAndPieces', 'setter');
        c.add(setter);
        let lC = setter.getLeftCenter();

        let left = 65;
        let xDelta = 80;
        let y = lC.y+5;
        this.solutions[1].forEach((_int,_i)=> {
            let frame = `marble${colours[_int]}`;
            let x = _i*xDelta + lC.x + left;
            let marble = scene.add.image(x, y, 'boardAndPieces', frame);
            c.add(marble);
        });

        c.empty = ()=> { c.removeAll(true); };
    }

    hideWinScreen() {
        let duration = 1000;
        let wS = this.containers.win;
        this.scene.tweens.add({
            targets: wS, alpha: 0, duration: duration
        });

        return duration;
    }

    lose() {
        let wS = 3; // default - draw (2 player)
        if (this.singlePlayer) { wS = 4; this.generateSolution(); }; // single player loss, generate solution
        this.updateWinScreen(wS);

        // show the win/lose screen
        this.showWinScreen();
    }

    moveButtonContainer() {
        let pClass = vars.App.getCurrentPlayer();

        let c = this.containers.buttons;

        //get the current visible position
        let setter = pClass.setters[pClass.positionVisible];
        c.x = setter.getTopLeft().x+5;
    }

    nextPlayer() {
        if (this.singlePlayer) return;

        this.currentPlayer = this.currentPlayer===1 ? 2: 1;

        vars.DEBUG && console.log(`Player ${this.currentPlayer} shot`);
    }

    nextState() {
        this.states.push(this.state);
        this.state = this.states.shift();

        vars.DEBUG && console.log(`State updated to ${this.state}`);
    }

    restart() {
        // empty out the single player solution if it exists
        (this.singlePlayer && this.containers.solution && this.containers.solution.empty) && this.containers.solution.empty();
        // hide the newGame button
        this.newGameButton.setAlpha(0);

        // backup the players scores and destroy
        this.destroyPlayers();

        // hide the win msg and screen
        let delay = this.hideWinScreen();

        this.scene.tweens.addCounter({
            from: 0, to: 1, duration: delay,
            onComplete: ()=> {
                vars.App.start();
            }
        });
    }

    setWinRequired() {
        this.winRequired = true;
        // show the win required for player 2
        this.containers.warning.show();
    }

    setWins() {
        this.scores.forEach((_s,_i)=> {
            this.players[_i+1].wins = _s;
            this.players[_i+1].updateWinsText();
        });
        delete(this.scores);
    }

    showButtons(_show=true, _which) {
        let b = _which!=='ALL' ? [this.buttons[_which]] : [this.buttons.clear,this.buttons.check];
        if (!b) return false;

        b.forEach((_b)=> { _b.setVisible(_show); });

        _show && this.moveButtonContainer();

        return true;
    }

    showWinScreen() {
        // hide the buttons
        this.showButtons(false, 'ALL');

        vars.input.enabled = false;
        let scene = this.scene;
        let c = this.containers.win;

        let nGB = this.newGameButton;

        c.tween = scene.tweens.add({
            targets: c, alpha: 1, duration: 1000,
            onComplete: ()=> { // show the win button
                scene.tweens.add({
                    targets: nGB, alpha: 1, duration: 500,
                    onComplete: ()=> {
                        vars.input.enabled = true;
                    }
                });
            }
        });
    }

    singlePlayerHideBoard2() {
        let scene = this.scene;
        let cC = this.cC;

        let leftCoverImage = this.leftCoverImage = scene.add.image(cC.width*0.75+15,cC.cY,'pixelwhite').setScale(cC.width/2, cC.height).setTint(cC.colour).setAlpha(0);

        let cam = vars.camera.mainCam
        let destX = -0.25*cC.width;

        let coverTime = 666;
        let camScrollDuration = 1500;

        scene.tweens.add({
            targets: leftCoverImage, alpha: 1, duration: coverTime,
            onComplete: ()=> {
                scene.tweens.add({
                    targets: cam, scrollX: destX, duration: camScrollDuration, ease: 'Quad.easeOut'
                });
            }
        });

        return coverTime + camScrollDuration;
    }

    updateWinScreen(_pID) { // pID = 1 or 2
        this.nextState(); // update the state to win

        let p = _pID-1; // but we need 0 or 1

        // first, hide ALL win images
        this.winScreenImages.forEach((_wS, _i)=> {
            _wS.setVisible(false);
        });

        // now make the winning players win image visible
        this.winScreenImages[p].setVisible(true);

        if (_pID===1 || _pID===2) {
            this.players[_pID].incrementWins();
        };
    }
};