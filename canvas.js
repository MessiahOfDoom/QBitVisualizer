/* #region  Setup */

const canvas = document.getElementById('scene');

let width = canvas.offsetWidth;
let height = canvas.offsetHeight;

const ctx = canvas.getContext('2d');

let b1 = false, b2 = false, b3 = false;

const alphaE = document.getElementById('alpha');
const alphaNE = document.getElementById('alphaN');
const phiE = document.getElementById('phi');
const phiNE = document.getElementById('phiN');


const lnk = document.getElementById('dwnld');


function onResize() {
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;

    if (window.devicePixelRatio > 1) {
        canvas.width = canvas.clientWidth * 2;
        canvas.height = canvas.clientHeight * 2;
        ctx.scale(2, 2);
    } else {
        canvas.width = width;
        canvas.height = height;
    }
    getInfoAndDraw();
}

/* #endregion */

/* #region  3D Stuff */

let r = 0;
let perspective = 0;
let centerX = 0;
let centerY = 0;

class QBit {
    constructor(theta, phi) {
        this.xyz = new Vector3D(0, -r, 0);
        this.xyz.rotateZ(theta);
        this.xyz.rotateY(phi);
        this.xyz.rotateY(Math.PI / 4);
        this.xyz.rotateX((15 * Math.PI / 180));
        
        this.xz = new Vector3D(0, -r, 0);
        this.xz.rotateZ(theta);
        this.xz.rotateY(phi);
        this.xz.y = 0;
        this.xz.rotateY(Math.PI / 4);
        this.xz.rotateX((15 * Math.PI / 180));
        
    }

    draw(context) {
        let V = this.xyz.getProjected();
        context.beginPath();
        context.arc(V.y, V.z, 10 * V.x, 0, Math.PI * 2);
        context.fill();

        
        
        context.beginPath();
        context.moveTo(centerX, centerY);
        context.lineTo(V.y, V.z);
        V = this.xz.getProjected();
        context.lineTo(V.y, V.z);
        context.stroke();
    }
}

class Vector3D {

    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    rotateX(rad) {
        var c = Math.cos(rad);
        var s = Math.sin(rad);
        var a = c * this.y - s * this.z;
        var b = s * this.y + c * this.z;
        this.y = a;
        this.z = b;
    }

    rotateY(rad) {
        var c = Math.cos(rad);
        var s = Math.sin(rad);
        var a = c * this.x + s * this.z;
        var b = -s * this.x + c * this.z;
        this.x = a;
        this.z = b;
    }

    rotateZ(rad) {
        var c = Math.cos(rad);
        var s = Math.sin(rad);
        var a = c * this.x - s * this.y;
        var b = s * this.x + c * this.y;
        this.x = a;
        this.y = b;
    }

    getProjected() {
        var pS = perspective / (perspective + this.z);
        var pX = this.x * pS + centerX;
        var pY = this.y * pS + centerY;
        return new Vector3D(pS, pX, pY);
    }
}

class BlochtSphere {
    constructor() {

    }

