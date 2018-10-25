
$(document).ready(function() {

    var userSearchTerm;
    var yearFrom;
    var yearTo;
    var imgSrc;
    var monthTo;
    var monthFrom;
    var newDate;
    var endDate
    /////slider Variables//////
    var endDate;
    var dayCount = 0;
    var $range1 = $("#slider1");
    var $range2 = $("#slider2");


    ///////Month Slider////////
    moment.locale("en-US");

    $range1.ionRangeSlider({
        type: "double",
        grid: true,
        min: 1,
        max: 12,
        from: 3,
        to: 10,
        step: 1,
        grid_snap: true,
        prettify: function (num) {
        var date = num;
        
            if (dayCount === 0) {
            monthFrom = moment(date, 'MM').format("MM"); 
            dayCount++;
            }
            else if (dayCount = 1) {
            monthTo = moment(date, 'MM').format("MM"); 
            dayCount = 0;
            }

            return moment(date, 'MM.YYYY').format("MMMM");

        }
    });

    $range2.ionRangeSlider({
        type: "double",
        grid: true,
        min: 1940,
        max: 2018,
        from: 1990,
        to: 2010,
        prettify_enabled: false,
        onStart: function (data) {
            yearFrom = data.from;
            yearTo = data.to;
        },
        onChange: function (data) {
            yearFrom = data.from;
            yearTo = data.to;
        }
    });
    
    $("#searchArticle").on("click", function(event) {
        
        event.preventDefault();

        userSearchTerm = $("#searchInput").val().trim()

            $("#errorField").empty();
            newDate = yearFrom + monthFrom + "01";
            newDate = newDate.toString();
            endDate = moment(yearTo + monthTo + "01").endOf('month').format("YYYYMMDD");
            endDate = endDate.toString();
            renderArticles();
        
    });

    $("#clear").on("click", function(event) {
        
        event.preventDefault();

        $("#searchInput").val("");
        $("#year").val("");
        $("#article-section").empty();
    });

    function renderArticles() {

        if (userSearchTerm === "") {
            $("#errorField").text("Please Enter a Keyword to Search For.");
        }

        if (userSearchTerm !== "") {

            if (yearTo > 2005) {

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

            if (yearTo <= 2005) {

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