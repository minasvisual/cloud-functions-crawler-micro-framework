const { has, get } = require('lodash')
const LogClass = require('./logger.class')
const Logger = LogClass()

module.exports = function(){

    this.validateModel = function(model){
        return has(model, 'name') && has(model, 'tasks') && ( typeof model.tasks == 'object' )
    }

    this.getTaskMethod = function(task, model){
        let isCallable = ( typeof task == 'function' ? 'callable' : null )
        let isCallback = ( task.url && task.schema && typeof task.schema == 'function' ? 'callback': isCallable )
        let isScrape = ( task.url && task.schema && typeof task.schema == 'object' ? 'scrape': isCallback )

        return ( task.type ? task.type :  isScrape )
    }

    this.getObjectSelector = async function(page, selector){
      return await page.$eval(selector.selector, (elem, selector) => {
          let data = ''  
          if( !elem ) return data // if not exists
          if( Array.isArray(elem) && elem.length == 0 )  return [] // if array and doesnt exists

          if( Array.isArray(elem) ){
              if(elem.length > 0 && selector.eq ) elem = elem[selector.eq]  
              else elem = elem[0] || {}// if array and exists
          }

          if( selector.attr )
            data = elem[selector.attr]
          else if( selector.how )
            data = elem[selector.how]
          else
            data = elem.textContent
    
          if( selector.trim )
              data = data && data.trim()
    
          return data || null
      }, selector).then((data) => (selector.convert ? selector.convert(data) : data) )
    }
    
    this.getArraySelector = async function(page, selector){
      return await page.$$eval(selector.listItem, (elem, selector) => {
          let data = []  
          
          if( !elem ) return ['elem nao existe'] // if not exists
          if( Array.isArray(elem) && elem.length == 0 )  return ['vazio'] // if array and doesnt exists
    
          data = elem.map((item) => {
            let temp = {}
            for(let subSelName in selector.data){
              let subselector = selector.data[subSelName]
              if( !item ) return item.textContent;
              
              if( Array.isArray(item) ){
                if( item.length > 0 && subselector.eq ) item = item[subselector.eq]  
                else item = item[0] || {} // if array and exists
              }

              if( typeof subselector == 'string' ){
                temp[subSelName] = item && item.querySelector(subselector).textContent
              }else if( subselector.selector && subselector.attr ){
                temp[subSelName] = item && item.querySelector(subselector.selector)[subselector.attr]
              }else if( subselector.selector && subselector.how ){
                let action =  item && item.querySelector(subselector.selector)
                temp[subSelName] = ( action[subselector.how] ? action[subselector.how]() : action.innerHTML )
              }else{
                temp[subSelName] = item.textContent
              }
              if( subselector.trim )
                temp[subSelName] = temp[subSelName] && temp[subSelName].trim()
    
              if( subselector.convert )
                temp[subSelName] = subselector.convert(temp[subSelName])
            }
            return temp
          })
          
          return data
      }, selector).then((data) => {
          data && data.map((obj, i) => {
            Object.keys(selector.data).map( key => {
               if( has(selector, 'data['+key+'].convert') )  data[i][key] = selector.data[key].convert(data[i][key]) 
            })
          })
          return data;
      })
    }
    
    this.scrapeData = async function({ model, task, page, taskName }){
      let data = []
      let source = {}

      if(task.schema && task.url){
        if( !Array.isArray(task.url) ) task.url = [task.url]
      
        if( task.url.length == 0 ){
          Logger.error('Task URL EMPTY '+ task)
          return data
        } 

        for( let url of task.url ){
            Logger.debug('page goto', url)
            await page.goto(url, {waitUntil: 'networkidle0'});

            for( let selectorName in task.schema ){
              try{
                Logger.debug('run selector '+selectorName)
                let selector = task.schema[selectorName]
        
                if( typeof selector == 'string' ){
                  source[selectorName] = await page.$eval(selector, el => el.textContent )
                }
                else if( typeof selector == 'object' && selector.selector && !selector.listItem ){
                  source[selectorName] = await this.getObjectSelector(page, selector)
                }
                else if( typeof selector == 'object' && selector.listItem && selector.data ){
                  source[selectorName] = await this.getArraySelector(page, selector)
                }
                else{
                  source[selectorName] = false
                }
        
                Logger.debug('runned selector '+selectorName)
                
              }catch(e){
                Logger.error(e.message)
                source[selectorName] = null
              }  

            }

            if( task && task.success && typeof task.success == 'function' )
              await  model.tasks[taskName].success.call(model, {model, data: source, page, url })
          
            data.push(source);
            source = {}
        }
      }else{
        Logger.debug('return selector '+ source)
      }
    
      Logger.debug('return scrapeData results'+ Object.keys(source).length)
      return  data
    } 

    this.callbackData = async function({ model, task, page, taskName }){
      let data = []
      let source = {}
      if( task.url && task.schema && typeof task.schema == 'function' ){
          
        if( !Array.isArray(task.url) ) task.url = [task.url]
      
        if( task.url.length == 0 ){
          Logger.error('Task URL EMPTY '+ task)
          return data
        } 

        for( let url of task.url ){
          await page.goto(task.url, {waitUntil: 'networkidle0'});
      
          source = task.schema({ model, task, page})
        }

        if( task && task.success && typeof task.success == 'function' )
          await  task.success.call(model, {model, data: source, page, url })
        
        data.push(source)
        source = {}
      }

      return data
    }

    return this
}