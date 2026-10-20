interface RegistrationData {
    nameUser: string;
    email: string;
    pasw: string;
}

let formElements: {
    feedbackForm: HTMLFormElement;
    pasForm1: HTMLInputElement;
    pasForm2: HTMLInputElement;
    subForm: HTMLFormElement;
    erPas1: HTMLElement;
    erPas2: HTMLElement;
    goodReg: HTMLElement;
} | null = null;

export function initAuthModule(): void {
    const feedbackForm = document.getElementById('form-reg-user') as HTMLFormElement;
    if (!feedbackForm) return;

    formElements = {
        feedbackForm,
        pasForm1: document.getElementById('password1') as HTMLInputElement,
        pasForm2: document.getElementById('password2') as HTMLInputElement,
        subForm: document.getElementById('pasLogin') as HTMLFormElement,
        erPas1: document.getElementById('erPas1') as HTMLElement,
        erPas2: document.getElementById('erPas2') as HTMLElement,
        goodReg: document.getElementById('goodReg') as HTMLElement
    };

    // Блокируем кнопку на старте
    setSubmitDisabled(true);

    // Вешаем слушатели напрямую внутри инициализации
    formElements.pasForm1.addEventListener('blur', () => validateField(1));
    formElements.pasForm2.addEventListener('blur', () => validateField(2));
    formElements.feedbackForm.addEventListener('submit', handleFormSubmit);
}

function setSubmitDisabled(disabled: boolean): void {
    if (formElements?.subForm) {
        formElements.subForm.disabled = disabled;
    }
}

function checkLatinLetters(str: string): boolean {
    return /^[a-zA-Z0-9]+$/.test(str);
}

function validateField(fieldNum: 1 | 2): boolean {
    if (!formElements) return false;

    const input = fieldNum === 1 ? formElements.pasForm1 : formElements.pasForm2;
    const errorEl = fieldNum === 1 ? formElements.erPas1 : formElements.erPas2;
    const val = input.value;

    if (val.length < 5) {
        errorEl.textContent = "Количество символов должно быть больше 5";
        setSubmitDisabled(true);
        return false;
    } 
    
    if (!checkLatinLetters(val)) {
        errorEl.textContent = "Пароль может содержать только латинские буквы и цифры";
        setSubmitDisabled(true);
        return false;
    }

    errorEl.textContent = '';
    
    // Кнопка разблокируется ТОЛЬКО если оба поля валидны
    const isBothValid = formElements.pasForm1.value.length >= 5 && 
                        checkLatinLetters(formElements.pasForm1.value) &&
                        formElements.pasForm2.value.length >= 5 && 
                        checkLatinLetters(formElements.pasForm2.value);
                        
    setSubmitDisabled(!isBothValid);
    return true;
}

function handleFormSubmit(e: Event): void {
    e.preventDefault();
    if (!formElements) return;

    if (formElements.pasForm1.value !== formElements.pasForm2.value) {
        formElements.erPas1.textContent = "Введенные пароли не совпадают!";
        formElements.erPas2.textContent = "Введенные пароли не совпадают!";
        return;
    }

    const formData = new FormData(formElements.feedbackForm);
    // Явно приводим к нашему интерфейсу, избавляясь от any
    const feedback = Object.fromEntries(formData) as unknown as RegistrationData;
    
    sendFeedback(feedback);
}

function sendFeedback(feedback: RegistrationData): void {
    fetch('api/user/registration', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            userName: feedback.nameUser, 
            email: feedback.email, 
            password: feedback.pasw 
        })
    })
    .then(response => response.json())
    .then(data => {
        if (!formElements) return;
        formElements.pasForm1.value = '';
        formElements.pasForm2.value = '';
        formElements.goodReg.textContent = data.statusUser || data.mes;
    })
    .catch(error => console.error('Ошибка отправки:', error));
} 
        
