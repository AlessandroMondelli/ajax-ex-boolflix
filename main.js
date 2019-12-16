$(document).ready(function() {
    var standardUrl = 'https://api.themoviedb.org/3/'; //Url standard da dove recupero API
    var filmUrl = 'search/movie/'; //Sezione dove recupero film

    $(".button").click(function() { //Al click su bottone ricerca
        var ricerca = $(".research input").val(); //Prendo stringa inserita dall'utente

        if (ricerca != "") {
            $(".results").empty(); //Elimino risultati precedenti
            $.ajax ({ //Chiamata AJAX per recuperare dati film
                'url' : standardUrl + filmUrl, //Url per recuperare film
                'method' : 'GET', //Metodo GET
                'data' : { //Informazioni extra per accedere alla sezione
                    'api_key' : 'a5c0e4852eb33c487e7bf7b17de279d2',
                    'query' : ricerca,
                    'language' : 'it-IT'
                },
                'success' : function(result) { //Caso funzionamento richiesta
                    var films = result.results;

                    filmsResearch(films); //Richiamo funzione che crea le cards da mostrare all'utente
                },
                'error' : function() { //Caso di errore di caricamento
                    alert("Errore");
                }
            });
        }
    });
});

function filmsResearch(film) { //Funzione per creare cards dei film
    //Preparo template Handlebars
    var source = $("#boolflix-template").html();
    //Preparo template con funzione
    var template = Handlebars.compile(source);

    for (var i = 0; i < film.length; i++) {
        var printTemplate = { //Oggetto per prendere variabili Handlebars
            boolTitle : film[i].title,
            boolOrTitle : film[i].original_title,
            boolLang : film[i].original_language,
            boolVote : film[i].vote_average
        }

    var printHtml = template(printTemplate); //Metto in una variabile il template creato con la funzione handlebars
    $(".results").append(printHtml); //Appendo template nel container delle canzoni
    }
}
