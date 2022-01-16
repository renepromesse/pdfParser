
const express = require('express')
const bodyParser = require('body-parser')
const pdf = require('pdf-parse')
const crawler = require('crawler-request')
const multer = require('multer')

//var upload = multer({ dest: 'uploads/' })
var upload = multer()

const app = express()
const port = 3000

app.use(bodyParser.json())
app.use(bodyParser.raw())

app.get('/', (req, res) => {
  res.send('Hello PDF Parsing!')
})

app.post('/pdf-base64-parse', function (req, res) {

  console.log(`Request body: ${JSON.stringify(req.body)}`)

  let buff = Buffer.from(req.body.base64, 'base64')

  pdf(buff).then(function(data) {
    // PDF text
    console.log(data.text); 
    res.send({ pdfText: data.text })

  })
})

app.post('/multipart-parse', upload.single('file'), function (req, res) {

  console.log(`Request File: ${JSON.stringify(req.file)}`)

  let buff = req.file.buffer

  pdf(buff).then(function(data) {
    // PDF text
    console.log(data.text); 
    res.send({ pdfText: data.text })

  })
})

app.post('/pdf-link-parse', function (req, res) {
  console.log(`Request body: ${JSON.stringify(req.body)}`)

  let pdfLink = req.body.link

  let obj =
  {
    course: "course name",
    credits: "cr",
    score: "sc",
    courseCode: "course code",
    echec: "true || false"
  }
  let course = false, credits = false, score = false, courseCode = false, echec = false;
  

  crawler(pdfLink).then(function(response){
    // handle response
    // console.log(response.text);
    const [...others] = response.text.split("\n");
    let results = [];
    let whiteList = [
      "2020-2021Année académique :",
      "2021-2022Année académique :",
      "SemSigleCoursCr .NoteCodes",
      "Moyenne générale cumulative",
      "Moyenne d'option cumulative",
    ]

    // for(let i = 0; i< others.length; i++){
      let str = others[16];
      console.log("Str", str);

      let cr = str.match(/\d/g)[0];
      console.log("cr", cr);

      let c = str.split(cr)[0];
      console.log("c", c);

      let afterCr = str.substring(str.indexOf(cr)+ 1);
      console.log("afterCr", afterCr);

      let afterCrChar = afterCr.match(/\D+/g);
      let afterCrCode = afterCrChar[1];
      let scoreCode = afterCr.split(afterCrCode);
      let score = scoreCode[0];
      let cCode = afterCrCode + scoreCode[1];

      results[0]= {str, c, cr, afterCr, afterCrChar, afterCrCode,scoreCode,score, cCode};
    // }



    res.send({ others, results });
  });
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
