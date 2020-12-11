
module.exports = {
    name: 'advanced',
    status: true,
    tasks: {
      
    },
    header:{},
    
    beforeCall: async ({model, page}) => {  // params:( this model instance | scrapeIt instance )
        console.log('Called before') 
        //call link to discover posts
        await page.goto("https://pequenosclassicosperdidos.com.br/category/darkwave/", {waitUntil: 'networkidle0'});

        await page.waitForSelector('.site-content article')

        let data = await page.$$eval('.site-content article', (elem) => {
                return elem.map(el => el.querySelector('.entry-title a').href )
        })
        console.log(data)

        data.map( (link, k) =>{
            model.tasks['link'+k] = {
                url: link,
                schema:{    
                    title: ".site-content .entry-header h1.entry-title",
                    content: {
                        selector:".site-content .entry-content", 
                        attr: "innerHTML"
                    },
                    cover: {
                        selector:".site-content img:first-child",
                        attr: "src"
                    },
                },
                success: ({ data }) => console.log(data) 
            }
        })

        return model; // model return required
    },
    success: async ({ buffer, page }) => {
       console.log(`Status Code: ${buffer}`)
    //    if( response.statusCode == 200 ){
    //      data.source = response.responseUrl;
    //      // storage results on mysql database
    //      await Model.count({ where: { 
    //          [Op.or]: {
    //             title : data.title,
    //             source: response.responseUrl
    //          }
    //        }
    //      }).then((c) => {
    //        if(c <= 0){ 
    //          data.content = data.content.replace(/<div id\=\"jp\-post\-flair\".*>.*?<\/div>/ig,'');
    //          Model.create(data);
    //        }
    //      })
    //    }
       return Promise.resolve(buffer) // promise return required
    },
    error: async (err) => {
        console.log(`Error Code: ${err}`)
        console.log(err)
    },
    afterCall: async () => {
      console.log('Called after', global.model.tasks) 
    }
    // export
  }