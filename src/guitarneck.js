const Layout = require('./layout.js');
const FingerBoard = require('./fingerboard.js');
const Note = require('./note.js');

/// <summary>
/// Represents a fretted stringed instrument.
/// The GuitarNeck class is a controlling structure for the SVG representation of a guitar neck. 
///     It contains the properties and methods that are needed for overall management of guitar neck as a whole.
///     Child classes: Fingerboard, Nut, Inlays[], Frets[], and Strings[].
/// <reference path="note.js" />
/// <reference path="layout.js" />
/// <reference path="fingerboard.js" />
/// </summary>
class GuitarNeck {    
    constructor(fret_count, tuning_array) {
        // Properties needed before we can start rendering the neck.
        this.fretCount = fret_count ? fret_count : 24; 
        this.tuning_array_raw = tuning_array ?? [40, 45, 50, 55, 59, 64];      

        this.svg = null; // SVG element root    
        this.fingerBoard = null; // SVG rect element         
        this.nut = null; // SVG rect element
        this.svgNS = "http://www.w3.org/2000/svg";
        this.svg_right_margin = 50;        
        this.string_overlap_length_behind_nut = 20;    
        this.lastFret = null;    
        this._allNotesAreHidden = false;
        this.fingeringsBaseX = 25;    
        this.defaultOverallHeight = 200;
        this.minHeight = 80;
        this.fretSpacing = 59;
        this.string_spacing = 30;
        this.fingerboardEdgeMargin = 15;
        this.layout_options = Array.of(new Layout('LEFTY_INSTRUCTOR','ASC','ASC'), 
            new Layout('GUITAR_TABISH','DESC','ASC'));
        this.layout = this.layout_options[1];
        this.layout.print_layout();
        this.working_tuning_array = this.make_working_tuning_array();
    }

    make_working_tuning_array = () => {
        let sortedTuning = this.tuning_array_raw;
        //console.log(`PreSort: ${sortedTuning}`);
        let curSortDirection = "DESC";
        if (this.tuning_array_raw[0] < this.tuning_array_raw[this.tuning_array_raw.length - 1]) {
            curSortDirection = "ASC";
        }
        if (this.layout.string_order != curSortDirection) {
            sortedTuning.reverse();
        }
        // console.log(`PostSort: ${sortedTuning}`);
        return sortedTuning;
    }
    
    svg_center_point = () => {
        let x = this.svg.getAttribute('width') / 2;
        let y = this.svg.getAttribute('height') / 2;
        return { x: x, y: y };
    }

// // function ideal_viewBox_point(svg) {
// //     let screen_center = svg_center_point(svg);
// //     let view_box = svg.getAttribute('viewBox').split(" ");
// //     let view_box_x = 200
// //     let view_box_y = parseFloat(view_box[1]);

// //     let x = svg.getAttribute('width') / 2;
// //     let y = svg.getAttribute('height') / 2;
// //     return { x: x, y: y };    
// // }

    render = () => {
        this.svg = document.createElementNS(this.svgNS, "svg");  
        let svg_width = window.innerWidth;
        let svg_view_box_width = window.innerWidth - 50;    
        let svg_height = window.innerHeight - 300;
        this.svg.setAttribute("id", "neckSvg");        
        this.svg.setAttribute("width", svg_width);
        this.svg.setAttribute("height", svg_height);
        // starting view_box_y value is the height of the svg element minus 200, divided by 2, then multiplied by -1.
        // this centers the view box vertically on the svg element.
        let view_box_y = (((svg_height - 200) / 2) * -1);                 
        let view_box_values = "0 " + view_box_y + " " + svg_view_box_width + " " + svg_height;
        this.svg.setAttribute("viewBox", view_box_values);


        // The fingerBoards vertical size is based on the number of strings
        // and the horizontal size is based initially on width of the page 
        //     but is overridden by the last visible fret.
        // (This compensates zooming in and out of the page)
        this.fingerBoard = new FingerBoard(this.svgNS).render();        
        this.svg.appendChild(this.fingerBoard);

        this.fbInfo = document.createElementNS(this.svgNS, "text");
        this.fbInfo.setAttribute("id", "fbInfo");
        this.fbInfo.setAttribute("x", "20");
        this.fbInfo.setAttribute("y", "200");
        this.fbInfo.setAttribute("class", "fb-info-text");
        this.fbInfo.setAttribute("text-anchor", "left");
        this.fbInfo.setAttribute("dy", ".5em");                     
        this.fbInfo.textContent = "Finger Board Info: Width: 1500 Height: 180";                
        this.svg.appendChild(this.fbInfo);

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
    }

