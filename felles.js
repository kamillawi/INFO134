/* ----------------------- JSON DATASET ----------------------- */

var befolkning = "http://wildboy.uib.no/~tpe056/folk/104857.json";
var sysselsetting = "http://wildboy.uib.no/~tpe056/folk/100145.json";
var utdanning = "http://wildboy.uib.no/~tpe056/folk/85432.json";

/* ----------------------- AJAX Request ----------------------- */

function hent(url, obj, callback) {
    var request = new XMLHttpRequest();
    request.open("GET", url);
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
            obj.data = JSON.parse(request.responseText);
            if (callback) {
                callback(obj);
            }
        }
    };
    request.send();
}

/* ------------- DATASET CONSTRUCTOR WITH METHODS ------------- */

function Datasett(url, callback) {
    this.url = url;
    this.onload = callback || null;
    this.load = function () {
        if (this.url == undefined) {
            
            throw "url mangler";
        }
        hent(this.url, this, this.onload);
    };
    this.getNames = function () {
        return kommuneNavn(this.data);
    };
    this.getIDs = function () {
        return kommuneNummer(this.data);
    };
    this.getInfo = function (nummer) {
        return kommuneInfo(nummer, this.data);
    };
}

/* ------- FUNCTIONS HOLDING INFORMATION ABOUT KOMMUNER ------- */

function kommuneNavn(data) {
    var navneListe = [];
    for (var navn in data.elementer) {
        navneListe.push(navn);
    }
    return navneListe;
}

function kommuneNummer(data) {
    var nummerListe = [];
    for (var nummer in data.elementer) {
        nummerListe.push(data.elementer[nummer].kommunenummer);
    }
    return nummerListe;
}

function kommuneInfo(nummer, obj) {
    for (var n in obj.elementer) {
        if (nummer == obj.elementer[n].kommunenummer) {
            return obj.elementer[n];
        }
    }
}

/* --------- DATASET OBJECTS AND LOADING THE DATASETS --------- */

/* -- The buttons are intially disabled-- */

window.onload = function () {
    disabledButtons(true);
};

/* -- When the window has loaded the buttons will only work after the datasets are loaded -- */

var bef = new Datasett(befolkning, function (y) {
    disabledButtons(false);
});
var sys = new Datasett(sysselsetting, function (y) {
    disabledButtons(false);
});
var utd = new Datasett(utdanning, function (y) {
    disabledButtons(false);
});

bef.load();
sys.load();
utd.load();


/* --------- BUTTON FUNCTIONS AND SHOW/HIDE FUNCTIONS --------- */

function disabledButtons(bool) {
    var buttons = document.getElementsByTagName("button");
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].disabled = bool;
    }
}

function enterToSearch(inputfelt, searchKnapp) {
    var input = document.getElementById(inputfelt);
    input.addEventListener("keyup", function (event) {
        if (event.keyCode === 13) {
            document.getElementById(searchKnapp).click();
        }
    });
}

enterToSearch("detaljer_input", "detaljer_search_button");
enterToSearch("sammenlikning_input_1", "sammenlikning_search_button");
enterToSearch("sammenlikning_input_2", "sammenlikning_search_button");

var nav = document.getElementById('navigasjon');
var btn = document.getElementsByClassName('btn_nav');
for (var i = 0; i < btn.length; i++) {
    btn[i].addEventListener('click', function () {
        var current = document.getElementsByClassName("aktiv");
        current[0].className = current[0].className.replace(" aktiv", "");
        this.className += " aktiv";
    });
}

function visHovedInnhold(index) {
    var introInnhold = document.getElementById("introduksjon");
    var oversiktInnhold = document.getElementById("oversikt");
    var detaljerInnhold = document.getElementById("detaljer");
    var sammenlikningInnhold = document.getElementById("sammenlikning");
    var innholdsliste = [
        introInnhold,
        oversiktInnhold,
        detaljerInnhold,
        sammenlikningInnhold
    ];

    for (var i = 0; i < innholdsliste.length; i++) {
        innholdsliste[i].className = "hidden";
    }
    innholdsliste[index].className = "visible";
}

function visSearchInnhold(me) {
    document.getElementById(me).className = "visible";
}


/* --------------------- HELP FUNCTIONS ---------------------- */

