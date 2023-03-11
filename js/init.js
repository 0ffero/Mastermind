"use strict"
vars.DEBUG && console.log('Initialising...');

var config = {
    type: Phaser.WEBGL, title: consts.appName, banner: false, url: window.location.href,
    backgroundColor: consts.canvas.colour, disableContextMenu: true,
    height: consts.canvas.height, width: consts.canvas.width,
    fps: { target: 60 },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: consts.canvas.width, height: consts.canvas.height },
    scene: { preload: preload, create: create, update: update,
        pack: { files: [ { type: 'atlas', key: 'loadingScreen', url: 'loadingScreen.png'} ] }
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
    vars.UI.initLoadingScreen();

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
    let lsImage = lS.getByName('lsImage');
    let logo = lS.getByName('logo');
    vars.App.init();

    scene.tweens.add({
        targets: [lsImage,logo], scale: 0.7, delay: 2000, duration: 750, ease: 'Quad.easeOut',
        onComplete: vars.UI.containers.selectionScreen.show
    });
};


function update() {

};