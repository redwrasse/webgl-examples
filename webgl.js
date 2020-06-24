let gl;

function GetFlatTriangle() {
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

function GetFlatSquare() {
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

function DarkBlueBackground() {
    gl.clearColor(0.0, 0.0, 0.5, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

function BlackBackground() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

function Start() {
    var canvasId1 = "glcanvas1";
    execCanvas(canvasId1);
    var obj1 = GetFlatSquare();
    execObj(obj1);

    var canvasId2 = "glcanvas2";
    execCanvas(canvasId2);
    var obj2 = GetFlatTriangle();
    execObj(obj2);
}

function makeContext(canvas) {
    gl = null;
    try {
        gl = canvas.getContext('experimental-webgl');
    } catch (e) {
        alert('exception: ' + e.toString());
    }
    if (!gl) { alert('unable to create webgl context'); }

}

function execCanvas(canvasId) {
    var canvas = document.getElementById(canvasId);
    makeContext(canvas);
    DarkBlueBackground();
}

function execObj(obj) {
    var program = CreateLinkValidate(obj);
    MakeObjects(program, obj);
}

function CreateLinkValidate(obj) {
    var program = gl.createProgram();
    var fshader = MakeFragmentShader(obj);
    var vshader = MakeVertexShader(obj);

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

function MakeObjects(program, obj) {
    var vattrib = GetAttributeVar(program);
    var vbuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbuffer);
    MakeObj(obj, vattrib);
    gl.flush()
}

function MakeObj(obj, vattrib) {
    gl.bufferData(gl.ARRAY_BUFFER, obj.vertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(vattrib, obj.verticesDim, gl.FLOAT, false, 0, 0);
    gl.drawArrays(obj.primtype, 0, obj.nVertices);
}

function GetAttributeVar(program) {
    // Gets address of the input 'attribute' of the vertex shader
    var vattrib = gl.getAttribLocation(program, 'ppos');
    if(vattrib === -1)
    {alert('Error during attribute address retrieval');return;}
    gl.enableVertexAttribArray(vattrib);
    return vattrib;
}

function MakeFragmentShader(obj) {
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

function MakeVertexShader(obj) {
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

var cVShader = `
attribute vec3 vertexPos;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
void main(void) {
    
}
`