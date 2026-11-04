
// TRACK THE USER'S CURSOR

let _r = canvas.getBoundingClientRect(), cursor = [0,0,0];
let setCursor = (e, z) => cursor = [ (e.clientX - _r.left) / canvas.width * 2 - 1,
                                     1 - (e.clientY - _r.top) / canvas.height * 2,
                                     z ?? cursor[2] ];
canvas.onmousedown = e => setCursor(e, 1);
canvas.onmousemove = e => setCursor(e,  );
canvas.onmouseup   = e => setCursor(e, 0);

// DEFINE A MATRIX OBJECT CLASS

let Matrix = function() {
   let xyz = (x,y,z) => x === undefined ? [1,1,1] : Array.isArray(x) ? x : [x, y ?? x, z ?? x];
   let mxm = (a, b) => a.map((A,n) => a[n&3]*b[n&12] + a[n&3|4]*b[n&12|1] + a[n&3|8]*b[n&12|2] + a[n&3|12]*b[n&12|3]);
   let C = t => Math.cos(t), S = t => Math.sin(t);

   // THE CURRENT MATRIX VALUE IS THE TOP ELEMENT OF A STACK

   let m = [ [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1] ], top = 0;

   // SET OR GET THE TOP VALUE OF THE STACK

   this.get  = () => m[top].slice();
   this.set  = _m => m[top] = _m.slice();

   // PUSH OR POP A MATRIX TO/FROM THE STACK

   this.push = () => { m[top+1] = m[top].slice(); top++; }
   this.pop  = () => --top;

   this.identity = ()    => m[top] = [ 1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1 ];
   this.inverse = () => {
      let co = (c, r) => {
         let s = (i, j) => m[top][c+i & 3 | (r+j & 3) << 2];
         return (c+r & 1 ? -1 : 1) * ( (s(1,1) * (s(2,2) * s(3,3) - s(3,2) * s(2,3)))
                                     - (s(2,1) * (s(1,2) * s(3,3) - s(3,2) * s(1,3)))
                                     + (s(3,1) * (s(1,2) * s(2,3) - s(2,2) * s(1,3))) );
      }
      let d = [], e = 0;
      for (let n = 0 ; n < 16 ; n++) d.push(co(n >> 2, n & 3));
      for (let n = 0 ; n <  4 ; n++) e += m[top][n] * d[n << 2];
      for (let n = 0 ; n < 16 ; n++) m[top][n] = d[n] / e;
   }
   this.move  = (x,y,z)  => { [x,y,z] = xyz(x,y,z); m[top] = mxm(m[top], [1,0,0,0, 0,1,0,0, 0,0,1,0, x,y,z,1]); }
   this.perspective = fl => m[top] = mxm(m[top], [1,0,0,0, 0,1,0,0, 0,0,1,-1/fl, 0,0,0,1]);
   this.scale = (x,y,z)  => { [x,y,z] = xyz(x,y,z); m[top] = mxm(m[top], [x,0,0,0, 0,y,0,0, 0,0,z,0, 0,0,0,1]); }
   this.turnX = t        => m[top] = mxm(m[top], [1,0,0,0, 0,C(t),S(t),0, 0,-S(t),C(t),0, 0,0,0,1]);
   this.turnY = t        => m[top] = mxm(m[top], [C(t),0,-S(t),0, 0,1,0,0, S(t),0,C(t),0, 0,0,0,1]);
   this.turnZ = t        => m[top] = mxm(m[top], [C(t),S(t),0,0, -S(t),C(t),0,0, 0,0,1,0, 0,0,0,1]);
}

// USEFUL MATH FUNCTIONS

let normalize = v => {
   let s = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
   return [ v[0] / s, v[1] / s, v[2] / s ];
}

