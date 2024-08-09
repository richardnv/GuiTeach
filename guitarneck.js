
// Constructor function for GuitarNeck Prototype
function GuitarNeck(fretCount, _tuningMidiNumbers) {
    this.svgNS = "http://www.w3.org/2000/svg";
    this.svg_right_margin = 50;
    this.fretCount = fretCount ? fretCount : 24;
    this.tuningMidiNumbers = _tuningMidiNumbers ?? 
                                (this.tuningMidiNumbers ??
                                    [40, 45, 50, 55, 59, 64]);      
    this.svg = null; // SVG element root    
    this.fingerBoard = null; // SVG rect element 
    this.nut = null; // SVG rect element
    this.string_overlap_length_behind_nut = 20;    
    this.lastFret = null;    
    this._allNotesAreHidden = false;
    this.fingeringsBaseX = 25;    
    this.defaultOverallHeight = 200;
    this.minHeight = 80;
    this.fretSpacing = 59;

}

GuitarNeck.prototype.render = function() {

    this.svg = document.createElementNS(this.svgNS, "svg");
    this.svg.setAttribute("id", "neckSvg");
    this.svg.setAttribute("width", window.innerWidth);
    this.svg.setAttribute("height", this.defaultOverallHeight);

    // The fingerBoards vertical size is based on the number of strings
    // and the horizontal size is based initially on width of the page 
    //     but is overridden by the last visible fret.
    // (This compensates zooming in and out of the page)
    this.fingerBoard = document.createElementNS(this.svgNS, "rect");
    this.fingerBoard.setAttribute("id", "fingerBoard");
    this.fingerBoard.setAttribute("x", "40");
    this.fingerBoard.setAttribute("y", "10");
    this.fingerBoard.setAttribute("width", "1500");
    this.fingerBoard.setAttribute("height", "180");
    this.fingerBoard.setAttribute("fill", "saddlebrown");    
    this.svg.appendChild(this.fingerBoard);

    this.nut = document.createElementNS(this.svgNS, "rect");
    this.nut.setAttribute("id", "nut");
    this.nut.setAttribute("class", "nut");
    this.nut.setAttribute("x", "40");
    this.nut.setAttribute("y", "10");
    this.nut.setAttribute("width", "20");
    this.nut.setAttribute("height", "180");
    this.nut.setAttribute("fill", "black");
    this.svg.appendChild(this.nut);

    this.addFrets();

    this.addInlays();

    this.addStrings();

    this.addFingerings();
   
    //let container = document.getElementById(this.containerId);
    return this.svg;
};

GuitarNeck.prototype.addFrets = function() {
    let fretX = parseInt(this.nut.getAttribute("x")) + parseInt(this.nut.getAttribute("width")) - 20;
    for (let i = 0; i <= this.fretCount; i++) {
        let fret = document.createElementNS(this.svgNS, "line");
        fret.setAttribute("class", "fret");
        fret.setAttribute("id", `f${i}`);
        fretX = i > 0 ? 50 + this.fretSpacing * i : fretX;
        fret.setAttribute("x1", fretX);
        fret.setAttribute("y1", "10");
        fret.setAttribute("x2", fretX);
        fret.setAttribute("y2", "190");
        if (i == 0) {
            fret.setAttribute("stroke", "black");
            fret.setAttribute("stroke-width", "0");
        } else {
            fret.setAttribute("stroke", "silver");
            fret.setAttribute("stroke-width", "5");
        }

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
        circle.setAttribute("cx", 50 + (this.fretSpacing * inlay) - 30);
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
        string.setAttribute("x1", (40 - this.string_overlap_length_behind_nut));
        string.setAttribute("y1", (stringOffset * i) + startOffset + fbY);
        string.setAttribute("x2", (1490 + this.string_overlap_length_behind_nut));
        string.setAttribute("y2", (stringOffset * i) + startOffset + fbY);
        string.setAttribute("stroke", "black");
        string.setAttribute("stroke-width", "2");

        // Add custom data attributes
        string.setAttribute("data-string-index", i);         
        let stringRootNote = parseInt(this.tuningMidiNumbers[i]);   
        string.setAttribute("data-string-root-note-number", stringRootNote);
        
        this.svg.appendChild(string);        
    }
}

