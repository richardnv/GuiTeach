/* global document */
/* global window */
// Constructor function for GuitarNeck Prototype
function GuitarNeck(fretCount, _tuningMidiNumbers) {
    this.fretCount = fretCount ? fretCount : 24;
    this.tuningMidiNumbers = _tuningMidiNumbers ?? 
                                (this.tuningMidiNumbers ??
                                    [40, 45, 50, 55, 59, 64]);      
    this.svg = null;
    this.fingerBoard = null;
    this.nut = null;
    this.string_overlap_length_behind_nut = 10;    
    this.lastFret = null;    
    this.containerId = "";
    this._allNotesAreHidden = false;
    this.svgNS = "http://www.w3.org/2000/svg";
}

GuitarNeck.prototype.render = function(containerId) {    
    this.svg = document.createElementNS(this.svgNS, "svg");
    this.svg.setAttribute("id", "neckSvg");
    this.svg.setAttribute("width", "1500");
    this.svg.setAttribute("height", "200");

    this.fingerBoard = document.createElementNS(this.svgNS, "rect");
    this.fingerBoard.setAttribute("id", "fingerBoard");
    this.fingerBoard.setAttribute("x", "20");
    this.fingerBoard.setAttribute("y", "10");
    this.fingerBoard.setAttribute("width", "1500");
    this.fingerBoard.setAttribute("height", "180");
    this.fingerBoard.setAttribute("fill", "saddlebrown");    
    this.svg.appendChild(this.fingerBoard);

    this.nut = document.createElementNS(this.svgNS, "rect");
    this.nut.setAttribute("id", "nut");
    this.nut.setAttribute("class", "nut");
    this.nut.setAttribute("x", "20");
    this.nut.setAttribute("y", "10");
    this.nut.setAttribute("width", "20");
    this.nut.setAttribute("height", "180");
    this.nut.setAttribute("fill", "bone");
    this.svg.appendChild(this.nut);

    this.addFrets();

    this.addInlays();

    this.addStrings();

    this.addNotes();
   
    let container = document.getElementById(containerId);
    container.appendChild(this.svg);
};

GuitarNeck.prototype.addFrets = function() {
    for (let i = 0; i <= this.fretCount; i++) {
        let fret = document.createElementNS(this.svgNS, "line");
        fret.setAttribute("class", "fret");
        fret.setAttribute("id", `f${i}`);
        fret.setAttribute("x1", 20 + 60 * i);
        fret.setAttribute("y1", "10");
        fret.setAttribute("x2", 20 + 60 * i);
        fret.setAttribute("y2", "190");
        fret.setAttribute("stroke", "silver");
        fret.setAttribute("stroke-width", "5");

        // add custom data attributes
        fret.setAttribute("data-fret-index", i);

        this.lastFret = fret.cloneNode();
        this.svg.appendChild(fret);
    }
}

GuitarNeck.prototype.addInlays = function() {
    const inlays = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];
    inlays.forEach((inlay) => {
        let circle = document.createElementNS(this.svgNS, "circle");
        circle.setAttribute("class", "inlay");
        if (inlay == 12 || inlay == 24) {
            circle.setAttribute("id", `inlay${inlay}-1`);
        } else {
            circle.setAttribute("id", `inlay${inlay}`);
        }
        circle.setAttribute("cx", 20 + 60 * inlay - 30);
        circle.setAttribute("cy", inlay == 12 || inlay == 24 ? "50" : "100");
        circle.setAttribute("r", "5");
        circle.setAttribute("fill", "white");

        // Add custom data attributes
        circle.setAttribute("data-fret-index", inlay);  
        
        this.svg.appendChild(circle);        
        if (inlay == 12 || inlay == 24) {
            let circle2 = circle.cloneNode();
            circle2.setAttribute("id", `inlay${inlay}-2`);
            circle2.setAttribute("cy", "150");
            this.svg.appendChild(circle2);
        }
    });
}

