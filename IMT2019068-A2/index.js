import { vec3, mat4,vec4 } from 'https://cdn.skypack.dev/gl-matrix';
import Shader from './shader.js';
import vertexShaderSrc from './vertex.js';
import fragmentShaderSrc from './fragment.js';
import Renderer from './renderer.js';
import ax_1 from './ax_1.js';
import ax_2 from './ax_2.js';
import ax_3 from './ax_3.js';
import Ant from './ant.js';
import Saturn from './saturn.js';
import Cup from './cup.js';

const renderer = new Renderer();
const gl = renderer.webGlContext();

const shader = new Shader(gl, vertexShaderSrc, fragmentShaderSrc);
shader.use();
const project = mat4.create();
const view = mat4.create();
init();
let vx = 0
let theta = 0
let systemMode = 'a'
let items = []
let flag = 0
let eye = [2, 1.2, 1.5]
let up = [0, 0, 1]
let topView = false;

let selectedObject = -1
let angles_x = [0,0,0], angles_y = [0,0,0],angles_z = [0,0,0]
let stationary_mode = true;
let mode = "a"
let clicked_coordinates = [-1, -1]
let points = []
let t = 0.1
let difference = 0.0001

function rotateCamera(rotationAxis,rotationAngle){
  var temp = [eye[0],eye[1],eye[2],1];
  var transfromMatrix = mat4.create();
  mat4.identity(transfromMatrix);
  mat4.rotate(transfromMatrix, transfromMatrix, rotationAngle, rotationAxis);
  vec4.transformMat4(temp,temp,transfromMatrix);
  eye = temp.slice(0,3);

  temp = [up[0],up[1],up[2],1];
  mat4.identity(transfromMatrix);
  mat4.rotate(transfromMatrix, transfromMatrix, rotationAngle, rotationAxis);
  vec4.transformMat4(temp,temp,transfromMatrix);
  up = temp.slice(0,3);

  mat4.lookAt(view,eye,[0,0,0],up);
  mat4.perspective(project, 1, 1, 0.1, 100);

  const projectUniform = shader.uniform("project");
  shader.setUniformMatrix4fv(projectUniform, project);

  const viewUniform = shader.uniform("view");
  shader.setUniformMatrix4fv(viewUniform, view);

}


