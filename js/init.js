"use strict"
vars.DEBUG && console.log('Initialising...');

var config = {
    type: Phaser.WEBGL, title: consts.appName, banner: false, url: window.location.href,
    backgroundColor: consts.canvas.colour, disableContextMenu: true,
    height: consts.canvas.height, width: consts.canvas.width,
    fps: { target: 60 },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: consts.canvas.width, height: consts.canvas.height },
    scene: { preload: preload, create: create, update: update,
        pack: { files: [ { type: 'image', key: 'loadingScreen', url: 'loadingScreen.png'} ] }
    }
};

var game = vars.Phaser.game = new Phaser.Game(config);


/*
█████ ████  █████ █      ███  █████ ████  
█   █ █   █ █     █     █   █ █   █ █   █ 
█████ ████  ████  █     █   █ █████ █   █ 
█     █   █ █     █     █   █ █   █ █   █ 
█     █   █ █████ █████  ███  █   █ ████  
*/
function preload() {
    vars.Phaser.scene = this;
    let scene = vars.getScene();
    let cC = consts.canvas;
    let lS = vars.loadingScreen = scene.add.image(cC.cX,cC.cY,'loadingScreen').setAlpha(0).setDepth(consts.depths.loadingScreen);
    scene.tweens.add({
        targets: lS, alpha: 1, duration: 1000
    });
    vars.init();
}



/*
█████ ████  █████ █████ █████ █████ 
█     █   █ █     █   █   █   █     
█     ████  ████  █████   █   ████  
█     █   █ █     █   █   █   █     
█████ █   █ █████ █   █   █   █████ 
*/
function create() {
    let scene = vars.getScene();
    let lS = vars.loadingScreen;
    scene.tweens.add({
        targets: lS, alpha: 0, delay: 3000, duration: 1000,
        onComplete: ()=> {
            lS.destroy();
            delete(vars.loadingScreen);
            vars.App.init();
        }
    });
};


function update() {

};