    draw(context) {
        let fs = context.fillStyle;
        context.fillStyle = 'white';
        context.beginPath();
        context.arc(centerX, centerY, r, 0, 2*Math.PI);
        context.fill();
        context.beginPath();
        context.arc(centerX, centerY, r, 0, 2*Math.PI);
        context.stroke();
        context.fillStyle = fs;
        
        let lw = context.lineWidth;
        context.lineWidth = 3;

        let font = context.font;
        context.font = "50px Arial, sans-serif";

        context.beginPath();
        // z circle
        for (var i = 0; i <= 100; i++) {
            let c = i / 100.0;
            let rads = c * Math.PI * 2;
            let V = new Vector3D(Math.cos(rads) * r, 0, Math.sin(rads) * r);
            V.rotateY(Math.PI / 4);
            V.rotateX((15 * Math.PI / 180));
            V = V.getProjected();
            if (i == 0) {
                context.moveTo(V.y, V.z);
            } else {
                context.lineTo(V.y, V.z);
            }
        }

        // x circle
        for (var i = 0; i <= 100; i++) {
            let c = i / 100.0;
            let rads = c * Math.PI * 2;
            let V = new Vector3D(0, Math.cos(rads) * r, Math.sin(rads) * r);
            V.rotateY(Math.PI / 4);
            V.rotateX((15 * Math.PI / 180));
            V = V.getProjected();
            if (i == 0) {
                context.moveTo(V.y, V.z);
            } else {
                context.lineTo(V.y, V.z);
            }
        }

        // y circle
        for (var i = 0; i <= 100; i++) {
            let c = i / 100.0;
            let rads = c * Math.PI * 2;
            let V = new Vector3D(Math.cos(rads) * r, Math.sin(rads) * r, 0);
            V.rotateY(Math.PI / 4);
            V.rotateX((15 * Math.PI / 180));
            V = V.getProjected();
            if (i == 0) {
                context.moveTo(V.y, V.z);
            } else {
                context.lineTo(V.y, V.z);
            }
        }

        //axes

        context.fillStyle = '#FBC902';
        let V = new Vector3D(-2*r, 0, 0);
        V.rotateY(Math.PI / 4);
        V.rotateX((15 * Math.PI / 180));
        V = V.getProjected();
        context.moveTo(V.y, V.z);

        V = new Vector3D(2*r, 0, 0);
        V.rotateY(Math.PI / 4);
        V.rotateX((15 * Math.PI / 180));
        V = V.getProjected();
        context.lineTo(V.y, V.z);
        context.fillText("X", V.y, V.z);

        V = new Vector3D(0, -2*r, 0);
        V.rotateY(Math.PI / 4);
        V.rotateX((15 * Math.PI / 180));
        V = V.getProjected();
        context.moveTo(V.y, V.z);
        context.fillText("Z", V.y+0.05*r, V.z + 0.5*r);

        V = new Vector3D(0, 2*r, 0);
        V.rotateY(Math.PI / 4);
        V.rotateX((15 * Math.PI / 180));
        V = V.getProjected();
        context.lineTo(V.y, V.z);

        V = new Vector3D(0, 0, -2*r);
        V.rotateY(Math.PI / 4);
        V.rotateX((15 * Math.PI / 180));
        V = V.getProjected();
        context.moveTo(V.y, V.z);

        V = new Vector3D(0, 0, 2*r);
        V.rotateY(Math.PI / 4);
        V.rotateX((15 * Math.PI / 180));
        V = V.getProjected();
        context.lineTo(V.y, V.z);
        context.fillText("Y", V.y, V.z);

        context.fillStyle = fs;
        context.stroke();
        context.lineWidth = lw;
        context.font = font;
    }
}

/* #endregion */

let theta = 0;
let phi = 0;

function draw() {

    ctx.clearRect(0, 0, width, height);

    var xy = Math.min(width, height) / 2;
    r = xy / 2;
    perspective = width * 0.8;
    centerX = width / 2;
    centerY = height / 2;

    (new BlochtSphere()).draw(ctx);
    (new QBit(theta, phi)).draw(ctx);

}

function getInfoAndDraw(){
    theta = Math.acos(alphaE.value) * 2;
    phi = -phiE.value * Math.PI;
    draw();
}

function getThetaAndDraw(alpha) {
    theta = Math.acos(alpha) * 2;
    alphaE.value = alpha;
    alphaNE.value = alpha;
    draw();
}

function getPhiAndDraw(_phi) {
    phi = -_phi * Math.PI;
    phiE.value = _phi;
    phiNE.value = _phi;
    draw();
}

function downloadImage(){
    lnk.setAttribute('download', 'QBit.png');
    lnk.setAttribute('href', canvas.toDataURL("image/png"));
    lnk.click();
}

/* #region  Startup */

window.addEventListener('resize', onResize);

onResize();


/* #endregion */