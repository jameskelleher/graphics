const NS = 10;
const NL = 2;
const INTERVAL = 1;
const CANVAS = document.getElementById("canvas");

function Scene(vertexShader, fragmentShader) {
    
    let S = [];
    // head
    S.push(0, .3, -2, .15);

    // torso
    S.push(0, .1, -2, .05);
    S.push(0, 0, -2, .05);
    S.push(0, -.1, -2, .05);
    S.push(0, -.2, -2, .05);

    // left arm
    S.push(-.1, -.05, -2, .05);
    S.push(-.2, .05, -2, .05);
    S.push(-.3, .15, -2, .05);

    // right arm
    S.push(.1, -.05, -2, .05);
    S.push(.2, .05, -2, .05);
    S.push(.3, .15, -2, .05);

    // left leg
    S.push(-.1, -.3, -2, .05);
    S.push(-.2, -.4, -2, .05);
    S.push(-.3, -.5, -2, .05);

    // right leg
    S.push(.1, -.3, -2, .05);
    S.push(.2, -.4, -2, .05);
    S.push(.3, -.5, -2, .05);

    fragmentShader = fragmentShader.replace('NS = 10', `NS = ${S.length/4}`);

    console.log(fragmentShader)

    this.vertexShader = vertexShader;
    this.fragmentShader = fragmentShader;

    let startTime = Date.now() / 1000;
    let currentInterval = 0;
    let lastTime = startTime;

    let mouseX = 1;
    let mouseY = 1;

    canvas.addEventListener('mousemove', (e) => {
        const rect = CANVAS.getBoundingClientRect();
        mouseX = (e.clientX - rect.left) * (CANVAS.width / rect.width);
        mouseY = (e.clientY - rect.top) * (CANVAS.height / rect.height);
    });

    // document.addEventListener('mousemove', (event) => {
    //     mouseX = event.clientX / 800 - 0.5;
    //     mouseY = event.clientY / 800 - 0.5;

    //     setUniform('1f', 'mouseX', mouseX);
    //     setUniform('1f', 'mouseY', mouseY);
    // });

    this.update = () => {
        // Send current time to fragment shader

        let time = Date.now() / 1000 - startTime;
        setUniform('1f', 'uTime', time);

        // Send spheres data to fragment shader

        // let S = [];
        // let radius = .5;
        // for (let i = 0; i < NS; i++) {
        //     let theta = 2 * Math.PI * i / NS + time / 10;
        //     let sX = radius * Math.sin(2 * theta);
        //     let sY = radius * Math.cos(theta);
        //     let sZ = -2.5 + .3 * Math.sin(5 * theta);
        //     let sR = .1;
        //     S.push(sX, sY, sZ, sR);
        // }

        setUniform('4fv', 'uS', S);

        // Send light source directions to fragment shader

        let L = [
            2, 1, 1,
            0, -1, 0,
        ];

        // Normalize light source direction vectors

        for (let j = 0; j < NL; j++) {
            let x = L[3 * j], y = L[3 * j + 1], z = L[3 * j + 2];
            let r = Math.sqrt(x * x, y * y, z * z);
            L[3 * j] = x / r;
            L[3 * j + 1] = y / r;
            L[3 * j + 2] = z / r;
        }
        setUniform('3fv', 'uL', L);

        // Send light source colors to fragment shader

        setUniform('3fv', 'uC', [.5, .75, 1., .5, .2, .1]);

        setUniform('1f', 'mouseX', mouseX / 800 - 0.5);
        setUniform('1f', 'mouseY', mouseY / 800 - 0.5);
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