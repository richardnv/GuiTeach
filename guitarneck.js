
// Constructor function for GuitarNeck Prototype
/**
 * Represents a guitar neck.
 * @constructor
 * @param {number} fretCount - The number of frets on the guitar neck.
 * @param {number[]} _tuningMidiNumbers - The MIDI numbers representing the tuning of the guitar strings.
 */

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
    this.string_spacing = 30;
}

GuitarNeck.prototype.fingerboardEdgeMargin = function() {
    return this.string_spacing / 2;
}

/// Handles the initial render of the fingerboard and its components, using the defaults values.
/// @returns {SVGElement} The SVG element representing the guitar neck.
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
    this.fingerBoard.setAttribute("y", 10);
    this.fingerBoard.setAttribute("width", window.innerWidth);
    let stringCount = this.StringCount();
    let fingerboardEdgeMargin = this.fingerboardEdgeMargin();
    this.fingerBoard.setAttribute("height", (this.string_spacing * (stringCount - 1)) + (fingerboardEdgeMargin * 2));
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

    this.createFrets();

    this.createInlays();

    this.createStrings();

    this.createFingerings();
   
    return this.svg;
};

GuitarNeck.prototype.createFrets = function() {    
    for (let i = 0; i <= this.fretCount; i++) {
        let fret = this.createFret(i);
        this.svg.appendChild(fret);
    }
}

GuitarNeck.prototype.createFret = function(fretIndex) {
    let fretX = parseInt(this.nut.getAttribute("x")) + parseInt(this.nut.getAttribute("width")) - 20;
    let fret = document.createElementNS(this.svgNS, "line");
    fret.setAttribute("class", "fret");
    fret.setAttribute("id", `f${fretIndex}`);
    fretX = fretIndex > 0 ? 50 + this.fretSpacing * fretIndex : fretX;
    fret.setAttribute("x1", fretX);
    fret.setAttribute("y1", "10");
    fret.setAttribute("x2", fretX);
    fret.setAttribute("y2", "190");
    if (fretIndex == 0) {
        fret.setAttribute("stroke", "black");
        fret.setAttribute("stroke-width", "0");
    } else {
        fret.setAttribute("stroke", "silver");
        fret.setAttribute("stroke-width", "5");
    }

    // add custom data attributes
    fret.setAttribute("data-fret-index", fretIndex);
    this.lastFret = fret.cloneNode();
    return fret;
}

GuitarNeck.prototype.createInlays = function() {
    const inlays = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];
    inlays.forEach((inlay) => {
        let inlayGroup = this.createInlay(inlay);
        this.svg.appendChild(inlayGroup);
    });
}

GuitarNeck.prototype.createInlay = function(i){
    let inlay = document.createElementNS(this.svgNS, "g");
    inlay.setAttribute("class", "inlay");
    inlay.setAttribute("id", `inlayGroup${i}`);
    inlay.setAttribute("data-fret-index", i);
    let inlayCircle = document.createElementNS(this.svgNS, "circle");
    inlayCircle.setAttribute("class", "inlay");
    if (i == 12 || i == 24) {
        inlayCircle.setAttribute("id", `inlay${i}-1`);
    } else {
        inlayCircle.setAttribute("id", `inlay${i}`);
    }
    inlayCircle.setAttribute("cx", 50 + (this.fretSpacing * i) - 30);
    inlayCircle.setAttribute("cy", i == 12 || i == 24 ? "50" : "100");
    inlayCircle.setAttribute("r", "5");
    inlayCircle.setAttribute("fill", "white");        
    
    inlay.appendChild(inlayCircle);        
    if (i == 12 || i == 24) {
        let inlayCircle2 = inlayCircle.cloneNode();
        inlayCircle2.setAttribute("id", `inlay${i}-2`);
        inlayCircle2.setAttribute("cy", "150");
        inlay.appendChild(inlayCircle2);
    }
    return inlay;
}

/// <summary>
/// Create the strings for the guitar neck based on the tuning.
/// </summary>
GuitarNeck.prototype.createStrings = function() {
    let stringCount = this.StringCount();  
    for (let i = 0; i < stringCount; i++) {        
        let string = this.createString(i);
        
        // Add the new string before the first fingering if it exists
        const firstFingering = this.svg.querySelector('.fingering'); 
        if (firstFingering) {
            this.svg.insertBefore(string, firstFingering);
        } else {
            this.svg.appendChild(string);
        }        
    }
}

/// <summary>
/// Create a string for the guitar neck based on the tuning index.
/// </summary>
GuitarNeck.prototype.createString = function(i) {     
    let string = document.createElementNS(this.svgNS, "line");
    let fbY = parseInt(this.fingerBoard.getAttribute("y"));        
    // let fbHeight = parseInt(this.fingerBoard.getAttribute("height"));    
    let edgeMargin = this.fingerboardEdgeMargin();        
    string.setAttribute("id", `string${i}`);
    string.setAttribute("class", "guitar_string");
    string.setAttribute("x1", (40 - this.string_overlap_length_behind_nut));
    string.setAttribute("y1", (this.string_spacing * i) + edgeMargin + fbY);
    string.setAttribute("x2", (1490 + this.string_overlap_length_behind_nut));
    string.setAttribute("y2", (this.string_spacing * i) + edgeMargin + fbY);
    string.setAttribute("stroke", "black");
    string.setAttribute("stroke-width", "2");

    // Add custom data attributes
    string.setAttribute("data-string-index", i);         
    let stringRootNote = parseInt(this.tuningMidiNumbers[i]);   
    string.setAttribute("data-string-root-note-number", stringRootNote);
    
    return string;
}

