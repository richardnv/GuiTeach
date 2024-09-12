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
        " SVGX: " + svginfo.x.baseVal.value +
        " SVGY: " + svginfo.y.baseVal.value +
        " SVGWidth: " + svginfo.width.baseVal.value +
        " SVGHeight: " + svginfo.height.baseVal.value +
        " SVGViewBox: width " + svginfo.viewBox.baseVal.width + 
        " SVGViewBox: height " + svginfo.viewBox.baseVal.height +
        " SVGViewBox: x " + svginfo.viewBox.baseVal.x +
        " SVGViewBox: y " + svginfo.viewBox.baseVal.y;


    document.getElementById("showScaleBtn").onclick = function() {        
        let scaleRootNote = document.getElementById('scaleRootNote').value;        
        let scaleType = document.getElementById('scaleType').value;
        guitarNeckInstance.ShowScale(scaleRootNote, scaleType);
    };

    document.getElementById("toggleAllNotesBtn").onclick = function() {
        toggleAllNotes();
    };

    document.getElementById("displayLayout").onchange = function() {
        let layoutName_raw = document.getElementById("displayLayout").value;        
        let layoutName = layoutName_raw.toLowerCase();
        let foundName = guitarNeckInstance.layout_options.find(x => x.name.toLowerCase() === layoutName).name;
        foundName = foundName.toLowerCase();         
        guitarNeckInstance.setNeckLayout(foundName);
    };

    document.getElementById("zoom_slider").oninput = function() {
        let zoomValue = document.getElementById('zoom_slider').value;
        console.log(zoomValue);
        guitarNeckInstance.zoomNeck(zoomValue);
    };

    guitarNeckInstance.adjustNeckWidth();
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

 
