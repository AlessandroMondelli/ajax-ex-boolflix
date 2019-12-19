$(document).ready(function() {
    var standardUrl = 'https://api.themoviedb.org/3/'; //Url standard da dove recupero API

    var filmUrl = 'search/movie/'; //Sezione dove recupero film
    var serieUrl = 'search/tv'; //Sezione dove recupero serie tv
    var hotNowFilm = 'discover/movie'; //Sezione che prende film in base ad un criterio

    var mostPopular = 'popularity.desc'; //Proprietà dell'API che ritorna ilm più popolari
    var flagPopular = 3; //Verifico se si tratta di popolari
    var mostVoted = 'vote_average.desc'; //Proprietà dell'API che ritorna ilm più Votati
    var flagVoted = 4; //Verifico se si tratta di votati

    var posterUrl = 'https://image.tmdb.org/t/p/w342' //Sezione dove recupero poster
    var posterNotAvaible = 'https://upload.wikimedia.org/wikipedia/commons/6/64/Poster_not_available.jpg'; //Immagine in caso di poster mancante

    var flagsAvaible = ['it','en','fr','de','es','pt','da','mex','ja','zh','cn','tl','id','ko','vi','hi']; //Lista bandiere

    //Preparo template Handlebars
    var source = $("#boolflix-template").html();
    //Preparo template con funzione
    var template = Handlebars.compile(source);

    discoverFilms(mostPopular,flagPopular); //Cerco film più popolari del momento
    discoverFilms(mostVoted,flagVoted); //Cerco film più votati

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
        var hotNowPos = $("#hot-now"); //Posizione sezione hot now
        var searchedPos = $("#once-searched"); //Posizone sezione searched
        var ricerca = $(".research input").val(); //Prendo stringa inserita dall'utente
        if (ricerca != "") {
            $(".results.search").empty(); //Elimino risultati precedenti
            hideShow(hotNowPos,searchedPos); //Cambio stato in base alla ricerca
        } else {
            hideShow(searchedPos,hotNowPos); //Cambio stato se l'utente cerca una stringa vuota
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
                    var flagFilm = 1; //Flag che segnala che si stanno cercando dei film
                    var films = result.results; //Prendo array risultati ricevuti da API
                    if (films.length != 0) { //Se non è vuoto..
                        appendFilm(films,flagFilm); //Appendo film/serie a html
                    } else { //Altrimenti..
                        $("#once-searched .film .results").text("Film non trovato!"); //stampo un messaggio
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
                    var flagFilm = 2; //Flag che segnala che si stanno cercando serie tv
                    var series = result.results;
                    if (series.length != 0) { //Se non è vuoto..
                        appendFilm(series,flagFilm); //Appendo film/serie a html
                    } else { //Altrimenti..
                        $("#once-searched .series .results").text("Serie non trovata!"); //stampo un messaggio
                    }
                },
                'error' : function() { //Caso di errore di caricamento
                    alert("Errore");
                }
            });
        }
    }

    function discoverFilms(sort,flag) { //Funzione che recupera film più votati e famosi
        $.ajax ({ //Chiamata AJAX per recuperare dati film
            'url' : standardUrl + hotNowFilm, //Url per recuperare film
            'method' : 'GET', //Metodo GET
            'data' : { //Informazioni extra per accedere alla sezione
                'api_key' : 'a5c0e4852eb33c487e7bf7b17de279d2',
                'sort_by' : sort,
                'language' : 'it-IT'
            },
            'success' : function(result) { //Caso funzionamento richiesta
                var hotNow = result.results; //Prendo array risultati ricevuti da API
                hotNow = hotNow.slice(0, 6); //Prendo i primi 7 risultati

                appendFilm(hotNow,flag); //Appendo film/serie a html
            },
            'error' : function() { //Caso di errore di caricamento
                alert("Errore");
            }
        });
    }

    function appendFilm(filmArr,flagF) { //Funzione che stampa film trovati
        for (var i = 0; i < filmArr.length; i++) { //Scorro tutti i film trovati con la ricerca
            var fPoster = getPoster(filmArr[i].poster_path);
            var starsVote = voteToStars(filmArr[i].vote_average); //Richiamo funzione per trasformare voto in stelle
            var langFlag = setFlags(filmArr[i].original_language); //Richiamo funione per ricevere bandiera
            var fOverview = filmOverview(filmArr[i].overview); //Funzione che verifica se è presente l'overview
            getCast(filmArr[i].id)
            var printAndPos = objTemplate(fPoster,filmArr[i],starsVote,flagF,langFlag,fOverview); //Chiamo funzione per scrivere template film
            printHtml(printAndPos[0],printAndPos[1]); //richiamo funzione per appendere film nell'html
        }
    }

    function objTemplate(poster,actFilm,stampVote,flagFS,lang,overview) { //Funzione che prepara template film
        var infoAndPosition = []; //Array che conterrà tutte le info di un film/serie e distigue se è un film o una serie
        if (flagFS != 2) {
            var print = { //Oggetto per prendere variabili Handlebars
                boolPoster :  poster, //Stampo poster
                boolTitle : actFilm.title, //recupero titolo
                boolOrTitle : actFilm.original_title, //Recupero titolo originale
                boolLang : lang, //Bandiera lingua
                boolVote : stampVote, //Voto in stelle
                boolOverview : overview //Trama film
            }
            if (flagFS == 1) {
                var filmPosition = $("#once-searched .film .results"); //salvo la posizione dove dovranno essere inseriti i film
            } else if (flagFS == 3) {
                var filmPosition = $("#hot-now .popular .results.now"); //salvo la posizione dove dovranno essere inseriti i film
            } else if (flagFS == 4){
                var filmPosition = $("#hot-now .voted .results.now"); //salvo la posizione dove dovranno essere inseriti i film
            }
            infoAndPosition.push(print,filmPosition); //Metto info e se film/serie su un array
        } else if(flagFS == 2) {
            var print = { //Oggetto per prendere variabili Handlebars
                boolPoster : poster, //Stampo poster
                boolTitle : actFilm.name, //recupero titolo
                boolOrTitle : actFilm.original_name, //Recupero titolo originale
                boolLang : lang, //Bandiera lingua
                boolVote : stampVote, //Voto in stelle
                boolOverview : overview //Trama serie
            }
            var seriePosition = $("#once-searched .series .results"); //salvo la posizione dove dovranno essere inserite le serie
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

    function getCast(data) { //Funzione per recuperare attori
        var credits = 'movie/ ' + data + '/credits' //Sezione dove recupero Crediti film
        $.ajax ({ //Chiamata AJAX per recuperare dati film
            'url' : standardUrl + credits, //Url per recuperare film
            'method' : 'GET', //Metodo GET
            'data' : { //Informazioni extra per accedere alla sezione
                'api_key' : 'a5c0e4852eb33c487e7bf7b17de279d2',
                'movie_id' : data,
                'language' : 'it-IT'
            },
            'success' : function(result) { //Caso funzionamento richiesta
                var actors = result.cast; //Prendo array risultati ricevuti da API
                if (actors.length == 0) {
                    actors = "Cast non disponibile"
                } else {
                    actors = actors.slice(0, 4); //Prendo i primi 5 risultati
                    var allActors = [];
                    var allCharacter = [];
                    for (var i = 0; i < actors.length; i++) {
                        if (actors[i].character.length > 0) {
                            console.log(actors[i].character);
                            allCharacter.push(actors[i].character);
                        }
                        if (actors[i].name.length > 0) {
                            console.log(actors[i].name);
                            allActors.push(actors[i].name);
                        }
                    }
                    console.log([allActors,allCharacter]);
                    return [allActors,allCharacter];
                }
            },
            'error' : function() { //Caso di errore di caricamento
                console.log("Errore");
            }
        });
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

    function setFlags(flagReq) { //Funzione che setta
        if (flagsAvaible.includes(flagReq)) {
            var retFlag = '<img src="flags/' + flagReq + '.png" alt="Bandiera ' + flagReq +'">';
        } else {
            var retFlag = flagReq;
        }
        return retFlag;
    }

    function filmOverview(verOver) { //funzione per Verificare se la trama è presente
        if (verOver.length == 0) { //Se la stringa è vuota..
            var overRet = "Trama non disponibile." //Stampo questo
        } else { //Altrimenti
            var overRet = verOver; //Prendo trama
        }

        return overRet; //Ritorno valore
    }

    function hideShow(x,y) {
        x.hide();
        y.show();
    }


});