GuitarNeck.prototype.createFingerings = function() {
    let stringCount = this.StringCount();
    for (let i = 0; i < stringCount; i++) {
        let string = this.svg.querySelector(`#string${i}`);
        let stringY = parseInt(string.getAttribute("y1"));
        let stringRootNote = parseInt(string.getAttribute("data-string-root-note-number"));      
        for (let f = 0; f <= this.fretCount; f++) {
            let fingering = this.createFingering(i, f, stringRootNote, stringY);
            this.svg.appendChild(fingering);     
        }        
    }
}

GuitarNeck.prototype.createFingering = function(stringIndex, fretIndex, rootNote, stringY) {
    let fret = this.svg.querySelector(`line.fret[data-fret-index="${fretIndex}"]`);
    let fretX = parseInt(fret.getAttribute('x1'));
    let fingering = document.createElementNS(this.svgNS, "g");
    let note = new Note(rootNote + fretIndex);
    fingering.setAttribute("class", "fingering");
    fingering.setAttribute("id", `fingeringS${stringIndex}F${fretIndex}`);
    fingering.setAttribute("data-note-number", note.midiNumber);            
    fingering.setAttribute("data-string", stringIndex);
    fingering.setAttribute("data-fret", fretIndex);
    fingering.setAttribute("data-note-name", note.noteName);
    fingering.setAttribute("data-note-octave", note.octave);
    fingering.setAttribute("data-note-spelling", note.noteSpelling);
    fingering.setAttribute("data-note-frequency", note.frequency);

    let noteCircle = document.createElementNS(this.svgNS, "circle");
    noteCircle.setAttribute("class", "note");
    noteCircle.setAttribute("id", `note${note.midiNumber}s${stringIndex}f${fretIndex}`);            
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
    return fingering;
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
/// Create fingerings for the string at the given index.
/// also handles updating the notes if they already exist.
/// This method is called when a new string is added to the neck.
/// </summary>
GuitarNeck.prototype.createFingeringsForString = function(stringIndex) {
    let string = this.svg.querySelector(`line.guitar_string[data-string-index="${stringIndex}"]`);
    let stringY = parseInt(string.getAttribute('y1'));
    let rootNote = parseInt(string.getAttribute('data-string-root-note-number'));
    for (let f = 0; f <= this.fretCount; f++) {
        let fingering = this.createFingering(stringIndex, f, rootNote, stringY);        
        this.svg.appendChild(fingering);     
    }
    let fret_index = parseInt(this.lastFret.getAttribute('data-fret-index'));     
    this.handleNoteVisibilityBasedOnLastFret(fret_index);
}


/// <summary>
/// Add a note and note-text to a fingering group.
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
    let stringCount = this.StringCount();    
    let fb_stringAreaHeight = stringCount * this.string_spacing;
    let fb_final_height = fb_stringAreaHeight + (this.fingerboardEdgeMargin() * 2)
    this.fingerBoard.setAttribute('height', fb_final_height);
    this.nut.setAttribute('height', fb_final_height);    // resize the nut
    this.svg.setAttribute('height', fb_final_height - 20); // resize the svg
    this.updateFrets(); // resize the frets
    this.updateInlays(); // center the inlays vertically on the neck    
}

GuitarNeck.prototype.lastVisibleFret = function() {
    let frets = this.svg.querySelectorAll('line.fret');    
    for (var i = 1; i < frets.length; i++) {
        if (frets[i].getAttribute('x1') < (window.innerWidth - this.svg_right_margin)) {
            this.lastFret = frets[i];
        }
    }    
}

// strings are added to the end of the tuning array.
GuitarNeck.prototype.addStringToNeck = function(newStringRootNote) {
    // add the new string to the tuning array
    this.tuningMidiNumbers.push(parseInt(newStringRootNote));      
    // If the StringCount was 6 prior to adding a value to the tuning array, 
    // the index of the last string, at that time, would have been 5. 
    // The string count in bound to the tuning array. So if string count was 6 before,
    // it will now be 7, and the index of the last string will be 6.
    // the createString method receives the INDEX of the string being added. 
    // Allowing it to associate with the correct tuning array item.
    let string = this.createString(this.StringCount() - 1);

    // visually, a string must be defined in the svg before any element that it should appear under.
    // Add the new string before the first fingering if it exists. Otherwise the string line will 
    // appear above the fingering and notes.    
    const firstFingering = this.svg.querySelector('.fingering'); 
    if (firstFingering) {
        this.svg.insertBefore(string, firstFingering);
    } else {
        this.svg.appendChild(string);
    }        
    
    this.updateFingerings();      
    this.resetNeckHeight();  
}

