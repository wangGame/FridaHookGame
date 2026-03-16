function anonymous(
) {
this._name="";
this._objFlags=0;
this._parent=null;
this._children=[];
this._active=true;
this._components=[];
this._prefab=null;
this._opacity=255;
this._color=new cc.Color(255,255,255,255);
this._contentSize=new cc.Size(0,0);
this._anchorPoint=new cc.Vec2(0.5,0.5);
this._position=undefined;
this._scale=undefined;
this._trs=null;
this._eulerAngles=new cc.Vec3(0,0,0);
this._skewX=0;
this._skewY=0;
this._zIndex=undefined;
this._localZOrder=0;
this._is3DNode=false;
this._groupIndex=0;
this.showInEditor=false;

})