const SECONDS_PER_RENDER_LOOP = 3600;
const METRES_PER_RENDER_UNIT = 25000000;
const KILOMETRES_PER_RENDER_UNIT = METRES_PER_RENDER_UNIT / 1000;
const G = 0.0000000000667430;

const getMass = function(querySelector1, querySelector2) {
    var input1 = document.querySelector(querySelector1);
    var input2 = document.querySelector(querySelector2);
    return parseFloat(input1.value) * Math.pow(10, parseInt(input2.value));
}

const getVelocity = function(querySelector) {
    var input = document.querySelector(querySelector);
    var velocityString = input.value;
    var positions = velocityString.replace('(', '').replace(')', '').split(',');

    return positions.map(pos => parseFloat(pos) / KILOMETRES_PER_RENDER_UNIT);
}

const getPosition = function(querySelector) {
    var input = document.querySelector(querySelector);
    var positionString = input.value;
    var positions = positionString.replace('(', '').replace(')', '').split(',');

    return positions.map(pos => parseFloat(pos) / KILOMETRES_PER_RENDER_UNIT);
}

const initBody = function(body, velx=0, vely=0, velz=0) {
    body.velx = velx;
    body.vely = vely;
    body.velz = velz;
};

const applyPhysics = function(bodys) {
    bodys.forEach(function(body) {
        body.accx = 0;
        body.accy = 0;
        body.accz = 0;
	});
	for (var i = 0; i < bodys.length - 1; i++) {
        for (var j = i + 1; j < bodys.length; j++) {
            var body1 = bodys[i];
            var body2 = bodys[j];
            if (body1 != body2) {
                var deltax = body1.position.x - body2.position.x;
                var deltay = body1.position.y - body2.position.y;
                var deltaz = body1.position.z - body2.position.z;
                var r = Math.sqrt(
                    Math.pow(deltax, 2) +
                    Math.pow(deltay, 2) +
                    Math.pow(deltaz, 2)
                ) * METRES_PER_RENDER_UNIT;
                var force = G * body1.mass * body2.mass / Math.pow(r, 2);
                var forcex = (deltax / r) * force;
                var forcey = (deltay / r) * force;
                var forcez = (deltaz / r) * force;
                body1.accx -= (forcex / body1.mass);
                body1.accy -= (forcey / body1.mass);
                body1.accz -= (forcez / body1.mass);
                body2.accx += (forcex / body2.mass);
                body2.accy += (forcey / body2.mass);
                body2.accz += (forcez / body2.mass);
            }
        }
    }
    bodys.forEach(function(body) {
        body.velx += (body.accx * SECONDS_PER_RENDER_LOOP);
        body.vely += (body.accy * SECONDS_PER_RENDER_LOOP);
        body.velz += (body.accz * SECONDS_PER_RENDER_LOOP);
    });

    bodys.forEach(function(body) {
        body.position.x += (body.velx * SECONDS_PER_RENDER_LOOP);
        body.position.y += (body.vely * SECONDS_PER_RENDER_LOOP);
        body.position.z += (body.velz * SECONDS_PER_RENDER_LOOP);
    });
};

