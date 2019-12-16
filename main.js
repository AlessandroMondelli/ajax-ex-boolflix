$(document).ready(function() {

    //Preparo template Handlebars
    var source = $("#boolflix-template").html();
    //Preparo template con funzione
    var template = Handlebars.compile(source);

    var standardUrl = 'https://api.themoviedb.org/3/'; //Url standard da dove recupero API
    var filmUrl = 'search/movie/'; //Sezione dove recupero film


    $(".button").click(function() { //Al click su bottone ricerca
        var ricerca = $(".research input").val(); //Prendo stringa inserita dall'utente
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
                console.log(ricerca);
                for (var i = 0; i < films.length; i++) {
                    var printTemplate = { //Oggetto per prendere variabili Handlebars
                        boolTitle : films[i].title,
                        boolOrTitle : films[i].original_title,
                        boolLang : films[i].original_language,
                        boolVote : films[i].vote_average
                    }

                var printHtml = template(printTemplate); //Metto in una variabile il template creato con la funzione handlebars
                $(".results").append(printHtml); //Appendo template nel container delle canzoni
                }

            },
            'error' : function() { //Caso di errore di caricamento
                alert("Errore");
            }
        });
    });


});
