(function () {

const localToken: string | null = localStorage.getItem('floweridaKey');
 interface IAuthUser {
    authName: string;
    authEmail: string;
}

interface IAuthResponse {
    mes?: string;
    authUser?: IAuthUser;
}
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
})();

function logOutBak() : void{
  window.location.href = '/home.html'; 
}

function logOutUser() : void{
const localToken : string | null = localStorage.getItem('floweridaKey');
   if(localToken)
      {
        localStorage.removeItem('floweridaKey');
        window.location.href = '/home.html'; 
      }
}
export{};
