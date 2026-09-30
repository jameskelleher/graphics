const NC = 5;
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
        let CG = [];

        let CA = [];
        let CD = [];
        let CS = [];

        let radius = .5;
        for (let i = 0; i < NC; i++) {
            let theta = 2 * Math.PI * i / NC + time / 10;
            CG.push(radius * Math.sin(2 * theta),
                radius * Math.cos(theta),
                -2.5 + .3 * Math.sin(theta),
                .25);
    
            let c = [
                .5 + .5 * Math.sin(2 * i),
                .5 + .5 * Math.sin(3 * i),
                .5 + .5 * Math.sin(4 * i),
            ];

            CA.push([.2 * c[0], .2 * c[1], .2 * c[2]]);
            CD.push(c);
            CS.push(1, 1, 1, 50);

        }

        setUniform('4fv', 'uCG', CG.flat());

        setUniform('3fv', 'uCA', CA.flat());
        setUniform('3fv', 'uCD', CD.flat());
        setUniform('4fv', 'uCS', CS.flat());

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