/* -- Checks if search input number is valid -- */

function sjekkInput(arg) {
    var knummer = document.getElementById(arg).value;
    if (knummer === "") {
        return false;
    }
    var numListe = bef.getIDs();
    var utdListe = utd.getIDs();
    var match = 0;

    if (knummer != "") {
        for (var n in numListe) {
            if (knummer == numListe[n]) {
                match = 1;
                return knummer;
            }
        }
        for (var t in utdListe) {
            if (knummer == utdListe[t]) {
                match = 1;
                return knummer;
            }
        }
        if (match === 0) {
            return false;
        }
    }
}

/* -- Returns name based on kommune number -- */

function matchKommune(knummer, data) {
    for (var navn in data.elementer) {
        if (knummer == data.elementer[navn].kommunenummer) {
            return navn;
        }
    }
}

/* -- Returns number based on kommune name -- */

function matchNummer(navn, data) {
    for (var knavn in data.elementer) {
        if (navn == knavn) {
            return data.elementer[navn].kommunenummer;
        }
    }
}

/* -- Calculations for total population -- */

function totalBefolkning(kommuneinfo) {
    return kommuneinfo.Menn[2018] + kommuneinfo.Kvinner[2018];
}

function totalProsentBefolkning(kommuneinfo) {
    return (
        ((kommuneinfo.Menn[2018] +
            kommuneinfo.Kvinner[2018] -
            (kommuneinfo.Menn[2017] + kommuneinfo.Kvinner[2017])) /
            (kommuneinfo.Menn[2017] + kommuneinfo.Kvinner[2017])) *
        100
    ).toFixed(2);
}


/* -------------------- OVERVIEW (OVERSIKT) -------------------- */
/* -- Shows an overview of poplation data for all kommuner -- */

function oversikt() {
    var navnListe = bef.getNames();
    var numListe = bef.getIDs();
    var komInfo = [];
    for (var num in numListe) {
        komInfo.push(totalBefolkning(bef.getInfo(numListe[num])));
    }

    var komProsent = [];
    for (var prosent in numListe) {
        komProsent.push(totalProsentBefolkning(bef.getInfo(numListe[prosent])));
    }

    /* -- Removes content in the table before new content is generated -- */

    var innholdplass = document.getElementById("oversikt_table_body");
    while (innholdplass.firstChild) {
        innholdplass.removeChild(innholdplass.firstChild);
    }

    /* -- Creates the table with content for overview -- */

    var table = document.getElementById("oversikt_table_body");

    for (var i = 0; i < navnListe.length; i++) {
        var row = table.insertRow(-1);
        var navnCell = row.insertCell(0);
        var nummerCell = row.insertCell(1);
        var befCell = row.insertCell(2);
        var prosentCell = row.insertCell(3);
        navnCell.innerHTML = navnListe[i];
        nummerCell.innerHTML = numListe[i];
        befCell.innerHTML = komInfo[i];
        prosentCell.innerHTML = `${komProsent[i]} %`;
    }
}


/* -------------------- DETAILS (DETALJER) -------------------- */
/* -- Gets details from all the datasets and displays detailed information for one kommune -- */

