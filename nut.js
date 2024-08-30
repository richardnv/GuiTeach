export default class Nut {
    constructor(svgNS) {
        this.svgNS = svgNS;        
        this.nut = document.createElementNS(this.svgNS, "rect");
        this.nut.setAttribute("id", "nut");
        this.nut.setAttribute("x", "20");
        this.nut.setAttribute("y", "100");
        this.nut.setAttribute("width", "1500");
        this.nut.setAttribute("height", "10");
        this.nut.setAttribute("fill", "black");        
    }
}
