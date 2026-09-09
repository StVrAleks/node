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
if(logout)
    logout.addEventListener('click', (event : Event) : void => {
        if(localToken)
            {
                localStorage.removeItem('floweridaKey');
            }
        window.location.href = '/home.html';             
    });


if(!localToken)
    window.location.href = '/login_user.html';
else{
    fetch('/api/user/check', {
        method: "GET",
        headers: {"content-Type": "application/json", "Authorization": `Bearer ${localToken}`}
    })
    .then((response) => response.json())
    .then((data: IAuthResponse) =>{
        const mistake = document.getElementById('mist2') as HTMLElement | null;
        if(data.mes && mistake)
            mistake.innerHTML = data.mes;
        else if(data.authUser) 
        {
            const nameSpan = document.getElementById('logOutUserName') as HTMLElement | null;
            const emailSpan = document.getElementById('logOutUserEmail') as HTMLElement | null;
            if (nameSpan) nameSpan.innerHTML = data.authUser.authName;
            if (emailSpan) emailSpan.innerHTML = data.authUser.authEmail;
        }
    }).catch((error : any)=> console.log(error));
 }
});


export{};