function detaljer() {

    /* -- Checks kommune number and shows error message if invalid -- */

    var komNummer = sjekkInput("detaljer_input");
    if (komNummer === false) {
        alert("Skriv in et gyldig kommunenummer");
        document.getElementById("details_input").value = "";
        return;
    }

    /* -- Gets information based on kommune number -- */

    /* If the kommune number does not exist in population or employment datasets, 
    it only exists in the education dataset, and it is an old kommune number used until 2017. */

    if (bef.getInfo(komNummer)) {
        var komNavn = matchKommune(komNummer, bef.data);
        var befolkMenn = bef.getInfo(komNummer).Menn[2018];
        var befolkKvinner = bef.getInfo(komNummer).Kvinner[2018];
        var totalBefolk = totalBefolkning(bef.getInfo(komNummer));

    } else {
        /* Gets some information from the name of the kommune, but gets population from the year 2017. */
        var komNavn = matchKommune(komNummer, utd.data);
        var befKomNavn = komNavn.substring(0, komNavn.length - 8);
        var befKomNummer2018 = matchNummer(befKomNavn, bef.data);
        var befolkMenn = bef.getInfo(befKomNummer2018).Menn[2017];
        var befolkKvinner = bef.getInfo(befKomNummer2018).Kvinner[2017];
        var totalBefolk = totalBefolkning(bef.getInfo(befKomNummer2018));
    }

    /* -- Unhides HTML elements which were hidden -- */

    visSearchInnhold("detaljer_body");

    /* ---- Employment data (Sysselsetting) calculations ---- */

    /* Sysselsetting Percent */
    if (sys.getInfo(komNummer)) {
        var sysMennProsent = sys.getInfo(komNummer).Menn[2018];
        var sysKvinnerProsent = sys.getInfo(komNummer).Kvinner[2018];
        var sysTotal = sys.getInfo(komNummer)["Begge kjønn"][2018];
    } else {
        var sysMennProsent = sys.getInfo(befKomNummer2018).Menn[2017];
        var sysKvinnerProsent = sys.getInfo(befKomNummer2018).Kvinner[2017];
        var sysTotal = sys.getInfo(befKomNummer2018)["Begge kjønn"][2017];
    }

    /* Sysselsetting Share (Andel) */
    var sysAndelavMenn = (befolkMenn * (sysMennProsent / 100)).toFixed(0);
    var sysAndelavKvinner = (befolkKvinner * (sysKvinnerProsent / 100)).toFixed(0);
    var sysAndelavTotal = (totalBefolk * (sysTotal / 100)).toFixed(0);

    /* ---- Education data (Utdanning) calculations ---- */

    /* Men Percent */
    var menn = parseFloat(utd.getInfo(komNummer)["03a"].Menn[2017]) + parseFloat(utd.getInfo(komNummer)["04a"].Menn[2017]);
    var mennHøyere = menn.toFixed(1); // Men in % with higher education

    /* Women Percent */
    var kvinner = parseFloat(utd.getInfo(komNummer)["03a"].Kvinner[2017]) + parseFloat(utd.getInfo(komNummer)["04a"].Kvinner[2017]);
    var kvinnerHøyere = kvinner.toFixed(1); // Women in % with higher education

    /* Men and women number */
    if (bef.getInfo(komNummer)) {
        var antallMenn = (mennHøyere / 100) * bef.getInfo(komNummer).Menn[2017];
        var antallKvinner = (kvinnerHøyere / 100) * bef.getInfo(komNummer).Kvinner[2017];
    } else {
        var antallMenn = (mennHøyere / 100) * bef.getInfo(befKomNummer2018).Menn[2017];
        var antallKvinner = (kvinnerHøyere / 100) * bef.getInfo(befKomNummer2018).Kvinner[2017];
    }

    /* Total number */
    var total_m_høyere = antallMenn + antallKvinner;

    /* Total Percent */
    var totalt_høyere = (total_m_høyere / totalBefolk);


    /* -- Removes content in the table before new content is generated -- */

    var innholdplass = document.getElementById("sys_table_body");
    while (innholdplass.hasChildNodes()) {
        innholdplass.removeChild(innholdplass.childNodes[0]);
    }

    var innholdplass1 = document.getElementById("utd_table_body");
    while (innholdplass1.hasChildNodes()) {
        innholdplass1.removeChild(innholdplass1.childNodes[0]);
    }

    var innholdplass2 = document.getElementById("detaljer_overskrift");
    while (innholdplass2.hasChildNodes()) {
        innholdplass2.removeChild(innholdplass2.childNodes[0]);
    }

    var innholdplass3 = document.getElementById("historisk_table_body");
    while (innholdplass3.hasChildNodes()) {
        innholdplass3.removeChild(innholdplass3.childNodes[0]);
    }

    /* ---- HEADING SECTION WITH HEADERS, NAME AND NUMBER ---- */

    document.getElementById("detaljer_overskrift").innerHTML = `Detaljer om ${komNavn}`;
    document.getElementById("detaljer_info").innerHTML = `Kommune: ${komNavn} <br> Kommunenummer: ${komNummer} <br> Befolkningstall (pr 2018): ${totalBefolk}`;
    document.getElementById("sys_overskrift").innerHTML = `Siste målte statistikk for sysselsetting i ${komNavn} kommune`;

    /* --- DYNAMIC TABLE FOR EMPLOYMENT (SYSSELSETTING) ---- */
    var sheading = document.getElementById("sys_table_year");
    if (bef.getInfo(komNummer)) {
        sheading.innerHTML = 2018;
    }
    if (bef.getInfo(komNummer) == undefined) {
        sheading.innerHTML = 2017;

        /* Note which informs the user that the statistics for employment for this kommune can be found under the new kommune number for 2018 */
        var sysVarsel2017 = document.createElement("p");
        document.getElementById("detaljer_info").appendChild(sysVarsel2017);
        sysVarsel2017.innerHTML = `<em> Statistikk for sysselsetting tilknyttet denne kommunen kan hentes via nytt kommunenummer anno 2018. </em>`;
    }

    var stable = document.getElementById("sys_table_body");

    /* Statistics for Men Employed (Sysselsatt) */
    var srow = stable.insertRow(-1);
    var sMennCell = srow.insertCell(0);
    var sysMennAndel = srow.insertCell(1);
    var sysProsentMenn = srow.insertCell(2);
    sMennCell.innerHTML = "<strong>Sysselsatte menn:</strong>";
    sysMennAndel.innerHTML = sysAndelavMenn;
    sysProsentMenn.innerHTML = `${sysMennProsent} %`;

    /* Statistics for Women Employed (Sysselsatt) */
    var srow2 = stable.insertRow(-1);
    var sKvinnerCell = srow2.insertCell(0);
    var sysKvinnerAndel = srow2.insertCell(1);
    var sysProsentKvinner = srow2.insertCell(2);
    sKvinnerCell.innerHTML = "<strong>Sysselsatte kvinner:</strong>";
    sysKvinnerAndel.innerHTML = sysAndelavKvinner;
    sysProsentKvinner.innerHTML = `${sysKvinnerProsent} %`;

    /* Statistics for Total Employed (Sysselsatt) */
    var srow3 = stable.insertRow(-1);
    var sTotalCell = srow3.insertCell(0);
    var sysTotalAndel = srow3.insertCell(1);
    var sysProsentTotal = srow3.insertCell(2);
    sTotalCell.innerHTML = "<strong>Total sysselsatte:</strong>";
    sysTotalAndel.innerHTML = sysAndelavTotal;
    sysProsentTotal.innerHTML = `${sysTotal} %`;

    /* ---- DYNAMIC TABLE FOR EDUCATION (UTDANNING) ---- */

    document.getElementById("utd_overskrift").innerHTML = `Siste målte statistikk for utdanning i ${komNavn} kommune`;

    var utable = document.getElementById("utd_table_body");

    /* Statistics for Men Education (Utdanning) */
    var urow = utable.insertRow(-1);
    var uMennCell = urow.insertCell(0);
    var utdMennAndel = urow.insertCell(1);
    var utdProsentMenn = urow.insertCell(2);
    uMennCell.innerHTML = `<strong>Menn med høyere utdanning:</strong>`;
    utdMennAndel.innerHTML = `${antallMenn.toFixed(0)}`;
    utdProsentMenn.innerHTML = `${mennHøyere} %`;

    /* Statistics for Women Education (Utdanning) */
    var urow2 = utable.insertRow(-1);
    var uKvinnerCell = urow2.insertCell(0);
    var utdKvinnerAndel = urow2.insertCell(1);
    var utdProsentKvinner = urow2.insertCell(2);
    uKvinnerCell.innerHTML = `<strong>Kvinner med høyere utdanning:</strong>`;
    utdKvinnerAndel.innerHTML = `${antallKvinner.toFixed(0)}`;
    utdProsentKvinner.innerHTML = `${kvinnerHøyere} %`;

    /* Statistics for Total Education (Utdanning) */
    var urow3 = utable.insertRow(-1);
    var uTotalCell = urow3.insertCell(0);
    var utdTotalAndel = urow3.insertCell(1);
    var utdProsentTotal = urow3.insertCell(2);
    uTotalCell.innerHTML = `<strong>Total befolkning med høyere utdanning:</strong>`;
    utdTotalAndel.innerHTML = `${total_m_høyere.toFixed(0)}`;
    utdProsentTotal.innerHTML = `${(totalt_høyere * 100).toFixed(1)} %`;

    /* ---- Calling the function which generates historical data table ---- */

    if (bef.getInfo(komNummer)) {
        historiskeData(komNummer);
    } else {
        historiskeData(befKomNummer2018, komNummer);
    }
}


