$(document).ready(function() {
    var standardUrl = 'https://api.themoviedb.org/3/'; //Url standard da dove recupero API
    var filmUrl = 'search/movie/'; //Sezione dove recupero film
    var serieUrl = 'search/tv'; //Sezione dove recupero serie tv
    var posterUrl = 'https://image.tmdb.org/t/p/w185' //Sezione dove recupero poster
    var posterNotAvaible = 'https://uhcl-ir.tdl.org/bitstream/handle/10657.1/1588/not-available.jpg.jpg.jpg?sequence=3&isAllowed=y'; //Immagine in caso di poster mancante
    var flagsAvaible = ['it','en','fr','de','es','pt','da','mex','ja','zh','ko','vi','hi']; //Lista bandiere

    //Preparo template Handlebars
    var source = $("#boolflix-template").html();
    //Preparo template con funzione
    var template = Handlebars.compile(source);

    $(".button").click(function() { //Al click su bottone ricerca
        apiActive(); //Richiamo funzione che attiva tutta la ricerca
    });

    $( ".research input" ).keypress(function(event) { //Alla pressione di invio..
        if (event.which == 13) {
            apiActive(); //Richiamo funzione che attiva tutta la ricercas
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
        var searchVal = getSearch(); //Prendo valore ricerca
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
                    var films = result.results; //Prendo array risultati ricevuti da API
                    if (films.length != 0) { //Se non è vuoto..
                        appendFilm(films,flagFilm); //Appendo film/serie a html
                    } else { //Altrimenti..
                        $(".results.film").text("Film o Serie non trovato!"); //stampo un messaggio
                    }
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
                    if (series.length != 0) { //Se non è vuoto..
                        appendFilm(series,flagFilm); //Appendo film/serie a html
                    } else { //Altrimenti..
                        $(".results.film").text("Film o Serie non trovato!"); //stampo un messaggio
                    }
                },
                'error' : function() { //Caso di errore di caricamento
                    alert("Errore");
                }
            });
        }
    }

    function appendFilm(filmArr,flagF) { //Funzione che stampa film trovati
        for (var i = 0; i < filmArr.length; i++) { //Scorro tutti i film trovati con la ricerca
            var fPoster = getPoster(filmArr[i].poster_path);
            var starsVote = voteToStars(filmArr[i].vote_average); //Richiamo funzione per trasformare voto in stelle
            var langFlag = setFlags(filmArr[i].original_language); //Richiamo funione per ricevere bandiera
            var printAndPos = objTemplate(fPoster,filmArr[i],starsVote,flagF,langFlag); //Chiamo funzione per scrivere template film
            printHtml(printAndPos[0],printAndPos[1]); //richiamo funzione per appendere film nell'html
        }
    }

    function objTemplate(poster,actFilm,stampVote,flagFS,lang) { //Funzione che prepara template film
        var infoAndPosition = []; //Array che conterrà tutte le info di un film/serie e distigue se è un film o una serie
        if (flagFS == true) {
            var print = { //Oggetto per prendere variabili Handlebars
                boolPoster :  poster, //Stampo poster
                boolTitle : actFilm.title, //recupero titolo
                boolOrTitle : actFilm.original_title, //Recupero titolo originale
                boolLang : lang, //Bandiera lingua
                boolVote : stampVote //Voto in stelle
            }
            var filmPosition = $(".results.film"); //salvo la posizione dove dovranno essere inseriti i film
            infoAndPosition.push(print,filmPosition); //Metto info e se film/serie su un array
        } else {
            var print = { //Oggetto per prendere variabili Handlebars
                boolPoster : poster, //Stampo poster
                boolTitle : actFilm.name, //recupero titolo
                boolOrTitle : actFilm.original_name, //Recupero titolo originale
                boolLang : lang, //Bandiera lingua
                boolVote : stampVote //Voto in stelle
            }
            var seriePosition = $(".results.series"); //salvo la posizione dove dovranno essere inserite le serie
            infoAndPosition.push(print,seriePosition); //Metto info e se film/serie su un array
        }
        return infoAndPosition //ritorno array
    }

    function printHtml(templateP,position) { //Funzione he stampa su html
        var printHtml = template(templateP); //Metto in una variabile il template creato con la funzione handlebars
        position.append(printHtml); //Appendo template nel container delle serie o dei film
    }

    function getPoster(poster) { //Funzione che prende poster
        var finalPoster = '<img src="' + posterUrl + poster + '">';
        var notAvaible = '<img src="' + posterNotAvaible + '">';
        if (!finalPoster.includes("null")) {
            return finalPoster;
        } else {
            return notAvaible;
        }
    }

    function voteToStars(vote) { //Funzione che restituisce il voto in stelle
        var vote5; //Voto in base 5
        var retVote; //Variabile che conterrà il contenuto da mandare a schermo

        vote5 = Math.ceil((vote / 2)); //Arrontondo voto in base 5
        retVote = forStars(vote5); //Richiamo funzona per trasformare voto in stelle

        return retVote; //Ritorno codice con stelle
    }

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

    function setFlags(flagReq) {
        if (flagsAvaible.includes(flagReq)) {
            var retFlag = '<img src="flags/' + flagReq + '.png" alt="Bandiera ' + flagReq +'">';
        } else {
            var retFlag = flagReq;
        }
        return retFlag;
    }
});
