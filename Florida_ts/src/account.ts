document.addEventListener('DOMContentLoaded', (): void => {
 interface IAuthUser {
    authName: string;
    authEmail: string;
}

interface IAuthResponse {
    mes?: string;
    authUser?: IAuthUser;
}
const localToken: string | null = localStorage.getItem('floweridaKey');
const exitLogout = document.getElementById('exitLogout') as HTMLElement | null;
if(exitLogout)
    exitLogout.addEventListener('click', (event : Event) : void => {window.location.href = '/home.html';});

const logout = document.getElementById('logout') as HTMLElement | null;
if (logout) {
    logout.addEventListener('click', (event: Event): void => {
        localStorage.removeItem('floweridaKey');
        document.cookie = "floweridaKey=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; // Чистим куку!
        window.location.href = '/'; // Уходим на корень             
    });
}

// 2. Если токена нет — бережно уводим на чистый роут входа
if (!localToken) {
    window.location.href = '/login';
} else {
    // Исправлено: шлем запрос на правильный эндпоинт аутентификации бэкенда
    fetch('/api/user/auth', { 
        method: "GET",
        headers: { "content-Type": "application/json", "Authorization": `Bearer ${localToken}` }
    })
    .then((response) => response.json())
    .then((data: any) => {
        const mistake = document.getElementById('mist2') as HTMLElement | null;
        if ((data.mes || data.message) && mistake) {
            mistake.innerHTML = data.mes || data.message;
        } 
        // Подстраиваемся под структуру ответа вашего UserController (объект user прилетает плоско)
        else if (data && data.name && data.email) {
            const nameSpan = document.getElementById('logOutUserName') as HTMLElement | null;
            const emailSpan = document.getElementById('logOutUserEmail') as HTMLElement | null;
            if (nameSpan) nameSpan.innerHTML = data.name;
            if (emailSpan) emailSpan.innerHTML = data.email;
        }
    })
    .catch((error: any) => console.log(error));
}
});


export{};
