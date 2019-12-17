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

    function appendFilm(filmArr,flag) { //Funzione che stampa film trovati
        for (var i = 0; i < filmArr.length; i++) { //Scorro tutti i film trovati con la ricerca
            var starsVote = voteToStars(filmArr[i].vote_average); //Richiamo funzione per trasformare voto in stelle
            // var flag = setFlags(filmArr[i].original_language);
            if (flag == true) {
                var printTemplate = objTemplate(filmArr[i],starsVote);
                var filmPosition = $(".results.film");
                printHtml(printTemplate,filmPosition);
            } else {
                var printTemplate = objTemplateSerie(filmArr[i],starsVote);
                var seriePosition = $(".results.series");
                printHtml(printTemplate,seriePosition);
            }
        }
    }

    function objTemplate(actFilm,stampVote) {
        var print = { //Oggetto per prendere variabili Handlebars
            boolTitle : actFilm.title, //recupero titolo
            boolOrTitle : actFilm.original_title, //Recupero titolo originale
            // boolLang : flag, //Bandiera lingua
            boolVote : stampVote //Voto in stelle
        }
        return print;
    }

    function objTemplateSerie(actFilm,stampVote) {
        var print = { //Oggetto per prendere variabili Handlebars
            boolTitle : actFilm.name, //recupero titolo
            boolOrTitle : actFilm.original_name, //Recupero titolo originale
            // boolLang : flag, //Bandiera lingua
            boolVote : stampVote //Voto in stelle
        }
        return print;
    }

    function printHtml(templateP,position) {
        var printHtml = template(templateP); //Metto in una variabile il template creato con la funzione handlebars
        position.append(printHtml); //Appendo template nel container delle canzoni
    }

    function voteToStars(vote) { //Funzione che restituisce il voto in stelle
        var retVote; //Variabile che conterrà il contenuto da mandare a schermo

        if (vote == 0) { //Se il voto è zero...
            retVote = forStars(0,5); //Richiamo funzione per concatenare le varie stelle (5 vuote)
        } else if (vote >= 1 && vote < 3) { //Se il voto è compreso tra 1 e 3...
            retVote = forStars(1,4);  //Richiamo funzione per concatenare le varie stelle (1 piena e 4 vuote)
        } else if (vote >= 3 && vote < 5) { //Se il voto è compreso tra 3 e 5...
            retVote = forStars(2,3);  //Richiamo funzione per concatenare le varie stelle (2 piene e 3 vuote)
        } else if (vote >= 5 && vote < 7) { //Se il voto è compreso tra 5 e 7...
            retVote = forStars(3,2);  //Richiamo funzione per concatenare le varie stelle (3 piene e 2 vuote)
        } else if (vote >= 7 && vote < 9) { //Se il voto è compreso tra 7 e 9...
            retVote = forStars(4,1);  //Richiamo funzione per concatenare le varie stelle (4 piene e 1 vuota)
        } else if (vote >= 9 && vote < 10) { //Se il voto è compreso tra 9 e 10...
            retVote = forStars(5,0);  //Richiamo funzione per concatenare le varie stelle (5 piene)
        }

        return retVote; //Ritorno codice con stelle
    }
});

function forStars(full,empty) { //Funzione che permette di immettere in una variabile un tot di stelle piene e vuote
    var fullStar = "<i class=\"fas fa-star\"></i>"; //Codice per stella piena
    var emptyStar = "<i class=\"far fa-star\"></i>" //Codice per stella vuota
    var finalVote = ""; //Codice che ocnterrà tutte le stelle

    for (var i = 0; i < full; i++) { //For per scrivere stelle piene
        finalVote = finalVote.concat(fullStar); //Concateno tutto nella variabile del voto finale
    }

    for (var i = 0; i < empty; i++) { //For per scrivere stelle vuote
        finalVote = finalVote.concat(emptyStar); //Concateno tutto nella variabile del voto finale
    }

    return finalVote; //Ritorno codice finale
}

    //Non Funzionante
// function setFlags(flagReq) {
//     var urlFlags = 'https://public-us.opendatasoft.com/api/records/1.0/search/?dataset=country-flags';
//
//     $.ajax ({ //Chiamata AJAX per recuperare bandiere
//         'url' : urlFlags,
//         'method' : 'GET', //Metodo GET
//         'success' : function(flagRes) {  //Caso funzionamento richiesta
//             flags = flagRes.response;
//             fetch(urlFlags)
//                 .then(flags => flags.json())
//                 .then(records => {
//                     records.forEach(function(record) {
//                         $(record.fields)
//                     })
//
//
//                 });
//         },
//         'error' : function() { //Caso di errore di caricamento
//             alert("Errore");
//         }
//     });
// }
