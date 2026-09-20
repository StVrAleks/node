document.addEventListener('DOMContentLoaded', (): void => {
    const authoriz = document.getElementById('autorization') as HTMLInputElement | null;
    const registration = document.getElementById('registration') as HTMLInputElement | null;
    const guest = document.getElementById('guest') as HTMLInputElement | null;

    if (authoriz) {
        // Перенаправляем на чистый роут viewRouter
        authoriz.addEventListener('click', (): void => { window.location.href = "/login"; });
    }

    if (registration) {
        // Перенаправляем на чистый роут viewRouter
        registration.addEventListener('click', (): void => { window.location.href = "/registration"; });
    }

    if (guest) {
        guest.addEventListener('click', (): void => { 
            // Гостя просто уводим на страницу каталога
            window.location.href = "/catalog"; 
        });
    }
    
});
