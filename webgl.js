
function GetFlatTriangle(gl) {
    // filled triangle viewed from face down in xy plane,
    return {
        vertices:  new Float32Array([0.0,0.5,-0.5,-0.5,0.5,-0.5]),
        verticesDim: 2,
        nVertices: 3,
        // triangles created by each disjoint sequence of 3 vertices
        // in this case only 1 triangle
        primtype: gl.TRIANGLES,
        fragColor: [1.0, 1.0, 1.0, 1.0], // white pixels
        zpos:  0.0, // specified in homogeneous coordinates
        lambda: 1.0, // specified in homogeneous coordinates
    }
}

function GetFlatSquare(gl) {
    return {
        // TL, TR, BL, BR
        vertices: new Float32Array([-0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5]),
        verticesDim: 2,
        nVertices: 4,
        primtype: gl.TRIANGLE_STRIP,
        fragColor: [1.0, 1.0, 1.0, 1.0], // white pixels
        zpos:  0.0, // specified in homogeneous coordinates
        lambda: 1.0, // specified in homogeneous coordinates
    }
}

function GetModelViewMatrix() {
    return new Float32Array(
        [1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, -3.333, 1]);
}

function GetProjectionMatrix() {
    return new Float32Array(
        [2.41421, 0, 0, 0,
            0, 2.41421, 0, 0,
            0, 0, -1.002002, -1,
            0, 0, -0.2002002, 0]);
}

function GetAttributes(gl, program) {
    return  {
        vertexPos: gl.getAttribLocation(program, 'ppos'),
        projectionMatrix: gl.getUniformLocation(program, 'uProjectionMatrix'),
        modelViewMatrix: gl.getUniformLocation(program, 'uModelViewMatrix'),
    }
}


function DarkBlueBackground(gl) {
    gl.clearColor(0.0, 0.0, 0.5, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

function BlackBackground(gl) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

function main() {
    var canvasId1 = "glcanvas1";
    var gl1 = execCanvas(canvasId1);
    var obj1 = GetFlatSquare(gl1);
    execObj(gl1, obj1);

    var canvasId2 = "glcanvas2";
    var gl2 = execCanvas(canvasId2);
    var obj2 = GetFlatTriangle(gl2);
    execObj(gl2, obj2);
}
window.onload = main;

function makeContext(canvas) {
    let gl;
    try {
        gl = canvas.getContext('experimental-webgl');
    } catch (e) {
        alert('exception: ' + e.toString());
    }
    if (!gl) { alert('unable to create webgl context'); }
    return gl;
}

function execCanvas(canvasId) {
    var canvas = document.getElementById(canvasId);
    let gl = makeContext(canvas);
    DarkBlueBackground(gl);
    return gl;
}

function execObj(gl, obj) {
    var program = CreateLinkValidate(gl, obj);
    MakeObject(gl, program, obj);
}

function CreateLinkValidate(gl, obj) {
    var program = gl.createProgram();
    var fshader = MakeFragmentShader(gl, obj);
    var vshader = MakeVertexShader(gl, obj);

    gl.attachShader(program, fshader);
    gl.attachShader(program, vshader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        alert("Error during program linking " + gl.getProgramInfoLog(program));
    }
    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        alert("Error during program validation:\n" + gl.getProgramInfoLog(program))
    }
    gl.useProgram(program);
    return program;
}

function MakeObject(gl, program, obj) {
    var attrs = GetAttributes(gl, program)
    var vertexpos = attrs.vertexPos;
    var vbuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbuffer);
    gl.bufferData(gl.ARRAY_BUFFER, obj.vertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(vertexpos, obj.verticesDim, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexpos);
    gl.drawArrays(obj.primtype, 0, obj.nVertices);
    gl.flush()
}

function MakeFragmentShader(gl, obj) {
    var fshader = gl.createShader(gl.FRAGMENT_SHADER);
    var cShader = `
void main(void) {
    gl_FragColor = vec4(${obj.fragColor[0].toFixed(1)}, ${obj.fragColor[1].toFixed(1)}, ${obj.fragColor[2].toFixed(1)}, ${obj.fragColor[3].toFixed(1)});
}
`
    gl.shaderSource(fshader, cShader);
    gl.compileShader(fshader);
    if (!gl.getShaderParameter(fshader, gl.COMPILE_STATUS)) {
        alert('error with compiling fragment shader\n' + gl.getShaderInfoLog(fshader));
    }
    return fshader;
}

function MakeVertexShader(gl, obj) {
    var vshader = gl.createShader(gl.VERTEX_SHADER);
    var cVShader = `
attribute vec2 ppos;
void main(void) {
  gl_Position = vec4(ppos.x, ppos.y, ${obj.zpos}, ${obj.lambda});
}
    `
    gl.shaderSource(vshader, cVShader);
    gl.compileShader(vshader);
    if (!gl.getShaderParameter(vshader, gl.COMPILE_STATUS)) {
        alert('Error during vertex shader compilation:\n' + gl.getShaderInfoLog(vshader));
    }
    return vshader;
}

const vsSource = `
    attribute vec4 aVertexPosition;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    }
  `;