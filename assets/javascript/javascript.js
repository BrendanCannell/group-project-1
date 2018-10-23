
$(document).ready(function() {

    var userSearchTerm;
    var year;
    var imgSrc;
    var month;
    var newDate;
    var endDate

    
    $("#searchArticle").on("click", function(event) {
        
        event.preventDefault();

        userSearchTerm = $("#searchInput").val().trim();
        year = parseInt($("#year").val());

        if (userSearchTerm === "" || isNaN(year) || month == null)
          {
            $("#errorField").text("Please fill in all Search Fields");
        }

        else {
            $("#errorField").empty();
            year = parseInt($("#year").val());
            newDate = year + month + "01";
            newDate = newDate.toString();
            endDate = moment(year + month + "01").endOf('month').format("YYYYMMDD");
            endDate = endDate.toString();

            renderArticles();
        }
    });

    $(".dropdown-item").on("click", function(event) {
        
        event.preventDefault();

        month = $(this).attr("data-mon");
        $("#dropdownMonth").text(($(this).text()));
        
    });

    $("#nextYear").on("click", function(event) {
        
        event.preventDefault();

        year = parseInt($("#year").val());
        if (isNaN(year)) {
            year = 1999;
        }
        year = year + 1; 
        $("#year").val(year);   
        
    });

    $("#previousYear").on("click", function(event) {
       
        event.preventDefault();

        year = parseInt($("#year").val());
        year = parseInt($("#year").val());
        if (isNaN(year)) {
            year = 2001;
        }
        year = year - 1; 
        $("#year").val(year);   
        
    });

    $("#clear").on("click", function(event) {
        
        event.preventDefault();

        $("#searchInput").val("");
        $("#year").val("");
        $("#article-section").empty();
    });
        


    function renderArticles() {


        if (userSearchTerm !== "" && year) {

            if (year > 2005) {


                    var url = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
                    url += '?' + $.param({
                    'api-key': "b3319917b4b54c0ba4a7eb463d0099d9",
                    'q': userSearchTerm,
                    'fq': "news_desk:(\"Business\" \"Business Day\" \"Financial\" \"Your Money\" )",
                    'begin_date': newDate,
                    'end_date': endDate
                    });
                    $.ajax({
                        url: url,
                        method: 'GET',
                    }).done(function(result) {
                        var test = result;

                    if (test.response.docs.length === 0) {
                        $("#errorField").text("No results found, please expand search.");  
                    }

                    var numberArticles = test.response.docs.length;
                
                    for (var i = 0; i < numberArticles; i++) {

                        var headlineLink = test.response.docs[i].web_url;
                        var headliner = test.response.docs[i].headline.main;
                        var imageCheck = test.response.docs[i].multimedia.length;
                        var bodyText = test.response.docs[i].snippet;
                        if (imageCheck) {

                            imgSrc = "https://static01.nyt.com/" + test.response.docs[i].multimedia[0].url;
                        }
                        else {
                            imgSrc = "assets/images/chart.png";
                        }

                        var articleCard = $("<div class='card articleCard'><div class='card-body'><h4 class='card-title'>" + headliner + "</h4><img class='rounded articleImg' src='" + imgSrc + "'</img><p class='card-text'>" + bodyText + "</p><a href='" + headlineLink + "' target='_blank' class='btn btn-primary toArticleButton'>See Full Article</a></div></div>");
            
                        $("#article-section").prepend(articleCard);
                        
                    }
                    
                }).fail(function(err) {
                    throw err;
                
                });
            }

            if (year <= 2005) {

 
                var url = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
                url += '?' + $.param({
                  'api-key': "b3319917b4b54c0ba4a7eb463d0099d9",
                  'q': userSearchTerm,
                  'begin_date': newDate,
                  'end_date': endDate
                });
                $.ajax({
                  url: url,
                  method: 'GET',
                }).done(function(result) {
                         var test = result;

                if (test.response.docs.length === 0) {
                $("#errorField").text("No results found, please expand search.");  
                }
 
                     var numberArticles = test.response.docs.length;
                 
                     for (var i = 0; i < numberArticles; i++) {
                     
 
                        var headlineLink = test.response.docs[i].web_url;
                        var headliner = test.response.docs[i].headline.main;
                
                        var bodyText = test.response.docs[i].snippet;
                        
                        imgSrc = "assets/images/old.png";
            
                        var articleCard = $("<div class='card articleCard'><div class='card-body'><h4 class='card-title'>" + headliner + "</h4><img class='rounded articleImg' src='" + imgSrc + "'</img><p class='card-text'>" + bodyText + "</p><a href='" + headlineLink + "' target='_blank' class='btn btn-primary toArticleButton'>See Full Article</a></div></div>");
            
                        $("#article-section").prepend(articleCard);
                                 
                     }
                     
                 }).fail(function(err) {
                     throw err;
                 
                 });
             }
        }

        
       
    }
});