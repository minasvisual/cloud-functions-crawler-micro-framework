# Under construction - Not stable!

Google Cloud Function to scrape specified data

Node system to create dynamic and cronlable crawlers with business rules only.

Libs used:
- Node-Cron
- ScrapeIt

Create crawlers:
- Create model on model folder (see example in example folder)
```
module.exports = {
  name: "model name" // REQUIRED
  status: false,   //CRAWLER RUN STATUS
  tasks: { // TASKS QUEUE

    'taskAlias':{  // simple SCRAPE way 
        url: "https://ionicabizau.net/", // URLS TO CRAW ( STRING | ARRAY ) 
        schema: {   // CRAWLER SCHEMA TO RESPONSE SEE DOCS https://github.com/IonicaBizau/scrape-it
            title: ".header h1",
            avatar: {
                selector: ".header img",
                attr: "src|href|innerHTML", //PUPPETEER element attributes, see docs
                convert: (txt) => txt.replace('-', ',')  // post callback to format return
            }
        },
        success: ({model, page, data}) => console.log(data) // OPTIONAL | called after each page called
     },

    'taskAlias2':{ // callback way that return page url loaded to parse custom data
        url: ['https://google.com', 'https://yahoo.com'], 
        schema: async ({model, task, data, page}) => { 
            console.log( await page.$eval('title', el => el.textContent )) 
        }
    }.

    'taskAlias3': ({ model, page, task}) => { // use page instance loaded of craw puppeteer way }  
  },

  beforeCall: async ({model, page}) => {  // RUN BEFORE CALL URL - params ( This model instance | browser page instance)
    console.log('Called before '+model.name) 
    return model; // model return required
  },

  error: (err) => { // RUN WHEN SYSTEM CALL ERROR 
      console.log(`Error Code: ${err}`)
      console.log(err)
  },

  afterCall: async ({ buffer, model, page }) => { // RUN AFTER ALL TASKS CALLED 
    console.log('Called after') 
  }
  // export
}
```

Installation
```
npm install
```
- Test your model running 
```
node index <modelname>
```

#Logs 
GCP log is generated during processes

Additional packages
- lodash
- axios
- puppeteer

Based on this blog post: *[Introducing headless Chrome support in Cloud Functions and App Engine](https://cloud.google.com/blog/products/gcp/introducing-headless-chrome-support-in-cloud-functions-and-app-engine)*

## Deployment
```
npm run deploy
```