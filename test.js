const {OPS,generate}=require('./operations.js');
const g={path:'aa.jpg',flag:1,show:false,save:true,out:'out.png',backend:'plt'};
const sc={
 '1':['resize'],'2':['grayscale'],'3':['resize','rotate'],'4':['gamma','histogram'],'5':['resize','grayscale','gamma','rotate','histogram'],'6':['canny','median','noise','sobel','laplacian','unsharp','bilateral','gaussian','mean','threshold','equalize','arith','crop','show']};
const fs=require('fs');
for(const[k,ids]of Object.entries(sc)){const pipe=ids.map(id=>({id,v:Object.fromEntries(OPS[id].p.map(p=>[p.k,p.d]))}));if(ids.includes('show'))pipe.at(-1).v.b='plt';const r=generate(pipe,g);if(r.error)console.log(k,r.error);else fs.writeFileSync(`/tmp/t${k}.py`,r.code)}