GuitarNeck.prototype.addStrings = function() {  
    let stringCount = this.StringCount();  
    for (let i = 0; i < stringCount; i++) {        
        let string = document.createElementNS(this.svgNS, "line");
        let fbY = parseInt(this.fingerBoard.getAttribute("y"));        
        let fbHeight = parseInt(this.fingerBoard.getAttribute("height"));
        let stringOffset = fbHeight / stringCount;
        let startOffset = stringOffset / 2;
        string.setAttribute("id", `string${i}`);
        string.setAttribute("class", "guitar_string");
        string.setAttribute("x1", (10 - this.string_overlap_length_behind_nut));
        string.setAttribute("y1", (stringOffset * i) + startOffset + fbY);
        string.setAttribute("x2", (1490 + this.string_overlap_length_behind_nut));
        string.setAttribute("y2", (stringOffset * i) + startOffset + fbY);
        string.setAttribute("stroke", "black");
        string.setAttribute("stroke-width", "2");

        // Add custom data attributes
        string.setAttribute("data-string-index", i);         
        let stringRootNote = this.tuningMidiNumbers[i];   
        string.setAttribute("data-string-root-note-number", stringRootNote);
        
        this.svg.appendChild(string);        
    }
}

GuitarNeck.prototype.addNotes = function() {
    let stringCount = this.StringCount();
    for (let i = 0; i < stringCount; i++) {
        let string = this.svg.querySelector(`#string${i}`);
        let stringY = parseInt(string.getAttribute("y1"));
        let rootNote = this.tuningMidiNumbers[i];        
        // let effectiveFretCount =  (this.lastFret.getAttribute('id'). < this.fretCount ? this.lastFretIndex : this.fretCount);
        for (let f = 0; f <= this.fretCount; f++) {
            let fret = this.svg.querySelector(`#f${f}`);
            let fretX = parseInt(fret.getAttribute("x1"));
            let note = rootNote + f;
            let noteCircle = document.createElementNS(this.svgNS, "circle");
            noteCircle.setAttribute("class", "note");
            noteCircle.setAttribute("id", `note${note}s${i}f${f}`);            
            noteCircle.setAttribute("cx", fretX - 15);
            noteCircle.setAttribute("cy", stringY);
            noteCircle.setAttribute("r", "15"); 
            noteCircle.setAttribute("fill", "gray");

            // Add custom data attributes
            noteCircle.setAttribute("data-note-number", note);            
            noteCircle.setAttribute("data-string", i);
            noteCircle.setAttribute("data-fret", f);

            this.svg.appendChild(noteCircle);
        }
    }
}

GuitarNeck.prototype.adjustNeckWidth = function() {
    let svg_right_margin = 50;
    let pageWidth = window.innerWidth;
    // Example: Adjust the rectangle width based on the page width     
    this.svg.setAttribute('width', pageWidth - svg_right_margin);    
    this.lastVisibleFret();
    let lastFretX = parseInt(this.lastFret.getAttribute('x1'));
    let newFingerBoardWidth = lastFretX - 10;
    // Adjust the fingerboard width based on the last visible fret
    this.fingerBoard.setAttribute('width', newFingerBoardWidth);
    return this.lastFret.getAttribute('id');    
} 

GuitarNeck.prototype.updateFrets = function() {
    let frets = this.svg.querySelectorAll('line.fret');
    let fb_height = parseInt(this.fingerBoard.getAttribute('height'));
    let fret_count = frets.length;
    for (let i = 0; i < fret_count; i++) {
        let fretY = parseInt(frets[i].getAttribute('y1'));
        frets[i].setAttribute('y2', fretY + fb_height);
    }
}

GuitarNeck.prototype.updateInlays = function() {
    let inlays = this.svg.querySelectorAll('circle.inlay');
    let inlay_count = inlays.length;
    let newMidLine = parseInt(parseInt(this.svg.getAttribute('height')) / 2) + 5;
    for (let i = 0; i < inlay_count; i++) {
        let inlayId = inlays[i].getAttribute('id');
        if (inlayId == 'inlay12-1' || inlayId == 'inlay24-1') {
            inlays[i].setAttribute('cy',  (newMidLine - 50).toString());
        } else if (inlayId == 'inlay12-2' || inlayId == 'inlay24-2') {
            inlays[i].setAttribute('cy', (newMidLine + 50).toString());
        } else {
            inlays[i].setAttribute('cy', (newMidLine).toString());
        }
    }
};
        
