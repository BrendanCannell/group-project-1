
var Obj = {
  headlines:[],
  snip:[],
  webUrl:[],
  pubDate:[]
}

function fromApi(url){
  $("#head").empty();
    $.ajax({
    url:url,
    method:"GET"
    }).then(function(response){
    console.log(response);
    console.log(response.dataset);
    
  
    // fromApi(dataColl.name,dataColl.columnNames,dataColl.dataData);
    $("#head").append("<h2>" + response.dataset.name + "</h2>");
    console.log(response.dataset.name);
    console.log(response.dataset.data);
    console.log(response.dataset.column_names);
    var newHeading =  $("<tr>");
    newHeading.append(
      $("<th>").text(response.dataset.column_names[0]),
      $("<th>").text(response.dataset.column_names[1])
    );
    $("#myTable").append(newHeading)
    for (var i=0; i<response.dataset.data.length; i++){
      var newRowData = $("<tr>");
      newRowData.append(
      $("<td>").text(response.dataset.data[i][0]),
      $("<td>").text(response.dataset.data[i][1])
      );
      $("#tbody").append(newRowData);
    };
  
    });
  };
  
  // ======================== nyt here
  $(".submit").on("click", function(e){
      e.preventDefault();
      $("#head").empty();
      $('#myTable tbody > tr').remove();
      
      // alert("hi")
      var search = {
        numArticles :($("#number").val()),
        userSearch  : ($("#search").val())
      };
    var queryURL = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
    queryURL += '?' + $.param({
      'api-key': "18f6498c38d446bba98c7f93f7e54659",
      'begin_date': "20100927",
      'end_date': "20180927", //yyyymmdd
      'fq': "news_desk:(\"Business\" \"Business Day\" \"Financial\" \"Your Money\" )",
      // 'fq': "news_desk:(\"Your Money\" )",
      'q': search.userSearch
    });
    fromNYT(queryURL);
   });
  
    function fromNYT(queryURL){
      
      $("#head").empty();
      $.ajax({
      url: queryURL,
      method: 'GET',
      }).then(function(result) {
  
      // console.log(result.response.docs[search.numArticles].headline.main)
      console.log(result.response);
      for(var j=0; j<=(result.response.docs.length); j++){
        // console.log(result.response.docs[j].headline.main);
        // console.log(result.response.docs[j].web_url);

        // Object where Headlines, SNIP, WebURL and Published Date goes in 
        Obj.headlines.push(result.response.docs[j].headline.main);
        Obj.snip.push(result.response.docs[j].snippet);
        Obj.webUrl.push(result.response.docs[j].web_url);
        var date = result.response.docs[j].pub_date;
        var dateParsed = (date.split('T')[0]);

        Obj.pubDate.push(dateParsed);
        console.log(Obj);

        var nDiv = $("<div>");
        // pTag.html("<p>" + j + "</p>");
        nDiv.append("<p class='display'> Published Date: " + dateParsed + "</p>");
        nDiv.append("<p class='display'> Headline: " + result.response.docs[j].headline.main + "</p>");
        nDiv.append("<p class='display'> Snippet: " + result.response.docs[j].snippet + "</p>");
        nDiv.append("<a href=" + result.response.docs[j].web_url + ">"+result.response.docs[j].web_url+"</a>");
       
        
        $("#head").append(nDiv);
      };
  
    });
    };
    
  
  
  
  //=========================
  var url = "https://www.quandl.com/api/v3/datasets/FRED/NROUST?start_date=2010-04-01&end_date=2020-10-01&api_key=uCPgQZe-zx8XEXckzw8M";
  
  var growth = ["GDP","GDPC1","GDPPOT"];
  
  var pI = ["CPIAUCSL","CPILFESL","GDPDEF"];
                  
  var mS = ["BASE","BASE","M1","M2","M1V","M2V"];
                              
  var iR = ["DFF","DFF","DTB3","DGS5","DGS10","DGS30","T5YIE","T10YIE","T5YIFR","TEDRATE","DPRIME"];
          
  var debt = ["GFDEBTN","GFDEGDQ188S","EXCSRESNW","TOTCI"];
                      
  var InE = ["MEHOINUSA672N","DSPIC96","PCE","PCEDG","PSAVERT","RRSFS","DSPI"];
                                  
  var unemp = ["UNRATE","NROU","NROUST","CIVPART","EMRATIO","UNEMPLOY","PAYEMS","MANEMP","ICSA","IC4WSA"];
                              
  var others = ["INDPRO","TCU","HOUST","GPDI","CP","STLFSI","DCOILWTICO","USSLIND","DTWEXM","DTWEXB"];
  
  // var dataType = [];
  function createBtn(btnName,tag){
    var newBtn = $("<button>"+btnName+ "</button>");
    newBtn.attr("data-atr", btnName);
    newBtn.addClass("arrBtn")
    $("#"+tag).append(newBtn);
    
  };
  function createArrBtn(tag,data){
    for(var i=0; i<data.length; i++){
      createBtn(data[i],tag);
      console.log(data[i]);
    };
  };
  
  createArrBtn("growth",growth);
  createArrBtn("pI",pI);
  createArrBtn("mS",mS);
  createArrBtn("iR",iR);
  createArrBtn("debt",debt);
  createArrBtn("InE",InE);
  createArrBtn("unemp",unemp);
  createArrBtn("others",others);
  //======================================================
  $("button").on("click",function(){
     $("#head").empty();
     $('#myTable tbody > tr').remove();
    var da = $(this).attr("data-atr");
   var url = "https://www.quandl.com/api/v3/datasets/FRED/"+da+"?start_date=2010-04-01&end_date=2020-10-01&api_key=uCPgQZe-zx8XEXckzw8M";
    fromApi(url);
  });
  
  
  // $.ajax({
  //   url:url,
  //   method:"GET"
  // }).then(function(response){
  //   console.log(response);
  //   console.log(response.dataset);
  //   console.log(dataColl.dataData);
  //   dataColl.name = response.dataset.name;
  //   dataColl.columnNames = response.dataset.column_names;
  //   dataColl.dataData = response.dataset.data;
  //   // fromApi(dataColl.name,dataColl.columnNames,dataColl.dataData);
  //   $("#head").append("<h5>" + response.dataset.name + "</h5>");
  //   console.log(response.dataset.name);
  //   console.log(response.dataset.data);
  //   console.log(response.dataset.column_names);
  //   var newHeading =  $("<tr>");
  //   newHeading.append(
  //   $("<th>").text(response.dataset.column_names[0]),
  //   $("<th>").text(response.dataset.column_names[1])
  //   );
  //   $("#myTable").append(newHeading)
  //   for (var i=0; i<response.dataset.data.length; i++){
  //     var newRowData = $("<tr>");
  //     newRowData.append(
  //     $("<td>").text(response.dataset.data[i][0]),
  //     $("<td>").text(response.dataset.data[i][1])
      
  //     );
  //     $("#myTable").append(newRowData);
  //   };
  
  // });