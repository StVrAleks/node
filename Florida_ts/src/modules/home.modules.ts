let homeData: {
    authoriz: HTMLInputElement,
    registration: HTMLInputElement,
    guest: HTMLFormElement
};

export function initHomeModule(): void {
    homeData = {
        authoriz: document.getElementById('autorization') as HTMLInputElement,
        registration: document.getElementById('registration') as HTMLInputElement,
        guest: document.getElementById('guest') as HTMLFormElement,

    };

  homeData.authoriz.addEventListener('click', (): void => { window.location.href = "/login"; });
  homeData.registration.addEventListener('click', (): void => { window.location.href = "/registration"; });
  homeData.guest.addEventListener('click', (): void => { window.location.href = "/catalog"; });
}
