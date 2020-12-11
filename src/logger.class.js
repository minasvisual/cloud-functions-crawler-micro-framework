const axios = require('axios')
const { indexOf } =  require('lodash')

module.exports = function(){
    this.LogLevel = (process.env.LOG_LEVEL || 'debug')
    this.LogHierarchy = ['debug', 'log', 'info', 'warn', 'error']

    this.sendLog = function(level, log){
        let levelRange = indexOf(this.LogHierarchy, this.LogLevel);
        let allowed = this.LogHierarchy.slice(levelRange)

        if( allowed.includes(level) ) 
            console[level](...log)
    }

    this.log = function(...data){
        this.sendLog('log', data)
    }
    this.debug = function(...data){
        this.sendLog('debug', data)
    }
    this.info = function(...data){
        this.sendLog('info', data)
    }
    this.warn = function(...data){
        this.sendLog('warn', data)
    }
    this.error = function(...data){
        this.sendLog('error', data)
    }
 
    return this
}