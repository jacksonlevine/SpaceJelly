// only covers a small subset of the Map api!
// haven't debugged yet!

export default class BigMap {
  constructor(iterable) {
    if(iterable) throw new Error("haven't implemented construction with iterable yet");
    this._maps = [new Map()];
    this._perMapSizeLimit = 14000000;
    this.size = 0;
  }
  has(key) {
    for(let map of this._maps) {
      if(map.has(key)) return true;
    }
    return false;
  }
  get(key) {
    for(let map of this._maps) {
      if(map.has(key)) return map.get(key);
    }
    return undefined;
  }
  set(key, value) {
    for(let map of this._maps) {
      if(map.has(key)) {
        map.set(key, value);
        return this;
      }
    }
    let map = this._maps[this._maps.length-1];
    if(map.size > this._perMapSizeLimit) {
      map = new Map();
      this._maps.push(map);
    }
    map.set(key, value);
    this.size++;
    return this;
  }
  entries() {
    let mapIndex = 0;
    let entries = this._maps[mapIndex].entries();
    return {
      next: () => {
        let n = entries.next();
        if(n.done) {
          if(this._maps[++mapIndex]) {
            entries = this._maps[mapIndex].entries();
            return entries.next();
          } else {
            return {done:true};
          }
        } else {
          return n;
        }
      }
    };
  }
  [Symbol.iterator]() {
    return this.entries();
  }
  delete(key) { throw new Error("haven't implemented this yet"); }
  keys() { throw new Error("haven't implemented this yet"); }
  values() { throw new Error("haven't implemented this yet"); }
  forEach(fn) { throw new Error("haven't implemented this yet"); }
  clear() { throw new Error("haven't implemented this yet"); }
}