    createFrets = () => {    
        for (let i = 0; i <= this.fretCount; i++) {
            let fret = this.createFret(i);
            this.svg.appendChild(fret);
        }
        let lastFretX = parseInt(this.lastFret.getAttribute('x1'));
        let newFingerBoardWidth = lastFretX -10;
        this.fingerBoard.setAttribute('width', newFingerBoardWidth);
    }

    createFret = (fretIndex) => {
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

    createInlays = () => {
        const inlays = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];
        inlays.forEach((inlay) => {
            let inlayGroup = this.createInlay(inlay);
            this.svg.appendChild(inlayGroup);
        });
    }

    createInlay = (inlayIndex) => {
        let inlay = document.createElementNS(this.svgNS, "g");
        inlay.setAttribute("class", "inlay");
        inlay.setAttribute("id", `inlayGroup${inlayIndex}`);
        inlay.setAttribute("data-fret-index", inlayIndex);
        let inlayCircle = document.createElementNS(this.svgNS, "circle");
        inlayCircle.setAttribute("class", "inlay");
        if (inlayIndex == 12 || inlayIndex == 24) {
            inlayCircle.setAttribute("id", `inlay${inlayIndex}-1`);
        } else {
            inlayCircle.setAttribute("id", `inlay${inlayIndex}`);
        }
        inlayCircle.setAttribute("cx", 50 + (this.fretSpacing * inlayIndex) - 30);
        inlayCircle.setAttribute("cy", inlayIndex == 12 || inlayIndex == 24 ? "50" : "100");
        inlayCircle.setAttribute("r", "5");
        inlayCircle.setAttribute("fill", "white");        
        
        inlay.appendChild(inlayCircle);        
        if (inlayIndex == 12 || inlayIndex == 24) {
            let inlayCircle2 = inlayCircle.cloneNode();
            inlayCircle2.setAttribute("id", `inlay${inlayIndex}-2`);
            inlayCircle2.setAttribute("cy", "150");
            inlay.appendChild(inlayCircle2);
        }
        return inlay;
    }

