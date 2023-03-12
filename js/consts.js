"use strict"
const consts = {
    appName: 'Mastermind',
    canvas: { width: 1920, height: 1080, cX: 1920/2, cY: 1080/2, colour: 0x281407 },

    depths: {
        game:               5,
        buttons:            10,
        solutionPins:       15,
        marbleMoving:       20,
        winMessage:         25,
        warningContainer:   30,
        singlePlayerPopup:  30,
        winContainer:       35,
        singlePlayerSetter: 40,
        loadingScreen:      100,
        selectionScreen:    105,
        manual:             110
    },

    marblesBounceAreas: [
        { xMin: 110, xMax: 110+520, yMin: 480, yMax: 480+500 },
        { xMin: 1290, xMax: 1290+520, yMin: 90, yMax: 90+720 }
    ],

    marbleColours: ['White','Yellow','Orange','Red','Blue','Green'],

    mouse: {
        buttons: {
            LEFT        : 0,
            MIDDLE      : 1,
            RIGHT       : 2,
            THUMB_1     : 3,
            THUMB_2     : 4
        },
        buttonNames: {
            0           : 'LEFT',
            1           : 'MIDDLE',
            2           : 'RIGHT',
            3           : 'THUMB_1',
            4           : 'THUMB_2'
        }
    }
};