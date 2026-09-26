export interface Camera { x:number; y:number; width:number; height:number }
export interface Point { x:number; y:number }
export function fitCamera(points: Point[], aspect: number, padding=65): Camera {
  if(!points.length) return {x:0,y:0,width:1104,height:1104/Math.max(aspect,0.1)};
  let width=Math.max(240,Math.max(...points.map(p=>p.x))-Math.min(...points.map(p=>p.x))+padding*2);
  let height=Math.max(240,Math.max(...points.map(p=>p.y))-Math.min(...points.map(p=>p.y))+padding*2);
  const cx=(Math.max(...points.map(p=>p.x))+Math.min(...points.map(p=>p.x)))/2;
  const cy=(Math.max(...points.map(p=>p.y))+Math.min(...points.map(p=>p.y)))/2;
  if(width/height<aspect) width=height*aspect; else height=width/aspect;
  return {x:cx-width/2,y:cy-height/2,width,height};
}
export function zoomCamera(camera: Camera, factor: number, focal={x:0.5,y:0.5}): Camera {
  const width=Math.min(8000,Math.max(150,camera.width*factor)), ratio=width/camera.width;
  return {x:camera.x+camera.width*focal.x*(1-ratio),y:camera.y+camera.height*focal.y*(1-ratio),width,height:camera.height*ratio};
}
