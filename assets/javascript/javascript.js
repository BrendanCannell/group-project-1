
$(document).ready(function() {

    var userSearchTerm;
    var year;
    var imgSrc;

    
    $("#searchArticle").on("click", function(event) {
        
        event.preventDefault();

        userSearchTerm = $("#searchInput").val().trim();
        year = parseInt($("#year").val());
    
        renderArticles();
        
    });

    $("#nextYear").on("click", function(event) {
        
        event.preventDefault();

        year = parseInt($("#year").val());
        year = year + 1; 
        $("#year").val(year);   
        renderArticles();
        
    });

    $("#previousYear").on("click", function(event) {
       
        event.preventDefault();

        year = parseInt($("#year").val());
        year = year - 1; 
        $("#year").val(year);   
        renderArticles();
        
    });

    $("#clear").on("click", function(event) {
        
        event.preventDefault();

        $("#searchInput").val("");
        $("#year").val("");
        $("#article-section").empty();
    });
        


    function renderArticles() {


        if (userSearchTerm !== "" && year) {

            $("#searchInput").val("");

                    var url = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
                    url += '?' + $.param({
                    'api-key': "b3319917b4b54c0ba4a7eb463d0099d9",
                    'q': userSearchTerm,
                    'fq': "news_desk:(\"Business\" \"Business Day\" \"Financial\" \"Your Money\" )",
                    'begin_date':  year + "0101",
                    'end_date':  year + "1231"
                    });
                    $.ajax({
                        url: url,
                        method: 'GET',
                    }).done(function(result) {
                        var test = result;
                
                    for (var i = 0; i < 10; i++) {

                        if (test.response.docs[i].keywords.length !== 0) {
                    

                            var headlineLink = test.response.docs[i].web_url;
                            var headliner = test.response.docs[i].headline.main;
                            var imageCheck = test.response.docs[i].multimedia.length;
                            var bodyText = test.response.docs[i].snippet;
                            if (imageCheck) {

                              imgSrc = "https://static01.nyt.com/" + test.response.docs[i].multimedia[2].url;
                            }
                            else {
                              imgSrc = "assets/images/chart.png";
                            }

                            var articleCard = $("<div class='card articleCard'><div class='card-body'><h4 class='card-title'>" + headliner + "</h4><img class='rounded articleImg' src='" + imgSrc + "'</img><p class='card-text'>" + bodyText + "</p><a href='" + headlineLink + "' target='_blank' class='btn btn-primary toArticleButton'>See Full Article</a></div></div>");
                
                            $("#article-section").prepend(articleCard);
                                
                        }
                    }
                    
                }).fail(function(err) {
                    throw err;
                });
        }
       
    }
});