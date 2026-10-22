let accountData:{
    logOutUserName: HTMLElement,
    logOutUserEmail: HTMLElement,
    mist2: HTMLElement,
    exitLogout: HTMLElement,
    logout: HTMLElement
} | null = null;

export async function initAccountModule(): Promise<void> {
    accountData = {
        logOutUserName: document.getElementById('logOutUserName') as HTMLElement,
        logOutUserEmail: document.getElementById('logOutUserEmail') as HTMLElement,
        mist2: document.getElementById('mist2') as HTMLElement,
        exitLogout: document.getElementById('exitLogout') as HTMLElement,
        logout: document.getElementById('logout') as HTMLElement
    };

  accountData.exitLogout.addEventListener('click', (event: Event): void => { window.location.href = '/home.html'; });  
  accountData.logout.addEventListener('click', async(event: Event): Promise<void> => {logoutUserFunc();});

  authUserFunc();
}

async function logoutUserFunc() : Promise<void>{
localStorage.removeItem('floweridaKey');
    fetch('/api/user/logout', { method: "POST" })
    .then(() => {
        window.location.href = '/';
    })
    .catch((error : Error) => console.error('Ошибка при логауте:', error));
}

async function authUserFunc() {
   fetch('/api/user/authUser', { 
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
    .then((response) => {
        // Если бэкенд ответил "forbidden" или "unauthorized" (статусы 401/403) — уводим на вход
        if (response.status === 401 || response.status === 403) {
            window.location.href = '/login';
            throw new Error('Пользователь не авторизован');
        }
        return response.json();
    })
    .then((data: any) => {
        if ((data.mes || data.message) && accountData?.mist2) {
            accountData.mist2.textContent = data.mes || data.message;
        } 
        // Если прилетели плоские данные пользователя из контроллера
        else if (data && data.name && data.email) {
            if (accountData?.logOutUserName) accountData.logOutUserName.textContent = data.name;
            if (accountData?.logOutUserEmail) accountData.logOutUserEmail.textContent = data.email;
        }
    })
    .catch((error: any) => console.log('Аутентификация не удалась:', error));    
}