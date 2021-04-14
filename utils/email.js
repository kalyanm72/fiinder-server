const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const htt = require('html-to-text');
const sendinBlue = require('nodemailer-sendinblue-transport');

module.exports = class Email{
  constructor(user,url){
    this.username=user.profile.firstname,
    this.to=user.email,
    this.url=url,
    this.from= `Fiinder <${process.env.EMAIL_FROM}>`
  }

  newTransport(){

    if(process.env.NODE_ENV==='production'){
      return nodemailer.createTransport(sendinBlue({
        apiKey: process.env.SENDINBLUE_APIKEY,
      }));
    }

    return nodemailer.createTransport({
      host:process.env.EMAIL_HOST,
      PORT:process.env.EMAIL_PORT,
      auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS
      }
    });

  }

  async sendmail(mailtemplate,subject,attachments,replacements={username:this.username,
    siteurl:this.url}){
      
    let source = fs.readFileSync(`${__dirname}/../email-templates/${mailtemplate}`).toString();
    const template = handlebars.compile(source);

    const htmlToSend = template(replacements);
    
    const emailoptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html: htmlToSend,
      text: htt.fromString(htmlToSend),
      attachments
    };

      await this.newTransport().sendMail(emailoptions);
  }

  async sendWelcome(){
      
    await this.sendmail('welcome.html','Welcome to Fiinder');

  }

  async sendPasswordReset(){

    await this.sendmail('passwordreset.html',`Dear ${this.username} Reset your password `);

  }

  // add site url in template
  async sendPasswordChanged(){

    await this.sendmail('passwordupdated.html',`Dear ${this.username} your password is updated`);

  }

  async sendClaimed(details){

    await this.sendmail('claimed.html',`Dear ${details.ownername} your Post is Claimed`,{
      username:this.username,
      siteurl:this.url,
      ownername:details.ownername,
      address:details.address,
      mobilenum:details.mobilenum,
      rollno:details.rollno,
      email:details.email,
      postname:details.postname
    });

  }

  async sendReported(details){

    await this.sendmail('claimed.html',`Dear ${details.ownername} your Post is Reported`,{
      username:this.username,
      siteurl:this.url,
      ownername:details.ownername,
      address:details.address,
      mobilenum:details.mobilenum,
      rollno:details.rollno,
      email:details.email,
      postname:details.postname
    });

  }



}


// const sendEmail = async options=>{
//     // CREATE TRANSPORTER
//     const transporter = nodemailer.createTransport({
//         host: process.env.EMAIL_HOST,
//         port: process.env.EMAIL_PORT,
//         auth: {
//           user: process.env.EMAIL_USER,
//           pass: process.env.EMAIL_PASS
//         }
//       });

//     // render the html file
//     let source = fs.readFileSync(`${__dirname}/../email-templates/${options.file}`).toString();
//     const template = handlebars.compile(source);
//     const replacements=options.replacements;
//     const htmlToSend = template(replacements);
    
//     //ADD OPTIONS
//     const emailoptions = {
//         from: `Fiinder <${process.env.EMAIL_FROM}>`,
//         to: options.email,
//         subject: options.subject,
//         text: options.text,
//         attachments:options.attachments,
//         html: htmlToSend
//     };

//     //SEND EMAIL
//     await transporter.sendMail(emailoptions);
// }

// module.exports = sendEmail;