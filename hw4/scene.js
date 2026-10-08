const NS = 5;
const NL = 2;


// Track the user's cursor

let r = canvas.getBoundingClientRect(), cursor = [0, 0, 0];
let setCursor = (e, z) => cursor = [(e.clientX - r.left) / canvas.width * 2 - 1,
1 - (e.clientY - r.top) / canvas.height * 2,
z ?? cursor[2]];
canvas.onmousedown = e => setCursor(e, 1);
canvas.onmousemove = e => setCursor(e,);
canvas.onmouseup = e => setCursor(e, 0);

// Convenient vector functions

let normalize = v => {
    let s = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    return [v[0] / s, v[1] / s, v[2] / s];
}

// Define a Matrix object

let Matrix = function () {
    let m;
    let xyz = (x, y, z) => x === undefined ? [1, 1, 1] : Array.isArray(x) ? x : [x, y ?? x, z ?? x];
    let mxm = (a, b) => a.map((A, n) => a[n & 3] * b[n & 12] + a[n & 3 | 4] * b[n & 12 | 1] + a[n & 3 | 8] * b[n & 12 | 2] + a[n & 3 | 12] * b[n & 12 | 3]);
    let C = t => Math.cos(t), S = t => Math.sin(t);

    this.get = () => m;
    this.identity = () => m = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    this.inverse = () => {
        let co = (c, r) => {
            let s = (i, j) => m[c + i & 3 | (r + j & 3) << 2];
            return (c + r & 1 ? -1 : 1) * ((s(1, 1) * (s(2, 2) * s(3, 3) - s(3, 2) * s(2, 3)))
                - (s(2, 1) * (s(1, 2) * s(3, 3) - s(3, 2) * s(1, 3)))
                + (s(3, 1) * (s(1, 2) * s(2, 3) - s(2, 2) * s(1, 3))));
        }
        let d = [], e = 0;
        for (let n = 0; n < 16; n++) d.push(co(n >> 2, n & 3));
        for (let n = 0; n < 4; n++) e += m[n] * d[n << 2];
        for (let n = 0; n < 16; n++) m[n] = d[n] / e;
    }
    this.move = (x, y, z) => { [x, y, z] = xyz(x, y, z); m = mxm(m, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]); }
    this.perspective = fl => m = mxm(m, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, -1 / fl, 0, 0, 0, 1]);
    this.scale = (x, y, z) => { [x, y, z] = xyz(x, y, z); m = mxm(m, [x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1]); }
    this.turnX = t => m = mxm(m, [1, 0, 0, 0, 0, C(t), S(t), 0, 0, -S(t), C(t), 0, 0, 0, 0, 1]);
    this.turnY = t => m = mxm(m, [C(t), 0, -S(t), 0, 0, 1, 0, 0, S(t), 0, C(t), 0, 0, 0, 0, 1]);
    this.turnZ = t => m = mxm(m, [C(t), S(t), 0, 0, -S(t), C(t), 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
}

function Scene(vertexShader, fragmentShader) {
    this.vertexShader = vertexShader;
    this.fragmentShader = fragmentShader;

    let startTime = Date.now() / 1000;

    this.update = () => {

        // Send current time to fragment shader

        let time = Date.now() / 1000 - startTime;
        setUniform('1f', 'uTime', time);
        setUniform('3fv', 'uCursor', cursor);
        console.log(cursor);

        // Send data to fragment shader
        let SA = [];
        let SD = [];
        let SS = [];

        let radius = .5;
        for (let i = 0; i < NS; i++) {
            // let theta = 2 * Math.PI * i / NC + time / 10;
            // SG.push(radius * Math.sin(2 * theta),
            //     radius * Math.cos(theta),
            //     -2.5 + .3 * Math.sin(theta),
            //     .25);

            let c = [
                .5 + .5 * Math.sin(2 * i),
                .5 + .5 * Math.sin(3 * i),
                .5 + .5 * Math.sin(4 * i),
            ];

            SA.push([.2 * c[0], .2 * c[1], .2 * c[2]]);
            SD.push(c);
            SS.push(1, 1, 1, 50);

        }

        setUniform('3fv', 'uSA', SA.flat());
        setUniform('3fv', 'uSD', SD.flat());
        setUniform('4fv', 'uSS', SS.flat());

        // Send light source directions to fragment shader

        let LG = [[2, 1, 1], [0, -1, 0]];
        // let LG = [[0.1, 0.1, 1], [0, -1, 0]];

        // Normalize light source direction vectors

        for (let j = 0; j < NL; j++)
            LG[j] = normalize(LG[j]);
        setUniform('3fv', 'uLG', LG.flat());

        // Send light source colors to fragment shader

        let LC = [[.5, .75, 1], [.5, .2, .1]];
        setUniform('3fv', 'uLC', LC.flat());

        let SM = [];
        let m = new Matrix();
        for (let i = 0; i < NS; i++) {
            m.identity();
            m.move(.35 * (i - 2), 0, -3);
            m.turnX(time/3);
            m.turnY(time/4);
            m.turnZ(time/5);
            m.scale(.15);
            m.inverse();
            SM.push(m.get());
        }

        setUniform('Matrix4fv', 'uSM', false, SM.flat());
    }

}

async function loadShader(url) {
    const res = await fetch(url);
    return res.text();
}

const [vertexShader, fragmentShader] = await Promise.all([
    loadShader('scene.vert'),
    loadShader('scene.frag')
]);

gl_start(canvas, new Scene(vertexShader, fragmentShader));