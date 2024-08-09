function Note(midiNumber) {
    this.midiNumber = midiNumber;
    this.noteName = this.getNoteName();
    this.octave = this.getOctave();
    this.frequency = this.getFrequency();
  }
  
  Note.prototype.toString = function() {
    return this.noteName + this.octave;
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
  
  Note.prototype.getNoteDetails = function() {
    return {
      noteName: this.noteName,
      octave: this.octave,
      frequency: this.frequency,
      spelling: this.toString()
    };
  };
  