const NS = 5;
const NL = 2;


let normalize = v => {
    let s = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    return [v[0] / s, v[1] / s, v[2] / s];
}

function Scene(vertexShader, fragmentShader) {
    this.vertexShader = vertexShader;
    this.fragmentShader = fragmentShader;

    let startTime = Date.now() / 1000;

    this.update = () => {

        // Send current time to fragment shader

        let time = Date.now() / 1000 - startTime;
        setUniform('1f', 'uTime', time);

        // Send spheres data to fragment shader
        let SG = [];

        let SA = [];
        let SD = [];
        let SS = [];

        let radius = .5;
        for (let i = 0; i < NS; i++) {
            let theta = 2 * Math.PI * i / NS + time / 10;
            SG.push(radius * Math.sin(2 * theta),
                radius * Math.cos(theta),
                -2.5 + .3 * Math.sin(theta), .25);
            let c = [
                .5 + .5 * Math.sin(2 * i),
                .5 + .5 * Math.sin(3 * i),
                .5 + .5 * Math.sin(4 * i),
            ];

            SA.push([.2 * c[0], .2 * c[1], .2 * c[2]]);
            SD.push(c);
            SS.push(1, 1, 1, 50);

        }

        setUniform('4fv', 'uSG', SG.flat());

        setUniform('3fv', 'uSA', SA.flat());
        setUniform('3fv', 'uSD', SD.flat());
        setUniform('4fv', 'uSS', SS.flat());

        // Send light source directions to fragment shader

        let LG = [[2, 1, 1], [0, -1, 0]];

        // Normalize light source direction vectors

        for (let j = 0; j < NL; j++)
            LG[j] = normalize(LG[j]);
        setUniform('3fv', 'uLG', LG.flat());

        // Send light source colors to fragment shader

        let LC = [[.5, .75, 1], [.5, .2, .1]];
        setUniform('3fv', 'uLC', LC.flat());
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