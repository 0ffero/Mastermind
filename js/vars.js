var vars = {
    DEBUG: true,

    version: 0.98,

    getScene: ()=> {
        return vars.Phaser.scene;
    },

    init: function() {
        // INITIALISING CODE GOES IN HERE

        // Load everything
        vars.files.loadAssets();

        // Initialise input
        vars.input.init();
    },

    files: {
        audio: {
            load: (scene)=> {
                ['buttonClick','woodSlide'].forEach((_a)=> {
                    scene.load.audio(_a, `audio/${_a}.ogg`);
                });
            }
        },

        images: {
            available: [],
            header: 'data:image/png;base64,',
            preA: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCA',
            preB: 'AAAAA6fptV[d]QIHW',
            postC: 'AAAABJRU5ErkJggg==',
            postD: 'AAAACklEQV',
            postE: 'IAAACQd1Pe',
            base64s: {
                'pixelblack': '[a][e][d]R4AWMAAgAABAABsYaQRA[c]',
                'pixelwhite': '[a][b]P4DwABAQEANl9ngA[c]',
                'pixelbg': '[a][e]AAAADElEQVR42mNgMHAAAACkAHFzb6itAAAAAElFTkSuQmCC'
            },

            init: (_scene)=> {
                let fIV = vars.files.images;
                let scene = _scene;
                
                let base64s = fIV.base64s;
                let header = fIV.header;
                let preA = fIV.preA;
                let preB = fIV.preB;
                let postC = fIV.postC;
                let postD = fIV.postD;
                let postE = fIV.postE;
                for (let b in base64s) {
                    let b64 = header + base64s[b];
                    let newb64 = b64.replace('[a]', preA).replace('[b]',preB).replace('[c]',postC).replace('[d]',postD).replace('[e]',postE);
                    scene.textures.addBase64(b, newb64);
                    fIV.available.push(b);
                };

                fIV.load(_scene);
            },
            load: (scene)=> {
                ['boardAndPieces','ui'].forEach((_a)=> {
                    scene.load.atlas(_a, `images/${_a}.png`, `images/${_a}.json`);
                });
            }
        },

        plugins: {
            load: (scene)=> {
                scene.load.plugin('rexshakepositionplugin', 'plugins/rexshakepositionplugin.min.js', true);
            }
        },

        shaders: {
            load: (scene)=> {
                scene.load.glsl('heavenlyCircles', `shaders/heavenlyCircles.frag`);
            }
        },

        loadAssets: ()=> {
            let scene = vars.getScene();
            scene.load.setPath('assets');

            let fV = vars.files;
			fV.audio.load(scene);
            fV.images.init(scene);
            fV.plugins.load(scene);
            fV.shaders.load(scene);
        }
    },

    fonts: {
        small: { fontFamily: 'Consolas', fontSize: '20px', color: '#ffffff', stroke: '#111111', strokeThickness: 2, align: 'center', lineSpacing: 2 },
        large: { fontFamily: 'Consolas', fontSize: '42px', color: '#ffffff', stroke: '#111111', strokeThickness: 3, align: 'center', lineSpacing: 10 }
    },

    localStorage: {
        init: ()=> {
            let lS = window.localStorage;
            // LOAD THE VARIABLES
        }
    },

    // APP
    App: {
        Board: null,
        singlePlayer: false,
        getCurrentPlayer: (_returnClass=true)=> {
            if (!_returnClass) return vars.App.Board.currentPlayer;
            return vars.App.Board.players[vars.App.Board.currentPlayer];
        },
        getPlayerByID: (_id)=> {
            return vars.App.Board.players[_id];
        },
        init: ()=> {
            vars.camera.init();
            // generate the UI
            vars.shaders.init();
            vars.UI.init();
        },

        initTable: ()=> {
            vars.App.Board = new Board();
        },

        // if single player, this generates the random solution for player 1
        CPUGenerateRandomSolution: ()=> {
            let b = vars.App.Board;
            b.generateRandomSolution();
        },

        generateTable: ()=> {
            // generate the table etc
            vars.App.initTable();
        },

        hideSelectionScreen: ()=> {
            let scene = vars.getScene();
            let sS = vars.UI.containers.selectionScreen;
            let lS = vars.loadingScreen;

            vars.input.enabled = false;

            vars.UI.destroyBouncingBalls();
            vars.shaders.destroy();

            scene.tweens.add({ targets: [sS,lS], alpha: 0, duration: 750 });
        },

        start: ()=> {
            // create the new players
            let b = vars.App.Board;
            b.currentPlayer = null; // not really necessary, but Im keeping it
            b.initSolutions();
            b.initPlayers();
            b.setWins(); // push the wins back into the players
            b.nextState();

            b.singlePlayer && vars.App.CPUGenerateRandomSolution();
        }
    },

    animate: {
        init: function() {
            
        },
    },

    audio: {
        init: function() {
            scene.sound.volume=0.2;
        },

        playSound: function(_key) {
            vars.getScene().sound.play(_key);
        },
    },

    camera: {
        mainCam: null,

        init: ()=> {
            vars.camera.mainCam = vars.getScene().cameras.main;
        },

        shake: ()=> {
            vars.camera.mainCam.shake(50);
        }
    },

    input: {
        dragging: null,
        enabled: false,

        init: ()=> {
            vars.input.initClickables();

            vars.input.initDrags();
        },

        initClickables: ()=> {
            let scene = vars.getScene();

            scene.input.on('gameobjectdown', (pointer, gameObject)=> {
                if (!vars.input.enabled) return;

                // click functions
                if (!gameObject) return;
                
                let name = gameObject.name;
                let board = vars.App.Board;
                
                if (name.includes('chooser_marble')) {
                    let cP = board.currentPlayer;
                    if (!name.startsWith(`p${cP}`)) return false; // its not this players shot

                    board.players[cP].clickChooser(gameObject);
                    return;
                };

                if (name.startsWith('button_')) {
                    let button = name.replace('button_','');
                    switch (button) {
                        case 'singlePlayer':
                            vars.App.singlePlayer=true;
                            vars.App.hideSelectionScreen();
                            vars.App.generateTable();
                        break;

                        case 'twoPlayer':
                            vars.App.singlePlayer=false;
                            vars.App.hideSelectionScreen();
                            vars.App.generateTable();
                        break;

                        case 'manual':
                            vars.UI.containers.manual.show();
                        break;

                        case 'check':
                            board.checkGuess();
                        break;

                        case 'clear':
                            board.clearGuess();
                        break;

                        case 'closeWarning':
                            board.containers.warning.hide();
                        break;

                        case 'newGame':
                            board.restart();
                        break;

                        default: return; break;
                    };
                    vars.audio.playSound('buttonClick')
                    return;
                };
            })

            scene.input.on('gameobjectover', (pointer, gameObject)=> {
                // over functions
            });

            scene.input.on('gameobjectout', (pointer, gameObject)=> {
                // out functions
            });
        },

        initDrags: ()=> {
            let scene = vars.getScene();

            scene.input.on('dragstart', (pointer, gameObject)=> {
                if (!gameObject.draggable) return false;
                debugger;
                let oName = gameObject.name;

                vars.input.dragging = oName;
            });

            scene.input.on('drag', (pointer, gameObject, dragX, dragY)=> {
                let oName = gameObject.name;

            });

            scene.input.on('dragend', function (pointer, gameObject, dragX, dragY) {
                let oName = gameObject.name;

                vars.input.dragging = null;
            });
        }
    },

    particles: {
        init: ()=> {
            // particles are stored here
        }
    },

    Phaser: {
        objects: {},
        game: null,
        scene: null
    },

    shaders: {
        bgShader: null,
        shaderImage: null,

        init: ()=> {
            let scene = vars.getScene();
            let cC = consts.canvas;
            let sV = vars.shaders;

            let sC = consts.shader;

            let shaderName = 'heavenlyCircles';
            let bgShader = sV.bgShader = scene.add.shader(shaderName, cC.cX, cC.cY, sC.width,sC.height);
            bgShader.setRenderToTexture(shaderName);
            
        },

        destroy: ()=> {
            let sV = vars.shaders;
            sV.shaderImage.tween && (sV.shaderImage.tween.remove(), delete(sV.shaderImage.tween));
            sV.shaderImage.destroy();
            sV.shaderImage=null;
        },
        
        generate: ()=> {
            let scene = vars.getScene();
            let cC = consts.canvas;
            let sV = vars.shaders;

            let scale = cC.width/consts.shader.width;
            sV.shaderImage = scene.add.image(cC.cX, cC.cY, 'heavenlyCircles').setScale(scale).setDepth(consts.depths.loadingScreen+1).setBlendMode(3).setAlpha(0);
            sV.shaderImage.tween = scene.tweens.add({ targets: sV.shaderImage, alpha: 1, duration: 5000, onComplete: ()=> { delete(sV.shaderImage.tween); }})
        }
    },

    UI: {
        containers: { bouncingBalls: null, manual: null, selectionScreen: null },
        marbleColours: ['White','Yellow','Orange','Red','Blue','Green'],

        init: ()=> {
            let UI = vars.UI;
            let scene = vars.getScene();
            let cC = consts.canvas;
            UI.generateSelectionScreen(scene, cC);
            UI.generateManual(scene, cC);
            UI.initBackgroundShader();
        },
        
        initBackgroundShader: ()=> {
            vars.shaders.generate();
        },

        initLoadingScreen: ()=> {
            let scene = vars.getScene();
            let cC = consts.canvas;
            let depth = consts.depths.loadingScreen;

            let lS = vars.loadingScreen = scene.add.container().setAlpha(0).setDepth(depth);

            let bg = scene.add.image(cC.cX, cC.cY, 'loadingScreenPixel').setScale(cC.width, cC.height);
            lS.add(bg);

            let lsImage = scene.add.image(cC.width*0.025,cC.height*0.05,'loadingScreen','mastermindLogo').setOrigin(0).setName('lsImage');
            lS.add(lsImage);

            let offer0 = scene.add.image(cC.width*0.975,cC.height*0.975,'loadingScreen','offer0').setOrigin(1).setName('logo');
            lS.add(offer0);

            scene.add.text(cC.cX, cC.height-5, `Version: ${vars.version}`, vars.fonts.small).setOrigin(0.5,1).setDepth(depth);

            scene.tweens.add({ targets: lS, alpha: 1, duration: 750, ease: 'Quad.easeOut' });
        },

        destroyBouncingBalls: ()=> {
            let kids = vars.UI.containers.bouncingBalls.getAll();
            kids.forEach((_k)=> {
                _k.tween && _k.tween.remove();
                _k.destroy();
            });
        },

        generateManual: (scene, cC)=> {
            let containers = vars.UI.containers;
            let c = containers.manual = scene.add.container().setDepth(consts.depths.manual).setAlpha(0);

            let bg = scene.add.image(cC.cX, cC.cY, 'pixelblack').setScale(cC.width, cC.height).setAlpha(0.33).setInteractive();
            bg.on('pointerdown', ()=> {
                c.show(false);
            });
            c.add(bg);

            let manual = scene.add.image(cC.cX, cC.cY, 'ui', 'manual');
            c.add(manual);

            c.show = (_show=true)=> {
                vars.input.enabled=false;
                let alpha = _show ? 1 : 0;
                scene.tweens.add({
                    targets: c, alpha: alpha, duration: 500,
                    onComplete: ()=> { vars.input.enabled=true; }
                });
            }
        },

        generateSelectionScreen: (scene, cC)=> {
            let containers = vars.UI.containers;
            let c = containers.selectionScreen = scene.add.container().setDepth(consts.depths.selectionScreen).setAlpha(0);

            // single player button
            let y = cC.height * 0.4;
            let sPB = scene.add.image(cC.cX, y, 'ui', 'singlePlayerButton').setName('button_singlePlayer').setInteractive();
            c.add(sPB);

            // two player button
            y = cC.height * 0.5;
            let tPB = scene.add.image(cC.cX, y, 'ui', 'twoPlayerButton').setName('button_twoPlayer').setInteractive();
            c.add(tPB);

            // two player button
            y = cC.height * 0.75;
            let mB = scene.add.image(cC.cX, y, 'ui', 'manualButton').setName('button_manual').setInteractive();
            c.add(mB);


            // show function
            c.show = ()=> {
                vars.input.enabled=false;
                scene.tweens.add({
                    targets: c, alpha: 1, duration: 750, ease: 'Quad.easeIn',
                    onComplete: ()=> { vars.input.enabled=true; vars.UI.startBouncingBalls(); }
                });
            };
        },

        newBouncingMarble: (delay)=> {
            if (vars.UI.containers.selectionScreen.alpha!==1) return;

            let UI = vars.UI;
            let c = UI.containers;
            let scene = vars.getScene();


            let container = c.bouncingBalls;

            // get random marble
            let colours = UI.marbleColours;
            let marbleColour = getRandom(colours);

            // get random position
            let p = getRandom(consts.marblesBounceAreas);
            let x = getRandom(p.xMin, p.xMax);
            let y = getRandom(p.yMin, p.yMax);

            let marble = scene.add.image(x,y,'boardAndPieces',`marble${marbleColour}`).setScale(4).setAlpha(0);
            container.add(marble);

            marble.tween = scene.tweens.add({
                targets: marble, scale: 1, delay: delay, duration: 2500, ease: 'Bounce.easeOut',
                onStart: ()=> {
                    marble && marble.setAlpha(1);
                },
                onComplete: ()=> {
                    marble.tween = scene.tweens.add({
                        targets: marble, alpha: 0, delay: 1000, duration: 500,
                        onComplete: ()=> {
                            marble && marble.destroy();
                        }
                    });
                    UI.newBouncingMarble(0);
                }
            });
        },

        startBouncingBalls() {
            vars.UI.containers.bouncingBalls = vars.getScene().add.container().setDepth(consts.depths.selectionScreen);
            
            let dDelta = 1000;
            for (let m=0; m<3; m++) {
                let delay = dDelta*m;
                vars.UI.newBouncingMarble(delay);
            };
        }
    }
}