    createStrings = () => {
        let stringCount = this.working_tuning_array.length;  
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

// GuitarNeck.prototype.layoutTransform = function() {

// }

    createString = (stringIndex) => {         
        // console.log(`Local Tuning Array: ${this.working_tuning_array}`);
        // console.log(`String index: ${stringIndex}, Tuning Value: ${this.working_tuning_array[stringIndex]}`);
        let string = document.createElementNS(this.svgNS, "line");
        let fbY = parseInt(this.fingerBoard.getAttribute("y"));        
        // let fbHeight = parseInt(this.fingerBoard.getAttribute("height"));    
        let edgeMargin = this.fingerboardEdgeMargin;        
        string.setAttribute("id", `string${stringIndex}`);
        string.setAttribute("class", "guitar_string");
        string.setAttribute("x1", (40 - this.string_overlap_length_behind_nut));
        string.setAttribute("y1", (this.string_spacing * stringIndex) + edgeMargin + fbY);
        string.setAttribute("x2", (1490 + this.string_overlap_length_behind_nut));
        string.setAttribute("y2", (this.string_spacing * stringIndex) + edgeMargin + fbY);
        string.setAttribute("stroke", "black");
        string.setAttribute("stroke-width", "2");

        // Add custom data attributes
        string.setAttribute("data-string-index", stringIndex);         
        let stringRootNote = parseInt(this.working_tuning_array[stringIndex]);   
        string.setAttribute("data-string-root-note-number", stringRootNote);
        
        return string;
    }

    createFingerings = () => {
        let stringCount = this.working_tuning_array.length;
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

    createFingering = (stringIndex, fretIndex, rootNote, stringY) => {
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
                    
        
        let noteText = document.createElementNS(this.svgNS, "text");
        noteText.setAttribute("x", fretX - 15);
        noteText.setAttribute("y", stringY);
        noteText.setAttribute("class", "note-text");
        noteText.setAttribute("text-anchor", "middle");
        noteText.setAttribute("dy", ".3em");                     
        noteText.textContent = note.toString();
        fingering.appendChild(noteText);
        return fingering;
    }

    updateFingerings = () => {
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
    createFingeringsForString = (stringIndex) => {
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
    addNoteForString = (noteNumber, stringIndex, fretIndex, fretX, stringY) => {
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

    removeNotesForString = (stringIndex) => {
        let notes = this.svg.querySelectorAll(`circle.note[data-string="${stringIndex}"]`);
        notes.forEach(curNote => {
            curNote.remove();
        });
    }

    // adjustNeckWidth = () => {
    //     let pageWidth = window.innerWidth;
    //     // Example: Adjust the rectangle width based on the page width     
    //     this.svg.setAttribute('width', (pageWidth - this.svg_right_margin).toString());    
    //     this.lastVisibleFret();
    //     let lastFretX = parseInt(this.lastFret.getAttribute('x1'));
    //     let newFingerBoardWidth = lastFretX;
    //     // Adjust the fingerboard width based on the last visible fret
    //     this.fingerBoard.setAttribute('width', newFingerBoardWidth);
    //     this.handleElementVisibility();
    //     return this.lastFret.getAttribute('id');    
    // } 

    handleElementVisibility = () => {
        let fret_index = parseInt(this.lastFret.getAttribute('data-fret-index'));    
        //if (fret_index < this.fretCount) {
            this.handleNoteVisibilityBasedOnLastFret(fret_index);
            this.handleFretVisibilityBasedOnLastFret(fret_index);
            this.hideInlayVisibilityBasedOnLastFret(fret_index);
        // } 
    } 

    handleNoteVisibilityBasedOnLastFret = (fret_index) => {
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
                    if (note.style.display == 'none') {
                        note.style.display = 'block';
                        noteText.style.display = 'block';
                    }
                }
            });
        } 
    }

    handleFretVisibilityBasedOnLastFret = (fret_index) => {
        let frets = this.svg.querySelectorAll('line.fret');
        frets.forEach(fret => {
            let _fret_index = parseInt(fret.getAttribute('data-fret-index'));
            if (_fret_index > fret_index) {
                fret.style.display = 'none';
            } else if (_fret_index <= fret_index) {
                if (fret.style.display == 'none') {
                    fret.style.display = 'block';
                }
            }
        });
    }

    hideInlayVisibilityBasedOnLastFret = (fret_index) => {
        let inlays = this.svg.querySelectorAll('circle.inlay');
        inlays.forEach(inlay => {
            let inlay_fret_index = parseInt(inlay.getAttribute('data-fret-index'));
            if (inlay_fret_index > fret_index) {
                inlay.style.display = 'none';
            } else if (inlay_fret_index <= fret_index) {
                if (inlay.style.display == 'none') {
                    inlay.style.display = 'block';
                }
            }   
        });
    }

    /// <summary>
    /// Adjust the frets to match the neck height        
    /// </summary>
    updateFrets = () => {
        let frets = this.svg.querySelectorAll('line.fret');
        let fb_height = parseInt(this.fingerBoard.getAttribute('height'));
        let fret_count = frets.length;
        for (let i = 0; i < fret_count; i++) {
            let fretY = parseInt(frets[i].getAttribute('y1'));
            frets[i].setAttribute('y2', fretY + fb_height);
        }
    }

    /// <summary>
    /// Adjust the inlays to match the neck height
    /// </summary>
    updateInlays = () => {
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
    resetNeckHeight = () => {    
        let stringCount = this.working_tuning_array.length;    
        let fb_stringAreaHeight = stringCount * this.string_spacing;
        let fb_final_height = fb_stringAreaHeight + (this.fingerboardEdgeMargin * 2)
        this.fingerBoard.setAttribute('height', fb_final_height);
        this.nut.setAttribute('height', fb_final_height);    // resize the nut
        this.svg.setAttribute('height', fb_final_height - 20); // resize the svg
        this.updateFrets(); // resize the frets
        this.updateInlays(); // center the inlays vertically on the neck    
    }

    lastVisibleFret = () => {
        let frets = this.svg.querySelectorAll('line.fret');    
        for (var i = 1; i < frets.length; i++) {
            if (frets[i].getAttribute('x1') < (window.innerWidth - this.svg_right_margin)) {
                this.lastFret = frets[i];
            }
        }    
    }

    // strings are added to the end of the tuning array.
    addStringToNeck = (newStringRootNote) => {
        // add the new string to the tuning array
        this.tuningMidiNumbers.push(parseInt(newStringRootNote));      
        // If the StringCount was 6 prior to adding a value to the tuning array, 
        // the index of the last string, at that time, would have been 5. 
        // The string count in bound to the tuning array. So if string count was 6 before,
        // it will now be 7, and the index of the last string will be 6.
        // the createString method receives the INDEX of the string being added. 
        // Allowing it to associate with the correct tuning array item.
        let string = this.createString(this.working_tuning_array.length - 1);

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
    removeStringFromNeck = () => {
        let guitarStrings = this.svg.querySelectorAll('line.guitar_string');    
        let stringCount = this.working_tuning_array.length;
        if (stringCount > 1) {
            let stringRootNote = this.svg.querySelector(`line.guitar_string#string${stringCount - 1}`)
                .getAttribute('data-string-root-note-number');
            this.removeNotesForString(stringCount - 1);
            this.tuningMidiNumbers.pop(stringRootNote);        
            guitarStrings[stringCount - 1].remove();        
            this.resetNeckHeight();
        }
    }

    hideAllNotes = () => {
        const fingerings = this.svg.querySelectorAll('g.fingering');
        fingerings.forEach(fingering => {
            let note = fingering.querySelector('circle.note');
            let noteText = fingering.querySelector('text.note-text');
            note.style.display = 'none';
            noteText.style.display = 'none';
        });
        this._allNotesAreHidden = true;
    }

    showAllNotes = () => {
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

    AllNotesAreHidden = () => {
        return this._allNotesAreHidden;
    }

    StringCount = () => {
        return this.tuning_array_raw.length;
    }

    GetFingeringInfo = (stringIndex, fretIndex) => {
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

    ShowScale = (scaleRootNote = "C", scaleType = "Major") => {
        let scaleNotes = this.GetScaleNotes(scaleRootNote, scaleType);
        
        let noteCount = scaleNotes.length;
        this.hideAllNotes();
        for (let i = 0; i < noteCount; i++) {
            let note = scaleNotes[i];        
            console.log(`Showing ${note} notes`);
            for (let j = 0; j < this.working_tuning_array.length; j++) {
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

    GetScaleNotes = (scaleRootNote, scaleType) => {
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

renderStringPreview = function() {

    let pv_fb_margin = 10;
    let pv_string_spacing = 16;
    let stringCount = this.working_tuning_array.length;
    let pv_SVG_height = stringCount * pv_string_spacing + (pv_fb_margin * 2); // 6  = 6 * 16 + 10 * 2 = 96 + 20 = 116


    let stringPreviewSVG = document.createElementNS(this.svgNS, "svg");
    stringPreviewSVG.setAttribute("id", "stringPreviewSVG");
    stringPreviewSVG.setAttribute("x", "0");
    stringPreviewSVG.setAttribute("y", "0");
    stringPreviewSVG.setAttribute("width", "100");
    stringPreviewSVG.setAttribute("height", (pv_SVG_height).toString());    
    let stringPreviewNeck = document.createElementNS(this.svgNS, "rect");
    stringPreviewNeck.setAttribute("x", "10");
    stringPreviewNeck.setAttribute("y", "0");
    stringPreviewNeck.setAttribute("width", "90");
    stringPreviewNeck.setAttribute("height", (pv_SVG_height).toString());
    stringPreviewNeck.setAttribute("stroke", "black");
    stringPreviewNeck.setAttribute("stroke-width", "2");
    stringPreviewNeck.setAttribute("fill", "white");
    stringPreviewSVG.appendChild(stringPreviewNeck);
    let firstStringY = pv_fb_margin;
    for (let i = 0; i < this.working_tuning_array.length; i++) {
        let existingString = document.createElementNS(this.svgNS, "line");
        existingString.setAttribute("x1", "2");
        let thisStringY = firstStringY + (pv_string_spacing * i);        
        existingString.setAttribute("y1", (thisStringY).toString());
        existingString.setAttribute("x2", "100");
        existingString.setAttribute("y2", (thisStringY).toString());
        existingString.setAttribute("stroke", "black");
        existingString.setAttribute("stroke-width", "2");        
        stringPreviewSVG.appendChild(existingString);
    }
    let previewStringPointer = document.createElementNS(this.svgNS, "polygon");
    previewStringPointer.setAttribute("id", "previewStringPointer");
    let pointerCenterRef = firstStringY + (pv_string_spacing * stringCount);
    let pX1 = "0";
    let pY1 = (pointerCenterRef - 5).toString();
    let pX2 = "10";
    let pY2 = (pointerCenterRef).toString();
    let pY3 = (pointerCenterRef + 5).toString();
    previewStringPointer.setAttribute("points", `${pX1},${pY1} ${pX2},${pY2} ${pX1},${pY3}`);
    previewStringPointer.setAttribute("fill", "red");
    stringPreviewSVG.appendChild(previewStringPointer);
    let previewStringLine = document.createElementNS(this.svgNS, "line");        
    previewStringLine.setAttribute("id","previewStringLine");
    previewStringLine.setAttribute("x1","10");
    previewStringLine.setAttribute("x2","100");
    previewStringLine.setAttribute("y1",(pointerCenterRef).toString()); 
    previewStringLine.setAttribute("y2",(pointerCenterRef).toString()); 
    previewStringLine.setAttribute("stroke","red");
    previewStringLine.setAttribute("stroke-width","1.5");
    stringPreviewSVG.appendChild(previewStringLine);    
    return stringPreviewSVG;
}

NewStringLocationPreview = function(proposedStringRootNote) {
    const proposedRootNote = parseInt(proposedStringRootNote);    
    let tuningArray = this.tuningMidiNumbers();
    let stringCount = this.working_tuning_array.length;    
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
    
    // // draw the representations.
    // if (targetPosition >= 0) {
    //     let proposedString = this.createProposedString(targetPosition);
        
    // }
}

    zoomNeck = (zoomValue) => {
        let view_box = this.svg.getAttribute('viewBox').split(" ");
        let svgH = this.svg.getAttribute('height');
        let svhW = this.svg.getAttribute('width');
        let svgRatio = svgH / svhW;
        let neckH = parseInt(this.fingerBoard.getAttribute('height')) + 30;        
        let diff = svgH - neckH;
        let newHeight = svgH - (diff * (zoomValue / 100));
        let newWidth = newHeight / svgRatio;
        let ydiff = (svgH - neckH) / 2;
        // newY is the svg height minus the neck height divided by 2 minus 15
        let newY = (ydiff * (1.0 - (zoomValue / 100))) * -1;
        view_box[1] = newY.toString();
        view_box[2] = newWidth.toString();
        view_box[3] = newHeight.toString();
        this.svg.setAttribute('viewBox', view_box.join(" "));
    }

    scrollNeck = (scrollValue) => {
        let view_box = this.svg.getAttribute('viewBox').split(" ");        
        let svgW = this.svg.getAttribute('width');
        let scrollMod = (svgW / view_box[2] / 2);
        let newX = (svgW * (scrollValue / 100)) * scrollMod;
        view_box[0] = newX.toString();        
        this.svg.setAttribute('viewBox', view_box.join(" "));
    }

    print_layout = (curLayout) => {
        console.log(`Layout Name: ${curLayout.layout_name}`);
        console.log(`String Order: ${curLayout.string_order}`);
        console.log(`Fret Order: ${curLayout.fret_order}`);
    }

    setNeckLayout = (layoutName) => {
        this.layout = layoutName.toUpperCase();    
        this.working_tuning_array = this.make_working_tuning_array();                
    }
}

module.exports = GuitarNeck;