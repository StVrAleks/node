
document.addEventListener('DOMContentLoaded', () => {
const feedbackForm = (document.getElementById('form-reg-user') as HTMLFormElement) || null;
const pasForm1 = (document.getElementById('password1') as HTMLInputElement) || null;
const pasForm2 = (document.getElementById('password2') as HTMLInputElement) || null;
const subForm = (document.getElementById('pasLogin') as HTMLFormElement) || null;
const erPas1 = (document.getElementById('erPas1') as HTMLElement) || null;
const erPas2 = (document.getElementById('erPas2') as HTMLElement) || null;

if(subForm) subForm.disabled = true;

pasForm1?.addEventListener('blur', (event : Event) : void =>
  { 
   try{
      if(subForm) subForm.disabled = true;
      const valInput = pasForm1? pasForm1.value : '';
      if (erPas1) erPas1.innerHTML = '';
      if(valInput.length < 5)
        { if (erPas1) erPas1.innerHTML = "Количество символов должно быть больше 5";}
      else if(checkLatinLetters(valInput) === false)  
        {if (erPas1) erPas1.innerHTML = "Пароль может содержать только латинские буквы и цифры";}
      else 
        {
        if (erPas1) erPas1.innerHTML = '';
        if(subForm) subForm.disabled = false;
        }

    }catch(err){
    console.error('Валидация формы прошла не успешно');
    }}
);
pasForm2?.addEventListener('blur',(event : Event) : void=>
  { 
   try{
         if (subForm) subForm.disabled = true;

    const valInput = pasForm2? pasForm2.value : '';

    if(erPas2) erPas2.innerHTML = '';
    if(valInput.length < 5 && erPas2)
        {if (erPas2) erPas2.innerHTML = "Количество символов должно быть больше 5";}
    else if(checkLatinLetters(valInput) === false && erPas2)  
        {if (erPas2) erPas2.innerHTML = "Пароль может содержать только латинские буквы и цифры";}
    else
        {
          if (erPas2) erPas2.innerHTML = '';
          if (subForm) subForm.disabled = false;
        }  
  }
  catch(err:any){
    console.error('Валидация формы прошла не успешно');
  }}
);

feedbackForm?.addEventListener('submit', (e : Event) : boolean =>{
    if(!pasForm1 || !pasForm2)
         return false;
    e.preventDefault();    
    if(pasForm1.value != pasForm2.value)
    {
        if (erPas1) erPas1.innerHTML = "Введенные пароли не совпадают!";
        if (erPas2) erPas2.innerHTML = "Введенные пароли не совпадают!";
        return false;
    }
    else
       { 
        if (e.target) {
        const feedbackFormData : FormData = new FormData(e.target as HTMLFormElement);
        const feedback = Object.fromEntries(feedbackFormData);
        sendFeedback(feedback);
        return true;
        }}
    return false;
});

});

function sendFeedback(feedback : any) : void{
    
const password1 = (document.getElementById('password1') as HTMLFormElement) || null;
const password2 = (document.getElementById('password2') as HTMLFormElement) || null;
const goodReg =  (document.getElementById('goodReg') as HTMLFormElement) || null;

fetch('api/user/registration',{
        method: "POST",
        headers: {"content-Type": "application/json"},
        body: JSON.stringify({"userName": feedback.nameUser, "email": feedback.email,"password": feedback.pasw})
        }).then((response) => response.json())
        .then(data =>{
            if(password1) password1.value = '';
            if(password2) password2.value = '';
            if(goodReg) goodReg.innerHTML = data.statusUser || data.mes;
        }).catch((error)=>console.log(error));
}



function checkLatinLetters(str : string) : boolean {
  const regex = /^[a-zA-Z0-9]+$/;
  return regex.test(str);
}

   
        