GuitarNeck.prototype.addFingerings = function() {
    let stringCount = this.StringCount();
    for (let i = 0; i < stringCount; i++) {
        let string = this.svg.querySelector(`#string${i}`);
        let stringY = parseInt(string.getAttribute("y1"));
        let rootNote = parseInt(string.getAttribute("data-string-root-note-number"));        
        for (let f = 0; f <= this.fretCount; f++) {
            let fret = this.svg.querySelector(`#f${f}`);
            let fretX = parseInt(fret.getAttribute("x1"));
            let note = new Note(rootNote + f);
            let fingering = document.createElementNS(this.svgNS, "g");
            fingering.setAttribute("class", "fingering");
            fingering.setAttribute("id", `fingeringS${i}F${f}`);
            fingering.setAttribute("data-note-number", note.midiNumber);            
            fingering.setAttribute("data-string", i);
            fingering.setAttribute("data-fret", f);
            fingering.setAttribute("data-note-name", note.noteName);
            fingering.setAttribute("data-note-octave", note.octave);
            fingering.setAttribute("data-note-spelling", note.noteSpelling);
            fingering.setAttribute("data-note-frequency", note.frequency);

            let noteCircle = document.createElementNS(this.svgNS, "circle");
            noteCircle.setAttribute("class", "note");
            noteCircle.setAttribute("id", `note${note.midiNumber}s${i}f${f}`);            
            noteCircle.setAttribute("cx", fretX - 15);
            noteCircle.setAttribute("cy", stringY);
            noteCircle.setAttribute("r", "15"); 
            noteCircle.setAttribute("fill", "gray");
            
            fingering.appendChild(noteCircle);
                        
            noteText = document.createElementNS(this.svgNS, "text");
            noteText.setAttribute("x", fretX - 15);
            noteText.setAttribute("y", stringY);
            noteText.setAttribute("class", "note-text");
            noteText.setAttribute("text-anchor", "middle");
            noteText.setAttribute("dy", ".3em");                     
            noteText.textContent = note.toString();
            fingering.appendChild(noteText);
            this.svg.appendChild(fingering);            
        }
    }
}

GuitarNeck.prototype.updateFingerings = function() {
    let strings = this.svg.querySelectorAll('line.guitar_string');
    for (let i = 0; i < strings.length; i++) {        
        let stringFingerings = this.svg.querySelectorAll(`g.fingering[data-string="${i}"]`);
        if (stringFingerings.length == 0) {
            // Add notes for the new string
            this.createFingeringsForString(i);
        }        
    }    
}

/// <summary>
/// Create notes for the string at the given index.
/// also handles updating the notes if they already exist.
/// This method is called when a new string is added to the neck.
/// </summary>
GuitarNeck.prototype.createFingeringsForString = function(stringIndex) {
    let string = this.svg.querySelector(`line.guitar_string[data-string-index="${stringIndex}"]`);
    let stringY = parseInt(string.getAttribute('y1'));
    let rootNote = parseInt(string.getAttribute('data-string-root-note-number'));
    for (let f = 0; f <= this.fretCount; f++) {
        let fret = this.svg.querySelector(`line.fret[data-fret-index="${f}"]`);
        let fretX = parseInt(fret.getAttribute('x1'));
        
        let noteNumber = rootNote + f;
        let note = new Note(noteNumber);
        let existingFingering = this.svg.querySelector(`g.fingering[data-string="${stringIndex}"][data-fret="${f}"]`);
        let existingNoteCircle = existingFingering.querySelector(`circle`);
        let existingNoteText = existingFingering.querySelector(`text`);
        let existingNoteNumber = existingNoteCircle ? parseInt(existingFingering.getAttribute('data-note-number')) : null;
        if (existingNoteNumber){            
            if (existingNoteNumber != noteNumber) {
                existingNoteCircle.setAttribute('data-note-number', note.midiNumber);
                existingNoteCircle.setAttribute('data-note-name', note.noteName);
                existingNoteCircle.setAttribute('data-note-octave', note.octave);
                existingNoteCircle.setAttribute('data-note-frequency', note.frequency);
                existingNoteCircle.setAttribute('data-note-spelling', note.noteSpelling);                   
                existingNoteText.textContent = note.noteSpelling;                                
            }
            continue;
        }
        else {
            this.addNoteForString(noteNumber, stringIndex, f, fretX, stringY);
        }        
    }
    let fret_index = parseInt(this.lastFret.getAttribute('data-fret-index')); 
    this.handleNoteVisibilityBasedOnLastFret(fret_index);
}


