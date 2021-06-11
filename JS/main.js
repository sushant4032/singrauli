

var tem = document.querySelector('#tcard');
var cont = document.querySelector('.cont');
var fdate = document.querySelector('.date');
var gdata = "";
var today = new Date();
var date = today;
date.setDate(date.getDate() + 1);
console.log(date);


var filters = {
    covonly: false,
    coxonly: false,
    plus18: false,
    plus45: false
}

Object.keys(filters).forEach(x => {
    var btn = document.querySelector("." + x);
    btn.addEventListener('click', e => {
        var k = e.target.attributes[1].value;
        // console.log(k);
        applyFilter(k);
    })
})


function applyFilter(f) {
    if (f == 'plus18') {
        filters.plus18 = !filters.plus18;
        filters.plus45 = false;
    }
    else if (f == 'plus45') {
        filters.plus45 = !filters.plus45;
        filters.plus18 = false;
    }
    else if (f == 'covonly') {
        filters.covonly = !filters.covonly;
        filters.coxonly = false;
    }
    else if (f == 'coxonly') {
        filters.coxonly = !filters.coxonly;
        filters.covonly = false;
    }
    Object.keys(filters).forEach(x => {
        var btn = document.querySelector("." + x);
        if (filters[x]) {
            btn.classList.add('set');
        }
        else {
            btn.classList.remove('set');
        }
    })
    refresh();
}

update();
getData();

// date.setDate(date.getDate() - 5);

document.querySelector('.prev').addEventListener('click', e => {
    date.setDate(date.getDate() - 1);
    getData();
})

document.querySelector('.next').addEventListener('click', e => {
    date.setDate(date.getDate() + 1);
    getData();
})


function getData() {
    nodata('FETCHING DATA...');
    var d = date.getDate().toString().padStart(2, 0);
    var m = (date.getMonth() + 1).toString().padStart(2, 0);
    var y = date.getFullYear();
    // fdate.value = `${y}-${m}-${d}`;
    var ds = `${d}-${m}-${y}`;
    fdate.innerText = ds;
    var str = 'https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByDistrict?district_id=330&date=' + ds;
    console.log(str);
    fetch(str)
        .then(response => response.json())
        .then(data => {
            gdata = data;
            refresh();
        });
}


function refresh() {

    cont.innerHTML = "";
    var data = gdata;
    var d = data.sessions;
    if (filters.plus18) {
        var t = d.filter(x => {
            return x.min_age_limit == 18;
        })
        d = t;
    }
    if (filters.plus45) {
        var t = d.filter(x => {
            return x.min_age_limit == 45;
        })
        d = t;
    }
    if (filters.covonly) {
        var t = d.filter(x => {
            return x.vaccine == 'COVISHIELD';
        })
        d = t;
    }
    if (filters.coxonly) {
        var t = d.filter(x => {
            return x.vaccine == 'COVAXIN';
        })
        d = t;
    }
    var t = d.sort(function (a, b) {
        return b.available_capacity - a.available_capacity;
    });
    d = t;
    display(d);

}

function display(d) {


    if (d.length > 0) {
        d.forEach(e => {
            var clone = tem.content.cloneNode(true);

            clone.querySelector('.name').innerText = e.address;
            clone.querySelector('.add').innerText = e.block_name + ", " + e.district_name + ", " + e.pincode;
            clone.querySelector('.type').innerText = e.vaccine;
            clone.querySelector('.age').innerText = "age " + e.min_age_limit + "+";
            var card = clone.querySelector('.card');
            card.classList.add('card-plus' + e.min_age_limit);
            card.classList.add("card-" + e.vaccine);

            var first = clone.querySelector('.first');
            first.innerText = e.available_capacity_dose1;
            if (e.available_capacity_dose1 > 0) {
                first.classList.add('avl');
            }
            var sec = clone.querySelector('.second');
            first.innerText = e.available_capacity_dose1;
            if (e.available_capacity_dose2 > 0) {
                sec.classList.add('avl');
            }

            clone.querySelector('.second').innerText = e.available_capacity_dose2;

            if (e.available_capacity > 0) {
                clone.querySelector('.card').classList.add('green');
            }

            var k = cont.appendChild(clone);
        })
        showdata();
    }
    else {


        if (filters.covonly || filters.coxonly || filters.plus18 || filters.plus45) {
            nodata("NOT AVAILABLE!");
        }
        else if (date.getTime() < new Date().getTime()) {
            nodata("DATA REMOVED !");
        }
        else {
            nodata("DATA NOT RELEASED YET !");
        }
    }

    // visitCount();
}


function showdata() {
    var nodata = document.querySelector('.nodata');
    var data = document.querySelector('.data');
    nodata.classList.add('hidden');
    data.classList.remove('hidden');
}

function nodata(text) {
    var nodata = document.querySelector('.nodata');
    var data = document.querySelector('.data');
    data.classList.add('hidden');
    nodata.classList.remove('hidden');
    nodata.querySelector('p').innerText = text;
}

function update() {
    var diff = Math.floor((new Date().getTime() - localStorage.getItem('lastUpdate')) / (24 * 3600 * 1000));
    console.log(diff);
    var k = window.location;

    if (diff > 1) {

    }
}

function visitCount() {
    fetch('https://www.sushanttiwari.in/dch/serv/log_visit.php',{method:'cors'}).then(
        resonse => {
            console.log(response);
        }
    )
}

document.querySelector('.contact-me').addEventListener('click', () => {
    document.querySelector('.contact-form').classList.toggle('hidden');
})