const simulate = function() {

    var mass1 = getMass("#body1-mass", "#body1-mass-factor");
    var velocity1 = getVelocity("#body1-velocity");
    var position1 = getPosition("#body1-position");
    var mass2 = getMass("#body2-mass", "#body2-mass-factor");
    var velocity2 = getVelocity("#body2-velocity");
    var position2 = getPosition("#body2-position");
    var mass3 = getMass("#body3-mass", "#body3-mass-factor");
    var velocity3 = getVelocity("#body3-velocity");
    var position3 = getPosition("#body3-position");

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, (window.innerWidth - 360) / window.innerHeight, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize((window.innerWidth - 360), window.innerHeight);
    document.querySelector('.simulation-frame').innerHTML = '';
    document.querySelector('.simulation-frame').appendChild(renderer.domElement);

    let controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;

    const dirLight1 = new THREE.DirectionalLight( 0xffffff, 1.0 );
    dirLight1.position.set(10, 10, 10).normalize();
    scene.add(dirLight1);
    const ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(ambientLight);

    const lineMaterial = new THREE.LineBasicMaterial( { color: 0xffffff } );

    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material1 = new THREE.MeshPhongMaterial({color: 0x3273a8, shininess: 15});
    const material2 = new THREE.MeshPhongMaterial({color: 0xffffff, shininess: 15});
    const material3 = new THREE.MeshPhongMaterial({color: 0xe5eb34, shininess: 15});

    const sphere1 = new THREE.Mesh(geometry, material1);
    const sphere2 = new THREE.Mesh(geometry, material2);
    const sphere3 = new THREE.Mesh(geometry, material3);

    sphere1.position.set(position1[0], position1[1], position1[2]);
    sphere2.position.set(position2[0], position2[1], position2[2]);
    sphere3.position.set(position3[0], position3[1], position3[2]);
    let sphere1_pos = new THREE.Vector3(position1[0], position1[1], position1[2]);
    let sphere2_pos = new THREE.Vector3(position2[0], position2[1], position2[2]);
    let sphere3_pos = new THREE.Vector3(position3[0], position3[1], position3[2]);

    sphere1.mass = mass1;
    sphere2.mass = mass2;
    sphere3.mass = mass3;

    console.log(velocity1);
    initBody(sphere1, velx=velocity1[0], velx=velocity1[1], velx=velocity1[2]);
    initBody(sphere2, velx=velocity2[0], velx=velocity2[1], velx=velocity2[2]);
    initBody(sphere3, velx=velocity3[0], velx=velocity3[1], velx=velocity3[2]);

    scene.add(sphere1);
    scene.add(sphere2);
    scene.add(sphere3);

    const insetWidth = 150, insetHeight = 150;
    let container2 = document.getElementById('inset');
    container2.width = insetWidth;
    container2.height = insetHeight;
    let renderer2 = new THREE.WebGLRenderer( { alpha: true } );
    renderer2.setClearColor( 0x000000, 0 );
    renderer2.setSize( insetWidth, insetHeight );
    container2.innerHTML = '';
    container2.appendChild( renderer2.domElement );
    let scene2 = new THREE.Scene();
    let camera2 = new THREE.PerspectiveCamera(50, insetWidth / insetHeight, 1, 1000);
    camera2.up = camera.up;
    let axes2 = new THREE.AxesHelper(100);
    scene2.add(axes2);

    camera.position.z = 50;

    const animate = function () {
        requestAnimationFrame(animate);
        controls.update();

        applyPhysics([sphere1, sphere2, sphere3]);

        camera2.position.copy(camera.position );
        camera2.position.sub(controls.target );
        camera2.position.setLength(300);
        camera2.lookAt(scene2.position);

        renderer.render(scene, camera);
        renderer2.render(scene2, camera2);

        // let new_sphere1_pos = new THREE.Vector3(sphere1.position.x, sphere1.position.y, sphere1.position.z);
        // const line1 =  new THREE.Line(
        //     new THREE.BufferGeometry().setFromPoints([sphere1_pos, new_sphere1_pos]),
        //     lineMaterial
        // );
        // sphere1_pos = new_sphere1_pos;

        // let new_sphere2_pos = new THREE.Vector3(sphere2.position.x, sphere2.position.y, sphere2.position.z);
        // const line2 =  new THREE.Line(
        //     new THREE.BufferGeometry().setFromPoints([sphere2_pos, new_sphere2_pos]),
        //     lineMaterial
        // );
        // sphere2_pos = new_sphere2_pos;

        // let new_sphere3_pos = new THREE.Vector3(sphere3.position.x, sphere3.position.y, sphere3.position.z);
        // const line3 =  new THREE.Line(
        //     new THREE.BufferGeometry().setFromPoints([sphere3_pos, new_sphere3_pos]),
        //     lineMaterial
        // );
        // sphere3_pos = new_sphere3_pos;
        

        // scene.add(line1);
        // scene.add(line2);
        // scene.add(line3);

        renderer.render(scene, camera);
    };

    animate();
}