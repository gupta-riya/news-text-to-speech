
//libraries
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const gTTS = require("gtts");
const nodemailer = require("nodemailer");
const { user, pass } = require('../gmailAcc');

// program starts here
(async function () {
   try {

      // browser is launched

      let browserInstance = await puppeteer.launch({
         headless: false,
         defaultViewport: null,
         args: ["--start-maximized"],
      });

      // visit the news website - https://inshorts.com/en/read

      let newPage = await browserInstance.newPage();
      await newPage.goto("https://inshorts.com/en/read", {
         waitUntil: "networkidle2",
      });

      await newPage.exposeFunction("textToString", textToString);

      //if specific category news is required then visit that specific page based on the input
      //for this user needs to enter 3 inputs (Eg:-> node app.js Science)  
      if (process.argv.length > 2) {
         let newsTopic = process.argv[2].trim();
         console.log(newsTopic);
         await waitAndClick(".c-hamburger.c-hamburger--htx", newPage);

         function consoleFn(categorySelector, newsTopic) {
            console.log(newsTopic);

            let categoryArr = document.querySelectorAll(categorySelector);
            let index = 0;
            for (let i = 0; i < categoryArr.length; i++) {
               let cat = categoryArr[i].innerText.trim();
               console.log(cat);
               if (newsTopic == cat) {
                  index = i;
                  break;
               }
            }

            let linkArr = document.querySelectorAll(".category-list a");

            let url = linkArr[index].getAttribute("href");
            url = "https://inshorts.com" + url;

            return url;
         }
         let url = await newPage.evaluate(
            consoleFn,
            ".active-category",
            newsTopic
         );
         await newPage.goto(url, {
            waitUntil: "networkidle2",
         });
      }



      // call to extractNews function to scrape out the news

      let news_text = await newPage.evaluate(
         extractNews,
         ".news-card-image",
         "span[itemprop='headline']",
         "div[itemprop='articleBody']"
      );

     

      //convert data into json file

      let json = { news_text };
      fs.writeFile("./data.json", JSON.stringify(json), (err) => {
         if (err) {
            console.error(err);
            return;
         }
         console.log("Json file has been created");
      });

      //convert json data into pdf
      await pdfGenerator(news_text);

      //convert json data to string as textToSpeech function process only on the basis of string
      await textToString(news_text);



   } catch (err) {
      console.log(err);
   }
})();


//wait for the selector and click on it

async function waitAndClick(selector, newTab) {
   await newTab.waitForSelector(selector, { visible: true });
   let selectorClickPromise = await newTab.click(selector);
   return selectorClickPromise;
}


// extract news -> image , headlines and their summaries

async function extractNews(
   imageurlSelector,
   headlineSelector,
   summarySelector
) {
   try {
      let ImageArr = await document.querySelectorAll(imageurlSelector);
      let HeadlineArr = await document.querySelectorAll(headlineSelector);
      let SummaryArr = await document.querySelectorAll(summarySelector);
      let newArr = [];

      for (let i = 0; i < HeadlineArr.length; i++) {
         let obj = { Image: "", Headline: "", Summary: "" };
         obj["Image"] = ImageArr[i]
            .getAttribute("style")
            .valueOf("backgroundImage")
            .valueOf("url")
            .replace("?", "")
            .split("'")[1];
         obj["Headline"] = HeadlineArr[i].innerText;
         obj["Summary"] = SummaryArr[i].innerText;

         newArr.push(obj);
      }

      return newArr;
   } catch (err) {
      console.log(err);
   }
}


//function that converts json object to string

async function textToString(newArr) {

   let speechText = "";
   for (let i = 0; i < newArr.length; i++) {
      let num = i + 1;
      speechText +=
         "Headline " +
         num +
         ", " +
         newArr[i]["Headline"] +
         ".\n" +
         newArr[i]["Summary"] +
         "\n\n\n";
   }

   //call to textToSpeech function with string as a parameter
   await textToSpeech(speechText);

}

//function that converts text to a speech and save it as .mp3 file
async function textToSpeech(speechText) {

   try {


      var gtts = new gTTS(speechText, "en");

      await gtts.save("News.mp3", function (err, result) {
         if (err) {
            throw new Error(err);
         }

      });

      //cal to sendNewsMail function
      await sendNewsMail();
   }
   catch (err) {
      console.log(err);
   }
}



