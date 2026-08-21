(()=>{'use strict';
const proto=CanvasRenderingContext2D.prototype;
const originalArc=proto.arc;
const originalFill=proto.fill;
const lastArc=new WeakMap();

proto.arc=function(x,y,r,start,end,ccw){
  if(this.canvas?.classList?.contains('ohajiki-canvas')) lastArc.set(this,{x,y,r});
  return originalArc.call(this,x,y,r,start,end,ccw);
};

proto.fill=function(...args){
  if(this.canvas?.classList?.contains('ohajiki-canvas')){
    const arc=lastArc.get(this);
    const style=String(this.fillStyle||'');
    const isRed=style.includes('236')&&style.includes('72')&&style.includes('82');
    const isBlue=style.includes('50')&&style.includes('120')&&style.includes('230');
    if(arc&&(isRed||isBlue)){
      const {x,y,r}=arc;
      const prevStyle=this.fillStyle;
      const prevShadowColor=this.shadowColor;
      const prevShadowBlur=this.shadowBlur;
      const prevShadowOffsetY=this.shadowOffsetY;
      const g=this.createRadialGradient(x-r*.38,y-r*.42,r*.08,x,y,r*1.04);
      if(isRed){
        g.addColorStop(0,'rgba(255,255,255,.96)');
        g.addColorStop(.12,'rgba(255,205,214,.90)');
        g.addColorStop(.34,'rgba(255,105,126,.77)');
        g.addColorStop(.66,'rgba(230,37,70,.69)');
        g.addColorStop(.88,'rgba(135,0,37,.78)');
        g.addColorStop(1,'rgba(48,0,22,.88)');
        this.shadowColor='rgba(124,0,31,.48)';
      }else{
        g.addColorStop(0,'rgba(255,255,255,.96)');
        g.addColorStop(.12,'rgba(205,239,255,.90)');
        g.addColorStop(.34,'rgba(94,187,255,.78)');
        g.addColorStop(.66,'rgba(29,113,235,.69)');
        g.addColorStop(.88,'rgba(0,57,147,.79)');
        g.addColorStop(1,'rgba(0,20,66,.89)');
        this.shadowColor='rgba(0,50,120,.48)';
      }
      this.fillStyle=g;
      this.shadowBlur=9;
      this.shadowOffsetY=5;
      const result=originalFill.apply(this,args);
      this.fillStyle=prevStyle;
      this.shadowColor=prevShadowColor;
      this.shadowBlur=prevShadowBlur;
      this.shadowOffsetY=prevShadowOffsetY;
      return result;
    }
  }
  return originalFill.apply(this,args);
};
})();
