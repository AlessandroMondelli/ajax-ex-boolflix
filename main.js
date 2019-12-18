$(document).ready(function() {
    var standardUrl = 'https://api.themoviedb.org/3/'; //Url standard da dove recupero API
    var filmUrl = 'search/movie/'; //Sezione dove recupero film
    var serieUrl = 'search/tv'; //Sezione dove recupero serie tv

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
                    var flagFilm = true; //Flag che segnala che si stanno cercando dei film
                    var films = result.results;
                    appendFilm(films,flagFilm);
                },
                'error' : function() { //Caso di errore di caricamento
                    alert("Errore");
                }
            });

            $.ajax ({ //Chiamata AJAX per recuperare dati film
                'url' : standardUrl + serieUrl, //Url per recuperare film
                'method' : 'GET', //Metodo GET
                'data' : { //Informazioni extra per accedere alla sezione
                    'api_key' : 'a5c0e4852eb33c487e7bf7b17de279d2',
                    'query' : searchVal,
                    'language' : 'it-IT'
                },
                'success' : function(result) { //Caso funzionamento richiesta
                    var flagFilm = false; //Flag che segnala che si stanno cercando serie tv
                    var series = result.results;
                    appendFilm(series,flagFilm);
                },
                'error' : function() { //Caso di errore di caricamento
                    alert("Errore");
                }
            });
        }
    }

    function appendFilm(filmArr,flagF) { //Funzione che stampa film trovati
        for (var i = 0; i < filmArr.length; i++) { //Scorro tutti i film trovati con la ricerca
            var starsVote = voteToStars(filmArr[i].vote_average); //Richiamo funzione per trasformare voto in stelle
            // var flag = setFlags(filmArr[i].original_language);
            var printAndPos = objTemplate(filmArr[i],starsVote,flagF); //Chiamo funzione per scrivere template film
            console.log(printAndPos);
            printHtml(printAndPos[0],printAndPos[1]); //richiamo funzione per appendere film nell'html
        }
    }

    function objTemplate(actFilm,stampVote,flagFS) { //Funzione che prepara template film
        var infoAndPosition = [];
        if (flagFS == true) {
            var print = { //Oggetto per prendere variabili Handlebars
                boolTitle : actFilm.title, //recupero titolo
                boolOrTitle : actFilm.original_title, //Recupero titolo originale
                // boolLang : flag, //Bandiera lingua
                boolVote : stampVote //Voto in stelle
            }
            var filmPosition = $(".results.film"); //salvo la posizione dove dovranno essere inseriti i film
            infoAndPosition.push(print,filmPosition);
        } else {
            var print = { //Oggetto per prendere variabili Handlebars
                boolTitle : actFilm.name, //recupero titolo
                boolOrTitle : actFilm.original_name, //Recupero titolo originale
                // boolLang : flag, //Bandiera lingua
                boolVote : stampVote //Voto in stelle
            }
            var seriePosition = $(".results.series"); //salvo la posizione dove dovranno essere inserite le serie
            infoAndPosition.push(print,seriePosition);
        }
        return infoAndPosition
    }

    function printHtml(templateP,position) { //Funzione he stampa su html
        var printHtml = template(templateP); //Metto in una variabile il template creato con la funzione handlebars
        position.append(printHtml); //Appendo template nel container delle serie o dei film
    }

    function voteToStars(vote) { //Funzione che restituisce il voto in stelle
        var vote5; //Voto in base 5
        var retVote; //Variabile che conterrà il contenuto da mandare a schermo

        vote5 = Math.ceil((vote / 2)); //Arrontondo voto in base 5
        retVote = forStars(vote5); //Richiamo funzona per trasformare voto in stelle

        return retVote; //Ritorno codice con stelle
    }
});

function forStars(full) { //Funzione che permette di immettere in una variabile un tot di stelle piene e vuote
    var fullStar = "<i class=\"fas fa-star\"></i>"; //Codice per stella piena
    var emptyStar = "<i class=\"far fa-star\"></i>" //Codice per stella vuota
    var finalVote = ""; //Codice che ocnterrà tutte le stelle

    for (var i = 0; i < 5; i++) { //For per scrivere stelle piene
        if (i < full) {
            finalVote = finalVote.concat(fullStar);//Concateno stelle piene nella variabile del voto finale
        } else {
            finalVote = finalVote.concat(emptyStar); //Concateno stelle piene nella variabile del voto finale
        }
    }
    return finalVote; //Ritorno codice finale
}

    //Non Funzionante
// function setFlags(flagReq) {

// }