/// <summary>
/// Adjust the neck width (rectangle "Height") based on the number of strings
/// does not currently support Bass guitar.
/// </summary>
GuitarNeck.prototype.resetNeckHeight = function() {        
    let fb_string_spacing = 30;
    let fb_edge_margin = 15;
    let stringCount = this.StringCount();
    let fb_StringAreaHeight = stringCount * fb_string_spacing;
    let fb_final_height = fb_StringAreaHeight + (fb_edge_margin * 2)
    this.fingerBoard.setAttribute('height', fb_final_height);
    this.nut.setAttribute('height', fb_final_height);    
    this.svg.setAttribute('height', fb_final_height - 20);
    this.updateFrets();
    this.updateInlays();
}

GuitarNeck.prototype.lastVisibleFret = function() {
    let frets = this.svg.querySelectorAll('line.fret');    
    let svg_right_margin = 50;
    for (var i = 1; i < frets.length; i++) {
        if (frets[i].getAttribute('x1') < (window.innerWidth - svg_right_margin)) {
            this.lastFret = frets[i];
        }
    }    
}

GuitarNeck.prototype.addStringToNeck = function(newStringRootNote) {  
    this.tuningMidiNumbers.push(parseInt(newStringRootNote));  
    let fb_top = parseInt(this.fingerBoard.getAttribute('y'));
    let fb_string_spacing = 30;
    let fb_edge_margin = 15;
    let stringCount = this.StringCount();
    let fb_string_area_height = stringCount * fb_string_spacing;
    let stringY = fb_top + fb_edge_margin + fb_string_area_height;
    let newString = document.createElementNS(this.svgNS, 'line');    
    newString.setAttribute('id', 'string' + (stringCount - 1));
    newString.setAttribute('class', 'guitar_string');
    newString.setAttribute('x1', 10);    
    newString.setAttribute('y1', stringY);
    newString.setAttribute('x2', 1490);
    newString.setAttribute('y2', stringY);
    newString.setAttribute('stroke', 'black');
    newString.setAttribute('stroke-width', 2);

    newString.setAttribute("data-string-index", stringCount - 1);             
    newString.setAttribute("data-string-root-note-number", newStringRootNote);
    
    const firstNote = this.svg.querySelector('.note');
    if (firstNote) {
        this.svg.insertBefore(newString, firstNote);
    } else {
        this.svg.appendChild(newLine);
    }
        
    this.resetNeckHeight();
}

GuitarNeck.prototype.removeStringFromNeck = function() {
    let guitarStrings = this.svg.querySelectorAll('line.guitar_string');    
    let stringCount = this.StringCount();
    if (stringCount > 1) {
        let stringRootNote = guitarStrings[stringCount - 1].getAttribute('data-string-root-note-number');
        this.tuningMidiNumbers.pop(stringRootNote);

        guitarStrings[stringCount - 1].remove();
        this.resetNeckHeight();
    }
}

GuitarNeck.prototype.hideAllNotes = function() {
    const notes = this.svg.querySelectorAll('circle.note');
    notes.forEach(note => {
        note.style.display = 'none';
    });
    this._allNotesAreHidden = true;
}

GuitarNeck.prototype.showAllNotes = function() {
    const notes = this.svg.querySelectorAll('circle.note');
    notes.forEach(note => {
        note.style.display = 'block';
    });
    this._allNotesAreHidden = false;
}

GuitarNeck.prototype.AllNotesAreHidden = function() {
    return this._allNotesAreHidden;
}

GuitarNeck.prototype.StringCount = function() {
    return this.tuningMidiNumbers.length;
}
