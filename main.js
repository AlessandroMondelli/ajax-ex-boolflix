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
    var changeLang = 'IT-it'; //Variabile globale per scelta lingua

    var pagValF = 1; //Pagina di default Film
    var pagValS = 1; //Pagina di default serie
    var flagRicOrPag = 0; //Flag per ricerca o pagina
    var oldResearch; //Salvo ricerca appena eseguita

    //Preparo template Handlebars
    var source = $("#boolflix-template").html();
    //Preparo template con funzione
    var template = Handlebars.compile(source);

    discoverFilms(mostPopular,flagPopular); //Cerco film più popolari del momento
    discoverFilms(mostVoted,flagVoted); //Cerco film più votati

    $(".button").click(function() { //Al click su bottone ricerca
        flagRicOrPag = 0; //Setto su nuova ricerca
        pagValF = 1 //Ricerco prima pagina del risultato Film
        pagValS = 1 //Ricerco prima pagina del risultato Serie
        apiActive(flagRicOrPag); //Richiamo funzione che attiva tutta la ricerca
    });

    $( ".search-menu input" ).keypress(function(event) { //Alla pressione di invio..
        if (event.which == 13) {
            flagRicOrPag = 0; //Setto su nuova ricerca
            pagValF = 1 //Ricerco prima pagina del risultato Film
            pagValS = 1 //Ricerco prima pagina del risultato Serie
            apiActive(flagRicOrPag); //Richiamo funzione che attiva tutta la ricerca
        }
    });

    $(".film-lang").mouseenter(function() { //Effetto hover su lingue
        $(".other-lang").slideDown("slow");
    });
    $(".film-lang").mouseleave(function() { //Effetto hover su lingue
        $(".other-lang").slideUp("slow");
    });

    $(".other-lang .lang img").click(function() {
        var lang = $(this).data('lang'); //Data che riconosce quale lingua è staa cliccata

        //Cambio bandiera
        var temp = $(".lang#first-lan").html(); //Prendo codice html della prima bandiera
        var outerThis = $(this).closest("li"); //Prendo codice html della bandiera cliccata
        $(".film-lang #first-lan img").remove(); //Rimuovo codice da prima bandiera
        $(".film-lang #first-lan").html($(this)); //Inserisco nova prima bandiera
        outerThis.html(temp); //Inserisco vecchia prima bandiera nella lista delle bandiere

        changeLang =  lang + "-" + lang.toUpperCase(); //Codice che permette di cambiare lingua
    });

    genSelGenres(); //Funzione che genera la lista di generi di film e serie
    $('.sel-film').change(function() { //Al cambio di genere elezionato dall'utente
        var sel = $(".sel-film").val(); //Prendo id del genere selezionato
        var fPos = $(".sec.film .results .genres"); //Posizione dove andrà a lavorare
        resetVoteFilter(); //Richiamo funzione che resetta filtro voti
        genFilter(sel,fPos); //Richiamo funzione che filtra i film
    });

    $('.sel-serie').change(function() { //Al cambio di genere elezionato dall'utente
        var sel = $(".sel-serie").val(); //Prendo id del genere selezionato
        var sPos = $(".sec.series .results .genres")
        resetVoteFilter(); //Richiamo funzione che resetta filtro voti
        genFilter(sel,sPos); //Richiamo funzione che filtra i film
    });

    selVoteGen(); //Richiamo funzione che genera select con voti
    $('.vot-film').change(function() { //Al cambio di genere elezionato dall'utente
        var votSel = $(".vot-film").val(); //Prendo id del genere selezionato
        var fVPos = $(".sec.film .results .card .vote"); //Posizione dove andrà a lavorare
        voteFilter(votSel,fVPos); //Richiamo funzione che filtra i film
    });

    $('.vot-serie').change(function() { //Al cambio di genere elezionato dall'utente
        var votSel = $(".vot-serie").val(); //Prendo id del genere selezionato
        var fVPos = $(".sec.series .results .card .vote"); //Posizione dove andrà a lavorare
        voteFilter(votSel,fVPos); //Richiamo funzione che filtra i film
    });

    $(document).on('click', '.n-pages.p-film .num-pag', function() { //Su click su numero pagina
        pagValF = parseInt($(this).text()); //Prendo numero della pagina selezionato
        flagRicOrPag = 1 //Flag per riconoscere che l'api viene richiesta per una nuova pagina e non per una nuova ricerca
        $("#once-searched .series .results .card").remove();
        newPage($(".n-pages.p-film span"),$(this),$("#once-searched .film .results .card")); //Richiamo funzione per mostrare nuova pagina risultati
        
        apiActive(flagRicOrPag); //Richiamo funzione che chiama API
    });

    $(document).on('click', '.n-pages.p-serie .num-pag', function() { //Su click su numero pagina
        pagValS = parseInt($(this).text()); //Prendo numero della pagina selezionato
        flagRicOrPag = 2 //Flag per riconoscere che l'api viene richiesta per una nuova pagina e non per una nuova ricerca
        $("#once-searched .film .results .card").remove();
        newPage($(".n-pages.p-serie span"),$(this),$("#once-searched .series .results .card")); //Richiamo funzione per mostrare nuova pagina risultati

        apiActive(flagRicOrPag); //Richiamo funzione che chiama API
    });

    $(document).on('click', '.card', function() { //Se viene cliccata una card
        if ($(this).siblings().hasClass("flip")) { //Se sono presenti cards già girate...
            $(this).siblings().removeClass("flip"); //Le rimetto al punto di partenta
            $(this).siblings().find(".info").removeClass("show"); //Rimuovo info
        }

        $(this).addClass("flip"); //Giro quello cliccato
        $(this).find(".info").addClass("show"); //Mostro info
    });




                        //*** FUNZIONI ***//
    function getSearch() { //Funzione che prende valore dell'input
        var hotNowPos = $("#hot-now"); //Posizione sezione hot now
        var searchedPos = $("#once-searched"); //Posizone sezione searched
        var ricerca = $(".search-menu input").val(); //Prendo stringa inserita dall'utente
        if (ricerca != "") {
            $(".results.search").empty(); //Elimino risultati precedenti
            hideShow(hotNowPos,searchedPos); //Cambio stato in base alla ricerca
        }
        $(".search-menu input").val(""); //Elimino testo dopo la ricerca
        return ricerca; //Ritorno il valore ricercato
    }

    function apiActive(flagRes) { //Funzione per trovare film tramite API
        if (flagRes == 0) { //Se viene fatta una nuova ricerca...
            var searchVal = getSearch(); //Prendo valore ricerca
            oldResearch = searchVal; // salvo ricerca
        } else { //Altrimenti..
            searchVal = oldResearch; //Salvo vecchia ricerca
        }

        if (searchVal != ""){ //Se la ricerca non è vuota...
            $.ajax ({ //Chiamata AJAX per recuperare dati film
                'url' : standardUrl + filmUrl, //Url per recuperare film
                'method' : 'GET', //Metodo GET
                'data' : { //Informazioni extra per accedere alla sezione
                    'api_key' : 'a5c0e4852eb33c487e7bf7b17de279d2',
                    'query' : searchVal,
                    'language' : changeLang,
                    'page' : pagValF
                },
                'success' : function(result) { //Caso funzionamento richiesta
                    var flagFilm = 1; //Flag che segnala che si stanno cercando dei film
                    var films = result.results; //Prendo array risultati ricevuti da API
                    var pages = result.total_pages; //Prendo nmero di pagine totali
                    if (films.length != 0) { //Se non è vuoto..
                        getDataFilms(films,flagFilm); //Funzione che prende tutti i dati necessari per le varie funzioni
                        if (flagRes == 0) { //Se è una nuova ricerca..
                            appendPagesNumbers(pages,flagFilm); //Funzione che genera numero di pagine diponibili
                        }
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
                    'language' : changeLang,
                    'page' : pagValS
                },
                'success' : function(result) { //Caso funzionamento richiesta
                    var flagFilm = 2; //Flag che segnala che si stanno cercando serie tv
                    var series = result.results;
                    var pagesSerie = result.total_pages; //Prendo nmero di pagine totali
                    if (series.length != 0) { //Se non è vuoto..
                        getDataFilms(series,flagFilm); //Appendo film/serie a html
                        if (flagRes == 0) { //Se è una nuova ricerca..
                            appendPagesNumbers(pagesSerie,flagFilm); //Funzione che genera numero di pagine diponibili
                        }
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
                'language' : changeLang
            },
            'success' : function(result) { //Caso funzionamento richiesta
                var hotNow = result.results; //Prendo array risultati ricevuti da API
                hotNow = hotNow.slice(0, 6); //Prendo i primi 7 risultati

                getDataFilms(hotNow,flag); //Appendo film/serie a html
            },
            'error' : function() { //Caso di errore di caricamento
                alert("Errore");
            }
        });
    }

    function getDataFilms(filmArr,flagF) { //Funzione che stampa film trovati
        for (var i = 0; i < filmArr.length; i++) { //Scorro tutti i film trovati con la ricerca
            var fPoster = getPoster(filmArr[i].poster_path); //Richiamo funzione per prendere poster
            var starsVote = forStars(filmArr[i].vote_average); //Richiamo funzione per trasformare voto in stelle
            var dataVote = voteTo5(filmArr[i].vote_average); //Prendo base5 del voto da mettere nel data-vote
            var langFlag = setFlags(filmArr[i].original_language); //Richiamo funione per ricevere bandiera
            var fOverview = filmOverview(filmArr[i].overview); //Funzione che verifica se è presente l'overview
            var printAndPos = objTemplate(fPoster,filmArr[i],starsVote,flagF,langFlag,fOverview,filmArr[i].id,filmArr[i].genre_ids,dataVote); //Chiamo funzione per scrivere template film
            printHtml(printAndPos[0],printAndPos[1]); //richiamo funzione per appendere film nell'html
            getCast(filmArr[i].id,flagF); //Funzione che permette di stampare il cast
            getGen(filmArr[i].genre_ids,filmArr[i].id,flagF) //Funzione che permette di stampare il genere
        }
    }

    function objTemplate(poster,actFilm,stampVote,flagFS,lang,overview,idData,idGen,dataVotePrint) { //Funzione che prepara template film
        var infoAndPosition = []; //Array che conterrà tutte le info di un film/serie e distigue se è un film o una serie
        if (flagFS != 2) {
            var print = { //Oggetto per prendere variabili Handlebars
                boolPoster :  poster, //Stampo poster
                boolTitle : actFilm.title, //recupero titolo
                boolOrTitle : actFilm.original_title, //Recupero titolo originale
                boolLang : lang, //Bandiera lingua
                boolDataGen : idGen, //Id genere
                boolDataVote : dataVotePrint, //Data vote
                boolVote : stampVote, //Voto in stelle
                boolDataFilm : idData, //Data Film
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
                boolDataGen : idGen, //Id genere
                boolDataVote : dataVotePrint, //Data vote
                boolVote : stampVote, //Voto in stelle
                boolDataFilm : idData, //Data Film
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
        var finalPoster = '<img src="' + posterUrl + poster + '">'; //Risultato se il poster è presente
        var notAvaible = '<img src="' + posterNotAvaible + '">'; //Risultato se il poster non è presente
        if (!finalPoster.includes("null")) { //Se la ricerca non riporta null..
            return finalPoster;
        } else { //Se la ricerca riporta null..
            return notAvaible;
        }
    }

    function getCast(data,flag) { //Funzione per recuperare attori
        var creditsFilm = 'movie/ ' + data + '/credits' //Sezione dove recupero Crediti film
        var creditsSerie = 'tv/' + data + '/credits' //Sezione dove recupero Crediti serie

        if (flag != 2) { //Se non è una serie..
            var credits = creditsFilm; //Completo url con crediti film
        } else { //Altrimenti..
            var credits = creditsSerie; //Completo url con crediti serie
        }

        $.ajax ({ //Chiamata AJAX per recuperare dati film
            'url' : standardUrl + credits, //Url per recuperare film
            'method' : 'GET', //Metodo GET
            'data' : { //Informazioni extra per accedere alla sezione
                'api_key' : 'a5c0e4852eb33c487e7bf7b17de279d2',
                'language' : changeLang
            },
            'success' : function(result) { //Caso funzionamento richiesta
                var actors = result.cast; //Prendo array risultati ricevuti da API
                var allActors = []; //Preparo array dove inserire gli attori

                if (actors.length == 0) { //Se non ci sono attori salvati nell'API
                    var printActors = "Cast non disponibile"; //Stampo messaggio
                } else { //Altrimenti...
                    actors = actors.slice(0, 4); //Prendo i primi 5 risultati
                    for (var i = 0; i < actors.length; i++) { //Scorro l'array
                        if (actors[i].name.length > 0) { //Se il nome dell'attore c'è
                            allActors.push(actors[i].name); //Inserisco nell'array
                            var printActors = allActors.join(", "); //Trasformo in una stringa
                        }
                    }
                }
                appendElements($(".actors[data-film = '" + data + "']"),printActors); //Richiamo funzione per appendere elementi
            },
            'error' : function() { //Caso di errore di caricamento
                console.log("Errore");
                var printActors = "Cast non disponibile";
                appendElements($(".actors[data-film = '" + data + "']"),printActors); //Stampo messaggio
            }
        });
    }

    function getGen(data,filmId,flag) {
        genreFilm = "genre/movie/list";
        genreSerie = "genre/tv/list";

        if (flag != 2) { //Se non è una serie..
            var genreType = genreFilm; //Completo url con crediti film
        } else { //Altrimenti..
            var genreType = genreSerie; //Completo url con crediti serie
        }

        $.ajax ({ //Chiamata AJAX per recuperare dati film
            'url' : standardUrl + genreType, //Url per recuperare film
            'method' : 'GET', //Metodo GET
            'data' : { //Informazioni extra per accedere alla sezione
                'api_key' : 'a5c0e4852eb33c487e7bf7b17de279d2',
                'language' : 'it-IT'
            },
            'success' : function(result) { //Caso funzionamento richiesta
                var genres = result.genres; //Prendo array risultati ricevuti da API

                appendGenres(genres,data,filmId); //Richiamo funzione per appendere generi
            },
            'error' : function() { //Caso di errore di caricamento
                console.log("Errore");
                var printGen = "Genere non disponibile";
                appendElements($(".genres[data-film= '" + filmId + "']"),printGen) //Richiamo funzione per appendere elementi
            }
        });
    }

    function appendGenres(allGenres,dataF,id) {
        var genArray = [] //Array per unire generi del singolo film o serie

        for (var i = 0; i < allGenres.length; i++) { //Scorro tutti i generi
            if (dataF.includes(allGenres[i].id)) { //Se gli id corrispondono
                genArray.push(allGenres[i].name); //Inserisco genere nell'array
                var printGen = genArray.join(", "); //Trasformo in una stringa
            }
        }

        if (genArray.length == 0) { //Se l'array è vuoto
            var printGen = "Genere non disponibile"; //Stampo messaggio
        }

        appendElements($(".genres[data-film= '" + id + "']"),printGen) //Richiamo funzione per appendere elementi
    }

    function genSelGenres() { //Funzione che stampa tutte le opzioni di generi
        genreFilm = "genre/movie/list";
        genreSerie = "genre/tv/list";

        $.ajax ({ //Chiamata AJAX per recuperare dati generi film
            'url' : standardUrl + genreFilm, //Url per recuperare film
            'method' : 'GET', //Metodo GET
            'data' : { //Informazioni extra per accedere alla sezione
                'api_key' : 'a5c0e4852eb33c487e7bf7b17de279d2',
                'language' : 'it-IT'
            },
            'success' : function(result) { //Caso funzionamento richiesta
                var genres = result.genres; //Prendo array risultati ricevuti da API

                for (var j = 0; j < genres.length; j++) { //Scsorro risultati
                    var option = "<option value=" + genres[j].id + ">" + genres[j].name + "</option>"; //Creo codice html opzioni generi film

                    appendElements($("#once-searched .sel-film"),option); //appendo generi
                }
            },
            'error' : function() { //Caso di errore di caricamento
                console.log("Errore");
            }
        });

        $.ajax ({ //Chiamata AJAX per recuperare dati generi serie
            'url' : standardUrl + genreSerie, //Url per recuperare film
            'method' : 'GET', //Metodo GET
            'data' : { //Informazioni extra per accedere alla sezione
                'api_key' : 'a5c0e4852eb33c487e7bf7b17de279d2',
                'language' : changeLang
            },
            'success' : function(result) { //Caso funzionamento richiesta
                var genres = result.genres; //Prendo array risultati ricevuti da API

                for (var j = 0; j < genres.length; j++) {
                    var option = "<option value=" + genres[j].id + ">" + genres[j].name + "</option>"; //Creo codice html opzioni generi serie tv

                    appendElements($("#once-searched .sel-serie"),option); //Appendo generi
                }
            },
            'error' : function() { //Caso di errore di caricamento
                console.log("Errore");
            }
        });
    }

    function genFilter(genSel,pos) { //Funzione che filtra i film in base al genere
        pos.each(function() { //Scorro tutti i generi di ogni card
            var dataGenFilm = $(this).data('gen'); //Id genere del film
            var cardVal = $(this).closest(".card"); //Valore intera carda da nascondere o mostrare
            if (dataGenFilm.length > 1) { //Se ci sono più generi in una singola card
                dataGenFilm = dataGenFilm.split(","); //Elimino virgole tra gli id
                if (dataGenFilm.includes(genSel)) { //Se almeno un genere corrisponde..
                    addRemoveClass(cardVal,"active","no_active");
                } else if (genSel == "sel") { //Se si clicca su seleziona genere..
                    addRemoveClass(cardVal,"active","no_active");
                } else { //Se non corrispondono..
                    addRemoveClass(cardVal,"no_active","active");
                }
            } else { //Se ha un solo genere..
                if (dataGenFilm == genSel) { //Se corrisponde
                    addRemoveClass(cardVal,"active","no_active");
                } else if (genSel == "sel") { //Se si clicca su seleziona genere..
                    addRemoveClass(cardVal,"active","no_active");
                } else { //Se non corrispondono..
                    addRemoveClass(cardVal,"no_active","active");
                }
            }
        });
    }

    function voteTo5(voteTransf) { //Funzione che restituisce il voto base 5
        var vote5; //Voto in base 5
        vote5 = Math.ceil((voteTransf / 2)); //Arrontondo voto in base 5
        return vote5; //Ritorno voto in base 5
    }

    function forStars(vote) { //Funzione che permette di immettere in una variabile un tot di stelle piene e vuote
        var full = voteTo5(vote); //Richiamo funzione che traforma voto in base 5
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

    function selVoteGen() { //Genro select con voti
        for (var i = 0; i <= 5; i++) {
            var genCode = '<option value="' + i + '">' + i + '</option>';
            $('.sel-vot').append(genCode);
        }
    }

    function voteFilter(vote,pos) { //Funzione che filtra voti
        pos.each(function() { //Per ogni card..
            var dataVoteFilm = $(this).data('vote'); //Id voto del film
            var cardVal = $(this).closest(".card"); //Valore intera carda da nascondere o mostrare
            if ((cardVal.hasClass('active') || (cardVal.is(":visible")))) { //Se la card è attiva
                if (dataVoteFilm == vote) { //Se i voti corrispondono..
                    addRemoveClass(cardVal,"active_vote","no_active_vote"); //Richiama funzione che permette di aggiungere/rimuovere classe active
                } else if (vote == 'sel') { //Se viene selezionato "Seleziona voto"..
                    cardVal.removeClass("active_vote").removeClass("no_active_vote"); //Mostra tutti i risultati visibili prima
                } else { //Se i voti non corrispondono..
                    addRemoveClass(cardVal,"no_active_vote","active_vote"); //Richiama funzione che permette di aggiungere/rimuovere classe active
                }
            }
        })
    }

    function resetVoteFilter() { //Funzione che resetta filtro voti
        $('.vot-film, .vot-serie').prop('selectedIndex',0); //Risetto voto a "sel"
        $('.card').removeClass('active_vote').removeClass('no_active_vote'); //Rimuovo Filtro voti
    }

    function setFlags(flagReq) { //Funzione che setta le bandiere
        if (flagsAvaible.includes(flagReq)) { //Se la bandiera richiesta è presente nell'array delle bandiere disponibili
            var retFlag = '<img src="flags/' + flagReq + '.png" alt="Bandiera ' + flagReq +'">'; //Aggiungi immagine bandiera
        } else {
            var retFlag = flagReq; //Altrimenti scrivi linguas
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

    function appendPagesNumbers(nPages,flagSOrF) { //Funzione che genera numero pagine
        var numGen; //Variabile che conterrà il codice html da appedere
        var pos; //Posizione dove andranno messe le pagine
        var pos1;

        if (flagSOrF == 1) { //Se un film..
            pos = $(".n-pages.p-film span");
            pos1 = $(".n-pages.p-film");
        } else { //Se una serie
            pos = $(".n-pages.p-serie span");
            pos1 = $(".n-pages.p-serie");
        }

        pos.remove(); //Rimuovo vecchie pagine se presenti

        if (nPages > 15) { //Se le pagine sono più di 15
            nPages = 15; //Setto le pagine a 15
        }

        for (var i = 0; i < nPages; i++) { //For che crea ogni quadrato con numero pagina
            numGen = "<span class=\"num-pag\">" + (i + 1) + "</span>"; //Assegno numero
            pos1.append(numGen); //Appendo contenuto
        }
    }

    function newPage(redSign,newSign,elim) { //Funzione che nasconde vecchia pagina e mostra nuova
        redSign.removeClass("active"); //Rimuovo colore numero pagina
        newSign.addClass("active"); //Aggiungo colore pagina
        elim.remove(); //Rimuovo card presenti
    }

    function hideShow(x,y) { //Funzione che mostra/nasconde
        x.hide();
        y.show();
    }

    function addRemoveClass(x,selClass,selClass2) { //Funzione che aggiunge rimuove classe
        x.addClass(selClass).removeClass(selClass2);
    }

    function appendElements(position,el) { //Funzione che appende elementi
        position.append(el);
    }
});
