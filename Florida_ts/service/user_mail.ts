import nodemailer from 'nodemailer'

class MailService{
  transporter: nodemailer.Transporter;
    constructor(){
        this.transporter = nodemailer.createTransport({
          host:  process.env.SMTP_HOST || "smtp.yandex.ru",
          port: Number(process.env.SMTP_PORT) || 465,
          secure: true,
          auth: {
              user: process.env.SMTP_USER || "orchid86@yandex.ru", 
              pass: process.env.SMTP_PASSWORD 
          }
      });
    }

    async sendActivationMail(to : string, userName : string, link : string){
      await this.transporter.sendMail({
        from: "orchid86@yandex.ru",
        to: `${to}`,
        subject: "Flowerida — активация аккаунта",
        text: `${userName} ${to}`,
        html:
         `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <p>Уважаемый(ая) <strong>${userName}</strong>,</p>
                    <p>Для подтверждения регистрации на сайте <strong>Flowerida</strong>, пожалуйста, перейдите по ссылке:</p>
                    <p style="margin: 20px 0;">
                        <a href="${link}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                            Подтвердить регистрацию
                        </a>
                    </p>
                    <p>Если ссылка выше не работает, скопируйте и вставьте этот адрес в строку браузера:</p>
                    <p><a href="${link}">${link}</a></p>
                    <p>Спасибо!</p>
                </div>
            `
      })
    }
}

export default new MailService();