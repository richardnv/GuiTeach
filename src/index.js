const GuitarNeck = require('./guitarneck.js');
const guitarNeckInstance = new GuitarNeck();

window.onload = function() {
    console.log(guitarNeckInstance);

    let svgCont = document.getElementById("guitar_neck_container");
    if (svgCont) {
        svgCont.appendChild(guitarNeckInstance.render());
        zoom();  
    }

    // let wiw = document.getElementById("wiw");        
    // let svginfo = document.getElementById("neckSvg");        
    // wiw.innerText = "WindowWidth: " + window.innerWidth + 
    //     " WindowHeight: " + window.innerHeight +
    //     " SVGX: " + svginfo.x.baseVal.value +
    //     " SVGY: " + svginfo.y.baseVal.value +
    //     " SVGWidth: " + svginfo.width.baseVal.value +
    //     " SVGHeight: " + svginfo.height.baseVal.value +
    //     " SVGViewBox: width " + svginfo.viewBox.baseVal.width + 
    //     " SVGViewBox: height " + svginfo.viewBox.baseVal.height +
    //     " SVGViewBox: x " + svginfo.viewBox.baseVal.x +
    //     " SVGViewBox: y " + svginfo.viewBox.baseVal.y;

    initialize_guitar_neck();   
};

window.onresize = function() {
    zoom();       
}

function initialize_guitar_neck() {
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
        let svgCont = document.getElementById("guitar_neck_container");
        svgCont.innerHTML = '';  
        guitarNeckInstance.setNeckLayout(foundName);            
        svgCont.appendChild(guitarNeckInstance.render());   
        zoom();             
        initialize_guitar_neck();
    };

    document.getElementById("zoom_slider").oninput = function() {
        let zoomValue = document.getElementById('zoom_slider').value;
        guitarNeckInstance.zoomNeck(zoomValue);
    };

    document.getElementById("horiz_scroll_slider").oninput = function() {
        let scrollValue = document.getElementById('horiz_scroll_slider').value;
        guitarNeckInstance.scrollNeck(scrollValue);
    }
}

function zoom() {
    let zoomValue = document.getElementById('zoom_slider').value;
    guitarNeckInstance.zoomNeck(zoomValue);
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

function handleStringPreview() {
    let stringRootNote = document.getElementById('stringRootNote').value;
    let srnInt = parseInt(stringRootNote);                
    let stringRootOctaveCtrl = document.getElementById('stringRootOctave');
    let sroInt = parseInt(stringRootOctaveCtrl.value);                
    if (srnInt != -1 && sroInt != -1) {
        //moveStringPreview(srnInt, sroInt);                        
    }
}
 
document.getElementById("stringRootNote").addEventListener('change', () => {
    handleStringPreview();
});

document.getElementById("addStringToNeckBtn").addEventListener('click', () => {
    let dialog = document.getElementById('addStringDialog');        
    let previewDiv  = document.getElementById('stringPreview');
    dialog.showModal();
    previewDiv.innerHTML = '';
    previewDiv.appendChild(guitarNeckInstance.renderStringPreview());

});

document.getElementById("cancelAddStringBtn").addEventListener('click', () => {
    let dialog = document.getElementById('addStringDialog');
    dialog.close();
});

document.getElementById("addStringBtn").addEventListener('click', () => {
    let dialog = document.getElementById('addStringDialog');                
    let selectedStringRootNote = document.getElementById('stringRootNote').value;
    let selectedStringRootOctave = document.getElementById('stringRootOctave').value;
    let newStringRootNoteNumber = parseInt(selectedStringRootNote) + (12 * parseInt(selectedStringRootOctave));
    guitarNeckInstance.addStringToNeck(newStringRootNoteNumber);
    dialog.close();
});  