// json to html and then to pdf conversion along with css styling
async function pdfGenerator(data) {
   //row function
   const createRow = (item) => `
    <tr>
      <td><img style = "height : 150px ; width : 150px" src=${item.Image} alt="" /></td>
      <td>${item.Headline}</td>
      <td>${item.Summary}</td>
    </tr>
  `;

   //table function
   const createTable = (rows) => `
  <table cellspacing="0" style= "border: 2px ;
  border-color: #398B93;">
    <tr class = ".header">
        <th style = "color: white;
        font-size: 1.5em;">Image</td>
        <th style = "color: white;
        font-size: 1.5em;">Headline</td>
        <th style = "color: white;
        font-size: 1.5em;">Summary</td>
    </tr>
    ${rows}
  </table>
 `;

   // table generation
   const createHtml = (table) => `
 <html>
 <head>
   <style>

         body {
         background-color: #d3e0dc ;

         }


         img {

         height: 150px;
         width: 150px;
         }


         .table-users {
         border: 2px ;
         border-color: #398B93;
         border-radius: 10px;
         margin: 1em auto;
         overflow: hidden;
         width: 95%;
         }

         table {
         width: 100%;
         }

         td, th { 
            color: #282846;
            padding: 10px; 
         }


         td:last-child{
         font-size: 0.95em;
               line-height: 1.4;
               text-align: left;
         }

         th { 
            background-color: #398B93;
            font-weight: 300;
         }

         tr:nth-child(odd){
         background-color: #dbf6e9;
         }

         tr:nth-child(even){
         background-color: white;
         }

         .header {
         background-color: #126e82;

         padding: 1rem;
         text-align: center;
         text-transform: uppercase;
         }

         .header th{
         color: white;
         font-size: 1.5em;
         }

         h2{
         font-size: 42px;
         margin-top: 20px;
         }
         @media print
         {
         table { page-break-after:auto }
         tr    { page-break-inside:avoid; page-break-after:auto }
         td    { page-break-inside:avoid; page-break-after:auto }
         thead { display:table-header-group }
         tfoot { display:table-footer-group }
         }


   </style>
 </head>
 <body>
 <center><h2><strong>LATEST NEWS</strong></h2></center>
 <div class="table-users">
 <table cellspacing="0" >
   
      ${table}
      </div>
    </body>
  </html>
`;

   // writing into files
   try {

      //launch another headless browser and a page
      const browser = await puppeteer.launch();
      const newPage = await browser.newPage();

      /* generate rows */
      const rows = data.map(createRow).join("");
      /* generate table */
      const table = createTable(rows);
      /* generate html */
      const html = createHtml(table);
      /* write the generated html to file */
      fs.writeFileSync("./news.html", html);
      console.log("HTML file has been created.");

      (async () => {
         const htmlFile = path.resolve("./news.html");
         await newPage.goto("file://" + htmlFile);
         await newPage.pdf({ path: "./news.pdf", printBackground: true });
         console.log("PDF has been created.");
         console.log("Waiting for text-to-speech conversion.....");
      })();
   } catch (error) {
      console.log("Error generating table", error);
   }
}


// function to send converted pdf and audio through mail from gmail account to various users using nodemailer
async function sendNewsMail() {

   let flag = 0;

   // keep finding the audio file until it gets find
   let timer = setInterval(function () {

      if (fs.existsSync('./News.mp3')) {
         try {

            composeMail();
            flag = 1;
         }
         catch (err) {
            console.log(err);
         }

      }

      if (flag == 1) {
         clearInterval(timer);
      }


   }, 10000);





}

//  function that sends the mail with files as attachment

async function composeMail() {
   setTimeout(async function () {
      let transporter = nodemailer.createTransport({

         service: 'gmail',
         auth: {
            user: user,
            pass: pass
         }

      });

      // send mail with defined transport object
      let info = await transporter.sendMail({
         from: user, // sender address
         to: "riyasr2018@gmail.com", // list of receivers
         subject: "Latest News ✔", // Subject line
         text: "Latest News Please download the attachment for audio and pdf", // plain text body
         html: "<b>Latest News!! Please download the attachment for audio and pdf.</b>", // html body
         attachments: [{
            filename: 'News.mp3',
            path: __dirname + '/News.mp3'
         },
         {
            filename: 'news.pdf',
            path: __dirname + '/news.pdf'
         }
         ]
      });

      console.log("Email sent...");
      

   }, 35000);

}