window.onload = () => {

  renderer.getCanvas().addEventListener('mousemove', (event) => {
    if (!topView) {
      if (vx > event.offsetX) {
        theta = 0.03;
      }
      else if (vx < event.offsetX) {
        theta = - 0.03;
      }
      vx = event.offsetX;
        if (systemMode ==="z") {

          rotateCamera([0, 0, 1], theta);
        }
        else if (systemMode === "y") {
          rotateCamera([0, 1, 0], theta);

        }
        else if (systemMode === "x") {
          rotateCamera([1, 0, 0], theta);

        }
    }
  });
  window.addEventListener('keydown', function (event) {
      switch (event.key) {
        case "a":
          systemMode = 'a';
          items = [];
          items.push(new ax_1(gl));
          items.push(new ax_2(gl));
          items.push(new ax_3(gl));
          rotateCamera([0,0,1],0.03 * 18)
          break;
        case "b":
          systemMode = 'b';
          items.push(new Ant(gl));
          console.log(items[0].isPicked)
          items.push(new Saturn(gl));
          items.push(new Cup(gl));
          break;
        case "d":
          systemMode = 'd';
          items[3].transform.setTranslate(vec3.fromValues(0, 0.5, 0));
          items[3].transform.updateMVPMatrix();
          items[4].transform.setTranslate(vec3.fromValues(0.5, - 0.5, 0));
          items[4].transform.updateMVPMatrix();
          items[5].transform.setTranslate(vec3.fromValues(- 0.5, - 0.5, 0));
          items[5].transform.updateMVPMatrix();
          items[3].cY+=0.5
          items[4].cX+=0.5
          items[4].cY-=0.5
          items[5].cX-=0.5
          items[5].cY-=0.5

          flag = 1;
          break;
        case "x":
          systemMode = "x";

          break;
        case "y":
          systemMode = "y";

          break;
        case "z":
          if(!topView) systemMode = "z";

          break;
        case "t":
          if(!topView){
            topView = true;

            const view = mat4.create();
            mat4.lookAt(view, vec3.fromValues(0, 0, 2.5), vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));
            const viewUniform = shader.uniform("view");
            shader.setUniformMatrix4fv(viewUniform, view);
            // rotateCamera([1,0,0],-71 * 0.03)
          }else {
            topView = false;


            const projectUniform = shader.uniform("project");
            shader.setUniformMatrix4fv(projectUniform, project);

            const viewUniform = shader.uniform("view");
            shader.setUniformMatrix4fv(viewUniform, view);
          }
          break;
        case 'q':
          if(topView && selectedObject!==-1 && stationary_mode)
          {
            angles_x[selectedObject-3] +=0.03
            items[selectedObject].transform.setRotate('x',angles_x[selectedObject-3])
            items[selectedObject].transform.updateMVPMatrix();
          }
          break;
        case 'Q':
          if(topView && selectedObject!==-1 && stationary_mode)
          {
            angles_x[selectedObject-3] -=0.03
            items[selectedObject].transform.setRotate('x',angles_x[selectedObject-3])
            items[selectedObject].transform.updateMVPMatrix();
          }
          break;
        case 'w':
          if(topView && selectedObject!==-1 && stationary_mode)
          {
            angles_y[selectedObject-3] +=0.03
            items[selectedObject].transform.setRotate('y',angles_y[selectedObject-3])
            items[selectedObject].transform.updateMVPMatrix();
          }
          break;
        case 'W':
          if(topView && selectedObject!==-1 && stationary_mode)
          {
            angles_y[selectedObject-3] -=0.03
            items[selectedObject].transform.setRotate('y',angles_y[selectedObject-3])
            items[selectedObject].transform.updateMVPMatrix();
          }
          break;
        case 'e':
          if(topView && selectedObject!==-1 && stationary_mode)
          {
            angles_z[selectedObject-3] +=0.03
            items[selectedObject].transform.setRotate('z',angles_z[selectedObject-3])
            items[selectedObject].transform.updateMVPMatrix();
          }
          break;
        case 'E':
          if(topView && selectedObject!==-1 && stationary_mode)
          {
            angles_z[selectedObject-3] -=0.03
            items[selectedObject].transform.setRotate('z',angles_z[selectedObject-3])
            items[selectedObject].transform.updateMVPMatrix();
          }
          break;
        case "+":
          if(topView && selectedObject!==-1 && stationary_mode) {
            items[selectedObject].transform.setScale(
              vec3.fromValues(items[selectedObject].transform.getScale()[0] * 1.005,
                items[selectedObject].transform.getScale()[1] * 1.005,
                items[selectedObject].transform.getScale()[2] * 1.005)
            );
            items[selectedObject].transform.updateMVPMatrix();
          }
          break;
        case "-":
          if(topView && selectedObject!==-1 && stationary_mode) {
            items[selectedObject].transform.setScale(
              vec3.fromValues(items[selectedObject].transform.getScale()[0] / 1.005,
                items[selectedObject].transform.getScale()[1] / 1.005,
                items[selectedObject].transform.getScale()[2] / 1.005)
            );
            items[selectedObject].transform.updateMVPMatrix();
          }
          break;
        case "m":
         mode = "m";
         break;
        case 'ArrowUp':
          if(!stationary_mode){
            difference+=0.00005
          }
          break;
        case "ArrowDown":
          if(!stationary_mode){
            if(difference - 0.00005>0)
            difference-=0.00005
          }
      }
    }, true
  );
  gl.canvas.addEventListener("mousedown",function (event) {
    if(topView && mode!=="m"){
      let canvas = renderer.getCanvas();
      const rect = canvas.getBoundingClientRect();
      let mouseX = event.clientX - rect.left;
      let mouseY = event.clientY - rect.top;
      const pixelX = mouseX * gl.canvas.width / gl.canvas.clientWidth;
      const pixelY = gl.canvas.height - mouseY * gl.canvas.height / gl.canvas.clientHeight - 1;
      let pixels = new Uint8Array([
        255,255,0,1]
      );
      console.log(pixels)
      console.log(pixelX, pixelY)

      gl.readPixels(pixelX, pixelY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      console.log(pixels)
      if (pixels[0] === 0 && pixels[1] === 77 && pixels[2] === 26) {

        if(selectedObject===-1) selectedObject = 3;
        else items[selectedObject].isPicked = false;
        items[3].isPicked=true;
        items[3].draw(shader)
        selectedObject = 3;
        // points[0] = renderer.mouseToClipCoord(mouseX+rect.left,mouseY+rect.top)
        points[0] = [items[3].cX, items[3].cY]
        console.log(points[0])
      }
      else if (pixels[0] === 77 && pixels[1] === 102 && pixels[2] === 178) {

        if(selectedObject===-1) selectedObject = 4;
        else items[selectedObject].isPicked = false;
        items[4]._isPicked = true;
        items[4].draw(shader)
        selectedObject = 4;

        // points[0] = renderer.mouseToClipCoord(mouseX+rect.left,mouseY+rect.top)
        points[0] = [items[4].cX, items[4].cY]

      }

      else if (pixels[0] === 178 && pixels[1] === 77 && pixels[2] === 102) {

        if(selectedObject===-1) selectedObject = 5;
        else items[selectedObject].isPicked = false;
        items[5]._isPicked = true;
        items[5].draw(shader)
        selectedObject = 5;

        // points[0] = renderer.mouseToClipCoord(mouseX+rect.left,mouseY+rect.top)
        points[0] = [items[5].cX, items[5].cY]


      }
      else if(pixels[0] === 0 && pixels[1] === 0 && pixels[2] === 0) {
        if(selectedObject!==-1) items[selectedObject].isPicked = false;
        selectedObject = -1;
        clicked_coordinates = [-1, -1]
        points[0] = clicked_coordinates

      }
    }else if(topView && mode==="m"){
      if(selectedObject!==-1) {
          let [pixelX,pixelY] = renderer.mouseToClipCoord(event.clientX,event.clientY);
          console.log(pixelX,pixelY)
          points.push([pixelX, pixelY])
          console.log(points)
        stationary_mode = false
      }
    }

  })

};