/* ---------------- HISTORICAL DEVELOPMENT DATA ---------------- */

/* -- Help function to calculate growth per year in population (befolkning), 
employment (sysselsetting) and education (utdanning) -- */

function utregning(infoListe) {
    beregnetListe = [];
    for (var i = 0; i < infoListe.length; i++) {
        if (i === 0) {
            beregnetListe.push("0");
        } else if (infoListe[i] === "NaN") {
            beregnetListe.push(" ");
        } else {
            beregnetListe.push(infoListe[i] - infoListe[i - 1]);
        }
    }
    return beregnetListe;
}

/* -- Function which generates historical data -- */

function historiskeData(kommunenummer, utdKomNummer2017) {
    /* We have chosen to only display the historical data for higher education (level 03a + 04a).
    We thought that this was the most interesting data to look at (for the user) 
    and it is what makes the biggest impact on the educated population. 
    This to make the website more consistent and the data more presentable */

    /* Year list */
    var årListBef = [];
    for (var e in bef.getInfo(kommunenummer).Menn) {
        if (e > "2006") {
            årListBef.push(e);
        }
    }
    if (utdKomNummer2017) {
        var årList2017 = årListBef.slice(0, -1);
    }

    /* Population numbers list */
    var tall_bef = [];
    for (var e in årListBef) {
        tall_bef.push(
            bef.getInfo(kommunenummer).Kvinner[årListBef[e]] +
            bef.getInfo(kommunenummer).Menn[årListBef[e]]
        );
    }

    /* Higher education and employment lists */
    var høyere_liste = [];
    var sys_liste = [];

    /* Loop which generates table */

    if (utdKomNummer2017) {
        historiskDataLoop(årList2017, kommunenummer, utdKomNummer2017)
    } else {
        historiskDataLoop(årListBef, kommunenummer)
    }

    function historiskDataLoop(årListe, knummer, utdKnummer2017) {
        komNummer = knummer;
        if (utdKnummer2017) {
            komNummer = utdKnummer2017;
        }
        for (var år in årListe) {
            var menn_03 = parseFloat(utd.getInfo(komNummer)["03a"].Menn[årListe[år]]);
            var menn_04 = parseFloat(utd.getInfo(komNummer)["04a"].Menn[årListe[år]]);

            menn_m_høyere = menn_03 + menn_04;

            var kvinner_03 = parseFloat(utd.getInfo(komNummer)["03a"].Kvinner[årListe[år]]);
            var kvinner_04 = parseFloat(utd.getInfo(komNummer)["04a"].Kvinner[årListe[år]]);

            kvinner_m_høyere = kvinner_03 + kvinner_04;

            var antall_menn =
                (menn_m_høyere / 100) * bef.getInfo(knummer).Menn[årListe[år]];

            var antall_kvinner =
                (kvinner_m_høyere / 100) * bef.getInfo(knummer).Kvinner[årListe[år]];

            var total_m_høyere = antall_menn + antall_kvinner;
            høyere_liste.push(total_m_høyere.toFixed(0));

            var table = document.getElementById("historisk_table_body");

            var bef_vekst =
                bef.getInfo(knummer).Kvinner[årListe[år]] +
                bef.getInfo(knummer).Menn[årListe[år]];
            var sys_vekst =
                (sys.getInfo(knummer)["Begge kjønn"][årListe[år]] / 100) * bef_vekst;
            sys_liste.push(sys_vekst.toFixed(0));

            var row = table.insertRow(-1);
            var år_cell = row.insertCell(0);
            var bef_cell = row.insertCell(1);
            var sys_cell = row.insertCell(2);
            var utd_cell = row.insertCell(3);

            vekst_utd = [];
            if (antall_menn || antall_kvinner == NaN) {
                antall_menn && antall_kvinner == " ";
                vekst_utd.push((antall_menn + antall_kvinner).toFixed(0));
            }

            år_cell.innerHTML = `${årListe[år]}`;
            bef_cell.innerHTML = `${tall_bef[år]} (${utregning(tall_bef)[år]})`;
            sys_cell.innerHTML = `${sys_vekst.toFixed(0)} (${utregning(sys_liste)[år]})`;
            utd_cell.innerHTML = `${vekst_utd} (${utregning(høyere_liste)[år]})`;
        }
    }
}


