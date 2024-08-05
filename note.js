function Note(midiNumber) {
    this.midiNumber = midiNumber;
    this.noteName = this.getNoteName();
    this.octave = this.getOctave();
    this.frequency = this.getFrequency();
    this.noteSpelling = this.getNoteSpelling();
}

Note.prototype.toString = function() {
    return this.noteName + this.octave;
};

Note.prototype.noteSpelling = function() {
    return this.noteName + this.octave;
};

Note.prototype.noteFrequency = function() {
    return this.frequency;
};

Note.prototype.noteMidiNumber = function() {    
    return this.midiNumber;
};

Note.prototype.noteOctave = function() {
    return this.octave;
};

Note.prototype.noteName = function() {
    return this.noteName;
};

Note.prototype.getNoteName = function() {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return noteNames[this.midiNumber % 12];
};

Note.prototype.getOctave = function() {
    return Math.floor(this.midiNumber / 12) - 1;
};

Note.prototype.getFrequency = function() {
    return 440 * Math.pow(2, (this.midiNumber - 69) / 12);
};

Note.prototype.getNoteSpelling = function() {
    return this.noteName + this.octave;
};

