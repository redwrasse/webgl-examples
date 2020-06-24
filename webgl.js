
var gl;
function start() {
    var canvas = document.getElementById("glcanvas");
    gl = null;
    try {
        gl = canvas.getContext('experimental-webgl');
    } catch (e) {
        alert('exception: ' + e.toString());
    }
    if (!gl) { alert('unable to create webgl context'); return; }
    gl.clearColor(0.0, 0.0, 0.5, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

function makeFragmentShader() {
    var fshader = gl.createShader(gl.FRAGMENT_SHADER);
    var cShader = `
void main(void) {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
`
    gl.shaderSource(fshader, cShader);
    gl.compileShader(fshader);
    if (!gl.getShaderParameter(fshader, gl.COMPILE_STATUS)) {
        alert('error with compiling fragment shader\n' + gl.getShaderInfoLog(fshader));
    }
}

function makeVertexShader() {
    var vshader = gl.createShader(gl.VERTEX_SHADER);
    var cVShader = `
attribute vec2 ppos;
void main(void)
{
  gl_Position = vec4(ppos.x, ppos.y, 0.0, 1.0);
}
    `
    gl.shaderSource(vshader, cVShader);
}

