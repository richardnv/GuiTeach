const GuitarNeck = require('./guitarneck.js');
const guitarNeckInstance = new GuitarNeck();

window.onload = function() {
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

    document.getElementById("toggleAllNotesBtn").onclick = function() {
        toggleAllNotes();
    };
};

window.onresize = function() {
     guitarNeckInstance.adjustNeckWidth();             
}

function toggleAllNotes() {
    if (guitarNeckInstance.AllNotesAreHidden()) {
        guitarNeckInstance.showAllNotes();            
        document.getElementById('toggleAllNotesBtn').innerText = 'Hide all Notes';
        return;
    }
    guitarNeckInstance.hideAllNotes();
    document.getElementById('toggleAllNotesBtn').innerText = 'Show all Notes';
}

function showScale() {
    // Your showScale function implementation
}