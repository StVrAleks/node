    //allDataDB();
import { ApiResponse, FlowerImgsAttributes, FlowerAttributes, VidAttributes } from '../models/models';

document.addEventListener('DOMContentLoaded', (): void => {
    const allFullTitle = document.getElementsByClassName('full_title') as HTMLCollectionOf<Element>;
    const allprice = document.getElementsByClassName('price') as HTMLCollectionOf<Element>;
    const flowersId = document.getElementsByClassName('discriptionId') as HTMLCollectionOf<Element>;
    const allSection = document.getElementsByClassName('conteiner_section') as HTMLCollectionOf<Element>;
    const allView = document.getElementsByClassName('watch') as HTMLCollectionOf<Element>;

    if (allSection) {
        for (let i = 0; i < allSection.length; i++) {
            (allSection[i] as HTMLElement).style.display = 'none';
        }
    }

    fetch('/api/flower/getAll', {
        method: "GET",
        headers: { "content-Type": "application/json" },
    })
    .then((response) => response.json())
    // СУРОВО: Используем дженерик, чтобы rows был строго FlowerAttributes[]
    .then((data: ApiResponse<FlowerAttributes>) => {
        try {
            const mist = document.getElementById('mist10') as HTMLElement | null;
            if (data.mes || data.message) {
                if (mist) mist.innerHTML = String(data.mes || data.message);
                return;
            }

            if (data.rows && data.rows.length > 0) {
                // Защита: берем минимум, чтобы не выйти за пределы верстки hbs
                const limit = Math.min(data.rows.length, allSection.length);

                for (let i = 0; i < limit; i++) {
                    const currentFlower = data.rows[i];  

                    // Теперь пишем красиво через точку, TS всё подсказывает
                    (flowersId[i] as HTMLElement).innerHTML = String(currentFlower.vidId);  
                    allFullTitle[i].innerHTML = currentFlower.name;
                    allprice[i].innerHTML = currentFlower.price + ' руб.';
                    
                    (allView[i] as HTMLElement).id = String(currentFlower.id);
                    (allSection[i] as HTMLElement).style.display = 'block';

                    vidOne(String(currentFlower.vidId), i);
                    imgOne(String(currentFlower.id), i);
                    
                    allView[i]?.addEventListener('click', (event: Event) => { 
                        oneItem(event); 
                    });
                }
            }
        } catch (err) {
            console.error('Ошибка при получении всех данных для каталога ' + err);
        } 
    });   
});

async function vidOne(id: string, num: number): Promise<void> {
    const allTitleGoods = document.getElementsByClassName('title_goods') as HTMLCollectionOf<Element>;
    fetch(`/api/vid/getOne/${id}`, {
        method: "GET",
        headers: { "content-Type": "application/json" },
    })
    .then((response) => response.json())
    .then((data: ApiResponse & Partial<VidAttributes>) => {
        if (data.mes || data.message) {
            console.log(data.mes || data.message);
        } else if (data['name']) {
            if (allTitleGoods[num]) (allTitleGoods[num] as HTMLElement).innerHTML = String(data['name']);
        }  
    });
}

async function imgOne(id: string, num: number): Promise<void> {
    const allimg = document.querySelectorAll('.imgs_goods > img') as NodeListOf<Element>;
    fetch(`/api/imgs/getAll?flowerId=${id}`, {
        method: "GET",
        headers: { "content-Type": "application/json" }
    })
    .then((response) => response.json())
    // СУРОВО: строгий тип для картинок
    .then((data: ApiResponse<FlowerImgsAttributes>) => {
        if (data.mes || data.message) {
            console.log(data.mes || data.message);
        } else if (data.rows && data.rows.length > 0) {
            // Больше никакого any, строго берем свойство .img из FlowerImgsAttributes
            let path = String('/imgStoreMINI/' + data.rows[0].img);
            if (allimg && allimg[num]) (allimg[num] as HTMLImageElement).src = path;
        }  
    });    
}

function oneItem(event: Event): void {
    // СУРОВО: Использован currentTarget для защиты от промаха мимо ID кнопки
    if (event && event.currentTarget) {   
        const clickedElement = event.currentTarget as HTMLElement;
        window.location.href = '/flower.html?id=' + clickedElement.id; 
    } else {
        window.location.href = '/';
    }
}