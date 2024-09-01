class Note {
  constructor(midiNumber) {
    this.midiNumber = midiNumber;
    this.noteName = this.getNoteName();
    this.octave = this.getOctave();
    this.frequency = this.getFrequency();
  }    
  
  toString = () => {
    return this.noteName + this.octave;
  };

  getNoteName = () => {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return noteNames[this.midiNumber % 12];
  };
  
  getOctave = () => {
    return Math.floor(this.midiNumber / 12) - 1;
  };
  
  getFrequency = () => {
    return 440 * Math.pow(2, (this.midiNumber - 69) / 12);
  };
  
  getNoteDetails = () => {
    return {
      noteName: this.noteName,
      octave: this.octave,
      frequency: this.frequency,
      spelling: this.toString()
    };
  };
}

// Export for Node.js
module.exports = Note;