/* ---------------- COMPARISON (SAMMENLIGNING) ---------------- */
/* -- Compares education information of two kommuner based on a search of two kommune numbers -- */

function sammenlikning() {

    /* -- Checks kommune numbers and shows error message if one or both are invalid -- */

    var komNummer_1 = sjekkInput("sammenlikning_input_1");
    var komNummer_2 = sjekkInput("sammenlikning_input_2");

    if (komNummer_1 === false && komNummer_2 === false) {
        alert("Kommunenumre var ugyldig. Skriv in gyldige kommunenumre.");
        document.getElementById("sammenlikning_input_1").value = "";
        document.getElementById("sammenlikning_input_2").value = "";
        return;
    }
    if (komNummer_1 === false) {
        alert(
            "Første kommunenummer var ugyldig. Skriv in et gyldig kommunenummer."
        );
        document.getElementById("sammenlikning_input_1").value = "";
        return;
    }
    if (komNummer_2 === false) {
        alert("Andre kommunenummer var ugyldig. Skriv in et gyldig kommunenummer.");
        document.getElementById("sammenlikning_input_2").value = "";
        return;
    }
    if (komNummer_1 == komNummer_2) {
        alert("Velg to ulike kommunenumre.");
        document.getElementById("sammenlikning_input_2").value = "";
        return;
    }

    /* -- Gets information based on kommune number -- */

    var alt_1 = utd.getInfo(komNummer_1);
    var alt_2 = utd.getInfo(komNummer_2);

    utdanningsnivå = ["01", "11", "02a", "03a", "04a"]

    kommunenavn1 = matchKommune(komNummer_1, utd.data);
    kommunenavn2 = matchKommune(komNummer_2, utd.data);

    menn1_liste = [];
    menn2_liste = [];
    kvinner1_liste = [];
    kvinner2_liste = [];

    /* -- Unhides HTML elements which were hidden -- */

    visSearchInnhold("sammenlikning_body");

    /* -- Generates info header -- */

    document.getElementById(
        "info_sammenlikning"
    ).innerHTML = `Befolkningens utdanningsnivå pr 2017 i ${kommunenavn1} og ${kommunenavn2}`;

    /* --- Removes content in the table before new content is generated --- */

    var innholdplass = document.getElementById("sammenlikning_table_menn_body");
    while (innholdplass.firstChild) {
        innholdplass.removeChild(innholdplass.firstChild);
    }

    var innholdplass1 = document.getElementById("sammenlikning_table_kvinner_body");
    while (innholdplass1.firstChild) {
        innholdplass1.removeChild(innholdplass1.firstChild);
    }

    /* ---- MEN TABLE ---- */

    document.getElementById(
        "kom1_menn_header"
    ).textContent = `${kommunenavn1} - ${komNummer_1}`;
    document.getElementById(
        "kom2_menn_header"
    ).textContent = `${kommunenavn2} - ${komNummer_2}`;

    for (var element in utdanningsnivå) {
        var table = document.getElementById("sammenlikning_table_menn_body");

        var menn1 = alt_1[utdanningsnivå[element]].Menn[2017];
        var menn2 = alt_2[utdanningsnivå[element]].Menn[2017];

        var menn1_float = parseFloat(menn1);
        var menn2_float = parseFloat(menn2);

        var row = table.insertRow(-1);
        var nivå_cell = row.insertCell(0);
        var menn1_cell = row.insertCell(1);
        var menn2_cell = row.insertCell(2);

        nivå_cell.innerHTML = `Nivå ${utdanningsnivå[element]}`;

        if (menn1_float > menn2_float) {
            menn1_cell.innerHTML = `<strong>${menn1_float}%</strong>`;
            menn2_cell.innerHTML = `${menn2_float}%`;
            menn1_liste.push(menn1_float);
        }

        if (menn2_float > menn1_float) {
            menn1_cell.innerHTML = `${menn1_float}%`;
            menn2_cell.innerHTML = `<strong>${menn2_float}%</strong>`;
            menn2_liste.push(menn2_float);
        }

        if (menn1_float == menn2_float) {
            menn1_cell.innerHTML = `${menn1_float}%`;
            menn2_cell.innerHTML = `${menn2_float}%`;
        }
    }

    /* ---- MEN WINNER ---- */

    mennVinner = document.getElementById("menn_vinner");

    if (menn1_liste.length > menn2_liste.length) {
        mennVinner.innerHTML = `<em>${kommunenavn1} har høyest andel utdannede menn.</em>`;
    }

    if (menn2_liste.length > menn1_liste.length) {
        mennVinner.innerHTML = `<em>${kommunenavn2} har høyest andel utdannede menn.</em>`;
    }

    if (menn1_liste.length == menn2_liste.length) {
        mennVinner.innerHTML = `<em>${kommunenavn1} og ${kommunenavn2} har lik andel utdannede menn.</em>`;
    }


    /* ---- WOMEN TABLE ---- */

    document.getElementById(
        "kom1_kvinner_header"
    ).textContent = `${kommunenavn1} - ${komNummer_1}`;
    document.getElementById(
        "kom2_kvinner_header"
    ).textContent = `${kommunenavn2} - ${komNummer_2}`;

    for (var element in utdanningsnivå) {
        var table = document.getElementById("sammenlikning_table_kvinner_body");

        var kvinner1 = alt_1[utdanningsnivå[element]].Kvinner[2017];
        var kvinner2 = alt_2[utdanningsnivå[element]].Kvinner[2017];

        var kvinner1_float = parseFloat(kvinner1);
        var kvinner2_float = parseFloat(kvinner2);

        var row = table.insertRow(-1);
        var nivå_cell = row.insertCell(0);
        var kvinner1_cell = row.insertCell(1);
        var kvinner2_cell = row.insertCell(2);

        nivå_cell.innerHTML = `Nivå ${utdanningsnivå[element]}`;

        if (kvinner1_float > kvinner2_float) {
            kvinner1_cell.innerHTML = `<strong>${kvinner1_float}%</strong>`;
            kvinner2_cell.innerHTML = `${kvinner2_float}%`;
            kvinner1_liste.push(kvinner1_float);
        }

        if (kvinner2_float > kvinner1_float) {
            kvinner1_cell.innerHTML = `${kvinner1_float}%`;
            kvinner2_cell.innerHTML = `<strong>${kvinner2_float}%</strong>`;
            kvinner2_liste.push(kvinner2_float);
        }

        if (kvinner1_float == kvinner2_float) {
            kvinner1_cell.innerHTML = `${kvinner1_float}%`;
            kvinner2_cell.innerHTML = `${kvinner2_float}%`;
        }
    }

    /* ---- WOMEN WINNER ---- */

    kvinnerVinner = document.getElementById("kvinner_vinner");

    if (kvinner1_liste.length > kvinner2_liste.length) {
        kvinnerVinner.innerHTML = `<em>${kommunenavn1} har høyest andel utdannede kvinner.</em>`;
    }

    if (kvinner1_liste.length < kvinner2_liste.length) {
        kvinnerVinner.innerHTML = `<em>${kommunenavn2} har høyest andel utdannede kvinner.</em>`;
    }

    if (kvinner1_liste.length == kvinner2_liste.length) {
        kvinnerVinner.innerHTML = `<em>${kommunenavn1} og ${kommunenavn2} har lik andel utdannede kvinner.</em>`;
    }

    /* ---- KOMMUNE WINNER ---- */

    var kom1 = menn1_liste.concat(kvinner1_liste);
    var kom2 = menn2_liste.concat(kvinner2_liste);
    var kommuneVinner = document.getElementById("kommune_vinner");

    if (kom1.length > kom2.length) {
        kommuneVinner.innerHTML = `<strong> ${kommunenavn1} kommune har høyest andel utdannede i flest utdanningskategorier.</strong>`;
    }

    if (kom2.length > kom1.length) {
        kommuneVinner.innerHTML = `<strong> ${kommunenavn2} kommune har høyest andel utdannede i flest utdanningskategorier.</strong>`;
    }

    if (kom1.length == kom2.length) {
        kommuneVinner.innerHTML = `<strong> ${kommunenavn1} og ${kommunenavn2} har lik andel utdannede i alle utdanningskategorier.</strong>`;
    }
}