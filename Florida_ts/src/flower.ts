import { ApiResponse, FlowerAttributes, FlowerInfoAttributes, FlowerImgsAttributes } from './types.js';

document.addEventListener('DOMContentLoaded', (): void => {
const elFl = document.getElementById('idFl') as HTMLElement | null;
let idFl :  string | null = null; 

if(elFl)
    idFl = idFl = elFl.innerHTML.trim();

if (!idFl){
    console.error('Критическая ошибка: ID цветка не найден на странице.');
    return;
}
    
fetch(`/api/flower/getOne/${idFl}`,{
    method: "GET",
    headers: {"content-Type": "application/json"},
    })
    .then((response) => response.json())
    .then((data: ApiResponse & Partial<FlowerAttributes>) => {
        try{
        if(data.mes || data.message)
            console.log(data.mes);
        else
        {
            console.log(data);
            let titleFl = document.getElementById('titleFl') as HTMLElement | null;
            let priceFl = document.getElementById('priceFl') as HTMLElement | null;

            if(titleFl)
                titleFl.innerHTML = String(data['name']);

            if(priceFl)
                priceFl.innerHTML = String(data['price']);

            const mDescription = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
            const mkeyWords= document.querySelector('meta[name="keywords"]') as HTMLMetaElement | null;

            if(mDescription && data?.mDescript)
                mDescription.content = mDescription.content + ' ' + data['mDescript'];
            else 
                console.log('Предупреждение: мета-тег description не найден на странице');

            if(mkeyWords && data['mKeyWords'])
                mkeyWords.content = mkeyWords.content + ' ' + data['mKeyWords'];
            else 
                console.log('Предупреждение: мета-тег keywords не найден на странице');            
        }  
    }catch(err: any){console.error('Ошибка при получении одного изображения товара:' + err)};
    });    

const divImg = document.getElementById('imgsFl') as HTMLElement | null;

fetch(`/api/imgs/getAll/${idFl}`,{
      method: "GET",
      headers: {"content-Type": "application/json"}
      })
      .then((response) => response.json())
      .then((data: ApiResponse<FlowerImgsAttributes>) =>{
        try{
            if(data.mes || data.message)
               console.log(data.mes || data.message);
            else if(data.rows && data.rows.length > 0)
            {
                for(var i=0; i < data.rows.length; i++)
                {
                    let path : string = '/imgStore/' + data.rows[i]['img'];
                    var img = document.createElement("img") as HTMLImageElement;;  
                    img.src = path;
                    if(divImg) divImg.appendChild(img);   
                }
            }  
        } catch(err : any){console.error('Ошибка при получении всех изображений товара:' + err);}
       });    

const descr = document.getElementById('descr') as HTMLElement | null;


    fetch(`/api/info/getOne/${idFl}`,{
        method: "GET",
        headers: {"content-Type": "application/json"}
        })
        .then((response) => response.json())
        .then((data: ApiResponse<FlowerInfoAttributes>) =>{
            try{
            const mist = document.getElementById('mist00') as HTMLElement | null;
            
                if(data.mes || data.message){
                    if(mist)
                       mist.innerHTML = String(data.mes || data.message); 
                } 
                else if(data.rows && data.rows.length > 0)
                {
                    for(var i=0; i < data.rows.length; i++)
                    {
                        const div1 = document.createElement("div") as HTMLElement;  
                        div1.innerHTML = data.rows[i]['title'];
                        div1.style.fontWeight = '500';
                        div1.style.paddingBottom = '15px';
                        const div2 = document.createElement("div") as HTMLElement;  
                        div2.innerHTML = String(data.rows[i]['description']);
                        descr?.appendChild(div1);   
                        descr?.appendChild(div2);  
                    }
                } 
            } catch(err : any){console.error('Ошибка при получении описания товара:' + err);}
        });       
});

