module.exports = {
    name: "example",
    status: true,
    tasks: {
        'getData': {
            url: "https://ionicabizau.net",
            schema: {
                title: ".header h1",
                avatar: {
                    selector: ".header img[src]",
                    attr: "src"
                },
                desc: ".header h2",
            },
        },
        'getData2': {
            url: "https://ionicabizau.net",
            schema: {
                title: ".header h1",
                avatar: {
                    selector: ".header img",
                    attr: "src"
                },
                desc: ".header h2",

            },
        }
    },
    header:{},
    beforeCall: async ({model}) => {
      console.log('Called before '+model.name) 
      return model;
    },
    success: ({ buffer, page }) => {
       console.log(`Status Code: ${page.url}`)
       console.log(data)
    },
    error: ({error}) => {
        console.log(`Error Code: ${error}`)
        console.log(error)
    },
    afterCall: async ({buffer}) => {
      console.log('Called after') 
    }
    // export
  }
  
  // scrapeIt("https://ionicabizau.net", {
  //     // Fetch the articles
  //     articles: {
  //         listItem: ".article"
  //       , data: {
  
  //             // Get the article date and convert it into a Date object
  //             createdAt: {
  //                 selector: ".date"
  //               , convert: x => new Date(x)
  //             }
  
  //             // Get the title
  //           , title: "a.article-title"
  
  //             // Nested list
  //           , tags: {
  //                 listItem: ".tags > span"
  //             }
  
  //             // Get the content
  //           , content: {
  //                 selector: ".article-content"
  //               , how: "html"
  //             }
  
  //             // Get attribute value of root listItem by omitting the selector
  //           , classes: {
  //                 attr: "class"
  //             }
  //         }
  //     }
  
  //     // Fetch the blog pages
  //   , pages: {
  //         listItem: "li.page"
  //       , name: "pages"
  //       , data: {
  //             title: "a"
  //           , url: {
  //                 selector: "a"
  //               , attr: "href"
  //             }
  //         }
  //     }
  
  //     // Fetch some other data from the page
  //   , title: ".header h1"
  //   , desc: ".header h2"
  //   , avatar: {
  //         selector: ".header img"
  //       , attr: "src"
  //     }
  // }, (err, { data }) => {
  //     console.log(err || data)
  // })