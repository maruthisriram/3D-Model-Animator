import objLoader from 'https://cdn.skypack.dev/webgl-obj-loader';
import Transform from './transform.js';

export default class Ant {
    constructor(gl, color = new Float32Array([0.0, 0.3, 0.1, 1.0])) {
        var obj = document.getElementById('ant.obj').innerHTML;
        const Obj = obj;
        const mesh = new objLoader.Mesh(Obj);
        this.cX = 0
        this.cY = 0
        this.cZ = 0
        this.vertexPositionData = new Float32Array(
            mesh.vertices
        );
        this.vertexIndices = new Uint16Array(
            mesh.indices
        );
        console.log(mesh.vertices.length)
      for(let i=0;i<mesh.vertices.length;i+=3){
        this.cX += mesh.vertices[i];
        this.cY += mesh.vertices[i+1]
        this.cZ += mesh.vertices[i+2]
      }
      this.cX = this.cX/(mesh.vertices.length/3)
      this.cY = this.cY/(mesh.vertices.length/3)
      this.cZ = this.cZ/(mesh.vertices.length/3)
      console.log(this.cX,this.cY,this.cZ)
        this.gl = gl;
        this.buffer = this.gl.createBuffer();
        if (!this.buffer) {
            throw new Error("Buffer could not be allocated");
        }
        this.transform = new Transform();
      this._color = color;
      this._isPicked = false

    }

  draw(shader) {
        const uModelTransformMatrix = shader.uniform("uModelTransformMatrix");

        const elementPerVertex = 3;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertexPositionData, this.gl.STATIC_DRAW);

        const aPosition = shader.attribute("aPosition");
        this.gl.enableVertexAttribArray(aPosition);
        this.gl.vertexAttribPointer(aPosition, elementPerVertex, this.gl.FLOAT, false, (elementPerVertex) * this.vertexPositionData.BYTES_PER_ELEMENT, 0);

        const indexBuffer = this.gl.createBuffer();

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndices, this.gl.STATIC_DRAW);

        const u_color = shader.uniform("aColor");
        if(this.isPicked){
          this.gl.uniform4fv(u_color, new Float32Array([0, 0, 0, 1]));
        }else this.gl.uniform4fv(u_color, this._color);

        shader.setUniformMatrix4fv(uModelTransformMatrix, this.transform.getMVPMatrix());

        this.gl.drawElements(this.gl.TRIANGLES, this.vertexIndices.length, this.gl.UNSIGNED_SHORT, indexBuffer);
    }


  get isPicked() {
    return this._isPicked;
  }

  set isPicked(value) {
    this._isPicked = value;
  }

}
