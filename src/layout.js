class Layout {
  constructor(name, string_order, fret_order) {
    this.name = name;  
    this.string_order = string_order;  
    this.fret_order = fret_order;  
  }

  print_layout() {
    console.log(`layout name: ${this.name}, string_order: ${this.string_order}, fret_order: ${this.fret_order}`);
  }
}

module.exports = Layout;