function init(){

  mat4.perspective(project, 1, 1, 0.1, 100);
  const projectUniform = shader.uniform("project");
  shader.setUniformMatrix4fv(projectUniform, project);



  mat4.lookAt(view, vec3.fromValues(2, 1.2, 1.5), vec3.fromValues(0, 0, 0), vec3.fromValues(0, 0, 1));
  const viewUniform = shader.uniform("view");
  shader.setUniformMatrix4fv(viewUniform, view);

}



function animate() {
  renderer.clear();
  if(mode!=="m") t = 0
  if(mode==="m" && points.length===3 && t<=1){
    t+=difference

    let a_x = 2 *(points[0][0]) - 4 * (points[1][0]) + 2 * points[2][0],
      b_x = -3 *(points[0][0]) + 4 * (points[1][0]) - points[2][0],
      c_x = points[0][0]
    let a_y = 2 *(points[0][1]) - 4 * (points[1][1]) + 2 * points[2][1],
      b_y = -3 *(points[0][1]) + 4 * (points[1][1]) - points[2][1],
      c_y = points[0][1]
    let x = points[0][0], y = points[0][1];
    let newX = a_x * t * t + b_x * t + c_x
    let newY = a_y * t * t + b_y * t + c_y
    items[selectedObject].cX = newX
    items[selectedObject].cY = newY
    items[selectedObject].transform.setTranslate(
      vec3.fromValues(
        newX,
        newY,
        items[selectedObject].transform.getTranslate()[2]
      )
    )
    items[selectedObject].transform.updateMVPMatrix();
  }
  if(t>1){
    mode ="a"
    points = []
    difference = 0.0001
    t = 0
    items[selectedObject].isPicked = false;
    selectedObject = -1;
    stationary_mode = false;

  }
  items.forEach(item => {
    item.draw(shader);
  });
  window.requestAnimationFrame(animate);
}

animate();
