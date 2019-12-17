$(document).ready(function() {
    var standardUrl = 'https://api.themoviedb.org/3/'; //Url standard da dove recupero API
    var filmUrl = 'search/movie/'; //Sezione dove recupero film

    //Preparo template Handlebars
    var source = $("#boolflix-template").html();
    //Preparo template con funzione
    var template = Handlebars.compile(source);

    $(".button").click(function() { //Al click su bottone ricerca
        apiActive();
    });

    $( ".research input" ).keypress(function(event) {
        if (event.which == 13) {
            apiActive();
        }
    });



                        //*** FUNZIONI ***//
    function getSearch() { //Funzione che prende valore dell'input
        var ricerca = $(".research input").val(); //Prendo stringa inserita dall'utente
        if (ricerca != "") {
            $(".results").empty(); //Elimino risultati precedenti
        }
        $(".research input").val(""); //Elimino testo dopo la ricerca
        return ricerca; //Ritorno il valore ricercato
    }

    function apiActive() { //Funzione per trovare film tramite API
        var searchVal = getSearch();
        if (searchVal != "") { //Se la ricerca non è vuota...
            $.ajax ({ //Chiamata AJAX per recuperare dati film
                'url' : standardUrl + filmUrl, //Url per recuperare film
                'method' : 'GET', //Metodo GET
                'data' : { //Informazioni extra per accedere alla sezione
                    'api_key' : 'a5c0e4852eb33c487e7bf7b17de279d2',
                    'query' : searchVal,
                    'language' : 'it-IT'
                },
                'success' : function(result) { //Caso funzionamento richiesta
                    var films = result.results;
                    appendFilm(films);
                },
                'error' : function() { //Caso di errore di caricamento
                    alert("Errore");
                }
            });
        }
    }

    function appendFilm(filmArr) { //Funzione che stampa film trovati
        for (var i = 0; i < filmArr.length; i++) {
            var starsVote = voteToStars(filmArr[i].vote_average);
            var printTemplate = { //Oggetto per prendere variabili Handlebars
                boolTitle : filmArr[i].title,
                boolOrTitle : filmArr[i].original_title,
                boolLang : filmArr[i].original_language,
                boolVote : starsVote
            }

        var printHtml = template(printTemplate); //Metto in una variabile il template creato con la funzione handlebars
        $(".results").append(printHtml); //Appendo template nel container delle canzoni
        }
    }

    function voteToStars(vote) {
        console.log(vote);
        var retVote;

        if (vote == 0) {
            retVote = forStars(0,5);
        } else if (vote >= 1 && vote < 3) {
            retVote = forStars(1,4);
        } else if (vote >= 3 && vote < 5) {
            retVote = forStars(2,3);
        } else if (vote >= 5 && vote < 7) {
            retVote = forStars(3,2);
        } else if (vote >= 7 && vote < 9) {
            retVote = forStars(4,1);
        } else if (vote >= 9 && vote < 10) {
            retVote = forStars(5,0);
        }

        return retVote;
    }
});

function forStars(full,empty) {
    var fullStar = "<i class=\"fas fa-star\"></i>";
    var emptyStar = "<i class=\"far fa-star\"></i>"
    var finalVote = "";

    for (var i = 0; i < full; i++) {
        finalVote = finalVote.concat(fullStar);
    }
    console.log(finalVote);

    for (var i = 0; i < empty; i++) {
        finalVote = finalVote.concat(emptyStar);
    }
    console.log(finalVote);

    return finalVote;
}
