const NS = 50;
const NL = 2;

function Scene(vertexShader, fragmentShader) {
    this.vertexShader = vertexShader;
    this.fragmentShader = fragmentShader;

    let startTime = Date.now() / 1000;

    this.update = () => {
        // Send current time to fragment shader

        let time = Date.now() / 1000 - startTime;
        setUniform('1f', 'uTime', time);

        // Send spheres data to fragment shader

        let S = [];
        let radius = .5;
        for (let i = 0; i < NS; i++) {
            let theta = 2 * Math.PI * i / NS + time / 10;
            S.push(radius * Math.sin(2 * theta),
                radius * Math.cos(theta),
                -2.5 + .3 * Math.sin(5 * theta), .1);
        }

        setUniform('4fv', 'uS', S);

        // Send light source directions to fragment shader

        let L = [
            2, 1, 1,
            0, -1, 0,
        ];

        // Normalize light source direction vectors

        for (let j = 0; j < NL; j++) {
            let x = L[3 * j], y = L[3 * j + 1], z = L[3 * j + 2];
            let r = Math.sqrt(x*x, y*y, z*z);
            L[3*j] = x/r;
            L[3*j+1] = y/r;
            L[3*j+2] = z/r;
        }
        setUniform('3fv', 'uL', L);

        // Send light source colors to fragment shader

        setUniform('3fv', 'uC', [.5,.75,1.,.5,.2,.1]);
    };
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