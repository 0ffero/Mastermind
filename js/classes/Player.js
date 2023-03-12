"use strict"
let Player = class {
    constructor(_id) {
        if (_id!==1 && _id!==2) return `Invalid player id: ${_id}`;
        
        let scene = vars.getScene();
        let cC = consts.canvas;
        this.id = _id;

        this.wins = 0;

        this.groups = { setters: scene.add.group() };

        this.padding = { left: 45, p1: 30, p2: 965, top: 150, spacing: 15 };

        this.initPositions();
        this.initChooser();

        if (!vars.App.singlePlayer) { // the setter is only needed for 2 player games
            this.initSetter(scene,cC);
        };
        this.initMarbles(scene);
        this.initNameplate(scene, cC);
        this.initWinCount(scene,cC);
        this.initWinMessage(scene,cC);
    }

    initPositions() {
        let scene = vars.getScene();
        let depths = consts.depths;
        let pads = this.padding;

        this.setters = [];
        this.positionVisible = -1;

        let x = pads[`p${this.id}`] + pads.left;
        let y = pads.top;

        let w = 0;
        let delay = 1000; let delayDelta = 100;
        this.guessArray = [];
        this.guessContainers = [];
        this.pinContainers = [];
        for (let pos=0; pos<10; pos++) {
            let set = scene.add.image(x,y, 'boardAndPieces', 'set').setOrigin(0).setAlpha(1);
            this.setters.push(set);
            this.guessArray.push([]);
            this.guessContainers.push(scene.add.container().setDepth(depths.marbleMoving));
            this.pinContainers.push(scene.add.container().setDepth(depths.solutionPins));
            this.addFadeOutTo(scene,set,delay);
            delay+=delayDelta;
            !w && (w=set.width);
            x += w+pads.spacing;
        };

        this.startDelay = delay;
    }

    initChooser() {
        let cC = consts.canvas;
        let scene = vars.getScene();

        let s = this.padding.spacing;
        let x = this.id===1 ? cC.width*0.25+s : cC.width*0.75-s;
        let y = cC.height * 0.8;

        this.chooser = scene.add.image(x, y, 'boardAndPieces', 'chooser');
    }

    initMarbles(scene) {
        let leftOffset=60; let xDelta=80;
        let mC = this.marbleColours = consts.marbleColours;
        let xy = this.chooser.getLeftCenter();

        let x = xy.x+leftOffset;

        this.marbles = [];
        mC.forEach((_c,_i)=> {
            let name = `p${this.id}_chooser_marble_${_c}_position_${_i}`;
            let marble = scene.add.image(x, xy.y+7, 'boardAndPieces', `marble${_c}`).setName(name).setInteractive();
            this.addShakeToObject(marble);
            marble.vars = { position: _i, colour: _c };
            this.marbles.push(marble);
            x+=xDelta;
        });
    }

    initNameplate(scene, cC) {
        let font = vars.fonts.large;
        let x = this.chooser.x;
        let y = cC.height * 0.075;
        this.nameplate = scene.add.text(x, y, `PLAYER ${this.id}`, font).setOrigin(0.5);
    }

    initSetter(scene,cC) {
        let pID = this.id;
        let x = this.chooser.x;
        let y = cC.height * 0.9;

        pID===1 && (vars.input.enabled = false);

        let setter = this.setter = scene.add.image(x, y, 'boardAndPieces', 'setter').setAlpha(0);
        this.groups.setters.add(setter);

        let endY = cC.cY;
        setter.tween = scene.tweens.add({
            targets: setter, alpha: 1, duration: 500, delay: this.startDelay*1.5, y: endY, ease: 'Quad.easeOut',
            onStart: ()=> {
                pID===1 && vars.audio.playSound('woodSlide');
            },
            onComplete: ()=> {
                if (pID===1) return;
                vars.input.enabled = true;
            }
        });
    }

    initWinCount(scene, cC) {
        let x = this.chooser.getCenter().x;
        let font = { ...vars.fonts.large };
        let wC = this.winCountText = scene.add.text(x, cC.height*0.9, 'WINS: 0', font).setOrigin(0.5);
    }

    initWinMessage(scene,cC) {
        let centre = this.nameplate.getCenter();

        let wM = this.winMessage = scene.add.image(centre.x, cC.cY, 'ui', 'solution').setDepth(consts.depths.winMessage).setAlpha(0);
        wM.show = ()=> {
            wM.tween = scene.tweens.add({
                targets: wM, alpha: 1, duration: 1000
            });
        }
    }

    addFadeOutTo(_scene, _eL, _delay=0) {
        _eL.tween = _scene.tweens.add({
            targets: _eL, duration: 500, delay: _delay, alpha: 0,
            onComplete: ()=> { delete(_eL.tween); }
        });
    }

    addGuess(_int) {
        let position = this.positionVisible;
        let guessArray = this.guessArray[position];
        if (guessArray.length===4) return 'full'; // all places are taken, ignore the request

        // add the guess to the array
        guessArray.push(_int);

        return guessArray.length-1;
    }

    addShakeToObject(_object) {
        _object.shake = vars.getScene().plugins.get('rexshakepositionplugin').add(_object, { axis: 1 });
    }

    // a chooser marble was clicked
    clickChooser(_object) {
        vars.input.enabled = false;
        let _int = _object.vars.position;

        let state = vars.App.Board.state;

        switch (state) {
            case 'setting':
                let index = vars.App.Board.addToSolution(_int);
                let dupe = this.duplicateMarble(index, _object);
                this.groups.setters.add(dupe);
                this.sendMarbleToSetter(index, dupe);
                return;
            break;

            case 'playing':
                let guessInt = _object.vars.position;
                // add the guess
                let position = this.addGuess(guessInt);
                if (position==='full') { this.shakeObject(_object); return; }; // we could shake the object that was clicked on

                if (!position) { this.showButtons(true,'clear'); }; // first marble, show the clear button

                let marbleDupe = this.duplicateMarble(null, _object); // the index isnt used unless init
                this.guessContainers[this.positionVisible].add(marbleDupe);
                this.sendMarbleToPosition(marbleDupe,position); // send dupe marble to position

                if (position!==3) return;
                
                // no more marbles can be added, show the check button
                this.showButtons(true, 'check');
            break;

            case 'win': return; // all clicks on setter after the game has been won will be ignored
        }

    }

    destroy() {
        this.setters.forEach((_s)=> {
            _s.destroy();
        });
        delete(this.setters);

        this.pinContainers.forEach((_pC)=> {
            _pC.removeAll(true);
            _pC.destroy();
        });
        delete(this.pinContainers);

        this.guessContainers.forEach((_gC)=> {
            _gC.removeAll(true);
            _gC.destroy();
        });
        delete(this.guessContainers);

        this.marbles.forEach((_m)=> {
            _m.destroy();
        });
        delete(this.marbles);

        // destroy individual bits and pieces
        this.chooser.destroy();         delete(this.chooser);
        this.nameplate.destroy();       delete(this.nameplate);
        if (this.setter) {
            this.setter.destroy();
            delete(this.setter);
        };
        this.winCountText.destroy();    delete(this.winCountText);
        this.winMessage.destroy();      delete(this.winMessage);

        for (let g in this.groups) {
            this.groups[g].destroy(true);
            this.groups[g]=null;
        };
        delete(this.groups);
    }

    duplicateMarble(_index, _object) {
        // duplicate the marble and send it the the setter
        let scene = vars.getScene();
        let colour = _object.vars.colour;
        
        // let position = _object.vars.position; // no longer needed
        let xy = { x: _object.x, y: _object.y };

        let marbleDupe = scene.add.image(xy.x, xy.y, 'boardAndPieces', `marble${colour}`);
        
        return marbleDupe;
    }

    incrementWins() {
        this.wins++;

        this.updateWinsText();
    }

    sendMarbleToPosition(marbleDupe,position) {
        // where are we sending it to?
        let xy = this.setters[this.positionVisible].getTopCenter();

        let top = 80;
        let yDelta = 80;
        let yOffset = position * yDelta;
        // send it on its way
        vars.getScene().tweens.add({
            targets: marbleDupe, x: xy.x+5, y: xy.y+top+yOffset, duration: 333,
            onComplete: ()=> { vars.input.enabled=true; }
        });
    }

    sendMarbleToSetter(_index, _object) {
        let scene = vars.getScene();

        let lC = this.setter.getLeftCenter();
        let left = 70; let xDelta = 80;
        let pID = this.id;

        let sendTo = lC.x + xDelta*_index + left;
        let g = this.groups;
        _object.tween = scene.tweens.add({ targets: _object, x: sendTo, y: lC.y+7, duration: 250, ease: 'Quad.easeOut',
            onComplete: ()=> {
                vars.input.enabled = true;

                if (_index===3) { // last marble, hide the setter group
                    let gC = g.setters.getChildren();
                    scene.tweens.add({
                        targets: gC, alpha: 0, duration: 500,
                        onComplete: ()=> {
                            vars.App.Board.players[pID].showNextSet();
                        }
                    });
                };
            }
        });
    }

    shakeObject(_object) {
        let duration = 333;
        _object.shake.shake(duration);
        vars.getScene().tweens.addCounter({
            from: 0, to: 1, duration: duration,
            onComplete: ()=> {
                vars.input.enabled=true;
            }
        });
    }

    showButtons(_show, _which) {
        vars.App.Board.showButtons(_show,_which);
    }

    showNextSet() {
        this.updatePositionVisible();

        let scene = vars.getScene();
        let s = this.setters[this.positionVisible];

        scene.tweens.add({ targets: s, alpha: 1, duration: 500, ease: 'Quad.easeOut' });
    }

    updatePositionVisible() {
        this.positionVisible++;
    }

    updateWinsText() {

    }
};