const GuitarNeck = require('./guitarneck.js');

window.onload = function() {
    const guitarNeckInstance = new GuitarNeck();
    console.log(guitarNeckInstance);

    let svgCont = document.getElementById("guitar_neck_container");
    if (svgCont) {
        svgCont.appendChild(guitarNeckInstance.render());
    }

    let wiw = document.getElementById("wiw");        
    let svginfo = document.getElementById("neckSvg");        
    wiw.innerText = "WindowWidth: " + window.innerWidth + 
        " WindowHeight: " + window.innerHeight +
        " SVGWidth: " + svginfo.width.baseVal.value +
        " SVGHeight: " + svginfo.height.baseVal.value +
        " SVGViewBox: width " + svginfo.viewBox.baseVal.width + 
        " SVGViewBox: height " + svginfo.viewBox.baseVal.height;

    document.getElementById("showScaleBtn").onclick = function() {
        showScale();
    };
};

function showScale() {
    // Your showScale function implementation
}