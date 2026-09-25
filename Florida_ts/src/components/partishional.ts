   export type StatusType = 'New' | 'Edit';

export interface FlowerData {
    id?: number | null;
    vidTitle?: string;
    name?: string;
    price?: number;
    status?: string;
    mKeyWords?: string;
    mDescript?: string;
}

export interface VidData {
    id?: number | null;
    name?: string;
}

export interface UserData {
    id?: number | null;
    name?: string;
    email?: string;
    role?: string;
    user_status?: string | number;
}

export interface DescriptionData {
    id?: number | null;
    title?: string;
    description?: string;
    flowerId?: number;
}

export interface ImgData {
    num?: number | string;
    nextNum?: number | string;
    flowerId?: number;
    img?: string;
}

export class moduleWebPartUser {
    constructor() {
        // Конструктор теперь чистый
    }

    flower(editInfo: FlowerData | null, status: StatusType): string {
        const data = editInfo || {}; 
        let info = {
            id: null as number | null,
            vidTitle: '',
            name: '',
            price: 0,
            status: 'В наличии',
            mKeyWords: '',
            mDescript: ''
        };

        if (status === 'Edit') {    
            info = {
                id: typeof data.id === 'number' ? data.id : null,
                vidTitle: data.vidTitle || '',
                name: data.name || '',
                price: typeof data.price === 'number' ? data.price : 0,
                status: data.status || 'В наличии',
                mKeyWords: data.mKeyWords || '',
                mDescript: data.mDescript || ''
            };
        }    

        return `  
            <table id="myModalTable" style="margin-top: 25px; width: 100%;">
                <tr id="Itd2">
                    <td>ID</td>
                    <td id="modal_flower_id">${info.id !== null ? info.id : ''}</td>
                </tr>
                <tr>
                    <td>Вид</td>
                    <td>
                        <input id="modal_flower_vid_input" type="text" list="vids_list" value="${info.vidTitle}" placeholder="Начните вводить вид...">
                        <datalist id="vids_list"></datalist>
                    </td>
                </tr>     
                <tr><td>Название</td><td><input id="modal_flower_name" type="text" value="${info.name}"></td></tr>
                <tr><td>Цена</td><td><input id="modal_flower_price" type="number" value="${info.price}"></td></tr>
                <tr><td>Статус</td><td><input id="modal_flower_status" type="text" value="${info.status}"></td></tr>
                <tr>
                    <td>mKey</td>
                    <td><input id="modal_flower_key" type="text" value="${info.mKeyWords}"><span class="textMeta">Значение key для метатега </span></td>
                </tr>   
                <tr>
                    <td>mDescription</td>
                    <td><input id="modal_flower_mDis" type="text" value="${info.mDescript}"><span class="textMeta">Значение description для метатега </span></td>
                </tr>   
            </table>
        `;
    }

    vid(editInfo: VidData | null, status: StatusType): string {
        const data = editInfo || {}; 
        let info = {
            id: null as number | null,
            name: ''
        };

        if (status === 'Edit') {    
            info = {
                id: typeof data.id === 'number' ? data.id : null,
                name: data.name || ''
            };
        }

        return `
            <table id="myModalTable" style="margin-top: 25px; width: 100%;">
                <tr><td>ID вида</td><td id="modal_vid_id">${info.id !== null ? info.id : ''}</td></tr>
                <tr><td>Название вида</td><td><input type='text' id="modal_vid_name" value="${info.name}"></td></tr>
            </table>`;
    }

    users(editInfo: UserData | null, status: StatusType): string {
        const data = editInfo || {}; 
        let info = {
            id: null as number | null,  
            name: "",      
            email: "",
            role: "",
            user_status: '' as string | number,
        };

        if (status === 'Edit') {    
            info = {
                id: typeof data.id === 'number' ? data.id : null,    
                name: data.name || "",   
                email: data.email || "",
                role: data.role || "",
                user_status: data.user_status !== undefined ? data.user_status : 0,
            };
        }

        return `
            <table id="myModalTable" style="padding-top: 25px; width: 100%;">
                <tr><td>ID пользователя</td><td id="modal_user_id">${info.id !== null ? info.id : ''}</td></tr>
                <tr><td>Имя пользователя</td><td id="modal_user_name">${info.name}</td></tr>
                <tr><td>Email пользователя</td><td id="modal_user_email">${info.email}</td></tr>
                <tr><td>Role пользователя</td><td><input id="modal_user_role" type="text" value="${info.role}"></td></tr>
                <tr><td>Статус пользователя</td><td id="modal_user_status">${info.user_status}</td></tr>
            </table>
        `;
    }

    description(editInfo: DescriptionData | null, status: StatusType): string {
        const data = editInfo || {}; 
        let info = {
            id: null as number | null,
            title: "",
            description: "",
            flowerId: 0
        };

        if (status === 'Edit') {    
            info = {
                id: typeof data.id === 'number' ? data.id : null,
                title: data.title || "",
                description: data.description || "",
                flowerId: typeof data.flowerId === 'number' ? data.flowerId : 0
            };
        }

        const idPart = (status === 'Edit' && info.id !== null) ? `id="linkServer_${info.id}"` : "";

        return `
            <tr>
                <td>Название блока</td>
                <td><input type="text" class="inputInfoTitle" value="${info.title}"></td>
            </tr>
            <tr>
                <td>Описание блока</td>
                <td><textarea class="inputInfoText">${info.description}</textarea></td>
            </tr>
            <tr style="border-bottom: 2px solid grey; padding: 7px 0; text-align: center;">
                <td></td>
                <td class="countBlocks">
                    <input type="button" class="class_control_button modal_link" ${idPart} value="Удалить блок" style="margin-bottom: 15px;">
                </td>
            </tr>
        `;
    }

    imgs(editInfo: ImgData | null, status: StatusType): string {
        const data = editInfo || {}; 
        const isEdit = status === 'Edit';        
        
        const currentNum = Number(data.num || data.nextNum || 0);
        const flowerId = typeof data.flowerId === 'number' ? data.flowerId : 0;
        const img = data.img || '';

        const editpart = isEdit 
            ? `
                <input type="file" class="new-file-input" id="fileInput_${currentNum}"/><br><br>
                <input type="submit" class="class_control_button action-upload" value="⚙️ Загрузить изображение" id="uploadBut_${currentNum}">
              `
            : `
                <div><img src="/imgStoreMINI/${img}" width="60" style="border-radius: 4px;"></div>
                <span class="spanName">${img}</span>
              `;

        return `
            <tr><td>ID цветка</td><td class="spanFlowerId">${flowerId}</td></tr>
            <tr>
                <td>Фото</td>
                <td class="file-upload-zone">
                   ${editpart}
                </td>
            </tr>
            <tr><td>Порядок</td><td><input class="spanFlowerNum" type="text" value="${currentNum + 1}"></td></tr>
            <tr><td></td><td><input type="button" class="class_control_button call-delete" value="Удалить поле" id="delImg_${currentNum}"></td></tr>
        `;    
    }
}