/// <summary>
/// Update the notes for the string at the given index.

/// This method is called when a string is removed from the neck.
GuitarNeck.prototype.addNoteForString = function(noteNumber, stringIndex, fretIndex, fretX, stringY) {
    let noteCircle = document.createElementNS(this.svgNS, 'circle');
    noteCircle.setAttribute('class', 'note');
    noteCircle.setAttribute('id', `note${noteNumber}s${stringIndex}f${fretIndex}`);
    noteCircle.setAttribute('cx', fretX - 15);
    noteCircle.setAttribute('cy', stringY);
    noteCircle.setAttribute('r', '15');
    noteCircle.setAttribute('fill', 'gray');
    let note = new Note(noteNumber);
    // Add custom data attributes
    noteCircle.setAttribute('data-note-number', note.midiNumber);
    noteCircle.setAttribute('data-string', stringIndex);
    noteCircle.setAttribute('data-fret', fretIndex);
    noteCircle.setAttribute("data-note-name", note.noteName);
    noteCircle.setAttribute("data-note-octave", note.octave);
    noteCircle.setAttribute("data-note-spelling", note.noteSpelling);
    noteCircle.setAttribute("data-note-frequency", note.frequency);

    this.svg.appendChild(noteCircle);
}

GuitarNeck.prototype.removeNotesForString = function(stringIndex) {
    let notes = this.svg.querySelectorAll(`circle.note[data-string="${stringIndex}"]`);
    notes.forEach(curNote => {
        curNote.remove();
    });
}

GuitarNeck.prototype.adjustNeckWidth = function() {

    let pageWidth = window.innerWidth;
    // Example: Adjust the rectangle width based on the page width     
    this.svg.setAttribute('width', (pageWidth - this.svg_right_margin).toString());    
    this.lastVisibleFret();
    let lastFretX = parseInt(this.lastFret.getAttribute('x1'));
    let newFingerBoardWidth = lastFretX - 30;
    // Adjust the fingerboard width based on the last visible fret
    this.fingerBoard.setAttribute('width', newFingerBoardWidth);
    this.handleElementVisibility();
    return this.lastFret.getAttribute('id');    
} 

GuitarNeck.prototype.handleElementVisibility = function() {
    let fret_index = parseInt(this.lastFret.getAttribute('data-fret-index'));    
    //if (fret_index < this.fretCount) {
        this.handleNoteVisibilityBasedOnLastFret(fret_index);
        this.handleFretVisibilityBasedOnLastFret(fret_index);
        this.hideInlayVisibilityBasedOnLastFret(fret_index);
    // } 
} 

GuitarNeck.prototype.handleNoteVisibilityBasedOnLastFret = function(fret_index) {
    let fingerings = this.svg.querySelectorAll('g.fingering');
    if (!this.AllNotesAreHidden()) {
        fingerings.forEach(fingering => {
            let fingering_fret_index = parseInt(fingering.getAttribute('data-fret'));
            let note = fingering.querySelector('circle.note');
            let noteText = fingering.querySelector('text.note-text');
            if (fingering_fret_index > fret_index) {
                note.style.display = 'none';    
                noteText.style.display = 'none';        
            } else if (fingering_fret_index <= fret_index) {
                if (note.style.display = 'none') {
                    note.style.display = 'block';
                    noteText.style.display = 'block';
                }
            }
        });
    } 
}

