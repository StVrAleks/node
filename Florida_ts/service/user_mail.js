const nodemailer = require('nodemailer');

class MailService{
    constructor(){
        this.transporter = nodemailer.createTransport({
        host: "smtp.yandex.ru",
        port: 465,
        secure: true,
        auth: {
          user: "orchid86@yandex.ru",
          pass: "tbpskvfkwctrzuxl"
        }
      });
    }

    async sendActivationMail(to, userName, link){
      await this.transporter.sendMail({
        from: "orchid86@yandex.ru",
        to: `${to}`,
        subject: "Flowerida_регистрация на сайте",
        text: `${userName} ${to}`,
        html:
        `
        <p>Уважаемый (ая), ${userName}</p>
        <p>Для подтверждения регистрации на сайте, пожалуйста, перейдите по ссылке: </p>
        <p>${link}</p>
        <p>Спасибо!</p>
        `
      })
    }
}

 module.exports = new MailService();