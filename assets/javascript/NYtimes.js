
$(document).ready(function() {

    var userSearchTerm;
    var year;

    
    $("#searchArticle").on("click", function(event) {
        
        event.preventDefault();

        userSearchTerm = $("#searchInput").val().trim();
        year = parseInt($("#year").val());
        console.log(year);
    
        renderArticles();
        
    });

    $("#nextYear").on("click", function(event) {
        
        event.preventDefault();

        year = parseInt($("#year").val());
        year = year + 1; 
        console.log(year);
        $("#year").val(year);   
        renderArticles();
        
    });

    $("#previousYear").on("click", function(event) {
       
        event.preventDefault();

        year = parseInt($("#year").val());
        year = year - 1; 
        console.log(year);
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


        console.log(year);
        console.log(userSearchTerm);

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
                        console.log(result);
                        var test = result;
                        console.log(test.response.docs.length);
                    
                    
                
                    for (var i = 0; i < 10; i++) {

                        if (test.response.docs[i].keywords.length !== 0) {
                    
                            
                    
                            var imagElement = $("<img>");
                        // $(imagElement).attr("src", image).attr("data-img", image).attr("data-vid", video).attr("data-live", "no");
                        
                            var buttonHeadline = $("<button>");
                            var headlineLink = $("<a href='" + test.response.docs[i].web_url + "' target='_blank'>");
                            var pHolder = $("<p class='articleButtons'>");
                
                            $(buttonHeadline).append(test.response.docs[i].headline.main);
                            $(headlineLink).append(buttonHeadline);
                            $(pHolder).append(headlineLink);
                
                        
                            $("#article-section").prepend(pHolder);
                                
                        }
                    }
                    
                }).fail(function(err) {
                    throw err;
                });
        }
       
    }
});