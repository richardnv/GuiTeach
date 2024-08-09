function FingerBoard(svgNS, fretCount, tuningMidiNumbers) {
    this.svgNS = svgNS;
    this.fingerBoard = null;
    this.nut = null;    
    this.fretCount = 24;
    this.lastVisibleFret = 24;
    this.frets = null;        
}

FingerBoard.prototype.Create = function() {
    this.fingerBoard = document.createElementNS(this.svgNS, "rect");
    this.fingerBoard.setAttribute("id", "fingerBoard");
    this.fingerBoard.setAttribute("x", "20");
    this.fingerBoard.setAttribute("y", "10");
    this.fingerBoard.setAttribute("width", "1500");
    this.fingerBoard.setAttribute("height", "180");
    this.fingerBoard.setAttribute("fill", "saddlebrown");
}

FingerBoard.prototype.CreateNut = function() {
    this.nut = document.createElementNS(this.svgNS, "rect");
    this.nut.setAttribute("id", "nut");
    this.nut.setAttribute("x", "20");
    this.nut.setAttribute("y", "100");
    this.nut.setAttribute("width", "1500");
    this.nut.setAttribute("height", "10");
    this.nut.setAttribute("fill", "black");
}


