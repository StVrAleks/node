export class moduleWebPartUser {
    constructor() {
       // this.table = document.getElementById(tableId);
      
    }

    // --- ЛОГИКА ХРАНИЛИЩА ---

    flower() {
             
    }

    vid() {

    }

    // --- ЛОГИКА ИНТЕРФЕЙСА ---

    users() {

    }

    desription(editInfo) {

    const info = {
        title: editInfo.title || "",
        description:editInfo.title || "",
        flowerId: editInfo.flowerId || 0,
        id: editInfo.id
    };

    const moduleForm = `
                    <tr>
                        <td>Название блока</td>
                        <td><input type="text" class="inputInfoTitle" value="${info.title}"></td>
                    </tr>
                    <tr>
                        <td>Описание блока</td>
                        <td><textarea class="inputInfoText">${info.description}</textarea></td>
                    </tr>
                    <tr style="border-bottom: 2px solid grey;">
                        <td><span class="flowerIdDiscr" style='opacity:0'>${info.flowerId}</span></td>
                        <td><input type="button" class="class_control_button" id="linkServer_${info.id}" value='Удалить блок' style="margin-bottom:15px"></td>
                    </tr>
                `;
    return  moduleForm;  
    }

    imgs() {
 
    }

}