/// <summary>
/// Remove the last string from the neck.
/// </summary>
GuitarNeck.prototype.removeStringFromNeck = function() {
    let guitarStrings = this.svg.querySelectorAll('line.guitar_string');    
    let stringCount = this.StringCount();
    if (stringCount > 1) {
        let stringRootNote = this.svg.querySelector(`line.guitar_string#string${stringCount - 1}`)
            .getAttribute('data-string-root-note-number');
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
            note.style.fill = 'gray';
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

GuitarNeck.prototype.ShowScale = function(scaleRootNote = "C", scaleType = "Major") {
    let scaleNotes = this.GetScaleNotes(scaleRootNote, scaleType);
    
    let noteCount = scaleNotes.length;
    this.hideAllNotes();
    for (let i = 0; i < noteCount; i++) {
        let note = scaleNotes[i];        
        console.log(`Showing ${note} notes`);
        for (let j = 0; j < this.StringCount(); j++) {
            let lastFretIndex = 0;
            if (this.lastFret) {
                lastFretIndex = parseInt(this.lastFret.getAttribute('data-fret-index'));
            } else {
                lastFretIndex = this.fretCount;
            }
            for (let f = 0; f <= lastFretIndex; f++) {
                let fingerings = this.svg.querySelectorAll(`g.fingering[data-note-name="${note}"][data-string="${j}"][data-fret="${f}"]`);
                fingerings.forEach(curFingering => {
                    let curNote = curFingering.querySelector('circle.note');
                    let curNoteText = curFingering.querySelector('text.note-text');
                    curNote.style.display = 'block';
                    curNoteText.style.display = 'block';
                    if (note == scaleRootNote) {
                        curNote.style.fill = 'blue';
                    } else {
                        curNote.style.fill = 'gray';
                    }   
                });            
            }
        }        
        this._allNotesAreHidden = false;
    }
}

GuitarNeck.prototype.GetScaleNotes = function(scaleRootNote, scaleType) {
    console.log(`Getting ${scaleType} scale notes for ${scaleRootNote}`);
    let scaleNotes = [];
    let notes = "C C# D D# E F F# G G# A A# B".split(" ");    
    let scalePattern = [];
    if (scaleType == "Major") {
        scalePattern = [2, 2, 1, 2, 2, 2, 1];                
    }
    if (scaleType == "Minor") {
        scalePattern = [2, 1, 2, 2, 1, 2, 2];
    }    
    if (scaleType == "Pentatonic") {
        scalePattern = [3, 2, 2, 3, 2];
    }
    if (scaleType == "Blues") {
        scalePattern = [3, 2, 1, 1, 3, 2];
    }
    if (scaleType == "Harmonic Minor") {
        scalePattern = [2, 1, 2, 2, 1, 3, 1];
    }
    if (scaleType == "Melodic Minor") {
        scalePattern = [2, 1, 2, 2, 2, 2, 1];
    }

    scaleNotes.push(scaleRootNote);
    let noteIndex = notes.indexOf(scaleRootNote);    
    console.log(`Scale Pattern: ${scalePattern}`);
    for (let i = 0; i < scalePattern.length; i++) {
        noteIndex = noteIndex + scalePattern[i];
        if (noteIndex > 11) {
            noteIndex = noteIndex - 12;
        }
        let nextNote = notes[noteIndex];
        scaleNotes.push(nextNote);
    }
    
    return scaleNotes;
}


GuitarNeck.prototype.renderStringPreview = function() {
    let stringPreview = document.createElementNS(this.svgNS, "svg");
    stringPreview.setAttribute("id", "stringPreview");
    stringPreview.setAttribute("width", "100");
    stringPreview.setAttribute("height", "100");    
}

GuitarNeck.prototype.NewStringLocationPreview = function(proposedStringRootNote) {
    const proposedRootNote = parseInt(proposedStringRootNote);    
    let tuningArray = this.tuningMidiNumbers();
    let stringCount = this.StringCount();    
    let targetPosition = null;

    if (proposedStringRootNote < tuningArray[0]) {
        targetPosition = 0; // index of the first string
    } 

    // we need to find the existing string that the new string will be inserted before
    if (!targetPosition){        // if the target position has not been set
        for (let i = 1; i < stringCount; i++) {     // start at the second string 
            let currentStringRootNote = tuningArray[i];
            if (proposedRootNote < currentStringRootNote) {
                // The new string will be inserted before the current string
                targetPosition = i;
                break;
            } else if (proposedRootNote == currentStringRootNote) {
                // return a message indicating that the string already exists
                targetPosition = -1;
                break;
            }            
        }
        if (!targetPosition) {
            targetPosition = stringCount; // the new string will be added to the end of the tuning array
        }
    }           
    
    // draw the representations.
    if (targetPosition >= 0) {
        let proposedString = this.createProposedString(targetPosition);
        
    }
}

