var vars = {
    DEBUG: true,

    version: 0.91,

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
            load: ()=> {
                /*
				scene.load.audio('pieceDrop', 'audio/pieceDrop.ogg');
				*/
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
                'pixelwhite': '[a][b]P4DwABAQEANl9ngA[c]'
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

        loadAssets: ()=> {
            let scene = vars.getScene();
            scene.load.setPath('assets');

            let fV = vars.files;
            fV.images.init(scene);
            fV.plugins.load(scene);
            /*
			fV.audio.load();
			*/
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
        getCurrentPlayer: (_returnClass=true)=> {
            if (!_returnClass) return vars.App.Board.currentPlayer;
            return vars.App.Board.players[vars.App.Board.currentPlayer];
        },
        getPlayerByID: (_id)=> {
            return vars.App.Board.players[_id];
        },
        init: ()=> {
            // generate the UI
            vars.UI.init();
            // generate the table etc
            vars.App.initTable();
        },

        initTable: ()=> {
            vars.App.Board = new Board();
        },

        start: ()=> {
            // create the new players
            let b = vars.App.Board;
            b.currentPlayer = null; // not really necessary, but Im keeping it
            b.initSolutions();
            b.initPlayers();
            b.setWins(); // push the wins back into the players
            b.nextState()
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
            scene.sound.play(_key);
        },
    },

    camera: {
        mainCam: null,

        init: ()=> {
            vars.camera.mainCam = scene.cameras.main;
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
                    };
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

    UI: {
        init: function() {
            
        }
    }
}