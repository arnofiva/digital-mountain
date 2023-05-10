import{V as e}from"./cast-8b575ab3.js";class r extends e{notify(){const o=this._observers;if(o&&o.length>0){const t=o.slice();for(const s of t)s.onInvalidated(),s.onCommitted()}}}export{r as s};
