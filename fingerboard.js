export default class FingerBoard {
    constructor(svgNS) {
        this.svgNS = svgNS;
        this.fingerBoard = null;
        this.nut = null;    
        this.fretCount = 24;
        this.lastVisibleFret = 24;
        this.frets = null;        
    }
    
    create = () => {
        this.fingerBoard = document.createElementNS(this.svgNS, "rect");
        this.fingerBoard.setAttribute("id", "fingerBoard");
        this.fingerBoard.setAttribute("x", "20");
        this.fingerBoard.setAttribute("y", "10");
        this.fingerBoard.setAttribute("width", "1500");
        this.fingerBoard.setAttribute("height", "180");
        this.fingerBoard.setAttribute("fill", "saddlebrown");
        return this.fingerBoard;        
    }    
}