GuitarNeck.prototype.handleFretVisibilityBasedOnLastFret = function(fret_index) {
    let frets = this.svg.querySelectorAll('line.fret');
    frets.forEach(fret => {
        let _fret_index = parseInt(fret.getAttribute('data-fret-index'));
        if (_fret_index > fret_index) {
            fret.style.display = 'none';
        } else if (_fret_index <= fret_index) {
            if (fret.style.display = 'none') {
                fret.style.display = 'block';
            }
        }
    });
}

GuitarNeck.prototype.hideInlayVisibilityBasedOnLastFret = function(fret_index) {
    let inlays = this.svg.querySelectorAll('circle.inlay');
    inlays.forEach(inlay => {
        let inlay_fret_index = parseInt(inlay.getAttribute('data-fret-index'));
        if (inlay_fret_index > fret_index) {
            inlay.style.display = 'none';
        } else if (inlay_fret_index <= fret_index) {
            if (inlay.style.display = 'none') {
                inlay.style.display = 'block';
            }
        }   
    });
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
    for (var i = 1; i < frets.length; i++) {
        if (frets[i].getAttribute('x1') < (window.innerWidth - this.svg_right_margin)) {
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
    // watching for this change 
    let fb_string_area_height = (stringCount - 1) * fb_string_spacing;
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
    
    const firstFingering = this.svg.querySelector('.fingering');
    if (firstFingering) {
        this.svg.insertBefore(newString, firstFingering);
    } else {
        this.svg.appendChild(newLine);
    }
    
    this.updateNotes(stringCount -1);    

    this.resetNeckHeight();
}

GuitarNeck.prototype.removeStringFromNeck = function() {
    let guitarStrings = this.svg.querySelectorAll('line.guitar_string');    
    let stringCount = this.StringCount();
    if (stringCount > 1) {
        let stringRootNote = guitarStrings[stringCount - 1].getAttribute('data-string-root-note-number');
        this.removeNotesForString(stringCount - 1);
        this.tuningMidiNumbers.pop(stringRootNote);        
        guitarStrings[stringCount - 1].remove();        
        this.resetNeckHeight();
    }
}

GuitarNeck.prototype.hideAllNotes = function() {
    const fingerings = this.svg.querySelectorAll('g.fingering');
    fingerings.forEach(fingering => {
        let note = fingering.querySelector('circle.note');
        let noteText = fingering.querySelector('text.note-text');
        note.style.display = 'none';
        noteText.style.display = 'none';
    });
    this._allNotesAreHidden = true;
}

GuitarNeck.prototype.showAllNotes = function() {
    const fingerings = this.svg.querySelectorAll('g.fingering');
    let last_fret_index = parseInt(this.lastFret.getAttribute('data-fret-index'));
    fingerings.forEach(fingering => {
        let note_fret_index = parseInt(fingering.getAttribute('data-fret'));
        if (note_fret_index <= last_fret_index) {
            let note = fingering.querySelector('circle.note');
            let noteText = fingering.querySelector('text.note-text');
            note.style.display = 'block';
            noteText.style.display = 'block';
        }
    });    
    this._allNotesAreHidden = false;
}

GuitarNeck.prototype.AllNotesAreHidden = function() {
    return this._allNotesAreHidden;
}

GuitarNeck.prototype.StringCount = function() {
    return this.tuningMidiNumbers.length;
}

GuitarNeck.prototype.GetFingeringInfo = function(stringIndex, fretIndex) {
    let note = this.svg.querySelector(`circle.note[data-string="${stringIndex}"][data-fret="${fretIndex}"]`);
    let noteName = note.getAttribute('data-note-name');
    let noteOctave = note.getAttribute('data-note-octave');
    let noteFrequency = note.getAttribute('data-note-frequency');
    let noteSpelling = note.getAttribute('data-note-spelling');
    return {        
        noteName: noteName,
        noteOctave: noteOctave,
        noteFrequency: noteFrequency,
        noteSpelling: noteSpelling
    };
}
