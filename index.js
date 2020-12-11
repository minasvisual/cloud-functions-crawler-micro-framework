const puppeteer = require('puppeteer')
const CoreClass = require('./src/core.class')
const LogClass = require('./src/logger.class')

let page;
var buffer = {}
const Logger = LogClass()

async function getBrowserPage() {
  // Launch headless Chrome. Turn off sandbox so Chrome can run under root.
  let args = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-infobars',
    '--window-position=0,0',
    '--ignore-certifcate-errors',
    '--ignore-certifcate-errors-spki-list',
    '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"'
  ]

  const browser = await puppeteer.launch({ 
    args, 
    devtools: false,
    headless: true,
    ignoreHTTPSErrors: true,
    userDataDir: './tmp' 
  });

  return browser.newPage();
}

exports.crawler = async (req, res) => {
  const modelName = req.body.model;
  const Engine = CoreClass()

  if (!modelName) return res.send('Please provide model as POST parameter, { model: "example" }');
  
  let model = require('./models/'+modelName )
  if (!model || !Engine.validateModel(model) )  return res.send('404, Please provide valid model'); 

  try{
      Logger.debug('Initializing model '+model.name)
      // starts browser
      if (!page) page = await getBrowserPage();
      
      //expose functions to evaluate
      await page.exposeFunction('Logger', Logger.log); 
      // bind console log of evaluate
      page.on('console', msg => Logger.log('eval log', msg.text()));

      // call beforeCall task if exists | require model return
      if( model.beforeCall && typeof model.beforeCall == 'function' ){
          model = await model.beforeCall({model, page})
          Logger.debug('Called beforeCall model function')
      }

      // validade if model was returned
      if( !Engine.validateModel(model) ){
          Logger.error('404, Please return valid model frmo beforeCall function', model) 
          return res.status(403).send('404, Please return valid model frmo beforeCall function');
      }

      // start process tasks list | for tasks runtime updates, we use "for" to count new tasks
      for(let i=0; i < Object.keys(model.tasks).length; i++ ){
          let taskName = Object.keys(model.tasks)[i]
          let task = model.tasks[taskName]

          Logger.debug('initialized task ' + taskName)
          buffer[taskName] = {}
          // go to new page

          let taskMethod = Engine.getTaskMethod(task)  
          if( taskMethod == 'scrape' ){
            buffer[taskName] = await Engine.scrapeData({ model, task, page, taskName })
          }
          else if( taskMethod == 'callback' ){
            buffer[taskName] = await Engine.callbackData({ model, task, page, taskName})
          }
          else if( taskMethod == 'callable' ){
            buffer[taskName] = await task({ model, task, page, taskName})
          }else{
            buffer[taskName] = 'method not found'
          }

          Logger.debug('finished task '+taskName)
      }
      
      if( model.afterCall && typeof model.afterCall == 'function' )
          model = model.afterCall({model, page, buffer})
        
      Logger.debug('complete model '+modelName)

      res.send(buffer);

      buffer = {}
      await page.close();
  }catch(err){
    if( model.error && typeof model.error == 'function' )
        model = model.error({model, error: err})

    res.status(403).send(err)
  }
};
